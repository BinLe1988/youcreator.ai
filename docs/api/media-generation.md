# 媒体生成 API 文档

YouCreator.AI 媒体生成功能提供文字配图、文字配乐、图片配乐等AI驱动的创作工具。

## 基础信息

- **基础URL**: `http://localhost:8080/api/v1/media`
- **认证**: 可选（某些端点需要JWT Token）
- **内容类型**: `application/json` 或 `multipart/form-data`

## API 端点

### 1. 文字生成图片

根据文字描述生成图片。

**端点**: `POST /text-to-image`

**请求体**:
```json
{
  "text": "一个宁静的湖边小屋，夕阳西下，水面波光粼粼",
  "style": "realistic",
  "width": 512,
  "height": 512,
  "num_inference_steps": 20,
  "guidance_scale": 7.5
}
```

**参数说明**:
- `text` (必需): 图片描述文字
- `style` (可选): 图片风格，默认 "realistic"
  - `realistic`: 写实风格
  - `artistic`: 艺术风格
  - `cartoon`: 卡通风格
  - `sketch`: 素描风格
  - `oil_painting`: 油画风格
  - `watercolor`: 水彩风格
- `width` (可选): 图片宽度，默认 512，范围 256-1024
- `height` (可选): 图片高度，默认 512，范围 256-1024
- `num_inference_steps` (可选): 推理步数，默认 20，范围 10-50
- `guidance_scale` (可选): 引导强度，默认 7.5，范围 1.0-20.0

**响应**:
```json
{
  "success": true,
  "data": {
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "prompt": "一个宁静的湖边小屋，夕阳西下，水面波光粼粼, photorealistic, high quality, detailed",
    "style": "realistic",
    "dimensions": {
      "width": 512,
      "height": 512
    }
  }
}
```

### 2. 文字生成音乐

根据文字描述生成音乐。

**端点**: `POST /text-to-music`

**请求体**:
```json
{
  "text": "宁静的钢琴曲，带有温暖的情感，适合阅读时聆听",
  "duration": 10,
  "temperature": 1.0,
  "top_k": 250,
  "top_p": 0.0
}
```

**参数说明**:
- `text` (必需): 音乐描述文字
- `duration` (可选): 音乐时长(秒)，默认 10，范围 5-30
- `temperature` (可选): 生成温度，默认 1.0，范围 0.1-2.0
- `top_k` (可选): Top-K采样，默认 250，范围 50-500
- `top_p` (可选): Top-P采样，默认 0.0，范围 0.0-1.0

**响应**:
```json
{
  "success": true,
  "data": {
    "audio": "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEA...",
    "description": "宁静的钢琴曲，带有温暖的情感，适合阅读时聆听",
    "duration": 10,
    "sample_rate": 32000
  }
}
```

### 3. 图片生成音乐

根据图片内容生成匹配的音乐。

**端点**: `POST /image-to-music`

**请求体**:
```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
  "duration": 10,
  "temperature": 1.0
}
```

**参数说明**:
- `image_base64` (必需): 图片的base64编码数据
- `duration` (可选): 音乐时长(秒)，默认 10，范围 5-30
- `temperature` (可选): 生成温度，默认 1.0，范围 0.1-2.0

**响应**:
```json
{
  "success": true,
  "data": {
    "audio": "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEA...",
    "image_caption": "a peaceful lake with a small house at sunset",
    "music_description": "Create peaceful, warm, ambient music that captures the mood of: a peaceful lake with a small house at sunset",
    "duration": 10,
    "sample_rate": 32000
  }
}
```

### 4. 上传图片生成音乐

上传图片文件并生成音乐。

**端点**: `POST /upload-image-to-music`

**请求**: `multipart/form-data`
- `file`: 图片文件
- `duration`: 音乐时长(可选)
- `temperature`: 生成温度(可选)

**响应**: 同图片生成音乐

### 5. 批量生成

批量生成多种媒体内容。

**端点**: `POST /batch-generate`

**请求体**:
```json
{
  "requests": [
    {
      "id": "req1",
      "type": "text_to_image",
      "params": {
        "text": "美丽的风景",
        "style": "artistic"
      }
    },
    {
      "id": "req2", 
      "type": "text_to_music",
      "params": {
        "text": "轻松的背景音乐",
        "duration": 15
      }
    }
  ]
}
```

**响应**:
```json
[
  {
    "success": true,
    "data": { /* 图片生成结果 */ },
    "request_id": "req1"
  },
  {
    "success": true,
    "data": { /* 音乐生成结果 */ },
    "request_id": "req2"
  }
]
```

### 6. 获取可用风格

获取所有可用的图片生成风格。

**端点**: `GET /styles`

**响应**:
```json
{
  "success": true,
  "data": {
    "styles": [
      {
        "id": "realistic",
        "name": "写实风格",
        "description": "照片级真实感"
      },
      {
        "id": "artistic",
        "name": "艺术风格", 
        "description": "绘画艺术感"
      }
    ]
  }
}
```

