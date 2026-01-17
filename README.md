# Collector AI

智能文章收集与测验生成工具

## 功能特性

- 📖 链接解析：输入文章链接自动抓取内容
- 🎯 AI 测验生成：基于文章内容生成反直觉问答
- 🗂️ 文章收录：自动保存已分析文章（标题、封面图、来源）
- 🎨 现代化 UI：翻牌卡片交互设计

## 技术栈

**前端**
- React + TypeScript
- Tailwind CSS
- Vite

**后端**
- FastAPI (Python)
- BeautifulSoup4 (网页爬取)
- MiniMax AI (测验生成)

## 本地开发

### 环境要求
- Python 3.11+
- Node.js 18+

### 后端启动

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Mac/Linux
# 或 venv\Scripts\activate  # Windows

pip install -r requirements.txt

# 配置环境变量
cp ../.env.example .env
# 编辑 .env 填入 MINIMAX_API_KEY

uvicorn main:app --reload
```

后端运行在 `http://127.0.0.1:8000`

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端运行在 `http://localhost:5173`

## Docker 部署

### 快速启动

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env 填入 MINIMAX_API_KEY

# 2. 构建并启动服务
docker-compose up -d

# 3. 查看日志
docker-compose logs -f

# 4. 停止服务
docker-compose down
```

访问：
- 前端：http://localhost
- 后端 API：http://localhost:8000

### 单独构建

```bash
# 构建后端
docker build -t collector-ai-backend ./backend

# 构建前端
docker build -t collector-ai-frontend ./frontend
```

## 部署到创空间

1. **准备代码**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **在创空间创建项目**
   - 选择 "Docker 部署"
   - 关联你的 GitHub 仓库
   - 配置环境变量：`MINIMAX_API_KEY`

3. **配置启动命令**
   - 使用 `docker-compose.yml` 编排服务
   - 或分别部署前后端服务

## 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `MINIMAX_API_KEY` | MiniMax AI API 密钥 | 是 |

## 注意事项

⚠️ **数据持久化**：当前文章列表存储在内存中，容器重启会丢失。生产环境建议：
- 使用数据库（SQLite/PostgreSQL）
- 或挂载 Docker 数据卷

⚠️ **CORS 配置**：部署后需在后端 `main.py` 中添加前端域名到 CORS 白名单

⚠️ **API 密钥安全**：不要将 `.env` 文件提交到 Git

## 项目结构

```
Collector_ai/
├── backend/              # FastAPI 后端
│   ├── main.py          # 主应用
│   ├── requirements.txt # Python 依赖
│   └── Dockerfile       # 后端镜像
├── frontend/            # React 前端
│   ├── App.tsx         # 主组件
│   ├── components/     # 组件目录
│   ├── views/          # 页面视图
│   ├── Dockerfile      # 前端镜像
│   └── nginx.conf      # Nginx 配置
├── docker-compose.yml  # 服务编排
└── .env.example        # 环境变量模板
```

## 开发路线图

- [ ] 数据库持久化存储
- [ ] 用户认证系统
- [ ] 播客功能实现
- [ ] 文章笔记与标签
- [ ] 学习数据统计

## License

MIT
