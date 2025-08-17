#!/bin/bash

# YouCreator.AI 创作工具快速启动脚本

echo "🎨 YouCreator.AI 创作工具启动器"
echo "=================================="

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装，请先安装Python3"
    exit 1
fi

# 检查必要的依赖
echo "📦 检查依赖..."
python3 -c "import requests" 2>/dev/null || {
    echo "⚠️  requests库未安装，正在安装..."
    pip3 install requests
}

# 启动创作工具启动器
echo "🚀 启动创作工具..."
python3 creator_launcher.py
