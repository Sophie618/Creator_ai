# 📚 Read-AI — Gamified Reading（沉浸式阅读与知识博弈原型）

> 一个以「阅读 → AI 解构 → 练习巩固 → 知识资产化」为主线的前端原型项目。  
> 当前版本以 Mock 数据与前端直连 Gemini 为主，适合用于产品形态验证与交互探索。

---

## 📋 项目简介

Read-AI 是一个“游戏化阅读”原型：用户导入文章链接后，可进入沉浸阅读视图，利用 AI 生成的结构化分析（思维导图 / 关键词 / 认知简报）完成快速理解；同时提供 AI 播客、AI 问答、学习数据等模块，形成“输入—理解—复盘—强化”的闭环体验。

当前实现为纯前端应用，不依赖自建后端服务：  
- 文章列表、播客脚本、问答题目、学习数据均为 Mock 数据/模拟逻辑。  
- AI 能力通过 `@google/genai`（Gemini）在浏览器端直接调用；未配置 Key 时自动降级为离线模式。

---

## 🛠️ 前端技术栈

- **框架**：React 19 + TypeScript  
- **构建**：Vite 6  
- **UI/交互**：Tailwind 风格工具类（由 className 直接控制）、响应式布局  
- **图标**：lucide-react  
- **AI SDK**：@google/genai（Gemini）

