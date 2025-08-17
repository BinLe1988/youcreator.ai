import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 模拟用户工作流数据
    const workflows = [
      {
        id: 'user-workflow-1',
        name: '我的博客助手',
        description: '基于博客生成器模板创建的个人工作流',
        version: '1.0',
        nodes: [
          {
            id: 'input-1',
            type: 'input',
            name: '输入主题',
            description: '输入博客主题和关键词',
            config: { input_fields: ['topic', 'keywords', 'target_audience'] },
            position: { x: 100, y: 100 }
          },
          {
            id: 'generate-1',
            type: 'text_generation',
            name: '生成内容',
            description: '生成博客文章内容',
            config: { 
              prompt: '写一篇关于{topic}的博客文章，目标读者是{target_audience}',
              max_length: 2000 
            },
            position: { x: 300, y: 100 }
          },
          {
            id: 'optimize-1',
            type: 'content_optimization',
            name: 'SEO优化',
            description: '优化文章的SEO',
            config: { optimization_type: 'seo' },
            position: { x: 500, y: 100 }
          },
          {
            id: 'output-1',
            type: 'output',
            name: '输出结果',
            description: '输出最终文章',
            config: { output_fields: ['title', 'content', 'meta_description'] },
            position: { x: 700, y: 100 }
          }
        ],
        edges: [
          { from: 'input-1', to: 'generate-1' },
          { from: 'generate-1', to: 'optimize-1' },
          { from: 'optimize-1', to: 'output-1' }
        ],
        variables: {
          default_audience: '技术爱好者',
          content_style: '专业但易懂'
        },
        metadata: {
          category: 'content_creation',
          created_from_template: 'blog-writer',
          last_executed: '2024-08-15T10:30:00Z',
          execution_count: 5
        },
        created_at: '2024-08-10T09:00:00Z',
        updated_at: '2024-08-15T10:30:00Z'
      },
      {
        id: 'user-workflow-2',
        name: '社交媒体内容生成器',
        description: '为多个社交平台生成内容的自定义工作流',
        version: '1.1',
        nodes: [
          {
            id: 'input-2',
            type: 'input',
            name: '输入创意',
            description: '输入内容创意',
            config: { input_fields: ['idea', 'platforms', 'tone'] },
            position: { x: 100, y: 100 }
          },
          {
            id: 'generate-text-2',
            type: 'text_generation',
            name: '生成文案',
            description: '生成社交媒体文案',
            config: { 
              prompt: '为{platforms}平台创作{tone}风格的内容：{idea}',
              max_length: 500 
            },
            position: { x: 300, y: 50 }
          },
          {
            id: 'generate-image-2',
            type: 'image_generation',
            name: '生成配图',
            description: '生成配图',
            config: { style: 'social_media', width: 1080, height: 1080 },
            position: { x: 300, y: 150 }
          },
          {
            id: 'optimize-2',
            type: 'content_optimization',
            name: '平台优化',
            description: '针对不同平台优化内容',
            config: { optimization_type: 'platform_specific' },
            position: { x: 500, y: 100 }
          },
          {
            id: 'output-2',
            type: 'output',
            name: '输出内容',
            description: '输出优化后的内容',
            config: { output_fields: ['text', 'image_url', 'hashtags'] },
            position: { x: 700, y: 100 }
          }
        ],
        edges: [
          { from: 'input-2', to: 'generate-text-2' },
          { from: 'input-2', to: 'generate-image-2' },
          { from: 'generate-text-2', to: 'optimize-2' },
          { from: 'generate-image-2', to: 'optimize-2' },
          { from: 'optimize-2', to: 'output-2' }
        ],
        variables: {
          default_platforms: ['微博', '小红书', '抖音'],
          brand_tone: '年轻活泼'
        },
        metadata: {
          category: 'social_media',
          created_from_template: 'social-media-pack',
          last_executed: '2024-08-16T14:20:00Z',
          execution_count: 12
        },
        created_at: '2024-08-12T11:15:00Z',
        updated_at: '2024-08-16T14:20:00Z'
      },
      {
        id: 'user-workflow-3',
        name: '产品文案生成器',
        description: '为电商产品生成完整的营销文案',
        version: '1.0',
        nodes: [
          {
            id: 'input-3',
            type: 'input',
            name: '产品信息',
            description: '输入产品基本信息',
            config: { input_fields: ['product_name', 'features', 'target_market'] },
            position: { x: 100, y: 100 }
          },
          {
            id: 'analyze-3',
            type: 'content_analysis',
            name: '市场分析',
            description: '分析目标市场和竞品',
            config: { analysis_type: 'market_research' },
            position: { x: 300, y: 100 }
          },
          {
            id: 'generate-3',
            type: 'text_generation',
            name: '生成文案',
            description: '生成产品描述和卖点',
            config: { 
              prompt: '为{product_name}写产品文案，突出{features}，面向{target_market}',
              max_length: 1000 
            },
            position: { x: 500, y: 100 }
          },
          {
            id: 'output-3',
            type: 'output',
            name: '输出文案',
            description: '输出最终产品文案',
            config: { output_fields: ['title', 'description', 'selling_points'] },
            position: { x: 700, y: 100 }
          }
        ],
        edges: [
          { from: 'input-3', to: 'analyze-3' },
          { from: 'analyze-3', to: 'generate-3' },
          { from: 'generate-3', to: 'output-3' }
        ],
        variables: {
          brand_style: '专业可信',
          emphasis_points: ['质量', '性价比', '用户体验']
        },
        metadata: {
          category: 'marketing',
          created_from_template: 'product-description',
          last_executed: '2024-08-14T16:45:00Z',
          execution_count: 8
        },
        created_at: '2024-08-08T13:30:00Z',
        updated_at: '2024-08-14T16:45:00Z'
      }
    ];

    // 分页处理
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedWorkflows = workflows.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      workflows: paginatedWorkflows,
      total: workflows.length,
      page,
      limit,
      metadata: {
        total_pages: Math.ceil(workflows.length / limit),
        has_next: endIndex < workflows.length,
        has_prev: page > 1,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Workflow list error:', error);
    return NextResponse.json({
      success: false,
      error: '获取工作流列表失败'
    }, { status: 500 });
  }
}
