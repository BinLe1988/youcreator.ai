"""
多模态AI服务API路由
支持文字配图、文字配乐、图片配乐等功能
"""

from fastapi import APIRouter, HTTPException, Request, File, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import asyncio
import logging
import io
import base64
from PIL import Image

logger = logging.getLogger(__name__)

router = APIRouter()

# 请求模型定义
class TextToImageRequest(BaseModel):
    text: str = Field(..., description="需要配图的文字内容")
    style: Optional[str] = Field("realistic", description="图像风格")
    width: Optional[int] = Field(512, ge=64, le=1024, description="图像宽度")
    height: Optional[int] = Field(512, ge=64, le=1024, description="图像高度")

class TextToMusicRequest(BaseModel):
    text: str = Field(..., description="需要配乐的文字内容")
    duration: Optional[int] = Field(30, ge=5, le=120, description="音乐时长(秒)")
    style: Optional[str] = Field("ambient", description="音乐风格")

class ImageToMusicRequest(BaseModel):
    image_description: str = Field(..., description="图片描述或分析结果")
    duration: Optional[int] = Field(30, ge=5, le=120, description="音乐时长(秒)")

class CompleteContentRequest(BaseModel):
    text: str = Field(..., description="原始文字内容")
    include_image: Optional[bool] = Field(True, description="是否生成配图")
    include_music: Optional[bool] = Field(True, description="是否生成配乐")
    image_style: Optional[str] = Field("realistic", description="图像风格")
    music_duration: Optional[int] = Field(30, description="音乐时长")
    image_width: Optional[int] = Field(512, description="图像宽度")
    image_height: Optional[int] = Field(512, description="图像高度")

# 响应模型定义
class MultimodalResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

def get_multimodal_manager(request: Request):
    """获取多模态内容管理器"""
    if hasattr(request.app.state, 'model_manager'):
        model_manager = request.app.state.model_manager
        if hasattr(model_manager, 'multimodal_matcher'):
            return model_manager.multimodal_matcher
    raise HTTPException(status_code=503, detail="多模态服务未初始化")

@router.post("/text-to-image", response_class=StreamingResponse)
async def text_to_image(request: TextToImageRequest, req: Request):
    """文字配图 - 为文字生成配图"""
    try:
        multimodal_manager = get_multimodal_manager(req)
        
        logger.info(f"🎨 文字配图请求: {request.text[:50]}...")
        
        image_bytes = await multimodal_manager.image_client.generate_image_for_text(
            text=request.text,
            style=request.style,
            width=request.width,
            height=request.height
        )
        
        return StreamingResponse(
            io.BytesIO(image_bytes),
            media_type="image/png",
            headers={
                "Content-Disposition": f"attachment; filename=text_to_image.png"
            }
        )
        
    except Exception as e:
        logger.error(f"文字配图失败: {e}")
        raise HTTPException(status_code=500, detail=f"文字配图失败: {str(e)}")

@router.post("/text-to-music", response_class=StreamingResponse)
async def text_to_music(request: TextToMusicRequest, req: Request):
    """文字配乐 - 为文字生成配乐"""
    try:
        multimodal_manager = get_multimodal_manager(req)
        
        logger.info(f"🎵 文字配乐请求: {request.text[:50]}...")
        
        music_bytes = await multimodal_manager.music_client.generate_music_for_text(
            text=request.text,
            duration=request.duration
        )
        
        return StreamingResponse(
            io.BytesIO(music_bytes),
            media_type="audio/wav",
            headers={
                "Content-Disposition": f"attachment; filename=text_to_music.wav"
            }
        )
        
    except Exception as e:
        logger.error(f"文字配乐失败: {e}")
        raise HTTPException(status_code=500, detail=f"文字配乐失败: {str(e)}")

@router.post("/image-to-music", response_class=StreamingResponse)
async def image_to_music(request: ImageToMusicRequest, req: Request):
    """图片配乐 - 为图片生成配乐"""
    try:
        multimodal_manager = get_multimodal_manager(req)
        
        logger.info(f"🎵 图片配乐请求: {request.image_description[:50]}...")
        
        music_bytes = await multimodal_manager.music_client.generate_music_for_image(
            image_description=request.image_description,
            duration=request.duration
        )
        
        return StreamingResponse(
            io.BytesIO(music_bytes),
            media_type="audio/wav",
            headers={
                "Content-Disposition": f"attachment; filename=image_to_music.wav"
            }
        )
        
    except Exception as e:
        logger.error(f"图片配乐失败: {e}")
        raise HTTPException(status_code=500, detail=f"图片配乐失败: {str(e)}")

@router.post("/upload-image-for-music", response_class=StreamingResponse)
async def upload_image_for_music(
    file: UploadFile = File(...),
    duration: int = 30,
    req: Request = None
):
    """上传图片生成配乐"""
    try:
        multimodal_manager = get_multimodal_manager(req)
        
        # 验证文件类型
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="请上传图片文件")
        
        # 读取图片
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # 分析图片内容（简单实现）
        image_description = await analyze_uploaded_image(image)
        
        logger.info(f"🎵 上传图片配乐请求: {image_description[:50]}...")
        
        music_bytes = await multimodal_manager.music_client.generate_music_for_image(
            image_description=image_description,
            duration=duration
        )
        
        return StreamingResponse(
            io.BytesIO(music_bytes),
            media_type="audio/wav",
            headers={
                "Content-Disposition": f"attachment; filename=uploaded_image_music.wav"
            }
        )
        
    except Exception as e:
        logger.error(f"上传图片配乐失败: {e}")
        raise HTTPException(status_code=500, detail=f"上传图片配乐失败: {str(e)}")

