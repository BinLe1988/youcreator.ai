import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, style = 'realistic', width = 512, height = 512 } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({
        success: false,
        error: '请输入文字描述'
      }, { status: 400 });
    }

    // 构建图像生成请求数据
    const requestData = {
      prompt: enhanceImagePrompt(text, style),
      width,
      height,
      steps: 20
    };

    try {
      // 尝试调用AI服务的图像生成端点
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

      const aiResponse = await fetch(`${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/api/v1/image/generate`, {
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
            'Content-Type': 'image/svg+xml',
            'Content-Length': imageBuffer.byteLength.toString(),
          },
        });
      } else {
        throw new Error(`AI服务响应错误: ${aiResponse.status}`);
      }
    } catch (error) {
      console.log('AI服务不可用，使用模拟图像:', error);
      
      // 返回模拟图像数据
      const mockImageBuffer = generateMockImage(width, height, text, style);
      
      return new NextResponse(mockImageBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Content-Length': mockImageBuffer.byteLength.toString(),
        },
      });
    }

  } catch (error) {
    console.error('Text to image error:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 });
  }
}

function enhanceImagePrompt(text: string, style: string): string {
  const styleKeywords: {[key: string]: string} = {
    realistic: "photorealistic, high quality, detailed, professional photography",
    artistic: "artistic, painterly, creative, expressive, fine art",
    cartoon: "cartoon style, cute, colorful, animated, illustration",
    abstract: "abstract art, modern, geometric, conceptual, artistic",
    vintage: "vintage style, retro, nostalgic, classic, aged",
    minimalist: "minimalist, clean, simple, modern, elegant"
  };

  const styleKeyword = styleKeywords[style] || styleKeywords.realistic;
  return `${text}, ${styleKeyword}`;
}

function generateMockImage(width: number, height: number, text: string, style: string): Buffer {
  // 创建一个简单的SVG图像作为模拟
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad1)"/>
      <text x="50%" y="30%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">
        AI文字配图
      </text>
      <text x="50%" y="45%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">
        "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"
      </text>
      <text x="50%" y="60%" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="12">
        风格: ${style}
      </text>
      <text x="50%" y="75%" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-family="Arial, sans-serif" font-size="10">
        ${width} × ${height}
      </text>
      <text x="50%" y="90%" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-family="Arial, sans-serif" font-size="8">
        AI服务连接中，显示示例图像
      </text>
    </svg>
  `;
  
  return Buffer.from(svg, 'utf-8');
}
