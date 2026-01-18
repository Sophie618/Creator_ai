import os
import re
import json
import requests
import trafilatura
from typing import List, Optional, Tuple
from urllib.parse import urlparse
from datetime import datetime
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

import sqlite3
from contextlib import contextmanager

# 加载环境变量
load_dotenv()

# SQLite 数据库初始化 - 支持 ModelScope 持久化目录
PERSISTENT_PATH = "/mnt/workspace"
if os.path.exists(PERSISTENT_PATH):
    DB_PATH = os.path.join(PERSISTENT_PATH, "collector.db")
else:
    DB_PATH = "collector.db"

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS articles (
                id TEXT PRIMARY KEY,
                title TEXT,
                url TEXT UNIQUE,
                cover_image TEXT,
                source TEXT,
                word_count INTEGER,
                estimated_time INTEGER,
                status TEXT,
                created_at TEXT,
                content TEXT,
                cleaned_content TEXT,
                quiz_json TEXT
            )
        """)
        # 尝试添加列（如果表已存在）
        try:
            conn.execute("ALTER TABLE articles ADD COLUMN cleaned_content TEXT")
        except sqlite3.OperationalError:
            pass 
        try:
            conn.execute("ALTER TABLE articles ADD COLUMN quiz_json TEXT")
        except sqlite3.OperationalError:
            pass
init_db()

@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

app = FastAPI()

# 配置 CORS (跨域资源共享)
# 允许 React 前端 (通常在 localhost:3000) 访问此后端 API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中建议替换为具体的 ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],  # 允许 GET, POST, OPTIONS 等所有方法
    allow_headers=["*"],
)

class QuizRequest(BaseModel):
    url: str

class SingleQuiz(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    evidence: str
    jump_url: str
    source_title: Optional[str] = None
    source_logo: Optional[str] = None
    source_cover: Optional[str] = None

class QuizListResponse(BaseModel):
    items: List[SingleQuiz]
    article_id: Optional[str] = None

class CollectedArticle(BaseModel):
    id: str
    title: str
    url: str
    cover_image: Optional[str] = None
    source: str
    word_count: int
    estimated_time: int
    status: str
    created_at: str
    content: Optional[str] = None
    cleaned_content: Optional[str] = None
    quiz_json: Optional[str] = None

class ArticleListResponse(BaseModel):
    articles: List[CollectedArticle]

@app.get("/proxy-image")
def proxy_image(url: str):
    """
    Proxy endpoint to fetch images with CORS headers enabled for frontend canvas manipulation.
    """
    try:
        # User-Agent header is often required by servers to return the image
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        
        # Determine media type
        content_type = resp.headers.get("Content-Type", "image/jpeg")
        
        # Return content directly
        return Response(content=resp.content, media_type=content_type)
    except Exception as e:
        print(f"Proxy error for {url}: {e}")
        # Return a 404 or generic error image if needed, for now 404
        raise HTTPException(status_code=404, detail="Image not found or blocked")

@app.get("/api/health")
def read_root():
    return {"message": "Hello AGI"}

def extract_bvid(url: str) -> Optional[str]:
    """从 URL 中提取 B 站视频 ID (BV号)"""
    bv_regex = r"BV[a-zA-Z0-9]{10}"
    match = re.search(bv_regex, url)
    return match.group(0) if match else None

def fetch_bilibili_subtitles(bvid: str) -> Tuple[str, str, Optional[str], str]:
    """获取 B 站视频标题、完整字幕文本、封面图和作者 (对齐 FitSnap 高级逻辑 - 修正 SESSDATA)"""
    # 移除 Referer 以完全匹配 FitSnap 的 Header 策略
    # 确保 SESSDATA 没有多余空格
    sessdata = os.getenv("BILIBILI_SESSDATA", "").strip()
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
    }
    if sessdata:
        headers["Cookie"] = f"SESSDATA={sessdata}"
    
    try:
        # 1. 获取视频基本信息
        view_url = f"https://api.bilibili.com/x/web-interface/view?bvid={bvid}"
        resp = requests.get(view_url, headers=headers, timeout=10)
        view_data = resp.json()
        
        if view_data.get("code") != 0:
             # 有时 View 接口也需要 Referer? 如果失败再打印
            print(f"[Bilibili] View API Failed: {view_data}")
            return f"获取视频信息失败: {view_data.get('message')}", "Bilibili 视频", None, "Bilibili"
        
        data = view_data.get("data") or {}
        title = data.get("title", "未命名视频")
        desc = data.get("desc", "")
        # B站图片有时是 http，强制转 https
        pic = data.get("pic", "").replace("http:", "https:")
        aid = data.get("aid")
        cid = data.get("cid")
        author = data.get("owner", {}).get("name", "Bilibili UP主")
        
        # 2. 获取字幕列表
        subtitles = []
        
        # 路径 A: 请求 Player V2 接口 (完全对齐 FitSnap)
        player_url = f"https://api.bilibili.com/x/player/v2?aid={aid}&cid={cid}&bvid={bvid}"
        p_resp = requests.get(player_url, headers=headers, timeout=10)
        p_json = p_resp.json()
        p_data = p_json.get("data", {})
        p_subtitle_obj = p_data.get("subtitle", {})
        
        # 3.1 提取字幕策略 (对齐 FitSnap: subtitles -> ai_subtitle -> view.subtitle)
        subtitles = p_subtitle_obj.get("subtitles", []) or []
        
        if not subtitles:
            # 兼容 Python 处理逻辑：如果是 dict 放入 list
            ai_subs = p_subtitle_obj.get("ai_subtitle")
            if ai_subs:
                if isinstance(ai_subs, list):
                    subtitles = ai_subs
                else:
                    subtitles = [ai_subs]
            # 如果 AI 字幕也没有，检查 View Data
            elif data.get("subtitle", {}).get("list"):
                subtitles = data.get("subtitle", {}).get("list", [])
        
        # 3.2 双重检查 View Data (FitSnap 逻辑)
        if not subtitles and data.get("subtitle", {}).get("list"):
             subtitles = data.get("subtitle", {}).get("list", [])

        print(f"[Bilibili] Found {len(subtitles)} subtitle tracks for {bvid}")
        
        # 调试：如果有字幕，打印一下第一条的语言，确认解析正确
        if subtitles:
             print(f"[Bilibili] First track language: {subtitles[0].get('lan')} (is_ai: {subtitles[0].get('is_ai')})")

        # 3. 选择最佳音轨 (优先中文, 非 AI)
        subtitle_url = None
        if subtitles:
            # FitSnap 逻辑：找 zh-CN 且非 AI，或者 zh-Hans 且非 AI，否则第一个
            best_track = None
            
            # 尝试 1: zh-CN & !is_ai
            for s in subtitles:
                if s.get("lan") == "zh-CN" and not s.get("is_ai", False):
                    best_track = s; break
            
            # 尝试 2: zh-Hans & !is_ai
            if not best_track:
                for s in subtitles:
                    if s.get("lan") == "zh-Hans" and not s.get("is_ai", False):
                        best_track = s; break
                        
            # 尝试 3: 任何中文
            if not best_track: 
                 for s in subtitles:
                    if "zh" in s.get("lan", ""):
                        best_track = s; break
            
            # 尝试 4: 默认第一个
            if not best_track:
                best_track = subtitles[0]
                
            subtitle_url = best_track.get("subtitle_url") or best_track.get("url")

        # 4. 如果有字幕，下载并解析
        if subtitle_url:
            if subtitle_url.startswith("//"):
                subtitle_url = f"https:{subtitle_url}"
                
            sub_resp = requests.get(subtitle_url, headers=headers, timeout=10)
            sub_content = sub_resp.json()
            body = sub_content.get("body", []) if isinstance(sub_content, dict) else sub_content
            
            if body:
                full_text = "".join([item.get("content", "") for item in body])
                if len(full_text) > 20: 
                    print(f"[Bilibili] Successfully extracted {len(full_text)} chars from {bvid}")
                    return full_text, title, pic, author

        # 5. 兜底策略
        print(f"[Bilibili] No valid subtitles found for {bvid}, using description fallback.")
        tags_text = ""
        try:
            tags_url = f"https://api.bilibili.com/x/tag/archive/tags?bvid={bvid}"
            t_resp = requests.get(tags_url, headers=headers, timeout=5)
            tags_data = t_resp.json().get("data", [])
            if tags_data:
                tags_text = "视频标签: " + ", ".join([t.get("tag_name", "") for t in tags_data])
        except: pass

        combined_context = f"视频标题: {title}\n视频简介: {desc}\n{tags_text}"
        return f"[由于接口限制未能提取字幕，基于简介生成]\n\n{combined_context}", title, pic, author

        
    except Exception as e:
        print(f"[Bilibili] Error: {e}")
        if isinstance(e, HTTPException): raise e
        return f"解析失败: {str(e)}", "Bilibili 视频", None, "Bilibili"

def clean_url(url: str) -> str:
    """Clean the URL to remove unwanted parameters and fix encoding issues."""
    try:
        # Decode HTML entities (like &amp; -> &)
        import html
        url = html.unescape(url)
        # Strip whitespace
        url = url.strip()
        return url
    except Exception:
        return url

def fetch_via_jina_proxy(url: str) -> Tuple[Optional[str], Optional[str], Optional[str], Optional[str]]:
    """使用 Jina.ai Reader API 作为强力代理，绕过服务器 IP 封锁"""
    try:
        url = clean_url(url)
        print(f"[Jina] Attempting proxy fetch for: {url}")
        # Jina 会帮我们渲染并转为 Markdown，几乎能绕过所有静态反爬
        # 必须确保 URL 是 cleanly encoded 的
        jina_url = f"https://r.jina.ai/{url}"
        
        # Jina 有时需要一些时间渲染，设置较长超时
        resp = requests.get(jina_url, timeout=30)
        
        if resp.status_code != 200:
            print(f"[Jina] Failed with status {resp.status_code}")
            return None, None, None, None
            
        text = resp.text
        # Jina 有时会返回 Access Denied 页面
        if not text or len(text) < 100 or "Access Denied" in text or "Cloudflare" in text:
            print(f"[Jina] Returned invalid content: {text[:100]}...")
            return None, None, None, None
            
        print(f"[Jina] Success. Length: {len(text)}")
        # 解析 Jina 返回的 Markdown
        lines = text.splitlines()
        title = "微信文章 (Proxy)"
        
        # Jina 通常把标题作为第一行 # Title
        if lines and lines[0].startswith("# "):
            title = lines[0][2:].strip()
            
        # 尝试提取第一张图片作为封面
        cover_image = None
        # 正则匹配 Markdown 图片 ![...](url)
        img_match = re.search(r'!\[.*?\]\((https?://.*?)\)', text)
        if img_match:
            cover_image = img_match.group(1)
            
        return text, title, cover_image, "WeChat/Jina"
        
    except Exception as e:
        print(f"[Jina] Proxy error: {e}")
        return None, None, None, None

def fetch_article_content(url: str) -> Tuple[str, str, Optional[str], Optional[str]]:
    """抓取文章内容、标题、封面图和作者"""
    url = clean_url(url)
    
    # 0. 优先处理 Bilibili 链接
    bvid = extract_bvid(url)
    if bvid:
        return fetch_bilibili_subtitles(bvid)

    # 0.5 针对微信公众号的绝杀策略：使用 Jina 代理
    # 因为 ModelScope 的 IDC IP 几乎必定被微信封锁，直接请求成功率极低
    # 使用 Jina 服务代为抓取是目前最稳妥的方案
    if "weixin" in url:
        j_content, j_title, j_cover, j_author = fetch_via_jina_proxy(url)
        if j_content:
            print("[Fetch] Specifically used Jina Proxy for WeChat success.")
            return j_content, j_title, j_cover, j_author

    # 1. 使用 requests 获取网页源码 (更好地模拟浏览器，通过 headers 发送 User-Agent)
    # 切换回标准的 Windows Chrome 头部，这是最通用的指纹，在服务器环境下比 Mobile/Mac 兼容性更好
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "max-age=0",
        "Connection": "keep-alive",
        "Referer": "https://mp.weixin.qq.com/",
        "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1"
    }
    try:
        # 使用 verify=True (默认)，但如果有 SSL 错误再重试 verify=False
        try:
            resp = requests.get(url, headers=headers, timeout=20)
        except requests.exceptions.SSLError:
            print("[Fetch] SSL Error, retrying with verify=False")
            resp = requests.get(url, headers=headers, timeout=20, verify=False)
            
        resp.raise_for_status()
        
        # 智能编码检测：微信有时不会返回正确的 charset
        if resp.encoding == 'ISO-8859-1' or not resp.encoding:
            resp.encoding = resp.apparent_encoding
            
        downloaded = resp.text
        
        # 记录日志方便线上排查
        print(f"[Fetch] URL: {url}, Status: {resp.status_code}, Encoding: {resp.encoding}, Length: {len(downloaded)}")
        
        # 增加对 WAF 页面的检测 (标题或特定的 weui 类)
        if "<title>验证</title>" in downloaded or "weui-msg" in downloaded:
             print("[Fetch] Detected WeChat WAF/Captcha page.")
             # 这里不抛出异常，而是让后续的 trafilatura 尝试一下（虽然机会渺茫），或者在解析阶段处理
             
    except Exception as e:
        print(f"Requests fetch failed, falling back to trafilatura fetch: {e}")
        downloaded = trafilatura.fetch_url(url)
    
    if downloaded is None:
        raise HTTPException(status_code=400, detail="Failed to fetch URL")

    # 简单的反爬虫检测
    if "环境异常" in downloaded or "访问过于频繁" in downloaded:
         raise HTTPException(status_code=403, detail="WeChat anti-scraping triggered (Environment Abnormal)")

    # 使用 bare_extraction 提取文本和元数据 (title, author, image)
    # 这会输出纯文本格式，保留段落结构，符合要求
    try:
        result = trafilatura.bare_extraction(downloaded)
    except Exception:
        result = None
    
    content = None
    title = ""
    author = ""
    cover_image = None
    
    # Handle both dict (older versions) and Document object (newer versions)
    if result:
        if isinstance(result, dict):
            content = result.get('text')
            title = result.get('title', '')
            author = result.get('author', '')
            cover_image = result.get('image')
        else:
            content = getattr(result, 'text', None)
            title = getattr(result, 'title', '')
            author = getattr(result, 'author', '')
            cover_image = getattr(result, 'image', None)

    # 针对微信公众号的强力提取 (优先策略)
    # 本地测试发现 trafilatura 提取微信文章内容不全，因此对微信文章默认启用 BS4 解析
    if "weixin" in url:
        print("Using BS4 specific extraction for WeChat (Priority)")
        try:
            soup_wx = BeautifulSoup(downloaded, "html.parser")
            content_div = soup_wx.select_one("#js_content")
            if content_div:
                # 移除其中可能不可见的脚本样式
                for s in content_div(["script", "style"]):
                    s.decompose()
                
                # 优化段落提取：微信段落通常在 p 标签里
                # 直接 get_text 会把所有文字挤在一起。尝试遍历 p 标签构建内容。
                paragraphs = []
                for p in content_div.find_all(['p', 'section']):
                     text = p.get_text(strip=True)
                     if text:
                         paragraphs.append(text)
                
                # 如果分段提取成功且内容足够，使用分段结果；否则回退到 get_text
                if len(paragraphs) > 5:
                    content = "\n\n".join(paragraphs)
                else:
                    content = content_div.get_text(separator="\n\n", strip=True)
            
            # 同时尝试修补标题和作者
            if not title:
                t = soup_wx.select_one("#activity-name")
                if t: title = t.get_text(strip=True)
            if not author:
                a = soup_wx.select_one("#js_name")
                if a: author = a.get_text(strip=True)
        except Exception as e:
            print(f"BS4 WeChat extraction failed: {e}")

    # Fallback to general extraction if content is still empty
    if not content:
        content = trafilatura.extract(downloaded)

    # 针对微信公众号的强力提取 (当 trafilatura 失败时的二次兜底 - 已合并到上方优先策略，此处仅做普通兜底)
    if not content:
         raise HTTPException(status_code=400, detail="Could not extract text content using any method")

    # 增强封面图和标题提取：
    # 针对微信公众号等特定平台，trafilatura 有时无法获取正确的标题或懒加载图片
    if not cover_image or not title or title == "未命名文章" or "weixin" in url:
        try:
            soup = BeautifulSoup(downloaded, "html.parser")
            
            # 1. 标题增强提取 (针对微信公众号优化)
            if not title or title == "未命名文章" or "weixin" in url:
                wx_title = soup.find(id="activity-name")
                if wx_title:
                    title = wx_title.get_text(strip=True)
                
                if not title or title == "未命名文章":
                    og_title = soup.find("meta", property="og:title")
                    if og_title and og_title.get("content"):
                        title = og_title.get("content").strip()
                    elif soup.title and soup.title.string:
                        title = soup.title.string.strip()
            
            # 2. 封面图增强提取
            if not cover_image or "weixin" in url:
                 og_image = soup.find("meta", property="og:image")
                 if og_image and og_image.get("content"):
                     cover_image = og_image.get("content").strip()
                 
                 if not cover_image:
                     all_imgs = soup.find_all("img")
                     for img in all_imgs:
                         src = img.get("data-src") or img.get("src") or ""
                         if "0?wx_fmt=" in src or "wx_fmt=" in src:
                             cover_image = src
                             break
        except Exception as e:
            print(f"Secondary extraction failed: {e}")

    # 最后保底
    if not title:
        title = "未命名文章"

    return content, title, cover_image, author

def generate_quiz_from_text(text: str) -> dict:
    api_key = os.getenv("MINIMAX_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="MINIMAX_API_KEY not found in environment variables")

    client = OpenAI(
        api_key=api_key,
        base_url="https://api.minimax.chat/v1"
    )

    system_prompt = """你是一个专业的认知科学家和长文排版专家。你的任务是提取输入内容的核心认知价值，并将其转化为深度阅读体验。

