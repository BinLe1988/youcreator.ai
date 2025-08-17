#!/bin/bash

# YouCreator.AI 媒体生成功能部署脚本
# 部署文字配图、文字配乐、图片配乐功能

set -e

echo "🚀 开始部署 YouCreator.AI 媒体生成功能..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}📁 项目根目录: $PROJECT_ROOT${NC}"

# 检查必要的文件
echo -e "${YELLOW}🔍 检查必要文件...${NC}"

required_files=(
    "ai-service/services/media_generation.py"
    "ai-service/routers/media.py"
    "backend/internal/service/media_service.go"
    "backend/internal/handler/media_handler.go"
    "frontend/src/services/mediaService.ts"
    "frontend/src/components/media/TextToImage.tsx"
    "frontend/src/components/media/TextToMusic.tsx"
    "frontend/src/components/media/ImageToMusic.tsx"
)

for file in "${required_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file 不存在${NC}"
        exit 1
    fi
done

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安装，请先安装 Docker${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose 未安装，请先安装 Docker Compose${NC}"
    exit 1
fi

# 创建必要的目录
echo -e "${YELLOW}📁 创建必要目录...${NC}"
mkdir -p logs
mkdir -p ai-service/models
mkdir -p ai-service/cache
mkdir -p uploads/images
mkdir -p uploads/audio

# 设置环境变量
echo -e "${YELLOW}🔧 设置环境变量...${NC}"
if [[ ! -f .env ]]; then
    echo -e "${YELLOW}📝 创建 .env 文件...${NC}"
    cat > .env << EOF
# 基础配置
NODE_ENV=production
GO_ENV=production
PYTHON_ENV=production

# 服务端口
FRONTEND_PORT=3000
BACKEND_PORT=8080
AI_SERVICE_PORT=8000

# 数据库配置
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_DATABASE=youcreator
MYSQL_USER=youcreator
MYSQL_PASSWORD=youcreator_password

MONGODB_HOST=mongodb
MONGODB_PORT=27017
MONGODB_DATABASE=youcreator

REDIS_HOST=redis
REDIS_PORT=6379

# AI服务配置
AI_SERVICE_URL=http://ai-service:8000
HUGGINGFACE_TOKEN=your_huggingface_token_here
STABILITY_API_KEY=your_stability_api_key_here

# 媒体生成配置
MAX_IMAGE_SIZE=10485760  # 10MB
MAX_AUDIO_DURATION=30    # 30秒
GENERATION_TIMEOUT=300   # 5分钟

# 安全配置
JWT_SECRET=your_jwt_secret_here
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
EOF
    echo -e "${GREEN}✅ .env 文件已创建，请根据需要修改配置${NC}"
else
    echo -e "${GREEN}✅ .env 文件已存在${NC}"
fi

# 构建Docker镜像
echo -e "${YELLOW}🐳 构建Docker镜像...${NC}"

# 构建AI服务镜像
echo -e "${BLUE}🤖 构建AI服务镜像...${NC}"
cd ai-service
docker build -t youcreator-ai-service:latest .
cd ..

# 构建后端服务镜像
echo -e "${BLUE}🔧 构建后端服务镜像...${NC}"
cd backend
docker build -t youcreator-backend:latest .
cd ..

# 构建前端服务镜像
echo -e "${BLUE}🎨 构建前端服务镜像...${NC}"
cd frontend
docker build -t youcreator-frontend:latest .
cd ..

# 启动服务
echo -e "${YELLOW}🚀 启动服务...${NC}"

# 停止现有服务
echo -e "${BLUE}🛑 停止现有服务...${NC}"
docker-compose -f docker/docker-compose.yml down

# 启动数据库服务
echo -e "${BLUE}🗄️ 启动数据库服务...${NC}"
docker-compose -f docker/docker-compose.yml up -d mysql mongodb redis opensearch

# 等待数据库启动
echo -e "${YELLOW}⏳ 等待数据库启动...${NC}"
sleep 30

# 启动应用服务
echo -e "${BLUE}🚀 启动应用服务...${NC}"
docker-compose -f docker/docker-compose.yml up -d ai-service backend frontend

# 等待服务启动
echo -e "${YELLOW}⏳ 等待服务启动...${NC}"
sleep 60

# 健康检查
echo -e "${YELLOW}🏥 执行健康检查...${NC}"

services=(
    "http://localhost:8000/health:AI服务"
    "http://localhost:8080/health:后端服务"
    "http://localhost:3000:前端服务"
)

for service in "${services[@]}"; do
    url="${service%%:*}"
    name="${service##*:}"
    
    echo -e "${BLUE}🔍 检查 $name ($url)...${NC}"
    
    for i in {1..10}; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $name 运行正常${NC}"
            break
        else
            if [[ $i -eq 10 ]]; then
                echo -e "${RED}❌ $name 健康检查失败${NC}"
            else
                echo -e "${YELLOW}⏳ 等待 $name 启动... ($i/10)${NC}"
                sleep 10
            fi
        fi
    done
done

# 显示服务状态
echo -e "${YELLOW}📊 服务状态:${NC}"
docker-compose -f docker/docker-compose.yml ps

# 显示访问信息
echo -e "${GREEN}🎉 部署完成！${NC}"
echo -e "${BLUE}📱 访问地址:${NC}"
echo -e "  🌐 前端应用: http://localhost:3000"
echo -e "  📚 后端API: http://localhost:8080"
echo -e "  🤖 AI服务: http://localhost:8000"
echo -e "  📖 API文档: http://localhost:8080/docs"

echo -e "${BLUE}🎨 媒体生成功能:${NC}"
echo -e "  📸 文字配图: http://localhost:3000/media"
echo -e "  🎵 文字配乐: http://localhost:3000/media"
echo -e "  🖼️ 图片配乐: http://localhost:3000/media"

echo -e "${YELLOW}💡 使用提示:${NC}"
echo -e "  • 首次使用时AI模型需要下载，可能需要较长时间"
echo -e "  • 建议配置GPU以获得更好的生成速度"
echo -e "  • 可以通过环境变量配置Hugging Face和Stability AI的API密钥"
echo -e "  • 查看日志: docker-compose -f docker/docker-compose.yml logs -f"

echo -e "${GREEN}✨ YouCreator.AI 媒体生成功能部署成功！${NC}"
