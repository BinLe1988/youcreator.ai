import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 模拟工作流模板数据
    const templates = [
      {
        id: 'blog-writer',
        name: '博客文章生成器',
        description: '自动生成高质量博客文章，包括内容、配图和SEO优化',
        category: 'content_creation',
        difficulty: 'beginner',
        estimated_time: '5-10分钟',
        node_count: 5,
        version: '1.0',
        metadata: {
          tags: ['博客', '写作', 'SEO'],
          author: 'YouCreator.AI',
          popularity: 95
        }
      },
      {
        id: 'social-media-pack',
        name: '社交媒体内容包',
        description: '一键生成社交媒体文案、配图和短视频脚本',
        category: 'social_media',
        difficulty: 'beginner',
        estimated_time: '3-5分钟',
        node_count: 4,
        version: '1.2',
        metadata: {
          tags: ['社交媒体', '营销', '内容'],
          author: 'YouCreator.AI',
          popularity: 88
        }
      },
      {
        id: 'story-creator',
        name: '故事创作助手',
        description: '创作完整的故事，包括情节、人物和配图',
        category: 'creative_writing',
        difficulty: 'intermediate',
        estimated_time: '10-15分钟',
        node_count: 8,
        version: '1.1',
        metadata: {
          tags: ['故事', '创意写作', '小说'],
          author: 'YouCreator.AI',
          popularity: 76
        }
      },
      {
        id: 'marketing-campaign',
        name: '营销活动策划',
        description: '完整的营销活动策划，包括文案、素材和投放建议',
        category: 'marketing',
        difficulty: 'advanced',
        estimated_time: '15-20分钟',
        node_count: 12,
        version: '2.0',
        metadata: {
          tags: ['营销', '广告', '策划'],
          author: 'YouCreator.AI',
          popularity: 82
        }
      },
      {
        id: 'podcast-script',
        name: '播客脚本生成',
        description: '生成播客节目脚本，包括开场、内容和结尾',
        category: 'content_creation',
        difficulty: 'intermediate',
        estimated_time: '8-12分钟',
        node_count: 6,
        version: '1.0',
        metadata: {
          tags: ['播客', '脚本', '音频'],
          author: 'YouCreator.AI',
          popularity: 65
        }
      },
      {
        id: 'product-description',
        name: '产品描述生成器',
        description: '为电商产品生成吸引人的描述和营销文案',
        category: 'marketing',
        difficulty: 'beginner',
        estimated_time: '3-5分钟',
        node_count: 4,
        version: '1.3',
        metadata: {
          tags: ['电商', '产品', '描述'],
          author: 'YouCreator.AI',
          popularity: 91
        }
      },
      {
        id: 'video-script',
        name: '视频脚本创作',
        description: '创作视频脚本，包括分镜、对白和音效建议',
        category: 'creative_writing',
        difficulty: 'advanced',
        estimated_time: '12-18分钟',
        node_count: 10,
        version: '1.5',
        metadata: {
          tags: ['视频', '脚本', '分镜'],
          author: 'YouCreator.AI',
          popularity: 73
        }
      },
      {
        id: 'email-campaign',
        name: '邮件营销活动',
        description: '设计完整的邮件营销活动，包括主题、内容和跟进',
        category: 'marketing',
        difficulty: 'intermediate',
        estimated_time: '10-15分钟',
        node_count: 7,
        version: '1.2',
        metadata: {
          tags: ['邮件', '营销', 'EDM'],
          author: 'YouCreator.AI',
          popularity: 68
        }
      }
    ];

    return NextResponse.json({
      success: true,
      templates,
      total: templates.length,
      metadata: {
        categories: ['content_creation', 'social_media', 'creative_writing', 'marketing'],
        difficulty_levels: ['beginner', 'intermediate', 'advanced'],
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Workflow templates error:', error);
    return NextResponse.json({
      success: false,
      error: '获取工作流模板失败'
    }, { status: 500 });
  }
}
