#!/usr/bin/env python3
"""
开源模型下载脚本
专门为YouCreator.AI下载和配置开源模型
"""

import os
import sys
from pathlib import Path
import subprocess
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class OpenSourceModelDownloader:
    """开源模型下载器"""
    
    def __init__(self):
        self.models_dir = Path("./models")
        self.models_dir.mkdir(exist_ok=True)
        
        # 推荐的开源模型配置
        self.recommended_models = {
            "text": {
                "name": "Qwen2-1.5B-Instruct",
                "repo": "Qwen/Qwen2-1.5B-Instruct",
                "size": "~3GB",
                "description": "阿里云开源的轻量级中文大语言模型"
            },
            "image": {
                "name": "Stable Diffusion v1.5",
                "repo": "runwayml/stable-diffusion-v1-5",
                "size": "~4GB", 
                "description": "经典的开源图像生成模型"
            },
            "code": {
                "name": "CodeGPT-small-py",
                "repo": "microsoft/CodeGPT-small-py",
                "size": "~500MB",
                "description": "微软开源的Python代码生成模型"
            }
        }
    
    def check_requirements(self):
        """检查系统要求"""
        logger.info("🔍 检查系统要求...")
        
        # 检查Python包
        required_packages = {
            "torch": "PyTorch深度学习框架",
            "transformers": "Hugging Face Transformers",
            "diffusers": "Hugging Face Diffusers",
            "huggingface_hub": "Hugging Face Hub客户端"
        }
        
        missing_packages = []
        for package, description in required_packages.items():
            try:
                __import__(package)
                logger.info(f"✅ {package} - {description}")
            except ImportError:
                logger.warning(f"❌ {package} - {description} (未安装)")
                missing_packages.append(package)
        
        if missing_packages:
            logger.error("❌ 缺少必要的Python包")
            logger.info("请运行以下命令安装:")
            logger.info(f"pip install {' '.join(missing_packages)}")
            return False
        
        # 检查GPU
        try:
            import torch
            if torch.cuda.is_available():
                gpu_count = torch.cuda.device_count()
                gpu_name = torch.cuda.get_device_name(0)
                gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1e9
                logger.info(f"🎮 GPU: {gpu_name} ({gpu_memory:.1f}GB)")
                
                if gpu_memory < 4:
                    logger.warning("⚠️ GPU内存不足4GB，建议使用CPU版本或升级GPU")
            else:
                logger.warning("⚠️ 未检测到CUDA GPU，将使用CPU运行 (速度较慢)")
        except Exception as e:
            logger.error(f"❌ GPU检测失败: {e}")
        
        # 检查磁盘空间
        import shutil
        free_space = shutil.disk_usage(self.models_dir).free / 1e9
        logger.info(f"💾 可用磁盘空间: {free_space:.1f}GB")
        
        if free_space < 20:
            logger.warning("⚠️ 磁盘空间不足20GB，可能无法下载所有模型")
        
        return len(missing_packages) == 0
    
    def install_dependencies(self):
        """安装必要的依赖"""
        logger.info("📦 安装AI模型依赖...")
        
        dependencies = [
            "torch>=2.0.0",
            "transformers>=4.30.0", 
            "diffusers>=0.20.0",
            "accelerate>=0.20.0",
            "huggingface_hub>=0.16.0",
            "safetensors>=0.3.0"
        ]
        
        try:
            subprocess.check_call([
                sys.executable, "-m", "pip", "install", "--upgrade"
            ] + dependencies)
            logger.info("✅ 依赖安装完成")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ 依赖安装失败: {e}")
            return False
    
    def download_model(self, model_type: str, force: bool = False):
        """下载指定类型的模型"""
        if model_type not in self.recommended_models:
            logger.error(f"❌ 不支持的模型类型: {model_type}")
            return False
        
        model_info = self.recommended_models[model_type]
        local_dir = self.models_dir / model_type / model_info["name"].lower().replace("-", "_")
        
        # 检查是否已下载
        if local_dir.exists() and any(local_dir.iterdir()) and not force:
            logger.info(f"✅ 模型 {model_info['name']} 已存在")
            return True
        
        logger.info(f"🚀 下载 {model_type} 模型: {model_info['name']}")
        logger.info(f"📦 仓库: {model_info['repo']}")
        logger.info(f"📏 大小: {model_info['size']}")
        logger.info(f"📝 描述: {model_info['description']}")
        logger.info(f"📁 本地路径: {local_dir}")
        
        try:
            # 创建目录
            local_dir.mkdir(parents=True, exist_ok=True)
            
            # 使用huggingface_hub下载
            from huggingface_hub import snapshot_download
            
            logger.info("⬇️ 开始下载...")
            snapshot_download(
                repo_id=model_info["repo"],
                local_dir=str(local_dir),
                local_dir_use_symlinks=False,
                resume_download=True,
                ignore_patterns=["*.bin"] if model_type == "image" else None  # 图像模型优先下载safetensors
            )
            
            logger.info(f"✅ 模型 {model_info['name']} 下载完成!")
            return True
            
        except Exception as e:
            logger.error(f"❌ 下载失败: {e}")
            return False
    
    def download_all_models(self, force: bool = False):
        """下载所有推荐模型"""
        logger.info("🎯 下载所有推荐的开源模型...")
        
        success_count = 0
        total_count = len(self.recommended_models)
        
        for model_type in self.recommended_models:
            if self.download_model(model_type, force):
                success_count += 1
            else:
                logger.warning(f"⚠️ {model_type} 模型下载失败，跳过...")
        
        logger.info(f"🎉 模型下载完成: {success_count}/{total_count}")
        
        if success_count > 0:
            self.create_model_config()
        
        return success_count == total_count
    
    def create_model_config(self):
        """创建模型配置文件"""
        logger.info("⚙️ 创建模型配置...")
        
        config_content = """# 开源模型配置已生成
# 模型已下载到 ./models/ 目录

# 文本模型
TEXT_MODEL_PROVIDER=local
TEXT_MODEL_PATH=./models/text/qwen2_1_5b_instruct
TEXT_MODEL_ID=Qwen/Qwen2-1.5B-Instruct

# 图像模型  
IMAGE_MODEL_PROVIDER=local
IMAGE_MODEL_PATH=./models/image/stable_diffusion_v1_5
IMAGE_MODEL_ID=runwayml/stable-diffusion-v1-5

# 代码模型
CODE_MODEL_PROVIDER=local
CODE_MODEL_PATH=./models/code/codegpt_small_py
CODE_MODEL_ID=microsoft/CodeGPT-small-py

# 音乐模型 (暂未下载)
MUSIC_MODEL_PROVIDER=local
MUSIC_MODEL_PATH=./models/music/musicgen_small
MUSIC_MODEL_ID=facebook/musicgen-small
"""
        
        with open(".env.models", "w", encoding="utf-8") as f:
            f.write(config_content)
        
        logger.info("✅ 模型配置文件已创建: .env.models")
    
    def list_models(self):
        """列出推荐的模型"""
        logger.info("📋 推荐的开源模型:")
        logger.info("=" * 60)
        
        for model_type, info in self.recommended_models.items():
            local_dir = self.models_dir / model_type / info["name"].lower().replace("-", "_")
            status = "✅ 已下载" if (local_dir.exists() and any(local_dir.iterdir())) else "⬇️ 未下载"
            
            logger.info(f"\n🎯 {model_type.upper()} 模型:")
            logger.info(f"  名称: {info['name']}")
            logger.info(f"  仓库: {info['repo']}")
            logger.info(f"  大小: {info['size']}")
            logger.info(f"  状态: {status}")
            logger.info(f"  描述: {info['description']}")
    
    def get_download_commands(self):
        """获取下载命令"""
        logger.info("📋 手动下载命令:")
        logger.info("=" * 50)
        
        for model_type, info in self.recommended_models.items():
            logger.info(f"\n# 下载 {model_type} 模型")
            logger.info(f"python download_opensource_models.py --type {model_type}")
        
        logger.info(f"\n# 下载所有模型")
        logger.info(f"python download_opensource_models.py --all")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="YouCreator.AI 开源模型下载工具")
    parser.add_argument("--check", action="store_true", help="检查系统要求")
    parser.add_argument("--install-deps", action="store_true", help="安装依赖")
    parser.add_argument("--list", action="store_true", help="列出推荐模型")
    parser.add_argument("--type", choices=["text", "image", "code"], help="下载指定类型模型")
    parser.add_argument("--all", action="store_true", help="下载所有推荐模型")
    parser.add_argument("--force", action="store_true", help="强制重新下载")
    parser.add_argument("--commands", action="store_true", help="显示下载命令")
    
    args = parser.parse_args()
    
    downloader = OpenSourceModelDownloader()
    
    if args.check:
        downloader.check_requirements()
    elif args.install_deps:
        downloader.install_dependencies()
    elif args.list:
        downloader.list_models()
    elif args.commands:
        downloader.get_download_commands()
    elif args.type:
        if downloader.check_requirements():
            downloader.download_model(args.type, args.force)
    elif args.all:
        if downloader.check_requirements():
            downloader.download_all_models(args.force)
    else:
        # 默认流程
        logger.info("🎉 欢迎使用 YouCreator.AI 开源模型下载工具!")
        logger.info("=" * 50)
        
        # 检查要求
        if not downloader.check_requirements():
            logger.info("\n📦 正在安装必要依赖...")
            if downloader.install_dependencies():
                logger.info("✅ 依赖安装完成，请重新运行此脚本")
            return
        
        # 列出模型
        downloader.list_models()
        
        # 询问是否下载
        response = input("\n是否下载所有推荐模型? (y/n): ").strip().lower()
        if response == 'y':
            downloader.download_all_models()
        else:
            downloader.get_download_commands()


if __name__ == "__main__":
    main()
