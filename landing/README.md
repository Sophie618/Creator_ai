# 收藏加官网 (Collector+)

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)
![Vite](https://img.shields.io/badge/vite-6.3.5-646cff.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 项目简介

**收藏加 (Collector+)** 是一个现代化的内容聚合平台落地页项目。本项目作为官方网站的前端实现，旨在通过极致的 UI/UX 设计展示产品的核心理念——“收你想收的”。

项目包含了一个完整的高保真落地页，集成了播客播放器、文章动态展示列表、互动调研卡片以及一套丝滑的模拟登录/注册/邀请流程。整体设计风格简约大气，适配桌面端大屏展示，并针对移动端进行了基础适配。

## 🛠️ 技术栈

本项目采用目前主流的前端技术栈构建，注重性能与开发体验：

- **核心框架**: [React 18](https://react.dev/)
- **构建工具**: [Vite 6](https://vitejs.dev/) (配合 `@vitejs/plugin-react-swc` 实现极速编译)
- **开发语言**: [TypeScript](https://www.typescriptlang.org/)
- **样式方案**: 
  - [Tailwind CSS](https://tailwindcss.com/) (原子化 CSS)
  - [Radix UI](https://www.radix-ui.com/) (无头组件库，提供无障碍交互)
  - `class-variance-authority` (CVA) + `tailwind-merge` (构建可复用组件样式)
- **图标库**: [Lucide React](https://lucide.dev/)
- **其他依赖**:
  - `embla-carousel-react`: 轮播组件
  - `sonner`: 优雅的 Toast 通知
  - `react-hook-form`: 表单处理

## 🏗️ 项目架构

项目采用标准的单页应用 (SPA) 架构：

- **组件化设计**: 遵循 Shadcn UI 风格，将 UI 逻辑（Radix）与样式（Tailwind）分离，实现高度可复用。
- **资源管理**: 使用特殊的 Figma 资源导入路径别名 (`figma:asset/`)，方便设计稿还原。
- **Mock 交互**: 前端通过状态机模式模拟了完整的用户认证流程，无需后端即可演示完整路径。

## 📁 目录结构

```bash
guanw/
├── deploy/                 # 部署相关配置
│   └── nginx.conf          # Nginx 配置文件
├── public/                 # 静态资源目录
├── src/
│   ├── assets/             # 图片与媒体资源
│   ├── components/         # 组件目录
│   │   └── ui/             # 通用 UI 组件 (Button, Dialog, etc.)
│   ├── imports/            # 导入的特定业务组件
│   ├── styles/             # 全局样式
│   ├── App.tsx             # 主应用逻辑与页面布局
│   ├── main.tsx            # 入口文件
│   └── vite-env.d.ts       # Vite 类型定义
├── Dockerfile              # Docker 构建文件
├── ms_deploy.json          # ModelScope 部署配置
├── netlify.toml            # Netlify 部署配置
├── package.json            # 项目依赖与脚本
├── tsconfig.json           # TypeScript 配置
└── vite.config.ts          # Vite 配置
```

## ⚡ 核心功能模块

### 1. 沉浸式首页 (Landing Page)
- **动态打字机效果**: 头部 Slogan "收你想收的..." 动态展示。
- **悬浮卡片交互**: 文章列表采用堆叠与悬浮展开的交互设计。
- **今日播客**: 内置简易音频播放器，支持播放/暂停、进度拖拽、音量控制及波形动画。

### 2. 模拟认证流程 (Mock Auth)
位于 `App.tsx` 中的 `LoginModal` 组件实现了完整的模拟登录流：
1. **Welcome**: 输入邮箱。
2. **Register**: 输入密码。
3. **Verification**: 模拟 6 位验证码输入（自动聚焦、回退支持）。
4. **Invitation**: 邀请码验证。
5. **Redirect**: 验证通过后跳转至 ModelScope 应用空间。

### 3. 互动调研 (Survey)
- 首页右侧集成了简单的投票/调研卡片，支持用户点击交互。

## ⚙️ 部署指南

### 本地开发

```bash
# 1. 克隆项目
git clone [repository-url]

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
# 访问 http://localhost:3000
```

### Docker 部署

项目包含完整的 `Dockerfile`，支持多阶段构建：

```bash
# 构建镜像
docker build -t collector-plus-web .

# 运行容器 (映射 7860 端口)
docker run -p 7860:7860 collector-plus-web
```

### 平台部署配置

- **ModelScope**: 配置文件 `ms_deploy.json` 指定了运行端口为 `7860`。
- **Netlify**: `netlify.toml` 配置了构建命令 `npm run build` 和发布目录 `build`。
 - **Vercel**: `vercel.json` 指定 `outputDirectory: build`，避免默认 `dist` 目录导致构建失败。

### 魔搭创空间部署（推荐）
- 类型：Docker（容器需监听 7860）
- 必备文件： [ms_deploy.json](file:///e:/Code/AI/AI/Start/guanw/ms_deploy.json), [Dockerfile](file:///e:/Code/AI/AI/Start/guanw/Dockerfile), [nginx.conf](file:///e:/Code/AI/AI/Start/guanw/deploy/nginx.conf), [start.sh](file:///e:/Code/AI/AI/Start/guanw/deploy/start.sh)
- 详细步骤：见部署说明 [DEPLOY_MODELSCOPE.md](file:///e:/Code/AI/AI/Start/guanw/DEPLOY_MODELSCOPE.md)

### Vercel 部署
- 发布目录：build（见 [vercel.json](file:///e:/Code/AI/AI/Start/guanw/vercel.json)）
- 构建命令：npm run build
- 单页路由：rewrites → 所有路径回退到 `/index.html`

## 📦 API 接口

⚠️ **注意**: 本项目目前为纯前端展示项目 (Static Site)，**暂无后端 API 对接**。

- **数据来源**: 所有展示数据（文章列表、播客信息）均为硬编码在 `App.tsx` 中的静态数据。
- **认证逻辑**: 登录、注册、验证码校验均为前端模拟逻辑，不涉及真实网络请求。
- **跳转逻辑**: 认证成功后通过 `window.location.assign` 跳转外部链接。

## 💡 常见问题 (FAQ)

**Q: 如何修改首页的背景图片？**
A: 首页图片资源引用自 `src/assets/`，你可以在 `vite.config.ts` 中找到 `figma:asset/` 对应的别名映射关系进行修改。

**Q: 验证码是多少？**
A: 目前为模拟逻辑，任意 6 位数字即可通过前端校验。

**Q: 项目支持移动端吗？**
A: 项目使用了 Tailwind 的响应式前缀，但主要设计针对桌面端大屏优化，移动端可能有部分布局差异。

## 🖼️ 图片性能优化
- 统一使用组件 [OptimizedImg](file:///e:/Code/AI/AI/Start/guanw/src/components/OptimizedImg.tsx)：
  - `loading="lazy"` 非关键图片懒加载
  - `decoding="async"` 异步解码，减少主线程阻塞
  - `fetchpriority` 控制关键资源优先级（Logo 等为 high）
- 生产缓存：Nginx 对 `/assets/` 配置一年强缓存与 immutable（见 [nginx.conf](file:///e:/Code/AI/AI/Start/guanw/deploy/nginx.conf#L12-L17)）
- 响应式与格式建议：
  - 可为大图提供 WebP 与原格式兜底（后续可用 `<picture>` 或 `image-set`）
  - 构建阶段开启图片压缩，仅对生产输出执行（不影响开发体验）
