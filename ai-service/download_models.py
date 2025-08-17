#!/usr/bin/env python3
"""
AI模型下载脚本
支持从Hugging Face下载开源模型
"""

import os
import sys
import argparse
from pathlib import Path
from typing import List, Dict


class ModelDownloader:
    """模型下载器"""
    
    def __init__(self, models_dir: str = "./models"):
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(exist_ok=True)
        
        # 预定义的模型配置
        self.available_models = {
            "text": {
                "gpt2": "gpt2",
                "dialogpt": "microsoft/DialoGPT-medium",
                "chatglm": "THUDM/chatglm-6b",
                "llama2-7b": "meta-llama/Llama-2-7b-chat-hf",
                "qwen": "Qwen/Qwen-7B-Chat",
            },
            "image": {
                "sd-1.5": "runwayml/stable-diffusion-v1-5",
                "sd-2.1": "stabilityai/stable-diffusion-2-1",
                "sdxl": "stabilityai/stable-diffusion-xl-base-1.0",
            },
            "music": {
                "musicgen-small": "facebook/musicgen-small",
                "musicgen-medium": "facebook/musicgen-medium",
                "musicgen-large": "facebook/musicgen-large",
            },
            "code": {
                "codegpt": "microsoft/CodeGPT-small-py",
                "codellama-7b": "codellama/CodeLlama-7b-Python-hf",
                "starcoder": "bigcode/starcoder",
            }
        }
    
    def list_models(self, model_type: str = None):
        """列出可用的模型"""
        print("📋 可用的AI模型:")
        print("=" * 50)
        
        types_to_show = [model_type] if model_type else self.available_models.keys()
        
        for mtype in types_to_show:
            if mtype in self.available_models:
                print(f"\n🎯 {mtype.upper()} 模型:")
                for name, repo in self.available_models[mtype].items():
                    status = "✅ 已下载" if self._is_downloaded(mtype, name) else "⬇️  未下载"
                    print(f"  {name:15} | {repo:40} | {status}")
    
    def _is_downloaded(self, model_type: str, model_name: str) -> bool:
        """检查模型是否已下载"""
        model_path = self.models_dir / model_type / model_name
        return model_path.exists() and any(model_path.iterdir())
    
    def download_model(self, model_type: str, model_name: str, force: bool = False):
        """下载指定模型"""
        if model_type not in self.available_models:
            print(f"❌ 不支持的模型类型: {model_type}")
            return False
        
        if model_name not in self.available_models[model_type]:
            print(f"❌ 未找到模型: {model_name}")
            print(f"可用模型: {list(self.available_models[model_type].keys())}")
            return False
        
        repo_id = self.available_models[model_type][model_name]
        local_dir = self.models_dir / model_type / model_name
        
        # 检查是否已下载
        if self._is_downloaded(model_type, model_name) and not force:
            print(f"✅ 模型 {model_name} 已存在，使用 --force 强制重新下载")
            return True
        
        print(f"🚀 开始下载 {model_type} 模型: {model_name}")
        print(f"📦 仓库: {repo_id}")
        print(f"📁 本地路径: {local_dir}")
        
        try:
            # 创建目录
            local_dir.mkdir(parents=True, exist_ok=True)
            
            # 使用huggingface_hub下载
            from huggingface_hub import snapshot_download
            
            snapshot_download(
                repo_id=repo_id,
                local_dir=str(local_dir),
                local_dir_use_symlinks=False,
                resume_download=True
            )
            
            print(f"✅ 模型 {model_name} 下载完成!")
            return True
            
        except ImportError:
            print("❌ 请先安装 huggingface_hub:")
            print("pip install huggingface_hub")
            return False
        except Exception as e:
            print(f"❌ 下载失败: {e}")
            return False
    
    def download_recommended_set(self):
        """下载推荐的模型组合"""
        print("🎯 下载推荐模型组合...")
        
        recommended = [
            ("text", "dialogpt"),      # 轻量级文本模型
            ("image", "sd-1.5"),       # 经典图像模型
            ("music", "musicgen-small"), # 小型音乐模型
            ("code", "codegpt"),       # 代码生成模型
        ]
        
        success_count = 0
        for model_type, model_name in recommended:
            if self.download_model(model_type, model_name):
                success_count += 1
        
        print(f"\n🎉 推荐模型下载完成: {success_count}/{len(recommended)}")
    
    def check_requirements(self):
        """检查系统要求"""
        print("🔍 检查系统要求...")
        
        # 检查Python包
        required_packages = [
            "torch", "transformers", "diffusers", 
            "huggingface_hub", "accelerate"
        ]
        
        missing_packages = []
        for package in required_packages:
            try:
                __import__(package)
                print(f"✅ {package}")
            except ImportError:
                print(f"❌ {package} (未安装)")
                missing_packages.append(package)
        
        if missing_packages:
            print(f"\n📦 请安装缺失的包:")
            print(f"pip install {' '.join(missing_packages)}")
            return False
        
        # 检查GPU
        try:
            import torch
            if torch.cuda.is_available():
                gpu_count = torch.cuda.device_count()
                gpu_name = torch.cuda.get_device_name(0)
                gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1e9
                print(f"🎮 GPU: {gpu_name} ({gpu_memory:.1f}GB)")
                print(f"🔢 GPU数量: {gpu_count}")
            else:
                print("⚠️  未检测到CUDA GPU，将使用CPU (速度较慢)")
        except:
            print("❌ 无法检测GPU状态")
        
        # 检查磁盘空间
        import shutil
        free_space = shutil.disk_usage(self.models_dir).free / 1e9
        print(f"💾 可用磁盘空间: {free_space:.1f}GB")
        
        if free_space < 50:
            print("⚠️  磁盘空间不足，建议至少50GB用于存储模型")
        
        return len(missing_packages) == 0


def main():
    parser = argparse.ArgumentParser(description="YouCreator.AI 模型下载工具")
    parser.add_argument("--models-dir", default="./models", help="模型存储目录")
    parser.add_argument("--list", action="store_true", help="列出可用模型")
    parser.add_argument("--type", choices=["text", "image", "music", "code"], help="模型类型")
    parser.add_argument("--download", help="下载指定模型")
    parser.add_argument("--recommended", action="store_true", help="下载推荐模型组合")
    parser.add_argument("--force", action="store_true", help="强制重新下载")
    parser.add_argument("--check", action="store_true", help="检查系统要求")
    
    args = parser.parse_args()
    
    downloader = ModelDownloader(args.models_dir)
    
    if args.check:
        downloader.check_requirements()
    elif args.list:
        downloader.list_models(args.type)
    elif args.recommended:
        if downloader.check_requirements():
            downloader.download_recommended_set()
    elif args.download:
        if not args.type:
            print("❌ 请指定模型类型 --type")
            sys.exit(1)
        downloader.download_model(args.type, args.download, args.force)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
