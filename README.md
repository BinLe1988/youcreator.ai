# YouCreator.AI
专注于创作的AI应用 - 基于AI的多模态创作编辑器

## 🌟 项目概述

YouCreator.AI 是一个集成了多种AI能力的创作平台，支持：
- 📝 **智能写作** - AI辅助文章、小说、剧本创作
- 🎨 **AI绘画** - 文本到图像生成，艺术创作
- 🎵 **音乐创作** - AI协助旋律、和声创作
- 💻 **代码编写** - 智能代码生成、调试和优化

## 🏗️ 技术架构

### 四层架构设计
1. **表现层** - Next.js 14 前端应用
2. **业务逻辑层** - Go 后端服务
3. **数据访问层** - MySQL + MongoDB + OpenSearch
4. **AI模型层** - Python AI服务

### 技术栈
- **前端**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **后端**: Go 1.21+, Gin框架, WebSocket
- **AI服务**: Python 3.11+, FastAPI, PyTorch, Transformers
- **数据库**: MySQL 8.0, MongoDB 6.0, OpenSearch 2.x
- **缓存**: Redis 7
- **部署**: Docker, Kubernetes, Nginx

## 🚀 快速开始

### 环境要求
- Node.js 18+
- Go 1.21+
- Python 3.11+
- Docker & Docker Compose

### 一键启动开发环境
```bash
# 克隆项目
git clone https://github.com/your-org/youcreator.ai.git
cd youcreator.ai

# 运行开发环境设置脚本
./scripts/dev-setup.sh
```

### 手动启动服务

1. **启动数据库服务**
```bash
docker-compose -f docker/docker-compose.yml up -d mysql mongodb opensearch redis
```

2. **启动AI服务**
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

3. **启动后端服务**
```bash
cd backend
go mod tidy
go run cmd/main.go
```

4. **启动前端服务**
```bash
cd frontend
npm install
npm run dev
```

### 访问应用
- 🌐 前端应用: http://localhost:3000
- 📚 后端API: http://localhost:8080
- 🤖 AI服务: http://localhost:8000
- 📊 API文档: http://localhost:8080/docs

## 📁 项目结构

```
youcreator.ai/
├── frontend/           # Next.js 前端应用
├── backend/           # Go 后端服务
├── ai-service/        # Python AI服务
├── database/          # 数据库初始化脚本
├── docker/           # Docker配置文件
├── k8s/              # Kubernetes部署文件
├── docs/             # 项目文档
└── scripts/          # 构建和部署脚本
```

## 🔧 开发指南

### 前端开发
- 使用 Next.js App Router
- 组件库基于 Tailwind CSS
- 状态管理使用 Zustand
- 实时编辑器集成 Monaco Editor 和 TipTap

### 后端开发
- 遵循 Clean Architecture 原则
- 使用 Gin 框架构建 RESTful API
- WebSocket 支持实时协作
- JWT 认证和权限管理

### AI服务开发
- FastAPI 异步框架
- 支持多种AI模型集成
- 模型缓存和优化
- GPU加速支持

## 🗄️ 数据库设计

### MySQL - 结构化数据
- 用户管理
- 项目元数据
- 权限控制

### MongoDB - 文档数据
- 创作内容
- 版本历史
- 媒体文件

### OpenSearch - 搜索引擎
- 全文搜索
- 内容推荐
- 分析统计

## 🔌 API文档

详细的API文档请查看 [API Documentation](docs/api/README.md)

主要端点：
- `POST /api/v1/auth/login` - 用户登录
- `GET /api/v1/projects` - 获取项目列表
- `POST /api/v1/ai/text/generate` - 文本生成
- `POST /api/v1/ai/image/generate` - 图像生成
- `WebSocket /ws/project/{id}` - 实时协作

## 🚢 部署指南

### Docker部署
```bash
# 构建并启动所有服务
docker-compose -f docker/docker-compose.yml up -d

# 查看服务状态
docker-compose ps
```

### Kubernetes部署
```bash
# 应用Kubernetes配置
kubectl apply -f k8s/

# 查看部署状态
kubectl get pods -n youcreator
```

## 🧪 测试

### 运行测试
```bash
# 前端测试
cd frontend && npm test

# 后端测试
cd backend && go test ./...

# AI服务测试
cd ai-service && python -m pytest
```

## 📈 监控和日志

- **应用监控**: Prometheus + Grafana
- **日志聚合**: ELK Stack
- **错误追踪**: Sentry
- **性能监控**: APM工具

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- OpenAI - GPT模型
- Stability AI - Stable Diffusion
- Meta - MusicGen
- Hugging Face - Transformers库

## 📞 联系我们

- 项目主页: https://github.com/your-org/youcreator.ai
- 问题反馈: https://github.com/your-org/youcreator.ai/issues
- 邮箱: contact@youcreator.ai

---

⭐ 如果这个项目对你有帮助，请给我们一个星标！
