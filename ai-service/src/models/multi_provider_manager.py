"""
多提供商AI模型管理器
集成多个开源AI服务提供商和多模态功能
"""

import os
import asyncio
import logging
from typing import Dict, Any, Optional
from .opensource_api_clients import MultiProviderAIClient
from .groq_client import GroqClient
from .multimodal_clients import MultimodalContentMatcher

logger = logging.getLogger(__name__)


class MultiProviderModelManager:
    """多提供商AI模型管理器"""
    
    def __init__(self):
        self.multi_client = MultiProviderAIClient()
        self.groq_client = GroqClient()
        self.multimodal_matcher = MultimodalContentMatcher()
        
        self.providers = {
            "text": os.getenv("TEXT_MODEL_PROVIDER", "multi"),
            "image": os.getenv("IMAGE_MODEL_PROVIDER", "multi"),
            "music": os.getenv("MUSIC_MODEL_PROVIDER", "multi"),
            "code": os.getenv("CODE_MODEL_PROVIDER", "multi")
        }
        
        self._initialized = False
        
        logger.info(f"🔄 多提供商模型管理器初始化")
        logger.info(f"📝 文本生成: {self.providers['text']}")
        logger.info(f"🎨 图像生成: {self.providers['image']}")
        logger.info(f"🎵 音乐生成: {self.providers['music']}")
        logger.info(f"💻 代码生成: {self.providers['code']}")
    
    async def initialize(self):
        """初始化模型管理器"""
        if self._initialized:
            return
        
        logger.info("🚀 初始化多提供商模型管理器...")
        
        try:
            # 等待多提供商客户端初始化
            await asyncio.sleep(2)
            
            # 获取可用提供商状态
            provider_status = self.multi_client.get_status()
            available_providers = [name for name, status in provider_status.items() 
                                 if status.get("enabled", False)]
            
            logger.info(f"✅ 可用的AI提供商: {available_providers}")
            
            # 检查多模态服务状态
            image_providers = self.multimodal_matcher.image_client.providers
            music_providers = self.multimodal_matcher.music_client.providers
            
            available_image_providers = [name for name, config in image_providers.items() if config["enabled"]]
            available_music_providers = [name for name, config in music_providers.items() if config["enabled"]]
            
            logger.info(f"🎨 可用的图像生成提供商: {available_image_providers}")
            logger.info(f"🎵 可用的音乐生成提供商: {available_music_providers}")
            
            if available_providers or available_image_providers or available_music_providers:
                logger.info("✅ 至少有一个AI提供商可用")
            else:
                logger.warning("⚠️ 没有可用的AI提供商，将使用备用方案")
            
            self._initialized = True
            logger.info("✅ 多提供商模型管理器初始化完成")
            
        except Exception as e:
            logger.error(f"❌ 初始化失败: {e}")
            # 不抛出异常，允许服务继续运行
    
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """生成文本"""
        provider = self.providers["text"]
        
        try:
            if provider == "multi":
                # 使用多提供商客户端
                return await self.multi_client.generate_text(prompt, **kwargs)
            elif provider == "groq" and self.groq_client.enabled:
                # 使用Groq客户端
                return await self.groq_client.generate_text(prompt, **kwargs)
            else:
                # 回退到多提供商
                return await self.multi_client.generate_text(prompt, **kwargs)
                
        except Exception as e:
            logger.error(f"文本生成失败: {e}")
            # 最终备用方案
            return self._generate_ultimate_fallback_text(prompt, **kwargs)
    
    async def generate_image(self, prompt: str, **kwargs) -> bytes:
        """生成图像"""
        provider = self.providers["image"]
        
        try:
            if provider == "multi":
                # 使用多模态图像生成
                return await self.multimodal_matcher.image_client.generate_image(prompt, **kwargs)
            else:
                # 回退到多模态生成
                return await self.multimodal_matcher.image_client.generate_image(prompt, **kwargs)
                
        except Exception as e:
            logger.error(f"图像生成失败: {e}")
            raise ValueError(f"图像生成失败: {str(e)}")
    
    async def generate_music(self, prompt: str, **kwargs) -> bytes:
        """生成音乐"""
        provider = self.providers["music"]
        
        try:
            if provider == "multi":
                # 使用多模态音乐生成
                duration = kwargs.get("duration", 30)
                return await self.multimodal_matcher.music_client.generate_music(prompt, duration, **kwargs)
            else:
                # 回退到多模态生成
                duration = kwargs.get("duration", 30)
                return await self.multimodal_matcher.music_client.generate_music(prompt, duration, **kwargs)
                
        except Exception as e:
            logger.error(f"音乐生成失败: {e}")
            raise ValueError(f"音乐生成失败: {str(e)}")
    
    async def generate_code(self, prompt: str, **kwargs) -> str:
        """生成代码"""
        provider = self.providers["code"]
        
        try:
            if provider == "multi":
                # 使用多提供商客户端
                return await self.multi_client.generate_code(prompt, **kwargs)
            elif provider == "groq" and self.groq_client.enabled:
                # 使用Groq客户端
                return await self.groq_client.generate_code(prompt, **kwargs)
            else:
                # 回退到多提供商
                return await self.multi_client.generate_code(prompt, **kwargs)
                
        except Exception as e:
            logger.error(f"代码生成失败: {e}")
            # 最终备用方案
            return self._generate_ultimate_fallback_code(prompt, **kwargs)
    
    # 多模态功能
    async def generate_image_for_text(self, text: str, style: str = "realistic", **kwargs) -> bytes:
        """为文字生成配图"""
        return await self.multimodal_matcher.image_client.generate_image_for_text(text, style, **kwargs)
    
    async def generate_music_for_text(self, text: str, duration: int = 30, **kwargs) -> bytes:
        """为文字生成配乐"""
        return await self.multimodal_matcher.music_client.generate_music_for_text(text, duration, **kwargs)
    
    async def generate_music_for_image(self, image_description: str, duration: int = 30, **kwargs) -> bytes:
        """为图片生成配乐"""
        return await self.multimodal_matcher.music_client.generate_music_for_image(image_description, duration, **kwargs)
    
    async def create_complete_content(self, text: str, **kwargs) -> Dict[str, Any]:
        """创建完整的多模态内容"""
        return await self.multimodal_matcher.create_complete_content(text, **kwargs)
    
    def _generate_ultimate_fallback_text(self, prompt: str, **kwargs) -> str:
        """终极备用文本生成"""
        templates = [
            f"基于您的提示「{prompt}」，这里是AI生成的创意内容。YouCreator.AI采用多提供商架构，确保服务始终可用。在这个充满创意的数字时代，我们致力于为每个人提供强大的AI创作工具。",
            
            f"关于「{prompt}」的创作思考：人工智能正在重新定义创作的边界。通过整合多个开源AI服务，我们为用户提供了更加稳定和多样化的创作体验。每一次创作都是技术与想象力的完美结合。",
            
            f"灵感源于「{prompt}」：在YouCreator.AI的多提供商生态系统中，创意永不枯竭。我们相信，通过开源AI技术的力量，每个人都能成为优秀的创作者，释放无限的创造潜能。"
        ]
        
        import random
        return random.choice(templates)
    
    def _generate_ultimate_fallback_code(self, prompt: str, **kwargs) -> str:
        """终极备用代码生成"""
        language = kwargs.get("language", "python")
        
        # 智能识别常见需求
        if "斐波那契" in prompt or "fibonacci" in prompt.lower():
            return self._get_fibonacci_code(language)
        elif "排序" in prompt or "sort" in prompt.lower():
            return self._get_sort_code(language)
        elif "质数" in prompt or "prime" in prompt.lower():
            return self._get_prime_code(language)
        else:
            return self._get_generic_code_template(prompt, language)
    
    def _get_fibonacci_code(self, language: str) -> str:
        """获取斐波那契数列代码"""
        if language == "python":
            return '''def fibonacci(n):
    """计算斐波那契数列的第n项 - 递归版本"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

def fibonacci_dp(n):
    """计算斐波那契数列的第n项 - 动态规划版本"""
    if n <= 1:
        return n
    
    dp = [0] * (n + 1)
    dp[1] = 1
    
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    
    return dp[n]

def fibonacci_optimized(n):
    """计算斐波那契数列的第n项 - 空间优化版本"""
    if n <= 1:
        return n
    
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    
    return b

def fibonacci_sequence(count):
    """生成斐波那契数列"""
    return [fibonacci_optimized(i) for i in range(count)]

# 测试和演示
if __name__ == "__main__":
    print("斐波那契数列演示:")
    print(f"F(10) = {fibonacci_optimized(10)}")
    print(f"前15项: {fibonacci_sequence(15)}")
    
    # 性能比较
    import time
    n = 30
    
    start = time.time()
    result_optimized = fibonacci_optimized(n)
    time_optimized = time.time() - start
    
    print(f"\\n优化版本: F({n}) = {result_optimized}, 耗时: {time_optimized:.6f}秒")'''
        
        elif language == "javascript":
            return '''// 斐波那契数列 - JavaScript实现
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}

function fibonacciDP(n) {
    if (n <= 1) return n;
    
    const dp = new Array(n + 1);
    dp[0] = 0;
    dp[1] = 1;
    
    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    
    return dp[n];
}

function fibonacciOptimized(n) {
    if (n <= 1) return n;
    
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
        [a, b] = [b, a + b];
    }
    
    return b;
}

function fibonacciSequence(count) {
    return Array.from({length: count}, (_, i) => fibonacciOptimized(i));
}

// 测试
console.log("斐波那契数列演示:");
console.log(`F(10) = ${fibonacciOptimized(10)}`);
console.log(`前15项: ${fibonacciSequence(15)}`);'''
        
        return "# 斐波那契数列实现\n# TODO: 请选择支持的编程语言"
    
    def _get_sort_code(self, language: str) -> str:
        """获取排序算法代码"""
        if language == "python":
            return '''def bubble_sort(arr):
    """冒泡排序"""
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

def quick_sort(arr):
    """快速排序"""
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort(left) + middle + quick_sort(right)

def merge_sort(arr):
    """归并排序"""
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    """合并两个有序数组"""
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result

# 测试
if __name__ == "__main__":
    test_data = [64, 34, 25, 12, 22, 11, 90]
    print(f"原数组: {test_data}")
    print(f"快速排序: {quick_sort(test_data.copy())}")
    print(f"归并排序: {merge_sort(test_data.copy())}")'''
        
        return "# 排序算法实现\n# TODO: 请选择支持的编程语言"
    
    def _get_prime_code(self, language: str) -> str:
        """获取质数相关代码"""
        if language == "python":
            return '''def is_prime(n):
    """判断是否为质数"""
    if n < 2:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    
    for i in range(3, int(n**0.5) + 1, 2):
        if n % i == 0:
            return False
    return True

def sieve_of_eratosthenes(limit):
    """埃拉托斯特尼筛法生成质数"""
    sieve = [True] * (limit + 1)
    sieve[0] = sieve[1] = False
    
    for i in range(2, int(limit**0.5) + 1):
        if sieve[i]:
            for j in range(i*i, limit + 1, i):
                sieve[j] = False
    
    return [i for i in range(2, limit + 1) if sieve[i]]

def prime_factors(n):
    """质因数分解"""
    factors = []
    d = 2
    while d * d <= n:
        while n % d == 0:
            factors.append(d)
            n //= d
        d += 1
    if n > 1:
        factors.append(n)
    return factors

# 测试
if __name__ == "__main__":
    print(f"100以内的质数: {sieve_of_eratosthenes(100)}")
    print(f"97是质数吗? {is_prime(97)}")
    print(f"60的质因数: {prime_factors(60)}")'''
        
        return "# 质数算法实现\n# TODO: 请选择支持的编程语言"
    
    def _get_generic_code_template(self, prompt: str, language: str) -> str:
        """获取通用代码模板"""
        templates = {
            "python": f'''# {prompt}
def main():
    """
    主函数 - {prompt}
    """
    print("YouCreator.AI - 多提供商AI代码生成")
    
    # TODO: 根据需求实现具体功能
    result = "功能实现完成"
    
    return result

def helper_function():
    """
    辅助函数
    """
    pass

if __name__ == "__main__":
    try:
        result = main()
        print(f"执行结果: {{result}}")
    except Exception as e:
        print(f"执行出错: {{e}}")''',
            
            "javascript": f'''// {prompt}
function main() {{
    console.log("YouCreator.AI - 多提供商AI代码生成");
    
    // TODO: 根据需求实现具体功能
    const result = "功能实现完成";
    
    return result;
}}

function helperFunction() {{
    // 辅助函数
}}

// 执行
try {{
    const result = main();
    console.log(`执行结果: ${{result}}`);
}} catch (error) {{
    console.error(`执行出错: ${{error.message}}`);
}}''',
        }
        
        return templates.get(language, f"// {prompt}\n// TODO: 实现功能")
    
    async def get_status(self) -> Dict[str, Any]:
        """获取模型状态"""
        multi_status = self.multi_client.get_status()
        groq_status = self.groq_client.get_status()
        
        # 获取多模态服务状态
        image_providers = self.multimodal_matcher.image_client.providers
        music_providers = self.multimodal_matcher.music_client.providers
        
        image_status = {name: config["enabled"] for name, config in image_providers.items()}
        music_status = {name: config["enabled"] for name, config in music_providers.items()}
        
        return {
            "initialized": self._initialized,
            "providers": self.providers,
            "multi_provider_status": multi_status,
            "groq_status": groq_status,
            "multimodal_status": {
                "image_providers": image_status,
                "music_providers": music_status
            },
            "available_models": {
                "text": True,  # 总是可用（有备用方案）
                "image": any(image_status.values()),  # 有可用的图像提供商
                "music": any(music_status.values()),  # 有可用的音乐提供商
                "code": True,   # 总是可用（有备用方案）
            },
            "capabilities": {
                "text_generation": "多提供商 + 智能备用",
                "image_generation": "多提供商图像生成" if any(image_status.values()) else "占位符生成",
                "music_generation": "多提供商音乐生成" if any(music_status.values()) else "占位符生成", 
                "code_generation": "多提供商 + 增强模板",
                "multimodal_features": [
                    "文字配图",
                    "文字配乐", 
                    "图片配乐",
                    "完整多模态内容创建",
                    "风格分析"
                ],
                "providers": list(multi_status.keys()) + ["groq"]
            }
        }
    
    async def cleanup(self):
        """清理资源"""
        logger.info("🧹 清理多提供商模型管理器资源...")
        # 多提供商客户端无需特殊清理
        logger.info("✅ 资源清理完成")
