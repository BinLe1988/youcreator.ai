# 🏠 YouCreator.AI 开源模型配置指南

## 🎯 开源模型方案优势

✅ **完全免费** - 无API调用费用  
✅ **数据隐私** - 所有处理在本地进行  
✅ **离线运行** - 无需网络连接  
✅ **可定制化** - 可以微调和优化模型  
✅ **无限制** - 没有API调用次数限制  

## 📋 推荐的开源模型

### 📝 文本生成 - Qwen2-1.5B-Instruct
- **开发者**: 阿里云
- **大小**: ~3GB
- **特点**: 轻量级中文大语言模型，支持多轮对话
- **适用**: 智能写作、文章创作、对话生成

### 🎨 图像生成 - Stable Diffusion v1.5
- **开发者**: Stability AI
- **大小**: ~4GB  
- **特点**: 经典开源图像生成模型，质量优秀
- **适用**: AI绘画、艺术创作、图像生成

### 💻 代码生成 - CodeGPT-small-py
- **开发者**: Microsoft
- **大小**: ~500MB
- **特点**: 专门针对Python代码生成优化
- **适用**: 代码编写、调试、优化

## 🔧 快速配置步骤

### 1. 进入AI服务目录
```bash
cd /Users/richardl/projects/youcreator.ai/ai-service
source venv/bin/activate
```

### 2. 安装AI模型依赖
```bash
pip install -r requirements.txt
```

### 3. 运行开源模型配置脚本
```bash
python download_opensource_models.py
```

这个脚本会：
- ✅ 检查系统要求 (GPU、内存、磁盘空间)
- ✅ 安装必要的Python包
- ✅ 下载推荐的开源模型
- ✅ 自动配置模型路径

### 4. 启动AI服务
```bash
python main.py
```

## 🎮 硬件要求

### 最低配置
- **GPU**: GTX 1060 6GB 或同等性能
- **内存**: 16GB RAM
- **存储**: 20GB 可用空间
- **系统**: 支持CUDA的NVIDIA显卡

### 推荐配置  
- **GPU**: RTX 3060 12GB 或更高
- **内存**: 32GB RAM
- **存储**: 50GB+ SSD
- **系统**: Ubuntu 20.04+ 或 Windows 10+

### CPU模式 (无GPU)
- **CPU**: 8核心以上
- **内存**: 32GB+ RAM
- **注意**: 生成速度会显著降低

## 🔑 API密钥配置

虽然使用开源模型，但仍需要一些API密钥用于模型下载和备用服务：

### 1. Hugging Face Token (必需)
```bash
# 访问 https://huggingface.co/settings/tokens
# 创建一个 Read token
HUGGINGFACE_TOKEN=hf_your_token_here
```

### 2. 备用API服务 (可选)
```bash
# 免费的Groq API (LLaMA模型)
GROQ_API_KEY=gsk_your_groq_key_here

# Together AI (免费额度)
TOGETHER_API_KEY=your_together_key_here
```

## 📦 手动下载模型

如果自动下载失败，可以手动下载：

### 下载文本模型
```bash
python download_opensource_models.py --type text
```

### 下载图像模型
```bash
python download_opensource_models.py --type image
```

### 下载代码模型
```bash
python download_opensource_models.py --type code
```

### 下载所有模型
```bash
python download_opensource_models.py --all
```

## 🚀 启动和测试

### 1. 启动AI服务
```bash
cd /Users/richardl/projects/youcreator.ai/ai-service
source venv/bin/activate
python main.py
```

### 2. 检查模型状态
```bash
curl http://localhost:8000/api/v1/models/status
```

### 3. 测试文本生成
```bash
curl -X POST "http://localhost:8000/api/v1/text/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "写一个关于AI的故事", "max_length": 200}'
```

### 4. 测试图像生成
```bash
curl -X POST "http://localhost:8000/api/v1/image/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "一个美丽的日落风景", "width": 512, "height": 512}' \
  --output generated_image.png
```

## 🔧 性能优化

### GPU内存优化
```env
# 在 .env 文件中设置
GPU_MEMORY_FRACTION=0.7
USE_GPU=true
CUDA_VISIBLE_DEVICES=0
```

### 并发控制
```env
# 限制并发请求数量
MAX_CONCURRENT_REQUESTS=3
REQUEST_TIMEOUT=300
```

### 模型缓存
```env
# 启用模型缓存
ENABLE_MODEL_CACHE=true
CACHE_SIZE_GB=4
```

## 🐛 故障排除

### 问题1: CUDA内存不足
```bash
# 解决方案1: 降低GPU内存使用
export GPU_MEMORY_FRACTION=0.5

# 解决方案2: 使用CPU模式
export USE_GPU=false
```

### 问题2: 模型下载失败
```bash
# 检查网络连接
ping huggingface.co

# 使用镜像站点
export HF_ENDPOINT=https://hf-mirror.com
```

### 问题3: 依赖安装失败
```bash
# 更新pip
pip install --upgrade pip

# 使用清华源
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

## 📊 模型性能对比

| 模型类型 | 开源模型 | 质量 | 速度 | 成本 |
|---------|---------|------|------|------|
| 文本生成 | Qwen2-1.5B | ⭐⭐⭐⭐ | 快 | 免费 |
| 图像生成 | SD v1.5 | ⭐⭐⭐⭐⭐ | 中等 | 免费 |
| 代码生成 | CodeGPT | ⭐⭐⭐ | 快 | 免费 |

## 🎉 完成配置

配置完成后，你将拥有：

✅ **完全本地化的AI服务**  
✅ **无API费用的创作体验**  
✅ **隐私保护的数据处理**  
✅ **可定制的模型参数**  

现在可以在前端界面体验完整的AI创作功能了！

## 🔗 相关链接

- [Hugging Face](https://huggingface.co/) - 模型下载
- [Qwen2模型](https://huggingface.co/Qwen/Qwen2-1.5B-Instruct) - 文本模型
- [Stable Diffusion](https://huggingface.co/runwayml/stable-diffusion-v1-5) - 图像模型
- [CodeGPT](https://huggingface.co/microsoft/CodeGPT-small-py) - 代码模型

---

🎯 **开源模型配置完成后，你就拥有了一个完全免费、隐私安全的AI创作平台！**
