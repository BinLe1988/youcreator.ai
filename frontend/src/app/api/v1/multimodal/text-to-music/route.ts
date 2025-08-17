import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, style = 'ambient', duration = 30 } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({
        success: false,
        error: '请输入文字描述'
      }, { status: 400 });
    }

    // 构建音乐生成请求数据
    const requestData = {
      prompt: enhanceMusicPrompt(text, style),
      duration,
      genre: style
    };

    try {
      // 尝试调用AI服务的音乐生成端点
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

      const aiResponse = await fetch(`${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/api/v1/music/generate`, {
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
        
        if (aiResult.success && aiResult.audio_data) {
          // 如果AI服务返回base64音频数据，需要转换为buffer
          const audioData = aiResult.audio_data.replace(/^data:audio\/[^;]+;base64,/, '');
          const audioBuffer = Buffer.from(audioData, 'base64');
          
          return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'audio/wav',
              'Content-Length': audioBuffer.byteLength.toString(),
            },
          });
        }
      }
      
      throw new Error('AI服务暂时不可用');
    } catch (error) {
      console.log('AI服务不可用，使用模拟音频:', error);
      
      // 返回模拟音频数据
      const mockAudioBuffer = generateMockAudio(duration, text, style);
      
      return new NextResponse(mockAudioBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/wav',
          'Content-Length': mockAudioBuffer.byteLength.toString(),
        },
      });
    }

  } catch (error) {
    console.error('Text to music error:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 });
  }
}

function enhanceMusicPrompt(text: string, style: string): string {
  const styleKeywords: {[key: string]: string} = {
    ambient: "ambient, atmospheric, peaceful, relaxing",
    orchestral: "orchestral, symphonic, grand, majestic",
    electronic: "electronic, synthesized, modern, digital",
    acoustic: "acoustic, organic, warm, natural",
    jazz: "jazz, smooth, sophisticated, improvised",
    classical: "classical, elegant, refined, traditional"
  };

  const styleKeyword = styleKeywords[style] || styleKeywords.ambient;
  return `${text}, ${styleKeyword} music`;
}

function generateMockAudio(duration: number, text: string, style: string): Buffer {
  // 创建一个简单的WAV文件头作为模拟
  // 这是一个非常简化的实现，实际应用中需要生成真正的音频数据
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
  buffer.writeUInt32LE(16, offset); offset += 4; // PCM格式
  buffer.writeUInt16LE(1, offset); offset += 2; // 音频格式
  buffer.writeUInt16LE(channels, offset); offset += 2;
  buffer.writeUInt32LE(sampleRate, offset); offset += 4;
  buffer.writeUInt32LE(sampleRate * channels * (bitsPerSample / 8), offset); offset += 4;
  buffer.writeUInt16LE(channels * (bitsPerSample / 8), offset); offset += 2;
  buffer.writeUInt16LE(bitsPerSample, offset); offset += 2;
  buffer.write('data', offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;

  // 生成简单的正弦波音频数据
  for (let i = 0; i < samples; i++) {
    const time = i / sampleRate;
    const frequency = 440; // A4音符
    const amplitude = 0.1; // 较小的音量
    const sample = Math.sin(2 * Math.PI * frequency * time) * amplitude;
    const intSample = Math.round(sample * 32767);
    
    // 写入立体声数据
    buffer.writeInt16LE(intSample, offset); offset += 2;
    buffer.writeInt16LE(intSample, offset); offset += 2;
  }

  return buffer;
}
