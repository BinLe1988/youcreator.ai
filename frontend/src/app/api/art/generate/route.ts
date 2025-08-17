import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 支持两种调用方式：
    // 1. 简单方式：{ "prompt": "图像描述" }
    // 2. 复杂方式：{ "type": "free", "params": {...} }
    
    let apiEndpoint = '/api/v1/image/generate';
    let requestData: any = {};

    if (body.prompt) {
      // 简单方式
      requestData = {
        prompt: body.prompt,
        width: body.width || 512,
        height: body.height || 512,
        steps: 20
      };
    } else if (body.type && body.params) {
      // 复杂方式
      const { type, params } = body;
      
      switch (type) {
        case 'free':
          requestData = {
            prompt: params.prompt,
            width: params.width || 512,
            height: params.height || 512,
            steps: getInferenceSteps(params.quality)
          };
          break;

        case 'portrait':
          requestData = {
            prompt: `portrait of ${params.description}, professional photography, detailed face, studio lighting`,
            width: 512,
            height: 768,
            steps: 25
          };
          break;

        case 'landscape':
          requestData = {
            prompt: `landscape of ${params.description}, scenic view, natural lighting, high quality`,
            width: 768,
            height: 512,
            steps: 25
          };
          break;

        case 'abstract':
          requestData = {
            prompt: `abstract art, ${params.description}, creative, artistic, modern`,
            width: 512,
            height: 512,
            steps: 30
          };
          break;

        default:
          return NextResponse.json({
            success: false,
            error: '不支持的艺术类型'
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
        // AI服务返回的是图像流，直接返回给前端
        const imageBuffer = await aiResponse.arrayBuffer();
        
        return new NextResponse(imageBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'image/png',
            'Content-Length': imageBuffer.byteLength.toString(),
          },
        });
      } else {
        throw new Error(`AI服务响应错误: ${aiResponse.status}`);
      }
    } catch (error) {
      console.log('AI服务不可用，使用模拟图像:', error);
      
      // 返回模拟图像数据
      const mockImageBuffer = generateMockImage(requestData.width, requestData.height, requestData.prompt);
      
      return new NextResponse(mockImageBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Content-Length': mockImageBuffer.byteLength.toString(),
        },
      });
    }

  } catch (error) {
    console.error('Art generation error:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 });
  }
}

function getInferenceSteps(quality: string): number {
  const qualityMap: {[key: string]: number} = {
    'draft': 10,
    'normal': 20,
    'high': 30,
    'ultra': 50
  };
  return qualityMap[quality] || 20;
}

function generateMockImage(width: number, height: number, prompt: string): Buffer {
  // 创建一个简单的SVG图像作为模拟
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#4ecdc4;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#45b7d1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad1)"/>
      <text x="50%" y="25%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="20" font-weight="bold">
        AI艺术生成
      </text>
      <text x="50%" y="45%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">
        "${prompt.substring(0, 30)}${prompt.length > 30 ? '...' : ''}"
      </text>
      <text x="50%" y="65%" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="12">
        ${width} × ${height}
      </text>
      <text x="50%" y="85%" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-family="Arial, sans-serif" font-size="10">
        AI服务连接中，显示示例图像
      </text>
    </svg>
  `;
  
  return Buffer.from(svg, 'utf-8');
}
