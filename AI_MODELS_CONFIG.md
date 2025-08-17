# AI模型配置指南

## 🎯 模型需求概览

YouCreator.AI需要以下四类AI模型：

### 1. 📝 文本生成模型
- **用途**: 智能写作、文章创作、剧本生成
- **推荐模型**: 
  - OpenAI GPT-3.5/GPT-4 (API)
  - Anthropic Claude (API)
  - 本地部署: LLaMA 2, ChatGLM, Qwen
- **配置需求**: API密钥或本地模型文件

### 2. 🎨 图像生成模型
- **用途**: AI绘画、艺术创作、图像生成
- **推荐模型**:
  - Stable Diffusion (本地部署)
  - DALL-E 2/3 (OpenAI API)
  - Midjourney (API)
- **配置需求**: 模型权重文件或API密钥

### 3. 🎵 音乐生成模型
- **用途**: 音乐创作、旋律生成
- **推荐模型**:
  - MusicGen (Meta)
  - AudioCraft
  - Jukebox (OpenAI)
- **配置需求**: 预训练模型文件

### 4. 💻 代码生成模型
- **用途**: 代码编写、调试、优化
- **推荐模型**:
  - CodeLlama
  - GitHub Copilot (API)
  - StarCoder
- **配置需求**: 模型文件或API访问

## 🔧 配置方案

### 方案一：API服务 (推荐新手)
**优点**: 简单快速，无需本地GPU
**缺点**: 需要付费，依赖网络

### 方案二：本地部署 (推荐进阶)
**优点**: 完全控制，无API费用
**缺点**: 需要强大硬件，配置复杂

### 方案三：混合模式 (推荐生产)
**优点**: 灵活性高，成本可控
**缺点**: 配置相对复杂

## 📋 详细配置步骤

### 🚀 快速开始 - API方案

#### 1. OpenAI配置
```env
# .env文件
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL_TEXT=gpt-3.5-turbo
OPENAI_MODEL_IMAGE=dall-e-3
OPENAI_MODEL_CODE=gpt-4
```

#### 2. 其他API服务
```env
# Anthropic Claude
ANTHROPIC_API_KEY=your-anthropic-key

# Stability AI (Stable Diffusion)
STABILITY_API_KEY=your-stability-key

# Replicate (多种模型)
REPLICATE_API_TOKEN=your-replicate-token
```

### 🏠 本地部署方案

#### 1. 硬件要求
```
最低配置:
- GPU: RTX 3060 (12GB VRAM)
- RAM: 16GB
- 存储: 100GB SSD

推荐配置:
- GPU: RTX 4080/4090 (16GB+ VRAM)
- RAM: 32GB+
- 存储: 500GB+ NVMe SSD
```

#### 2. 文本模型 - LLaMA 2
```bash
# 安装transformers
pip install transformers torch accelerate

# 下载模型 (需要申请访问权限)
huggingface-cli login
huggingface-cli download meta-llama/Llama-2-7b-chat-hf
```

#### 3. 图像模型 - Stable Diffusion
```bash
# 安装diffusers
pip install diffusers transformers accelerate

# 下载模型
from diffusers import StableDiffusionPipeline
pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16
)
```

#### 4. 音乐模型 - MusicGen
```bash
# 安装audiocraft
pip install audiocraft

# 下载模型
from audiocraft.models import MusicGen
model = MusicGen.get_pretrained('musicgen-small')
```

#### 5. 代码模型 - CodeLlama
```bash
# 下载CodeLlama
huggingface-cli download codellama/CodeLlama-7b-Python-hf
```

## 🔐 环境变量配置

创建完整的 `.env` 文件：