### 第一阶段：内容深度重构 (Content Reconstruction)
1. **识别特征**：判断输入是结构化文章、碎片化视频脚本还是简介。
2. **语义重组**：如果是视频字幕/转录稿或视频简介（通常缺乏标点符号、口语化严重），必须通过 AGI 能力将其转换为“书面深度报道”风格。
   - 补齐所有标点符号。
   - 移除口头禅、重复叙述。
   - 逻辑归类：将发散的碎碎念整合为严谨的段落。
3. **排版约束**：
   - 使用 `\n\n` 明确分段，每段 200-400 字。
   - 严禁包含“编辑、来源、关注点赞”等噪音。
   - 确保首段直接进入核心论点，以支撑“首字放大”排版。

### 第二阶段：预测市场问题设计 (Prediction Market Question Engineering)
1. **提取核心**：必须找到并输出 **3个** 有明显区别、反直觉、有争议或颠覆性的观点或数据。即使内容较短，也要从逻辑推导或核心主张中挖掘出 3 个问题。
2. **外部视角重构**：设想读者完全没读过原文，问题必须自洽：
   - 严禁代词：禁止出现“作者、文章里、他、这个数据”等模糊指代，必须改为具体称呼或专有名词。
   - 二元极性：问句必须是强冲突的，能够引诱用户进行“对赌”思考。
   - 平滑自然：转变“你认为”之后的问句组织形式，使得问句通顺且有二元性。
