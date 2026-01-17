# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Install system dependencies
# curl: for installing Node.js
# git: often needed for pip installing from git
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# --- Frontend Build ---
WORKDIR /app/frontend
# Install dependencies
RUN npm install
# Build the frontend (Output: /app/frontend/dist)
RUN npm run build

# --- Backend Setup ---
WORKDIR /app/backend
# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port 7860
EXPOSE 7860

# Run the FastAPI app
# --proxy-headers is important if ModelScope uses a reverse proxy
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860", "--proxy-headers"]
