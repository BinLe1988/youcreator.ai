# YouCreator.AI API 文档

## 概述
YouCreator.AI 提供RESTful API和WebSocket接口，支持多模态AI创作功能。

## 基础信息
- **Base URL**: `http://localhost:8080/api/v1`
- **AI Service URL**: `http://localhost:8000/api/v1`
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON

## 认证

### 用户注册
```http
POST /auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

### 用户登录
```http
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

**响应**:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "string",
    "email": "string"
  }
}
```

## 项目管理

### 创建项目
```http
POST /projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "string",
  "type": "writing|painting|music|coding",
  "description": "string"
}
```

### 获取项目列表
```http
GET /projects
Authorization: Bearer {token}
```

### 获取项目详情
```http
GET /projects/{project_id}
Authorization: Bearer {token}
```

## AI创作服务

### 文本生成
```http
POST /ai/text/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "prompt": "string",
  "max_length": 1000,
  "temperature": 0.7,
  "model": "gpt-3.5-turbo"
}
```

### 图像生成
```http
POST /ai/image/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "prompt": "string",
  "width": 512,
  "height": 512,
  "steps": 20,
  "model": "stable-diffusion-v1-5"
}
```

### 音乐生成
```http
POST /ai/music/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "prompt": "string",
  "duration": 30,
  "genre": "string",
  "model": "musicgen-small"
}
```

### 代码生成
```http
POST /ai/code/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "prompt": "string",
  "language": "python|javascript|go|java",
  "model": "codellama-7b"
}
```

## 实时协作

### WebSocket连接
```javascript
const ws = new WebSocket('ws://localhost:8080/ws/project/{project_id}?token={jwt_token}');

// 监听消息
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

// 发送消息
ws.send(JSON.stringify({
  type: 'content_update',
  data: {
    content: 'updated content',
    position: { line: 1, column: 0 }
  }
}));
```

## 文件管理

### 上传文件
```http
POST /files/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: (binary)
project_id: string
```

### 下载文件
```http
GET /files/{file_id}
Authorization: Bearer {token}
```

## 搜索和推荐

### 搜索内容
```http
GET /search?q={query}&type={content_type}&limit={limit}
Authorization: Bearer {token}
```

### 获取推荐
```http
GET /recommendations?type={content_type}&project_id={project_id}
Authorization: Bearer {token}
```

## 错误处理

API使用标准HTTP状态码：

- `200` - 成功
- `201` - 创建成功
- `400` - 请求错误
- `401` - 未认证
- `403` - 权限不足
- `404` - 资源不存在
- `500` - 服务器错误

错误响应格式：
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  }
}
```

## 限流

API实施以下限流策略：
- 普通用户：100 requests/minute
- 高级用户：500 requests/minute
- AI生成：10 requests/minute

## SDK和示例

### JavaScript SDK
```javascript
import { YouCreatorClient } from '@youcreator/sdk';

const client = new YouCreatorClient({
  baseURL: 'http://localhost:8080',
  token: 'your_jwt_token'
});

// 生成文本
const result = await client.ai.generateText({
  prompt: 'Write a story about...',
  maxLength: 500
});
```

### Python SDK
```python
from youcreator_sdk import YouCreatorClient

client = YouCreatorClient(
    base_url='http://localhost:8080',
    token='your_jwt_token'
)

# 生成图像
result = client.ai.generate_image(
    prompt='A beautiful landscape',
    width=512,
    height=512
)
```
