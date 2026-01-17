#!/bin/bash
set -e

echo "🚀 Starting Collector AI Studio..."

# 启动 Nginx
echo "📦 Starting Nginx on port 7860..."
nginx

# 启动 FastAPI (前台运行,保持容器运行)
echo "⚡ Starting FastAPI backend..."
cd /app/backend
exec uvicorn main:app --host 0.0.0.0 --port 8000
