"""
Bagel模型图像生成服务
"""
import asyncio
import base64
import io
import logging
import torch
from PIL import Image
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
from transformers import CLIPTextModel, CLIPTokenizer
import numpy as np
from typing import Dict, List, Optional, Any
import requests
import tempfile
import os

logger = logging.getLogger(__name__)

class BagelImageGenerator:
    """Bagel模型图像生成器"""
    
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.pipeline = None
        self.model_id = "bagel-model/bagel-v1"  # 替换为实际的Bagel模型ID
        self.backup_model_id = "runwayml/stable-diffusion-v1-5"
        self._initialize_model()
    
    def _initialize_model(self):
        """初始化Bagel模型"""
        try:
            logger.info("Loading Bagel image generation model...")
            
            # 尝试加载Bagel模型
            try:
                self.pipeline = StableDiffusionPipeline.from_pretrained(
                    self.model_id,
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                    safety_checker=None,
                    requires_safety_checker=False,
                    use_auth_token=True  # 如果需要认证
                )
                logger.info("Bagel model loaded successfully")
            except Exception as e:
                logger.warning(f"Failed to load Bagel model: {e}, falling back to Stable Diffusion")
                # 回退到Stable Diffusion
                self.pipeline = StableDiffusionPipeline.from_pretrained(
                    self.backup_model_id,
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                    safety_checker=None,
                    requires_safety_checker=False
                )
            
            # 优化调度器
            self.pipeline.scheduler = DPMSolverMultistepScheduler.from_config(
                self.pipeline.scheduler.config
            )
            
            # 移动到设备
            self.pipeline = self.pipeline.to(self.device)
            
            # 启用内存优化
            if self.device == "cuda":
                self.pipeline.enable_memory_efficient_attention()
                self.pipeline.enable_xformers_memory_efficient_attention()
            
            logger.info("Image generation pipeline initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing Bagel model: {e}")
            raise
    
    async def generate_image(self, 
                           prompt: str,
                           negative_prompt: str = None,
                           style: str = "realistic",
                           width: int = 512,
                           height: int = 512,
                           num_inference_steps: int = 20,
                           guidance_scale: float = 7.5,
                           num_images: int = 1,
                           seed: int = None) -> Dict[str, Any]:
        """
        使用Bagel模型生成图像
        
        Args:
            prompt: 图像描述提示词
            negative_prompt: 负面提示词
            style: 图像风格
            width: 图像宽度
            height: 图像高度
            num_inference_steps: 推理步数
            guidance_scale: 引导强度
            num_images: 生成图像数量
            seed: 随机种子
            
        Returns:
            包含生成图像的字典
        """
        try:
            # 增强提示词
            enhanced_prompt = self._enhance_prompt(prompt, style)
            
            # 设置负面提示词
            if negative_prompt is None:
                negative_prompt = self._get_default_negative_prompt(style)
            
            # 设置随机种子
            generator = None
            if seed is not None:
                generator = torch.Generator(device=self.device).manual_seed(seed)
            
            logger.info(f"Generating image with Bagel model: {enhanced_prompt[:100]}...")
            
            # 生成图像
            with torch.autocast(self.device):
                result = self.pipeline(
                    prompt=enhanced_prompt,
                    negative_prompt=negative_prompt,
                    width=width,
                    height=height,
                    num_inference_steps=num_inference_steps,
                    guidance_scale=guidance_scale,
                    num_images_per_prompt=num_images,
                    generator=generator
                )
            
            # 处理生成的图像
            images = []
            for i, image in enumerate(result.images):
                # 转换为base64
                buffer = io.BytesIO()
                image.save(buffer, format='PNG', quality=95)
                image_base64 = base64.b64encode(buffer.getvalue()).decode()
                
                images.append({
                    "image": f"data:image/png;base64,{image_base64}",
                    "index": i
                })
            
            return {
                "success": True,
                "images": images,
                "prompt": enhanced_prompt,
                "negative_prompt": negative_prompt,
                "style": style,
                "dimensions": {"width": width, "height": height},
                "model": "bagel",
                "parameters": {
                    "num_inference_steps": num_inference_steps,
                    "guidance_scale": guidance_scale,
                    "seed": seed
                },
                "metadata": {
                    "generation_time": None,  # 可以添加时间统计
                    "device": self.device,
                    "model_id": self.model_id
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating image with Bagel model: {e}")
            return {
                "success": False,
                "error": str(e),
                "model": "bagel"
            }
    
    def _enhance_prompt(self, prompt: str, style: str) -> str:
        """增强提示词以获得更好的生成效果"""
        
        # Bagel模型特定的风格增强
        style_enhancements = {
            "realistic": "photorealistic, high quality, detailed, 8k resolution, professional photography",
            "artistic": "artistic masterpiece, beautiful composition, creative, expressive, fine art",
            "anime": "anime style, manga, japanese animation, vibrant colors, detailed character design",
            "cartoon": "cartoon style, animated, colorful, playful, character illustration",
            "sketch": "pencil sketch, hand drawn, artistic sketch, black and white, detailed lineart",
            "oil_painting": "oil painting style, classical art, brushstrokes, rich colors, artistic",
            "watercolor": "watercolor painting, soft colors, flowing, artistic, traditional media",
            "digital_art": "digital art, concept art, detailed, modern, digital painting",
            "fantasy": "fantasy art, magical, mystical, epic, detailed fantasy illustration",
            "sci_fi": "science fiction, futuristic, high tech, cyberpunk, detailed sci-fi art",
            "portrait": "portrait photography, professional headshot, detailed face, studio lighting",
            "landscape": "landscape photography, scenic view, natural beauty, wide angle, detailed",
            "abstract": "abstract art, modern, creative, unique composition, artistic expression"
        }
        
        enhancement = style_enhancements.get(style, "high quality, detailed")
        
        # Bagel模型特定的质量提升词
        quality_boost = "masterpiece, best quality, ultra detailed, sharp focus"
        
        return f"{prompt}, {enhancement}, {quality_boost}"
    
    def _get_default_negative_prompt(self, style: str) -> str:
        """获取默认的负面提示词"""
        
        base_negative = "low quality, blurry, distorted, ugly, bad anatomy, bad proportions, deformed, duplicate, cropped, out of frame"
        
        style_specific_negative = {
            "realistic": "cartoon, anime, painting, drawing, illustration, rendered",
            "anime": "realistic, photographic, 3d render, western cartoon",
            "cartoon": "realistic, photographic, anime, dark, scary",
            "sketch": "colored, painted, photographic, realistic",
            "oil_painting": "digital, photographic, modern, cartoon",
            "watercolor": "digital, photographic, oil painting, acrylic",
            "digital_art": "traditional media, hand drawn, photographic",
            "fantasy": "modern, contemporary, realistic photography",
            "sci_fi": "medieval, fantasy, traditional, historical",
            "portrait": "full body, landscape, multiple people, crowd",
            "landscape": "portrait, close up, indoor, people, characters",
            "abstract": "realistic, photographic, representational, literal"
        }
        
        style_neg = style_specific_negative.get(style, "")
        
        if style_neg:
            return f"{base_negative}, {style_neg}"
        else:
            return base_negative
    
    async def generate_variations(self, 
                                base_image: str,
                                prompt: str,
                                num_variations: int = 4,
                                variation_strength: float = 0.7) -> Dict[str, Any]:
        """
        基于基础图像生成变体
        
        Args:
            base_image: 基础图像的base64数据
            prompt: 变体描述
            num_variations: 变体数量
            variation_strength: 变体强度
            
        Returns:
            包含变体图像的字典
        """
        try:
            # 解码基础图像
            if base_image.startswith('data:image'):
                base_image = base_image.split(',')[1]
            
            image_data = base64.b64decode(base_image)
            base_pil_image = Image.open(io.BytesIO(image_data)).convert('RGB')
            
            # 如果pipeline支持img2img，使用img2img生成变体
            if hasattr(self.pipeline, 'img2img'):
                results = []
                for i in range(num_variations):
                    result = self.pipeline.img2img(
                        prompt=prompt,
                        image=base_pil_image,
                        strength=variation_strength,
                        guidance_scale=7.5,
                        num_inference_steps=20
                    )
                    
                    # 转换为base64
                    buffer = io.BytesIO()
                    result.images[0].save(buffer, format='PNG')
                    image_base64 = base64.b64encode(buffer.getvalue()).decode()
                    
                    results.append({
                        "image": f"data:image/png;base64,{image_base64}",
                        "index": i,
                        "variation_strength": variation_strength
                    })
                
                return {
                    "success": True,
                    "variations": results,
                    "base_prompt": prompt,
                    "model": "bagel"
                }
            else:
                # 如果不支持img2img，生成新的图像
                return await self.generate_image(
                    prompt=prompt,
                    num_images=num_variations
                )
                
        except Exception as e:
            logger.error(f"Error generating variations: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def upscale_image(self, 
                          image_data: str,
                          scale_factor: int = 2,
                          enhance_quality: bool = True) -> Dict[str, Any]:
        """
        图像超分辨率放大
        
        Args:
            image_data: 图像base64数据
            scale_factor: 放大倍数
            enhance_quality: 是否增强质量
            
        Returns:
            放大后的图像
        """
        try:
            # 解码图像
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            
            # 计算新尺寸
            original_width, original_height = image.size
            new_width = original_width * scale_factor
            new_height = original_height * scale_factor
            
            # 使用高质量重采样
            if enhance_quality:
                # 可以集成Real-ESRGAN或其他超分辨率模型
                upscaled_image = image.resize(
                    (new_width, new_height), 
                    Image.Resampling.LANCZOS
                )
            else:
                upscaled_image = image.resize((new_width, new_height))
            
            # 转换为base64
            buffer = io.BytesIO()
            upscaled_image.save(buffer, format='PNG', quality=95)
            upscaled_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            return {
                "success": True,
                "image": f"data:image/png;base64,{upscaled_base64}",
                "original_size": {"width": original_width, "height": original_height},
                "new_size": {"width": new_width, "height": new_height},
                "scale_factor": scale_factor,
                "model": "bagel_upscale"
            }
            
        except Exception as e:
            logger.error(f"Error upscaling image: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_model_info(self) -> Dict[str, Any]:
        """获取模型信息"""
        return {
            "model_name": "Bagel",
            "model_id": self.model_id,
            "device": self.device,
            "supported_features": [
                "text_to_image",
                "style_transfer",
                "variations",
                "upscaling"
            ],
            "supported_styles": [
                "realistic", "artistic", "anime", "cartoon", "sketch",
                "oil_painting", "watercolor", "digital_art", "fantasy",
                "sci_fi", "portrait", "landscape", "abstract"
            ],
            "max_resolution": {"width": 1024, "height": 1024},
            "recommended_settings": {
                "num_inference_steps": 20,
                "guidance_scale": 7.5,
                "negative_prompt_recommended": True
            }
        }

# 全局Bagel图像生成器实例
bagel_generator = BagelImageGenerator()
