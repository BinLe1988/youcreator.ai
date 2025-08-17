#!/usr/bin/env python3
"""
多模态功能测试脚本
演示文字配图、文字配乐、图片配乐等功能
"""

import asyncio
import httpx
import json
import base64
from pathlib import Path

BASE_URL = "http://localhost:8000/api/v1"

async def test_multimodal_status():
    """测试多模态服务状态"""
    print("🔍 检查多模态服务状态...")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/multimodal/multimodal-status")
        if response.status_code == 200:
            result = response.json()
            print("✅ 多模态服务状态:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            print(f"❌ 服务状态检查失败: {response.status_code}")

async def test_text_to_image():
    """测试文字配图功能"""
    print("\n🎨 测试文字配图功能...")
    
    test_cases = [
        {
            "text": "一个宁静的湖边小屋，夕阳西下，远山如黛",
            "style": "realistic",
            "filename": "lakeside_house.png"
        },
        {
            "text": "未来科技城市，霓虹灯闪烁，飞行汽车穿梭",
            "style": "artistic", 
            "filename": "futuristic_city.png"
        },
        {
            "text": "可爱的小猫咪在花园里玩耍",
            "style": "cartoon",
            "filename": "cute_cat.png"
        }
    ]
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        for i, case in enumerate(test_cases):
            print(f"\n📝 测试案例 {i+1}: {case['text']}")
            
            try:
                response = await client.post(
                    f"{BASE_URL}/multimodal/text-to-image",
                    json={
                        "text": case["text"],
                        "style": case["style"],
                        "width": 512,
                        "height": 512
                    }
                )
                
                if response.status_code == 200:
                    # 保存图像
                    with open(case["filename"], "wb") as f:
                        f.write(response.content)
                    print(f"✅ 图像已保存: {case['filename']}")
                else:
                    print(f"❌ 图像生成失败: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ 请求失败: {e}")

async def test_text_to_music():
    """测试文字配乐功能"""
    print("\n🎵 测试文字配乐功能...")
    
    test_cases = [
        {
            "text": "激动人心的冒险故事，英雄踏上未知的征程",
            "style": "orchestral",
            "duration": 15,
            "filename": "adventure_music.wav"
        },
        {
            "text": "宁静的森林，鸟儿轻声歌唱，微风轻抚",
            "style": "ambient",
            "duration": 20,
            "filename": "peaceful_forest.wav"
        }
    ]
    
    async with httpx.AsyncClient(timeout=180.0) as client:
        for i, case in enumerate(test_cases):
            print(f"\n🎼 测试案例 {i+1}: {case['text']}")
            
            try:
                response = await client.post(
                    f"{BASE_URL}/multimodal/text-to-music",
                    json={
                        "text": case["text"],
                        "duration": case["duration"],
                        "style": case["style"]
                    }
                )
                
                if response.status_code == 200:
                    # 保存音频
                    with open(case["filename"], "wb") as f:
                        f.write(response.content)
                    print(f"✅ 音频已保存: {case['filename']}")
                else:
                    print(f"❌ 音乐生成失败: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ 请求失败: {e}")

async def test_complete_content():
    """测试完整多模态内容生成"""
    print("\n🎯 测试完整多模态内容生成...")
    
    test_text = "在遥远的星球上，一座水晶城市在双月的照耀下闪闪发光"
    
    async with httpx.AsyncClient(timeout=300.0) as client:
        try:
            response = await client.post(
                f"{BASE_URL}/multimodal/complete-content",
                json={
                    "text": test_text,
                    "include_image": True,
                    "include_music": True,
                    "image_style": "artistic",
                    "music_duration": 30,
                    "image_width": 768,
                    "image_height": 512
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ 完整内容生成成功!")
                
                # 保存图像
                if result["data"].get("image"):
                    image_data = base64.b64decode(result["data"]["image"]["data"])
                    with open("complete_content_image.png", "wb") as f:
                        f.write(image_data)
                    print("📸 图像已保存: complete_content_image.png")
                
                # 保存音频
                if result["data"].get("music"):
                    music_data = base64.b64decode(result["data"]["music"]["data"])
                    with open("complete_content_music.wav", "wb") as f:
                        f.write(music_data)
                    print("🎵 音频已保存: complete_content_music.wav")
                
                # 显示元数据
                metadata = result["data"].get("metadata", {})
                print(f"📊 生成时间: {metadata.get('generation_time', 'N/A')}秒")
                print(f"🎨 风格分析: {json.dumps(metadata.get('style_analysis', {}), ensure_ascii=False)}")
                
            else:
                print(f"❌ 完整内容生成失败: {response.status_code}")
                
        except Exception as e:
            print(f"❌ 请求失败: {e}")

async def test_style_analysis():
    """测试风格分析功能"""
    print("\n📊 测试风格分析功能...")
    
    test_texts = [
        "神秘的古堡在月光下显得格外阴森",
        "孩子们在阳光明媚的公园里快乐地玩耍",
        "宇宙飞船穿越星际，探索未知的文明"
    ]
    
    async with httpx.AsyncClient() as client:
        for i, text in enumerate(test_texts):
            print(f"\n📝 分析文本 {i+1}: {text}")
            
            try:
                response = await client.get(
                    f"{BASE_URL}/multimodal/analyze-text-style",
                    params={"text": text}
                )
                
                if response.status_code == 200:
                    result = response.json()
                    analysis = result["data"]["style_analysis"]
                    recommendations = result["data"]["recommendations"]
                    
                    print(f"🎭 情绪: {analysis['mood']}")
                    print(f"🎬 类型: {analysis['genre']}")
                    print(f"🎨 推荐图像风格: {recommendations['image_style']}")
                    print(f"🎵 推荐音乐风格: {recommendations['music_style']}")
                else:
                    print(f"❌ 风格分析失败: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ 请求失败: {e}")

async def main():
    """主函数"""
    print("🎨 YouCreator.AI 多模态功能测试")
    print("=" * 50)
    
    try:
        # 测试服务状态
        await test_multimodal_status()
        
        # 测试各项功能
        await test_style_analysis()
        await test_text_to_image()
        await test_text_to_music()
        await test_complete_content()
        
        print("\n🎉 所有测试完成!")
        print("\n📁 生成的文件:")
        
        # 列出生成的文件
        files = [
            "lakeside_house.png",
            "futuristic_city.png", 
            "cute_cat.png",
            "adventure_music.wav",
            "peaceful_forest.wav",
            "complete_content_image.png",
            "complete_content_music.wav"
        ]
        
        for file in files:
            if Path(file).exists():
                size = Path(file).stat().st_size
                print(f"  ✅ {file} ({size} bytes)")
            else:
                print(f"  ❌ {file} (未生成)")
                
    except KeyboardInterrupt:
        print("\n⏹️ 测试被用户中断")
    except Exception as e:
        print(f"\n❌ 测试过程中出现错误: {e}")

if __name__ == "__main__":
    asyncio.run(main())
