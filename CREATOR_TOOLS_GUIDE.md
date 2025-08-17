# YouCreator.AI 创作工具使用指南

## 🎨 概述

YouCreator.AI 提供了四大独立的创作工具，每个工具都有专门的功能和交互界面：

- **📝 文字创作** - 小说、诗歌、剧本、文章创作
- **🎨 绘画创作** - 多风格AI绘画生成
- **🎵 音乐创作** - 文字配乐、图片配乐
- **💻 编程创作** - 代码生成、优化、调试

## 🚀 快速开始

### 方式一：统一启动器（推荐）
```bash
./start_creator.sh
```

### 方式二：直接启动创作工具
```bash
./creator_launcher.py
```

### 方式三：单独启动各个工具
```bash
./text_creator.py      # 文字创作
./art_creator.py       # 绘画创作
./music_creator.py     # 音乐创作
./code_creator_interactive.py  # 编程创作
```

## 📝 文字创作工具

### 功能特性
- **小说创作** - 支持现代都市、古代言情、科幻未来等多种题材
- **诗歌创作** - 现代诗、古体诗、自由诗、散文诗
- **剧本创作** - 话剧、短剧、小品、独角戏
- **文章写作** - 议论文、说明文、记叙文、散文
- **故事创作** - 自定义背景、人物、冲突的故事
- **文本改进** - 语言优化、结构调整、内容扩展

### 使用示例
```bash
# 交互式创作
./text_creator.py

# 命令行创作
./text_creator.py novel "时间旅行的故事" "科幻未来"
./text_creator.py poem "春天的美好" "现代诗"
```

### 输出文件
- 保存位置：`text_creations/`
- 文件格式：Markdown (.md)
- 包含元数据：创作时间、类型、参数等

## 🎨 绘画创作工具

### 功能特性
- **自由创作** - 根据描述生成任意风格的图片
- **人物肖像** - 专业肖像生成
- **风景画作** - 自然风光创作
- **角色设计** - 游戏、动漫角色设计
- **场景插画** - 概念艺术创作

### 支持风格
- 写实风格 (realistic)
- 动漫风格 (anime)
- 卡通风格 (cartoon)
- 油画风格 (oil_painting)
- 水彩风格 (watercolor)
- 素描风格 (sketch)
- 数字艺术 (digital_art)
- 奇幻风格 (fantasy)
- 科幻风格 (sci_fi)
- 抽象风格 (abstract)
- 肖像风格 (portrait)
- 风景风格 (landscape)
- 艺术风格 (artistic)

### 使用示例
```bash
# 启动绘画创作工具
./art_creator.py
```

### 输出文件
- 保存位置：`art_creations/`
- 文件格式：PNG图片 + JSON元数据
- 支持尺寸：512x512, 768x512, 512x768, 1024x512

## 🎵 音乐创作工具

### 功能特性
- **文字生成音乐** - 根据文字描述创作音乐
- **图片配乐** - 为图片创作背景音乐
- **主题音乐** - 冒险、浪漫、神秘等主题音乐
- **环境音景** - 森林、海洋、雨天等环境声音

### 支持风格
- 环境音乐 (ambient)
- 古典音乐 (classical)
- 电子音乐 (electronic)
- 爵士音乐 (jazz)
- 摇滚音乐 (rock)
- 流行音乐 (pop)
- 民谣音乐 (folk)
- 管弦乐 (orchestral)
- 钢琴音乐 (piano)
- 原声音乐 (acoustic)
- 电影配乐 (cinematic)
- 冥想音乐 (meditation)

### 使用示例
```bash
# 启动音乐创作工具
./music_creator.py
```

### 输出文件
- 保存位置：`music_creations/`
- 文件格式：WAV音频 + JSON元数据
- 支持时长：5-60秒

## 💻 编程创作工具

### 功能特性
- **代码生成** - 根据需求描述生成代码
- **代码优化** - 性能、可读性、内存、安全性优化
- **代码调试** - 错误修复和问题诊断
- **代码解释** - 详细解释代码功能和原理
- **代码转换** - 不同编程语言间转换
- **测试生成** - 自动生成单元测试

### 支持语言
- Python (.py)
- JavaScript (.js)
- TypeScript (.ts)
- Java (.java)
- C++ (.cpp)
- C (.c)
- Go (.go)
- Rust (.rs)
- PHP (.php)
- Ruby (.rb)
- Swift (.swift)
- Kotlin (.kt)
- HTML (.html)
- CSS (.css)
- SQL (.sql)

### 使用示例
```bash
# 启动编程创作工具
./code_creator_interactive.py

# 或使用基础API
python3 -c "
from code_creator import CodeCreator
creator = CodeCreator()
result = creator.generate_code('实现快速排序算法', 'python')
print(result['code'])
"
```

### 输出文件
- 保存位置：`code_creations/`
- 文件格式：对应语言的源代码文件 + JSON元数据
- 包含注释和文档

## 🔧 环境要求

### 系统要求
- Python 3.8+
- 8GB+ RAM (推荐16GB)
- 网络连接

### 依赖安装
```bash
# 进入AI服务目录
cd ai-service

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

### 服务启动
```bash
# 启动AI服务
./start_bagel_service.sh

# 检查服务状态
curl http://localhost:8000/health
```

## 📊 服务状态检查

在创作工具启动器中选择"服务状态检查"，或者：

```bash
# 检查AI服务
curl http://localhost:8000/api/v1/bagel/health

# 检查后端服务
curl http://localhost:8080/health
```

## 📁 输出文件结构

```
youcreator.ai/
├── text_creations/          # 文字作品
│   ├── 小说_*.md
│   ├── 诗歌_*.md
│   └── *_metadata.json
├── art_creations/           # 绘画作品
│   ├── artwork_*.png
│   ├── portrait_*.png
│   └── *_metadata.json
├── music_creations/         # 音乐作品
│   ├── music_*.wav
│   ├── soundtrack_*.wav
│   └── *_metadata.json
└── code_creations/          # 代码作品
    ├── generated_*.py
    ├── optimized_*.js
    └── *_metadata.json
```

## 🎯 使用技巧

### 文字创作
- 提供详细的主题描述获得更好的创作效果
- 选择合适的风格和情绪基调
- 可以多次生成并选择最佳版本

### 绘画创作
- 使用具体的描述词汇，如"高清"、"细节丰富"
- 尝试不同的风格找到最适合的效果
- 调整尺寸比例适应不同用途

### 音乐创作
- 描述音乐的情绪和氛围
- 选择合适的时长（建议15-30秒）
- 图片配乐会自动分析图片内容

### 编程创作
- 提供清晰的功能需求描述
- 指定代码风格和复杂度
- 利用优化功能改进现有代码

## 🐛 常见问题

### Q: 服务启动失败
A: 检查Python环境和依赖安装，确保端口8000和8080未被占用

### Q: 生成速度慢
A: 首次使用需要下载模型，后续会更快。建议使用GPU加速

### Q: 生成质量不理想
A: 尝试调整描述词汇，使用更具体的提示词

### Q: 文件保存失败
A: 检查磁盘空间和文件权限

## 📞 技术支持

- 项目地址: https://github.com/your-org/youcreator.ai
- 问题反馈: GitHub Issues
- 文档地址: docs/
- 邮箱: contact@youcreator.ai

## 📄 许可证

本项目采用 MIT 许可证，详见 [LICENSE](LICENSE) 文件。

---

🎉 开始您的AI创作之旅吧！