```env
# ===========================================
# YouCreator.AI 模型配置
# ===========================================

# 服务配置
HOST=0.0.0.0
PORT=8000
DEBUG=true

# 模型存储路径
MODEL_CACHE_DIR=./models
HF_HOME=./models/huggingface

# ===========================================
# API服务配置
# ===========================================

# OpenAI
OPENAI_API_KEY=sk-your-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL_TEXT=gpt-3.5-turbo
OPENAI_MODEL_IMAGE=dall-e-3
OPENAI_MODEL_CODE=gpt-4

# Anthropic Claude
ANTHROPIC_API_KEY=your-anthropic-key

# Stability AI
STABILITY_API_KEY=your-stability-key

# Replicate
REPLICATE_API_TOKEN=your-replicate-token

# ===========================================
# 本地模型配置
# ===========================================

# 文本生成模型
TEXT_MODEL_PATH=./models/llama-2-7b-chat
TEXT_MODEL_TYPE=llama2  # llama2, chatglm, qwen

# 图像生成模型
IMAGE_MODEL_PATH=./models/stable-diffusion-v1-5
IMAGE_MODEL_TYPE=stable_diffusion

# 音乐生成模型
MUSIC_MODEL_PATH=./models/musicgen-small
MUSIC_MODEL_TYPE=musicgen

# 代码生成模型
CODE_MODEL_PATH=./models/codellama-7b-python
CODE_MODEL_TYPE=codellama

# ===========================================
# 模型参数配置
# ===========================================

# GPU配置
CUDA_VISIBLE_DEVICES=0
USE_GPU=true
GPU_MEMORY_FRACTION=0.8

# 生成参数
MAX_TEXT_LENGTH=2000
MAX_IMAGE_SIZE=1024
MAX_MUSIC_DURATION=60
MAX_CODE_LENGTH=5000

# 并发限制
MAX_CONCURRENT_REQUESTS=5
REQUEST_TIMEOUT=300

# 缓存配置
ENABLE_MODEL_CACHE=true
CACHE_SIZE_GB=8
```

## 📦 模型管理脚本

创建模型下载和管理脚本：

```bash
#!/bin/bash
# download_models.sh

echo "🚀 开始下载AI模型..."

# 创建模型目录
mkdir -p models/{text,image,music,code}

# 下载文本模型
echo "📝 下载文本生成模型..."
huggingface-cli download microsoft/DialoGPT-medium --local-dir models/text/dialogpt

# 下载图像模型
echo "🎨 下载图像生成模型..."
huggingface-cli download runwayml/stable-diffusion-v1-5 --local-dir models/image/sd-v1-5

# 下载音乐模型
echo "🎵 下载音乐生成模型..."
huggingface-cli download facebook/musicgen-small --local-dir models/music/musicgen

# 下载代码模型
echo "💻 下载代码生成模型..."
huggingface-cli download microsoft/CodeGPT-small-py --local-dir models/code/codegpt

echo "✅ 模型下载完成！"
```

## 🎛️ 模型选择建议

### 💰 成本考虑
1. **免费方案**: 使用开源模型 + 本地部署
2. **低成本方案**: OpenAI API + 本地图像模型
3. **高性能方案**: 全API服务
4. **企业方案**: 本地部署 + API备份

### 🚀 性能考虑
1. **文本**: GPT-4 > Claude > LLaMA 2 > ChatGLM
2. **图像**: DALL-E 3 > Midjourney > Stable Diffusion
3. **音乐**: MusicGen > AudioCraft > Jukebox
4. **代码**: GPT-4 > CodeLlama > StarCoder

### 🔒 隐私考虑
- **高隐私**: 全本地部署
- **中等隐私**: 混合模式
- **低隐私**: 全API服务

## 🛠️ 配置验证

创建模型测试脚本：

```python
# test_models.py
import asyncio
from src.models.model_manager import ModelManager

async def test_all_models():
    manager = ModelManager()
    await manager.initialize()
    
    # 测试文本生成
    text_result = await manager.generate_text("Hello, world!")
    print(f"文本生成: {text_result}")
    
    # 测试图像生成
    image_result = await manager.generate_image("A beautiful sunset")
    print(f"图像生成: {len(image_result)} bytes")
    
    # 测试代码生成
    code_result = await manager.generate_code("fibonacci function", language="python")
    print(f"代码生成: {code_result}")

if __name__ == "__main__":
    asyncio.run(test_all_models())
```

## 📊 监控和优化

### 性能监控
- GPU使用率
- 内存占用
- 生成速度
- 错误率

### 优化建议
- 模型量化 (INT8/FP16)
- 批处理优化
- 缓存策略
- 负载均衡

---

## 🎯 推荐配置方案

### 🥉 入门方案 (API)
```env
OPENAI_API_KEY=your-key
STABILITY_API_KEY=your-key
# 成本: ~$50/月
```

### 🥈 进阶方案 (混合)
```env
# 本地: Stable Diffusion + MusicGen
# API: OpenAI GPT-3.5
# 成本: ~$20/月 + 硬件
```

### 🥇 专业方案 (本地)
```env
# 全本地部署
# 成本: 硬件投资 + 电费
```

选择适合你的方案，我可以帮你详细配置！
