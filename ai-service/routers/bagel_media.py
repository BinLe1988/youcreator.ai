"""
Bagel模型媒体生成API路由
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging
from services.media_generation_bagel import bagel_media_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/bagel", tags=["bagel-media"])

# 请求模型
class BagelTextToImageRequest(BaseModel):
    text: str = Field(..., description="图片描述文字")
    style: str = Field(default="realistic", description="图片风格")
    width: int = Field(default=512, ge=256, le=1024, description="图片宽度")
    height: int = Field(default=512, ge=256, le=1024, description="图片高度")
    num_inference_steps: int = Field(default=20, ge=10, le=50, description="推理步数")
    guidance_scale: float = Field(default=7.5, ge=1.0, le=20.0, description="引导强度")
    negative_prompt: Optional[str] = Field(default=None, description="负面提示词")
    num_images: int = Field(default=1, ge=1, le=4, description="生成图片数量")
    seed: Optional[int] = Field(default=None, description="随机种子")

class ImageVariationsRequest(BaseModel):
    base_image: str = Field(..., description="基础图像base64数据")
    prompt: str = Field(..., description="变体描述")
    num_variations: int = Field(default=4, ge=1, le=8, description="变体数量")
    variation_strength: float = Field(default=0.7, ge=0.1, le=1.0, description="变体强度")

class ImageUpscaleRequest(BaseModel):
    image_data: str = Field(..., description="图像base64数据")
    scale_factor: int = Field(default=2, ge=2, le=4, description="放大倍数")
    enhance_quality: bool = Field(default=True, description="是否增强质量")

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
    model: Optional[str] = None

@router.post("/text-to-image", response_model=MediaResponse)
async def bagel_text_to_image(request: BagelTextToImageRequest):
    """
    使用Bagel模型根据文字描述生成图片
    """
    try:
        logger.info(f"Bagel text-to-image: {request.text[:50]}...")
        
        result = await bagel_media_service.text_to_image(
            text=request.text,
            style=request.style,
            width=request.width,
            height=request.height,
            num_inference_steps=request.num_inference_steps,
            guidance_scale=request.guidance_scale,
            negative_prompt=request.negative_prompt,
            num_images=request.num_images,
            seed=request.seed
        )
        
        if result["success"]:
            return MediaResponse(success=True, data=result, model="bagel")
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Generation failed"))
            
    except Exception as e:
        logger.error(f"Error in Bagel text-to-image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/image-variations", response_model=MediaResponse)
async def generate_image_variations(request: ImageVariationsRequest):
    """
    生成图像变体
    """
    try:
        logger.info(f"Generating {request.num_variations} image variations...")
        
        result = await bagel_media_service.generate_image_variations(
            base_image=request.base_image,
            prompt=request.prompt,
            num_variations=request.num_variations,
            variation_strength=request.variation_strength
        )
        
        if result["success"]:
            return MediaResponse(success=True, data=result, model="bagel")
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Variation generation failed"))
            
    except Exception as e:
        logger.error(f"Error in image variations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upscale-image", response_model=MediaResponse)
async def upscale_image(request: ImageUpscaleRequest):
    """
    图像超分辨率放大
    """
    try:
        logger.info(f"Upscaling image by {request.scale_factor}x...")
        
        result = await bagel_media_service.upscale_image(
            image_data=request.image_data,
            scale_factor=request.scale_factor,
            enhance_quality=request.enhance_quality
        )
        
        if result["success"]:
            return MediaResponse(success=True, data=result, model="bagel")
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Upscaling failed"))
            
    except Exception as e:
        logger.error(f"Error in image upscaling: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/text-to-music", response_model=MediaResponse)
async def bagel_text_to_music(request: TextToMusicRequest):
    """
    根据文字描述生成音乐
    """
    try:
        logger.info(f"Generating music from text: {request.text[:50]}...")
        
        result = await bagel_media_service.text_to_music(
            text=request.text,
            duration=request.duration,
            temperature=request.temperature,
            top_k=request.top_k,
            top_p=request.top_p
        )
        
        if result["success"]:
            return MediaResponse(success=True, data=result)
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Music generation failed"))
            
    except Exception as e:
        logger.error(f"Error in text-to-music: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/image-to-music", response_model=MediaResponse)
async def bagel_image_to_music(request: ImageToMusicRequest):
    """
    根据图片生成音乐
    """
    try:
        logger.info("Generating music from image...")
        
        result = await bagel_media_service.image_to_music(
            image_data=request.image_base64,
            duration=request.duration,
            temperature=request.temperature
        )
        
        if result["success"]:
            return MediaResponse(success=True, data=result)
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Music generation failed"))
            
    except Exception as e:
        logger.error(f"Error in image-to-music: {e}")
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
        
        result = await bagel_media_service.image_to_music(
            image_data=image_data,
            duration=duration,
            temperature=temperature
        )
        
        if result["success"]:
            return MediaResponse(success=True, data=result)
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Music generation failed"))
            
    except Exception as e:
        logger.error(f"Error in upload-image-to-music: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch-generate", response_model=List[MediaResponse])
async def batch_generate_media(request: BatchGenerateRequest):
    """
    批量生成媒体内容
    """
    try:
        logger.info(f"Batch generating {len(request.requests)} media items with Bagel...")
        
        results = await bagel_media_service.batch_generate(request.requests)
        
        return [
            MediaResponse(
                success=result["success"],
                data=result if result["success"] else None,
                error=result.get("error"),
                model="bagel"
            )
            for result in results
        ]
        
    except Exception as e:
        logger.error(f"Error in batch generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/model-info")
async def get_bagel_model_info():
    """
    获取Bagel模型信息
    """
    try:
        model_info = bagel_media_service.get_model_info()
        return {"success": True, "data": model_info}
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/styles")
async def get_bagel_styles():
    """
    获取Bagel模型支持的图片风格
    """
    try:
        model_info = bagel_media_service.get_model_info()
        styles = model_info["image_generation"]["supported_styles"]
        
        style_descriptions = {
            "realistic": {"name": "写实风格", "description": "照片级真实感，高度逼真"},
            "artistic": {"name": "艺术风格", "description": "绘画艺术感，富有创意"},
            "anime": {"name": "动漫风格", "description": "日式动漫风格，色彩鲜艳"},
            "cartoon": {"name": "卡通风格", "description": "动画卡通风，可爱有趣"},
            "sketch": {"name": "素描风格", "description": "铅笔素描，线条艺术"},
            "oil_painting": {"name": "油画风格", "description": "古典油画，笔触丰富"},
            "watercolor": {"name": "水彩风格", "description": "水彩画风，色彩流动"},
            "digital_art": {"name": "数字艺术", "description": "现代数字绘画"},
            "fantasy": {"name": "奇幻风格", "description": "魔幻奇幻，想象丰富"},
            "sci_fi": {"name": "科幻风格", "description": "未来科技，高科技感"},
            "portrait": {"name": "肖像风格", "description": "人物肖像，细节丰富"},
            "landscape": {"name": "风景风格", "description": "自然风光，视野开阔"},
            "abstract": {"name": "抽象风格", "description": "抽象艺术，创意表达"}
        }
        
        style_list = []
        for style_id in styles:
            style_info = style_descriptions.get(style_id, {
                "name": style_id.title(),
                "description": f"{style_id} style"
            })
            style_list.append({
                "id": style_id,
                "name": style_info["name"],
                "description": style_info["description"]
            })
        
        return {
            "success": True,
            "data": {
                "styles": style_list,
                "model": "bagel"
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting styles: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/capabilities")
async def get_bagel_capabilities():
    """
    获取Bagel模型能力信息
    """
    try:
        model_info = bagel_media_service.get_model_info()
        
        return {
            "success": True,
            "data": {
                "model_name": "Bagel",
                "capabilities": model_info,
                "features": [
                    "高质量图像生成",
                    "多种艺术风格",
                    "图像变体生成",
                    "图像超分辨率",
                    "负面提示词支持",
                    "批量生成",
                    "种子控制"
                ],
                "advantages": [
                    "更好的图像质量",
                    "更丰富的细节",
                    "更准确的提示词理解",
                    "更稳定的生成结果"
                ]
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting capabilities: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def bagel_health_check():
    """
    Bagel服务健康检查
    """
    try:
        model_info = bagel_media_service.get_model_info()
        return {
            "status": "healthy",
            "service": "bagel-media-generation",
            "model": "bagel",
            "features_available": model_info["service_features"]
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }
