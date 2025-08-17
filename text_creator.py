#!/usr/bin/env python3
"""
YouCreator.AI - 文字创作工具
支持小说、诗歌、剧本、文章等多种文体创作
"""
import requests
import json
import sys
import os
from typing import Dict, List, Optional

class TextCreator:
    """文字创作器"""
    
    def __init__(self, api_base="http://localhost:8080"):
        self.api_base = api_base
        self.session = requests.Session()
    
    def create_novel(self, 
                    theme: str, 
                    genre: str = "现代都市",
                    length: str = "短篇",
                    style: str = "第三人称") -> Dict:
        """创作小说"""
        
        prompt = f"""
        请创作一篇{genre}题材的{length}小说，主题是：{theme}
        
        要求：
        - 使用{style}叙述
        - 情节完整，有开头、发展、高潮、结尾
        - 人物形象鲜明
        - 语言生动有趣
        - 字数适中，内容丰富
        """
        
        return self._generate_text(prompt, "小说创作")
    
    def create_poem(self, 
                   theme: str, 
                   style: str = "现代诗",
                   mood: str = "抒情") -> Dict:
        """创作诗歌"""
        
        prompt = f"""
        请创作一首{style}，主题是：{theme}
        
        要求：
        - 情感基调：{mood}
        - 意境优美，富有诗意
        - 语言精练，韵律和谐
        - 表达深刻的思想感情
        - 结构完整，层次分明
        """
        
        return self._generate_text(prompt, "诗歌创作")
    
    def create_script(self, 
                     theme: str, 
                     type: str = "短剧",
                     characters: int = 3) -> Dict:
        """创作剧本"""
        
        prompt = f"""
        请创作一个{type}剧本，主题是：{theme}
        
        要求：
        - 主要角色数量：{characters}人
        - 包含完整的对话和舞台指示
        - 情节紧凑，冲突明确
        - 人物性格鲜明，对话生动
        - 结构清晰：开场-发展-高潮-结局
        """
        
        return self._generate_text(prompt, "剧本创作")
    
    def create_article(self, 
                      topic: str, 
                      type: str = "议论文",
                      target_audience: str = "一般读者") -> Dict:
        """创作文章"""
        
        prompt = f"""
        请写一篇关于"{topic}"的{type}
        
        要求：
        - 目标读者：{target_audience}
        - 观点明确，论证充分
        - 结构清晰，逻辑严密
        - 语言准确，表达流畅
        - 内容有深度，有见解
        """
        
        return self._generate_text(prompt, "文章写作")
    
    def create_story(self, 
                    setting: str, 
                    protagonist: str,
                    conflict: str) -> Dict:
        """创作故事"""
        
        prompt = f"""
        请创作一个故事：
        
        背景设定：{setting}
        主人公：{protagonist}
        主要冲突：{conflict}
        
        要求：
        - 情节引人入胜
        - 人物形象立体
        - 对话自然生动
        - 描写细腻生动
        - 结局出人意料但合理
        """
        
        return self._generate_text(prompt, "故事创作")
    
    def improve_text(self, 
                    original_text: str, 
                    improvement_type: str = "语言优化") -> Dict:
        """文本改进"""
        
        improvement_prompts = {
            "语言优化": "请优化以下文本的语言表达，使其更加流畅、生动、准确",
            "结构调整": "请调整以下文本的结构，使其更加清晰、有逻辑",
            "内容扩展": "请扩展以下文本的内容，增加更多细节和深度",
            "风格转换": "请转换以下文本的写作风格，使其更加适合目标读者",
            "错误修正": "请修正以下文本中的语法、用词、逻辑等错误"
        }
        
        prompt = f"""
        {improvement_prompts.get(improvement_type, improvement_prompts['语言优化'])}：
        
        原文：
        {original_text}
        
        请提供改进后的版本，并简要说明改进的地方。
        """
        
        return self._generate_text(prompt, f"文本{improvement_type}")
    
    def _generate_text(self, prompt: str, task_type: str) -> Dict:
        """调用AI生成文本"""
        try:
            response = self.session.post(
                f"{self.api_base}/api/v1/text/generate",
                json={
                    "prompt": prompt,
                    "max_tokens": 2000,
                    "temperature": 0.8,
                    "task_type": task_type
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    return {
                        "success": True,
                        "content": result["data"]["text"],
                        "task_type": task_type,
                        "word_count": len(result["data"]["text"]),
                        "metadata": result["data"].get("metadata", {})
                    }
                else:
                    return {
                        "success": False,
                        "error": result.get("error", "生成失败")
                    }
            else:
                return {
                    "success": False,
                    "error": f"API请求失败: {response.status_code}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"请求异常: {str(e)}"
            }
    
    def save_text(self, content: str, filename: str, task_type: str = ""):
        """保存文本到文件"""
        try:
            # 创建输出目录
            output_dir = "text_creations"
            os.makedirs(output_dir, exist_ok=True)
            
            # 生成完整文件路径
            filepath = os.path.join(output_dir, filename)
            
            # 添加文件头信息
            header = f"""# {task_type}
# 创作时间: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
# 生成工具: YouCreator.AI 文字创作器

"""
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(header + content)
            
            print(f"✅ 文本已保存到: {filepath}")
            return filepath
            
        except Exception as e:
            print(f"❌ 保存失败: {e}")
            return None

def interactive_mode():
    """交互式创作模式"""
    creator = TextCreator()
    
    print("🖋️  YouCreator.AI 文字创作工具")
    print("=" * 50)
    
    while True:
        print("\n📝 请选择创作类型:")
        print("1. 小说创作")
        print("2. 诗歌创作") 
        print("3. 剧本创作")
        print("4. 文章写作")
        print("5. 故事创作")
        print("6. 文本改进")
        print("0. 退出")
        
        choice = input("\n请输入选择 (0-6): ").strip()
        
        if choice == "0":
            print("👋 感谢使用YouCreator.AI!")
            break
        elif choice == "1":
            create_novel_interactive(creator)
        elif choice == "2":
            create_poem_interactive(creator)
        elif choice == "3":
            create_script_interactive(creator)
        elif choice == "4":
            create_article_interactive(creator)
        elif choice == "5":
            create_story_interactive(creator)
        elif choice == "6":
            improve_text_interactive(creator)
        else:
            print("❌ 无效选择，请重新输入")

def create_novel_interactive(creator):
    """交互式小说创作"""
    print("\n📚 小说创作")
    print("-" * 30)
    
    theme = input("请输入小说主题: ").strip()
    if not theme:
        print("❌ 主题不能为空")
        return
    
    print("\n请选择小说类型:")
    genres = ["现代都市", "古代言情", "科幻未来", "奇幻冒险", "悬疑推理", "历史传奇"]
    for i, genre in enumerate(genres, 1):
        print(f"{i}. {genre}")
    
    genre_choice = input("请选择 (1-6): ").strip()
    genre = genres[int(genre_choice)-1] if genre_choice.isdigit() and 1 <= int(genre_choice) <= 6 else "现代都市"
    
    length = input("请选择长度 (短篇/中篇/长篇) [短篇]: ").strip() or "短篇"
    style = input("请选择叙述方式 (第一人称/第三人称) [第三人称]: ").strip() or "第三人称"
    
    print(f"\n🎯 开始创作{genre}小说《{theme}》...")
    
    result = creator.create_novel(theme, genre, length, style)
    
    if result["success"]:
        print("\n✅ 小说创作完成!")
        print(f"📊 字数: {result['word_count']}")
        print("\n" + "="*50)
        print(result["content"])
        print("="*50)
        
        save = input("\n💾 是否保存到文件? (y/n): ").strip().lower()
        if save == 'y':
            filename = f"小说_{theme}_{__import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
            creator.save_text(result["content"], filename, "小说创作")
    else:
        print(f"❌ 创作失败: {result['error']}")

def create_poem_interactive(creator):
    """交互式诗歌创作"""
    print("\n🌸 诗歌创作")
    print("-" * 30)
    
    theme = input("请输入诗歌主题: ").strip()
    if not theme:
        print("❌ 主题不能为空")
        return
    
    styles = ["现代诗", "古体诗", "自由诗", "散文诗", "儿童诗"]
    print("\n请选择诗歌风格:")
    for i, style in enumerate(styles, 1):
        print(f"{i}. {style}")
    
    style_choice = input("请选择 (1-5): ").strip()
    style = styles[int(style_choice)-1] if style_choice.isdigit() and 1 <= int(style_choice) <= 5 else "现代诗"
    
    mood = input("请输入情感基调 (抒情/叙事/哲理/讽刺) [抒情]: ").strip() or "抒情"
    
    print(f"\n🎯 开始创作{style}《{theme}》...")
    
    result = creator.create_poem(theme, style, mood)
    
    if result["success"]:
        print("\n✅ 诗歌创作完成!")
        print("\n" + "="*50)
        print(result["content"])
        print("="*50)
        
        save = input("\n💾 是否保存到文件? (y/n): ").strip().lower()
        if save == 'y':
            filename = f"诗歌_{theme}_{__import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
            creator.save_text(result["content"], filename, "诗歌创作")
    else:
        print(f"❌ 创作失败: {result['error']}")

def create_script_interactive(creator):
    """交互式剧本创作"""
    print("\n🎭 剧本创作")
    print("-" * 30)
    
    theme = input("请输入剧本主题: ").strip()
    if not theme:
        print("❌ 主题不能为空")
        return
    
    types = ["短剧", "话剧", "小品", "独角戏", "音乐剧"]
    print("\n请选择剧本类型:")
    for i, t in enumerate(types, 1):
        print(f"{i}. {t}")
    
    type_choice = input("请选择 (1-5): ").strip()
    script_type = types[int(type_choice)-1] if type_choice.isdigit() and 1 <= int(type_choice) <= 5 else "短剧"
    
    characters = input("请输入主要角色数量 (2-5) [3]: ").strip()
    characters = int(characters) if characters.isdigit() and 2 <= int(characters) <= 5 else 3
    
    print(f"\n🎯 开始创作{script_type}《{theme}》...")
    
    result = creator.create_script(theme, script_type, characters)
    
    if result["success"]:
        print("\n✅ 剧本创作完成!")
        print(f"📊 字数: {result['word_count']}")
        print("\n" + "="*50)
        print(result["content"])
        print("="*50)
        
        save = input("\n💾 是否保存到文件? (y/n): ").strip().lower()
        if save == 'y':
            filename = f"剧本_{theme}_{__import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
            creator.save_text(result["content"], filename, "剧本创作")
    else:
        print(f"❌ 创作失败: {result['error']}")

def create_article_interactive(creator):
    """交互式文章写作"""
    print("\n📄 文章写作")
    print("-" * 30)
    
    topic = input("请输入文章主题: ").strip()
    if not topic:
        print("❌ 主题不能为空")
        return
    
    types = ["议论文", "说明文", "记叙文", "散文", "评论文", "科普文"]
    print("\n请选择文章类型:")
    for i, t in enumerate(types, 1):
        print(f"{i}. {t}")
    
    type_choice = input("请选择 (1-6): ").strip()
    article_type = types[int(type_choice)-1] if type_choice.isdigit() and 1 <= int(type_choice) <= 6 else "议论文"
    
    audience = input("请输入目标读者 (学生/专业人士/一般读者) [一般读者]: ").strip() or "一般读者"
    
    print(f"\n🎯 开始写作{article_type}《{topic}》...")
    
    result = creator.create_article(topic, article_type, audience)
    
    if result["success"]:
        print("\n✅ 文章写作完成!")
        print(f"📊 字数: {result['word_count']}")
        print("\n" + "="*50)
        print(result["content"])
        print("="*50)
        
        save = input("\n💾 是否保存到文件? (y/n): ").strip().lower()
        if save == 'y':
            filename = f"文章_{topic}_{__import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
            creator.save_text(result["content"], filename, "文章写作")
    else:
        print(f"❌ 写作失败: {result['error']}")

def create_story_interactive(creator):
    """交互式故事创作"""
    print("\n📖 故事创作")
    print("-" * 30)
    
    setting = input("请输入故事背景设定: ").strip()
    if not setting:
        print("❌ 背景设定不能为空")
        return
    
    protagonist = input("请输入主人公设定: ").strip()
    if not protagonist:
        print("❌ 主人公设定不能为空")
        return
    
    conflict = input("请输入主要冲突: ").strip()
    if not conflict:
        print("❌ 主要冲突不能为空")
        return
    
    print(f"\n🎯 开始创作故事...")
    
    result = creator.create_story(setting, protagonist, conflict)
    
    if result["success"]:
        print("\n✅ 故事创作完成!")
        print(f"📊 字数: {result['word_count']}")
        print("\n" + "="*50)
        print(result["content"])
        print("="*50)
        
        save = input("\n💾 是否保存到文件? (y/n): ").strip().lower()
        if save == 'y':
            filename = f"故事_{setting[:10]}_{__import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
            creator.save_text(result["content"], filename, "故事创作")
    else:
        print(f"❌ 创作失败: {result['error']}")

def improve_text_interactive(creator):
    """交互式文本改进"""
    print("\n✨ 文本改进")
    print("-" * 30)
    
    print("请输入要改进的文本 (输入完成后按两次回车):")
    lines = []
    empty_count = 0
    
    while empty_count < 2:
        line = input()
        if line.strip() == "":
            empty_count += 1
        else:
            empty_count = 0
        lines.append(line)
    
    original_text = "\n".join(lines[:-2]).strip()
    
    if not original_text:
        print("❌ 文本不能为空")
        return
    
    improvements = ["语言优化", "结构调整", "内容扩展", "风格转换", "错误修正"]
    print("\n请选择改进类型:")
    for i, imp in enumerate(improvements, 1):
        print(f"{i}. {imp}")
    
    imp_choice = input("请选择 (1-5): ").strip()
    improvement_type = improvements[int(imp_choice)-1] if imp_choice.isdigit() and 1 <= int(imp_choice) <= 5 else "语言优化"
    
    print(f"\n🎯 开始进行{improvement_type}...")
    
    result = creator.improve_text(original_text, improvement_type)
    
    if result["success"]:
        print("\n✅ 文本改进完成!")
        print("\n" + "="*50)
        print(result["content"])
        print("="*50)
        
        save = input("\n💾 是否保存到文件? (y/n): ").strip().lower()
        if save == 'y':
            filename = f"改进文本_{improvement_type}_{__import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
            creator.save_text(result["content"], filename, f"文本{improvement_type}")
    else:
        print(f"❌ 改进失败: {result['error']}")

def main():
    """主函数"""
    if len(sys.argv) > 1:
        # 命令行模式
        command = sys.argv[1]
        creator = TextCreator()
        
        if command == "novel" and len(sys.argv) >= 3:
            theme = sys.argv[2]
            genre = sys.argv[3] if len(sys.argv) > 3 else "现代都市"
            result = creator.create_novel(theme, genre)
            
            if result["success"]:
                print(result["content"])
                creator.save_text(result["content"], f"novel_{theme}.md", "小说创作")
            else:
                print(f"Error: {result['error']}")
        
        elif command == "poem" and len(sys.argv) >= 3:
            theme = sys.argv[2]
            style = sys.argv[3] if len(sys.argv) > 3 else "现代诗"
            result = creator.create_poem(theme, style)
            
            if result["success"]:
                print(result["content"])
                creator.save_text(result["content"], f"poem_{theme}.md", "诗歌创作")
            else:
                print(f"Error: {result['error']}")
        
        else:
            print("Usage:")
            print("  python text_creator.py novel <theme> [genre]")
            print("  python text_creator.py poem <theme> [style]")
            print("  python text_creator.py  # 交互模式")
    
    else:
        # 交互模式
        interactive_mode()

if __name__ == "__main__":
    main()
