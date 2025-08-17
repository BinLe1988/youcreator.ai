# YouCreator.AI 前端创作工具使用指南

## 🎨 概述

YouCreator.AI 前端提供了四个独立的创作工具界面，每个工具都有专门的功能和用户体验：

- **📝 文字创作工具** (`/text-creator`) - 小说、诗歌、剧本、文章创作
- **🎨 绘画创作工具** (`/art-creator`) - 多风格AI绘画生成
- **🎵 音乐创作工具** (`/music-creator`) - 文字配乐、图片配乐
- **💻 编程创作工具** (`/code-creator`) - 代码生成、优化、调试

## 🚀 快速开始

### 启动前端服务
```bash
cd frontend
npm install
npm run dev
```

访问地址：http://localhost:3000

### 主要页面路由
- 主页: `/`
- 文字创作: `/text-creator`
- 绘画创作: `/art-creator`
- 音乐创作: `/music-creator`
- 编程创作: `/code-creator`

## 📝 文字创作工具

### 功能特性
- **小说创作** - 支持多种题材（现代都市、科幻未来、奇幻冒险等）
- **诗歌创作** - 现代诗、古体诗、自由诗等多种风格
- **剧本创作** - 话剧、短剧、小品等戏剧形式
- **文章写作** - 议论文、说明文、记叙文等文体
- **文本改进** - 语言优化、结构调整、内容扩展

### 使用方法
1. 访问 `/text-creator`
2. 选择创作类型（小说/诗歌/剧本/文章/改进）
3. 填写相关参数（主题、风格、长度等）
4. 点击生成按钮
5. 查看结果，可复制或下载

### API接口
- **POST** `/api/text/generate`
- 请求体：`{ type: string, params: object }`
- 响应：`{ success: boolean, content: string, task_type: string, word_count: number }`

## 🎨 绘画创作工具

### 功能特性
- **自由创作** - 根据描述生成任意风格图片，支持13种艺术风格
- **人物肖像** - 专业肖像生成，支持写实、艺术、油画、素描风格
- **风景画作** - 自然风光创作，多种绘画风格
- **角色设计** - 游戏、动漫角色设计
- **场景插画** - 概念艺术、场景设计

### 支持风格
- realistic (写实), anime (动漫), cartoon (卡通)
- oil_painting (油画), watercolor (水彩), sketch (素描)
- digital_art (数字艺术), fantasy (奇幻), sci_fi (科幻)
- abstract (抽象), portrait (肖像), landscape (风景), artistic (艺术)

### 使用方法
1. 访问 `/art-creator`
2. 选择创作类型（自由创作/人物肖像/风景画/角色设计/场景插画）
3. 输入画面描述
4. 选择风格、尺寸、质量等参数
5. 点击生成按钮
6. 查看结果，可重新生成或下载

### API接口
- **POST** `/api/art/generate`
- 请求体：`{ type: string, params: object }`
- 响应：`{ success: boolean, image_data: string, style: string, dimensions: object }`

## 🎵 音乐创作工具

### 功能特性
- **文字配乐** - 根据文字描述创作音乐，支持12种音乐风格
- **图片配乐** - 上传图片，AI分析后创作配乐
- **主题音乐** - 冒险、浪漫、神秘等10种主题音乐
- **环境音景** - 森林、海洋、雨天等8种环境声音

### 支持风格
- ambient (环境), classical (古典), electronic (电子)
- jazz (爵士), rock (摇滚), pop (流行)
- folk (民谣), orchestral (管弦乐), piano (钢琴)
- acoustic (原声), cinematic (电影配乐), meditation (冥想)

### 使用方法
1. 访问 `/music-creator`
2. 选择创作类型（文字配乐/图片配乐/主题音乐/环境音景）
3. 输入描述或上传图片
4. 设置时长、风格、情绪等参数
5. 点击生成按钮
6. 播放试听，可下载音频文件

### API接口
- **POST** `/api/music/generate`
- 请求体：`{ type: string, params: object }`
- 响应：`{ success: boolean, audio_data: string, duration: number, style: string }`