3. **证据提取**：摘录必须与原文一字不差（可以微调标点以符合语境，但核心语义必须一致），作为对赌判定的真实依据。

### 第三阶段：输出约束
- **格式**：严禁 Markdown 代码块，必须是纯 JSON，选项固定为 ["是", "否"]。
- **数量**：必须不多不少返回 3 个问题。
- **换行处理**：在 JSON 字符串内，换行符请直接使用 `\n\n`。请确保生成的 JSON 即使包含这些换行符也是有效的转义字符串。

Output JSON 示例:
{
  "questions": [
    {
      "question": "你认为...?", 
      "options": ["是", "否"],
      "correct_answer": "是",
      "evidence": "原文句子..."
    },
    {
      "question": "你认为...?", 
      "options": ["是", "否"],
      "correct_answer": "是",
      "evidence": "原文句子..."
    },
    {
      "question": "你认为...?", 
      "options": ["是", "否"],
      "correct_answer": "是",
      "evidence": "原文句子..."
    }
  ],
  "cleaned_content": "重构后的正文第一段...\\n\\n第二段..."
}"""

    try:
        completion = client.chat.completions.create(
            model="abab6.5s-chat",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"输入内容（可能是文章或视频字幕）如下：\n\n{text}"}
            ],
            temperature=0.1,
            max_tokens=3500
        )
        
        content = completion.choices[0].message.content
        
        # 提取 JSON 部分
        json_text = ""
        # 尝试匹配第一个 { 到最后一个 } 之间的内容
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            json_text = json_match.group(0)
        else:
            # 备选方案：清理 Markdown 标记
            json_text = content.replace("```json", "").replace("```", "").strip()
        
        try:
            # 1. 尝试标准解析
            return json.loads(json_text)
        except json.JSONDecodeError:
            try:
                # 2. 尝试容错解析 (处理原始换行符)
                return json.loads(json_text, strict=False)
            except json.JSONDecodeError as e:
                # 3. 最后的挣扎：清理掉可能导致 JSON 失效的非法控制字符，但保留 \n
                print(f"JSON Parsing failed, attempting final cleanup: {e}")
                # 保护一下真正的换行符，临时替换
                temp_text = json_text.replace("\\n", "[[NEWLINE]]").replace("\n", "[[NEWLINE]]")
                # 移除其他控制字符
                temp_text = "".join(char for char in temp_text if ord(char) >= 32 or char in "\n\r\t")
                # 还原换行符为 JSON 兼容的转义符
                final_text = temp_text.replace("[[NEWLINE]]", "\\n")
                
                try:
                    return json.loads(final_text, strict=False)
                except Exception as final_e:
                    print(f"All JSON parsing attempts failed: {final_e}")
                    print(f"Raw content: {content[:500]}...")
                    raise ValueError(f"Invalid JSON response: {final_e}")

    except Exception as e:
        print(f"Error in generating quiz: {e}")
        raise HTTPException(status_code=500, detail=f"LLM generation failed: {str(e)}")

def generate_rant_from_text(text: str) -> str:
    """
    使用 Minimax 生成极具传播力的‘暴论式标题’
    """
    if not text:
        return "AI生成的暴论失败了..."

    api_key = os.getenv("MINIMAX_API_KEY")
    if not api_key:
        return "未配置 Minimax API Key"
        
    client = OpenAI(
        api_key=api_key,
        base_url="https://api.minimax.chat/v1"
    )
    
    system_prompt = """你是一位顶级自媒体爆款标题专家。你的任务是：基于用户提供的文本内容，生成一个极具传播力的‘暴论式标题’。要求：1）标题必须反常识、情绪强烈、使用绝对化语言（如‘所有’‘根本’‘早就’‘别再’等）；2）字数严格控制在8–15个汉字；3）只输出标题本身，不要任何解释、标点（除必要顿号/问号外）、前缀或后缀；4）标题必须根植于用户提供的文本事实，不可凭空捏造。"""

    try:
        completion = client.chat.completions.create(
            model="abab6.5s-chat",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"【原文内容】\n{text[:6000]}"} # Limit context to save tokens
            ],
            temperature=0.7, # Higher temperature for creativity
            max_tokens=50
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"Rant generation failed: {e}")
        return "AI 陷入了沉思..."

@app.post("/api/generate-rant")
def generate_rant_endpoint(request: QuizRequest):
    # Reuse QuizRequest since it has 'url'. Or create a new model if we want to pass text directly?
    # Passing URL is safer for bandwidth, backend fetches content.
    
    # 1. Fetch content
    full_content, _, _, _ = fetch_article_content(request.url)
    
    # 2. Generate Rant
    rant = generate_rant_from_text(full_content)
    
    return {"rant": rant}

@app.post("/api/generate-quiz", response_model=QuizListResponse)
def generate_quiz_endpoint(request: QuizRequest):
    # 1. 抓取文章内容、标题、封面图和作者
    full_content, page_title, cover_image, author = fetch_article_content(request.url)
    
    # 2. 截取前 12000 字符 (B站字幕通常较长，放宽一点限制)
    truncated_content = full_content[:12000]
    word_count = len(full_content)
    estimated_time = max(1, word_count // 400)  # 假设每分钟阅读400字
    
    # 3. 调用 LLM 生成竞猜和清洗内容
    quiz_data = generate_quiz_from_text(truncated_content)
    
    # 4. 获取清洗后的内容，如果 LLM 没返回则回退到 full_content
    cleaned_content = quiz_data.get("cleaned_content", full_content)
    
    # 4. 组装最终返回
    raw_questions = quiz_data.get("questions", [])
    
    items = []

    # 域名用于 Logo 和来源识别
    parsed = urlparse(request.url)
    domain = (parsed.hostname or "").lower()
    source_logo = None
    source_name = "未知来源"
    
    if "bilibili" in domain or extract_bvid(request.url):
        source_logo = "/bilibili.png"
        source_name = "哔哩哔哩"
    elif "weixin" in domain or "wechat" in domain:
        source_logo = "/wechat-article.png"
        source_name = "公众号"
    elif "xiaohongshu" in domain or "xhs" in domain:
        source_name = "小红书"
    
    for q in raw_questions:
        items.append(SingleQuiz(
            question=q.get("question", "生成失败"),
            options=q.get("options", ["是", "否"]),
            correct_answer=q.get("correct_answer", "是"),
            evidence=q.get("evidence", ""),
            jump_url=request.url,
            source_title=page_title,
            source_logo=source_logo,
            source_cover=cover_image
        ))
    
    # 5. 保存文章到收录列表（持久化到 SQLite）
    article_id = None
    quiz_json_str = json.dumps(raw_questions, ensure_ascii=False)
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM articles WHERE url = ?", (request.url,))
        existing = cursor.fetchone()
        
        if not existing:
            import uuid
            article_id = f"art_{uuid.uuid4().hex[:8]}"
            cursor.execute("""
                INSERT INTO articles 
                (id, title, url, cover_image, source, word_count, estimated_time, status, created_at, content, cleaned_content, quiz_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                article_id,
                page_title or "未命名文章",
                request.url,
                cover_image,
                source_name,
                word_count,
                estimated_time,
                "quiz_generated",
                datetime.now().isoformat(),
                full_content,
                cleaned_content,
                quiz_json_str
            ))
            conn.commit()
        else:
            article_id = existing["id"]
            # 即使已经存在，也更新一下清洗后的内容、标题和题目
            cursor.execute("""
                UPDATE articles 
                SET title = ?, content = ?, cleaned_content = ?, quiz_json = ?, status = 'quiz_generated'
                WHERE id = ?
            """, (page_title or "未命名文章", full_content, cleaned_content, quiz_json_str, article_id))
            conn.commit()
        
    return QuizListResponse(items=items, article_id=article_id)

