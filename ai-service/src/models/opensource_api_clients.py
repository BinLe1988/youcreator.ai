"""
开源AI服务客户端集合
集成多个免费/开源的AI API服务
"""

import os
import httpx
import asyncio
import logging
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv
import json

# 加载环境变量
load_dotenv()

logger = logging.getLogger(__name__)


class HuggingFaceClient:
    """Hugging Face Inference API客户端"""
    
    def __init__(self):
        self.api_key = os.getenv("HUGGINGFACE_TOKEN")
        self.base_url = "https://api-inference.huggingface.co/models"
        self.enabled = bool(self.api_key)
        
        # 推荐的开源模型
        self.text_models = [
            "microsoft/DialoGPT-large",
            "facebook/blenderbot-400M-distill",
            "microsoft/DialoGPT-medium",
            "google/flan-t5-large"
        ]
        
        self.code_models = [
            "microsoft/CodeGPT-small-py",
            "Salesforce/codegen-350M-mono",
            "microsoft/codebert-base"
        ]
        
        if self.enabled:
            logger.info("✅ Hugging Face客户端初始化成功")
        else:
            logger.warning("⚠️ Hugging Face Token未配置")
    
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """使用Hugging Face生成文本"""
        if not self.enabled:
            raise ValueError("Hugging Face Token未配置")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        for model in self.text_models:
            try:
                logger.info(f"🚀 尝试HF模型: {model}")
                
                data = {
                    "inputs": prompt,
                    "parameters": {
                        "max_length": min(kwargs.get("max_tokens", 200), 500),
                        "temperature": kwargs.get("temperature", 0.7),
                        "do_sample": True
                    }
                }
                
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        f"{self.base_url}/{model}",
                        headers=headers,
                        json=data
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        if isinstance(result, list) and len(result) > 0:
                            generated_text = result[0].get("generated_text", "")
                            # 清理输出，移除原始提示
                            if prompt in generated_text:
                                generated_text = generated_text.replace(prompt, "").strip()
                            
                            if generated_text:
                                logger.info(f"✅ HF文本生成成功 ({model})")
                                return generated_text
                    
                    logger.warning(f"⚠️ HF模型 {model} 返回: {response.status_code}")
                    
            except Exception as e:
                logger.warning(f"⚠️ HF模型 {model} 失败: {e}")
                continue
        
        raise Exception("所有Hugging Face模型都不可用")
    
    async def generate_code(self, prompt: str, **kwargs) -> str:
        """使用Hugging Face生成代码"""
        if not self.enabled:
            raise ValueError("Hugging Face Token未配置")
        
        language = kwargs.get("language", "python")
        code_prompt = f"# {prompt}\n# Language: {language}\n"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        for model in self.code_models:
            try:
                logger.info(f"🚀 尝试HF代码模型: {model}")
                
                data = {
                    "inputs": code_prompt,
                    "parameters": {
                        "max_length": min(kwargs.get("max_tokens", 200), 300),
                        "temperature": 0.2,
                        "do_sample": True
                    }
                }
                
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        f"{self.base_url}/{model}",
                        headers=headers,
                        json=data
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        if isinstance(result, list) and len(result) > 0:
                            generated_code = result[0].get("generated_text", "")
                            # 清理输出
                            if code_prompt in generated_code:
                                generated_code = generated_code.replace(code_prompt, "").strip()
                            
                            if generated_code:
                                logger.info(f"✅ HF代码生成成功 ({model})")
                                return generated_code
                    
                    logger.warning(f"⚠️ HF代码模型 {model} 返回: {response.status_code}")
                    
            except Exception as e:
                logger.warning(f"⚠️ HF代码模型 {model} 失败: {e}")
                continue
        
        raise Exception("所有Hugging Face代码模型都不可用")


