#!/usr/bin/env python3
"""
测试Bagel模型图片生成功能
"""
import asyncio
import requests
import json
import base64
from PIL import Image
import io
import time

# API配置
API_BASE_URL = "http://localhost:8000"
BAGEL_API_URL = f"{API_BASE_URL}/api/v1/bagel"

async def test_bagel_text_to_image():
    """测试Bagel文字生成图片"""
    print("🎨 测试Bagel文字生成图片...")
    
    # 测试请求数据
    test_requests = [
        {
            "text": "一只可爱的小猫咪坐在花园里，阳光明媚，高清摄影",
            "style": "realistic",
            "width": 512,
            "height": 512,
            "num_inference_steps": 20,
            "guidance_scale": 7.5,
            "num_images": 1,
            "seed": 42
        },
        {
            "text": "未来科幻城市，霓虹灯闪烁，赛博朋克风格",
            "style": "sci_fi",
            "width": 768,
            "height": 512,
            "num_inference_steps": 25,
            "guidance_scale": 8.0,
            "num_images": 2
        },
        {
            "text": "梦幻森林中的精灵，魔法光芒，奇幻艺术",
            "style": "fantasy",
            "width": 512,
            "height": 768,
            "num_inference_steps": 30,
            "guidance_scale": 9.0,
            "negative_prompt": "dark, scary, ugly, low quality"
        }
    ]
    
    for i, request_data in enumerate(test_requests):
        print(f"\n--- 测试 {i+1}: {request_data['text'][:30]}... ---")
        
        try:
            # 发送请求
            response = requests.post(
                f"{BAGEL_API_URL}/text-to-image",
                json=request_data,
                timeout=120
            )
            
            if response.status_code == 200:
                result = response.json()
                
                if result["success"]:
                    print("✅ 生成成功!")
                    print(f"   风格: {result['data']['style']}")
                    print(f"   尺寸: {result['data']['dimensions']['width']}x{result['data']['dimensions']['height']}")
                    print(f"   模型: {result['data']['model']}")
                    print(f"   生成图片数量: {len(result['data']['images'])}")
                    
                    # 保存图片
                    for j, img_data in enumerate(result['data']['images']):
                        save_image_from_base64(
                            img_data['image'], 
                            f"bagel_test_{i+1}_{j+1}.png"
                        )
                        print(f"   图片已保存: bagel_test_{i+1}_{j+1}.png")
                else:
                    print(f"❌ 生成失败: {result.get('error', 'Unknown error')}")
            else:
                print(f"❌ API请求失败: {response.status_code}")
                print(f"   错误信息: {response.text}")
                
        except requests.exceptions.Timeout:
            print("⏰ 请求超时，Bagel模型生成可能需要更长时间")
        except Exception as e:
            print(f"❌ 请求异常: {e}")
        
        # 等待一下再进行下一个测试
        time.sleep(2)

def test_bagel_styles():
    """测试获取Bagel支持的风格"""
    print("\n🎭 测试获取Bagel支持的风格...")
    
    try:
        response = requests.get(f"{BAGEL_API_URL}/styles")
        
        if response.status_code == 200:
            result = response.json()
            
            if result["success"]:
                print("✅ 获取风格成功!")
                styles = result["data"]["styles"]
                
                print(f"   支持的风格数量: {len(styles)}")
                print("   风格列表:")
                
                for style in styles:
                    print(f"   - {style['id']}: {style['name']} - {style['description']}")
            else:
                print(f"❌ 获取风格失败: {result.get('error', 'Unknown error')}")
        else:
            print(f"❌ API请求失败: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")

def test_bagel_capabilities():
    """测试获取Bagel模型能力"""
    print("\n🔧 测试获取Bagel模型能力...")
    
    try:
        response = requests.get(f"{BAGEL_API_URL}/capabilities")
        
        if response.status_code == 200:
            result = response.json()
            
            if result["success"]:
                print("✅ 获取能力信息成功!")
                data = result["data"]
                
                print(f"   模型名称: {data['model_name']}")
                print("   主要功能:")
                for feature in data["features"]:
                    print(f"   - {feature}")
                
                print("   模型优势:")
                for advantage in data["advantages"]:
                    print(f"   - {advantage}")
            else:
                print(f"❌ 获取能力失败: {result.get('error', 'Unknown error')}")
        else:
            print(f"❌ API请求失败: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")

