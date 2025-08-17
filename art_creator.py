#!/usr/bin/env python3
"""
YouCreator.AI - 绘画创作工具
支持多种风格的AI绘画创作
"""
import requests
import json
import base64
import os
from PIL import Image
import io
from typing import Dict, List, Optional

class ArtCreator:
    """绘画创作器"""
    
    def __init__(self, api_base="http://localhost:8000"):
        self.api_base = api_base
        self.session = requests.Session()
        self.styles = {
            "realistic": "写实风格",
            "anime": "动漫风格", 
            "cartoon": "卡通风格",
            "oil_painting": "油画风格",
            "watercolor": "水彩风格",
            "sketch": "素描风格",
            "digital_art": "数字艺术",
            "fantasy": "奇幻风格",
            "sci_fi": "科幻风格",
            "abstract": "抽象风格",
            "portrait": "肖像风格",
            "landscape": "风景风格",
            "artistic": "艺术风格"
        }
    
    def create_artwork(self, 
                      prompt: str,
                      style: str = "realistic",
                      width: int = 512,
                      height: int = 512,
                      quality: str = "high") -> Dict:
        """创作艺术作品"""
        
        # 质量设置映射
        quality_settings = {
            "draft": {"steps": 15, "guidance": 6.0},
            "normal": {"steps": 20, "guidance": 7.5},
            "high": {"steps": 25, "guidance": 8.0},
            "ultra": {"steps": 30, "guidance": 9.0}
        }
        
        settings = quality_settings.get(quality, quality_settings["normal"])
        
        try:
            response = self.session.post(
                f"{self.api_base}/api/v1/bagel/text-to-image",
                json={
                    "text": prompt,
                    "style": style,
                    "width": width,
                    "height": height,
                    "num_inference_steps": settings["steps"],
                    "guidance_scale": settings["guidance"],
                    "num_images": 1
                },
                timeout=120
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    return {
                        "success": True,
                        "image_data": result["data"]["images"][0]["image"],
                        "prompt": result["data"]["prompt"],
                        "style": style,
                        "dimensions": {"width": width, "height": height},
                        "quality": quality
                    }
                else:
                    return {"success": False, "error": result.get("error", "生成失败")}
            else:
                return {"success": False, "error": f"API请求失败: {response.status_code}"}
                
        except Exception as e:
            return {"success": False, "error": f"请求异常: {str(e)}"}
    
    def create_portrait(self, description: str, style: str = "realistic") -> Dict:
        """创作人物肖像"""
        enhanced_prompt = f"portrait of {description}, professional photography, detailed face, studio lighting"
        return self.create_artwork(enhanced_prompt, "portrait", 512, 768, "high")
    
    def create_landscape(self, scene: str, style: str = "realistic") -> Dict:
        """创作风景画"""
        enhanced_prompt = f"beautiful landscape of {scene}, scenic view, natural lighting, wide angle"
        return self.create_artwork(enhanced_prompt, "landscape", 768, 512, "high")
    
    def create_character(self, character: str, style: str = "anime") -> Dict:
        """创作角色设计"""
        enhanced_prompt = f"character design of {character}, full body, detailed, concept art"
        return self.create_artwork(enhanced_prompt, style, 512, 768, "high")
    
    def create_scene(self, scene: str, style: str = "digital_art") -> Dict:
        """创作场景插画"""
        enhanced_prompt = f"detailed scene illustration of {scene}, atmospheric, cinematic"
        return self.create_artwork(enhanced_prompt, style, 768, 512, "high")
    
    def save_artwork(self, image_data: str, filename: str, metadata: Dict = None):
        """保存艺术作品"""
        try:
            # 创建输出目录
            output_dir = "art_creations"
            os.makedirs(output_dir, exist_ok=True)
            
            # 解码图片
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            # 保存图片
            filepath = os.path.join(output_dir, filename)
            image.save(filepath, quality=95)
            
            # 保存元数据
            if metadata:
                metadata_file = filepath.replace('.png', '_metadata.json')
                with open(metadata_file, 'w', encoding='utf-8') as f:
                    json.dump(metadata, f, ensure_ascii=False, indent=2)
            
            print(f"✅ 作品已保存到: {filepath}")
            return filepath
            
        except Exception as e:
            print(f"❌ 保存失败: {e}")
            return None

def interactive_mode():
    """交互式绘画创作模式"""
    creator = ArtCreator()
    
    print("🎨 YouCreator.AI 绘画创作工具")
    print("=" * 50)
    
    while True:
        print("\n🖼️  请选择创作类型:")
        print("1. 自由创作")
        print("2. 人物肖像")
        print("3. 风景画作")
        print("4. 角色设计")
        print("5. 场景插画")
        print("6. 查看风格")
        print("0. 退出")
        
        choice = input("\n请输入选择 (0-6): ").strip()
        
        if choice == "0":
            print("👋 感谢使用YouCreator.AI!")
            break
        elif choice == "1":
            free_creation(creator)
        elif choice == "2":
            portrait_creation(creator)
        elif choice == "3":
            landscape_creation(creator)
        elif choice == "4":
            character_creation(creator)
        elif choice == "5":
            scene_creation(creator)
        elif choice == "6":
            show_styles(creator)
        else:
            print("❌ 无效选择，请重新输入")

def free_creation(creator):
    """自由创作"""
    print("\n🎨 自由创作")
    print("-" * 30)
    
    prompt = input("请描述您想要创作的画面: ").strip()
    if not prompt:
        print("❌ 描述不能为空")
        return
    
    # 选择风格
    print("\n请选择绘画风格:")
    styles = list(creator.styles.items())
    for i, (key, name) in enumerate(styles[:6], 1):
        print(f"{i}. {name}")
    print("7. 更多风格...")
    
    style_choice = input("请选择 (1-7): ").strip()
    
    if style_choice == "7":
        for i, (key, name) in enumerate(styles[6:], 8):
            print(f"{i}. {name}")
        style_choice = input("请选择 (8-13): ").strip()
    
    style_idx = int(style_choice) - 1 if style_choice.isdigit() else 0
    style_key = styles[style_idx][0] if 0 <= style_idx < len(styles) else "realistic"
    
    # 选择尺寸
    print("\n请选择画面尺寸:")
    print("1. 正方形 (512x512)")
    print("2. 横向 (768x512)")
    print("3. 纵向 (512x768)")
    print("4. 宽屏 (1024x512)")
    
    size_choice = input("请选择 (1-4): ").strip()
    sizes = {
        "1": (512, 512),
        "2": (768, 512),
        "3": (512, 768),
        "4": (1024, 512)
    }
    width, height = sizes.get(size_choice, (512, 512))
    
    # 选择质量
    quality = input("请选择质量 (draft/normal/high/ultra) [high]: ").strip() or "high"
    
    print(f"\n🎯 开始创作 {creator.styles[style_key]} 作品...")
    print(f"   描述: {prompt}")
    print(f"   尺寸: {width}x{height}")
    print(f"   质量: {quality}")
    
    result = creator.create_artwork(prompt, style_key, width, height, quality)
    
    if result["success"]:
        print("\n✅ 作品创作完成!")
        
        # 保存作品
        timestamp = __import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"artwork_{style_key}_{timestamp}.png"
        
        metadata = {
            "prompt": prompt,
            "style": creator.styles[style_key],
            "dimensions": result["dimensions"],
            "quality": quality,
            "created_at": timestamp
        }
        
        creator.save_artwork(result["image_data"], filename, metadata)
    else:
        print(f"❌ 创作失败: {result['error']}")

def portrait_creation(creator):
    """人物肖像创作"""
    print("\n👤 人物肖像创作")
    print("-" * 30)
    
    description = input("请描述人物特征 (年龄、性别、外貌等): ").strip()
    if not description:
        print("❌ 人物描述不能为空")
        return
    
    styles = ["realistic", "artistic", "oil_painting", "sketch"]
    print("\n请选择肖像风格:")
    for i, style in enumerate(styles, 1):
        print(f"{i}. {creator.styles[style]}")
    
    style_choice = input("请选择 (1-4): ").strip()
    style = styles[int(style_choice)-1] if style_choice.isdigit() and 1 <= int(style_choice) <= 4 else "realistic"
    
    print(f"\n🎯 开始创作{creator.styles[style]}肖像...")
    
    result = creator.create_portrait(description, style)
    
    if result["success"]:
        print("\n✅ 肖像创作完成!")
        
        timestamp = __import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"portrait_{style}_{timestamp}.png"
        
        metadata = {
            "type": "portrait",
            "description": description,
            "style": creator.styles[style],
            "created_at": timestamp
        }
        
        creator.save_artwork(result["image_data"], filename, metadata)
    else:
        print(f"❌ 创作失败: {result['error']}")

def landscape_creation(creator):
    """风景画创作"""
    print("\n🏞️  风景画创作")
    print("-" * 30)
    
    scene = input("请描述风景场景: ").strip()
    if not scene:
        print("❌ 场景描述不能为空")
        return
    
    styles = ["realistic", "oil_painting", "watercolor", "digital_art"]
    print("\n请选择风景风格:")
    for i, style in enumerate(styles, 1):
        print(f"{i}. {creator.styles[style]}")
    
    style_choice = input("请选择 (1-4): ").strip()
    style = styles[int(style_choice)-1] if style_choice.isdigit() and 1 <= int(style_choice) <= 4 else "realistic"
    
    print(f"\n🎯 开始创作{creator.styles[style]}风景画...")
    
    result = creator.create_landscape(scene, style)
    
    if result["success"]:
        print("\n✅ 风景画创作完成!")
        
        timestamp = __import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"landscape_{style}_{timestamp}.png"
        
        metadata = {
            "type": "landscape",
            "scene": scene,
            "style": creator.styles[style],
            "created_at": timestamp
        }
        
        creator.save_artwork(result["image_data"], filename, metadata)
    else:
        print(f"❌ 创作失败: {result['error']}")

def character_creation(creator):
    """角色设计创作"""
    print("\n🦸 角色设计创作")
    print("-" * 30)
    
    character = input("请描述角色设定: ").strip()
    if not character:
        print("❌ 角色描述不能为空")
        return
    
    styles = ["anime", "cartoon", "fantasy", "sci_fi"]
    print("\n请选择角色风格:")
    for i, style in enumerate(styles, 1):
        print(f"{i}. {creator.styles[style]}")
    
    style_choice = input("请选择 (1-4): ").strip()
    style = styles[int(style_choice)-1] if style_choice.isdigit() and 1 <= int(style_choice) <= 4 else "anime"
    
    print(f"\n🎯 开始设计{creator.styles[style]}角色...")
    
    result = creator.create_character(character, style)
    
    if result["success"]:
        print("\n✅ 角色设计完成!")
        
        timestamp = __import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"character_{style}_{timestamp}.png"
        
        metadata = {
            "type": "character",
            "character": character,
            "style": creator.styles[style],
            "created_at": timestamp
        }
        
        creator.save_artwork(result["image_data"], filename, metadata)
    else:
        print(f"❌ 创作失败: {result['error']}")

def scene_creation(creator):
    """场景插画创作"""
    print("\n🌆 场景插画创作")
    print("-" * 30)
    
    scene = input("请描述场景设定: ").strip()
    if not scene:
        print("❌ 场景描述不能为空")
        return
    
    styles = ["digital_art", "fantasy", "sci_fi", "artistic"]
    print("\n请选择场景风格:")
    for i, style in enumerate(styles, 1):
        print(f"{i}. {creator.styles[style]}")
    
    style_choice = input("请选择 (1-4): ").strip()
    style = styles[int(style_choice)-1] if style_choice.isdigit() and 1 <= int(style_choice) <= 4 else "digital_art"
    
    print(f"\n🎯 开始创作{creator.styles[style]}场景...")
    
    result = creator.create_scene(scene, style)
    
    if result["success"]:
        print("\n✅ 场景插画完成!")
        
        timestamp = __import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"scene_{style}_{timestamp}.png"
        
        metadata = {
            "type": "scene",
            "scene": scene,
            "style": creator.styles[style],
            "created_at": timestamp
        }
        
        creator.save_artwork(result["image_data"], filename, metadata)
    else:
        print(f"❌ 创作失败: {result['error']}")

def show_styles(creator):
    """显示所有可用风格"""
    print("\n🎭 可用绘画风格")
    print("-" * 30)
    
    for key, name in creator.styles.items():
        print(f"• {name} ({key})")
    
    input("\n按回车键继续...")

def main():
    """主函数"""
    interactive_mode()

if __name__ == "__main__":
    main()
