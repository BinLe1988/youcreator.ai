#!/bin/bash

# YouCreator.AI 开发环境设置脚本

set -e

echo "🚀 Setting up YouCreator.AI development environment..."

# 检查必要的工具
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        exit 1
    fi
}

echo "📋 Checking required tools..."
check_command "node"
check_command "npm"
check_command "go"
check_command "python3"
check_command "docker"
check_command "docker-compose"

# 设置前端
echo "🎨 Setting up frontend..."
cd frontend
npm install
cd ..

# 设置后端
echo "⚙️ Setting up backend..."
cd backend
go mod tidy
cd ..

# 设置AI服务
echo "🤖 Setting up AI service..."
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# 创建环境变量文件
echo "📝 Creating environment files..."

# 后端环境变量
cat > backend/.env << EOF
# Server Configuration
SERVER_PORT=8080
GIN_MODE=debug

# Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=123456
MYSQL_DATABASE=youcreator

MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=youcreator

OPENSEARCH_URL=http://localhost:9200
OPENSEARCH_USERNAME=admin
OPENSEARCH_PASSWORD=admin

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# AI Service Configuration
AI_SERVICE_URL=http://localhost:8000
AI_API_KEY=your-ai-api-key

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE_HOUR=24
EOF

# AI服务环境变量
cat > ai-service/.env << EOF
# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=true

# Model Configuration
MODEL_CACHE_DIR=./models
MAX_MODEL_MEMORY=8GB

# Redis Configuration
REDIS_URL=redis://localhost:6379

# API Keys (replace with actual keys)
OPENAI_API_KEY=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
HUGGINGFACE_TOKEN=your-huggingface-token

# Allowed Origins
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:8080"]
EOF

# 前端环境变量
cat > frontend/.env.local << EOF
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000

# Feature Flags
NEXT_PUBLIC_ENABLE_COLLABORATION=true
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
EOF

# 启动数据库服务
echo "🗄️ Starting database services..."
docker-compose -f docker/docker-compose.yml up -d mysql mongodb opensearch redis

# 等待数据库启动
echo "⏳ Waiting for databases to be ready..."
sleep 30

# 运行数据库迁移
echo "📊 Running database migrations..."
cd backend
go run cmd/migrate/main.go
cd ..

echo "✅ Development environment setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Start the AI service: cd ai-service && source venv/bin/activate && python main.py"
echo "2. Start the backend: cd backend && go run cmd/main.go"
echo "3. Start the frontend: cd frontend && npm run dev"
echo ""
echo "🌐 Access the application at: http://localhost:3000"
echo "📚 API documentation at: http://localhost:8080/docs"
echo "🤖 AI service at: http://localhost:8000/docs"