## 💻 编程创作工具

### 功能特性
- **代码生成** - 根据需求描述生成代码，支持15+编程语言
- **代码优化** - 性能、可读性、内存、安全性、风格优化
- **代码调试** - 错误修复和问题诊断
- **代码解释** - 详细解释代码功能和原理
- **代码转换** - 不同编程语言间转换

### 支持语言
- Python, JavaScript, TypeScript, Java, C++, C, Go, Rust
- PHP, Ruby, Swift, Kotlin, HTML, CSS, SQL

### 使用方法
1. 访问 `/code-creator`
2. 选择功能（生成/优化/调试/解释/转换）
3. 输入描述或代码
4. 选择编程语言和相关参数
5. 点击处理按钮
6. 查看结果，可复制、下载或运行

### API接口
- **POST** `/api/code/generate`
- 请求体：`{ type: string, params: object }`
- 响应：`{ success: boolean, code: string, language: string, explanation: string }`

## 🔧 技术架构

### 前端技术栈
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **组件**: shadcn/ui
- **状态管理**: React Hooks
- **HTTP客户端**: Fetch API

### 组件结构
```
src/
├── app/
│   ├── text-creator/page.tsx     # 文字创作页面
│   ├── art-creator/page.tsx      # 绘画创作页面
│   ├── music-creator/page.tsx    # 音乐创作页面
│   ├── code-creator/page.tsx     # 编程创作页面
│   └── api/                      # API路由
│       ├── text/generate/route.ts
│       ├── art/generate/route.ts
│       ├── music/generate/route.ts
│       └── code/generate/route.ts
├── components/ui/                # UI组件库
└── lib/                         # 工具函数
```

### API路由设计
- 统一的请求格式：`{ type: string, params: object }`
- 统一的响应格式：`{ success: boolean, data: object, error?: string }`
- 错误处理和状态码管理
- 类型安全的TypeScript接口

## 🎯 使用技巧

### 文字创作
- 提供详细的主题描述获得更好的创作效果
- 选择合适的风格和情绪基调
- 利用文本改进功能优化现有内容

### 绘画创作
- 使用具体的描述词汇，如"高清"、"细节丰富"
- 尝试不同的风格找到最适合的效果
- 调整尺寸比例适应不同用途
- 使用负面提示词排除不想要的元素

### 音乐创作
- 描述音乐的情绪和氛围
- 选择合适的时长（建议15-30秒）
- 图片配乐会自动分析图片内容
- 尝试不同的主题和环境音景

### 编程创作
- 提供清晰的功能需求描述
- 指定代码风格和复杂度
- 利用优化功能改进现有代码
- 使用解释功能学习代码原理

## 🔌 集成指南

### 环境变量配置
```bash
# .env.local
AI_SERVICE_URL=http://localhost:8000  # AI服务地址
BACKEND_URL=http://localhost:8080     # 后端服务地址
```

### 自定义配置
- 修改 `tailwind.config.js` 自定义主题
- 在 `src/lib/` 添加工具函数
- 扩展 `src/components/ui/` 组件库

### 部署配置
```bash
# 构建生产版本
npm run build

# 启动生产服务
npm start
```

## 🐛 常见问题

### Q: 生成速度慢
A: 首次使用需要加载模型，后续会更快。建议使用GPU加速

### Q: 生成质量不理想
A: 尝试调整描述词汇，使用更具体的提示词

### Q: API请求失败
A: 检查AI服务是否启动，确认环境变量配置正确

### Q: 图片无法显示
A: 检查base64数据格式，确认图片生成成功

### Q: 音频无法播放
A: 检查浏览器音频支持，确认音频格式兼容

## 📞 技术支持

- 项目地址: https://github.com/your-org/youcreator.ai
- 问题反馈: GitHub Issues
- 文档地址: docs/
- 邮箱: contact@youcreator.ai

## 📄 许可证

本项目采用 MIT 许可证，详见 [LICENSE](LICENSE) 文件。

---

🎉 开始您的前端AI创作之旅吧！
