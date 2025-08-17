#!/bin/bash

# YouCreator.AI - 启动Bagel AI服务

echo "🚀 启动YouCreator.AI Bagel服务..."

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装"
    exit 1
fi

# 进入AI服务目录
cd ai-service

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "📦 创建Python虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "🔧 激活虚拟环境..."
source venv/bin/activate

# 安装依赖
echo "📚 安装依赖包..."
pip install -r requirements.txt

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚙️ 复制环境变量配置..."
    cp .env.example .env
    echo "请编辑 .env 文件配置API密钥"
fi

# 启动服务
echo "🎯 启动Bagel AI服务..."
echo "服务将在 http://localhost:8000 运行"
echo "API文档: http://localhost:8000/docs"
echo "Bagel API: http://localhost:8000/api/v1/bagel"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

python main.py
