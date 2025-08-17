import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const style = formData.get('style') as string || 'ambient';
    const duration = parseInt(formData.get('duration') as string) || 30;

    if (!imageFile) {
      return NextResponse.json({
        success: false,
        error: '请上传图片文件'
      }, { status: 400 });
    }

    // 将图片转换为base64
    const imageBuffer = await imageFile.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const imageDataUrl = `data:${imageFile.type};base64,${imageBase64}`;

    // 构建音乐生成请求数据
    const requestData = {
      image_base64: imageDataUrl,
      style,
      duration
    };

    try {
      // 尝试调用AI服务的图片配乐端点
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

      const aiResponse = await fetch(`${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/api/v1/multimodal/image-to-music`, {
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
      const mockAudioBuffer = generateMockAudio(duration, imageFile.name, style);
      
      return new NextResponse(mockAudioBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/wav',
          'Content-Length': mockAudioBuffer.byteLength.toString(),
        },
      });
    }

  } catch (error) {
    console.error('Image to music error:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 });
  }
}

function generateMockAudio(duration: number, imageName: string, style: string): Buffer {
  // 创建一个简单的WAV文件头作为模拟
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

  // 根据风格生成不同频率的音频
  const styleFrequencies: {[key: string]: number[]} = {
    ambient: [220, 330, 440],
    orchestral: [261, 329, 392, 523],
    electronic: [440, 554, 659, 880],
    acoustic: [196, 246, 293, 349],
    jazz: [220, 277, 330, 415],
    classical: [261, 329, 392, 523]
  };

  const frequencies = styleFrequencies[style] || styleFrequencies.ambient;

  for (let i = 0; i < samples; i++) {
    const time = i / sampleRate;
    let sample = 0;
    
    // 混合多个频率
    frequencies.forEach((freq, index) => {
      const amplitude = 0.05 / frequencies.length; // 分散音量
      sample += Math.sin(2 * Math.PI * freq * time) * amplitude * Math.exp(-time * 0.5);
    });
    
    const intSample = Math.round(sample * 32767);
    
    // 写入立体声数据
    buffer.writeInt16LE(intSample, offset); offset += 2;
    buffer.writeInt16LE(intSample, offset); offset += 2;
  }

  return buffer;
}
