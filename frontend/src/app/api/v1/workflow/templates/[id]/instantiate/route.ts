import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;

    // 模拟模板定义
    const templates: Record<string, any> = {
      'blog-writer': {
        name: '我的博客生成器',
        description: '基于博客生成器模板创建的工作流',
        nodes: [
          {
            id: 'input-blog',
            type: 'input',
            name: '输入主题',
            description: '输入博客主题和相关信息',
            config: { 
              input_fields: ['topic', 'target_audience', 'tone', 'keywords'] 
            },
            position: { x: 100, y: 100 }
          },
          {
            id: 'generate-content',
            type: 'text_generation',
            name: '生成内容',
            description: '生成博客文章内容',
            config: {
              prompt: '写一篇关于"{topic}"的博客文章，目标读者是{target_audience}，语调为{tone}，包含关键词：{keywords}',
              max_length: 2000,
              temperature: 0.8
            },
            position: { x: 300, y: 100 }
          },
          {
            id: 'generate-image',
            type: 'image_generation',
            name: '生成配图',
            description: '为文章生成配图',
            config: {
              style: 'professional',
              width: 800,
              height: 600,
              prompt_template: '为博客文章"{topic}"生成专业配图'
            },
            position: { x: 500, y: 50 }
          },
          {
            id: 'optimize-seo',
            type: 'content_optimization',
            name: 'SEO优化',
            description: '优化文章的SEO',
            config: {
              optimization_type: 'seo',
              target_keywords: '{keywords}',
              meta_description_length: 160
            },
            position: { x: 500, y: 150 }
          },
          {
            id: 'output-blog',
            type: 'output',
            name: '输出结果',
            description: '输出最终的博客文章',
            config: { 
              output_fields: ['title', 'content', 'image_url', 'meta_description', 'tags'] 
            },
            position: { x: 700, y: 100 }
          }
        ],
        edges: [
          { from: 'input-blog', to: 'generate-content' },
          { from: 'input-blog', to: 'generate-image' },
          { from: 'generate-content', to: 'optimize-seo' },
          { from: 'optimize-seo', to: 'output-blog' },
          { from: 'generate-image', to: 'output-blog' }
        ],
        variables: {
          default_tone: '专业但易懂',
          default_audience: '技术爱好者'
        },
        metadata: {
          category: 'content_creation',
          template_id: 'blog-writer',
          instantiated_at: new Date().toISOString()
        }
      },
      'social-media-pack': {
        name: '我的社交媒体内容包',
        description: '基于社交媒体模板创建的工作流',
        nodes: [
          {
            id: 'input-social',
            type: 'input',
            name: '输入创意',
            description: '输入内容创意和平台信息',
            config: { 
              input_fields: ['idea', 'platforms', 'tone', 'target_audience'] 
            },
            position: { x: 100, y: 100 }
          },
          {
            id: 'generate-copy',
            type: 'text_generation',
            name: '生成文案',
            description: '生成社交媒体文案',
            config: {
              prompt: '为{platforms}平台创作{tone}风格的内容：{idea}，目标受众：{target_audience}',
              max_length: 500,
              temperature: 0.9
            },
            position: { x: 300, y: 50 }
          },
          {
            id: 'generate-image-social',
            type: 'image_generation',
            name: '生成配图',
            description: '生成社交媒体配图',
            config: {
              style: 'social_media',
              width: 1080,
              height: 1080,
              prompt_template: '为社交媒体内容"{idea}"生成吸引人的配图'
            },
            position: { x: 300, y: 150 }
          },
          {
            id: 'optimize-platform',
            type: 'content_optimization',
            name: '平台优化',
            description: '针对不同平台优化内容',
            config: {
              optimization_type: 'platform_specific',
              platforms: '{platforms}'
            },
            position: { x: 500, y: 100 }
          },
          {
            id: 'output-social',
            type: 'output',
            name: '输出内容',
            description: '输出优化后的社交媒体内容',
            config: { 
              output_fields: ['text', 'image_url', 'hashtags', 'posting_tips'] 
            },
            position: { x: 700, y: 100 }
          }
        ],
        edges: [
          { from: 'input-social', to: 'generate-copy' },
          { from: 'input-social', to: 'generate-image-social' },
          { from: 'generate-copy', to: 'optimize-platform' },
          { from: 'generate-image-social', to: 'optimize-platform' },
          { from: 'optimize-platform', to: 'output-social' }
        ],
        variables: {
          default_platforms: ['微博', '小红书', '抖音'],
          default_tone: '年轻活泼'
        },
        metadata: {
          category: 'social_media',
          template_id: 'social-media-pack',
          instantiated_at: new Date().toISOString()
        }
      }
    };

    const template = templates[templateId];
    if (!template) {
      return NextResponse.json({
        success: false,
        error: '模板不存在'
      }, { status: 404 });
    }

    // 生成新的工作流ID
    const workflowId = `workflow-${templateId}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    // 创建工作流实例
    const workflow = {
      id: workflowId,
      name: template.name,
      description: template.description,
      version: '1.0',
      nodes: template.nodes,
      edges: template.edges,
      variables: template.variables,
      metadata: {
        ...template.metadata,
        created_from_template: templateId,
        node_count: template.nodes.length,
        edge_count: template.edges.length
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 这里应该保存到数据库
    console.log('Instantiated workflow from template:', workflow);

    return NextResponse.json({
      success: true,
      workflow,
      message: '模板实例化成功'
    });

  } catch (error) {
    console.error('Template instantiation error:', error);
    return NextResponse.json({
      success: false,
      error: '模板实例化失败'
    }, { status: 500 });
  }
}
