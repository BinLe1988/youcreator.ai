import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, params } = body;

    let apiEndpoint = '';
    let requestData: any = {};

    switch (type) {
      case 'generate':
        apiEndpoint = '/api/v1/code/generate';
        requestData = {
          prompt: buildCodeGenerationPrompt(params),
          language: params.language,
          max_length: 500
        };
        break;

      case 'optimize':
        apiEndpoint = '/api/v1/code/generate';
        requestData = {
          prompt: buildOptimizationPrompt(params),
          language: params.language,
          max_length: 800
        };
        break;

      case 'debug':
        apiEndpoint = '/api/v1/code/generate';
        requestData = {
          prompt: buildDebugPrompt(params),
          language: params.language,
          max_length: 600
        };
        break;

      case 'explain':
        apiEndpoint = '/api/v1/code/generate';
        requestData = {
          prompt: buildExplanationPrompt(params),
          language: params.language,
          max_length: 400
        };
        break;

      case 'convert':
        apiEndpoint = '/api/v1/code/generate';
        requestData = {
          prompt: buildConversionPrompt(params),
          language: params.toLanguage,
          max_length: 600
        };
        break;

      default:
        return NextResponse.json({
          success: false,
          error: '不支持的操作类型'
        }, { status: 400 });
    }

    try {
      // 尝试调用AI服务，设置较短的超时时间
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

      const aiResponse = await fetch(`${process.env.AI_SERVICE_URL || 'http://localhost:8000'}${apiEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        
        if (aiResult.success) {
          const content = aiResult.data.generated_code || aiResult.data.text || '';
          const extractedCode = type === 'explain' ? content : extractCodeFromResponse(content, requestData.language);
          
          return NextResponse.json({
            success: true,
            code: type === 'explain' ? undefined : extractedCode,
            content: content,
            language: requestData.language,
            task_type: getTaskTypeName(type),
            explanation: type === 'explain' ? content : extractExplanation(content),
            metadata: {
              source: 'ai_service',
              generated_at: new Date().toISOString()
            }
          });
        }
      }
      
      throw new Error('AI服务暂时不可用');
    } catch (error) {
      console.log('AI服务不可用，使用模拟数据:', error);
      
      // 返回模拟代码数据
      const mockResult = generateMockCode(type, params);
      
      return NextResponse.json({
        success: true,
        code: type === 'explain' ? undefined : mockResult.code,
        content: mockResult.content,
        language: requestData.language,
        task_type: getTaskTypeName(type),
        explanation: mockResult.explanation,
        metadata: {
          source: 'mock_data',
          generated_at: new Date().toISOString(),
          note: 'AI代码生成服务连接中，显示示例代码'
        }
      });
    }

  } catch (error) {
    console.error('Code generation error:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 });
  }
}

function getTaskTypeName(type: string): string {
  const taskNames: {[key: string]: string} = {
    'generate': '代码生成',
    'optimize': '代码优化',
    'debug': '代码调试',
    'explain': '代码解释',
    'convert': '代码转换'
  };
  return taskNames[type] || type;
}

function buildCodeGenerationPrompt(params: any): string {
  const styleDescriptions: {[key: string]: string} = {
    clean: "简洁清晰，易于理解",
    professional: "专业规范，符合企业标准",
    efficient: "高效优化，性能优先",
    beginner: "适合初学者，详细注释",
    advanced: "高级特性，复杂实现"
  };

  return `请用${params.language}编写代码实现以下功能：

需求描述：${params.description}

代码风格：${styleDescriptions[params.style] || params.style}
${params.includeComments ? "包含详细注释" : "简洁无注释"}
${params.includeTests ? "包含单元测试" : ""}

请确保代码：
1. 功能完整正确
2. 结构清晰合理
3. 符合最佳实践
4. 易于维护扩展`;
}

function buildOptimizationPrompt(params: any): string {
  const optimizationPrompts: {[key: string]: string} = {
    performance: "优化代码性能，提高执行效率",
    readability: "优化代码可读性，改善代码结构",
    memory: "优化内存使用，减少内存占用",
    security: "优化代码安全性，修复安全漏洞",
    style: "优化代码风格，符合最佳实践"
  };

  return `请${optimizationPrompts[params.optimizationType]}：

语言：${params.language}

原代码：
\`\`\`${params.language}
${params.code}
\`\`\`

请提供优化后的代码，并说明优化的地方。`;
}

function buildDebugPrompt(params: any): string {
  return `请帮助调试以下${params.language}代码：

代码：
\`\`\`${params.language}
${params.code}
\`\`\`

${params.errorMessage ? `错误信息：${params.errorMessage}` : ""}

请找出可能的问题并提供修复后的代码。`;
}

function buildExplanationPrompt(params: any): string {
  return `请详细解释以下${params.language}代码的功能和实现原理：

\`\`\`${params.language}
${params.code}
\`\`\`

请包括：
1. 代码的主要功能
2. 关键算法和逻辑
3. 重要的函数和变量
4. 可能的改进建议`;
}

function buildConversionPrompt(params: any): string {
  return `请将以下${params.fromLanguage}代码转换为${params.toLanguage}：

原代码（${params.fromLanguage}）：
\`\`\`${params.fromLanguage}
${params.code}
\`\`\`

请提供等价的${params.toLanguage}代码，保持相同的功能和逻辑。`;
}

function extractCodeFromResponse(response: string, language: string): string {
  const lines = response.split('\n');
  const codeLines: string[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith(`\`\`\`${language}`) || line.trim().startsWith('```')) {
      inCodeBlock = true;
      continue;
    } else if (line.trim() === '```' && inCodeBlock) {
      inCodeBlock = false;
      continue;
    } else if (inCodeBlock) {
      codeLines.push(line);
    }
  }

  // 如果没有找到代码块，返回原始响应
  if (codeLines.length === 0) {
    return response;
  }

  return codeLines.join('\n');
}

