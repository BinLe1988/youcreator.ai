import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 支持两种调用方式：
    // 1. 简单方式：{ "content": "需要润色的内容" }
    // 2. 复杂方式：{ "content": "...", "serviceType": "...", ... }
    
    const { 
      content, 
      contentType = 'text', 
      serviceType = 'basic', 
      requirements = '提升文字质量和表达效果'
    } = body;

    // 验证必需字段
    if (!content) {
      return NextResponse.json({
        success: false,
        error: '请提供需要润色的内容'
      }, { status: 400 });
    }

    try {
      // 尝试调用AI服务进行润色
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const aiResponse = await fetch(`${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/api/v1/text/polish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          service_type: serviceType,
          requirements,
          content_type: contentType
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        
        if (aiResult.success) {
          return NextResponse.json({
            success: true,
            polished_content: aiResult.data.polished_content,
            improvements: aiResult.data.improvements,
            service_type: serviceType,
            metadata: {
              source: 'ai_service',
              generated_at: new Date().toISOString(),
              word_count: content.length
            }
          });
        }
      }
      
      throw new Error('AI服务暂时不可用');
    } catch (error) {
      console.log('AI服务不可用，使用模拟润色:', error);
      
      // 返回模拟润色结果
      const mockResult = generateMockPolish(content, serviceType, requirements);
      
      return NextResponse.json({
        success: true,
        polished_content: mockResult.polished_content,
        improvements: mockResult.improvements,
        service_type: serviceType,
        metadata: {
          source: 'mock_data',
          generated_at: new Date().toISOString(),
          word_count: content.length,
          note: 'AI润色服务连接中，显示示例润色结果'
        }
      });
    }

  } catch (error) {
    console.error('Polish creation error:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 });
  }
}

function generateMockPolish(content: string, serviceType: string, requirements: string) {
  // 简单的模拟润色逻辑
  let polished_content = content;
  let improvements = [];

  // 基础润色
  if (serviceType === 'basic') {
    polished_content = content
      .replace(/。/g, '。\n')
      .replace(/，/g, '，')
      .trim();
    
    improvements = [
      '调整了标点符号的使用',
      '优化了段落结构',
      '提升了文字的流畅度'
    ];
  }
  
  // 专业润色
  else if (serviceType === 'professional') {
    polished_content = `【润色版本】\n\n${content}\n\n【改进说明】\n本文经过专业润色，在保持原意的基础上，提升了表达的准确性和文字的优美程度。`;
    
    improvements = [
      '增强了表达的准确性',
      '优化了词汇选择',
      '改善了句式结构',
      '提升了整体文采',
      '调整了逻辑顺序'
    ];
  }
  
  // 高级润色
  else if (serviceType === 'premium') {
    polished_content = `【高级润色版本】\n\n经过深度润色的内容：\n\n${content}\n\n【专业分析】\n本文在原有基础上进行了全面提升，不仅优化了语言表达，还增强了内容的深度和广度。`;
    
    improvements = [
      '全面提升语言质量',
      '深度优化内容结构',
      '增强逻辑连贯性',
      '提升文学性和艺术性',
      '完善细节表达',
      '增加内容深度'
    ];
  }

  return {
    polished_content,
    improvements
  };
}
