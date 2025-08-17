"""
AI模型管理器
负责加载、管理和调用各种AI模型
"""

import asyncio
import logging
from typing import Dict, Any, Optional
import torch
from transformers import (
    AutoTokenizer, AutoModelForCausalLM,
    pipeline, Pipeline
)
from diffusers import StableDiffusionPipeline
import gc

from ..utils.config import settings

logger = logging.getLogger(__name__)


class ModelManager:
    """AI模型管理器"""
    
    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.tokenizers: Dict[str, Any] = {}
        self.pipelines: Dict[str, Pipeline] = {}
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self._initialized = False
        
    async def initialize(self):
        """初始化所有模型"""
        if self._initialized:
            return
            
        logger.info("Initializing AI models...")
        
        try:
            # 初始化文本生成模型
            await self._init_text_model()
            
            # 初始化图像生成模型
            await self._init_image_model()
            
            # 初始化音乐生成模型
            await self._init_music_model()
            
            # 初始化代码生成模型
            await self._init_code_model()
            
            self._initialized = True
            logger.info("All models initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize models: {e}")
            raise
    
    async def _init_text_model(self):
        """初始化文本生成模型"""
        try:
            logger.info(f"Loading text model: {settings.TEXT_MODEL}")
            
            # 使用pipeline简化模型加载
            self.pipelines['text'] = pipeline(
                "text-generation",
                model=settings.TEXT_MODEL,
                device=0 if self.device == "cuda" else -1,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
            )
            
            logger.info("Text model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load text model: {e}")
            # 使用备用模型
            self.pipelines['text'] = pipeline(
                "text-generation",
                model="gpt2",
                device=0 if self.device == "cuda" else -1
            )
    
    async def _init_image_model(self):
        """初始化图像生成模型"""
        try:
            logger.info(f"Loading image model: {settings.IMAGE_MODEL}")
            
            self.pipelines['image'] = StableDiffusionPipeline.from_pretrained(
                settings.IMAGE_MODEL,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                safety_checker=None,
                requires_safety_checker=False
            )
            
            if self.device == "cuda":
                self.pipelines['image'] = self.pipelines['image'].to("cuda")
            
            logger.info("Image model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load image model: {e}")
            self.pipelines['image'] = None
    
    async def _init_music_model(self):
        """初始化音乐生成模型"""
        try:
            logger.info(f"Loading music model: {settings.MUSIC_MODEL}")
            
            # 音乐生成模型（需要额外的库支持）
            # 这里使用占位符，实际需要安装audiocraft
            self.pipelines['music'] = None
            logger.info("Music model placeholder loaded")
            
        except Exception as e:
            logger.error(f"Failed to load music model: {e}")
            self.pipelines['music'] = None
    
    async def _init_code_model(self):
        """初始化代码生成模型"""
        try:
            logger.info(f"Loading code model: {settings.CODE_MODEL}")
            
            self.pipelines['code'] = pipeline(
                "text-generation",
                model="microsoft/CodeGPT-small-py",  # 使用较小的代码模型
                device=0 if self.device == "cuda" else -1,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
            )
            
            logger.info("Code model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load code model: {e}")
            # 使用通用文本模型作为备用
            self.pipelines['code'] = self.pipelines.get('text')
    
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """生成文本"""
        if 'text' not in self.pipelines or self.pipelines['text'] is None:
            raise ValueError("Text model not available")
        
        try:
            max_length = min(kwargs.get('max_length', 100), settings.MAX_TEXT_LENGTH)
            temperature = kwargs.get('temperature', 0.7)
            
            result = self.pipelines['text'](
                prompt,
                max_length=max_length,
                temperature=temperature,
                do_sample=True,
                pad_token_id=self.pipelines['text'].tokenizer.eos_token_id
            )
            
            generated_text = result[0]['generated_text']
            # 移除原始prompt
            if generated_text.startswith(prompt):
                generated_text = generated_text[len(prompt):].strip()
            
            return generated_text
            
        except Exception as e:
            logger.error(f"Text generation failed: {e}")
            raise
    
    async def generate_image(self, prompt: str, **kwargs) -> bytes:
        """生成图像"""
        if 'image' not in self.pipelines or self.pipelines['image'] is None:
            raise ValueError("Image model not available")
        
        try:
            width = min(kwargs.get('width', 512), settings.MAX_IMAGE_SIZE)
            height = min(kwargs.get('height', 512), settings.MAX_IMAGE_SIZE)
            steps = kwargs.get('steps', 20)
            
            image = self.pipelines['image'](
                prompt,
                width=width,
                height=height,
                num_inference_steps=steps
            ).images[0]
            
            # 将PIL图像转换为bytes
            import io
            img_bytes = io.BytesIO()
            image.save(img_bytes, format='PNG')
            return img_bytes.getvalue()
            
        except Exception as e:
            logger.error(f"Image generation failed: {e}")
            raise
    
    async def generate_music(self, prompt: str, **kwargs) -> bytes:
        """生成音乐"""
        # 音乐生成功能的占位符实现
        logger.warning("Music generation not implemented yet")
        raise NotImplementedError("Music generation feature coming soon")
    
    async def generate_code(self, prompt: str, **kwargs) -> str:
        """生成代码"""
        if 'code' not in self.pipelines or self.pipelines['code'] is None:
            raise ValueError("Code model not available")
        
        try:
            language = kwargs.get('language', 'python')
            max_length = min(kwargs.get('max_length', 200), settings.MAX_CODE_LENGTH)
            
            # 为不同语言添加适当的前缀
            language_prefixes = {
                'python': '# Python code:\n',
                'javascript': '// JavaScript code:\n',
                'go': '// Go code:\n',
                'java': '// Java code:\n'
            }
            
            full_prompt = language_prefixes.get(language, '') + prompt
            
            result = self.pipelines['code'](
                full_prompt,
                max_length=max_length,
                temperature=0.3,  # 代码生成使用较低的温度
                do_sample=True,
                pad_token_id=self.pipelines['code'].tokenizer.eos_token_id
            )
            
            generated_code = result[0]['generated_text']
            # 移除前缀
            if generated_code.startswith(full_prompt):
                generated_code = generated_code[len(full_prompt):].strip()
            
            return generated_code
            
        except Exception as e:
            logger.error(f"Code generation failed: {e}")
            raise
    
    async def get_status(self) -> Dict[str, Any]:
        """获取模型状态"""
        return {
            'initialized': self._initialized,
            'device': self.device,
            'available_models': {
                'text': 'text' in self.pipelines and self.pipelines['text'] is not None,
                'image': 'image' in self.pipelines and self.pipelines['image'] is not None,
                'music': 'music' in self.pipelines and self.pipelines['music'] is not None,
                'code': 'code' in self.pipelines and self.pipelines['code'] is not None,
            },
            'memory_usage': self._get_memory_usage()
        }
    
    def _get_memory_usage(self) -> Dict[str, Any]:
        """获取内存使用情况"""
        if torch.cuda.is_available():
            return {
                'gpu_memory_allocated': torch.cuda.memory_allocated(),
                'gpu_memory_reserved': torch.cuda.memory_reserved(),
                'gpu_memory_total': torch.cuda.get_device_properties(0).total_memory
            }
        return {'cpu_only': True}
    
    async def cleanup(self):
        """清理资源"""
        logger.info("Cleaning up models...")
        
        for name, pipeline in self.pipelines.items():
            if pipeline is not None:
                del pipeline
        
        self.pipelines.clear()
        self.models.clear()
        self.tokenizers.clear()
        
        # 清理GPU内存
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        gc.collect()
        logger.info("Model cleanup completed")
