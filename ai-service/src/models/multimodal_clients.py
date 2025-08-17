"""
多模态AI服务客户端
支持图像生成、音乐生成和智能内容匹配
"""

import os
import httpx
import asyncio
import logging
import base64
import json
from typing import Dict, Any, Optional, List, Union
from dotenv import load_dotenv
import io
from PIL import Image
import random

# 加载环境变量
load_dotenv()

logger = logging.getLogger(__name__)


class ImageGenerationClient:
    """图像生成客户端"""
    
    def __init__(self):
        # 支持多个图像生成服务
        self.providers = {
            "stability": {
                "api_key": os.getenv("STABILITY_API_KEY"),
                "base_url": "https://api.stability.ai/v1",
                "enabled": bool(os.getenv("STABILITY_API_KEY"))
            },
            "replicate": {
                "api_key": os.getenv("REPLICATE_API_TOKEN"),
                "base_url": "https://api.replicate.com/v1",
                "enabled": bool(os.getenv("REPLICATE_API_TOKEN"))
            },
            "huggingface": {
                "api_key": os.getenv("HUGGINGFACE_TOKEN"),
                "base_url": "https://api-inference.huggingface.co/models",
                "enabled": bool(os.getenv("HUGGINGFACE_TOKEN"))
            }
        }
        
        # 图像生成模型配置
        self.models = {
            "stability": ["stable-diffusion-v1-6", "stable-diffusion-xl-1024-v1-0"],
            "replicate": ["stability-ai/stable-diffusion", "stability-ai/sdxl"],
            "huggingface": [
                "runwayml/stable-diffusion-v1-5",
                "stabilityai/stable-diffusion-2-1",
                "CompVis/stable-diffusion-v1-4"
            ]
        }
        
        enabled_providers = [name for name, config in self.providers.items() if config["enabled"]]
        logger.info(f"🎨 图像生成客户端初始化，可用提供商: {enabled_providers}")
    
    async def generate_image_for_text(self, text: str, style: str = "realistic", **kwargs) -> bytes:
        """为文字生成配图"""
        # 分析文本内容，生成合适的图像提示
        image_prompt = self._analyze_text_for_image(text, style)
        
        return await self.generate_image(image_prompt, **kwargs)
    
    def _analyze_text_for_image(self, text: str, style: str) -> str:
        """分析文本内容，生成图像提示"""
        # 关键词提取和场景分析
        keywords = self._extract_keywords(text)
        scene_type = self._determine_scene_type(text)
        mood = self._analyze_mood(text)
        
        # 构建图像提示
        base_prompt = f"{scene_type}, {mood} atmosphere"
        
        if keywords:
            base_prompt += f", featuring {', '.join(keywords[:3])}"
        
        # 添加风格描述
        style_prompts = {
            "realistic": "photorealistic, high quality, detailed",
            "artistic": "artistic, painterly, beautiful composition",
            "cartoon": "cartoon style, colorful, friendly",
            "abstract": "abstract art, creative, modern",
            "vintage": "vintage style, retro, nostalgic",
            "minimalist": "minimalist, clean, simple"
        }
        
        style_desc = style_prompts.get(style, "high quality, detailed")
        final_prompt = f"{base_prompt}, {style_desc}"
        
        logger.info(f"🎨 为文本生成图像提示: {final_prompt}")
        return final_prompt
    
    def _extract_keywords(self, text: str) -> List[str]:
        """提取关键词"""
        # 简单的关键词提取（可以用更复杂的NLP）
        keywords = []
        
        # 常见的视觉元素关键词
        visual_keywords = {
            "自然": ["nature", "landscape", "trees", "mountains"],
            "城市": ["city", "buildings", "urban", "skyline"],
            "人物": ["person", "people", "character", "portrait"],
            "动物": ["animal", "wildlife", "pet"],
            "科技": ["technology", "futuristic", "digital"],
            "艺术": ["art", "creative", "artistic"],
            "食物": ["food", "cooking", "restaurant"],
            "旅行": ["travel", "journey", "adventure"],
            "家庭": ["family", "home", "cozy"],
            "工作": ["office", "business", "professional"]
        }
        
        text_lower = text.lower()
        for chinese_key, english_words in visual_keywords.items():
            if chinese_key in text:
                keywords.extend(english_words[:2])
        
        return keywords[:5]  # 限制关键词数量
    
    def _determine_scene_type(self, text: str) -> str:
        """确定场景类型"""
        scene_indicators = {
            "室内": "indoor scene",
            "室外": "outdoor scene", 
            "风景": "landscape",
            "城市": "cityscape",
            "自然": "natural environment",
            "办公": "office environment",
            "家": "home interior",
            "街道": "street scene",
            "公园": "park scene",
            "海边": "beach scene",
            "山": "mountain scene",
            "森林": "forest scene"
        }
        
        for indicator, scene in scene_indicators.items():
            if indicator in text:
                return scene
        
        return "beautiful scene"
    
    def _analyze_mood(self, text: str) -> str:
        """分析情绪氛围"""
        mood_indicators = {
            "快乐": "joyful, bright",
            "悲伤": "melancholic, soft lighting",
            "激动": "energetic, vibrant",
            "平静": "peaceful, serene",
            "神秘": "mysterious, dramatic",
            "浪漫": "romantic, warm",
            "科幻": "futuristic, sci-fi",
            "恐怖": "dark, ominous",
            "温馨": "cozy, warm",
            "专业": "professional, clean"
        }
        
        for mood_word, description in mood_indicators.items():
            if mood_word in text:
                return description
        
        return "pleasant, well-lit"
    
    async def generate_image(self, prompt: str, **kwargs) -> bytes:
        """生成图像"""
        width = kwargs.get("width", 512)
        height = kwargs.get("height", 512)
        
        # 按优先级尝试不同的提供商
        for provider_name in ["huggingface", "stability", "replicate"]:
            provider = self.providers.get(provider_name)
            if provider and provider["enabled"]:
                try:
                    logger.info(f"🚀 尝试 {provider_name} 生成图像")
                    return await self._generate_with_provider(provider_name, prompt, width, height)
                except Exception as e:
                    logger.warning(f"⚠️ {provider_name} 图像生成失败: {e}")
                    continue
        
        # 如果所有提供商都失败，生成占位符图像
        return self._generate_placeholder_image(prompt, width, height)
    
    async def _generate_with_provider(self, provider_name: str, prompt: str, width: int, height: int) -> bytes:
        """使用指定提供商生成图像"""
        if provider_name == "huggingface":
            return await self._generate_with_huggingface(prompt, width, height)
        elif provider_name == "stability":
            return await self._generate_with_stability(prompt, width, height)
        elif provider_name == "replicate":
            return await self._generate_with_replicate(prompt, width, height)
        else:
            raise ValueError(f"不支持的提供商: {provider_name}")
    
    async def _generate_with_huggingface(self, prompt: str, width: int, height: int) -> bytes:
        """使用Hugging Face生成图像"""
        provider = self.providers["huggingface"]
        headers = {
            "Authorization": f"Bearer {provider['api_key']}",
            "Content-Type": "application/json"
        }
        
        for model in self.models["huggingface"]:
            try:
                data = {
                    "inputs": prompt,
                    "parameters": {
                        "width": width,
                        "height": height,
                        "num_inference_steps": 20
                    }
                }
                
                async with httpx.AsyncClient(timeout=60.0) as client:
                    response = await client.post(
                        f"{provider['base_url']}/{model}",
                        headers=headers,
                        json=data
                    )
                    
                    if response.status_code == 200:
                        return response.content
                    else:
                        logger.warning(f"HF模型 {model} 返回: {response.status_code}")
                        continue
                        
            except Exception as e:
                logger.warning(f"HF模型 {model} 失败: {e}")
                continue
        
        raise Exception("所有Hugging Face图像模型都不可用")
    
    async def _generate_with_stability(self, prompt: str, width: int, height: int) -> bytes:
        """使用Stability AI生成图像"""
        provider = self.providers["stability"]
        headers = {
            "Authorization": f"Bearer {provider['api_key']}",
            "Content-Type": "application/json"
        }
        
        data = {
            "text_prompts": [{"text": prompt}],
            "cfg_scale": 7,
            "height": height,
            "width": width,
            "steps": 20,
            "samples": 1
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{provider['base_url']}/generation/stable-diffusion-v1-6/text-to-image",
                headers=headers,
                json=data
            )
            
            if response.status_code == 200:
                result = response.json()
                image_data = result["artifacts"][0]["base64"]
                return base64.b64decode(image_data)
            else:
                raise Exception(f"Stability API错误: {response.status_code}")
    
    async def _generate_with_replicate(self, prompt: str, width: int, height: int) -> bytes:
        """使用Replicate生成图像"""
        # Replicate实现（需要更复杂的API调用）
        raise Exception("Replicate图像生成暂未实现")
    
    def _generate_placeholder_image(self, prompt: str, width: int, height: int) -> bytes:
        """生成占位符图像"""
        # 创建一个简单的占位符图像
        img = Image.new('RGB', (width, height), color=(135, 206, 235))  # 天蓝色背景
        
        # 可以添加一些简单的图形或文字
        from PIL import ImageDraw, ImageFont
        draw = ImageDraw.Draw(img)
        
        # 添加文字
        try:
            # 尝试使用系统字体
            font = ImageFont.load_default()
        except:
            font = None
        
        text = "AI Generated Image"
        if font:
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            x = (width - text_width) // 2
            y = (height - text_height) // 2
            draw.text((x, y), text, fill=(255, 255, 255), font=font)
        
        # 转换为bytes
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        return img_bytes.getvalue()


