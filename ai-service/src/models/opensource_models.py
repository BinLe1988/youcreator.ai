"""
开源模型管理器
集成多种开源AI模型
"""

import os
import torch
import asyncio
import logging
from typing import Dict, Any, Optional, List
from pathlib import Path
import gc

logger = logging.getLogger(__name__)


class OpenSourceModelManager:
    """开源模型管理器"""
    
    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.models_dir = Path(os.getenv("MODEL_CACHE_DIR", "./models"))
        self._initialized = False
        
        # 模型配置
        self.model_configs = {
            "text": {
                "model_id": os.getenv("TEXT_MODEL_ID", "Qwen/Qwen2-1.5B-Instruct"),
                "local_path": self.models_dir / "text" / "qwen",
                "type": "text-generation"
            },
            "image": {
                "model_id": os.getenv("IMAGE_MODEL_ID", "runwayml/stable-diffusion-v1-5"),
                "local_path": self.models_dir / "image" / "sd-1.5",
                "type": "text-to-image"
            },
            "music": {
                "model_id": os.getenv("MUSIC_MODEL_ID", "facebook/musicgen-small"),
                "local_path": self.models_dir / "music" / "musicgen-small",
                "type": "text-to-audio"
            },
            "code": {
                "model_id": os.getenv("CODE_MODEL_ID", "codellama/CodeLlama-7b-Python-hf"),
                "local_path": self.models_dir / "code" / "codellama",
                "type": "text-generation"
            }
        }
    
    async def initialize(self):
        """初始化所有模型"""
        if self._initialized:
            return
        
        logger.info("🚀 初始化开源AI模型...")
        
        try:
            # 检查GPU内存
            if torch.cuda.is_available():
                gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1e9
                logger.info(f"🎮 GPU: {torch.cuda.get_device_name(0)} ({gpu_memory:.1f}GB)")
                
                if gpu_memory < 6:
                    logger.warning("⚠️ GPU内存不足6GB，将使用CPU或较小模型")
            
            # 初始化文本模型
            await self._init_text_model()
            
            # 初始化图像模型
            await self._init_image_model()
            
            # 初始化音乐模型 (可选)
            await self._init_music_model()
            
            # 初始化代码模型
            await self._init_code_model()
            
            self._initialized = True
            logger.info("✅ 所有开源模型初始化完成")
            
        except Exception as e:
            logger.error(f"❌ 模型初始化失败: {e}")
            # 不抛出异常，允许服务继续运行
    
    async def _init_text_model(self):
        """初始化文本生成模型"""
        try:
            logger.info("📝 加载文本生成模型...")
            
            from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
            
            config = self.model_configs["text"]
            model_path = str(config["local_path"]) if config["local_path"].exists() else config["model_id"]
            
            # 使用pipeline简化加载
            self.models["text"] = pipeline(
                "text-generation",
                model=model_path,
                tokenizer=model_path,
                device=0 if self.device == "cuda" and torch.cuda.is_available() else -1,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                trust_remote_code=True,
                model_kwargs={
                    "low_cpu_mem_usage": True,
                    "use_cache": True
                }
            )
            
            logger.info("✅ 文本模型加载成功")
            
        except Exception as e:
            logger.error(f"❌ 文本模型加载失败: {e}")
            # 使用备用的轻量级模型
            try:
                from transformers import pipeline
                self.models["text"] = pipeline(
                    "text-generation",
                    model="gpt2",
                    device=-1  # 强制使用CPU
                )
                logger.info("✅ 使用备用文本模型 (GPT-2)")
            except:
                self.models["text"] = None
    
    async def _init_image_model(self):
        """初始化图像生成模型"""
        try:
            logger.info("🎨 加载图像生成模型...")
            
            from diffusers import StableDiffusionPipeline
            import torch
            
            config = self.model_configs["image"]
            model_path = str(config["local_path"]) if config["local_path"].exists() else config["model_id"]
            
            # 检查GPU内存，决定使用精度
            if torch.cuda.is_available():
                gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1e9
                use_fp16 = gpu_memory > 6  # 6GB以上使用FP16
            else:
                use_fp16 = False
            
            self.models["image"] = StableDiffusionPipeline.from_pretrained(
                model_path,
                torch_dtype=torch.float16 if use_fp16 else torch.float32,
                safety_checker=None,
                requires_safety_checker=False,
                use_safetensors=True
            )
            
            if torch.cuda.is_available():
                self.models["image"] = self.models["image"].to("cuda")
                # 启用内存优化
                self.models["image"].enable_attention_slicing()
                self.models["image"].enable_vae_slicing()
            
            logger.info("✅ 图像模型加载成功")
            
        except Exception as e:
            logger.error(f"❌ 图像模型加载失败: {e}")
            self.models["image"] = None
    
    async def _init_music_model(self):
        """初始化音乐生成模型"""
        try:
            logger.info("🎵 加载音乐生成模型...")
            
            # 音乐模型较大，暂时跳过或使用简化版本
            logger.info("⏭️ 音乐模型暂时跳过 (需要大量内存)")
            self.models["music"] = None
            
        except Exception as e:
            logger.error(f"❌ 音乐模型加载失败: {e}")
            self.models["music"] = None
    
    async def _init_code_model(self):
        """初始化代码生成模型"""
        try:
            logger.info("💻 加载代码生成模型...")
            
            from transformers import pipeline
            
            config = self.model_configs["code"]
            
            # 使用较小的代码模型
            try:
                self.models["code"] = pipeline(
                    "text-generation",
                    model="microsoft/CodeGPT-small-py",
                    device=0 if self.device == "cuda" and torch.cuda.is_available() else -1,
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
                )
                logger.info("✅ 代码模型加载成功")
            except:
                # 备用方案：使用文本模型
                self.models["code"] = self.models.get("text")
                logger.info("✅ 使用文本模型作为代码生成备用")
            
        except Exception as e:
            logger.error(f"❌ 代码模型加载失败: {e}")
            self.models["code"] = self.models.get("text")
    
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """生成文本"""
        if not self.models.get("text"):
            return f"基于提示「{prompt}」的AI生成文本内容。(文本模型未加载，这是模拟输出)"
        
        try:
            max_length = min(kwargs.get("max_length", 200), 1000)
            temperature = kwargs.get("temperature", 0.7)
            
            # 构建更好的提示
            formatted_prompt = f"用户: {prompt}\n助手: "
            
            result = self.models["text"](
                formatted_prompt,
                max_length=max_length,
                temperature=temperature,
                do_sample=True,
                pad_token_id=self.models["text"].tokenizer.eos_token_id,
                num_return_sequences=1,
                truncation=True
            )
            
            generated_text = result[0]["generated_text"]
            
            # 提取助手回复部分
            if "助手: " in generated_text:
                generated_text = generated_text.split("助手: ", 1)[1].strip()
            elif formatted_prompt in generated_text:
                generated_text = generated_text.replace(formatted_prompt, "").strip()
            
            return generated_text or f"基于「{prompt}」生成的内容。"
            
        except Exception as e:
            logger.error(f"文本生成失败: {e}")
            return f"基于提示「{prompt}」的AI生成文本内容。(生成过程中出现错误)"
    
    async def generate_image(self, prompt: str, **kwargs) -> bytes:
        """生成图像"""
        if not self.models.get("image"):
            # 返回占位符图像URL
            raise ValueError("图像模型未加载，请检查模型配置")
        
        try:
            width = min(kwargs.get("width", 512), 768)
            height = min(kwargs.get("height", 512), 768)
            steps = min(kwargs.get("steps", 20), 50)
            guidance_scale = kwargs.get("guidance_scale", 7.5)
            
            # 优化提示词
            enhanced_prompt = f"{prompt}, high quality, detailed, masterpiece"
            
            image = self.models["image"](
                enhanced_prompt,
                width=width,
                height=height,
                num_inference_steps=steps,
                guidance_scale=guidance_scale,
                negative_prompt="blurry, low quality, distorted"
            ).images[0]
            
            # 转换为bytes
            import io
            img_bytes = io.BytesIO()
            image.save(img_bytes, format='PNG', quality=95)
            return img_bytes.getvalue()
            
        except Exception as e:
            logger.error(f"图像生成失败: {e}")
            raise
    
    async def generate_music(self, prompt: str, **kwargs) -> bytes:
        """生成音乐"""
        # 音乐生成暂未实现
        raise NotImplementedError("音乐生成功能正在开发中，敬请期待")
    
    async def generate_code(self, prompt: str, **kwargs) -> str:
        """生成代码"""
        if not self.models.get("code"):
            return self._generate_code_template(prompt, kwargs.get("language", "python"))
        
        try:
            language = kwargs.get("language", "python")
            max_length = min(kwargs.get("max_length", 200), 500)
            
            # 构建代码生成提示
            code_prompt = f"# {prompt}\n# Language: {language}\n"
            
            result = self.models["code"](
                code_prompt,
                max_length=max_length,
                temperature=0.2,
                do_sample=True,
                pad_token_id=self.models["code"].tokenizer.eos_token_id
            )
            
            generated_code = result[0]["generated_text"]
            
            # 清理输出
            if code_prompt in generated_code:
                generated_code = generated_code.replace(code_prompt, "").strip()
            
            return generated_code or self._generate_code_template(prompt, language)
            
        except Exception as e:
            logger.error(f"代码生成失败: {e}")
            return self._generate_code_template(prompt, language)
    
    def _generate_code_template(self, prompt: str, language: str) -> str:
        """生成代码模板"""
        templates = {
            "python": f'''# {prompt}
def solution():
    """
    {prompt}
    """
    # TODO: 实现功能
    pass

if __name__ == "__main__":
    result = solution()
    print(result)''',
            
            "javascript": f'''// {prompt}
function solution() {{
    /**
     * {prompt}
     */
    // TODO: 实现功能
    return null;
}}

// 调用函数
const result = solution();
console.log(result);''',
            
            "go": f'''package main

import "fmt"

// {prompt}
func solution() {{
    // TODO: 实现功能
    fmt.Println("Hello, World!")
}}

func main() {{
    solution()
}}''',
        }
        
        return templates.get(language, f"// {prompt}\n// TODO: 实现功能")
    
    async def get_status(self) -> Dict[str, Any]:
        """获取模型状态"""
        return {
            "initialized": self._initialized,
            "device": self.device,
            "available_models": {
                "text": self.models.get("text") is not None,
                "image": self.models.get("image") is not None,
                "music": self.models.get("music") is not None,
                "code": self.models.get("code") is not None,
            },
            "model_configs": {
                name: {
                    "model_id": config["model_id"],
                    "local_exists": config["local_path"].exists(),
                    "type": config["type"]
                }
                for name, config in self.model_configs.items()
            },
            "memory_usage": self._get_memory_usage()
        }
    
    def _get_memory_usage(self) -> Dict[str, Any]:
        """获取内存使用情况"""
        if torch.cuda.is_available():
            return {
                "gpu_memory_allocated": f"{torch.cuda.memory_allocated() / 1e9:.2f}GB",
                "gpu_memory_reserved": f"{torch.cuda.memory_reserved() / 1e9:.2f}GB",
                "gpu_memory_total": f"{torch.cuda.get_device_properties(0).total_memory / 1e9:.2f}GB"
            }
        return {"cpu_only": True}
    
    async def cleanup(self):
        """清理资源"""
        logger.info("🧹 清理模型资源...")
        
        for name, model in self.models.items():
            if model is not None:
                del model
        
        self.models.clear()
        
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        gc.collect()
        logger.info("✅ 资源清理完成")
