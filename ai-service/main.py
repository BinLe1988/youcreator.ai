#!/usr/bin/env python3
"""
YouCreator.AI - AI Service
多模态版本 - 支持文字配图、文字配乐、图片配乐
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os

# 导入多提供商模型管理器
from src.models.multi_provider_manager import MultiProviderModelManager
from src.api.routes import router
from src.api.multimodal_routes import router as multimodal_router
from src.utils.config import settings

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 全局模型管理器
model_manager = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    global model_manager
    
    # 启动时初始化模型
    logger.info("🚀 启动 YouCreator.AI 多模态服务...")
    model_manager = MultiProviderModelManager()
    
    # 异步初始化模型（不阻塞启动）
    try:
        await model_manager.initialize()
    except Exception as e:
        logger.error(f"模型初始化警告: {e}")
        logger.info("服务将继续运行，使用备用方案")
    
    # 将模型管理器添加到应用状态
    app.state.model_manager = model_manager
    
    logger.info("✅ AI服务启动完成")
    yield
    
    # 关闭时清理资源
    logger.info("🛑 关闭AI服务...")
    if model_manager:
        await model_manager.cleanup()

# 创建FastAPI应用
app = FastAPI(
    title="YouCreator.AI 多模态服务",
    description="集成多个开源AI服务的多模态创作平台 - 支持文字配图、文字配乐、图片配乐",
    version="1.0.0-multimodal",
    lifespan=lifespan
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(router, prefix="/api/v1")
app.include_router(multimodal_router, prefix="/api/v1/multimodal")

# 添加媒体生成路由
try:
    from routers.media import router as media_router
    app.include_router(media_router)
    logger.info("✅ 媒体生成路由已加载")
except ImportError as e:
    logger.warning(f"⚠️ 媒体生成路由加载失败: {e}")
    logger.info("服务将继续运行，但媒体生成功能不可用")

# 添加Bagel媒体生成路由
try:
    from routers.bagel_media import router as bagel_media_router
    app.include_router(bagel_media_router)
    logger.info("✅ Bagel媒体生成路由已加载")
except ImportError as e:
    logger.warning(f"⚠️ Bagel媒体生成路由加载失败: {e}")
    logger.info("服务将继续运行，但Bagel功能不可用")

@app.get("/")
async def root():
    """根路径"""
    return {
        "service": "YouCreator.AI 多模态服务",
        "status": "running",
        "version": "1.0.0-multimodal",
        "docs": "/docs",
        "features": [
            "📝 智能写作 (多提供商)",
            "🎨 AI绘画 (多提供商)", 
            "💻 代码生成 (多提供商)",
            "🎵 音乐创作 (多提供商)",
            "🖼️ 文字配图",
            "🎶 文字配乐",
            "🎵 图片配乐",
            "🎯 完整多模态内容"
        ],
        "providers": {
            "text": [
                "Hugging Face (免费推理API)",
                "Together AI (免费额度)",
                "OpenRouter (多种开源模型)",
                "Ollama (本地AI服务)"
            ],
            "image": [
                "Hugging Face (Stable Diffusion)",
                "Stability AI (官方API)",
                "Replicate (多种模型)"
            ],
            "music": [
                "Replicate (MusicGen)",
                "Hugging Face (音频模型)"
            ],
            "backup": [
                "Groq (高速推理)",
                "增强智能模板",
                "占位符生成"
            ]
        },
        "multimodal_features": {
            "text_to_image": "为文字内容生成配图",
            "text_to_music": "为文字内容生成配乐",
            "image_to_music": "为图片内容生成配乐",
            "complete_content": "一键生成文字+配图+配乐",
            "style_analysis": "智能分析内容风格",
            "batch_processing": "批量多模态处理"
        },
        "advantages": [
            "🔄 多提供商冗余",
            "🚀 自动故障转移", 
            "💰 成本优化",
            "🔓 开源优先",
            "⚡ 高可用性",
            "🎨 多模态创作",
            "🧠 智能内容匹配",
            "🎯 一站式创作"
        ]
    }

@app.get("/health")
async def health_check():
    """健康检查端点"""
    try:
        model_status = {}
        if hasattr(app.state, 'model_manager') and app.state.model_manager:
            model_status = await app.state.model_manager.get_status()
        
        return {
            "status": "healthy",
            "service": "youcreator-ai-multimodal",
            "models": model_status
        }
    except Exception as e:
        logger.error(f"健康检查失败: {e}")
        return {
            "status": "degraded",
            "error": str(e)
        }

@app.get("/models")
async def get_models_info():
    """获取模型信息"""
    if hasattr(app.state, 'model_manager') and app.state.model_manager:
        return await app.state.model_manager.get_status()
    return {"error": "模型管理器未初始化"}

@app.get("/providers")
async def get_providers_info():
    """获取提供商信息"""
    if hasattr(app.state, 'model_manager') and app.state.model_manager:
        status = await app.state.model_manager.get_status()
        return {
            "available_providers": status.get("multi_provider_status", {}),
            "multimodal_providers": status.get("multimodal_status", {}),
            "current_config": status.get("providers", {}),
            "capabilities": status.get("capabilities", {}),
            "recommendation": {
                "for_beginners": "使用Hugging Face免费API",
                "for_developers": "配置Together AI获得更好性能",
                "for_privacy": "安装Ollama进行本地推理",
                "for_speed": "配置OpenRouter访问高速模型",
                "for_images": "配置Stability AI获得最佳图像质量",
                "for_music": "配置Replicate访问MusicGen模型"
            }
        }
    return {"error": "模型管理器未初始化"}

@app.get("/multimodal-demo")
async def multimodal_demo():
    """多模态功能演示"""
    return {
        "demo_scenarios": [
            {
                "name": "文字配图",
                "description": "为文章、故事、描述生成配图",
                "example": {
                    "input": "一个宁静的湖边小屋，夕阳西下",
                    "output": "生成温馨的湖边小屋图片"
                },
                "api": "POST /api/v1/multimodal/text-to-image"
            },
            {
                "name": "文字配乐",
                "description": "为文字内容生成背景音乐",
                "example": {
                    "input": "激动人心的冒险故事",
                    "output": "生成史诗风格的背景音乐"
                },
                "api": "POST /api/v1/multimodal/text-to-music"
            },
            {
                "name": "图片配乐",
                "description": "为图片生成匹配的背景音乐",
                "example": {
                    "input": "上传风景照片",
                    "output": "生成宁静的环境音乐"
                },
                "api": "POST /api/v1/multimodal/image-to-music"
            },
            {
                "name": "完整创作",
                "description": "一键生成文字+配图+配乐",
                "example": {
                    "input": "科幻小说片段",
                    "output": "文字+未来风格图片+电子音乐"
                },
                "api": "POST /api/v1/multimodal/complete-content"
            }
        ],
        "supported_styles": {
            "image": ["realistic", "artistic", "cartoon", "abstract", "vintage", "minimalist"],
            "music": ["ambient", "orchestral", "electronic", "acoustic", "jazz", "classical"]
        },
        "tips": [
            "详细的描述能生成更好的配图",
            "情感词汇有助于音乐风格匹配",
            "可以指定具体的艺术风格",
            "支持批量处理多个内容"
        ]
    }

if __name__ == "__main__":
    logger.info("🎯 启动 YouCreator.AI 多模态服务...")
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
