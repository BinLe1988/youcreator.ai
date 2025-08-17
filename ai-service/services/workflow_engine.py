"""
AI工作流引擎 - 智能内容生产工作流
"""
import asyncio
import json
import logging
import uuid
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, asdict
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

class WorkflowStatus(Enum):
    """工作流状态"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    PAUSED = "paused"

class NodeType(Enum):
    """节点类型"""
    INPUT = "input"
    TEXT_GENERATION = "text_generation"
    IMAGE_GENERATION = "image_generation"
    MUSIC_GENERATION = "music_generation"
    CONTENT_ANALYSIS = "content_analysis"
    CONTENT_OPTIMIZATION = "content_optimization"
    PLATFORM_PUBLISH = "platform_publish"
    CONDITION = "condition"
    LOOP = "loop"
    MERGE = "merge"
    OUTPUT = "output"

@dataclass
class WorkflowNode:
    """工作流节点"""
    id: str
    type: NodeType
    name: str
    description: str
    config: Dict[str, Any]
    inputs: List[str] = None  # 输入节点ID列表
    outputs: List[str] = None  # 输出节点ID列表
    position: Dict[str, int] = None  # 节点在画布上的位置
    status: WorkflowStatus = WorkflowStatus.PENDING
    result: Any = None
    error: str = None
    start_time: datetime = None
    end_time: datetime = None

    def __post_init__(self):
        if self.inputs is None:
            self.inputs = []
        if self.outputs is None:
            self.outputs = []
        if self.position is None:
            self.position = {"x": 0, "y": 0}

@dataclass
class WorkflowDefinition:
    """工作流定义"""
    id: str
    name: str
    description: str
    version: str
    nodes: List[WorkflowNode]
    edges: List[Dict[str, str]]  # 连接关系 [{"from": "node1", "to": "node2"}]
    variables: Dict[str, Any] = None  # 全局变量
    metadata: Dict[str, Any] = None
    created_at: datetime = None
    updated_at: datetime = None

    def __post_init__(self):
        if self.variables is None:
            self.variables = {}
        if self.metadata is None:
            self.metadata = {}
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.updated_at is None:
            self.updated_at = datetime.now()

@dataclass
class WorkflowExecution:
    """工作流执行实例"""
    id: str
    workflow_id: str
    status: WorkflowStatus
    input_data: Dict[str, Any]
    output_data: Dict[str, Any] = None
    current_node: str = None
    execution_log: List[Dict[str, Any]] = None
    start_time: datetime = None
    end_time: datetime = None
    error: str = None

    def __post_init__(self):
        if self.output_data is None:
            self.output_data = {}
        if self.execution_log is None:
            self.execution_log = []
        if self.start_time is None:
            self.start_time = datetime.now()

class WorkflowNodeExecutor(ABC):
    """工作流节点执行器基类"""
    
    @abstractmethod
    async def execute(self, node: WorkflowNode, context: Dict[str, Any]) -> Any:
        """执行节点"""
        pass
    
    @abstractmethod
    def validate_config(self, config: Dict[str, Any]) -> bool:
        """验证节点配置"""
        pass

class TextGenerationExecutor(WorkflowNodeExecutor):
    """文本生成节点执行器"""
    
    def __init__(self, text_service):
        self.text_service = text_service
    
    async def execute(self, node: WorkflowNode, context: Dict[str, Any]) -> Any:
        """执行文本生成"""
        config = node.config
        prompt = config.get("prompt", "")
        
        # 支持模板变量替换
        for key, value in context.items():
            prompt = prompt.replace(f"{{{key}}}", str(value))
        
        # 调用文本生成服务
        result = await self.text_service.generate_text(
            prompt=prompt,
            max_length=config.get("max_length", 500),
            temperature=config.get("temperature", 0.7),
            model=config.get("model", "default")
        )
        
        return {
            "text": result.get("text", ""),
            "prompt": prompt,
            "model": config.get("model", "default"),
            "metadata": result.get("metadata", {})
        }
    
    def validate_config(self, config: Dict[str, Any]) -> bool:
        """验证配置"""
        return "prompt" in config

class ImageGenerationExecutor(WorkflowNodeExecutor):
    """图像生成节点执行器"""
    
    def __init__(self, image_service):
        self.image_service = image_service
    
    async def execute(self, node: WorkflowNode, context: Dict[str, Any]) -> Any:
        """执行图像生成"""
        config = node.config
        prompt = config.get("prompt", "")
        
        # 支持从上下文获取提示词
        if not prompt and "text" in context:
            prompt = context["text"]
        
        # 模板变量替换
        for key, value in context.items():
            if isinstance(value, str):
                prompt = prompt.replace(f"{{{key}}}", value)
        
        # 调用图像生成服务
        result = await self.image_service.generate_image(
            prompt=prompt,
            style=config.get("style", "realistic"),
            width=config.get("width", 512),
            height=config.get("height", 512),
            num_inference_steps=config.get("num_inference_steps", 20)
        )
        
        return {
            "image_url": result.get("image", ""),
            "prompt": prompt,
            "style": config.get("style", "realistic"),
            "dimensions": result.get("dimensions", {}),
            "metadata": result.get("metadata", {})
        }
    
    def validate_config(self, config: Dict[str, Any]) -> bool:
        """验证配置"""
        return True  # 图像生成可以使用默认配置

class MusicGenerationExecutor(WorkflowNodeExecutor):
    """音乐生成节点执行器"""
    
    def __init__(self, music_service):
        self.music_service = music_service
    
    async def execute(self, node: WorkflowNode, context: Dict[str, Any]) -> Any:
        """执行音乐生成"""
        config = node.config
        description = config.get("description", "")
        
        # 支持从上下文获取描述
        if not description and "text" in context:
            description = context["text"]
        
        # 模板变量替换
        for key, value in context.items():
            if isinstance(value, str):
                description = description.replace(f"{{{key}}}", value)
        
        # 调用音乐生成服务
        result = await self.music_service.generate_music(
            description=description,
            duration=config.get("duration", 10),
            temperature=config.get("temperature", 1.0),
            style=config.get("style", "ambient")
        )
        
        return {
            "audio_url": result.get("audio", ""),
            "description": description,
            "duration": config.get("duration", 10),
            "style": config.get("style", "ambient"),
            "metadata": result.get("metadata", {})
        }
    
    def validate_config(self, config: Dict[str, Any]) -> bool:
        """验证配置"""
        return True  # 音乐生成可以使用默认配置

class ContentAnalysisExecutor(WorkflowNodeExecutor):
    """内容分析节点执行器"""
    
    def __init__(self, analysis_service):
        self.analysis_service = analysis_service
    
    async def execute(self, node: WorkflowNode, context: Dict[str, Any]) -> Any:
        """执行内容分析"""
        config = node.config
        content = config.get("content", "")
        
        # 从上下文获取内容
        if not content and "text" in context:
            content = context["text"]
        
        # 调用内容分析服务
        result = await self.analysis_service.analyze_content(
            content=content,
            analysis_type=config.get("analysis_type", "comprehensive")
        )
        
        return {
            "theme": result.get("theme", ""),
            "mood": result.get("mood", ""),
            "keywords": result.get("keywords", []),
            "sentiment": result.get("sentiment", "neutral"),
            "topics": result.get("topics", []),
            "metadata": result.get("metadata", {})
        }
    
    def validate_config(self, config: Dict[str, Any]) -> bool:
        """验证配置"""
        return True

class ContentOptimizationExecutor(WorkflowNodeExecutor):
    """内容优化节点执行器"""
    
    def __init__(self, optimization_service):
        self.optimization_service = optimization_service
    
    async def execute(self, node: WorkflowNode, context: Dict[str, Any]) -> Any:
        """执行内容优化"""
        config = node.config
        platform = config.get("platform", "xiaohongshu")
        
        # 从上下文获取内容
        content = {
            "title": context.get("title", ""),
            "text": context.get("text", ""),
            "image_url": context.get("image_url", ""),
            "audio_url": context.get("audio_url", ""),
            "theme": context.get("theme", ""),
            "mood": context.get("mood", "")
        }
        
        # 调用内容优化服务
        result = await self.optimization_service.optimize_content(
            content=content,
            platform=platform,
            optimization_level=config.get("optimization_level", "standard")
        )
        
        return {
            "optimized_title": result.get("title", ""),
            "optimized_content": result.get("content", ""),
            "suggested_tags": result.get("tags", []),
            "optimization_tips": result.get("tips", []),
            "metadata": result.get("metadata", {})
        }
    
    def validate_config(self, config: Dict[str, Any]) -> bool:
        """验证配置"""
        return "platform" in config

class PlatformPublishExecutor(WorkflowNodeExecutor):
    """平台发布节点执行器"""
    
    def __init__(self, publish_service):
        self.publish_service = publish_service
    
    async def execute(self, node: WorkflowNode, context: Dict[str, Any]) -> Any:
        """执行平台发布"""
        config = node.config
        platform = config.get("platform", "xiaohongshu")
        
        # 构建发布内容
        publish_content = {
            "title": context.get("optimized_title", context.get("title", "")),
            "content": context.get("optimized_content", context.get("text", "")),
            "images": [context.get("image_url")] if context.get("image_url") else [],
            "audio_url": context.get("audio_url", ""),
            "tags": context.get("suggested_tags", []),
            "platform_config": config.get("platform_config", {})
        }
        
        # 调用发布服务
        result = await self.publish_service.publish_content(
            platform=platform,
            content=publish_content,
            user_id=config.get("user_id", 1)
        )
        
        return {
            "published": result.get("success", False),
            "post_id": result.get("post_id", ""),
            "post_url": result.get("post_url", ""),
            "platform": platform,
            "metadata": result.get("metadata", {})
        }
    
    def validate_config(self, config: Dict[str, Any]) -> bool:
        """验证配置"""
        return "platform" in config

class ConditionExecutor(WorkflowNodeExecutor):
    """条件判断节点执行器"""
    
    async def execute(self, node: WorkflowNode, context: Dict[str, Any]) -> Any:
        """执行条件判断"""
        config = node.config
        condition = config.get("condition", "")
        
        # 简单的条件判断逻辑
        try:
            # 替换上下文变量
            for key, value in context.items():
                condition = condition.replace(f"{{{key}}}", str(value))
            
            # 评估条件
            result = eval(condition)
            
            return {
                "condition_result": bool(result),
                "condition": condition,
                "next_path": "true" if result else "false"
            }
        except Exception as e:
            logger.error(f"Condition evaluation failed: {e}")
            return {
                "condition_result": False,
                "condition": condition,
                "next_path": "false",
                "error": str(e)
            }
    
    def validate_config(self, config: Dict[str, Any]) -> bool:
        """验证配置"""
        return "condition" in config

class WorkflowEngine:
    """AI工作流引擎"""
    
    def __init__(self):
        self.executors: Dict[NodeType, WorkflowNodeExecutor] = {}
        self.workflows: Dict[str, WorkflowDefinition] = {}
        self.executions: Dict[str, WorkflowExecution] = {}
        self.running_executions: Dict[str, asyncio.Task] = {}
    
    def register_executor(self, node_type: NodeType, executor: WorkflowNodeExecutor):
        """注册节点执行器"""
        self.executors[node_type] = executor
        logger.info(f"Registered executor for node type: {node_type}")
    
    def create_workflow(self, definition: WorkflowDefinition) -> str:
        """创建工作流"""
        # 验证工作流定义
        if not self._validate_workflow(definition):
            raise ValueError("Invalid workflow definition")
        
        self.workflows[definition.id] = definition
        logger.info(f"Created workflow: {definition.name} ({definition.id})")
        return definition.id
    
    def _validate_workflow(self, definition: WorkflowDefinition) -> bool:
        """验证工作流定义"""
        # 检查节点配置
        for node in definition.nodes:
            if node.type in self.executors:
                executor = self.executors[node.type]
                if not executor.validate_config(node.config):
                    logger.error(f"Invalid config for node {node.id}")
                    return False
        
        # 检查连接关系
        node_ids = {node.id for node in definition.nodes}
        for edge in definition.edges:
            if edge["from"] not in node_ids or edge["to"] not in node_ids:
                logger.error(f"Invalid edge: {edge}")
                return False
        
        return True
    
    async def execute_workflow(self, workflow_id: str, input_data: Dict[str, Any]) -> str:
        """执行工作流"""
        if workflow_id not in self.workflows:
            raise ValueError(f"Workflow not found: {workflow_id}")
        
        # 创建执行实例
        execution_id = str(uuid.uuid4())
        execution = WorkflowExecution(
            id=execution_id,
            workflow_id=workflow_id,
            status=WorkflowStatus.PENDING,
            input_data=input_data
        )
        
        self.executions[execution_id] = execution
        
        # 异步执行工作流
        task = asyncio.create_task(self._run_workflow(execution))
        self.running_executions[execution_id] = task
        
        logger.info(f"Started workflow execution: {execution_id}")
        return execution_id
    
    async def _run_workflow(self, execution: WorkflowExecution):
        """运行工作流"""
        try:
            execution.status = WorkflowStatus.RUNNING
            workflow = self.workflows[execution.workflow_id]
            
            # 构建执行上下文
            context = execution.input_data.copy()
            
            # 构建节点依赖图
            dependency_graph = self._build_dependency_graph(workflow)
            
            # 按拓扑顺序执行节点
            executed_nodes = set()
            
            while len(executed_nodes) < len(workflow.nodes):
                # 找到可以执行的节点（所有依赖都已执行）
                ready_nodes = []
                for node in workflow.nodes:
                    if node.id not in executed_nodes:
                        dependencies = dependency_graph.get(node.id, [])
                        if all(dep in executed_nodes for dep in dependencies):
                            ready_nodes.append(node)
                
                if not ready_nodes:
                    raise RuntimeError("Circular dependency detected or no ready nodes")
                
                # 并行执行准备好的节点
                tasks = []
                for node in ready_nodes:
                    task = asyncio.create_task(self._execute_node(node, context, execution))
                    tasks.append((node, task))
                
                # 等待所有任务完成
                for node, task in tasks:
                    try:
                        result = await task
                        context.update(result)
                        executed_nodes.add(node.id)
                        
                        # 记录执行日志
                        execution.execution_log.append({
                            "node_id": node.id,
                            "node_name": node.name,
                            "status": "completed",
                            "result": result,
                            "timestamp": datetime.now().isoformat()
                        })
                        
                    except Exception as e:
                        logger.error(f"Node execution failed: {node.id}, error: {e}")
                        execution.execution_log.append({
                            "node_id": node.id,
                            "node_name": node.name,
                            "status": "failed",
                            "error": str(e),
                            "timestamp": datetime.now().isoformat()
                        })
                        raise
            
            # 工作流执行完成
            execution.status = WorkflowStatus.COMPLETED
            execution.output_data = context
            execution.end_time = datetime.now()
            
            logger.info(f"Workflow execution completed: {execution.id}")
            
        except Exception as e:
            execution.status = WorkflowStatus.FAILED
            execution.error = str(e)
            execution.end_time = datetime.now()
            logger.error(f"Workflow execution failed: {execution.id}, error: {e}")
        
        finally:
            # 清理运行中的任务
            if execution.id in self.running_executions:
                del self.running_executions[execution.id]
    
    def _build_dependency_graph(self, workflow: WorkflowDefinition) -> Dict[str, List[str]]:
        """构建节点依赖图"""
        dependency_graph = {}
        
        # 初始化所有节点
        for node in workflow.nodes:
            dependency_graph[node.id] = []
        
        # 根据边构建依赖关系
        for edge in workflow.edges:
            from_node = edge["from"]
            to_node = edge["to"]
            dependency_graph[to_node].append(from_node)
        
        return dependency_graph
    
    async def _execute_node(self, node: WorkflowNode, context: Dict[str, Any], execution: WorkflowExecution) -> Dict[str, Any]:
        """执行单个节点"""
        execution.current_node = node.id
        node.status = WorkflowStatus.RUNNING
        node.start_time = datetime.now()
        
        try:
            if node.type in self.executors:
                executor = self.executors[node.type]
                result = await executor.execute(node, context)
                
                node.status = WorkflowStatus.COMPLETED
                node.result = result
                node.end_time = datetime.now()
                
                return result
            else:
                raise ValueError(f"No executor found for node type: {node.type}")
                
        except Exception as e:
            node.status = WorkflowStatus.FAILED
            node.error = str(e)
            node.end_time = datetime.now()
            raise
    
    def get_execution_status(self, execution_id: str) -> Optional[WorkflowExecution]:
        """获取执行状态"""
        return self.executions.get(execution_id)
    
    def cancel_execution(self, execution_id: str) -> bool:
        """取消执行"""
        if execution_id in self.running_executions:
            task = self.running_executions[execution_id]
            task.cancel()
            
            if execution_id in self.executions:
                self.executions[execution_id].status = WorkflowStatus.CANCELLED
                self.executions[execution_id].end_time = datetime.now()
            
            return True
        return False
    
    def list_workflows(self) -> List[WorkflowDefinition]:
        """列出所有工作流"""
        return list(self.workflows.values())
    
    def get_workflow(self, workflow_id: str) -> Optional[WorkflowDefinition]:
        """获取工作流定义"""
        return self.workflows.get(workflow_id)
    
    def delete_workflow(self, workflow_id: str) -> bool:
        """删除工作流"""
        if workflow_id in self.workflows:
            del self.workflows[workflow_id]
            return True
        return False

# 全局工作流引擎实例
workflow_engine = WorkflowEngine()
