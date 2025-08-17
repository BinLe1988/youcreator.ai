# 🎨 YouCreator.AI 多模态功能指南

## 🌟 新功能概览

YouCreator.AI现在支持强大的多模态AI功能：

### 🖼️ 文字配图
为任何文字内容自动生成匹配的图片

### 🎶 文字配乐  
为文字内容生成合适的背景音乐

### 🎵 图片配乐
为图片生成匹配的背景音乐

### 🎯 完整多模态内容
一键生成文字+配图+配乐的完整创作

## 🚀 快速开始

### 1. 启动多模态服务
```bash
cd /Users/richardl/projects/youcreator.ai/ai-service
source venv/bin/activate
python main.py
```

### 2. 访问多模态API
- **API文档**: http://localhost:8000/docs
- **功能演示**: http://localhost:8000/multimodal-demo
- **服务状态**: http://localhost:8000/api/v1/multimodal/multimodal-status

## 🎨 功能详解

### 📝 文字配图 (Text-to-Image)

**功能**: 为文字内容生成配图
**API**: `POST /api/v1/multimodal/text-to-image`

**示例请求**:
```bash
curl -X POST "http://localhost:8000/api/v1/multimodal/text-to-image" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "一个宁静的湖边小屋，夕阳西下，远山如黛",
    "style": "realistic",
    "width": 512,
    "height": 512
  }' \
  --output generated_image.png
```

**支持的风格**:
- `realistic` - 写实风格 (照片级效果)
- `artistic` - 艺术风格 (绘画效果)
- `cartoon` - 卡通风格 (可爱风格)
- `abstract` - 抽象风格 (抽象艺术)
- `vintage` - 复古风格 (怀旧效果)
- `minimalist` - 简约风格 (现代简洁)

**智能分析**:
- 自动提取关键词
- 识别场景类型 (室内/室外/风景等)
- 分析情绪氛围
- 匹配合适的视觉风格

### 🎵 文字配乐 (Text-to-Music)

**功能**: 为文字内容生成背景音乐
**API**: `POST /api/v1/multimodal/text-to-music`

**示例请求**:
```bash
curl -X POST "http://localhost:8000/api/v1/multimodal/text-to-music" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "激动人心的冒险故事，英雄踏上未知的征程",
    "duration": 30,
    "style": "orchestral"
  }' \
  --output generated_music.wav
```

**支持的风格**:
- `ambient` - 环境音乐 (轻柔背景)
- `orchestral` - 管弦乐 (宏大史诗)
- `electronic` - 电子音乐 (现代科技)
- `acoustic` - 原声音乐 (温暖自然)
- `jazz` - 爵士乐 (优雅复古)
- `classical` - 古典音乐 (典雅正式)

**智能匹配**:
- 情感分析 (快乐/悲伤/激动/平静)
- 节拍判断 (快/中/慢)
- 类型推荐 (根据内容主题)

### 🖼️ 图片配乐 (Image-to-Music)

**功能**: 为图片生成匹配的背景音乐
**API**: `POST /api/v1/multimodal/image-to-music`

**方式1 - 图片描述**:
```bash
curl -X POST "http://localhost:8000/api/v1/multimodal/image-to-music" \
  -H "Content-Type: application/json" \
  -d '{
    "image_description": "宁静的森林风景，阳光透过树叶洒下",
    "duration": 45
  }' \
  --output image_music.wav
```

**方式2 - 上传图片**:
```bash
curl -X POST "http://localhost:8000/api/v1/multimodal/upload-image-for-music" \
  -F "file=@your_image.jpg" \
  -F "duration=30" \
  --output uploaded_image_music.wav
```

### 🎯 完整多模态内容 (Complete Content)

**功能**: 一键生成文字+配图+配乐
**API**: `POST /api/v1/multimodal/complete-content`

**示例请求**:
```bash
curl -X POST "http://localhost:8000/api/v1/multimodal/complete-content" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "在遥远的星球上，一座水晶城市闪闪发光",
    "include_image": true,
    "include_music": true,
    "image_style": "artistic",
    "music_duration": 60,
    "image_width": 768,
    "image_height": 512
  }'
```

**返回格式**:
```json
{
  "success": true,
  "data": {
    "text": "原始文字内容",
    "image": {
      "data": "base64编码的图片数据",
      "format": "png",
      "size": 123456
    },
    "music": {
      "data": "base64编码的音频数据", 
      "format": "wav",
      "size": 654321
    },
    "metadata": {
      "style_analysis": {
        "mood": "mysterious",
        "genre": "sci-fi",
        "visual_style": "artistic",
        "music_style": "electronic"
      },
      "generation_time": 15.6
    }
  }
}
```

## 🎛️ 高级功能

### 📊 风格分析
**API**: `GET /api/v1/multimodal/analyze-text-style?text=你的文字内容`

自动分析文本并推荐最佳的图像和音乐风格：
```bash
curl "http://localhost:8000/api/v1/multimodal/analyze-text-style?text=神秘的古堡在月光下显得格外阴森"
```