### 7. 获取媒体生成能力

获取当前支持的媒体生成功能和限制。

**端点**: `GET /capabilities`

**响应**:
```json
{
  "success": true,
  "capabilities": {
    "text_to_image": {
      "supported": true,
      "styles": ["realistic", "artistic", "cartoon"],
      "max_resolution": {
        "width": 1024,
        "height": 1024
      },
      "inference_steps": {
        "min": 10,
        "max": 50
      }
    },
    "text_to_music": {
      "supported": true,
      "max_duration": 30,
      "min_duration": 5,
      "sample_rate": 32000,
      "formats": ["wav"]
    },
    "image_to_music": {
      "supported": true,
      "max_duration": 30,
      "min_duration": 5,
      "supported_formats": ["jpg", "jpeg", "png", "webp"],
      "max_file_size": "10MB"
    },
    "batch_processing": {
      "supported": true,
      "max_requests": 10,
      "timeout": "5 minutes"
    },
    "rate_limits": {
      "requests_per_minute": 10,
      "requests_per_hour": 100
    }
  }
}
```

## 错误响应

所有端点在出错时返回统一的错误格式：

```json
{
  "success": false,
  "error": "错误类型",
  "message": "详细错误信息"
}
```

**常见错误码**:
- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 需要认证
- `413 Payload Too Large`: 文件过大
- `429 Too Many Requests`: 请求频率过高
- `500 Internal Server Error`: 服务器内部错误

## 使用示例

### JavaScript/TypeScript

```typescript
// 文字生成图片
const generateImage = async (text: string) => {
  const response = await fetch('/api/v1/media/text-to-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      style: 'realistic',
      width: 512,
      height: 512
    })
  });
  
  const result = await response.json();
  return result;
};

// 文字生成音乐
const generateMusic = async (text: string) => {
  const response = await fetch('/api/v1/media/text-to-music', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      duration: 10,
      temperature: 1.0
    })
  });
  
  const result = await response.json();
  return result;
};

// 上传图片生成音乐
const uploadImageForMusic = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('duration', '10');
  formData.append('temperature', '1.0');
  
  const response = await fetch('/api/v1/media/upload-image-to-music', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  return result;
};
```

### Python

```python
import requests
import base64

# 文字生成图片
def generate_image(text: str):
    url = "http://localhost:8080/api/v1/media/text-to-image"
    data = {
        "text": text,
        "style": "realistic",
        "width": 512,
        "height": 512
    }
    response = requests.post(url, json=data)
    return response.json()

# 文字生成音乐
def generate_music(text: str):
    url = "http://localhost:8080/api/v1/media/text-to-music"
    data = {
        "text": text,
        "duration": 10,
        "temperature": 1.0
    }
    response = requests.post(url, json=data)
    return response.json()

# 图片生成音乐
def image_to_music(image_path: str):
    with open(image_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode()
    
    url = "http://localhost:8080/api/v1/media/image-to-music"
    data = {
        "image_base64": f"data:image/jpeg;base64,{image_data}",
        "duration": 10,
        "temperature": 1.0
    }
    response = requests.post(url, json=data)
    return response.json()
```

### cURL

```bash
# 文字生成图片
curl -X POST "http://localhost:8080/api/v1/media/text-to-image" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "一个宁静的湖边小屋，夕阳西下",
    "style": "realistic",
    "width": 512,
    "height": 512
  }'

# 文字生成音乐
curl -X POST "http://localhost:8080/api/v1/media/text-to-music" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "宁静的钢琴曲",
    "duration": 10,
    "temperature": 1.0
  }'

# 上传图片生成音乐
curl -X POST "http://localhost:8080/api/v1/media/upload-image-to-music" \
  -F "file=@/path/to/image.jpg" \
  -F "duration=10" \
  -F "temperature=1.0"
```

## 性能优化建议

1. **图片生成**:
   - 使用较小的尺寸可以更快生成
   - 减少推理步数可以加快速度但可能影响质量
   - 批量生成时建议限制并发数量

2. **音乐生成**:
   - 较短的时长通常质量更好
   - 适当的温度值(0.8-1.2)通常效果最佳
   - 避免过于复杂的描述

3. **图片配乐**:
   - 压缩图片可以加快上传和处理速度
   - 清晰的图片内容有助于生成更匹配的音乐

## 限制和注意事项

1. **文件大小限制**: 图片文件最大 10MB
2. **时长限制**: 音乐生成最长 30 秒
3. **并发限制**: 每分钟最多 10 次请求
4. **超时设置**: 生成请求最长等待 5 分钟
5. **格式支持**: 
   - 图片: JPG, PNG, WebP, GIF
   - 音频: WAV 格式输出

## 故障排除

1. **生成失败**: 检查输入参数是否符合要求
2. **超时错误**: 尝试减少生成复杂度或重试
3. **内存不足**: 降低图片分辨率或音乐时长
4. **模型加载慢**: 首次使用需要下载模型，请耐心等待
