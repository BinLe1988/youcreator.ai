import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, nodes, edges, variables, metadata } = body;

    // 验证必需字段
    if (!name || !description || !nodes || !Array.isArray(nodes)) {
      return NextResponse.json({
        success: false,
        error: '缺少必需的字段：name, description, nodes'
      }, { status: 400 });
    }

    // 验证节点
    if (nodes.length === 0) {
      return NextResponse.json({
        success: false,
        error: '工作流至少需要一个节点'
      }, { status: 400 });
    }

    // 验证节点ID唯一性
    const nodeIds = nodes.map((node: any) => node.id);
    const uniqueIds = new Set(nodeIds);
    if (nodeIds.length !== uniqueIds.size) {
      return NextResponse.json({
        success: false,
        error: '节点ID必须唯一'
      }, { status: 400 });
    }

    // 生成新的工作流ID
    const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 创建工作流对象
    const workflow = {
      id: workflowId,
      name: name.trim(),
      description: description.trim(),
      version: '1.0',
      nodes: nodes.map((node: any) => ({
        id: node.id,
        type: node.type,
        name: node.name,
        description: node.description || '',
        config: node.config || {},
        inputs: node.inputs || [],
        outputs: node.outputs || [],
        position: node.position || { x: 0, y: 0 },
        status: 'ready'
      })),
      edges: edges || [],
      variables: variables || {},
      metadata: {
        ...metadata,
        created_by: 'user',
        node_count: nodes.length,
        edge_count: (edges || []).length,
        estimated_time: estimateExecutionTime(nodes),
        complexity: calculateComplexity(nodes, edges || [])
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 这里应该保存到数据库，现在只是模拟
    console.log('Created workflow:', workflow);

    return NextResponse.json({
      success: true,
      workflow,
      message: '工作流创建成功'
    });

  } catch (error) {
    console.error('Workflow creation error:', error);
    return NextResponse.json({
      success: false,
      error: '创建工作流失败'
    }, { status: 500 });
  }
}

function estimateExecutionTime(nodes: any[]): string {
  let totalMinutes = 0;
  
  nodes.forEach(node => {
    switch (node.type) {
      case 'text_generation':
        totalMinutes += 1;
        break;
      case 'image_generation':
        totalMinutes += 2;
        break;
      case 'music_generation':
        totalMinutes += 3;
        break;
      case 'content_analysis':
      case 'content_optimization':
        totalMinutes += 0.5;
        break;
      case 'platform_publish':
        totalMinutes += 1;
        break;
      default:
        totalMinutes += 0.2;
    }
  });

  if (totalMinutes < 1) {
    return '< 1分钟';
  } else if (totalMinutes < 60) {
    return `${Math.ceil(totalMinutes)}分钟`;
  } else {
    return `${Math.ceil(totalMinutes / 60)}小时`;
  }
}

function calculateComplexity(nodes: any[], edges: any[]): 'simple' | 'medium' | 'complex' {
  const nodeCount = nodes.length;
  const edgeCount = edges.length;
  
  if (nodeCount > 10 || edgeCount > 15) {
    return 'complex';
  } else if (nodeCount > 5 || edgeCount > 8) {
    return 'medium';
  } else {
    return 'simple';
  }
}
