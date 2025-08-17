# 项目目录结构

```
youcreator.ai/
├── frontend/                 # Next.js 前端应用
│   ├── src/
│   │   ├── app/             # App Router
│   │   ├── components/      # React 组件
│   │   ├── lib/            # 工具库
│   │   ├── hooks/          # 自定义 Hooks
│   │   └── types/          # TypeScript 类型定义
│   ├── public/             # 静态资源
│   ├── package.json
│   └── next.config.js
│
├── backend/                 # Go 后端服务
│   ├── cmd/                # 应用入口
│   ├── internal/           # 内部包
│   │   ├── api/           # API 处理器
│   │   ├── service/       # 业务逻辑
│   │   ├── repository/    # 数据访问
│   │   ├── model/         # 数据模型
│   │   └── config/        # 配置管理
│   ├── pkg/               # 公共包
│   ├── migrations/        # 数据库迁移
│   ├── go.mod
│   └── Dockerfile
│
├── ai-service/             # Python AI 服务
│   ├── src/
│   │   ├── models/        # AI 模型封装
│   │   ├── services/      # AI 服务逻辑
│   │   ├── api/          # FastAPI 路由
│   │   └── utils/        # 工具函数
│   ├── requirements.txt
│   ├── Dockerfile
│   └── main.py
│
├── database/               # 数据库相关
│   ├── mysql/             # MySQL 初始化脚本
│   ├── mongodb/           # MongoDB 初始化
│   └── opensearch/        # OpenSearch 配置
│
├── docker/                 # Docker 配置
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   └── nginx/             # 反向代理配置
│
├── k8s/                   # Kubernetes 部署文件
│   ├── frontend/
│   ├── backend/
│   ├── ai-service/
│   └── databases/
│
├── docs/                  # 项目文档
│   ├── api/              # API 文档
│   ├── deployment/       # 部署文档
│   └── development/      # 开发文档
│
├── scripts/               # 构建和部署脚本
│   ├── build.sh
│   ├── deploy.sh
│   └── dev-setup.sh
│
├── .github/              # GitHub Actions
│   └── workflows/
│
├── README.md
├── architecture.md
└── project-structure.md
```