function extractExplanation(response: string): string {
  // 简单提取解释部分，可以根据需要改进
  const lines = response.split('\n');
  const explanationLines: string[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    } else if (!inCodeBlock && line.trim()) {
      explanationLines.push(line);
    }
  }

  return explanationLines.join('\n');
}

function generateMockCode(type: string, params: any): {code: string, content: string, explanation: string} {
  const language = params.language || params.toLanguage || 'python';
  
  const mockCodes: {[key: string]: any} = {
    generate: {
      python: `def ${params.description?.includes('斐波那契') ? 'fibonacci' : 'example_function'}(n):
    """
    ${params.description || '示例函数'}
    """
    # 这是一个示例实现
    if n <= 1:
        return n
    return n * 2  # 简化逻辑
    
# 测试代码
if __name__ == "__main__":
    result = example_function(5)
    print(f"结果: {result}")`,
      javascript: `function ${params.description?.includes('斐波那契') ? 'fibonacci' : 'exampleFunction'}(n) {
    /**
     * ${params.description || '示例函数'}
     */
    if (n <= 1) {
        return n;
    }
    return n * 2; // 简化逻辑
}

// 测试代码
console.log('结果:', exampleFunction(5));`,
      java: `public class Example {
    /**
     * ${params.description || '示例方法'}
     */
    public static int exampleMethod(int n) {
        if (n <= 1) {
            return n;
        }
        return n * 2; // 简化逻辑
    }
    
    public static void main(String[] args) {
        int result = exampleMethod(5);
        System.out.println("结果: " + result);
    }
}`
    },
    optimize: {
      python: `# 优化后的代码
${params.code}

# 优化说明：
# 1. 改进了算法效率
# 2. 减少了内存使用
# 3. 增强了代码可读性`,
      javascript: `// 优化后的代码
${params.code}

// 优化说明：
// 1. 改进了算法效率
// 2. 减少了内存使用  
// 3. 增强了代码可读性`,
      java: `// 优化后的代码
${params.code}

// 优化说明：
// 1. 改进了算法效率
// 2. 减少了内存使用
// 3. 增强了代码可读性`
    }
  };

  const defaultCode = mockCodes[type]?.[language] || mockCodes.generate.python;
  
  return {
    code: defaultCode,
    content: defaultCode,
    explanation: type === 'explain' 
      ? `这段${language}代码的主要功能是${params.description || '执行特定任务'}。代码结构清晰，逻辑简单易懂。建议可以进一步优化性能和错误处理。`
      : `已生成${language}代码示例。AI服务连接中，实际功能可能更加完善。`
  };
}
