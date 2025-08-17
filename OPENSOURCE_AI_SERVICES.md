# 🌟 开源AI服务集成指南

## 🎯 多提供商架构优势

YouCreator.AI现在支持多个开源AI服务，提供：
- 🔄 **自动故障转移**: 一个服务不可用时自动切换
- 💰 **成本优化**: 优先使用免费服务
- 🚀 **高可用性**: 多重备份确保服务不中断
- 🔓 **开源优先**: 支持开源AI生态

## 🤖 支持的AI服务提供商

### 1. 🤗 Hugging Face (推荐 - 免费)
**优势**: 完全免费，模型丰富，社区活跃
**配置**: 只需Hugging Face Token
```env
HUGGINGFACE_TOKEN=hf_your_token_here
```

**可用模型**:
- 文本生成: DialoGPT, BlenderBot, FLAN-T5
- 代码生成: CodeGPT, CodeBERT, CodeGen

**获取Token**: https://huggingface.co/settings/tokens

### 2. 🤝 Together AI (推荐 - $25免费额度)
**优势**: 高质量开源模型，$25免费额度
**配置**:
```env
TOGETHER_API_KEY=your_together_key_here
```

**可用模型**:
- LLaMA-2-7b-chat
- Mistral-7B-Instruct
- CodeLlama-7b-Python
- Mixtral-8x7B

**注册**: https://api.together.xyz/

### 3. 🌐 OpenRouter (可选 - 多模型访问)
**优势**: 访问多种开源模型，按使用付费
**配置**:
```env
OPENROUTER_API_KEY=your_openrouter_key_here
```

**可用模型**:
- Meta LLaMA-3 (免费)
- Mistral-7B (免费)
- WizardLM-2

**注册**: https://openrouter.ai/

### 4. 🏠 Ollama (可选 - 本地部署)
**优势**: 完全本地运行，隐私保护，无API费用
**配置**:
```env
OLLAMA_BASE_URL=http://localhost:11434
```

**安装Ollama**:
```bash
# macOS
brew install ollama

# 启动服务
ollama serve

# 下载模型
ollama pull llama2
ollama pull codellama
ollama pull mistral
```

### 5. ⚡ Groq (备用 - 高速推理)
**优势**: 极快的推理速度
**状态**: 当前API端点可能有变化
```env
GROQ_API_KEY=gsk_your_groq_key_here
```

## 🔧 快速配置

### 最简配置 (仅需Hugging Face)
```env
# 只需要这一个Token就能使用所有功能
HUGGINGFACE_TOKEN=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
```

### 推荐配置 (Hugging Face + Together AI)
```env
# 主要服务
HUGGINGFACE_TOKEN=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

# 高质量备用 ($25免费额度)
TOGETHER_API_KEY=your_together_key_here
```

### 完整配置 (所有服务)
```env
# 免费服务
HUGGINGFACE_TOKEN=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

# 付费服务 (有免费额度)
TOGETHER_API_KEY=your_together_key_here
OPENROUTER_API_KEY=your_openrouter_key_here

# 本地服务
OLLAMA_BASE_URL=http://localhost:11434

# 备用服务
GROQ_API_KEY=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
```

## 🚀 启动测试

### 1. 启动AI服务
```bash
cd /Users/richardl/projects/youcreator.ai/ai-service
source venv/bin/activate
python main.py
```

### 2. 检查提供商状态
```bash
curl -s http://localhost:8000/providers | python3 -m json.tool
```

### 3. 测试文本生成
```bash
curl -X POST "http://localhost:8000/api/v1/text/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "介绍一下开源AI的发展", "max_length": 200}'
```

### 4. 测试代码生成
```bash
curl -X POST "http://localhost:8000/api/v1/code/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "实现二分查找算法", "language": "python"}'
```

## 📊 提供商优先级

系统会按以下顺序尝试提供商：

### 文本生成优先级
1. **Hugging Face** (免费，稳定)
2. **Together AI** (高质量，有免费额度)
3. **OpenRouter** (多模型选择)
4. **Groq** (高速，但可能不稳定)
5. **智能备用方案** (始终可用)

### 代码生成优先级
1. **Hugging Face** (专门的代码模型)
2. **Together AI** (CodeLlama模型)
3. **增强代码模板** (智能算法识别)

## 🎨 功能特色

### 🧠 智能提供商选择
- 自动检测可用服务
- 根据请求类型选择最佳提供商
- 失败时自动切换到备用服务

### 🔄 故障转移机制
- 实时监控服务状态
- 无缝切换，用户无感知
- 详细的错误日志和恢复

### 💡 增强备用方案
- 智能算法识别 (斐波那契、排序、质数等)
- 多语言代码模板
- 完整可运行的代码示例

## 📈 性能对比

| 提供商 | 速度 | 质量 | 成本 | 可用性 |
|--------|------|------|------|--------|
| Hugging Face | ⭐⭐⭐ | ⭐⭐⭐⭐ | 免费 | ⭐⭐⭐⭐⭐ |
| Together AI | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $25免费 | ⭐⭐⭐⭐ |
| OpenRouter | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 按用量 | ⭐⭐⭐⭐ |
| Ollama | ⭐⭐ | ⭐⭐⭐ | 免费 | ⭐⭐⭐ |
| Groq | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 免费 | ⭐⭐ |

## 🔐 API密钥获取指南

### Hugging Face Token (必需)
1. 访问 https://huggingface.co/settings/tokens
2. 点击 "New token"
3. 选择 "Read" 权限
4. 复制生成的token

### Together AI Key (推荐)
1. 访问 https://api.together.xyz/
2. 注册账号
3. 获得$25免费额度
4. 在设置中创建API密钥

### OpenRouter Key (可选)
1. 访问 https://openrouter.ai/
2. 注册账号
3. 在API Keys页面创建密钥
4. 按使用量付费

## 🎯 使用建议

### 新手用户
- 只配置Hugging Face Token
- 使用默认的多提供商模式
- 体验免费的AI创作功能

### 进阶用户
- 配置Together AI获得更好性能
- 尝试不同的模型和参数
- 监控使用量和成本

### 企业用户
- 部署Ollama进行本地推理
- 配置多个提供商确保高可用
- 实施成本控制和监控

### 开发者
- 研究不同模型的特点
- 贡献新的提供商集成
- 优化提示工程技巧

## 🔮 未来计划

- 🎨 **图像生成**: 集成Stable Diffusion API
- 🎵 **音乐生成**: 集成MusicGen服务
- 🌍 **多语言**: 支持更多编程语言
- 📊 **智能路由**: 基于负载和成本的智能选择
- 🔧 **自定义模型**: 支持用户自定义模型

---

## 🎉 总结

现在你拥有一个强大的多提供商AI创作平台！

**✅ 已实现**:
- 多个开源AI服务集成
- 自动故障转移
- 智能备用方案
- 成本优化

**🚀 立即开始**:
1. 配置至少一个AI服务 (推荐Hugging Face)
2. 启动服务
3. 开始你的AI创作之旅！

**💡 记住**: 即使没有配置任何API密钥，系统的智能备用方案也能提供基础的创作功能！
