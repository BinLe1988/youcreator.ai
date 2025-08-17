"""
AI工作流API路由
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging
from services.workflow_engine import workflow_engine, WorkflowDefinition, WorkflowExecution, WorkflowStatus
from services.workflow_templates import WorkflowTemplates

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/workflow", tags=["workflow"])

# 请求模型
class CreateWorkflowRequest(BaseModel):
    name: str = Field(..., description="工作流名称")
    description: str = Field(..., description="工作流描述")
    nodes: List[Dict[str, Any]] = Field(..., description="工作流节点")
    edges: List[Dict[str, str]] = Field(..., description="节点连接关系")
    variables: Optional[Dict[str, Any]] = Field(default={}, description="全局变量")
    metadata: Optional[Dict[str, Any]] = Field(default={}, description="元数据")

class ExecuteWorkflowRequest(BaseModel):
    workflow_id: str = Field(..., description="工作流ID")
    input_data: Dict[str, Any] = Field(..., description="输入数据")

class WorkflowResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@router.post("/create", response_model=WorkflowResponse)
async def create_workflow(request: CreateWorkflowRequest):
    """
    创建自定义工作流
    """
    try:
        logger.info(f"Creating workflow: {request.name}")
        
        # 构建工作流定义
        workflow_def = WorkflowDefinition(
            id=f"custom_{request.name.lower().replace(' ', '_')}",
            name=request.name,
            description=request.description,
            version="1.0",
            nodes=[],  # 需要转换节点格式
            edges=request.edges,
            variables=request.variables,
            metadata=request.metadata
        )
        
        # 创建工作流
        workflow_id = workflow_engine.create_workflow(workflow_def)
        
        return WorkflowResponse(
            success=True,
            data={
                "workflow_id": workflow_id,
                "message": "工作流创建成功"
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to create workflow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/execute", response_model=WorkflowResponse)
async def execute_workflow(request: ExecuteWorkflowRequest, background_tasks: BackgroundTasks):
    """
    执行工作流
    """
    try:
        logger.info(f"Executing workflow: {request.workflow_id}")
        
        # 异步执行工作流
        execution_id = await workflow_engine.execute_workflow(
            request.workflow_id,
            request.input_data
        )
        
        return WorkflowResponse(
            success=True,
            data={
                "execution_id": execution_id,
                "status": "started",
                "message": "工作流执行已启动"
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to execute workflow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/execution/{execution_id}/status", response_model=WorkflowResponse)
async def get_execution_status(execution_id: str):
    """
    获取工作流执行状态
    """
    try:
        execution = workflow_engine.get_execution_status(execution_id)
        
        if not execution:
            raise HTTPException(status_code=404, detail="执行实例不存在")
        
        return WorkflowResponse(
            success=True,
            data={
                "execution_id": execution.id,
                "workflow_id": execution.workflow_id,
                "status": execution.status.value,
                "current_node": execution.current_node,
                "start_time": execution.start_time.isoformat() if execution.start_time else None,
                "end_time": execution.end_time.isoformat() if execution.end_time else None,
                "output_data": execution.output_data,
                "error": execution.error,
                "execution_log": execution.execution_log
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get execution status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/execution/{execution_id}/cancel", response_model=WorkflowResponse)
async def cancel_execution(execution_id: str):
    """
    取消工作流执行
    """
    try:
        success = workflow_engine.cancel_execution(execution_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="执行实例不存在或无法取消")
        
        return WorkflowResponse(
            success=True,
            data={
                "execution_id": execution_id,
                "message": "工作流执行已取消"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to cancel execution: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/templates", response_model=WorkflowResponse)
async def get_workflow_templates():
    """
    获取预定义工作流模板
    """
    try:
        templates = WorkflowTemplates.get_all_templates()
        
        template_data = []
        for template in templates:
            template_data.append({
                "id": template.id,
                "name": template.name,
                "description": template.description,
                "category": template.metadata.get("category", "general"),
                "difficulty": template.metadata.get("difficulty", "beginner"),
                "estimated_time": template.metadata.get("estimated_time", "未知"),
                "node_count": len(template.nodes),
                "version": template.version
            })
        
        return WorkflowResponse(
            success=True,
            data={
                "templates": template_data,
                "total": len(template_data)
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to get templates: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/templates/{template_id}/instantiate", response_model=WorkflowResponse)
async def instantiate_template(template_id: str):
    """
    实例化工作流模板
    """
    try:
        # 获取模板
        templates = WorkflowTemplates.get_all_templates()
        template = None
        for t in templates:
            if t.id == template_id:
                template = t
                break
        
        if not template:
            raise HTTPException(status_code=404, detail="模板不存在")
        
        # 创建工作流实例
        workflow_id = workflow_engine.create_workflow(template)
        
        return WorkflowResponse(
            success=True,
            data={
                "workflow_id": workflow_id,
                "template_id": template_id,
                "message": "模板实例化成功"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to instantiate template: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list", response_model=WorkflowResponse)
async def list_workflows():
    """
    列出所有工作流
    """
    try:
        workflows = workflow_engine.list_workflows()
        
        workflow_data = []
        for workflow in workflows:
            workflow_data.append({
                "id": workflow.id,
                "name": workflow.name,
                "description": workflow.description,
                "version": workflow.version,
                "node_count": len(workflow.nodes),
                "created_at": workflow.created_at.isoformat() if workflow.created_at else None,
                "updated_at": workflow.updated_at.isoformat() if workflow.updated_at else None,
                "metadata": workflow.metadata
            })
        
        return WorkflowResponse(
            success=True,
            data={
                "workflows": workflow_data,
                "total": len(workflow_data)
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to list workflows: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(workflow_id: str):
    """
    获取工作流详情
    """
    try:
        workflow = workflow_engine.get_workflow(workflow_id)
        
        if not workflow:
            raise HTTPException(status_code=404, detail="工作流不存在")
        
        # 转换节点数据
        nodes_data = []
        for node in workflow.nodes:
            nodes_data.append({
                "id": node.id,
                "type": node.type.value,
                "name": node.name,
                "description": node.description,
                "config": node.config,
                "inputs": node.inputs,
                "outputs": node.outputs,
                "position": node.position,
                "status": node.status.value
            })
        
        return WorkflowResponse(
            success=True,
            data={
                "id": workflow.id,
                "name": workflow.name,
                "description": workflow.description,
                "version": workflow.version,
                "nodes": nodes_data,
                "edges": workflow.edges,
                "variables": workflow.variables,
                "metadata": workflow.metadata,
                "created_at": workflow.created_at.isoformat() if workflow.created_at else None,
                "updated_at": workflow.updated_at.isoformat() if workflow.updated_at else None
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get workflow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{workflow_id}", response_model=WorkflowResponse)
async def delete_workflow(workflow_id: str):
    """
    删除工作流
    """
    try:
        success = workflow_engine.delete_workflow(workflow_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="工作流不存在")
        
        return WorkflowResponse(
            success=True,
            data={
                "workflow_id": workflow_id,
                "message": "工作流删除成功"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete workflow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/execution/{execution_id}/result", response_model=WorkflowResponse)
async def get_execution_result(execution_id: str):
    """
    获取工作流执行结果
    """
    try:
        execution = workflow_engine.get_execution_status(execution_id)
        
        if not execution:
            raise HTTPException(status_code=404, detail="执行实例不存在")
        
        if execution.status != WorkflowStatus.COMPLETED:
            return WorkflowResponse(
                success=False,
                error=f"工作流尚未完成，当前状态: {execution.status.value}"
            )
        
        return WorkflowResponse(
            success=True,
            data={
                "execution_id": execution.id,
                "workflow_id": execution.workflow_id,
                "status": execution.status.value,
                "output_data": execution.output_data,
                "execution_time": (execution.end_time - execution.start_time).total_seconds() if execution.end_time and execution.start_time else None,
                "execution_log": execution.execution_log
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get execution result: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/node-types", response_model=WorkflowResponse)
async def get_node_types():
    """
    获取支持的节点类型
    """
    try:
        node_types = []
        for node_type in NodeType:
            node_types.append({
                "type": node_type.value,
                "name": node_type.name,
                "description": get_node_type_description(node_type),
                "category": get_node_type_category(node_type)
            })
        
        return WorkflowResponse(
            success=True,
            data={
                "node_types": node_types,
                "total": len(node_types)
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to get node types: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def get_node_type_description(node_type: NodeType) -> str:
    """获取节点类型描述"""
    descriptions = {
        NodeType.INPUT: "输入节点 - 接收用户输入数据",
        NodeType.TEXT_GENERATION: "文本生成节点 - 使用AI生成文本内容",
        NodeType.IMAGE_GENERATION: "图像生成节点 - 使用AI生成图像",
        NodeType.MUSIC_GENERATION: "音乐生成节点 - 使用AI生成音乐",
        NodeType.CONTENT_ANALYSIS: "内容分析节点 - 分析内容特征",
        NodeType.CONTENT_OPTIMIZATION: "内容优化节点 - 优化内容格式",
        NodeType.PLATFORM_PUBLISH: "平台发布节点 - 发布内容到平台",
        NodeType.CONDITION: "条件判断节点 - 根据条件选择执行路径",
        NodeType.LOOP: "循环节点 - 重复执行操作",
        NodeType.MERGE: "合并节点 - 合并多个输入",
        NodeType.OUTPUT: "输出节点 - 输出最终结果"
    }
    return descriptions.get(node_type, "未知节点类型")

def get_node_type_category(node_type: NodeType) -> str:
    """获取节点类型分类"""
    categories = {
        NodeType.INPUT: "input_output",
        NodeType.OUTPUT: "input_output",
        NodeType.TEXT_GENERATION: "ai_generation",
        NodeType.IMAGE_GENERATION: "ai_generation",
        NodeType.MUSIC_GENERATION: "ai_generation",
        NodeType.CONTENT_ANALYSIS: "processing",
        NodeType.CONTENT_OPTIMIZATION: "processing",
        NodeType.PLATFORM_PUBLISH: "integration",
        NodeType.CONDITION: "control_flow",
        NodeType.LOOP: "control_flow",
        NodeType.MERGE: "control_flow"
    }
    return categories.get(node_type, "other")
