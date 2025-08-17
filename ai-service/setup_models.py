#!/usr/bin/env python3
"""
AI模型快速配置脚本
帮助用户选择和配置合适的AI模型方案
"""

import os
import sys
from pathlib import Path


class ModelSetup:
    """模型配置向导"""
    
    def __init__(self):
        self.config = {}
        self.env_file = Path(".env")
    
    def welcome(self):
        """欢迎界面"""
        print("🎉 欢迎使用 YouCreator.AI 模型配置向导!")
        print("=" * 50)
        print("我将帮助你配置AI模型，支持以下功能:")
        print("📝 智能写作 | 🎨 AI绘画 | 🎵 音乐创作 | 💻 代码编写")
        print()
    
    def choose_plan(self):
        """选择配置方案"""
        print("🎯 请选择你的配置方案:")
        print()
        print("1. 🚀 API方案 (推荐新手)")
        print("   - 使用OpenAI、Stability等API服务")
        print("   - 优点: 简单快速，无需本地GPU")
        print("   - 缺点: 需要付费，约$20-50/月")
        print()
        print("2. 🏠 本地方案 (推荐进阶)")
        print("   - 下载开源模型到本地运行")
        print("   - 优点: 完全免费，数据隐私")
        print("   - 缺点: 需要强大GPU，配置复杂")
        print()
        print("3. 🔄 混合方案 (推荐专业)")
        print("   - API + 本地模型组合")
        print("   - 优点: 灵活性高，成本可控")
        print("   - 缺点: 配置相对复杂")
        print()
        
        while True:
            choice = input("请选择方案 (1/2/3): ").strip()
            if choice in ["1", "2", "3"]:
                return int(choice)
            print("❌ 请输入有效选项 (1/2/3)")
    
    def setup_api_plan(self):
        """配置API方案"""
        print("\n🚀 配置API方案...")
        print("=" * 30)
        
        # OpenAI配置
        print("\n📝 OpenAI配置 (文本生成、代码生成)")
        print("获取API密钥: https://platform.openai.com/api-keys")
        openai_key = input("请输入OpenAI API密钥 (或按回车跳过): ").strip()
        
        if openai_key:
            self.config.update({
                "OPENAI_API_KEY": openai_key,
                "TEXT_MODEL_PROVIDER": "openai",
                "CODE_MODEL_PROVIDER": "openai",
                "OPENAI_MODEL_TEXT": "gpt-3.5-turbo",
                "OPENAI_MODEL_CODE": "gpt-4",
            })
            print("✅ OpenAI配置完成")
        
        # Stability AI配置
        print("\n🎨 Stability AI配置 (图像生成)")
        print("获取API密钥: https://platform.stability.ai/account/keys")
        stability_key = input("请输入Stability API密钥 (或按回车跳过): ").strip()
        
        if stability_key:
            self.config.update({
                "STABILITY_API_KEY": stability_key,
                "IMAGE_MODEL_PROVIDER": "stability",
                "STABILITY_MODEL": "stable-diffusion-v1-6",
            })
            print("✅ Stability AI配置完成")
        elif openai_key:
            # 使用OpenAI的DALL-E
            self.config.update({
                "IMAGE_MODEL_PROVIDER": "openai",
                "OPENAI_MODEL_IMAGE": "dall-e-3",
            })
            print("✅ 将使用OpenAI DALL-E生成图像")
        
        # Replicate配置 (音乐)
        print("\n🎵 Replicate配置 (音乐生成)")
        print("获取API令牌: https://replicate.com/account/api-tokens")
        replicate_token = input("请输入Replicate API令牌 (或按回车跳过): ").strip()
        
        if replicate_token:
            self.config.update({
                "REPLICATE_API_TOKEN": replicate_token,
                "MUSIC_MODEL_PROVIDER": "replicate",
            })
            print("✅ Replicate配置完成")
    
    def setup_local_plan(self):
        """配置本地方案"""
        print("\n🏠 配置本地方案...")
        print("=" * 30)
        
        # 检查系统要求
        print("🔍 检查系统要求...")
        
        try:
            import torch
            if torch.cuda.is_available():
                gpu_name = torch.cuda.get_device_name(0)
                gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1e9
                print(f"✅ 检测到GPU: {gpu_name} ({gpu_memory:.1f}GB)")
                
                if gpu_memory < 8:
                    print("⚠️  GPU内存不足8GB，建议使用较小的模型")
            else:
                print("❌ 未检测到CUDA GPU")
                print("本地方案需要NVIDIA GPU，建议选择API方案")
                return
        except ImportError:
            print("❌ 未安装PyTorch，请先安装:")
            print("pip install torch torchvision torchaudio")
            return
        
        # 配置本地模型
        self.config.update({
            "TEXT_MODEL_PROVIDER": "local",
            "IMAGE_MODEL_PROVIDER": "local",
            "MUSIC_MODEL_PROVIDER": "local",
            "CODE_MODEL_PROVIDER": "local",
            "TEXT_MODEL_PATH": "./models/text/dialogpt",
            "IMAGE_MODEL_PATH": "./models/image/sd-1.5",
            "MUSIC_MODEL_PATH": "./models/music/musicgen-small",
            "CODE_MODEL_PATH": "./models/code/codegpt",
        })
        
        print("✅ 本地模型配置完成")
        print("💡 稍后将提示下载模型文件")
    
    def setup_hybrid_plan(self):
        """配置混合方案"""
        print("\n🔄 配置混合方案...")
        print("=" * 30)
        
        print("推荐配置:")
        print("- 文本生成: OpenAI API (质量高)")
        print("- 图像生成: 本地Stable Diffusion (免费)")
        print("- 音乐生成: 本地MusicGen (免费)")
        print("- 代码生成: OpenAI API (质量高)")
        
        # OpenAI配置
        openai_key = input("\n请输入OpenAI API密钥: ").strip()
        if openai_key:
            self.config.update({
                "OPENAI_API_KEY": openai_key,
                "TEXT_MODEL_PROVIDER": "openai",
                "CODE_MODEL_PROVIDER": "openai",
                "IMAGE_MODEL_PROVIDER": "local",
                "MUSIC_MODEL_PROVIDER": "local",
            })
            print("✅ 混合方案配置完成")
    
    def save_config(self):
        """保存配置到.env文件"""
        print(f"\n💾 保存配置到 {self.env_file}...")
        
        # 读取示例配置
        example_file = Path(".env.example")
        if example_file.exists():
            with open(example_file, 'r', encoding='utf-8') as f:
                content = f.read()
        else:
            content = "# YouCreator.AI 配置文件\n"
        
        # 添加用户配置
        content += "\n# 用户配置\n"
        for key, value in self.config.items():
            content += f"{key}={value}\n"
        
        # 写入.env文件
        with open(self.env_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("✅ 配置已保存")
    
    def download_models_prompt(self):
        """提示下载模型"""
        local_providers = [
            self.config.get("TEXT_MODEL_PROVIDER"),
            self.config.get("IMAGE_MODEL_PROVIDER"),
            self.config.get("MUSIC_MODEL_PROVIDER"),
            self.config.get("CODE_MODEL_PROVIDER"),
        ]
        
        if "local" in local_providers:
            print("\n📦 检测到本地模型配置")
            download = input("是否现在下载推荐的模型? (y/n): ").strip().lower()
            
            if download == 'y':
                print("🚀 开始下载模型...")
                os.system("python download_models.py --recommended")
            else:
                print("💡 稍后可运行以下命令下载模型:")
                print("python download_models.py --recommended")
    
    def show_summary(self):
        """显示配置摘要"""
        print("\n🎉 配置完成!")
        print("=" * 30)
        
        providers = {
            "文本生成": self.config.get("TEXT_MODEL_PROVIDER", "未配置"),
            "图像生成": self.config.get("IMAGE_MODEL_PROVIDER", "未配置"),
            "音乐生成": self.config.get("MUSIC_MODEL_PROVIDER", "未配置"),
            "代码生成": self.config.get("CODE_MODEL_PROVIDER", "未配置"),
        }
        
        for feature, provider in providers.items():
            print(f"{feature}: {provider}")
        
        print("\n🚀 启动服务:")
        print("python main.py")
        print("\n🌐 访问地址:")
        print("http://localhost:8000/docs")
    
    def run(self):
        """运行配置向导"""
        self.welcome()
        
        plan = self.choose_plan()
        
        if plan == 1:
            self.setup_api_plan()
        elif plan == 2:
            self.setup_local_plan()
        elif plan == 3:
            self.setup_hybrid_plan()
        
        if self.config:
            self.save_config()
            self.download_models_prompt()
            self.show_summary()
        else:
            print("❌ 未完成配置，请重新运行")


if __name__ == "__main__":
    setup = ModelSetup()
    setup.run()
