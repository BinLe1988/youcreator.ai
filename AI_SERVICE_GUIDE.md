# AI服务启动指南

## 🚀 快速启动

### 1. 激活虚拟环境并启动服务

```bash
# 进入AI服务目录
cd /Users/richardl/projects/youcreator.ai/ai-service

# 激活虚拟环境
source venv/bin/activate

# 启动AI服务
python main.py
```

### 2. 验证服务状态

启动后你应该看到类似的输出：
```
2025-08-16 23:31:42,760 - __main__ - INFO - Starting YouCreator.AI Service...
INFO:     Will watch for changes in these directories: ['/Users/richardl/projects/youcreator.ai/ai-service']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [99300] using StatReload
INFO:     Started server process [99302]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 3. 访问服务

- **健康检查**: http://localhost:8000/health
- **API文档**: http://localhost:8000/docs
- **服务根路径**: http://localhost:8000/

## 📋 可用的API端点

### 文本生成
```bash
curl -X POST "http://localhost:8000/api/v1/text/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "写一个关于AI的故事",
    "max_length": 200,
    "temperature": 0.7
  }'
```

### 图像生成
```bash
curl -X POST "http://localhost:8000/api/v1/image/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "一个美丽的日落风景",
    "width": 512,
    "height": 512,
    "steps": 20
  }'
```

### 音乐生成
```bash
curl -X POST "http://localhost:8000/api/v1/music/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "轻松的爵士乐",
    "duration": 30,
    "genre": "jazz"
  }'
```

### 代码生成
```bash
curl -X POST "http://localhost:8000/api/v1/code/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "计算斐波那契数列的函数",
    "language": "python",
    "max_length": 200
  }'
```

### 模型状态
```bash
curl -X GET "http://localhost:8000/api/v1/models/status"
```

## 🔧 配置说明

AI服务的配置文件位于 `.env`，主要配置项：

```env
# 服务器配置
HOST=0.0.0.0
PORT=8000
DEBUG=true

# CORS配置
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:8080"]

# 生成限制
MAX_TEXT_LENGTH=2000
MAX_IMAGE_SIZE=1024
MAX_MUSIC_DURATION=60
MAX_CODE_LENGTH=5000
```

## 🎯 与前端集成测试

1. **启动AI服务** (端口8000)
2. **启动前端服务** (端口3000)
3. **在前端创作页面测试AI生成功能**

前端会自动调用AI服务的API来生成内容。

## 📝 开发模式特性

- **自动重载**: 代码修改后自动重启服务
- **详细日志**: 显示请求和响应信息
- **交互式文档**: 访问 `/docs` 查看Swagger UI
- **模拟生成**: 当前使用模拟数据，可替换为真实AI模型

## 🔍 故障排除

### 问题1: 端口被占用
```bash
# 查找占用8000端口的进程
lsof -i :8000

# 杀死进程
kill -9 <PID>
```

### 问题2: 虚拟环境问题
```bash
# 重新创建虚拟环境
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 问题3: 依赖问题
```bash
# 更新pip和重新安装依赖
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

## 🚀 生产部署

对于生产环境，建议使用：

```bash
# 使用gunicorn启动
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

或使用Docker：
```bash
docker build -t youcreator-ai-service .
docker run -p 8000:8000 youcreator-ai-service
```

## 📊 监控和日志

- 服务日志会显示在控制台
- 可以通过 `/health` 端点监控服务状态
- 使用 `/api/v1/models/status` 检查AI模型状态

---

🎉 **AI服务现在已经可以正常运行了！**

你可以通过前端界面或直接调用API来测试AI生成功能。
