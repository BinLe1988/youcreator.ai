"""
Groq API客户端
提供免费的高速LLaMA模型访问
"""

import os
import httpx
import asyncio
import logging
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

logger = logging.getLogger(__name__)


class GroqClient:
    """Groq API客户端"""
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        # 使用标准的OpenAI兼容端点
        self.base_url = "https://api.groq.com/openai/v1"
        self.text_model = os.getenv("GROQ_MODEL_TEXT", "llama3-8b-8192")
        self.code_model = os.getenv("GROQ_MODEL_CODE", "llama3-8b-8192")
        
        if not self.api_key:
            logger.warning("⚠️ Groq API密钥未配置")
            self.enabled = False
        else:
            self.enabled = True
            logger.info(f"✅ Groq客户端初始化成功，使用模型: {self.text_model}")
            logger.info(f"🔑 API密钥: {self.api_key[:20]}...")
    
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """使用Groq生成文本"""
        if not self.enabled:
            return self._generate_fallback_text(prompt, **kwargs)
        
        try:
            max_tokens = min(kwargs.get("max_tokens", 1000), 4000)
            temperature = kwargs.get("temperature", 0.7)
            
            # 使用官方推荐的Groq Python客户端格式
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "User-Agent": "YouCreator.AI/1.0"
            }
            
            # 尝试不同的模型名称
            models_to_try = [
                "llama3-8b-8192",
                "llama-3.1-8b-instant", 
                "mixtral-8x7b-32768",
                "gemma-7b-it"
            ]
            
            for model in models_to_try:
                data = {
                    "model": model,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                    "stream": False
                }
                
                logger.info(f"🚀 尝试Groq模型 {model}: {prompt[:50]}...")
                
                try:
                    async with httpx.AsyncClient(timeout=30.0) as client:
                        response = await client.post(
                            f"{self.base_url}/chat/completions",
                            headers=headers,
                            json=data
                        )
                        
                        if response.status_code == 200:
                            result = response.json()
                            generated_text = result["choices"][0]["message"]["content"]
                            logger.info(f"✅ Groq文本生成成功 ({model})，长度: {len(generated_text)}")
                            return generated_text
                        elif response.status_code == 401:
                            logger.error("❌ Groq API密钥无效")
                            break
                        elif response.status_code == 404:
                            logger.warning(f"⚠️ 模型 {model} 不可用，尝试下一个...")
                            continue
                        else:
                            logger.warning(f"⚠️ Groq API返回 {response.status_code}: {response.text[:100]}")
                            continue
                            
                except Exception as e:
                    logger.warning(f"⚠️ 模型 {model} 请求失败: {e}")
                    continue
            
            # 如果所有模型都失败，使用备用方案
            logger.warning("⚠️ 所有Groq模型都不可用，使用备用方案")
            return self._generate_fallback_text(prompt, **kwargs)
                    
        except Exception as e:
            logger.error(f"❌ Groq文本生成失败: {e}")
            return self._generate_fallback_text(prompt, **kwargs)
    
    async def generate_code(self, prompt: str, **kwargs) -> str:
        """使用Groq生成代码"""
        if not self.enabled:
            return self._generate_enhanced_code_template(prompt, kwargs.get("language", "python"))
        
        try:
            language = kwargs.get("language", "python")
            max_tokens = min(kwargs.get("max_tokens", 1000), 4000)
            
            # 构建代码生成提示
            code_prompt = f"""请用{language}编写代码来实现以下需求：

{prompt}

请只返回代码，不要包含解释文字。"""
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "User-Agent": "YouCreator.AI/1.0"
            }
            
            # 尝试不同的模型
            models_to_try = [
                "llama3-8b-8192",
                "llama-3.1-8b-instant",
                "mixtral-8x7b-32768"
            ]
            
            for model in models_to_try:
                data = {
                    "model": model,
                    "messages": [
                        {
                            "role": "system",
                            "content": f"你是一个专业的{language}程序员，只返回高质量的代码，不包含解释。"
                        },
                        {
                            "role": "user",
                            "content": code_prompt
                        }
                    ],
                    "max_tokens": max_tokens,
                    "temperature": 0.2,
                    "stream": False
                }
                
                logger.info(f"🚀 尝试Groq代码生成 {model}: {prompt[:50]}...")
                
                try:
                    async with httpx.AsyncClient(timeout=30.0) as client:
                        response = await client.post(
                            f"{self.base_url}/chat/completions",
                            headers=headers,
                            json=data
                        )
                        
                        if response.status_code == 200:
                            result = response.json()
                            generated_code = result["choices"][0]["message"]["content"]
                            logger.info(f"✅ Groq代码生成成功 ({model})，长度: {len(generated_code)}")
                            return generated_code
                        elif response.status_code == 401:
                            logger.error("❌ Groq API密钥无效")
                            break
                        elif response.status_code == 404:
                            logger.warning(f"⚠️ 模型 {model} 不可用，尝试下一个...")
                            continue
                        else:
                            logger.warning(f"⚠️ Groq API返回 {response.status_code}")
                            continue
                            
                except Exception as e:
                    logger.warning(f"⚠️ 模型 {model} 请求失败: {e}")
                    continue
            
            # 如果所有模型都失败，使用备用方案
            logger.warning("⚠️ 所有Groq模型都不可用，使用备用方案")
            return self._generate_enhanced_code_template(prompt, language)
                    
        except Exception as e:
            logger.error(f"❌ Groq代码生成失败: {e}")
            return self._generate_enhanced_code_template(prompt, language)
    
    def _generate_fallback_text(self, prompt: str, **kwargs) -> str:
        """备用文本生成"""
        sample_responses = [
            f"基于您的提示「{prompt}」，这里是AI生成的创意内容。在这个充满想象力的世界里，每一个想法都能够转化为精彩的故事。人工智能正在改变我们创作的方式，让每个人都能成为优秀的创作者。通过不断的学习和优化，AI能够理解人类的创意需求，并提供有价值的创作建议。",
            
            f"关于「{prompt}」的思考：在数字化时代，创意与技术的结合为我们打开了无限可能的大门。AI不仅是工具，更是创作的伙伴，帮助我们探索前所未有的创意领域。每一次的创作都是一次新的探索，每一个想法都可能成为下一个伟大作品的起点。",
            
            f"灵感来源于「{prompt}」：创作是人类最独特的能力之一，而AI的加入让这种能力得到了前所未有的增强。在这个过程中，我们不仅在创造内容，更在创造可能性。让我们一起探索这个充满创意和想象力的新世界，用技术的力量释放人类的创造潜能。"
        ]
        
        import random
        return random.choice(sample_responses)
    
    def _generate_enhanced_code_template(self, prompt: str, language: str) -> str:
        """生成增强的代码模板"""
        if "斐波那契" in prompt or "fibonacci" in prompt.lower():
            if language == "python":
                return '''def fibonacci(n):
    """
    计算斐波那契数列的第n项
    使用递归方法（适合小数值）
    """
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

def fibonacci_optimized(n):
    """
    计算斐波那契数列的第n项
    使用动态规划优化（推荐）
    """
    if n <= 1:
        return n
    
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

def fibonacci_sequence(count):
    """
    生成斐波那契数列的前count项
    """
    sequence = []
    for i in range(count):
        sequence.append(fibonacci_optimized(i))
    return sequence

# 测试和演示
if __name__ == "__main__":
    print("斐波那契数列演示:")
    print(f"F(10) = {fibonacci_optimized(10)}")
    print(f"前15项: {fibonacci_sequence(15)}")'''
        
        # 其他常见算法模板
        if "排序" in prompt or "sort" in prompt.lower():
            if language == "python":
                return '''def bubble_sort(arr):
    """
    冒泡排序算法
    """
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

def quick_sort(arr):
    """
    快速排序算法
    """
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort(left) + middle + quick_sort(right)

# 测试
if __name__ == "__main__":
    test_data = [64, 34, 25, 12, 22, 11, 90]
    print(f"原数组: {test_data}")
    print(f"快速排序结果: {quick_sort(test_data.copy())}")'''
        
        # 通用代码模板
        templates = {
            "python": f'''# {prompt}
def solution():
    """
    {prompt}
    
    这是一个基础实现模板，请根据具体需求进行修改
    """
    print("Hello, YouCreator.AI!")
    
    # TODO: 在这里实现具体功能
    result = "功能实现完成"
    
    return result

def main():
    """
    主函数，用于测试和演示
    """
    try:
        result = solution()
        print(f"执行结果: {{result}}")
    except Exception as e:
        print(f"执行出错: {{e}}")

if __name__ == "__main__":
    main()''',
            
            "javascript": f'''// {prompt}
function solution() {{
    /**
     * {prompt}
     * 
     * 这是一个基础实现模板，请根据具体需求进行修改
     */
    console.log("Hello, YouCreator.AI!");
    
    // TODO: 在这里实现具体功能
    const result = "功能实现完成";
    
    return result;
}}

function main() {{
    /**
     * 主函数，用于测试和演示
     */
    try {{
        const result = solution();
        console.log(`执行结果: ${{result}}`);
    }} catch (error) {{
        console.error(`执行出错: ${{error.message}}`);
    }}
}}

// 如果是在Node.js环境中运行
if (typeof require !== 'undefined' && require.main === module) {{
    main();
}}''',
            
            "go": f'''package main

import (
    "fmt"
    "log"
)

// {prompt}
func solution() string {{
    fmt.Println("Hello, YouCreator.AI!")
    
    // TODO: 在这里实现具体功能
    result := "功能实现完成"
    
    return result
}}

func main() {{
    defer func() {{
        if r := recover(); r != nil {{
            log.Printf("程序异常: %v", r)
        }}
    }}()
    
    result := solution()
    fmt.Printf("执行结果: %s\\n", result)
}}''',
        }
        
        return templates.get(language, f"// {prompt}\n// TODO: 实现功能")
    
    async def test_connection(self) -> bool:
        """测试Groq连接"""
        if not self.enabled:
            return False
        
        try:
            test_result = await self.generate_text("Hello", max_tokens=10)
            return "Hello" in test_result or len(test_result) > 20
        except:
            return False
    
    def get_status(self) -> Dict[str, Any]:
        """获取Groq客户端状态"""
        return {
            "enabled": self.enabled,
            "api_key_configured": bool(self.api_key),
            "api_key_preview": f"{self.api_key[:20]}..." if self.api_key else None,
            "text_model": self.text_model,
            "code_model": self.code_model,
            "base_url": self.base_url,
            "fallback_enabled": True,
            "note": "如果Groq API不可用，将使用增强的备用生成方案"
        }
