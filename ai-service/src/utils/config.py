"""
AI服务配置管理
"""

import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置"""
    
    # 服务器配置
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # CORS配置
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8080"
    ]
    
    # 生成限制
    MAX_TEXT_LENGTH: int = 2000
    MAX_IMAGE_SIZE: int = 1024
    MAX_MUSIC_DURATION: int = 60
    MAX_CODE_LENGTH: int = 5000
    
    # 并发限制
    MAX_CONCURRENT_REQUESTS: int = 10
    REQUEST_TIMEOUT: int = 300
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        # 允许额外的字段
        extra = "allow"


# 全局配置实例
settings = Settings()
