#!/usr/bin/env python3
"""
YouCreator.AI - 编程创作工具交互式界面
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from code_creator import CodeCreator

def interactive_mode():
    """交互式编程创作模式"""
    creator = CodeCreator()
    
    print("💻 YouCreator.AI 编程创作工具")
    print("=" * 50)
    
    while True:
        print("\n🔧 请选择功能:")
        print("1. 生成代码")
        print("2. 优化代码")
        print("3. 调试代码")
        print("4. 解释代码")
        print("5. 转换代码")
        print("6. 生成测试")
        print("7. 查看支持语言")
        print("0. 退出")
        
        choice = input("\n请输入选择 (0-7): ").strip()
        
        if choice == "0":
            print("👋 感谢使用YouCreator.AI!")
            break
        elif choice == "1":
            generate_code_interactive(creator)
        elif choice == "2":
            optimize_code_interactive(creator)
        elif choice == "3":
            debug_code_interactive(creator)
        elif choice == "4":
            explain_code_interactive(creator)
        elif choice == "5":
            convert_code_interactive(creator)
        elif choice == "6":
            generate_tests_interactive(creator)
        elif choice == "7":
            show_languages(creator)
        else:
            print("❌ 无效选择，请重新输入")

def generate_code_interactive(creator):
    """交互式代码生成"""
    print("\n⚡ 代码生成")
    print("-" * 30)
    
    description = input("请描述您要实现的功能: ").strip()
    if not description:
        print("❌ 功能描述不能为空")
        return
    
    # 选择编程语言
    languages = list(creator.languages.items())
    print("\n请选择编程语言:")
    for i, (key, info) in enumerate(languages[:8], 1):
        print(f"{i}. {info['name']}")
    print("9. 更多语言...")
    
    lang_choice = input("请选择 (1-9): ").strip()
    
    if lang_choice == "9":
        for i, (key, info) in enumerate(languages[8:], 10):
            print(f"{i}. {info['name']}")
        lang_choice = input("请选择 (10-15): ").strip()
    
    lang_idx = int(lang_choice) - 1 if lang_choice.isdigit() else 0
    language = languages[lang_idx][0] if 0 <= lang_idx < len(languages) else "python"
    
    # 选择代码风格
    styles = ["clean", "professional", "efficient", "beginner", "advanced"]
    print("\n请选择代码风格:")
    for i, style in enumerate(styles, 1):
        print(f"{i}. {style}")
    
    style_choice = input("请选择 (1-5): ").strip()
    style = styles[int(style_choice)-1] if style_choice.isdigit() and 1 <= int(style_choice) <= 5 else "clean"
    
    # 其他选项
    include_comments = input("是否包含注释? (y/n) [y]: ").strip().lower() != 'n'
    include_tests = input("是否包含测试? (y/n) [n]: ").strip().lower() == 'y'
    
    print(f"\n🎯 开始生成{creator.languages[language]['name']}代码...")
    print(f"   功能: {description}")
    print(f"   风格: {style}")
    print(f"   注释: {'是' if include_comments else '否'}")
    print(f"   测试: {'是' if include_tests else '否'}")
    
    result = creator.generate_code(description, language, style, include_comments, include_tests)
    
    if result["success"]:
        print("\n✅ 代码生成完成!")
        print("\n" + "="*60)
        print(result["code"])
        print("="*60)
        
        if result.get("explanation"):
            print(f"\n📝 说明: {result['explanation']}")
        
        save = input("\n💾 是否保存到文件? (y/n): ").strip().lower()
        if save == 'y':
            filename = input("请输入文件名 (不含扩展名): ").strip()
            if not filename:
                filename = f"generated_code_{__import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            metadata = {
                "description": description,
                "language": creator.languages[language]["name"],
                "style": style,
                "has_comments": include_comments,
                "has_tests": include_tests,
                "created_at": __import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            creator.save_code(result["code"], filename, language, metadata)
    else:
        print(f"❌ 生成失败: {result['error']}")

def optimize_code_interactive(creator):
    """交互式代码优化"""
    print("\n🚀 代码优化")
    print("-" * 30)
    
    print("请输入要优化的代码 (输入完成后按两次回车):")
    lines = []
    empty_count = 0
    
    while empty_count < 2:
        line = input()
        if line.strip() == "":
            empty_count += 1
        else:
            empty_count = 0
        lines.append(line)
    
    code = "\n".join(lines[:-2]).strip()
    
    if not code:
        print("❌ 代码不能为空")
        return
    
    # 选择语言
    languages = list(creator.languages.items())
    print("\n请选择代码语言:")
    for i, (key, info) in enumerate(languages[:8], 1):
        print(f"{i}. {info['name']}")
    
    lang_choice = input("请选择 (1-8): ").strip()
    lang_idx = int(lang_choice) - 1 if lang_choice.isdigit() else 0
    language = languages[lang_idx][0] if 0 <= lang_idx < len(languages) else "python"
    
    # 选择优化类型
    optimizations = ["performance", "readability", "memory", "security", "style"]
    print("\n请选择优化类型:")
    for i, opt in enumerate(optimizations, 1):
        print(f"{i}. {opt}")
    
    opt_choice = input("请选择 (1-5): ").strip()
    optimization_type = optimizations[int(opt_choice)-1] if opt_choice.isdigit() and 1 <= int(opt_choice) <= 5 else "performance"
    
    print(f"\n🎯 开始优化代码...")
    
    result = creator.optimize_code(code, language, optimization_type)
    
    if result["success"]:
        print("\n✅ 代码优化完成!")
        print("\n" + "="*60)
        print(result["content"])
        print("="*60)
        
        save = input("\n💾 是否保存优化后的代码? (y/n): ").strip().lower()
        if save == 'y':
            filename = f"optimized_{optimization_type}_{__import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            metadata = {
                "type": "optimized_code",
                "optimization_type": optimization_type,
                "language": creator.languages[language]["name"],
                "created_at": __import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            # 提取优化后的代码（去除解释文字）
            optimized_code = extract_code_from_response(result["content"], language)
            creator.save_code(optimized_code, filename, language, metadata)
    else:
        print(f"❌ 优化失败: {result['error']}")

def debug_code_interactive(creator):
    """交互式代码调试"""
    print("\n🐛 代码调试")
    print("-" * 30)
    
    print("请输入要调试的代码 (输入完成后按两次回车):")
    lines = []
    empty_count = 0
    
    while empty_count < 2:
        line = input()
        if line.strip() == "":
            empty_count += 1
        else:
            empty_count = 0
        lines.append(line)
    
    code = "\n".join(lines[:-2]).strip()
    
    if not code:
        print("❌ 代码不能为空")
        return
    
    # 选择语言
    languages = list(creator.languages.items())
    print("\n请选择代码语言:")
    for i, (key, info) in enumerate(languages[:8], 1):
        print(f"{i}. {info['name']}")
    
    lang_choice = input("请选择 (1-8): ").strip()
    lang_idx = int(lang_choice) - 1 if lang_choice.isdigit() else 0
    language = languages[lang_idx][0] if 0 <= lang_idx < len(languages) else "python"
    
    # 错误信息（可选）
    error_message = input("请输入错误信息 (可选): ").strip()
    
    print(f"\n🎯 开始调试代码...")
    
    result = creator.debug_code(code, language, error_message)
    
    if result["success"]:
        print("\n✅ 代码调试完成!")
        print("\n" + "="*60)
        print(result["content"])
        print("="*60)
        
        save = input("\n💾 是否保存修复后的代码? (y/n): ").strip().lower()
        if save == 'y':
            filename = f"debugged_{__import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            metadata = {
                "type": "debugged_code",
                "language": creator.languages[language]["name"],
                "error_message": error_message,
                "created_at": __import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            # 提取修复后的代码
            fixed_code = extract_code_from_response(result["content"], language)
            creator.save_code(fixed_code, filename, language, metadata)
    else:
        print(f"❌ 调试失败: {result['error']}")

def explain_code_interactive(creator):
    """交互式代码解释"""
    print("\n📖 代码解释")
    print("-" * 30)
    
    print("请输入要解释的代码 (输入完成后按两次回车):")
    lines = []
    empty_count = 0
    
    while empty_count < 2:
        line = input()
        if line.strip() == "":
            empty_count += 1
        else:
            empty_count = 0
        lines.append(line)
    
    code = "\n".join(lines[:-2]).strip()
    
    if not code:
        print("❌ 代码不能为空")
        return
    
    # 选择语言
    languages = list(creator.languages.items())
    print("\n请选择代码语言:")
    for i, (key, info) in enumerate(languages[:8], 1):
        print(f"{i}. {info['name']}")
    
    lang_choice = input("请选择 (1-8): ").strip()
    lang_idx = int(lang_choice) - 1 if lang_choice.isdigit() else 0
    language = languages[lang_idx][0] if 0 <= lang_idx < len(languages) else "python"
    
    print(f"\n🎯 开始解释代码...")
    
    result = creator.explain_code(code, language)
    
    if result["success"]:
        print("\n✅ 代码解释完成!")
        print("\n" + "="*60)
        print(result["content"])
        print("="*60)
        
        save = input("\n💾 是否保存解释到文件? (y/n): ").strip().lower()
        if save == 'y':
            filename = f"explanation_{__import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
            
            explanation_content = f"""# 代码解释

