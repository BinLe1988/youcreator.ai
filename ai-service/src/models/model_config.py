"""
AI模型配置管理器
支持多种模型提供商和本地部署
"""

import os
from enum import Enum
from typing import Dict, Any, Optional
from pydantic import BaseModel


class ModelProvider(str, Enum):
    """模型提供商"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    HUGGINGFACE = "huggingface"
    LOCAL = "local"
    REPLICATE = "replicate"
    STABILITY = "stability"


class ModelType(str, Enum):
    """模型类型"""
    TEXT = "text"
    IMAGE = "image"
    MUSIC = "music"
    CODE = "code"


class ModelConfig(BaseModel):
    """单个模型配置"""
    name: str
    provider: ModelProvider
    model_id: str
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    local_path: Optional[str] = None
    parameters: Dict[str, Any] = {}
    enabled: bool = True


class ModelsConfiguration:
    """模型配置管理器"""
    
    def __init__(self):
        self.configs: Dict[ModelType, ModelConfig] = {}
        self._load_from_env()
    
    def _load_from_env(self):
        """从环境变量加载配置"""
        
        # 文本生成模型配置
        text_provider = os.getenv("TEXT_MODEL_PROVIDER", "openai").lower()
        if text_provider == "openai":
            self.configs[ModelType.TEXT] = ModelConfig(
                name="OpenAI GPT",
                provider=ModelProvider.OPENAI,
                model_id=os.getenv("OPENAI_MODEL_TEXT", "gpt-3.5-turbo"),
                api_key=os.getenv("OPENAI_API_KEY"),
                base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
                parameters={
                    "temperature": float(os.getenv("TEXT_TEMPERATURE", "0.7")),
                    "max_tokens": int(os.getenv("TEXT_MAX_TOKENS", "1000")),
                }
            )
        elif text_provider == "local":
            self.configs[ModelType.TEXT] = ModelConfig(
                name="Local Text Model",
                provider=ModelProvider.LOCAL,
                model_id=os.getenv("TEXT_MODEL_ID", "llama2-7b"),
                local_path=os.getenv("TEXT_MODEL_PATH", "./models/text"),
                parameters={
                    "temperature": float(os.getenv("TEXT_TEMPERATURE", "0.7")),
                    "max_length": int(os.getenv("TEXT_MAX_LENGTH", "1000")),
                }
            )
        
        # 图像生成模型配置
        image_provider = os.getenv("IMAGE_MODEL_PROVIDER", "stability").lower()
        if image_provider == "openai":
            self.configs[ModelType.IMAGE] = ModelConfig(
                name="DALL-E",
                provider=ModelProvider.OPENAI,
                model_id=os.getenv("OPENAI_MODEL_IMAGE", "dall-e-3"),
                api_key=os.getenv("OPENAI_API_KEY"),
                base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
                parameters={
                    "size": os.getenv("IMAGE_SIZE", "1024x1024"),
                    "quality": os.getenv("IMAGE_QUALITY", "standard"),
                }
            )
        elif image_provider == "stability":
            self.configs[ModelType.IMAGE] = ModelConfig(
                name="Stable Diffusion",
                provider=ModelProvider.STABILITY,
                model_id=os.getenv("STABILITY_MODEL", "stable-diffusion-v1-6"),
                api_key=os.getenv("STABILITY_API_KEY"),
                base_url="https://api.stability.ai/v1",
                parameters={
                    "steps": int(os.getenv("IMAGE_STEPS", "30")),
                    "cfg_scale": float(os.getenv("IMAGE_CFG_SCALE", "7.0")),
                }
            )
        elif image_provider == "local":
            self.configs[ModelType.IMAGE] = ModelConfig(
                name="Local Stable Diffusion",
                provider=ModelProvider.LOCAL,
                model_id=os.getenv("IMAGE_MODEL_ID", "stable-diffusion-v1-5"),
                local_path=os.getenv("IMAGE_MODEL_PATH", "./models/image"),
                parameters={
                    "steps": int(os.getenv("IMAGE_STEPS", "20")),
                    "guidance_scale": float(os.getenv("IMAGE_GUIDANCE", "7.5")),
                }
            )
        
        # 音乐生成模型配置
        music_provider = os.getenv("MUSIC_MODEL_PROVIDER", "local").lower()
        if music_provider == "local":
            self.configs[ModelType.MUSIC] = ModelConfig(
                name="MusicGen",
                provider=ModelProvider.LOCAL,
                model_id=os.getenv("MUSIC_MODEL_ID", "musicgen-small"),
                local_path=os.getenv("MUSIC_MODEL_PATH", "./models/music"),
                parameters={
                    "duration": int(os.getenv("MUSIC_DURATION", "30")),
                    "top_k": int(os.getenv("MUSIC_TOP_K", "250")),
                }
            )
        elif music_provider == "replicate":
            self.configs[ModelType.MUSIC] = ModelConfig(
                name="Replicate MusicGen",
                provider=ModelProvider.REPLICATE,
                model_id="meta/musicgen:b05b1dff1d8c6dc63d14b0cdb42135378dcb87f6373b0d3d341ede46e59e2dab",
                api_key=os.getenv("REPLICATE_API_TOKEN"),
                base_url="https://api.replicate.com/v1",
                parameters={
                    "duration": int(os.getenv("MUSIC_DURATION", "30")),
                }
            )
        
        # 代码生成模型配置
        code_provider = os.getenv("CODE_MODEL_PROVIDER", "openai").lower()
        if code_provider == "openai":
            self.configs[ModelType.CODE] = ModelConfig(
                name="OpenAI Codex",
                provider=ModelProvider.OPENAI,
                model_id=os.getenv("OPENAI_MODEL_CODE", "gpt-4"),
                api_key=os.getenv("OPENAI_API_KEY"),
                base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
                parameters={
                    "temperature": float(os.getenv("CODE_TEMPERATURE", "0.2")),
                    "max_tokens": int(os.getenv("CODE_MAX_TOKENS", "1000")),
                }
            )
        elif code_provider == "local":
            self.configs[ModelType.CODE] = ModelConfig(
                name="CodeLlama",
                provider=ModelProvider.LOCAL,
                model_id=os.getenv("CODE_MODEL_ID", "codellama-7b"),
                local_path=os.getenv("CODE_MODEL_PATH", "./models/code"),
                parameters={
                    "temperature": float(os.getenv("CODE_TEMPERATURE", "0.2")),
                    "max_length": int(os.getenv("CODE_MAX_LENGTH", "1000")),
                }
            )
    
    def get_config(self, model_type: ModelType) -> Optional[ModelConfig]:
        """获取指定类型的模型配置"""
        return self.configs.get(model_type)
    
    def is_enabled(self, model_type: ModelType) -> bool:
        """检查模型是否启用"""
        config = self.get_config(model_type)
        return config is not None and config.enabled
    
    def validate_config(self, model_type: ModelType) -> bool:
        """验证模型配置是否有效"""
        config = self.get_config(model_type)
        if not config:
            return False
        
        # 检查API密钥
        if config.provider in [ModelProvider.OPENAI, ModelProvider.ANTHROPIC, 
                              ModelProvider.STABILITY, ModelProvider.REPLICATE]:
            if not config.api_key:
                return False
        
        # 检查本地模型路径
        if config.provider == ModelProvider.LOCAL:
            if not config.local_path or not os.path.exists(config.local_path):
                return False
        
        return True
    
    def get_status(self) -> Dict[str, Any]:
        """获取所有模型的状态"""
        status = {}
        for model_type in ModelType:
            config = self.get_config(model_type)
            if config:
                status[model_type.value] = {
                    "name": config.name,
                    "provider": config.provider.value,
                    "model_id": config.model_id,
                    "enabled": config.enabled,
                    "valid": self.validate_config(model_type)
                }
            else:
                status[model_type.value] = {
                    "enabled": False,
                    "valid": False
                }
        return status


# 全局配置实例
model_config = ModelsConfiguration()