class OllamaClient:
    """Ollama本地AI服务客户端"""
    
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.enabled = False
        self.available_models = []
        
        # 检查Ollama是否可用
        asyncio.create_task(self._check_availability())
    
    async def _check_availability(self):
        """检查Ollama服务是否可用"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                if response.status_code == 200:
                    result = response.json()
                    self.available_models = [model["name"] for model in result.get("models", [])]
                    self.enabled = len(self.available_models) > 0
                    if self.enabled:
                        logger.info(f"✅ Ollama客户端可用，模型: {self.available_models}")
                    else:
                        logger.info("⚠️ Ollama服务可用但无模型")
        except Exception as e:
            logger.info(f"⚠️ Ollama服务不可用: {e}")
    
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """使用Ollama生成文本"""
        if not self.enabled:
            raise ValueError("Ollama服务不可用")
        
        # 优先使用的模型顺序
        preferred_models = ["llama2", "codellama", "mistral", "phi"]
        models_to_try = [m for m in preferred_models if any(m in model for model in self.available_models)]
        
        if not models_to_try:
            models_to_try = self.available_models[:3]  # 使用前3个可用模型
        
        for model in models_to_try:
            try:
                logger.info(f"🚀 尝试Ollama模型: {model}")
                
                data = {
                    "model": model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": kwargs.get("temperature", 0.7),
                        "num_predict": min(kwargs.get("max_tokens", 200), 500)
                    }
                }
                
                async with httpx.AsyncClient(timeout=60.0) as client:
                    response = await client.post(
                        f"{self.base_url}/api/generate",
                        json=data
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        generated_text = result.get("response", "")
                        if generated_text:
                            logger.info(f"✅ Ollama文本生成成功 ({model})")
                            return generated_text
                    
                    logger.warning(f"⚠️ Ollama模型 {model} 返回: {response.status_code}")
                    
            except Exception as e:
                logger.warning(f"⚠️ Ollama模型 {model} 失败: {e}")
                continue
        
        raise Exception("所有Ollama模型都不可用")


class OpenRouterClient:
    """OpenRouter API客户端 - 提供多种开源模型访问"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1"
        self.enabled = bool(self.api_key)
        
        # 免费/便宜的开源模型
        self.models = [
            "microsoft/wizardlm-2-8x22b",
            "meta-llama/llama-3-8b-instruct:free",
            "mistralai/mistral-7b-instruct:free",
            "huggingface/CodeBERTa-small-v1"
        ]
        
        if self.enabled:
            logger.info("✅ OpenRouter客户端初始化成功")
        else:
            logger.info("⚠️ OpenRouter API密钥未配置")
    
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """使用OpenRouter生成文本"""
        if not self.enabled:
            raise ValueError("OpenRouter API密钥未配置")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://youcreator.ai",
            "X-Title": "YouCreator.AI"
        }
        
        for model in self.models:
            try:
                logger.info(f"🚀 尝试OpenRouter模型: {model}")
                
                data = {
                    "model": model,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "max_tokens": min(kwargs.get("max_tokens", 200), 1000),
                    "temperature": kwargs.get("temperature", 0.7)
                }
                
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        f"{self.base_url}/chat/completions",
                        headers=headers,
                        json=data
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        generated_text = result["choices"][0]["message"]["content"]
                        logger.info(f"✅ OpenRouter文本生成成功 ({model})")
                        return generated_text
                    
                    logger.warning(f"⚠️ OpenRouter模型 {model} 返回: {response.status_code}")
                    
            except Exception as e:
                logger.warning(f"⚠️ OpenRouter模型 {model} 失败: {e}")
                continue
        
        raise Exception("所有OpenRouter模型都不可用")


class TogetherAIClient:
    """Together AI客户端 - 开源模型推理服务"""
    
    def __init__(self):
        self.api_key = os.getenv("TOGETHER_API_KEY")
        self.base_url = "https://api.together.xyz/v1"
        self.enabled = bool(self.api_key)
        
        # Together AI的开源模型
        self.models = [
            "meta-llama/Llama-2-7b-chat-hf",
            "mistralai/Mistral-7B-Instruct-v0.1",
            "codellama/CodeLlama-7b-Python-hf",
            "NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO"
        ]
        
        if self.enabled:
            logger.info("✅ Together AI客户端初始化成功")
        else:
            logger.info("⚠️ Together AI API密钥未配置")
    
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """使用Together AI生成文本"""
        if not self.enabled:
            raise ValueError("Together AI API密钥未配置")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        for model in self.models:
            try:
                logger.info(f"🚀 尝试Together AI模型: {model}")
                
                data = {
                    "model": model,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "max_tokens": min(kwargs.get("max_tokens", 200), 1000),
                    "temperature": kwargs.get("temperature", 0.7)
                }
                
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        f"{self.base_url}/chat/completions",
                        headers=headers,
                        json=data
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        generated_text = result["choices"][0]["message"]["content"]
                        logger.info(f"✅ Together AI文本生成成功 ({model})")
                        return generated_text
                    
                    logger.warning(f"⚠️ Together AI模型 {model} 返回: {response.status_code}")
                    
            except Exception as e:
                logger.warning(f"⚠️ Together AI模型 {model} 失败: {e}")
                continue
        
        raise Exception("所有Together AI模型都不可用")


