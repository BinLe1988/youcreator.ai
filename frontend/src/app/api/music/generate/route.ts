import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 支持两种调用方式：
    // 1. 简单方式：{ "prompt": "音乐描述", "duration": 30 }
    // 2. 复杂方式：{ "type": "text", "params": {...} }
    
    let requestData: any = {};

    if (body.prompt) {
      // 简单方式
      requestData = {
        prompt: body.prompt,
        duration: body.duration || 30,
        genre: body.genre || 'ambient'
      };
    } else if (body.type && body.params) {
      // 复杂方式
      const { type, params } = body;
      
      switch (type) {
        case 'text':
          requestData = {
            prompt: enhanceMusicPrompt(params.description, params.style, params.mood),
            duration: params.duration,
            genre: params.style
          };
          break;

        case 'theme':
          const themeDescriptions: {[key: string]: string} = {
            adventure: "冒险主题音乐，激动人心的旋律，充满探索精神",
            romance: "浪漫主题音乐，温柔甜美的旋律，表达爱情美好",
            mystery: "神秘主题音乐，悬疑紧张的氛围，引人入胜"
          };
          requestData = {
            prompt: themeDescriptions[params.theme] || `${params.theme}主题音乐`,
            duration: params.duration,
            genre: 'thematic'
          };
          break;

        case 'ambient':
          const environmentDescriptions: {[key: string]: string} = {
            forest: "森林环境音景，鸟鸣虫叫，树叶沙沙声，宁静自然",
            ocean: "海洋环境音景，海浪拍岸，海鸥鸣叫，清新海风",
            rain: "雨天环境音景，雨滴声，雷声，湿润清新的氛围"
          };
          requestData = {
            prompt: environmentDescriptions[params.environment] || `${params.environment}环境音景`,
            duration: params.duration,
            genre: 'ambient'
          };
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
          return NextResponse.json({
            success: true,
            audio_data: aiResult.audio_data,
            description: aiResult.data.description || requestData.prompt,
            duration: requestData.duration,
            style: requestData.genre,
            sample_rate: aiResult.data.sample_rate || 44100,
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
      
      // 返回模拟音频数据
      const mockAudio = generateMockAudio(requestData.duration, requestData.prompt);
      
      return NextResponse.json({
        success: true,
        audio_data: mockAudio,
        description: requestData.prompt,
        duration: requestData.duration,
        style: requestData.genre || 'ambient',
        sample_rate: 44100,
        metadata: {
          source: 'mock_data',
          generated_at: new Date().toISOString(),
          note: 'AI音乐生成服务连接中，显示示例音频'
        }
      });
    }

  } catch (error) {
    console.error('Music generation error:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 });
  }
}

function enhanceMusicPrompt(description: string, style: string, mood: string): string {
  const styleKeywords: {[key: string]: string} = {
    ambient: "ambient, atmospheric, ethereal, floating",
    classical: "classical, orchestral, elegant, refined",
    electronic: "electronic, synthesized, digital, modern",
    jazz: "jazz, improvised, swing, sophisticated"
  };

  const moodKeywords: {[key: string]: string} = {
    happy: "joyful, uplifting, bright, cheerful",
    sad: "melancholic, somber, emotional, touching",
    peaceful: "calm, serene, tranquil, relaxing",
    energetic: "dynamic, vibrant, exciting, powerful"
  };

  let enhanced = description;
  
  if (styleKeywords[style]) {
    enhanced += `, ${styleKeywords[style]}`;
  }
  
  if (moodKeywords[mood]) {
    enhanced += `, ${moodKeywords[mood]}`;
  }

  return enhanced;
}

function generateMockAudio(duration: number, description: string): string {
  // 简化的WAV文件头 + base64编码
  const wavHeader = "UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
  return `data:audio/wav;base64,${wavHeader}`;
}
