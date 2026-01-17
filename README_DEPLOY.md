# 创空间 (ModelScope) 部署指南

本项目支持在阿里魔搭社区（ModelScope）的创空间（Studios）中以 Docker 模式部署。

## 1. 部署配置

在创建或配置创空间时，请选择 **Docker** 运行环境。

### 端口配置
- **端口**: `7860` (默认配置，无需修改 Dockerfile)

### 持久化存储
- **挂载路径**: `/mnt/workspace`
- 代码已配置将 SQLite 数据库 (`collector.db`) 存储在该目录下，确保重启后数据不丢失。

## 2. 环境变量设置

为了让服务正常运行（B站字幕提取、AI 总结等功能），**必须**在创空间的设置页面添加以下环境变量：

1.  **`BILIBILI_SESSDATA`**
    - 描述: B站登录 Cookie (SESSDATA 字段)，用于获取 AI 字幕和长文本。
    - 获取方式: 登录 B站 -> F12 控制台 -> Application/Storage -> Cookies -> SESSDATA。
    - *注意: 请确保 SESSDATA 的值是最新的，且不包含多余的引号或空格。*

2.  **`MINIMAX_API_KEY`**
    - 描述: Minimax 模型服务 API Key，用于后端生成测验和总结。
    
## 3. 本地构建与验证 (可选)

如果你想在本地验证 Docker 镜像：

```bash
# 构建镜像
docker build -t collector-ai .

# 运行容器 (模拟 7860 端口)
docker run -p 7860:7860 --env-file backend/.env collector-ai
```

访问 `http://localhost:7860` 即可看到应用。

## 4. 目录结构说明

- `/app/backend`: 后端代码
- `/app/frontend`: 前端及其构建产物 (`dist`)
- `/mnt/workspace`: 持久化数据区 (Docker 运行时自动挂载)

## 常见问题

- **报错 "Found 0 subtitle tracks"**: 检查 `BILIBILI_SESSDATA` 是否过期或错误。
- **页面白屏**: 检查浏览器控制台，确认前端静态资源是否加载成功。