@app.get("/api/collected-articles", response_model=ArticleListResponse)
def get_collected_articles():
    """获取所有已收录的文章列表"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM articles ORDER BY created_at DESC")
        rows = cursor.fetchall()
        articles = [CollectedArticle(**dict(row)) for row in rows]
    return ArticleListResponse(articles=articles)

@app.get("/api/article/url", response_model=CollectedArticle)
def get_article_by_url(url: str):
    """根据 URL 获取文章详情"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM articles WHERE url = ?", (url,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Article not found")
        return CollectedArticle(**dict(row))

@app.get("/api/article/{article_id}", response_model=CollectedArticle)
def get_single_article(article_id: str):
    """获取单篇文章详情"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM articles WHERE id = ?", (article_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Article not found")
        return CollectedArticle(**dict(row))

@app.delete("/api/article/{article_id}")
def delete_article(article_id: str):
    """从数据库中删除指定文章"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM articles WHERE id = ?", (article_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Article not found")
        conn.commit()
    return {"status": "success", "message": "Article deleted"}

# 挂载前端静态文件 (用于部署)
# 只有当 dist 目录存在时才挂载，确保本地开发时不会报错
frontend_dist = os.path.join(os.path.dirname(__file__), "../frontend/dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
    
    # 捕获所有 404 并返回 index.html (React Router 支持)
    @app.exception_handler(404)
    async def custom_404_handler(request, __):
        if not request.url.path.startswith("/api") and not request.url.path.startswith("/proxy-image"):
            try:
                with open(os.path.join(frontend_dist, "index.html"), "r", encoding="utf-8") as f:
                    return Response(content=f.read(), media_type="text/html")
            except Exception:
                pass
        return Response(content="Not Found", status_code=404)

