"""
AI媒体生成服务 - 集成Bagel模型进行图像生成
"""
import asyncio
import base64
import io
import logging
from typing import Dict, List, Optional, Union
from PIL import Image
import torch
from transformers import BlipProcessor, BlipForConditionalGeneration
import librosa
import numpy as np
from audiocraft.models import MusicGen
from audiocraft.data.audio import audio_write
import tempfile
import os

# 导入Bagel图像生成器
from .bagel_image_generation import bagel_generator

logger = logging.getLogger(__name__)

class BagelMediaGenerationService:
    """集成Bagel模型的媒体生成服务"""
    
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.bagel_generator = bagel_generator  # 使用Bagel生成器
        self.music_pipeline = None
        self.image_caption_processor = None
        self.image_caption_model = None
        self._initialize_models()
    
    def _initialize_models(self):
        """初始化AI模型"""
        try:
            # Bagel图像生成器已经在导入时初始化
            logger.info("Bagel image generator ready")
            
            # 初始化音乐生成模型
            logger.info("Loading MusicGen model...")
            self.music_pipeline = MusicGen.get_pretrained('facebook/musicgen-medium')
            
            # 初始化图像描述模型
            logger.info("Loading BLIP model for image captioning...")
            self.image_caption_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
            self.image_caption_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
            
            logger.info("All models loaded successfully")
            
        except Exception as e:
            logger.error(f"Error initializing models: {e}")
            raise

    async def text_to_image(self, 
                           text: str, 
                           style: str = "realistic",
                           width: int = 512, 
                           height: int = 512,
                           num_inference_steps: int = 20,
                           guidance_scale: float = 7.5,
                           negative_prompt: str = None,
                           num_images: int = 1,
                           seed: int = None) -> Dict:
        """
        使用Bagel模型进行文字生成图片
        
        Args:
            text: 输入文字描述
            style: 图片风格
            width: 图片宽度
            height: 图片高度
            num_inference_steps: 推理步数
            guidance_scale: 引导强度
            negative_prompt: 负面提示词
            num_images: 生成图片数量
            seed: 随机种子
            
        Returns:
            包含生成图片的字典
        """
        try:
            logger.info(f"Generating image with Bagel model: {text[:50]}...")
            
            # 使用Bagel生成器生成图像
            result = await self.bagel_generator.generate_image(
                prompt=text,
                negative_prompt=negative_prompt,
                style=style,
                width=width,
                height=height,
                num_inference_steps=num_inference_steps,
                guidance_scale=guidance_scale,
                num_images=num_images,
                seed=seed
            )
            
            if result["success"]:
                # 如果生成多张图片，返回第一张作为主图片
                main_image = result["images"][0]["image"]
                
                return {
                    "success": True,
                    "image": main_image,
                    "images": result["images"],  # 所有生成的图片
                    "prompt": result["prompt"],
                    "style": style,
                    "dimensions": {"width": width, "height": height},
                    "model": "bagel",
                    "parameters": result["parameters"],
                    "metadata": result["metadata"]
                }
            else:
                return {
                    "success": False,
                    "error": result["error"],
                    "model": "bagel"
                }
            
        except Exception as e:
            logger.error(f"Error in text_to_image with Bagel: {e}")
            return {
                "success": False,
                "error": str(e),
                "model": "bagel"
            }

    async def generate_image_variations(self,
                                      base_image: str,
                                      prompt: str,
                                      num_variations: int = 4,
                                      variation_strength: float = 0.7) -> Dict:
        """
        生成图像变体
        
        Args:
            base_image: 基础图像base64数据
            prompt: 变体描述
            num_variations: 变体数量
            variation_strength: 变体强度
            
        Returns:
            包含变体图像的字典
        """
        try:
            logger.info(f"Generating {num_variations} image variations...")
            
            result = await self.bagel_generator.generate_variations(
                base_image=base_image,
                prompt=prompt,
                num_variations=num_variations,
                variation_strength=variation_strength
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Error generating image variations: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def upscale_image(self,
                          image_data: str,
                          scale_factor: int = 2,
                          enhance_quality: bool = True) -> Dict:
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
            logger.info(f"Upscaling image by {scale_factor}x...")
            
            result = await self.bagel_generator.upscale_image(
                image_data=image_data,
                scale_factor=scale_factor,
                enhance_quality=enhance_quality
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Error upscaling image: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def text_to_music(self, 
                           text: str, 
                           duration: int = 10,
                           temperature: float = 1.0,
                           top_k: int = 250,
                           top_p: float = 0.0) -> Dict:
        """
        文字生成音乐
        
        Args:
            text: 音乐描述文字
            duration: 音乐时长(秒)
            temperature: 生成温度
            top_k: top-k采样
            top_p: top-p采样
            
        Returns:
            包含生成音乐的字典
        """
        try:
            # 设置生成参数
            self.music_pipeline.set_generation_params(
                duration=duration,
                temperature=temperature,
                top_k=top_k,
                top_p=top_p
            )
            
            # 生成音乐
            descriptions = [text]
            wav = self.music_pipeline.generate(descriptions)
            
            # 保存到临时文件
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
                audio_write(
                    tmp_file.name[:-4],  # 去掉.wav后缀，audio_write会自动添加
                    wav[0].cpu(), 
                    self.music_pipeline.sample_rate,
                    strategy="loudness"
                )
                
                # 读取生成的音频文件
                with open(tmp_file.name, 'rb') as f:
                    audio_data = f.read()
                    audio_base64 = base64.b64encode(audio_data).decode()
                
                # 清理临时文件
                os.unlink(tmp_file.name)
            
            return {
                "success": True,
                "audio": f"data:audio/wav;base64,{audio_base64}",
                "description": text,
                "duration": duration,
                "sample_rate": self.music_pipeline.sample_rate
            }
            
        except Exception as e:
            logger.error(f"Error in text_to_music: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def image_to_music(self, 
                            image_data: Union[str, bytes],
                            duration: int = 10,
                            temperature: float = 1.0) -> Dict:
        """
        图片生成音乐
        
        Args:
            image_data: 图片数据 (base64字符串或字节)
            duration: 音乐时长(秒)
            temperature: 生成温度
            
        Returns:
            包含生成音乐的字典
        """
        try:
            # 处理图片数据
            if isinstance(image_data, str):
                if image_data.startswith('data:image'):
                    # 处理base64格式
                    image_data = image_data.split(',')[1]
                image_bytes = base64.b64decode(image_data)
            else:
                image_bytes = image_data
            
            # 加载图片
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            
            # 生成图片描述
            inputs = self.image_caption_processor(image, return_tensors="pt")
            out = self.image_caption_model.generate(**inputs, max_length=50)
            caption = self.image_caption_processor.decode(out[0], skip_special_tokens=True)
            
            # 将图片描述转换为音乐描述
            music_description = self._image_caption_to_music_prompt(caption)
            
            # 生成音乐
            music_result = await self.text_to_music(
                text=music_description,
                duration=duration,
                temperature=temperature
            )
            
            if music_result["success"]:
                music_result["image_caption"] = caption
                music_result["music_description"] = music_description
            
            return music_result
            
        except Exception as e:
            logger.error(f"Error in image_to_music: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def _image_caption_to_music_prompt(self, caption: str) -> str:
        """
        将图片描述转换为音乐生成提示词
        """
        # 情感和场景映射
        emotion_mapping = {
            "sunset": "peaceful, warm, ambient music",
            "ocean": "flowing, calm, nature sounds",
            "forest": "mysterious, natural, acoustic",
            "city": "urban, electronic, energetic",
            "mountain": "epic, orchestral, inspiring",
            "flower": "gentle, classical, beautiful",
            "storm": "dramatic, intense, powerful",
            "night": "dark, atmospheric, ambient",
            "happy": "upbeat, joyful, major key",
            "sad": "melancholic, minor key, slow",
            "peaceful": "calm, relaxing, soft",
            "exciting": "energetic, fast tempo, dynamic"
        }
        
        # 分析描述中的关键词
        caption_lower = caption.lower()
        music_elements = []
        
        for keyword, music_style in emotion_mapping.items():
            if keyword in caption_lower:
                music_elements.append(music_style)
        
        if not music_elements:
            # 默认根据描述生成通用音乐提示
            music_elements.append("ambient, atmospheric music inspired by the scene")
        
        return f"Create {', '.join(music_elements)} that captures the mood of: {caption}"

    async def batch_generate(self, requests: List[Dict]) -> List[Dict]:
        """
        批量生成媒体内容
        
        Args:
            requests: 生成请求列表
            
        Returns:
            生成结果列表
        """
        results = []
        
        for request in requests:
            request_type = request.get("type")
            
            if request_type == "text_to_image":
                result = await self.text_to_image(**request.get("params", {}))
            elif request_type == "text_to_music":
                result = await self.text_to_music(**request.get("params", {}))
            elif request_type == "image_to_music":
                result = await self.image_to_music(**request.get("params", {}))
            elif request_type == "image_variations":
                result = await self.generate_image_variations(**request.get("params", {}))
            elif request_type == "upscale_image":
                result = await self.upscale_image(**request.get("params", {}))
            else:
                result = {
                    "success": False,
                    "error": f"Unknown request type: {request_type}"
                }
            
            result["request_id"] = request.get("id")
            results.append(result)
        
        return results

    def get_model_info(self) -> Dict:
        """获取模型信息"""
        bagel_info = self.bagel_generator.get_model_info()
        
        return {
            "image_generation": bagel_info,
            "music_generation": {
                "model_name": "MusicGen",
                "model_id": "facebook/musicgen-medium",
                "supported_features": ["text_to_music", "image_to_music"],
                "max_duration": 30,
                "sample_rate": self.music_pipeline.sample_rate if self.music_pipeline else 32000
            },
            "image_captioning": {
                "model_name": "BLIP",
                "model_id": "Salesforce/blip-image-captioning-base",
                "supported_features": ["image_captioning"]
            },
            "service_features": [
                "text_to_image",
                "text_to_music", 
                "image_to_music",
                "image_variations",
                "image_upscaling",
                "batch_processing"
            ]
        }

# 全局Bagel媒体生成服务实例
bagel_media_service = BagelMediaGenerationService()
