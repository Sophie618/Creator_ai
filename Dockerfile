# Stage 1: Build Frontend (React)
# Use official Node.js image to avoid manual installation issues
FROM node:20-slim AS frontend-builder

WORKDIR /app/frontend

# Install dependencies first (better caching)
# Copy package.json AND package-lock.json if available
COPY frontend/package.json frontend/package-lock.json* ./
# Use 'npm ci' if lockfile exists, otherwise 'npm install'
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source code and build
COPY frontend ./
# Build the frontend to 'dist' folder
RUN npm run build

# Stage 2: Runtime Environment (Python FastAPI)
# Use official Python image
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies (minimal)
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Setup Backend
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Code
COPY backend ./

# Copy Frontend Build Artifacts from Stage 1
# This places 'dist' at /app/frontend/dist, matching the logic in backend/main.py
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# EXPOSE port 7860 as required by ModelScope
EXPOSE 7860

# Run FastAPI with uvicorn
# The command runs from /app/backend because WORKDIR is set to /app/backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860", "--proxy-headers"]
