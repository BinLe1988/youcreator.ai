"""
媒体生成API路由
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging
from services.media_generation import media_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/media", tags=["media"])

# 请求模型
class TextToImageRequest(BaseModel):
    text: str = Field(..., description="图片描述文字")
    style: str = Field(default="realistic", description="图片风格")
    width: int = Field(default=512, ge=256, le=1024, description="图片宽度")
    height: int = Field(default=512, ge=256, le=1024, description="图片高度")
    num_inference_steps: int = Field(default=20, ge=10, le=50, description="推理步数")
    guidance_scale: float = Field(default=7.5, ge=1.0, le=20.0, description="引导强度")

class TextToMusicRequest(BaseModel):
    text: str = Field(..., description="音乐描述文字")
    duration: int = Field(default=10, ge=5, le=30, description="音乐时长(秒)")
    temperature: float = Field(default=1.0, ge=0.1, le=2.0, description="生成温度")
    top_k: int = Field(default=250, ge=50, le=500, description="top-k采样")
    top_p: float = Field(default=0.0, ge=0.0, le=1.0, description="top-p采样")

class ImageToMusicRequest(BaseModel):
    image_base64: str = Field(..., description="图片base64数据")
    duration: int = Field(default=10, ge=5, le=30, description="音乐时长(秒)")
    temperature: float = Field(default=1.0, ge=0.1, le=2.0, description="生成温度")

class BatchGenerateRequest(BaseModel):
    requests: List[Dict[str, Any]] = Field(..., description="批量生成请求")

# 响应模型
class MediaResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    request_id: Optional[str] = None

@router.post("/text-to-image", response_model=MediaResponse)
async def generate_image_from_text(request: TextToImageRequest):
    """
    根据文字描述生成图片
    """
    try:
        logger.info(f"Generating image from text: {request.text[:50]}...")
        
        result = await media_service.text_to_image(
            text=request.text,
            style=request.style,
            width=request.width,
            height=request.height,
            num_inference_steps=request.num_inference_steps,
            guidance_scale=request.guidance_scale
        )
        
        if result["success"]:
            return MediaResponse(success=True, data=result)
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Generation failed"))
            
    except Exception as e:
        logger.error(f"Error in text-to-image generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/text-to-music", response_model=MediaResponse)
async def generate_music_from_text(request: TextToMusicRequest):
    """
    根据文字描述生成音乐
    """
    try:
        logger.info(f"Generating music from text: {request.text[:50]}...")
        
        result = await media_service.text_to_music(
            text=request.text,
            duration=request.duration,
            temperature=request.temperature,
            top_k=request.top_k,
            top_p=request.top_p
        )
        
        if result["success"]:
            return MediaResponse(success=True, data=result)
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Generation failed"))
            
    except Exception as e:
        logger.error(f"Error in text-to-music generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/image-to-music", response_model=MediaResponse)
async def generate_music_from_image(request: ImageToMusicRequest):
    """
    根据图片生成音乐
    """
    try:
        logger.info("Generating music from image...")
        
        result = await media_service.image_to_music(
            image_data=request.image_base64,
            duration=request.duration,
            temperature=request.temperature
        )
        
        if result["success"]:
            return MediaResponse(success=True, data=result)
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Generation failed"))
            
    except Exception as e:
        logger.error(f"Error in image-to-music generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-image-to-music")
async def upload_image_and_generate_music(
    file: UploadFile = File(...),
    duration: int = Form(default=10),
    temperature: float = Form(default=1.0)
):
    """
    上传图片并生成音乐
    """
    try:
        # 验证文件类型
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # 读取图片数据
        image_data = await file.read()
        
        logger.info(f"Generating music from uploaded image: {file.filename}")
        
        result = await media_service.image_to_music(
            image_data=image_data,
            duration=duration,
            temperature=temperature
        )
        
        if result["success"]:
            return MediaResponse(success=True, data=result)
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Generation failed"))
            
    except Exception as e:
        logger.error(f"Error in upload-image-to-music: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch-generate", response_model=List[MediaResponse])
async def batch_generate_media(request: BatchGenerateRequest):
    """
    批量生成媒体内容
    """
    try:
        logger.info(f"Batch generating {len(request.requests)} media items...")
        
        results = await media_service.batch_generate(request.requests)
        
        return [
            MediaResponse(
                success=result["success"],
                data=result if result["success"] else None,
                error=result.get("error"),
                request_id=result.get("request_id")
            )
            for result in results
        ]
        
    except Exception as e:
        logger.error(f"Error in batch generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/styles")
async def get_available_styles():
    """
    获取可用的图片风格列表
    """
    styles = [
        {"id": "realistic", "name": "写实风格", "description": "照片级真实感"},
        {"id": "artistic", "name": "艺术风格", "description": "绘画艺术感"},
        {"id": "cartoon", "name": "卡通风格", "description": "动画卡通风"},
        {"id": "sketch", "name": "素描风格", "description": "铅笔素描"},
        {"id": "oil_painting", "name": "油画风格", "description": "古典油画"},
        {"id": "watercolor", "name": "水彩风格", "description": "水彩画风"}
    ]
    
    return {"success": True, "data": {"styles": styles}}

@router.get("/health")
async def health_check():
    """
    健康检查
    """
    return {
        "status": "healthy",
        "service": "media-generation",
        "models_loaded": {
            "image_generation": media_service.image_pipeline is not None,
            "music_generation": media_service.music_pipeline is not None,
            "image_captioning": media_service.image_caption_model is not None
        }
    }