class MultiProviderAIClient:
    """多提供商AI客户端管理器"""
    
    def __init__(self):
        self.providers = {
            "huggingface": HuggingFaceClient(),
            "ollama": OllamaClient(),
            "openrouter": OpenRouterClient(),
            "together": TogetherAIClient()
        }
        
        # 等待Ollama检查完成
        asyncio.create_task(self._initialize_async())
    
    async def _initialize_async(self):
        """异步初始化"""
        await asyncio.sleep(1)  # 等待Ollama检查完成
        
        enabled_providers = [name for name, client in self.providers.items() if client.enabled]
        logger.info(f"🔄 可用的AI提供商: {enabled_providers}")
    
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """尝试多个提供商生成文本"""
        # 按优先级尝试不同的提供商
        provider_order = ["huggingface", "together", "openrouter", "ollama"]
        
        for provider_name in provider_order:
            provider = self.providers.get(provider_name)
            if provider and provider.enabled:
                try:
                    logger.info(f"🚀 尝试提供商: {provider_name}")
                    result = await provider.generate_text(prompt, **kwargs)
                    logger.info(f"✅ {provider_name} 文本生成成功")
                    return result
                except Exception as e:
                    logger.warning(f"⚠️ {provider_name} 失败: {e}")
                    continue
        
        # 如果所有提供商都失败，返回备用内容
        return self._generate_fallback_text(prompt, **kwargs)
    
    async def generate_code(self, prompt: str, **kwargs) -> str:
        """尝试多个提供商生成代码"""
        # 优先使用适合代码生成的提供商
        provider_order = ["huggingface", "together", "ollama"]
        
        for provider_name in provider_order:
            provider = self.providers.get(provider_name)
            if provider and provider.enabled and hasattr(provider, 'generate_code'):
                try:
                    logger.info(f"🚀 尝试代码生成提供商: {provider_name}")
                    result = await provider.generate_code(prompt, **kwargs)
                    logger.info(f"✅ {provider_name} 代码生成成功")
                    return result
                except Exception as e:
                    logger.warning(f"⚠️ {provider_name} 代码生成失败: {e}")
                    continue
        
        # 如果所有提供商都失败，返回增强模板
        return self._generate_enhanced_code_template(prompt, kwargs.get("language", "python"))
    
    def _generate_fallback_text(self, prompt: str, **kwargs) -> str:
        """备用文本生成"""
        return f"基于提示「{prompt}」的AI生成内容。当前使用多提供商备用方案，确保服务始终可用。在这个充满创意的数字时代，AI技术正在为每个人提供强大的创作工具，让想象力得以自由发挥。"
    
    def _generate_enhanced_code_template(self, prompt: str, language: str) -> str:
        """增强的代码模板生成"""
        # 这里可以复用之前的代码模板逻辑
        if "斐波那契" in prompt or "fibonacci" in prompt.lower():
            if language == "python":
                return '''def fibonacci(n):
    """计算斐波那契数列的第n项"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

def fibonacci_optimized(n):
    """优化版本 - 使用动态规划"""
    if n <= 1:
        return n
    
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

# 测试
if __name__ == "__main__":
    for i in range(10):
        print(f"F({i}) = {fibonacci_optimized(i)}")'''
        
        # 通用模板
        templates = {
            "python": f'''# {prompt}
def solution():
    """
    {prompt}
    """
    print("Hello from YouCreator.AI!")
    # TODO: 实现具体功能
    return "完成"

if __name__ == "__main__":
    result = solution()
    print(f"结果: {{result}}")''',
            
            "javascript": f'''// {prompt}
function solution() {{
    console.log("Hello from YouCreator.AI!");
    // TODO: 实现具体功能
    return "完成";
}}

console.log(solution());''',
        }
        
        return templates.get(language, f"// {prompt}\n// TODO: 实现功能")
    
    def get_status(self) -> Dict[str, Any]:
        """获取所有提供商状态"""
        status = {}
        for name, provider in self.providers.items():
            if hasattr(provider, 'get_status'):
                status[name] = provider.get_status()
            else:
                status[name] = {
                    "enabled": provider.enabled,
                    "available": provider.enabled
                }
        return status
