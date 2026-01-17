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

# 加载环境变量
load_dotenv()

# 内存存储已收录文章（后续可替换为数据库）
collected_articles = []

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
    # 使用 trafilatura.fetch_url 获取网页
    downloaded = trafilatura.fetch_url(url)
    
    if downloaded is None:
        raise HTTPException(status_code=400, detail="Failed to fetch URL")

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

    # 增强封面图提取：如果你发现 trafilatura 提取的图片不准确，可以使用 BeautifulSoup 进行二次提取
    # 尤其是针对微信公众号的懒加载图片 (data-src)
    if not cover_image or "weixin" in url:
        try:
            soup = BeautifulSoup(downloaded, "html.parser")
            
            # 1. 优先尝试 og:image
            og_image = soup.find("meta", property="og:image")
            if og_image and og_image.get("content"):
                cover_image = og_image.get("content").strip()
            
            # 2. 如果 og:image 也没有，或者是微信文章，尝试找正文第一张图片
            if not cover_image:
                 all_imgs = soup.find_all("img")
                 for img in all_imgs:
                     src = img.get("data-src") or img.get("src") or ""
                     # 微信特征
                     if "0?wx_fmt=" in src or "wx_fmt=" in src:
                         cover_image = src
                         break
        except Exception as e:
            print(f"Secondary image extraction failed: {e}")

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

Output JSON 格式（不要Markdown标记，仅返回JSON字符串）:
{
  "questions": [
    {
      "question": "你认为...?",
      "options": ["是", "否"],
      "correct_answer": "是",
      "evidence": "原文句子用于UI展示"
    },
    {
      "question": "你认为...?",
      "options": ["是", "否"],
      "correct_answer": "否",
      "evidence": "原文句子"
    },
    {
      "question": "你认为...?",
      "options": ["是", "否"],
      "correct_answer": "是",
      "evidence": "原文句子"
    }
  ]
}"""

    try:
        completion = client.chat.completions.create(
            model="abab6.5s-chat",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"文章内容如下：\n\n{text}"}
            ]
        )
        
        content = completion.choices[0].message.content
        # 清理可能存在的 markdown 代码块标记
        cleaned_content = content.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned_content)
        
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
    
    # 5. 保存文章到收录列表（避免重复）
    existing = next((a for a in collected_articles if a["url"] == request.url), None)
    if not existing:
        article_id = f"article_{len(collected_articles) + 1}_{datetime.now().timestamp()}"
        collected_articles.append({
            "id": article_id,
            "title": page_title or "未命名文章",
            "url": request.url,
            "cover_image": cover_image,
            "source": source_name,
            "word_count": word_count,
            "estimated_time": estimated_time,
            "status": "quiz_generated",
            "created_at": datetime.now().isoformat()
        })
        
    return QuizListResponse(items=items)

@app.get("/api/collected-articles", response_model=ArticleListResponse)
def get_collected_articles():
    """获取所有已收录的文章列表"""
    articles = [
        CollectedArticle(**article) for article in collected_articles
    ]
    return ArticleListResponse(articles=articles)
