#!/usr/bin/env python3
"""
Bagel模型图片生成简单示例
"""
import requests
import json
import base64
from PIL import Image
import io

def generate_image_with_bagel(prompt, style="realistic"):
    """使用Bagel模型生成图片"""
    
    # API端点
    url = "http://localhost:8000/api/v1/bagel/text-to-image"
    
    # 请求数据
    data = {
        "text": prompt,
        "style": style,
        "width": 512,
        "height": 512,
        "num_inference_steps": 20,
        "guidance_scale": 7.5,
        "num_images": 1
    }
    
    print(f"🎨 使用Bagel模型生成图片...")
    print(f"   提示词: {prompt}")
    print(f"   风格: {style}")
    
    try:
        # 发送请求
        response = requests.post(url, json=data, timeout=120)
        
        if response.status_code == 200:
            result = response.json()
            
            if result["success"]:
                print("✅ 生成成功!")
                
                # 获取图片数据
                image_data = result["data"]["images"][0]["image"]
                
                # 保存图片
                filename = f"bagel_{style}_{hash(prompt) % 10000}.png"
                save_image(image_data, filename)
                
                print(f"📸 图片已保存: {filename}")
                
                return {
                    "success": True,
                    "filename": filename,
                    "image_data": image_data,
                    "metadata": result["data"]
                }
            else:
                print(f"❌ 生成失败: {result.get('error')}")
                return {"success": False, "error": result.get('error')}
        else:
            print(f"❌ API请求失败: {response.status_code}")
            return {"success": False, "error": f"HTTP {response.status_code}"}
            
    except requests.exceptions.Timeout:
        print("⏰ 请求超时")
        return {"success": False, "error": "Timeout"}
    except Exception as e:
        print(f"❌ 异常: {e}")
        return {"success": False, "error": str(e)}

def save_image(base64_data, filename):
    """保存base64图片数据"""
    try:
        # 移除data URL前缀
        if base64_data.startswith('data:image'):
            base64_data = base64_data.split(',')[1]
        
        # 解码并保存
        image_data = base64.b64decode(base64_data)
        image = Image.open(io.BytesIO(image_data))
        image.save(filename)
        
    except Exception as e:
        print(f"保存图片失败: {e}")

def main():
    """主函数 - 演示Bagel模型使用"""
    
    print("🚀 Bagel模型图片生成示例")
    print("=" * 40)
    
    # 示例1: 写实风格
    print("\n📷 示例1: 写实风格")
    generate_image_with_bagel(
        "一只橘猫坐在窗台上看着外面的雨景，温馨的室内光线",
        "realistic"
    )
    
    # 示例2: 动漫风格
    print("\n🎌 示例2: 动漫风格")
    generate_image_with_bagel(
        "可爱的动漫女孩在樱花树下读书，春天的午后",
        "anime"
    )
    
    # 示例3: 科幻风格
    print("\n🚀 示例3: 科幻风格")
    generate_image_with_bagel(
        "未来城市的天际线，飞行汽车穿梭其间，霓虹灯闪烁",
        "sci_fi"
    )
    
    # 示例4: 奇幻风格
    print("\n🧙 示例4: 奇幻风格")
    generate_image_with_bagel(
        "魔法森林中的古老城堡，月光洒在石塔上",
        "fantasy"
    )
    
    # 示例5: 艺术风格
    print("\n🎨 示例5: 艺术风格")
    generate_image_with_bagel(
        "抽象的色彩流动，表达音乐的韵律和节拍",
        "abstract"
    )
    
    print("\n" + "=" * 40)
    print("🎉 示例完成! 请查看生成的图片文件")

if __name__ == "__main__":
    main()
