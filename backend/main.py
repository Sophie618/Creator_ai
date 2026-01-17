import os
import json
import requests
import trafilatura
from typing import List, Optional, Tuple
from urllib.parse import urlparse
from datetime import datetime
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

import sqlite3
from contextlib import contextmanager

# 加载环境变量
load_dotenv()

# SQLite 数据库初始化
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
                content TEXT
            )
        """)
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

@app.get("/")
def read_root():
    return {"message": "Hello AGI"}

def fetch_article_content(url: str) -> Tuple[str, str, Optional[str], Optional[str]]:
    """抓取文章内容、标题、封面图和作者"""
    
    # 1. 使用 requests 获取网页源码 (更好地模拟浏览器，通过 headers 发送 User-Agent)
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()
        downloaded = resp.text
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
    result = trafilatura.bare_extraction(downloaded)
    
    if result is None:
         raise HTTPException(status_code=400, detail="Could not parse content from the page")
    
    # Handle both dict (older versions) and Document object (newer versions)
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

    # 如果 bare_extraction 这里的 text 为空，尝试用 extract 单独提取一次作为后备
    if not content:
        content = trafilatura.extract(downloaded)

    if not content:
         raise HTTPException(status_code=400, detail="Could not extract text content")

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

    system_prompt = """你是一个擅长制造悬念、引导读者进行“直觉竞猜”的专栏编辑。
任务：
1. 阅读文章，找到 **3个** 有明显区别、反直觉、有争议或颠覆性的观点或数据。
2. 将每个观点转化为一个以“你认为”开头的封闭式二元竞猜题（Bet）。
3. 选项严格固定为 ["是", "否"]。
4. 必须从原文中摘录一段完全一致、未经修改（包括标点符号）的句子作为证据 (evidence)，用于揭示答案。

注意：
- 返回结果只能是纯 JSON 字符串，不能包含 Markdown 格式标记（如 ```json）。
- 确保 JSON 格式合法，字符串内的特殊字符（如换行符）必须转义。
- 确保所有引号成对出现。

Output JSON 格式示例:
{
  "questions": [
    {
      "question": "你认为...?",
      "options": ["是", "否"],
      "correct_answer": "是",
      "evidence": "原文句子..."
    }
  ]
}"""

    try:
        completion = client.chat.completions.create(
            model="abab6.5s-chat",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"文章内容如下：\n\n{text}"}
            ],
            temperature=0.1,
            max_tokens=2000
        )
        
        content = completion.choices[0].message.content
        # 清理可能存在的 markdown 代码块标记
        cleaned_content = content.replace("```json", "").replace("```", "").strip()
        
        try:
            return json.loads(cleaned_content)
        except json.JSONDecodeError as je:
             print(f"JSON Decode Error: {je}")
             print(f"Bad JSON Content: {cleaned_content}")
             raise ValueError(f"Invalid JSON returned from LLM: {je}")
        
    except Exception as e:
        print(f"Error in generating quiz: {e}")
        raise HTTPException(status_code=500, detail=f"LLM generation failed: {str(e)}")

@app.post("/api/generate-quiz", response_model=QuizListResponse)
def generate_quiz_endpoint(request: QuizRequest):
    # 1. 抓取文章内容、标题、封面图和作者
    full_content, page_title, cover_image, author = fetch_article_content(request.url)
    
    # 2. 截取前 6000 字符 (避免超出上下文限制)
    truncated_content = full_content[:6000]
    word_count = len(full_content)
    estimated_time = max(1, word_count // 400)  # 假设每分钟阅读400字
    
    # 3. 调用 LLM 生成竞猜
    quiz_data = generate_quiz_from_text(truncated_content)
    
    # 4. 组装最终返回
    raw_questions = quiz_data.get("questions", [])
    
    items = []

    # 域名用于 Logo 和来源识别
    parsed = urlparse(request.url)
    domain = (parsed.hostname or "").lower()
    source_logo = None
    source_name = "未知来源"
    
    if "bilibili" in domain:
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
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM articles WHERE url = ?", (request.url,))
        existing = cursor.fetchone()
        
        if not existing:
            import uuid
            article_id = f"art_{uuid.uuid4().hex[:8]}"
            cursor.execute("""
                INSERT INTO articles 
                (id, title, url, cover_image, source, word_count, estimated_time, status, created_at, content)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                full_content
            ))
            conn.commit()
        
    return QuizListResponse(items=items)

@app.get("/api/collected-articles", response_model=ArticleListResponse)
def get_collected_articles():
    """获取所有已收录的文章列表"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM articles ORDER BY created_at DESC")
        rows = cursor.fetchall()
        articles = [CollectedArticle(**dict(row)) for row in rows]
    return ArticleListResponse(articles=articles)

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