## 原代码
```{language}
{code}
```

## 详细解释
{result["content"]}

---
生成时间: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
生成工具: YouCreator.AI 编程创作工具
"""
            
            output_dir = "code_creations"
            os.makedirs(output_dir, exist_ok=True)
            filepath = os.path.join(output_dir, filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(explanation_content)
            
            print(f"✅ 解释已保存到: {filepath}")
    else:
        print(f"❌ 解释失败: {result['error']}")

def convert_code_interactive(creator):
    """交互式代码转换"""
    print("\n🔄 代码转换")
    print("-" * 30)
    
    print("请输入要转换的代码 (输入完成后按两次回车):")
    lines = []
    empty_count = 0
    
    while empty_count < 2:
        line = input()
        if line.strip() == "":
            empty_count += 1
        else:
            empty_count = 0
        lines.append(line)
    
    code = "\n".join(lines[:-2]).strip()
    
    if not code:
        print("❌ 代码不能为空")
        return
    
    languages = list(creator.languages.items())
    
    # 选择源语言
    print("\n请选择源语言:")
    for i, (key, info) in enumerate(languages[:8], 1):
        print(f"{i}. {info['name']}")
    
    from_choice = input("请选择 (1-8): ").strip()
    from_idx = int(from_choice) - 1 if from_choice.isdigit() else 0
    from_language = languages[from_idx][0] if 0 <= from_idx < len(languages) else "python"
    
    # 选择目标语言
    print("\n请选择目标语言:")
    for i, (key, info) in enumerate(languages[:8], 1):
        print(f"{i}. {info['name']}")
    
    to_choice = input("请选择 (1-8): ").strip()
    to_idx = int(to_choice) - 1 if to_choice.isdigit() else 0
    to_language = languages[to_idx][0] if 0 <= to_idx < len(languages) else "javascript"
    
    if from_language == to_language:
        print("❌ 源语言和目标语言不能相同")
        return
    
    print(f"\n🎯 开始转换代码 ({creator.languages[from_language]['name']} → {creator.languages[to_language]['name']})...")
    
    result = creator.convert_code(code, from_language, to_language)
    
    if result["success"]:
        print("\n✅ 代码转换完成!")
        print("\n" + "="*60)
        print(result["content"])
        print("="*60)
        
        save = input("\n💾 是否保存转换后的代码? (y/n): ").strip().lower()
        if save == 'y':
            filename = f"converted_{from_language}_to_{to_language}_{__import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            metadata = {
                "type": "converted_code",
                "from_language": creator.languages[from_language]["name"],
                "to_language": creator.languages[to_language]["name"],
                "created_at": __import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            # 提取转换后的代码
            converted_code = extract_code_from_response(result["content"], to_language)
            creator.save_code(converted_code, filename, to_language, metadata)
    else:
        print(f"❌ 转换失败: {result['error']}")

def generate_tests_interactive(creator):
    """交互式测试生成"""
    print("\n🧪 生成测试")
    print("-" * 30)
    
    print("请输入要生成测试的代码 (输入完成后按两次回车):")
    lines = []
    empty_count = 0
    
    while empty_count < 2:
        line = input()
        if line.strip() == "":
            empty_count += 1
        else:
            empty_count = 0
        lines.append(line)
    
    code = "\n".join(lines[:-2]).strip()
    
    if not code:
        print("❌ 代码不能为空")
        return
    
    # 选择语言
    languages = list(creator.languages.items())
    print("\n请选择代码语言:")
    for i, (key, info) in enumerate(languages[:8], 1):
        print(f"{i}. {info['name']}")
    
    lang_choice = input("请选择 (1-8): ").strip()
    lang_idx = int(lang_choice) - 1 if lang_choice.isdigit() else 0
    language = languages[lang_idx][0] if 0 <= lang_idx < len(languages) else "python"
    
    # 测试框架
    test_framework = input("请输入测试框架 (留空自动选择): ").strip() or "auto"
    
    print(f"\n🎯 开始生成测试代码...")
    
    result = creator.generate_tests(code, language, test_framework)
    
    if result["success"]:
        print("\n✅ 测试代码生成完成!")
        print("\n" + "="*60)
        print(result["content"])
        print("="*60)
        
        save = input("\n💾 是否保存测试代码? (y/n): ").strip().lower()
        if save == 'y':
            filename = f"test_{__import__('datetime').datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            metadata = {
                "type": "test_code",
                "language": creator.languages[language]["name"],
                "test_framework": test_framework,
                "created_at": __import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            # 提取测试代码
            test_code = extract_code_from_response(result["content"], language)
            creator.save_code(test_code, filename, language, metadata)
    else:
        print(f"❌ 生成失败: {result['error']}")

def show_languages(creator):
    """显示支持的编程语言"""
    print("\n💻 支持的编程语言")
    print("-" * 30)
    
    for key, info in creator.languages.items():
        print(f"• {info['name']} ({key})")
    
    input("\n按回车键继续...")

def extract_code_from_response(response: str, language: str) -> str:
    """从响应中提取代码"""
    lines = response.split('\n')
    code_lines = []
    in_code_block = False
    
    for line in lines:
        if line.strip().startswith(f'```{language}') or line.strip().startswith('```'):
            in_code_block = True
            continue
        elif line.strip() == '```' and in_code_block:
            in_code_block = False
            continue
        elif in_code_block:
            code_lines.append(line)
    
    # 如果没有找到代码块，返回原始响应
    if not code_lines:
        return response
    
    return '\n'.join(code_lines)

def main():
    """主函数"""
    interactive_mode()

if __name__ == "__main__":
    main()
