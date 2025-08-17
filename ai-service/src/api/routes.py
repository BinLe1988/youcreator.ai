"""
AI服务API路由 - 开源模型版本
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import asyncio
import logging
from fastapi.responses import StreamingResponse
import io

logger = logging.getLogger(__name__)

router = APIRouter()

# 请求模型定义
class TextGenerationRequest(BaseModel):
    prompt: str = Field(..., description="文本生成提示")
    max_length: Optional[int] = Field(200, ge=1, le=2000, description="最大生成长度")
    temperature: Optional[float] = Field(0.7, ge=0.1, le=2.0, description="生成温度")

class ImageGenerationRequest(BaseModel):
    prompt: str = Field(..., description="图像生成提示")
    width: Optional[int] = Field(512, ge=64, le=1024, description="图像宽度")
    height: Optional[int] = Field(512, ge=64, le=1024, description="图像高度")
    steps: Optional[int] = Field(20, ge=1, le=50, description="推理步数")

class MusicGenerationRequest(BaseModel):
    prompt: str = Field(..., description="音乐生成提示")
    duration: Optional[int] = Field(30, ge=5, le=60, description="音乐时长(秒)")
    genre: Optional[str] = Field(None, description="音乐风格")

class CodeGenerationRequest(BaseModel):
    prompt: str = Field(..., description="代码生成提示")
    language: Optional[str] = Field("python", description="编程语言")
    max_length: Optional[int] = Field(200, ge=1, le=1000, description="最大代码长度")

# 响应模型定义
class GenerationResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

def get_model_manager(request: Request):
    """获取模型管理器"""
    if hasattr(request.app.state, 'model_manager'):
        return request.app.state.model_manager
    raise HTTPException(status_code=503, detail="模型管理器未初始化")

@router.post("/text/generate", response_model=GenerationResponse)
async def generate_text(request: TextGenerationRequest, req: Request):
    """生成文本内容"""
    try:
        model_manager = get_model_manager(req)
        
        logger.info(f"📝 文本生成请求: {request.prompt[:50]}...")
        
        generated_text = await model_manager.generate_text(
            prompt=request.prompt,
            max_length=request.max_length,
            temperature=request.temperature
        )
        
        return GenerationResponse(
            success=True,
            data={
                "generated_text": generated_text,
                "prompt": request.prompt,
                "word_count": len(generated_text)
            },
            metadata={
                "model": "开源文本模型",
                "parameters": {
                    "max_length": request.max_length,
                    "temperature": request.temperature
                }
            }
        )
        
    except Exception as e:
        logger.error(f"文本生成失败: {e}")
        raise HTTPException(status_code=500, detail=f"文本生成失败: {str(e)}")

@router.post("/image/generate")
async def generate_image(request: ImageGenerationRequest, req: Request):
    """生成图像内容"""
    try:
        model_manager = get_model_manager(req)
        
        logger.info(f"🎨 图像生成请求: {request.prompt[:50]}...")
        
        image_bytes = await model_manager.generate_image(
            prompt=request.prompt,
            width=request.width,
            height=request.height,
            steps=request.steps
        )
        
        return StreamingResponse(
            io.BytesIO(image_bytes),
            media_type="image/png",
            headers={
                "Content-Disposition": "attachment; filename=generated_image.png"
            }
        )
        
    except Exception as e:
        logger.error(f"图像生成失败: {e}")
        
        # 返回错误信息而不是图像
        return GenerationResponse(
            success=False,
            message=f"图像生成失败: {str(e)}",
            metadata={
                "model": "Stable Diffusion",
                "error_type": "generation_error"
            }
        )

@router.post("/music/generate", response_model=GenerationResponse)
async def generate_music(request: MusicGenerationRequest, req: Request):
    """生成音乐内容"""
    try:
        model_manager = get_model_manager(req)
        
        logger.info(f"🎵 音乐生成请求: {request.prompt[:50]}...")
        
        # 音乐生成暂未完全实现
        return GenerationResponse(
            success=False,
            message="音乐生成功能正在开发中，敬请期待！",
            data={
                "prompt": request.prompt,
                "duration": request.duration,
                "genre": request.genre,
                "status": "coming_soon"
            },
            metadata={
                "model": "MusicGen (开发中)",
                "estimated_completion": "下个版本"
            }
        )
        
    except Exception as e:
        logger.error(f"音乐生成失败: {e}")
        raise HTTPException(status_code=500, detail=f"音乐生成失败: {str(e)}")

@router.post("/code/generate", response_model=GenerationResponse)
async def generate_code(request: CodeGenerationRequest, req: Request):
    """生成代码内容"""
    try:
        model_manager = get_model_manager(req)
        
        logger.info(f"💻 代码生成请求: {request.prompt[:50]}...")
        
        generated_code = await model_manager.generate_code(
            prompt=request.prompt,
            language=request.language,
            max_length=request.max_length
        )
        
        return GenerationResponse(
            success=True,
            data={
                "generated_code": generated_code,
                "language": request.language,
                "prompt": request.prompt,
                "lines": len(generated_code.split('\n'))
            },
            metadata={
                "model": "开源代码模型",
                "parameters": {
                    "language": request.language,
                    "max_length": request.max_length
                }
            }
        )
        
    except Exception as e:
        logger.error(f"代码生成失败: {e}")
        raise HTTPException(status_code=500, detail=f"代码生成失败: {str(e)}")

@router.get("/models/status")
async def get_models_status(req: Request):
    """获取模型状态"""
    try:
        model_manager = get_model_manager(req)
        status = await model_manager.get_status()
        
        return {
            "service": "YouCreator.AI 开源模型服务",
            "status": "running",
            "models": status,
            "capabilities": {
                "text_generation": status["available_models"]["text"],
                "image_generation": status["available_models"]["image"],
                "music_generation": status["available_models"]["music"],
                "code_generation": status["available_models"]["code"]
            }
        }
        
    except Exception as e:
        logger.error(f"获取模型状态失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取模型状态失败: {str(e)}")

@router.get("/models/download-status")
async def get_download_status():
    """获取模型下载状态"""
    import os
    from pathlib import Path
    
    models_dir = Path(os.getenv("MODEL_CACHE_DIR", "./models"))
    
    status = {}
    model_paths = {
        "text": models_dir / "text",
        "image": models_dir / "image", 
        "music": models_dir / "music",
        "code": models_dir / "code"
    }
    
    for model_type, path in model_paths.items():
        if path.exists() and any(path.iterdir()):
            status[model_type] = "downloaded"
        else:
            status[model_type] = "not_downloaded"
    
    return {
        "models_directory": str(models_dir),
        "download_status": status,
        "download_command": "python download_models.py --recommended"
    }

@router.post("/models/reload")
async def reload_models(req: Request):
    """重新加载模型"""
    try:
        model_manager = get_model_manager(req)
        
        logger.info("🔄 重新加载模型...")
        await model_manager.cleanup()
        await model_manager.initialize()
        
        return GenerationResponse(
            success=True,
            message="模型重新加载完成",
            metadata={"status": "reloaded"}
        )
        
    except Exception as e:
        logger.error(f"模型重新加载失败: {e}")
        raise HTTPException(status_code=500, detail=f"模型重新加载失败: {str(e)}")

@router.get("/health")
async def health_check():
    """AI服务健康检查"""
    return {
        "status": "healthy",
        "service": "youcreator-ai-opensource",
        "version": "1.0.0"
    }