def test_bagel_health():
    """测试Bagel服务健康状态"""
    print("\n💚 测试Bagel服务健康状态...")
    
    try:
        response = requests.get(f"{BAGEL_API_URL}/health")
        
        if response.status_code == 200:
            result = response.json()
            
            print(f"✅ 服务状态: {result['status']}")
            print(f"   服务名称: {result['service']}")
            print(f"   模型: {result['model']}")
            
            if 'features_available' in result:
                print("   可用功能:")
                for feature in result['features_available']:
                    print(f"   - {feature}")
        else:
            print(f"❌ 健康检查失败: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")

def test_bagel_image_variations():
    """测试Bagel图像变体生成"""
    print("\n🔄 测试Bagel图像变体生成...")
    
    # 首先生成一张基础图片
    print("   先生成基础图片...")
    
    base_request = {
        "text": "一朵美丽的红玫瑰",
        "style": "realistic",
        "width": 512,
        "height": 512,
        "seed": 123
    }
    
    try:
        response = requests.post(
            f"{BAGEL_API_URL}/text-to-image",
            json=base_request,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if result["success"]:
                base_image = result["data"]["images"][0]["image"]
                print("   ✅ 基础图片生成成功")
                
                # 保存基础图片
                save_image_from_base64(base_image, "bagel_base_rose.png")
                print("   基础图片已保存: bagel_base_rose.png")
                
                # 生成变体
                print("   生成图像变体...")
                
                variation_request = {
                    "base_image": base_image,
                    "prompt": "美丽的玫瑰花，不同的颜色和风格",
                    "num_variations": 3,
                    "variation_strength": 0.7
                }
                
                var_response = requests.post(
                    f"{BAGEL_API_URL}/image-variations",
                    json=variation_request,
                    timeout=120
                )
                
                if var_response.status_code == 200:
                    var_result = var_response.json()
                    
                    if var_result["success"]:
                        print("   ✅ 变体生成成功!")
                        variations = var_result["data"]["variations"]
                        
                        for i, variation in enumerate(variations):
                            save_image_from_base64(
                                variation["image"], 
                                f"bagel_variation_{i+1}.png"
                            )
                            print(f"   变体 {i+1} 已保存: bagel_variation_{i+1}.png")
                    else:
                        print(f"   ❌ 变体生成失败: {var_result.get('error')}")
                else:
                    print(f"   ❌ 变体请求失败: {var_response.status_code}")
            else:
                print(f"   ❌ 基础图片生成失败: {result.get('error')}")
        else:
            print(f"   ❌ 基础图片请求失败: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 变体测试异常: {e}")

def save_image_from_base64(base64_data: str, filename: str):
    """从base64数据保存图片"""
    try:
        # 移除data:image/png;base64,前缀
        if base64_data.startswith('data:image'):
            base64_data = base64_data.split(',')[1]
        
        # 解码base64数据
        image_data = base64.b64decode(base64_data)
        
        # 打开并保存图片
        image = Image.open(io.BytesIO(image_data))
        image.save(filename)
        
    except Exception as e:
        print(f"保存图片失败: {e}")

def main():
    """主测试函数"""
    print("🚀 开始测试Bagel模型图片生成功能")
    print("=" * 50)
    
    # 测试服务健康状态
    test_bagel_health()
    
    # 测试获取模型能力
    test_bagel_capabilities()
    
    # 测试获取支持的风格
    test_bagel_styles()
    
    # 测试文字生成图片
    asyncio.run(test_bagel_text_to_image())
    
    # 测试图像变体生成
    test_bagel_image_variations()
    
    print("\n" + "=" * 50)
    print("🎉 Bagel模型测试完成!")
    print("生成的图片已保存到当前目录")

if __name__ == "__main__":
    main()
