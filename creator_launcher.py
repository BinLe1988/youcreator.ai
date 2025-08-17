#!/usr/bin/env python3
"""
YouCreator.AI - 创作工具启动器
统一入口，支持文字、绘画、音乐、编程四大创作模块
"""
import sys
import os

def show_main_menu():
    """显示主菜单"""
    print("🎨 YouCreator.AI 创作工具集")
    print("=" * 50)
    print("欢迎使用AI驱动的多模态创作平台!")
    print()
    print("📝 1. 文字创作 - 小说、诗歌、剧本、文章")
    print("🎨 2. 绘画创作 - 多风格AI绘画生成")
    print("🎵 3. 音乐创作 - 文字配乐、图片配乐")
    print("💻 4. 编程创作 - 代码生成、优化、调试")
    print("🚀 5. 启动AI服务")
    print("📊 6. 服务状态检查")
    print("❓ 7. 帮助信息")
    print("🚪 0. 退出")
    print("=" * 50)

def launch_text_creator():
    """启动文字创作工具"""
    print("\n🚀 启动文字创作工具...")
    try:
        import text_creator
        text_creator.main()
    except ImportError:
        print("❌ 文字创作模块未找到")
    except Exception as e:
        print(f"❌ 启动失败: {e}")

def launch_art_creator():
    """启动绘画创作工具"""
    print("\n🚀 启动绘画创作工具...")
    try:
        import art_creator
        art_creator.main()
    except ImportError:
        print("❌ 绘画创作模块未找到")
    except Exception as e:
        print(f"❌ 启动失败: {e}")

def launch_music_creator():
    """启动音乐创作工具"""
    print("\n🚀 启动音乐创作工具...")
    try:
        import music_creator
        music_creator.main()
    except ImportError:
        print("❌ 音乐创作模块未找到")
    except Exception as e:
        print(f"❌ 启动失败: {e}")

def launch_code_creator():
    """启动编程创作工具"""
    print("\n🚀 启动编程创作工具...")
    try:
        import code_creator_interactive
        code_creator_interactive.main()
    except ImportError:
        print("❌ 编程创作模块未找到")
    except Exception as e:
        print(f"❌ 启动失败: {e}")

def launch_ai_service():
    """启动AI服务"""
    print("\n🚀 启动AI服务...")
    print("正在启动Bagel AI服务，请稍候...")
    
    import subprocess
    try:
        # 检查启动脚本是否存在
        script_path = "./start_bagel_service.sh"
        if os.path.exists(script_path):
            subprocess.run([script_path], check=True)
        else:
            print("❌ 启动脚本未找到，请确保 start_bagel_service.sh 存在")
    except subprocess.CalledProcessError as e:
        print(f"❌ 服务启动失败: {e}")
    except Exception as e:
        print(f"❌ 启动异常: {e}")

def check_service_status():
    """检查服务状态"""
    print("\n📊 检查服务状态...")
    
    import requests
    
    services = [
        {"name": "AI服务", "url": "http://localhost:8000/health"},
        {"name": "后端服务", "url": "http://localhost:8080/health"},
        {"name": "Bagel服务", "url": "http://localhost:8000/api/v1/bagel/health"}
    ]
    
    for service in services:
        try:
            response = requests.get(service["url"], timeout=5)
            if response.status_code == 200:
                print(f"✅ {service['name']}: 运行正常")
            else:
                print(f"⚠️  {service['name']}: 状态异常 ({response.status_code})")
        except requests.exceptions.ConnectionError:
            print(f"❌ {service['name']}: 连接失败")
        except requests.exceptions.Timeout:
            print(f"⏰ {service['name']}: 连接超时")
        except Exception as e:
            print(f"❓ {service['name']}: 检查异常 ({e})")

def show_help():
    """显示帮助信息"""
    print("\n❓ YouCreator.AI 帮助信息")
    print("=" * 50)
    
    print("\n📝 文字创作功能:")
    print("  • 小说创作 - 支持多种题材和风格")
    print("  • 诗歌创作 - 现代诗、古体诗等")
    print("  • 剧本创作 - 话剧、短剧、小品")
    print("  • 文章写作 - 议论文、说明文等")
    print("  • 文本改进 - 语言优化、结构调整")
    
    print("\n🎨 绘画创作功能:")
    print("  • 多种风格 - 写实、动漫、科幻、奇幻等")
    print("  • 人物肖像 - 专业肖像生成")
    print("  • 风景画作 - 自然风光创作")
    print("  • 角色设计 - 游戏、动漫角色")
    print("  • 场景插画 - 概念艺术创作")
    
    print("\n🎵 音乐创作功能:")
    print("  • 文字配乐 - 根据描述生成音乐")
    print("  • 图片配乐 - 为图片创作背景音乐")
    print("  • 主题音乐 - 冒险、浪漫、神秘等主题")
    print("  • 环境音景 - 森林、海洋、雨天等")
    
    print("\n💻 编程创作功能:")
    print("  • 代码生成 - 支持15+编程语言")
    print("  • 代码优化 - 性能、可读性优化")
    print("  • 代码调试 - 错误修复和改进")
    print("  • 代码转换 - 语言间转换")
    print("  • 测试生成 - 自动生成单元测试")
    
    print("\n🚀 使用步骤:")
    print("  1. 首先启动AI服务 (选项5)")
    print("  2. 等待服务启动完成")
    print("  3. 选择对应的创作工具")
    print("  4. 按照提示进行创作")
    
    print("\n📁 输出文件:")
    print("  • 文字作品: text_creations/")
    print("  • 绘画作品: art_creations/")
    print("  • 音乐作品: music_creations/")
    print("  • 代码作品: code_creations/")
    
    print("\n🔧 技术支持:")
    print("  • 项目地址: https://github.com/your-org/youcreator.ai")
    print("  • 问题反馈: 通过GitHub Issues")
    print("  • 文档地址: docs/")
    
    input("\n按回车键返回主菜单...")

def main():
    """主函数"""
    while True:
        try:
            show_main_menu()
            choice = input("\n请选择功能 (0-7): ").strip()
            
            if choice == "0":
                print("\n👋 感谢使用YouCreator.AI!")
                print("期待您的下次使用!")
                break
            elif choice == "1":
                launch_text_creator()
            elif choice == "2":
                launch_art_creator()
            elif choice == "3":
                launch_music_creator()
            elif choice == "4":
                launch_code_creator()
            elif choice == "5":
                launch_ai_service()
            elif choice == "6":
                check_service_status()
            elif choice == "7":
                show_help()
            else:
                print("❌ 无效选择，请输入0-7之间的数字")
                input("按回车键继续...")
                
        except KeyboardInterrupt:
            print("\n\n👋 用户中断，退出程序")
            break
        except Exception as e:
            print(f"\n❌ 程序异常: {e}")
            input("按回车键继续...")

if __name__ == "__main__":
    main()
