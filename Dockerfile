# Stage 1: Build Frontend (React)
FROM node:20-slim AS frontend-builder

WORKDIR /app/frontend

# Use Alibaba Cloud NPM Mirror for faster and more reliable installs in China
# This is crucial for ModelScope environment
RUN npm config set registry https://registry.npmmirror.com

# Copy package files first
COPY frontend/package.json frontend/package-lock.json* ./

# Install dependencies
RUN if [ -f package-lock.json ]; then \
      npm ci --no-audit || npm install --no-audit; \
    else \
      npm install --no-audit; \
    fi

# Copy source code and build
COPY frontend ./

# Build the frontend to 'dist' folder
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Stage 2: Runtime Environment (Python FastAPI)
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Setup Backend
WORKDIR /app/backend
COPY backend/requirements.txt ./

# Use Aliyun PyPI mirror for backend
RUN pip install --no-cache-dir -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/

# Copy Backend Code
COPY backend ./

# Copy Frontend Build Artifacts from Stage 1
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# EXPOSE port 7860
EXPOSE 7860

# Run FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860", "--proxy-headers"]