class MusicGenerationClient:
    """音乐生成客户端"""
    
    def __init__(self):
        # 支持多个音乐生成服务
        self.providers = {
            "replicate": {
                "api_key": os.getenv("REPLICATE_API_TOKEN"),
                "base_url": "https://api.replicate.com/v1",
                "enabled": bool(os.getenv("REPLICATE_API_TOKEN"))
            },
            "huggingface": {
                "api_key": os.getenv("HUGGINGFACE_TOKEN"),
                "base_url": "https://api-inference.huggingface.co/models",
                "enabled": bool(os.getenv("HUGGINGFACE_TOKEN"))
            }
        }
        
        # 音乐风格模板
        self.style_templates = {
            "轻松": "upbeat, cheerful, light",
            "悲伤": "melancholic, slow, emotional",
            "激动": "energetic, fast, exciting",
            "平静": "calm, peaceful, ambient",
            "浪漫": "romantic, gentle, warm",
            "神秘": "mysterious, atmospheric, dark",
            "史诗": "epic, orchestral, dramatic",
            "电子": "electronic, synthesized, modern",
            "古典": "classical, orchestral, elegant",
            "爵士": "jazz, smooth, sophisticated"
        }
        
        enabled_providers = [name for name, config in self.providers.items() if config["enabled"]]
        logger.info(f"🎵 音乐生成客户端初始化，可用提供商: {enabled_providers}")
    
    async def generate_music_for_text(self, text: str, duration: int = 30, **kwargs) -> bytes:
        """为文字生成配乐"""
        # 分析文本情感和风格
        music_style = self._analyze_text_for_music(text)
        
        return await self.generate_music(music_style, duration, **kwargs)
    
    async def generate_music_for_image(self, image_description: str, duration: int = 30, **kwargs) -> bytes:
        """为图片生成配乐"""
        # 分析图像描述，生成音乐风格
        music_style = self._analyze_image_for_music(image_description)
        
        return await self.generate_music(music_style, duration, **kwargs)
    
    def _analyze_text_for_music(self, text: str) -> str:
        """分析文本生成音乐风格描述"""
        # 情感分析
        emotions = self._detect_emotions(text)
        tempo = self._determine_tempo(text)
        genre = self._suggest_genre(text)
        
        style_desc = f"{emotions}, {tempo} tempo, {genre} style"
        logger.info(f"🎵 为文本生成音乐风格: {style_desc}")
        return style_desc
    
    def _analyze_image_for_music(self, image_description: str) -> str:
        """分析图像描述生成音乐风格"""
        # 根据图像内容推断音乐风格
        scene_music_map = {
            "nature": "ambient, peaceful, organic sounds",
            "city": "urban, electronic, rhythmic",
            "portrait": "intimate, emotional, personal",
            "landscape": "expansive, atmospheric, cinematic",
            "abstract": "experimental, creative, unique",
            "vintage": "nostalgic, warm, classic"
        }
        
        for scene, music_style in scene_music_map.items():
            if scene in image_description.lower():
                return music_style
        
        return "ambient, pleasant, background music"
    
    def _detect_emotions(self, text: str) -> str:
        """检测文本情感"""
        emotion_keywords = {
            "happy": ["快乐", "开心", "兴奋", "愉快", "欢乐"],
            "sad": ["悲伤", "难过", "忧郁", "沮丧", "失落"],
            "calm": ["平静", "安静", "宁静", "放松", "舒缓"],
            "energetic": ["激动", "活力", "充满", "热情", "动感"],
            "romantic": ["浪漫", "爱情", "温柔", "甜蜜", "情侣"],
            "mysterious": ["神秘", "未知", "奇怪", "诡异", "隐秘"]
        }
        
        for emotion, keywords in emotion_keywords.items():
            if any(keyword in text for keyword in keywords):
                return emotion
        
        return "neutral"
    
    def _determine_tempo(self, text: str) -> str:
        """确定音乐节拍"""
        fast_indicators = ["快", "急", "跑", "飞", "冲", "激动", "兴奋"]
        slow_indicators = ["慢", "缓", "静", "平", "轻", "柔", "悲"]
        
        if any(indicator in text for indicator in fast_indicators):
            return "fast"
        elif any(indicator in text for indicator in slow_indicators):
            return "slow"
        else:
            return "medium"
    
    def _suggest_genre(self, text: str) -> str:
        """建议音乐类型"""
        genre_keywords = {
            "classical": ["古典", "优雅", "正式", "传统"],
            "electronic": ["科技", "未来", "现代", "数字"],
            "jazz": ["爵士", "咖啡", "夜晚", "酒吧"],
            "ambient": ["环境", "背景", "氛围", "空间"],
            "orchestral": ["史诗", "宏大", "电影", "交响"]
        }
        
        for genre, keywords in genre_keywords.items():
            if any(keyword in text for keyword in keywords):
                return genre
        
        return "ambient"
    
    async def generate_music(self, style_description: str, duration: int = 30, **kwargs) -> bytes:
        """生成音乐"""
        # 尝试不同的提供商
        for provider_name in ["replicate", "huggingface"]:
            provider = self.providers.get(provider_name)
            if provider and provider["enabled"]:
                try:
                    logger.info(f"🚀 尝试 {provider_name} 生成音乐")
                    return await self._generate_with_provider(provider_name, style_description, duration)
                except Exception as e:
                    logger.warning(f"⚠️ {provider_name} 音乐生成失败: {e}")
                    continue
        
        # 如果所有提供商都失败，生成占位符音频
        return self._generate_placeholder_audio(style_description, duration)
    
    async def _generate_with_provider(self, provider_name: str, style: str, duration: int) -> bytes:
        """使用指定提供商生成音乐"""
        if provider_name == "replicate":
            return await self._generate_with_replicate(style, duration)
        elif provider_name == "huggingface":
            return await self._generate_with_huggingface(style, duration)
        else:
            raise ValueError(f"不支持的提供商: {provider_name}")
    
    async def _generate_with_replicate(self, style: str, duration: int) -> bytes:
        """使用Replicate生成音乐"""
        provider = self.providers["replicate"]
        headers = {
            "Authorization": f"Token {provider['api_key']}",
            "Content-Type": "application/json"
        }
        
        # MusicGen模型
        data = {
            "version": "b05b1dff1d8c6dc63d14b0cdb42135378dcb87f6373b0d3d341ede46e59e2dab",
            "input": {
                "prompt": style,
                "duration": duration,
                "temperature": 1,
                "top_k": 250,
                "top_p": 0,
                "seed": random.randint(1, 1000000)
            }
        }
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            # 创建预测
            response = await client.post(
                f"{provider['base_url']}/predictions",
                headers=headers,
                json=data
            )
            
            if response.status_code == 201:
                prediction = response.json()
                prediction_id = prediction["id"]
                
                # 轮询结果
                for _ in range(30):  # 最多等待30次
                    await asyncio.sleep(2)
                    
                    status_response = await client.get(
                        f"{provider['base_url']}/predictions/{prediction_id}",
                        headers=headers
                    )
                    
                    if status_response.status_code == 200:
                        result = status_response.json()
                        if result["status"] == "succeeded":
                            audio_url = result["output"]
                            # 下载音频文件
                            audio_response = await client.get(audio_url)
                            return audio_response.content
                        elif result["status"] == "failed":
                            raise Exception("音乐生成失败")
                
                raise Exception("音乐生成超时")
            else:
                raise Exception(f"Replicate API错误: {response.status_code}")
    
    async def _generate_with_huggingface(self, style: str, duration: int) -> bytes:
        """使用Hugging Face生成音乐"""
        # Hugging Face音乐生成实现
        raise Exception("Hugging Face音乐生成暂未实现")
    
    def _generate_placeholder_audio(self, style: str, duration: int) -> bytes:
        """生成占位符音频"""
        # 生成一个简单的音频占位符（静音或简单音调）
        import wave
        import struct
        
        # 创建一个简单的正弦波音频
        sample_rate = 44100
        frequency = 440  # A4音符
        frames = int(duration * sample_rate)
        
        audio_data = []
        for i in range(frames):
            # 生成正弦波
            value = int(32767 * 0.1 * (i % (sample_rate // frequency)) / (sample_rate // frequency))
            audio_data.append(struct.pack('<h', value))
        
        # 创建WAV文件
        audio_bytes = io.BytesIO()
        with wave.open(audio_bytes, 'wb') as wav_file:
            wav_file.setnchannels(1)  # 单声道
            wav_file.setsampwidth(2)  # 16位
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(b''.join(audio_data))
        
        return audio_bytes.getvalue()


class MultimodalContentMatcher:
    """多模态内容匹配器"""
    
    def __init__(self):
        self.image_client = ImageGenerationClient()
        self.music_client = MusicGenerationClient()
    
    async def create_complete_content(self, text: str, include_image: bool = True, 
                                    include_music: bool = True, **kwargs) -> Dict[str, Any]:
        """为文本创建完整的多模态内容"""
        result = {
            "text": text,
            "image": None,
            "music": None,
            "metadata": {
                "style_analysis": self._analyze_content_style(text),
                "generation_time": None
            }
        }
        
        import time
        start_time = time.time()
        
        tasks = []
        
        if include_image:
            image_style = kwargs.get("image_style", "realistic")
            tasks.append(self._generate_image_task(text, image_style, kwargs))
        
        if include_music:
            music_duration = kwargs.get("music_duration", 30)
            tasks.append(self._generate_music_task(text, music_duration, kwargs))
        
        # 并行生成图像和音乐
        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            task_index = 0
            if include_image:
                if not isinstance(results[task_index], Exception):
                    result["image"] = results[task_index]
                task_index += 1
            
            if include_music:
                if not isinstance(results[task_index], Exception):
                    result["music"] = results[task_index]
        
        result["metadata"]["generation_time"] = time.time() - start_time
        return result
    
    async def _generate_image_task(self, text: str, style: str, kwargs: Dict) -> bytes:
        """图像生成任务"""
        return await self.image_client.generate_image_for_text(
            text, 
            style=style,
            width=kwargs.get("image_width", 512),
            height=kwargs.get("image_height", 512)
        )
    
    async def _generate_music_task(self, text: str, duration: int, kwargs: Dict) -> bytes:
        """音乐生成任务"""
        return await self.music_client.generate_music_for_text(text, duration=duration)
    
    def _analyze_content_style(self, text: str) -> Dict[str, str]:
        """分析内容风格"""
        return {
            "mood": self._detect_mood(text),
            "genre": self._detect_genre(text),
            "visual_style": self._suggest_visual_style(text),
            "music_style": self._suggest_music_style(text)
        }
    
    def _detect_mood(self, text: str) -> str:
        """检测情绪"""
        mood_indicators = {
            "joyful": ["快乐", "开心", "兴奋", "愉快"],
            "melancholic": ["悲伤", "难过", "忧郁", "沮丧"],
            "peaceful": ["平静", "安静", "宁静", "放松"],
            "energetic": ["激动", "活力", "充满", "热情"],
            "romantic": ["浪漫", "爱情", "温柔", "甜蜜"],
            "mysterious": ["神秘", "未知", "奇怪", "诡异"]
        }
        
        for mood, keywords in mood_indicators.items():
            if any(keyword in text for keyword in keywords):
                return mood
        
        return "neutral"
    
    def _detect_genre(self, text: str) -> str:
        """检测类型"""
        genre_indicators = {
            "fantasy": ["魔法", "龙", "精灵", "魔幻"],
            "sci-fi": ["科技", "未来", "机器人", "太空"],
            "romance": ["爱情", "浪漫", "情侣", "约会"],
            "adventure": ["冒险", "探索", "旅行", "发现"],
            "mystery": ["神秘", "悬疑", "推理", "秘密"],
            "drama": ["戏剧", "情感", "人生", "故事"]
        }
        
        for genre, keywords in genre_indicators.items():
            if any(keyword in text for keyword in keywords):
                return genre
        
        return "general"
    
    def _suggest_visual_style(self, text: str) -> str:
        """建议视觉风格"""
        style_map = {
            "realistic": ["真实", "现实", "照片", "纪实"],
            "artistic": ["艺术", "绘画", "创意", "美术"],
            "cartoon": ["卡通", "动画", "可爱", "儿童"],
            "vintage": ["复古", "怀旧", "经典", "老式"],
            "minimalist": ["简约", "简单", "干净", "现代"]
        }
        
        for style, keywords in style_map.items():
            if any(keyword in text for keyword in keywords):
                return style
        
        return "realistic"
    
    def _suggest_music_style(self, text: str) -> str:
        """建议音乐风格"""
        style_map = {
            "orchestral": ["史诗", "宏大", "电影", "交响"],
            "electronic": ["科技", "未来", "现代", "数字"],
            "acoustic": ["自然", "温暖", "亲密", "原声"],
            "ambient": ["环境", "背景", "氛围", "空间"],
            "jazz": ["爵士", "咖啡", "夜晚", "酒吧"]
        }
        
        for style, keywords in style_map.items():
            if any(keyword in text for keyword in keywords):
                return style
        
        return "ambient"
