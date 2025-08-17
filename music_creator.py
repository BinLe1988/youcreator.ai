#!/usr/bin/env python3
"""
YouCreator.AI - 音乐创作工具
支持文字生成音乐、图片配乐等功能
"""
import requests
import json
import base64
import os
from typing import Dict, List, Optional

class MusicCreator:
    """音乐创作器"""
    
    def __init__(self, api_base="http://localhost:8000"):
        self.api_base = api_base
        self.session = requests.Session()
        self.music_styles = {
            "ambient": "环境音乐 - 轻松舒缓",
            "classical": "古典音乐 - 优雅庄重", 
            "electronic": "电子音乐 - 现代科技",
            "jazz": "爵士音乐 - 自由即兴",
            "rock": "摇滚音乐 - 激情澎湃",
            "pop": "流行音乐 - 朗朗上口",
            "folk": "民谣音乐 - 质朴自然",
            "orchestral": "管弦乐 - 宏伟壮丽",
            "piano": "钢琴音乐 - 纯净优美",
            "acoustic": "原声音乐 - 温暖真实",
            "cinematic": "电影配乐 - 戏剧张力",
            "meditation": "冥想音乐 - 宁静致远"
        }
    
    def create_music_from_text(self, 
                              description: str,
                              duration: int = 15,
                              style: str = "ambient",
                              mood: str = "peaceful") -> Dict:
        """根据文字描述创作音乐"""
        
        # 增强音乐描述
        enhanced_description = self._enhance_music_prompt(description, style, mood)
        
        try:
            response = self.session.post(
                f"{self.api_base}/api/v1/bagel/text-to-music",
                json={
                    "text": enhanced_description,
                    "duration": duration,
                    "temperature": 1.0,
                    "top_k": 250,
                    "top_p": 0.0
                },
                timeout=120
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    return {
                        "success": True,
                        "audio_data": result["data"]["audio"],
                        "description": enhanced_description,
                        "original_description": description,
                        "duration": duration,
                        "style": style,
                        "mood": mood,
                        "sample_rate": result["data"].get("sample_rate", 32000)
                    }
                else:
                    return {"success": False, "error": result.get("error", "音乐生成失败")}
            else:
                return {"success": False, "error": f"API请求失败: {response.status_code}"}
                
        except Exception as e:
            return {"success": False, "error": f"请求异常: {str(e)}"}
    
    def create_music_from_image(self, 
                               image_path: str,
                               duration: int = 15,
                               mood: str = "auto") -> Dict:
        """根据图片创作配乐"""
        
        try:
            # 读取图片文件
            with open(image_path, 'rb') as f:
                image_data = base64.b64encode(f.read()).decode()
            
            response = self.session.post(
                f"{self.api_base}/api/v1/bagel/image-to-music",
                json={
                    "image_base64": f"data:image/jpeg;base64,{image_data}",
                    "duration": duration,
                    "temperature": 1.0
                },
                timeout=120
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    return {
                        "success": True,
                        "audio_data": result["data"]["audio"],
                        "image_caption": result["data"].get("image_caption", ""),
                        "music_description": result["data"].get("music_description", ""),
                        "duration": duration,
                        "mood": mood,
                        "sample_rate": result["data"].get("sample_rate", 32000)
                    }
                else:
                    return {"success": False, "error": result.get("error", "配乐生成失败")}
            else:
                return {"success": False, "error": f"API请求失败: {response.status_code}"}
                
        except FileNotFoundError:
            return {"success": False, "error": f"图片文件不存在: {image_path}"}
        except Exception as e:
            return {"success": False, "error": f"请求异常: {str(e)}"}
    
    def create_theme_music(self, theme: str, duration: int = 20) -> Dict:
        """创作主题音乐"""
        
        theme_descriptions = {
            "adventure": "冒险主题音乐，激动人心的旋律，充满探索精神",
            "romance": "浪漫主题音乐，温柔甜美的旋律，表达爱情美好",
            "mystery": "神秘主题音乐，悬疑紧张的氛围，引人入胜",
            "victory": "胜利主题音乐，雄壮激昂的旋律，庆祝成功",
            "sadness": "悲伤主题音乐，忧郁深沉的旋律，表达哀愁",
            "hope": "希望主题音乐，明亮向上的旋律，充满正能量",
            "nature": "自然主题音乐，清新自然的声音，回归本真",
            "space": "太空主题音乐，宏大神秘的音效，探索宇宙",
            "childhood": "童年主题音乐，纯真快乐的旋律，回忆美好",
            "epic": "史诗主题音乐，宏伟壮丽的编曲，气势磅礴"
        }
        
        description = theme_descriptions.get(theme, f"{theme}主题音乐")
        return self.create_music_from_text(description, duration, "orchestral", theme)
    
    def create_ambient_soundscape(self, environment: str, duration: int = 30) -> Dict:
        """创作环境音景"""
        
        environment_descriptions = {
            "forest": "森林环境音景，鸟鸣虫叫，树叶沙沙声，宁静自然",
            "ocean": "海洋环境音景，海浪拍岸，海鸥鸣叫，清新海风",
            "rain": "雨天环境音景，雨滴声，雷声，湿润清新的氛围",
            "city": "城市环境音景，车流声，人声，现代都市的节奏",
            "mountain": "山区环境音景，风声，回声，空旷宁静的感觉",
            "cafe": "咖啡厅环境音景，轻柔背景音乐，谈话声，温馨氛围",
            "library": "图书馆环境音景，翻书声，脚步声，安静学习氛围",
            "fireplace": "壁炉环境音景，火焰燃烧声，温暖舒适的感觉"
        }
        
        description = environment_descriptions.get(environment, f"{environment}环境音景")
        return self.create_music_from_text(description, duration, "ambient", "peaceful")
    
    def _enhance_music_prompt(self, description: str, style: str, mood: str) -> str:
        """增强音乐生成提示词"""
        
        style_keywords = {
            "ambient": "ambient, atmospheric, ethereal, floating",
            "classical": "classical, orchestral, elegant, refined",
            "electronic": "electronic, synthesized, digital, modern",
            "jazz": "jazz, improvised, swing, sophisticated",
            "rock": "rock, energetic, powerful, driving",
            "pop": "pop, catchy, melodic, accessible",
            "folk": "folk, acoustic, traditional, storytelling",
            "orchestral": "orchestral, symphonic, grand, majestic",
            "piano": "piano, solo, expressive, intimate",
            "acoustic": "acoustic, natural, organic, warm",
            "cinematic": "cinematic, dramatic, emotional, epic",
            "meditation": "meditation, peaceful, calming, spiritual"
        }
        
        mood_keywords = {
            "happy": "joyful, uplifting, bright, cheerful",
            "sad": "melancholic, somber, emotional, touching",
            "peaceful": "calm, serene, tranquil, relaxing",
            "energetic": "dynamic, vibrant, exciting, powerful",
            "mysterious": "mysterious, enigmatic, suspenseful, dark",
            "romantic": "romantic, tender, loving, intimate",
            "epic": "epic, heroic, grand, triumphant",
            "nostalgic": "nostalgic, wistful, reminiscent, bittersweet"
        }
        
        style_desc = style_keywords.get(style, "")
        mood_desc = mood_keywords.get(mood, "")
        
        enhanced = f"{description}"
        if style_desc:
            enhanced += f", {style_desc}"
        if mood_desc:
            enhanced += f", {mood_desc}"
        
        return enhanced
    
    def save_music(self, audio_data: str, filename: str, metadata: Dict = None):
        """保存音乐文件"""
        try:
            # 创建输出目录
            output_dir = "music_creations"
            os.makedirs(output_dir, exist_ok=True)
            
            # 解码音频数据
            if audio_data.startswith('data:audio'):
                audio_data = audio_data.split(',')[1]
            
            audio_bytes = base64.b64decode(audio_data)
            
            # 保存音频文件
            filepath = os.path.join(output_dir, filename)
            with open(filepath, 'wb') as f:
                f.write(audio_bytes)
            
            # 保存元数据
            if metadata:
                metadata_file = filepath.replace('.wav', '_metadata.json')
                with open(metadata_file, 'w', encoding='utf-8') as f:
                    json.dump(metadata, f, ensure_ascii=False, indent=2)
            
            print(f"✅ 音乐已保存到: {filepath}")
            return filepath
            
        except Exception as e:
            print(f"❌ 保存失败: {e}")
            return None

def interactive_mode():
    """交互式音乐创作模式"""
    creator = MusicCreator()
    
    print("🎵 YouCreator.AI 音乐创作工具")
    print("=" * 50)
    
    while True:
        print("\n🎼 请选择创作类型:")
        print("1. 文字生成音乐")
        print("2. 图片配乐")
        print("3. 主题音乐")
        print("4. 环境音景")
        print("5. 查看音乐风格")
        print("0. 退出")
        
        choice = input("\n请输入选择 (0-5): ").strip()
        
        if choice == "0":
            print("👋 感谢使用YouCreator.AI!")
            break
        elif choice == "1":
            text_to_music(creator)
        elif choice == "2":
            image_to_music(creator)
        elif choice == "3":
            theme_music(creator)
        elif choice == "4":
            ambient_soundscape(creator)
        elif choice == "5":
            show_music_styles(creator)
        else:
            print("❌ 无效选择，请重新输入")

def text_to_music(creator):
    """文字生成音乐"""
    print("\n🎤 文字生成音乐")
    print("-" * 30)
    
    description = input("请描述您想要的音乐: ").strip()
    if not description:
        print("❌ 音乐描述不能为空")
        return
    
    # 选择风格
    styles = list(creator.music_styles.items())
    print("\n请选择音乐风格:")
    for i, (key, desc) in enumerate(styles[:6], 1):
        print(f"{i}. {desc}")
    print("7. 更多风格...")
    
    style_choice = input("请选择 (1-7): ").strip()
    
    if style_choice == "7":
        for i, (key, desc) in enumerate(styles[6:], 8):
            print(f"{i}. {desc}")
        style_choice = input("请选择 (8-12): ").strip()
    
    style_idx = int(style_choice) - 1 if style_choice.isdigit() else 0
    style_key = styles[style_idx][0] if 0 <= style_idx < len(styles) else "ambient"
    
    # 选择情绪
    moods = ["peaceful", "happy", "sad", "energetic", "mysterious", "romantic"]
    print("\n请选择音乐情绪:")
    for i, mood in enumerate(moods, 1):
        print(f"{i}. {mood}")
    
    mood_choice = input("请选择 (1-6): ").strip()
    mood = moods[int(mood_choice)-1] if mood_choice.isdigit() and 1 <= int(mood_choice) <= 6 else "peaceful"
    
    # 选择时长
    duration = input("请输入音乐时长(秒) [15]: ").strip()
    duration = int(duration) if duration.isdigit() and 5 <= int(duration) <= 30 else 15
    
    print(f"\n🎯 开始创作音乐...")
    print(f"   描述: {description}")
    print(f"   风格: {creator.music_styles[style_key]}")
    print(f"   情绪: {mood}")
    print(f"   时长: {duration}秒")
    
    result = creator.create_music_from_text(description, duration, style_key, mood)
    
    if result["success"]:
        print("\n✅ 音乐创作完成!")
        
        # 保存音乐
        timestamp = __import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"music_{style_key}_{timestamp}.wav"
        
        metadata = {
            "description": description,
            "style": creator.music_styles[style_key],
            "mood": mood,
            "duration": duration,
            "created_at": timestamp
        }
        
        creator.save_music(result["audio_data"], filename, metadata)
    else:
        print(f"❌ 创作失败: {result['error']}")

def image_to_music(creator):
    """图片配乐"""
    print("\n🖼️  图片配乐")
    print("-" * 30)
    
    image_path = input("请输入图片文件路径: ").strip()
    if not image_path:
        print("❌ 图片路径不能为空")
        return
    
    if not os.path.exists(image_path):
        print("❌ 图片文件不存在")
        return
    
    duration = input("请输入音乐时长(秒) [15]: ").strip()
    duration = int(duration) if duration.isdigit() and 5 <= int(duration) <= 30 else 15
    
    print(f"\n🎯 开始为图片创作配乐...")
    print(f"   图片: {image_path}")
    print(f"   时长: {duration}秒")
    
    result = creator.create_music_from_image(image_path, duration)
    
    if result["success"]:
        print("\n✅ 配乐创作完成!")
        print(f"   图片描述: {result.get('image_caption', 'N/A')}")
        print(f"   音乐描述: {result.get('music_description', 'N/A')}")
        
        # 保存音乐
        timestamp = __import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"soundtrack_{timestamp}.wav"
        
        metadata = {
            "type": "image_soundtrack",
            "image_path": image_path,
            "image_caption": result.get('image_caption', ''),
            "music_description": result.get('music_description', ''),
            "duration": duration,
            "created_at": timestamp
        }
        
        creator.save_music(result["audio_data"], filename, metadata)
    else:
        print(f"❌ 配乐失败: {result['error']}")

def theme_music(creator):
    """主题音乐创作"""
    print("\n🎭 主题音乐创作")
    print("-" * 30)
    
    themes = [
        "adventure", "romance", "mystery", "victory", "sadness",
        "hope", "nature", "space", "childhood", "epic"
    ]
    
    print("请选择音乐主题:")
    for i, theme in enumerate(themes, 1):
        print(f"{i:2d}. {theme}")
    
    theme_choice = input("请选择 (1-10): ").strip()
    theme = themes[int(theme_choice)-1] if theme_choice.isdigit() and 1 <= int(theme_choice) <= 10 else "adventure"
    
    duration = input("请输入音乐时长(秒) [20]: ").strip()
    duration = int(duration) if duration.isdigit() and 5 <= int(duration) <= 30 else 20
    
    print(f"\n🎯 开始创作{theme}主题音乐...")
    
    result = creator.create_theme_music(theme, duration)
    
    if result["success"]:
        print("\n✅ 主题音乐创作完成!")
        
        # 保存音乐
        timestamp = __import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"theme_{theme}_{timestamp}.wav"
        
        metadata = {
            "type": "theme_music",
            "theme": theme,
            "duration": duration,
            "created_at": timestamp
        }
        
        creator.save_music(result["audio_data"], filename, metadata)
    else:
        print(f"❌ 创作失败: {result['error']}")

def ambient_soundscape(creator):
    """环境音景创作"""
    print("\n🌿 环境音景创作")
    print("-" * 30)
    
    environments = [
        "forest", "ocean", "rain", "city", 
        "mountain", "cafe", "library", "fireplace"
    ]
    
    print("请选择环境类型:")
    for i, env in enumerate(environments, 1):
        print(f"{i}. {env}")
    
    env_choice = input("请选择 (1-8): ").strip()
    environment = environments[int(env_choice)-1] if env_choice.isdigit() and 1 <= int(env_choice) <= 8 else "forest"
    
    duration = input("请输入音景时长(秒) [30]: ").strip()
    duration = int(duration) if duration.isdigit() and 10 <= int(duration) <= 60 else 30
    
    print(f"\n🎯 开始创作{environment}环境音景...")
    
    result = creator.create_ambient_soundscape(environment, duration)
    
    if result["success"]:
        print("\n✅ 环境音景创作完成!")
        
        # 保存音乐
        timestamp = __import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"ambient_{environment}_{timestamp}.wav"
        
        metadata = {
            "type": "ambient_soundscape",
            "environment": environment,
            "duration": duration,
            "created_at": timestamp
        }
        
        creator.save_music(result["audio_data"], filename, metadata)
    else:
        print(f"❌ 创作失败: {result['error']}")

def show_music_styles(creator):
    """显示所有音乐风格"""
    print("\n🎼 可用音乐风格")
    print("-" * 30)
    
    for key, desc in creator.music_styles.items():
        print(f"• {desc}")
    
    input("\n按回车键继续...")

def main():
    """主函数"""
    interactive_mode()

if __name__ == "__main__":
    main()
