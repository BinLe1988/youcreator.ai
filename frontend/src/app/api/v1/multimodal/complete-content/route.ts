import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, imageStyle = 'realistic', musicStyle = 'ambient', duration = 30 } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({
        success: false,
        error: '请输入文字描述'
      }, { status: 400 });
    }

    const startTime = Date.now();

    try {
      // 尝试调用AI服务的完整多模态内容生成端点
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时

      const aiResponse = await fetch(`${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/api/v1/multimodal/complete-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          image_style: imageStyle,
          music_style: musicStyle,
          duration
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        
        if (aiResult.success) {
          return NextResponse.json({
            success: true,
            text: aiResult.data.text || text,
            image: aiResult.data.image,
            music: aiResult.data.music,
            metadata: {
              generation_time: (Date.now() - startTime) / 1000,
              style_analysis: aiResult.data.style_analysis,
              source: 'ai_service'
            }
          });
        }
      }
      
      throw new Error('AI服务暂时不可用');
    } catch (error) {
      console.log('AI服务不可用，使用模拟数据:', error);
      
      // 返回模拟多模态内容
      const mockContent = await generateMockMultimodalContent(text, imageStyle, musicStyle, duration);
      
      return NextResponse.json({
        success: true,
        text: mockContent.text,
        image: mockContent.image,
        music: mockContent.music,
        metadata: {
          generation_time: (Date.now() - startTime) / 1000,
          style_analysis: mockContent.styleAnalysis,
          source: 'mock_data',
          note: 'AI多模态服务连接中，显示示例内容'
        }
      });
    }

  } catch (error) {
    console.error('Complete content generation error:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 });
  }
}

async function generateMockMultimodalContent(text: string, imageStyle: string, musicStyle: string, duration: number) {
  // 生成模拟图像（base64 SVG）
  const mockImage = generateMockImageBase64(512, 512, text, imageStyle);
  
  // 生成模拟音频（base64 WAV）
  const mockMusic = generateMockAudioBase64(duration, text, musicStyle);
  
  // 生成风格分析
  const styleAnalysis = {
    mood: extractMood(text),
    genre: mapStyleToGenre(imageStyle, musicStyle),
    visual_style: imageStyle,
    music_style: musicStyle,
    content_theme: extractTheme(text)
  };

  return {
    text: enhanceText(text),
    image: mockImage,
    music: mockMusic,
    styleAnalysis
  };
}

function generateMockImageBase64(width: number, height: number, text: string, style: string): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad1)"/>
      <text x="50%" y="25%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="20" font-weight="bold">
        多模态内容创作
      </text>
      <text x="50%" y="40%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">
        "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"
      </text>
      <text x="50%" y="55%" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="12">
        图像风格: ${style}
      </text>
      <text x="50%" y="70%" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-family="Arial, sans-serif" font-size="10">
        ${width} × ${height}
      </text>
      <text x="50%" y="85%" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-family="Arial, sans-serif" font-size="8">
        AI服务连接中，显示示例内容
      </text>
    </svg>
  `;
  
  const base64Svg = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64Svg}`;
}

function generateMockAudioBase64(duration: number, text: string, style: string): string {
  // 创建简单的WAV文件
  const sampleRate = 44100;
  const channels = 2;
  const bitsPerSample = 16;
  const samples = duration * sampleRate;
  const dataSize = samples * channels * (bitsPerSample / 8);
  const fileSize = 44 + dataSize;

  const buffer = Buffer.alloc(44 + dataSize);
  let offset = 0;

  // WAV文件头
  buffer.write('RIFF', offset); offset += 4;
  buffer.writeUInt32LE(fileSize - 8, offset); offset += 4;
  buffer.write('WAVE', offset); offset += 4;
  buffer.write('fmt ', offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4;
  buffer.writeUInt16LE(1, offset); offset += 2;
  buffer.writeUInt16LE(channels, offset); offset += 2;
  buffer.writeUInt32LE(sampleRate, offset); offset += 4;
  buffer.writeUInt32LE(sampleRate * channels * (bitsPerSample / 8), offset); offset += 4;
  buffer.writeUInt16LE(channels * (bitsPerSample / 8), offset); offset += 2;
  buffer.writeUInt16LE(bitsPerSample, offset); offset += 2;
  buffer.write('data', offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;

  // 生成音频数据
  for (let i = 0; i < samples; i++) {
    const time = i / sampleRate;
    const frequency = 440;
    const amplitude = 0.1;
    const sample = Math.sin(2 * Math.PI * frequency * time) * amplitude;
    const intSample = Math.round(sample * 32767);
    
    buffer.writeInt16LE(intSample, offset); offset += 2;
    buffer.writeInt16LE(intSample, offset); offset += 2;
  }

  return `data:audio/wav;base64,${buffer.toString('base64')}`;
}

function enhanceText(text: string): string {
  return `${text}\n\n[AI增强内容] 这是一个基于您的描述生成的多模态内容示例。实际的AI服务将提供更加丰富和个性化的内容创作。`;
}

function extractMood(text: string): string {
  const moodKeywords = {
    happy: ['快乐', '开心', '愉快', '欢乐', '兴奋'],
    sad: ['悲伤', '难过', '忧郁', '沮丧', '失落'],
    peaceful: ['平静', '宁静', '安详', '祥和', '温和'],
    energetic: ['活力', '充满', '激动', '热情', '动感'],
    mysterious: ['神秘', '诡异', '奇怪', '未知', '隐秘'],
    romantic: ['浪漫', '爱情', '温柔', '甜蜜', '情侣']
  };

  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return mood;
    }
  }
  
  return 'neutral';
}

function mapStyleToGenre(imageStyle: string, musicStyle: string): string {
  const genreMap: {[key: string]: string} = {
    'realistic-ambient': '现实主义环境',
    'artistic-orchestral': '艺术管弦',
    'cartoon-electronic': '卡通电子',
    'abstract-jazz': '抽象爵士',
    'vintage-classical': '复古古典',
    'minimalist-acoustic': '简约原声'
  };

  const key = `${imageStyle}-${musicStyle}`;
  return genreMap[key] || '综合创意';
}

function extractTheme(text: string): string {
  const themeKeywords = {
    nature: ['自然', '森林', '海洋', '山', '花', '树'],
    technology: ['科技', '未来', '机器', '电脑', '网络', 'AI'],
    love: ['爱情', '恋人', '情侣', '浪漫', '约会', '婚礼'],
    adventure: ['冒险', '探索', '旅行', '发现', '挑战', '勇敢'],
    art: ['艺术', '绘画', '音乐', '创作', '美术', '设计'],
    life: ['生活', '日常', '家庭', '朋友', '工作', '学习']
  };

  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return theme;
    }
  }
  
  return 'general';
}
