# YouCreator.AI 快速开始指南

## 🎯 项目概述

YouCreator.AI 是一个基于AI的多模态创作编辑器，采用现代化的四层架构设计：

1. **表现层** - Next.js 14 前端应用
2. **业务逻辑层** - Go 后端服务  
3. **数据访问层** - MySQL + MongoDB + OpenSearch
4. **AI模型层** - Python AI服务

## 🏗️ 技术架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    表现层 (Presentation)                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Next.js 14 前端应用                        │ │
│  │  • React 18 + TypeScript                              │ │
│  │  • Tailwind CSS + Framer Motion                       │ │
│  │  • Monaco Editor + TipTap                             │ │
│  │  • WebSocket 实时协作                                  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                  业务逻辑层 (Business Logic)                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                Go 后端服务                              │ │
│  │  • Gin 框架 RESTful API                               │ │
│  │  • JWT 认证 + 权限管理                                 │ │
│  │  • WebSocket 协作服务                                  │ │
│  │  • 文件上传管理                                        │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │ gRPC/HTTP
┌─────────────────────────────────────────────────────────────┐
│                   数据访问层 (Data Access)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   MySQL     │  │  MongoDB    │  │    OpenSearch       │  │
│  │  用户数据    │  │  创作内容    │  │   搜索 + 推荐       │  │
│  │  项目管理    │  │  版本历史    │  │   内容分析          │  │
│  │  权限控制    │  │  媒体文件    │  │   全文检索          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │ API调用
┌─────────────────────────────────────────────────────────────┐
│                    AI模型层 (AI Models)                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Python AI 服务                            │ │
│  │  • FastAPI 异步框架                                    │ │
│  │  • 文本生成 (GPT/LLaMA)                               │ │
│  │  • 图像生成 (Stable Diffusion)                        │ │
│  │  • 音乐生成 (MusicGen)                                │ │
│  │  • 代码生成 (CodeLlama)                               │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 快速启动

### 1. 环境准备

确保你的系统已安装以下工具：

```bash
# 检查Node.js版本 (需要18+)
node --version

# 检查Go版本 (需要1.21+)
go version

# 检查Python版本 (需要3.11+)
python3 --version

# 检查Docker
docker --version
docker-compose --version
```

### 2. 一键启动开发环境

```bash
# 克隆项目
git clone <your-repo-url>
cd youcreator.ai

# 运行自动化设置脚本
./scripts/dev-setup.sh
```

这个脚本会自动：
- 安装所有依赖
- 启动数据库服务
- 创建环境变量文件
- 运行数据库迁移

### 3. 手动启动各服务

如果需要手动启动，按以下顺序：

#### 3.1 启动数据库服务
```bash
docker-compose -f docker/docker-compose.yml up -d mysql mongodb opensearch redis
```

#### 3.2 启动AI服务
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

#### 3.3 启动后端服务
```bash
cd backend
go mod tidy
go run cmd/main.go
```

#### 3.4 启动前端服务
```bash
cd frontend
npm install
npm run dev
```

### 4. 访问应用

- 🌐 **前端应用**: http://localhost:3000
- 📚 **后端API**: http://localhost:8080
- 🤖 **AI服务**: http://localhost:8000
- 📊 **API文档**: http://localhost:8080/docs

## 🔧 开发指南

### 前端开发

```bash
cd frontend

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务
npm start

# 代码检查
npm run lint

# 类型检查
npm run type-check
```

**主要技术栈：**
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS + Framer Motion
- Monaco Editor (代码编辑)
- TipTap (富文本编辑)
- Fabric.js (图像编辑)
- Tone.js (音频处理)

### 后端开发

```bash
cd backend

# 开发模式
go run cmd/main.go

# 构建
go build -o bin/server cmd/main.go

# 运行测试
go test ./...

# 代码格式化
go fmt ./...

# 依赖管理
go mod tidy
```

**项目结构：**
```
backend/
├── cmd/           # 应用入口
├── internal/      # 内部包
│   ├── api/      # API处理器
│   ├── service/  # 业务逻辑
│   ├── repository/ # 数据访问
│   ├── model/    # 数据模型
│   └── config/   # 配置管理
└── pkg/          # 公共包
```

### AI服务开发

```bash
cd ai-service

# 激活虚拟环境
source venv/bin/activate

# 开发模式
python main.py

# 运行测试
python -m pytest

# 代码格式化
black src/
flake8 src/
```

**支持的AI功能：**
- 📝 文本生成 (GPT类模型)
- 🎨 图像生成 (Stable Diffusion)
- 🎵 音乐生成 (MusicGen)
- 💻 代码生成 (CodeLlama)

## 📊 数据库设计

### MySQL - 结构化数据
- `users` - 用户信息
- `projects` - 项目管理
- `project_collaborators` - 协作关系
- `files` - 文件元数据
- `ai_generations` - AI生成记录
- `user_sessions` - 用户会话

### MongoDB - 文档数据
- `contents` - 创作内容
- `content_versions` - 版本历史
- `media_files` - 媒体文件
- `collaboration_sessions` - 实时协作
- `ai_cache` - AI缓存

### OpenSearch - 搜索引擎
- 全文搜索索引
- 内容推荐算法
- 用户行为分析

## 🔌 API使用示例

### 用户认证
```javascript
// 登录
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { token } = await response.json();
```

### AI文本生成
```javascript
// 生成文本
const response = await fetch('/api/v1/ai/text/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: '写一个关于AI的故事',
    max_length: 500,
    temperature: 0.7
  })
});
const result = await response.json();
```

### 实时协作
```javascript
// WebSocket连接
const ws = new WebSocket(`ws://localhost:8080/ws/project/1?token=${token}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('收到协作消息:', data);
};

// 发送内容更新
ws.send(JSON.stringify({
  type: 'content_update',
  data: { content: '更新的内容', position: { line: 1, column: 0 } }
}));
```

## 🚢 部署指南

### Docker部署
```bash
# 构建并启动所有服务
docker-compose -f docker/docker-compose.yml up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 生产环境配置

1. **环境变量配置**
```bash
# 后端环境变量
export MYSQL_HOST=your-mysql-host
export MONGODB_URI=your-mongodb-uri
export REDIS_HOST=your-redis-host
export JWT_SECRET=your-super-secret-key

# AI服务环境变量
export OPENAI_API_KEY=your-openai-key
export HUGGINGFACE_TOKEN=your-hf-token
```

2. **SSL证书配置**
```bash
# 将SSL证书放置到nginx配置目录
cp your-cert.pem docker/nginx/ssl/
cp your-key.pem docker/nginx/ssl/
```

## 🧪 测试

### 运行所有测试
```bash
# 前端测试
cd frontend && npm test

# 后端测试
cd backend && go test ./...

# AI服务测试
cd ai-service && python -m pytest

# 集成测试
./scripts/run-integration-tests.sh
```

## 📈 监控和维护

### 健康检查端点
- Frontend: http://localhost:3000/api/health
- Backend: http://localhost:8080/health
- AI Service: http://localhost:8000/health

### 日志查看
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f ai-service
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 创建 Pull Request

## 📞 获取帮助

- 📖 [完整文档](docs/)
- 🐛 [问题反馈](https://github.com/your-org/youcreator.ai/issues)
- 💬 [讨论区](https://github.com/your-org/youcreator.ai/discussions)
- 📧 联系邮箱: support@youcreator.ai

---

🎉 **恭喜！你已经成功设置了YouCreator.AI开发环境！**

现在你可以开始探索和开发这个强大的AI创作平台了。
