# 创空间(ModelScope Studio)部署指南

## 📋 部署前准备

### 1. 获取访问令牌(Access Token)
访问 [ModelScope访问令牌页面](https://www.modelscope.cn/my/myaccesstoken) 获取您的token。

### 2. 安装 Git LFS
```bash
git lfs install
```

---

## 🚀 部署步骤

### 方式一: 从本地推送(推荐)

#### 1. 克隆创空间仓库
```bash
# 替换 YOUR-ACCESS-TOKEN 和 your-username/your-studio-name
git lfs install
git clone https://oauth2:YOUR-ACCESS-TOKEN@www.modelscope.cn/studios/your-username/your-studio-name.git
cd your-studio-name
```

#### 2. 复制项目文件到创空间目录
```bash
# 在 Collector_ai 项目根目录执行
cp -r backend frontend public .gitignore ../your-studio-name/
cp Dockerfile.studio ../your-studio-name/Dockerfile
cp start.sh ../your-studio-name/
cp nginx.studio.conf ../your-studio-name/
cp .env.example ../your-studio-name/
```

#### 3. 提交并推送
```bash
cd ../your-studio-name

git add .
git commit -m "feat: 初始化 Collector AI 项目"
git push origin main
```

---

### 方式二: 关联现有仓库(更简洁)

#### 1. 在创空间项目根目录重命名 Dockerfile
```bash
# 在 Collector_ai 目录执行
mv Dockerfile.studio Dockerfile
```

#### 2. 在 GitHub 创建新仓库并推送
```bash
# 如果还没推送到 GitHub
git add Dockerfile start.sh nginx.studio.conf
git commit -m "feat: 添加创空间部署配置"
git push origin main
```

#### 3. 在创空间关联 GitHub 仓库
1. 登录 [ModelScope创空间](https://www.modelscope.cn/studios)
2. 创建新的 Docker 创空间
3. 选择 "关联 GitHub 仓库"
4. 选择 `Sophie618/Creator_ai` 仓库

---

## ⚙️ 环境变量配置

在创空间设置中添加以下环境变量:

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `MINIMAX_API_KEY` | `your_api_key` | MiniMax API密钥 |

---

## 🔍 部署验证

### 1. 检查构建日志
- 查看创空间构建页面,确认无错误

### 2. 测试服务
访问分配的创空间URL:
- 前端页面: `https://your-username-your-studio-name.gallery.modelscope.cn/`
- API测试: `https://your-username-your-studio-name.gallery.modelscope.cn/api/collected-articles`

---

## 📦 文件结构说明

```
Collector_ai/
├── Dockerfile.studio          # 创空间部署用 Dockerfile
├── Dockerfile                  # (重命名后) 主 Dockerfile
├── start.sh                    # 容器启动脚本
├── nginx.studio.conf          # Nginx 反向代理配置
├── backend/                   # FastAPI 后端
│   ├── main.py
│   └── requirements.txt
├── frontend/                  # React 前端
│   ├── App.tsx
│   ├── package.json
│   └── ...
└── public/                    # 静态资源
```

---

## 🔧 架构说明

### 端口映射
- **外部访问**: 7860(创空间要求)
- **Nginx**: 监听 7860,分发请求
  - `/` → 前端静态文件
  - `/api/` → 反向代理到后端 8000端口
- **FastAPI**: 内部 8000端口

### 容器内进程
1. **Nginx**: 处理前端请求 + 反向代理
2. **Uvicorn**: 运行 FastAPI 后端

---

## ⚠️ 注意事项

### 1. 数据持久化
创空间提供 `/mnt/workspace` 持久化目录:
```python
# 在 backend/main.py 中使用
import os
DATA_DIR = os.getenv('STUDIO_DATA_DIR', '/mnt/workspace')
```

### 2. 内存限制
创空间有内存限制,建议优化:
- 使用 SQLite 而非内存存储
- 限制并发请求数
- 优化依赖包大小

### 3. 构建时间
首次构建可能需要 5-10 分钟,请耐心等待。

---

## 🐛 常见问题

### 问题1: 构建失败 "npm ci failed"
**解决**: 检查 `frontend/package-lock.json` 是否存在

### 问题2: 后端 API 404
**解决**: 确认 Nginx 配置中 `proxy_pass` 地址为 `http://127.0.0.1:8000`

### 问题3: 环境变量未生效
**解决**: 在创空间设置页面添加环境变量,并重新构建

---

## 📚 参考资料
- [ModelScope创空间文档](https://www.modelscope.cn/docs/ModelScope%E5%88%9B%E7%A9%BA%E9%97%B4/Docker%E5%88%9B%E7%A9%BA%E9%97%B4)
- [原项目 README](./README.md)