@router.post("/complete-content", response_model=MultimodalResponse)
async def create_complete_content(request: CompleteContentRequest, req: Request):
    """创建完整多模态内容 - 文字+配图+配乐"""
    try:
        multimodal_manager = get_multimodal_manager(req)
        
        logger.info(f"🎯 完整内容创建请求: {request.text[:50]}...")
        
        result = await multimodal_manager.create_complete_content(
            text=request.text,
            include_image=request.include_image,
            include_music=request.include_music,
            image_style=request.image_style,
            music_duration=request.music_duration,
            image_width=request.image_width,
            image_height=request.image_height
        )
        
        # 将二进制数据转换为base64以便JSON传输
        response_data = {
            "text": result["text"],
            "metadata": result["metadata"]
        }
        
        if result["image"]:
            response_data["image"] = {
                "data": base64.b64encode(result["image"]).decode('utf-8'),
                "format": "png",
                "size": len(result["image"])
            }
        
        if result["music"]:
            response_data["music"] = {
                "data": base64.b64encode(result["music"]).decode('utf-8'),
                "format": "wav",
                "size": len(result["music"])
            }
        
        return MultimodalResponse(
            success=True,
            data=response_data,
            message="完整多模态内容创建成功"
        )
        
    except Exception as e:
        logger.error(f"完整内容创建失败: {e}")
        raise HTTPException(status_code=500, detail=f"完整内容创建失败: {str(e)}")

@router.get("/analyze-text-style")
async def analyze_text_style(text: str, req: Request):
    """分析文本风格，用于预览生成效果"""
    try:
        multimodal_manager = get_multimodal_manager(req)
        
        style_analysis = multimodal_manager._analyze_content_style(text)
        
        return MultimodalResponse(
            success=True,
            data={
                "text": text,
                "style_analysis": style_analysis,
                "recommendations": {
                    "image_style": style_analysis["visual_style"],
                    "music_style": style_analysis["music_style"],
                    "suggested_duration": 30 if len(text) < 100 else 60
                }
            },
            message="文本风格分析完成"
        )
        
    except Exception as e:
        logger.error(f"文本风格分析失败: {e}")
        raise HTTPException(status_code=500, detail=f"文本风格分析失败: {str(e)}")

@router.get("/supported-styles")
async def get_supported_styles():
    """获取支持的风格列表"""
    return MultimodalResponse(
        success=True,
        data={
            "image_styles": [
                {"id": "realistic", "name": "写实风格", "description": "照片级真实效果"},
                {"id": "artistic", "name": "艺术风格", "description": "绘画艺术效果"},
                {"id": "cartoon", "name": "卡通风格", "description": "可爱卡通效果"},
                {"id": "abstract", "name": "抽象风格", "description": "抽象艺术效果"},
                {"id": "vintage", "name": "复古风格", "description": "怀旧复古效果"},
                {"id": "minimalist", "name": "简约风格", "description": "简洁现代效果"}
            ],
            "music_styles": [
                {"id": "ambient", "name": "环境音乐", "description": "轻柔背景音乐"},
                {"id": "orchestral", "name": "管弦乐", "description": "宏大交响效果"},
                {"id": "electronic", "name": "电子音乐", "description": "现代电子风格"},
                {"id": "acoustic", "name": "原声音乐", "description": "温暖原声效果"},
                {"id": "jazz", "name": "爵士乐", "description": "优雅爵士风格"},
                {"id": "classical", "name": "古典音乐", "description": "经典古典风格"}
            ]
        },
        message="支持的风格列表"
    )

async def analyze_uploaded_image(image: Image.Image) -> str:
    """分析上传的图片内容"""
    # 简单的图片分析实现
    # 在实际应用中，可以使用更复杂的图像识别API
    
    width, height = image.size
    mode = image.mode
    
    # 基于图片属性进行简单分析
    if width > height:
        orientation = "landscape"
    elif height > width:
        orientation = "portrait"
    else:
        orientation = "square"
    
    # 分析颜色模式
    if mode == "RGB":
        color_type = "colorful"
    elif mode == "L":
        color_type = "grayscale"
    else:
        color_type = "mixed"
    
    # 生成描述
    description = f"{orientation} {color_type} image, {width}x{height} pixels"
    
    # 可以添加更多分析逻辑
    if width * height > 500000:  # 大图
        description += ", high resolution, detailed"
    else:
        description += ", standard resolution"
    
    return description

@router.get("/multimodal-status")
async def get_multimodal_status(req: Request):
    """获取多模态服务状态"""
    try:
        multimodal_manager = get_multimodal_manager(req)
        
        # 检查各个服务的状态
        image_providers = multimodal_manager.image_client.providers
        music_providers = multimodal_manager.music_client.providers
        
        image_status = {name: config["enabled"] for name, config in image_providers.items()}
        music_status = {name: config["enabled"] for name, config in music_providers.items()}
        
        return MultimodalResponse(
            success=True,
            data={
                "image_generation": {
                    "available": any(image_status.values()),
                    "providers": image_status
                },
                "music_generation": {
                    "available": any(music_status.values()),
                    "providers": music_status
                },
                "features": {
                    "text_to_image": True,
                    "text_to_music": True,
                    "image_to_music": True,
                    "complete_content": True,
                    "style_analysis": True
                }
            },
            message="多模态服务状态"
        )
        
    except Exception as e:
        return MultimodalResponse(
            success=False,
            message=f"无法获取多模态服务状态: {str(e)}"
        )