### 🎨 支持的风格列表
**API**: `GET /api/v1/multimodal/supported-styles`

获取所有支持的图像和音乐风格：
```bash
curl "http://localhost:8000/api/v1/multimodal/supported-styles"
```

### 📈 服务状态监控
**API**: `GET /api/v1/multimodal/multimodal-status`

检查多模态服务的运行状态：
```bash
curl "http://localhost:8000/api/v1/multimodal/multimodal-status"
```

## 🔧 配置选项

### 🎨 图像生成配置
```env
# 默认图像尺寸
IMAGE_WIDTH=512
IMAGE_HEIGHT=512

# 生成步数 (影响质量和速度)
IMAGE_STEPS=20

# 引导强度 (影响与提示的匹配度)
IMAGE_GUIDANCE=7.5

# 默认风格
DEFAULT_IMAGE_STYLE=realistic
```

### 🎵 音乐生成配置
```env
# 默认时长 (秒)
MUSIC_DURATION=30

# 最大时长
MAX_MUSIC_DURATION=120

# 生成温度 (影响创意度)
MUSIC_TEMPERATURE=1.0

# 默认风格
DEFAULT_MUSIC_STYLE=ambient
```

## 🎯 使用场景

### 📚 内容创作
- **博客文章**: 自动生成配图和背景音乐
- **小说写作**: 为章节生成插图和氛围音乐
- **剧本创作**: 场景配图和情绪音乐

### 🎬 媒体制作
- **视频制作**: 生成缩略图和背景音乐
- **播客**: 为节目生成封面和片头音乐
- **演示文稿**: 自动配图和背景音乐

### 🎨 艺术创作
- **数字艺术**: 文字转图像创作
- **音乐创作**: 基于主题生成旋律
- **多媒体艺术**: 综合视听作品

### 📱 应用开发
- **游戏开发**: 生成场景图片和背景音乐
- **应用界面**: 自动生成图标和音效
- **营销材料**: 广告图片和宣传音乐

## 🔍 智能匹配算法

### 文本分析
- **关键词提取**: 识别视觉和听觉元素
- **情感分析**: 检测情绪倾向
- **场景识别**: 判断环境和氛围
- **风格推断**: 推荐合适的艺术风格

### 内容匹配
- **视觉匹配**: 文字→图像风格映射
- **听觉匹配**: 情感→音乐风格映射
- **跨模态匹配**: 图像→音乐风格映射

## 🚀 性能优化

### 并行生成
- 图像和音乐可以并行生成
- 减少总体等待时间
- 提高用户体验

### 智能缓存
- 相似内容复用生成结果
- 减少重复计算
- 提高响应速度

### 渐进式加载
- 优先返回文本分析结果
- 图像和音乐异步生成
- 实时更新生成状态

## 🛠️ 故障排除

### 常见问题

**问题1**: 图像生成失败
```bash
# 检查图像服务状态
curl "http://localhost:8000/api/v1/multimodal/multimodal-status"

# 解决方案: 配置Stability AI或Hugging Face API密钥
```

**问题2**: 音乐生成超时
```bash
# 减少音乐时长
{
  "duration": 15  // 从30秒减少到15秒
}
```

**问题3**: 内存不足
```bash
# 减少并发请求数
MAX_MULTIMODAL_REQUESTS=1
```

### 日志调试
```bash
# 查看详细日志
tail -f ai-service/logs/multimodal.log

# 检查错误信息
grep "ERROR" ai-service/logs/app.log
```

## 📊 API限制

### 请求限制
- **图像生成**: 最大1024x1024像素
- **音乐生成**: 最大120秒
- **并发请求**: 最多3个同时进行
- **文件大小**: 图片最大10MB，音频最大50MB

### 速率限制
- **免费用户**: 每小时50次请求
- **注册用户**: 每小时200次请求
- **高级用户**: 无限制

## 🎉 示例项目

### 博客自动配图
```python
import requests

def auto_illustrate_blog(article_text):
    response = requests.post(
        "http://localhost:8000/api/v1/multimodal/text-to-image",
        json={
            "text": article_text,
            "style": "realistic",
            "width": 800,
            "height": 400
        }
    )
    
    with open("blog_image.png", "wb") as f:
        f.write(response.content)
```

### 故事配乐生成
```python
def generate_story_music(story_text):
    response = requests.post(
        "http://localhost:8000/api/v1/multimodal/text-to-music",
        json={
            "text": story_text,
            "duration": 60,
            "style": "orchestral"
        }
    )
    
    with open("story_music.wav", "wb") as f:
        f.write(response.content)
```

---

## 🎯 总结

YouCreator.AI的多模态功能为创作者提供了前所未有的便利：

**✅ 核心优势**:
- 🎨 智能内容匹配
- 🔄 多提供商支持
- 🚀 并行生成优化
- 🧠 风格自动分析

**🎯 立即体验**:
1. 启动多模态服务
2. 访问API文档
3. 尝试不同的创作场景
4. 探索无限创意可能！

---

🎨 **让AI为你的创作插上翅膀！** 🎵