依赖清单可见：[package.json](file:///e:/Code/AI/AI/Start/Read%20AI/Read-AI---Gamified-Reading-/package.json)

---

## 🏗️ 项目架构

本项目未使用 `react-router` 等路由方案，而是采用“顶层枚举 + 条件渲染”的轻量路由：

- **顶层容器**：[App.tsx](file:///e:/Code/AI/AI/Start/Read%20AI/Read-AI---Gamified-Reading-/App.tsx)  
  - 维护 `currentView`（来自 [types.ts](file:///e:/Code/AI/AI/Start/Read%20AI/Read-AI---Gamified-Reading-/types.ts) 的 `View` enum）  
  - 切换左侧导航栏与主视图渲染
- **视图层**：`views/` 目录，每个页面一个组件
- **数据层**：`data/mockData.ts` 为当前统一的文章Mock数据源
- **AI 调用**：在视图内直接调用 Gemini（Reader/Library 中已实现“无 Key 离线降级”）

---

## 📁 目录结构

```text
.
├─ components/
│  └─ QuizCard.tsx                 # 测验卡片组件（用于部分问答/挑战展示）
├─ data/
│  └─ mockData.ts                  # Mock 文章数据源（全局共享）
├─ views/
│  ├─ Dashboard.tsx                # 首页：导入链接、任务提示卡、历史记录（读取 localStorage）
│  ├─ LibraryView.tsx              # 收录夹：文章库列表 + 右侧 AI 助理聊天
│  ├─ ReaderView.tsx               # 阅读器：沉浸阅读 + AI 解构（思维导图/关键词/简报）
│  ├─ KnowledgeBase.tsx            # 知识卡片：卡片展示（示例）
│  ├─ AIQuizView.tsx               # AI 问答：题目/错题本/学习报告（当前为 Mock 题）
│  ├─ PodcastView.tsx              # AI 播客：脚本/播放器 UI（当前为 Mock）
│  ├─ LearningData.tsx             # 学习数据：热力图/排行榜/统计卡等可视化
│  ├─ SettingsView.tsx             # 设置页
│  └─ SubscriptionView.tsx         # 订阅页（模拟支付流程）
├─ App.tsx                         # 顶层视图切换 + 左侧导航
├─ types.ts                        # 核心类型定义（View/Article/Quiz 等）
├─ index.tsx                       # React 入口
├─ index.html                      # HTML 入口
└─ vite.config.ts                  # Vite 配置 + 环境变量注入
```

---

## ⚡ 核心功能模块和工作流程

### 🧭 1) 导入与开始阅读

1. 在首页输入文章链接（目前为模拟导入）  
2. 点击导入后进入阅读器（`App` 保存 `articleId + initialUrl` 并切换到 Reader 视图）

相关代码：
- 导入入口：[Dashboard.tsx](file:///e:/Code/AI/AI/Start/Read%20AI/Read-AI---Gamified-Reading-/views/Dashboard.tsx)
- 视图切换：[App.tsx](file:///e:/Code/AI/AI/Start/Read%20AI/Read-AI---Gamified-Reading-/App.tsx)

### 🧠 2) 沉浸阅读与 AI 解构

- 阅读器在进入内容状态后触发 AI 分析（或离线降级）  
- 右侧显示：思维导图、关键词云、认知简报

相关代码：
- [ReaderView.tsx](file:///e:/Code/AI/AI/Start/Read%20AI/Read-AI---Gamified-Reading-/views/ReaderView.tsx)

### 🗂️ 3) 收录夹与 AI 助理

- 收录夹展示文章列表（当前使用 Mock 数据），右侧“思维博弈助理”支持基于收藏文章进行问答（无 Key 离线降级）。

相关代码：
- [LibraryView.tsx](file:///e:/Code/AI/AI/Start/Read%20AI/Read-AI---Gamified-Reading-/views/LibraryView.tsx)

### 🧩 4) AI 问答 / 错题本 / 学习报告

- “每日挑战”：单选/多选题交互、答题解析与出处关联  
- “错题本”：自动记录错题回顾  
- “学习报告”：统计正确率并给出推荐阅读

相关代码：
- [AIQuizView.tsx](file:///e:/Code/AI/AI/Start/Read%20AI/Read-AI---Gamified-Reading-/views/AIQuizView.tsx)
- 类型定义：[types.ts](file:///e:/Code/AI/AI/Start/Read%20AI/Read-AI---Gamified-Reading-/types.ts)

### 🎧 5) AI 播客（多模态替代摘要）

- 目前提供播客 UI/播放进度与“语速/声线”控制面板（示例逻辑）

相关代码：
- [PodcastView.tsx](file:///e:/Code/AI/AI/Start/Read%20AI/Read-AI---Gamified-Reading-/views/PodcastView.tsx)

### 📈 6) 学习数据可视化

- 热力矩阵、排行表、统计卡片等（均为前端模拟数据）

相关代码：
- [LearningData.tsx](file:///e:/Code/AI/AI/Start/Read%20AI/Read-AI---Gamified-Reading-/views/LearningData.tsx)

---

## ⚙️ 部署指南

### 1) 环境变量（Gemini API Key）

在项目根目录创建 `.env.local`：

```bash
GEMINI_API_KEY=your_gemini_api_key
```

Vite 会在构建时将其注入到前端（见 [vite.config.ts](file:///e:/Code/AI/AI/Start/Read%20AI/Read-AI---Gamified-Reading-/vite.config.ts)）。

> 安全提示：当前实现为“浏览器端直连 Gemini SDK”，Key 会进入前端 bundle。  
> 若用于真实生产环境，建议改为 **服务端代理**（后端保存 Key，前端仅调用自家 REST API）。

### 2) 本地运行

**前置条件**：Node.js（建议使用 LTS）

```bash
npm install
npm run dev
```

默认访问：
- http://localhost:3000/

### 3) 构建与预览

```bash
npm run build
npm run preview
```

### 4) 生产部署

- 静态托管：Vercel / Netlify / GitHub Pages / Nginx 静态目录均可  
- 如果继续浏览器直连 Gemini：需要在构建时提供 `GEMINI_API_KEY`  
- 生产推荐：增加后端服务，避免在前端暴露 Key（见 API 章节）

---

## 📦 API 接口

### ✅ 当前实现（实际存在）

本项目当前 **没有自建后端 API**。主要外部调用：
- **Gemini**：浏览器端通过 `@google/genai` 调用 `models.generateContent`  
  - Reader 分析逻辑：[ReaderView.tsx](file:///e:/Code/AI/AI/Start/Read%20AI/Read-AI---Gamified-Reading-/views/ReaderView.tsx)
  - 收录夹助理对话：[LibraryView.tsx](file:///e:/Code/AI/AI/Start/Read%20AI/Read-AI---Gamified-Reading-/views/LibraryView.tsx)

### 🧩 建议的 RESTful API（用于生产化改造）

> 以下为“建议契约”，用于把 Mock 与前端直连能力迁移到后端（可按你的实际后端实现调整）。

- `GET /api/articles`：获取用户收录夹文章列表  
- `POST /api/articles/import`：导入文章链接并触发解析（返回 articleId）  
- `GET /api/articles/:id`：获取文章详情/解析结果  
- `POST /api/ai/analyze`：传入文章内容，返回思维导图/关键词/摘要（后端调用 Gemini）  
- `POST /api/ai/quiz`：基于文章生成题目  
- `POST /api/ai/podcast`：生成 1 分钟播客脚本/音频（可接 TTS 服务）  
- `POST /api/progress`：上报阅读/答题进度  
- `GET /api/reports/learning`：学习报告

---

## 💡 常见问题（FAQ）

### 1) “An API Key must be set when running in a browser” 是什么原因？

- 原因：浏览器端调用 `@google/genai` 时未提供 `GEMINI_API_KEY`  
- 处理：创建 `.env.local` 并设置 `GEMINI_API_KEY`；或保持离线模式（项目内已做降级）

相关配置：[vite.config.ts](file:///e:/Code/AI/AI/Start/Read%20AI/Read-AI---Gamified-Reading-/vite.config.ts)

### 2) 控制台出现 `net::ERR_ABORTED .../LibraryView.tsx?t=...` 怎么办？

- 多数情况下是 Vite 热更新或模块加载被取消的浏览器提示  
- 如果页面无法加载，通常是该模块代码存在语法/导入错误；可以优先查看浏览器控制台上方的真正报错行

