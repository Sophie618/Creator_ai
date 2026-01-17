# ==========================================
# 创空间部署 Dockerfile (前后端整合)
# ==========================================

FROM python:3.11-slim

WORKDIR /app

# ============ 安装系统依赖 ============
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    nginx \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# ============ 后端配置 ============
# 复制并安装 Python 依赖
COPY backend/requirements.txt /app/backend/
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# 复制后端代码
COPY backend /app/backend

# ============ 前端构建 ============
# 复制前端代码并构建
COPY frontend /app/frontend
WORKDIR /app/frontend
RUN npm ci && npm run build

# ============ Nginx 配置 ============
# 复制构建产物到 Nginx 目录
RUN rm -rf /usr/share/nginx/html/* && \
    cp -r /app/frontend/dist/* /usr/share/nginx/html/

# 复制 Nginx 配置文件
COPY nginx.studio.conf /etc/nginx/sites-available/default

# ============ 启动脚本 ============
WORKDIR /app
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# ============ 暴露端口 ============
EXPOSE 7860

# ============ 启动命令 ============
CMD ["/app/start.sh"]
