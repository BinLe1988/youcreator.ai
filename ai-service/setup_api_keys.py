#!/usr/bin/env python3
"""
API密钥配置助手
帮助用户配置各种API密钥
"""

import os
from pathlib import Path


class APIKeySetup:
    """API密钥配置助手"""
    
    def __init__(self):
        self.env_file = Path(".env")
        self.keys = {}
    
    def welcome(self):
        """欢迎界面"""
        print("🔑 YouCreator.AI API密钥配置助手")
        print("=" * 50)
        print("我将帮助你配置必要的API密钥")
        print()
    
    def setup_huggingface(self):
        """配置Hugging Face Token"""
        print("📝 配置 Hugging Face Token (必需)")
        print("-" * 30)
        print("用途: 下载开源AI模型")
        print("获取地址: https://huggingface.co/settings/tokens")
        print()
        print("步骤:")
        print("1. 访问 https://huggingface.co/settings/tokens")
        print("2. 点击 'New token'")
        print("3. 名称填写: YouCreator-AI")
        print("4. 权限选择: Read")
        print("5. 复制生成的token")
        print()
        
        token = input("请输入 Hugging Face Token (hf_xxx...): ").strip()
        
        if token.startswith("hf_") and len(token) > 20:
            self.keys["HUGGINGFACE_TOKEN"] = token
            print("✅ Hugging Face Token 配置成功")
        elif token:
            print("⚠️ Token格式可能不正确，但已保存")
            self.keys["HUGGINGFACE_TOKEN"] = token
        else:
            print("⏭️ 跳过 Hugging Face Token 配置")
        print()
    
    def setup_groq(self):
        """配置Groq API"""
        print("🚀 配置 Groq API (推荐 - 免费)")
        print("-" * 30)
        print("用途: 免费的高速LLaMA模型访问")
        print("获取地址: https://console.groq.com/keys")
        print()
        print("步骤:")
        print("1. 访问 https://console.groq.com/")
        print("2. 注册/登录账号")
        print("3. 访问 https://console.groq.com/keys")
        print("4. 点击 'Create API Key'")
        print("5. 名称填写: YouCreator-AI")
        print("6. 复制生成的密钥")
        print()
        
        setup = input("是否配置 Groq API? (y/n): ").strip().lower()
        
        if setup == 'y':
            api_key = input("请输入 Groq API Key (gsk_xxx...): ").strip()
            
            if api_key.startswith("gsk_") and len(api_key) > 20:
                self.keys["GROQ_API_KEY"] = api_key
                print("✅ Groq API Key 配置成功")
            elif api_key:
                print("⚠️ API Key格式可能不正确，但已保存")
                self.keys["GROQ_API_KEY"] = api_key
            else:
                print("⏭️ 跳过 Groq API 配置")
        else:
            print("⏭️ 跳过 Groq API 配置")
        print()
    
    def setup_together(self):
        """配置Together AI"""
        print("🤝 配置 Together AI (可选 - $25免费额度)")
        print("-" * 30)
        print("用途: 多种开源模型访问")
        print("获取地址: https://api.together.xyz/settings/api-keys")
        print()
        
        setup = input("是否配置 Together AI? (y/n): ").strip().lower()
        
        if setup == 'y':
            print("步骤:")
            print("1. 访问 https://api.together.xyz/")
            print("2. 注册/登录账号")
            print("3. 访问 https://api.together.xyz/settings/api-keys")
            print("4. 点击 'Create new API key'")
            print("5. 复制生成的密钥")
            print()
            
            api_key = input("请输入 Together AI API Key: ").strip()
            
            if api_key and len(api_key) > 10:
                self.keys["TOGETHER_API_KEY"] = api_key
                print("✅ Together AI API Key 配置成功")
            else:
                print("⏭️ 跳过 Together AI 配置")
        else:
            print("⏭️ 跳过 Together AI 配置")
        print()
    
    def setup_openai_optional(self):
        """配置OpenAI (可选)"""
        print("🤖 配置 OpenAI API (可选 - 付费)")
        print("-" * 30)
        print("用途: 高质量的GPT模型访问")
        print("获取地址: https://platform.openai.com/api-keys")
        print()
        
        setup = input("是否配置 OpenAI API? (y/n): ").strip().lower()
        
        if setup == 'y':
            api_key = input("请输入 OpenAI API Key (sk-xxx...): ").strip()
            
            if api_key.startswith("sk-") and len(api_key) > 20:
                self.keys["OPENAI_API_KEY"] = api_key
                print("✅ OpenAI API Key 配置成功")
            elif api_key:
                print("⚠️ API Key格式可能不正确，但已保存")
                self.keys["OPENAI_API_KEY"] = api_key
            else:
                print("⏭️ 跳过 OpenAI 配置")
        else:
            print("⏭️ 跳过 OpenAI 配置")
        print()
    
    def save_config(self):
        """保存配置"""
        if not self.keys:
            print("❌ 没有配置任何API密钥")
            return
        
        print("💾 保存API密钥配置...")
        
        # 读取现有配置
        existing_config = ""
        if self.env_file.exists():
            with open(self.env_file, 'r', encoding='utf-8') as f:
                existing_config = f.read()
        
        # 添加新的API密钥
        new_config = existing_config + "\n# API密钥配置\n"
        for key, value in self.keys.items():
            # 检查是否已存在
            if f"{key}=" not in existing_config:
                new_config += f"{key}={value}\n"
            else:
                print(f"⚠️ {key} 已存在，跳过...")
        
        # 写入文件
        with open(self.env_file, 'w', encoding='utf-8') as f:
            f.write(new_config)
        
        print("✅ API密钥配置已保存到 .env 文件")
    
    def show_summary(self):
        """显示配置摘要"""
        print("🎉 API密钥配置完成!")
        print("=" * 30)
        
        if self.keys:
            print("已配置的密钥:")
            for key in self.keys:
                service_name = {
                    "HUGGINGFACE_TOKEN": "Hugging Face (模型下载)",
                    "GROQ_API_KEY": "Groq (免费LLaMA)",
                    "TOGETHER_API_KEY": "Together AI ($25免费额度)",
                    "OPENAI_API_KEY": "OpenAI (付费)"
                }.get(key, key)
                print(f"✅ {service_name}")
        else:
            print("❌ 未配置任何API密钥")
        
        print("\n🚀 下一步:")
        print("1. 下载模型: python download_opensource_models.py")
        print("2. 启动服务: python main.py")
        print("3. 访问文档: http://localhost:8000/docs")
    
    def run(self):
        """运行配置向导"""
        self.welcome()
        
        # 必需的配置
        self.setup_huggingface()
        
        # 推荐的免费配置
        self.setup_groq()
        
        # 可选配置
        self.setup_together()
        self.setup_openai_optional()
        
        # 保存配置
        self.save_config()
        
        # 显示摘要
        self.show_summary()


if __name__ == "__main__":
    setup = APIKeySetup()
    setup.run()
