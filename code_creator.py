#!/usr/bin/env python3
"""
YouCreator.AI - 编程创作工具
支持多种编程语言的代码生成、优化、调试等功能
"""
import requests
import json
import os
import subprocess
from typing import Dict, List, Optional

class CodeCreator:
    """编程创作器"""
    
    def __init__(self, api_base="http://localhost:8080"):
        self.api_base = api_base
        self.session = requests.Session()
        self.languages = {
            "python": {"ext": ".py", "name": "Python"},
            "javascript": {"ext": ".js", "name": "JavaScript"},
            "typescript": {"ext": ".ts", "name": "TypeScript"},
            "java": {"ext": ".java", "name": "Java"},
            "cpp": {"ext": ".cpp", "name": "C++"},
            "c": {"ext": ".c", "name": "C"},
            "go": {"ext": ".go", "name": "Go"},
            "rust": {"ext": ".rs", "name": "Rust"},
            "php": {"ext": ".php", "name": "PHP"},
            "ruby": {"ext": ".rb", "name": "Ruby"},
            "swift": {"ext": ".swift", "name": "Swift"},
            "kotlin": {"ext": ".kt", "name": "Kotlin"},
            "html": {"ext": ".html", "name": "HTML"},
            "css": {"ext": ".css", "name": "CSS"},
            "sql": {"ext": ".sql", "name": "SQL"}
        }
    
    def generate_code(self, 
                     description: str,
                     language: str = "python",
                     style: str = "clean",
                     include_comments: bool = True,
                     include_tests: bool = False) -> Dict:
        """生成代码"""
        
        prompt = self._build_code_prompt(description, language, style, include_comments, include_tests)
        
        try:
            response = self.session.post(
                f"{self.api_base}/api/v1/code/generate",
                json={
                    "prompt": prompt,
                    "language": language,
                    "max_tokens": 2000,
                    "temperature": 0.3,
                    "include_comments": include_comments,
                    "include_tests": include_tests
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    return {
                        "success": True,
                        "code": result["data"]["code"],
                        "language": language,
                        "description": description,
                        "style": style,
                        "has_comments": include_comments,
                        "has_tests": include_tests,
                        "explanation": result["data"].get("explanation", "")
                    }
                else:
                    return {"success": False, "error": result.get("error", "代码生成失败")}
            else:
                return {"success": False, "error": f"API请求失败: {response.status_code}"}
                
        except Exception as e:
            return {"success": False, "error": f"请求异常: {str(e)}"}
    
    def optimize_code(self, code: str, language: str, optimization_type: str = "performance") -> Dict:
        """优化代码"""
        
        optimization_prompts = {
            "performance": "优化代码性能，提高执行效率",
            "readability": "优化代码可读性，改善代码结构",
            "memory": "优化内存使用，减少内存占用",
            "security": "优化代码安全性，修复安全漏洞",
            "style": "优化代码风格，符合最佳实践"
        }
        
        prompt = f"""
        请{optimization_prompts.get(optimization_type, optimization_prompts['performance'])}：
        
        语言：{language}
        
        原代码：
        ```{language}
        {code}
        ```
        
        请提供优化后的代码，并说明优化的地方。
        """
        
        return self._generate_code_response(prompt, f"代码{optimization_type}优化")
    
    def debug_code(self, code: str, language: str, error_message: str = "") -> Dict:
        """调试代码"""
        
        prompt = f"""
        请帮助调试以下{language}代码：
        
        代码：
        ```{language}
        {code}
        ```
        
        {f"错误信息：{error_message}" if error_message else ""}
        
        请找出可能的问题并提供修复后的代码。
        """
        
        return self._generate_code_response(prompt, "代码调试")
    
    def explain_code(self, code: str, language: str) -> Dict:
        """解释代码"""
        
        prompt = f"""
        请详细解释以下{language}代码的功能和实现原理：
        
        ```{language}
        {code}
        ```
        
        请包括：
        1. 代码的主要功能
        2. 关键算法和逻辑
        3. 重要的函数和变量
        4. 可能的改进建议
        """
        
        return self._generate_code_response(prompt, "代码解释")
    
    def convert_code(self, code: str, from_language: str, to_language: str) -> Dict:
        """转换代码语言"""
        
        prompt = f"""
        请将以下{from_language}代码转换为{to_language}：
        
        原代码（{from_language}）：
        ```{from_language}
        {code}
        ```
        
        请提供等价的{to_language}代码，保持相同的功能和逻辑。
        """
        
        return self._generate_code_response(prompt, f"代码转换({from_language}到{to_language})")
    
    def generate_tests(self, code: str, language: str, test_framework: str = "auto") -> Dict:
        """生成测试代码"""
        
        frameworks = {
            "python": "pytest",
            "javascript": "jest",
            "java": "junit",
            "cpp": "gtest",
            "go": "testing"
        }
        
        framework = frameworks.get(language, "unittest") if test_framework == "auto" else test_framework
        
        prompt = f"""
        请为以下{language}代码生成单元测试：
        
        代码：
        ```{language}
        {code}
        ```
        
        测试框架：{framework}
        
        请生成全面的测试用例，包括：
        1. 正常情况测试
        2. 边界条件测试
        3. 异常情况测试
        """
        
        return self._generate_code_response(prompt, "测试代码生成")
    
    def _build_code_prompt(self, description: str, language: str, style: str, include_comments: bool, include_tests: bool) -> str:
        """构建代码生成提示词"""
        
        style_descriptions = {
            "clean": "简洁清晰，易于理解",
            "professional": "专业规范，符合企业标准",
            "efficient": "高效优化，性能优先",
            "beginner": "适合初学者，详细注释",
            "advanced": "高级特性，复杂实现"
        }
        
        prompt = f"""
        请用{language}编写代码实现以下功能：
        
        需求描述：{description}
        
        代码风格：{style_descriptions.get(style, style)}
        {"包含详细注释" if include_comments else "简洁无注释"}
        {"包含单元测试" if include_tests else ""}
        
        请确保代码：
        1. 功能完整正确
        2. 结构清晰合理
        3. 符合最佳实践
        4. 易于维护扩展
        """
        
        return prompt
    
    def _generate_code_response(self, prompt: str, task_type: str) -> Dict:
        """生成代码响应"""
        try:
            response = self.session.post(
                f"{self.api_base}/api/v1/text/generate",
                json={
                    "prompt": prompt,
                    "max_tokens": 2000,
                    "temperature": 0.3,
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
                        "task_type": task_type
                    }
                else:
                    return {"success": False, "error": result.get("error", "生成失败")}
            else:
                return {"success": False, "error": f"API请求失败: {response.status_code}"}
                
        except Exception as e:
            return {"success": False, "error": f"请求异常: {str(e)}"}
    
    def save_code(self, code: str, filename: str, language: str, metadata: Dict = None):
        """保存代码文件"""
        try:
            # 创建输出目录
            output_dir = "code_creations"
            os.makedirs(output_dir, exist_ok=True)
            
            # 确保文件扩展名正确
            if not filename.endswith(self.languages[language]["ext"]):
                filename += self.languages[language]["ext"]
            
            # 生成完整文件路径
            filepath = os.path.join(output_dir, filename)
            
            # 添加文件头注释
            header = self._generate_file_header(language, metadata)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(header + code)
            
            # 保存元数据
            if metadata:
                metadata_file = filepath.replace(self.languages[language]["ext"], "_metadata.json")
                with open(metadata_file, 'w', encoding='utf-8') as f:
                    json.dump(metadata, f, ensure_ascii=False, indent=2)
            
            print(f"✅ 代码已保存到: {filepath}")
            return filepath
            
        except Exception as e:
            print(f"❌ 保存失败: {e}")
            return None
    
    def _generate_file_header(self, language: str, metadata: Dict = None) -> str:
        """生成文件头注释"""
        
        comment_styles = {
            "python": "#",
            "javascript": "//",
            "typescript": "//", 
            "java": "//",
            "cpp": "//",
            "c": "//",
            "go": "//",
            "rust": "//",
            "php": "//",
            "ruby": "#",
            "swift": "//",
            "kotlin": "//",
            "html": "<!--",
            "css": "/*",
            "sql": "--"
        }
        
        comment_char = comment_styles.get(language, "//")
        timestamp = __import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        if language == "html":
            header = f"""<!--
YouCreator.AI 生成的代码
生成时间: {timestamp}
语言: {self.languages[language]["name"]}
-->

"""
        elif language == "css":
            header = f"""/*
YouCreator.AI 生成的代码
生成时间: {timestamp}
语言: {self.languages[language]["name"]}
*/

"""
        else:
            header = f"""{comment_char} YouCreator.AI 生成的代码
{comment_char} 生成时间: {timestamp}
{comment_char} 语言: {self.languages[language]["name"]}

"""
        
        if metadata:
            if language in ["html"]:
                header = header.replace("-->", f"""描述: {metadata.get('description', 'N/A')}
-->

""")
            elif language == "css":
                header = header.replace("*/", f"""描述: {metadata.get('description', 'N/A')}
*/

""")
            else:
                header += f"{comment_char} 描述: {metadata.get('description', 'N/A')}\n\n"
        
        return header
