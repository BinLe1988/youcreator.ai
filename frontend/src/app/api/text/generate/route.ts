import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 支持两种调用方式：
    // 1. 简单方式：{ "prompt": "文字内容" }
    // 2. 复杂方式：{ "type": "novel", "params": {...} }
    
    let prompt = '';
    let taskType = '';

    if (body.prompt) {
      // 简单方式
      prompt = body.prompt;
      taskType = '文字生成';
    } else if (body.type && body.params) {
      // 复杂方式
      const { type, params } = body;
      
      switch (type) {
        case 'novel':
          prompt = `请创作一篇${params.genre}题材的${params.length}小说，主题是：${params.theme}`;
          taskType = '小说创作';
          break;

        case 'poem':
          prompt = `请创作一首${params.style}，主题是：${params.theme}`;
          taskType = '诗歌创作';
          break;

        case 'article':
          prompt = `请写一篇关于"${params.topic}"的${params.type}文章`;
          taskType = '文章写作';
          break;

        case 'script':
          prompt = `请创作一个${params.genre}剧本，主题是：${params.theme}`;
          taskType = '剧本创作';
          break;

        default:
          return NextResponse.json({
            success: false,
            error: '不支持的创作类型'
          }, { status: 400 });
      }
    } else {
      return NextResponse.json({
        success: false,
        error: '请提供prompt参数或type和params参数'
      }, { status: 400 });
    }

    try {
      // 尝试调用AI服务
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const aiResponse = await fetch(`${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/api/v1/text/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          max_length: 1000,
          temperature: 0.7
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        
        if (aiResult.success) {
          return NextResponse.json({
            success: true,
            text: aiResult.data.text,
            task_type: taskType,
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
      
      // 返回模拟文字内容
      const mockText = generateMockText(prompt, taskType);
      
      return NextResponse.json({
        success: true,
        text: mockText,
        task_type: taskType,
        metadata: {
          source: 'mock_data',
          generated_at: new Date().toISOString(),
          note: 'AI文字生成服务连接中，显示示例内容'
        }
      });
    }

  } catch (error) {
    console.error('Text generation error:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 });
  }
}

function generateMockText(prompt: string, taskType: string): string {
  const mockTexts: {[key: string]: string} = {
    '文字生成': `基于您的提示"${prompt}"，这是一个AI生成的示例文本。

在这个数字化时代，人工智能正在改变我们的生活方式。从智能助手到自动驾驶，AI技术的应用越来越广泛。

这段文字展示了AI文本生成的能力，虽然这是一个示例，但真正的AI服务将能够根据您的具体需求生成更加个性化和专业的内容。

AI文字生成服务正在连接中，请稍后体验完整功能。`,
    
    '小说创作': `第一章：开始

在一个阳光明媚的早晨，主人公踏上了一段全新的旅程。这个故事将带领读者进入一个充满想象力的世界。

（这是一个示例小说开头，AI服务连接后将生成完整的小说内容）`,
    
    '诗歌创作': `春风轻抚大地，
万物复苏生机。
花开满园香溢，
诗意盎然心怡。

（这是一个示例诗歌，AI服务连接后将根据您的要求创作个性化诗歌）`,
    
    '文章写作': `标题：${prompt}

引言：
本文将深入探讨相关主题，为读者提供有价值的见解和分析。

正文：
（AI服务连接后将生成完整的文章内容，包括详细的论述和分析）

结论：
通过本文的分析，我们可以得出重要的结论和启示。`,
    
    '剧本创作': `场景一：室内 - 白天

人物A：（充满期待地）今天将是一个特别的日子。
人物B：（好奇地）为什么这么说？
人物A：因为我们即将见证AI创作的力量。

（这是一个示例剧本片段，AI服务连接后将生成完整的剧本）`
  };

  return mockTexts[taskType] || mockTexts['文字生成'];
}
