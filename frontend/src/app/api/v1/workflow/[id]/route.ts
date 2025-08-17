import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = params.id;

    if (!workflowId) {
      return NextResponse.json({
        success: false,
        error: '工作流ID不能为空'
      }, { status: 400 });
    }

    // 这里应该从数据库删除工作流
    // 现在只是模拟删除操作
    console.log('Deleting workflow:', workflowId);

    return NextResponse.json({
      success: true,
      workflow_id: workflowId,
      message: '工作流删除成功'
    });

  } catch (error) {
    console.error('Workflow deletion error:', error);
    return NextResponse.json({
      success: false,
      error: '删除工作流失败'
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = params.id;

    if (!workflowId) {
      return NextResponse.json({
        success: false,
        error: '工作流ID不能为空'
      }, { status: 400 });
    }

    // 模拟获取工作流详情
    const workflow = {
      id: workflowId,
      name: '示例工作流',
      description: '这是一个示例工作流',
      version: '1.0',
      nodes: [
        {
          id: 'input-1',
          type: 'input',
          name: '输入节点',
          description: '工作流输入',
          config: { input_fields: ['text'] },
          position: { x: 100, y: 100 }
        },
        {
          id: 'output-1',
          type: 'output',
          name: '输出节点',
          description: '工作流输出',
          config: { output_fields: ['result'] },
          position: { x: 300, y: 100 }
        }
      ],
      edges: [
        { from: 'input-1', to: 'output-1' }
      ],
      variables: {},
      metadata: {
        category: 'example',
        created_by: 'user'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      workflow
    });

  } catch (error) {
    console.error('Get workflow error:', error);
    return NextResponse.json({
      success: false,
      error: '获取工作流失败'
    }, { status: 500 });
  }
}
