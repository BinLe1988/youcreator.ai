"""
AI媒体生成服务 - 文字配图、文字配乐、图片配乐
"""
import asyncio
import base64
import io
import logging
from typing import Dict, List, Optional, Union
from PIL import Image
import torch
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
from transformers import pipeline, BlipProcessor, BlipForConditionalGeneration
import librosa
import numpy as np
from audiocraft.models import MusicGen
from audiocraft.data.audio import audio_write
import tempfile
import os

logger = logging.getLogger(__name__)

class MediaGenerationService:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.image_pipeline = None
        self.music_pipeline = None
        self.image_caption_processor = None
        self.image_caption_model = None
        self._initialize_models()
    
    def _initialize_models(self):
        """初始化AI模型"""
        try:
            # 初始化图像生成模型
            logger.info("Loading Stable Diffusion model...")
            self.image_pipeline = StableDiffusionPipeline.from_pretrained(
                "runwayml/stable-diffusion-v1-5",
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                safety_checker=None,
                requires_safety_checker=False
            )
            self.image_pipeline.scheduler = DPMSolverMultistepScheduler.from_config(
                self.image_pipeline.scheduler.config
            )
            self.image_pipeline = self.image_pipeline.to(self.device)
            
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
                           guidance_scale: float = 7.5) -> Dict:
        """
        文字生成图片
        
        Args:
            text: 输入文字描述
            style: 图片风格 (realistic, artistic, cartoon, etc.)
            width: 图片宽度
            height: 图片高度
            num_inference_steps: 推理步数
            guidance_scale: 引导强度
            
        Returns:
            包含生成图片的字典
        """
        try:
            # 根据风格调整提示词
            style_prompts = {
                "realistic": "photorealistic, high quality, detailed",
                "artistic": "artistic, painting style, beautiful",
                "cartoon": "cartoon style, animated, colorful",
                "sketch": "pencil sketch, black and white, artistic",
                "oil_painting": "oil painting style, classical art",
                "watercolor": "watercolor painting, soft colors"
            }
            
            enhanced_prompt = f"{text}, {style_prompts.get(style, 'high quality')}"
            negative_prompt = "blurry, low quality, distorted, ugly, bad anatomy"
            
            # 生成图片
            with torch.autocast(self.device):
                result = self.image_pipeline(
                    prompt=enhanced_prompt,
                    negative_prompt=negative_prompt,
                    width=width,
                    height=height,
                    num_inference_steps=num_inference_steps,
                    guidance_scale=guidance_scale,
                    generator=torch.Generator(device=self.device).manual_seed(42)
                )
            
            # 转换为base64
            image = result.images[0]
            buffer = io.BytesIO()
            image.save(buffer, format='PNG')
            image_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            return {
                "success": True,
                "image": f"data:image/png;base64,{image_base64}",
                "prompt": enhanced_prompt,
                "style": style,
                "dimensions": {"width": width, "height": height}
            }
            
        except Exception as e:
            logger.error(f"Error in text_to_image: {e}")
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
            else:
                result = {
                    "success": False,
                    "error": f"Unknown request type: {request_type}"
                }
            
            result["request_id"] = request.get("id")
            results.append(result)
        
        return results

# 全局服务实例
media_service = MediaGenerationService()
