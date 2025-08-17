# AI工作流功能集成文档

## 功能概述

YouCreator.AI AI工作流功能提供可视化的内容生产自动化解决方案，用户可以通过拖拽式界面创建复杂的AI内容生产流程。

## 核心功能

### 1. 可视化工作流编辑器

```
节点拖拽 → 连接配置 → 参数设置 → 保存执行
```

#### 支持的节点类型
- **输入节点**: 接收用户输入数据
- **AI生成节点**: 文本生成、图像生成、音乐生成
- **内容处理节点**: 内容分析、内容优化
- **平台集成节点**: 发布到各种平台
- **流程控制节点**: 条件判断、循环、合并

### 2. 预定义工作流模板

#### 博客文章生成工作流
```
输入主题 → 生成大纲 → 写作内容 → 生成配图 → 内容优化 → 输出结果
```

#### 社交媒体内容工作流
```
输入创意 → 生成文案 → 生成配图 → 生成音乐 → 平台优化 → 发布内容
```

#### 故事创作工作流
```
故事概念 → 角色发展 → 情节创作 → 插图生成 → 配乐创作 → 整合输出
```

#### 产品营销工作流
```
产品信息 → 市场分析 → 营销文案 → 产品视觉 → 广告音乐 → 多平台发布
```

### 3. 智能执行引擎

#### 执行特性
- 并行处理：支持节点并行执行
- 依赖管理：自动处理节点依赖关系
- 错误处理：节点失败时的恢复机制
- 实时监控：执行过程可视化监控

## 技术架构

### AI服务层 (Python)

```
ai-service/
├── services/
│   ├── workflow_engine.py          # 工作流引擎核心
│   └── workflow_templates.py       # 预定义模板
└── routers/
    └── workflow.py                 # API路由
```

#### 核心组件
- **WorkflowEngine**: 工作流执行引擎
- **WorkflowNodeExecutor**: 节点执行器基类
- **WorkflowDefinition**: 工作流定义数据结构
- **WorkflowExecution**: 工作流执行实例

### 后端服务层 (Go)

```
backend/internal/
├── service/
│   └── workflow_service.go         # 工作流业务服务
└── handler/
    └── workflow_handler.go         # HTTP处理器
```

#### 主要功能
- 工作流CRUD操作
- 执行状态管理
- 模板实例化
- 批量操作支持

### 前端界面层 (React/Next.js)

```
frontend/src/
├── services/
│   └── workflowService.ts          # 前端API服务
├── components/workflow/
│   ├── WorkflowEditor.tsx          # 可视化编辑器
│   └── WorkflowExecution.tsx       # 执行监控
└── app/workflow/
    └── page.tsx                    # 工作流主页面
```

#### 核心组件
- **WorkflowEditor**: 拖拽式工作流编辑器
- **WorkflowExecution**: 实时执行监控
- **NodePalette**: 节点类型面板
- **PropertyPanel**: 节点属性编辑

## API 接口

### 1. 获取工作流模板

```http
GET /api/v1/workflow/templates
```

**响应**:
```json
{
  "success": true,
  "templates": [
    {
      "id": "blog_post_workflow",
      "name": "博客文章生成工作流",
      "description": "自动生成博客文章，包括内容、配图和优化建议",
      "category": "content_creation",
      "difficulty": "beginner",
      "estimated_time": "5-10分钟",
      "node_count": 7
    }
  ]
}
```

### 2. 实例化模板

```http
POST /api/v1/workflow/templates/{template_id}/instantiate
```

**响应**:
```json
{
  "success": true,
  "workflow": {
    "id": "workflow_123",
    "name": "博客文章生成工作流",
    "nodes": [...],
    "edges": [...]
  }
}
```

### 3. 执行工作流

```http
POST /api/v1/workflow/execute
Content-Type: application/json

{
  "workflow_id": "workflow_123",
  "input_data": {
    "topic": "AI技术发展趋势",
    "target_audience": "技术爱好者",
    "tone": "专业"
  }
}
```

**响应**:
```json
{
  "success": true,
  "execution_id": "exec_456",
  "status": "started"
}
```

### 4. 获取执行状态

```http
GET /api/v1/workflow/execution/{execution_id}/status
```

**响应**:
```json
{
  "success": true,
  "execution": {
    "id": "exec_456",
    "workflow_id": "workflow_123",
    "status": "running",
    "current_node": "generate_content",
    "start_time": "2024-01-01T10:00:00Z",
    "execution_log": [
      {
        "node_id": "input_topic",
        "node_name": "输入主题",
        "status": "completed",
        "timestamp": "2024-01-01T10:00:01Z"
      }
    ]
  }
}
```

## 工作流节点类型

### 1. 输入节点 (input)

```json
{
  "type": "input",
  "config": {
    "input_fields": ["topic", "target_audience", "tone"]
  }
}
```

### 2. 文本生成节点 (text_generation)

```json
{
  "type": "text_generation",
  "config": {
    "prompt": "为主题'{topic}'写一篇面向{target_audience}的{tone}风格文章",
    "max_length": 2000,
    "temperature": 0.8,
    "model": "gpt-3.5-turbo"
  }
}
```

### 3. 图像生成节点 (image_generation)

```json
{
  "type": "image_generation",
  "config": {
    "prompt": "为文章'{topic}'生成配图",
    "style": "professional",
    "width": 800,
    "height": 600,
    "num_inference_steps": 20
  }
}
```

### 4. 音乐生成节点 (music_generation)

```json
{
  "type": "music_generation",
  "config": {
    "description": "为内容生成背景音乐",
    "duration": 30,
    "style": "ambient",
    "temperature": 1.0
  }
}
```

### 5. 内容分析节点 (content_analysis)

```json
{
  "type": "content_analysis",
  "config": {
    "analysis_type": "comprehensive"
  }
}
```

### 6. 内容优化节点 (content_optimization)

```json
{
  "type": "content_optimization",
  "config": {
    "platform": "blog",
    "optimization_level": "high"
  }
}
```

### 7. 平台发布节点 (platform_publish)

```json
{
  "type": "platform_publish",
  "config": {
    "platform": "xiaohongshu",
    "auto_publish": false,
    "user_id": 1
  }
}
```

### 8. 条件判断节点 (condition)

```json
{
  "type": "condition",
  "config": {
    "condition": "{word_count} > 1000"
  }
}
```

## 工作流执行流程

### 1. 执行准备

```python
# 验证工作流定义
def validate_workflow(workflow: WorkflowDefinition) -> bool:
    # 检查节点配置
    # 检查连接关系
    # 检查循环依赖
    return True

# 构建依赖图
def build_dependency_graph(workflow: WorkflowDefinition) -> Dict[str, List[str]]:
    dependency_graph = {}
    for edge in workflow.edges:
        dependency_graph[edge.to].append(edge.from)
    return dependency_graph
```

### 2. 节点执行

```python
async def execute_node(node: WorkflowNode, context: Dict[str, Any]) -> Dict[str, Any]:
    executor = get_executor(node.type)
    result = await executor.execute(node, context)
    return result
```

### 3. 并行处理

```python
# 找到可并行执行的节点
ready_nodes = find_ready_nodes(workflow, executed_nodes)

# 并行执行
tasks = [execute_node(node, context) for node in ready_nodes]
results = await asyncio.gather(*tasks)
```

### 4. 错误处理

```python
try:
    result = await execute_node(node, context)
except Exception as e:
    # 记录错误
    log_error(node.id, str(e))
    # 决定是否继续执行
    if node.config.get('continue_on_error', False):
        result = get_default_result(node)
    else:
        raise WorkflowExecutionError(f"Node {node.id} failed: {e}")
```

## 前端集成示例

### 1. 使用工作流编辑器

```tsx
import WorkflowEditor from '@/components/workflow/WorkflowEditor';

function WorkflowEditorPage() {
  const handleSave = (workflow: WorkflowDefinition) => {
    console.log('Workflow saved:', workflow);
  };

  const handleExecute = (executionId: string) => {
    // 导航到执行监控页面
    router.push(`/workflow/execution/${executionId}`);
  };

  return (
    <WorkflowEditor
      onSave={handleSave}
      onExecute={handleExecute}
    />
  );
}
```

### 2. 监控工作流执行

```tsx
import WorkflowExecution from '@/components/workflow/WorkflowExecution';

function ExecutionPage({ executionId }: { executionId: string }) {
  const handleComplete = (execution: WorkflowExecution) => {
    console.log('Execution completed:', execution.output_data);
  };

  const handleError = (error: string) => {
    console.error('Execution failed:', error);
  };

  return (
    <WorkflowExecution
      executionId={executionId}
      onComplete={handleComplete}
      onError={handleError}
    />
  );
}
```

### 3. 快速创建工作流

```tsx
// 使用预定义模板快速创建
const quickWorkflow = workflowService.createQuickWorkflow('blog', {
  topic: 'AI技术趋势',
  target_audience: '技术爱好者',
  tone: '专业'
});

// 执行工作流
const executionId = await workflowService.executeWorkflow({
  workflow_id: quickWorkflow.id,
  input_data: quickWorkflow.variables
});
```

## 部署配置

### 环境变量

```bash
# 工作流引擎配置
WORKFLOW_MAX_EXECUTION_TIME=3600  # 最大执行时间(秒)
WORKFLOW_MAX_NODES=50             # 最大节点数
WORKFLOW_PARALLEL_LIMIT=5         # 并行执行限制

# 节点执行器配置
TEXT_GENERATION_TIMEOUT=300       # 文本生成超时
IMAGE_GENERATION_TIMEOUT=600      # 图像生成超时
MUSIC_GENERATION_TIMEOUT=900      # 音乐生成超时

# 存储配置
WORKFLOW_STORAGE_PATH=/app/workflows
EXECUTION_LOG_RETENTION_DAYS=30
```

### Docker配置

```dockerfile
# 在AI服务Dockerfile中添加工作流支持
RUN pip install networkx asyncio-mqtt

# 创建工作流存储目录
RUN mkdir -p /app/workflows /app/executions

# 设置工作流引擎环境变量
ENV WORKFLOW_ENGINE_ENABLED=true
ENV WORKFLOW_STORAGE_PATH=/app/workflows
```

## 性能优化

### 1. 节点执行优化

```python
# 节点结果缓存
class NodeResultCache:
    def __init__(self):
        self.cache = {}
    
    def get_cache_key(self, node: WorkflowNode, context: Dict[str, Any]) -> str:
        # 基于节点配置和输入生成缓存键
        return hashlib.md5(
            json.dumps({
                'node_config': node.config,
                'input_data': context
            }, sort_keys=True).encode()
        ).hexdigest()
    
    async def get_or_execute(self, node: WorkflowNode, context: Dict[str, Any]) -> Any:
        cache_key = self.get_cache_key(node, context)
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        result = await execute_node(node, context)
        self.cache[cache_key] = result
        return result
```

### 2. 并行执行优化

```python
# 智能并行度控制
class ParallelExecutionManager:
    def __init__(self, max_parallel: int = 5):
        self.max_parallel = max_parallel
        self.semaphore = asyncio.Semaphore(max_parallel)
    
    async def execute_with_limit(self, node: WorkflowNode, context: Dict[str, Any]) -> Any:
        async with self.semaphore:
            return await execute_node(node, context)
```

### 3. 内存管理

```python
# 大数据处理优化
class StreamingDataProcessor:
    def __init__(self):
        self.temp_storage = {}
    
    async def process_large_data(self, data: Any) -> str:
        # 将大数据存储到临时文件
        temp_id = str(uuid.uuid4())
        temp_path = f"/tmp/workflow_data_{temp_id}"
        
        with open(temp_path, 'wb') as f:
            pickle.dump(data, f)
        
        self.temp_storage[temp_id] = temp_path
        return temp_id
    
    def cleanup_temp_data(self, temp_id: str):
        if temp_id in self.temp_storage:
            os.remove(self.temp_storage[temp_id])
            del self.temp_storage[temp_id]
```

## 监控和日志

### 1. 执行监控

```python
# 执行指标收集
class WorkflowMetrics:
    def __init__(self):
        self.execution_times = {}
        self.success_rates = {}
        self.error_counts = {}
    
    def record_execution(self, workflow_id: str, execution_time: float, success: bool):
        if workflow_id not in self.execution_times:
            self.execution_times[workflow_id] = []
        self.execution_times[workflow_id].append(execution_time)
        
        if not success:
            self.error_counts[workflow_id] = self.error_counts.get(workflow_id, 0) + 1
    
    def get_average_execution_time(self, workflow_id: str) -> float:
        times = self.execution_times.get(workflow_id, [])
        return sum(times) / len(times) if times else 0
```

### 2. 详细日志

```python
# 结构化日志记录
import structlog

logger = structlog.get_logger()

async def execute_workflow_with_logging(workflow_id: str, input_data: Dict[str, Any]) -> str:
    execution_id = str(uuid.uuid4())
    
    logger.info(
        "workflow_execution_started",
        workflow_id=workflow_id,
        execution_id=execution_id,
        input_data_keys=list(input_data.keys())
    )
    
    try:
        # 执行工作流
        result = await execute_workflow(workflow_id, input_data)
        
        logger.info(
            "workflow_execution_completed",
            workflow_id=workflow_id,
            execution_id=execution_id,
            output_data_keys=list(result.keys()) if result else []
        )
        
        return execution_id
        
    except Exception as e:
        logger.error(
            "workflow_execution_failed",
            workflow_id=workflow_id,
            execution_id=execution_id,
            error=str(e),
            error_type=type(e).__name__
        )
        raise
```

## 安全考虑

### 1. 输入验证

```python
# 节点配置验证
def validate_node_config(node_type: str, config: Dict[str, Any]) -> bool:
    validators = {
        'text_generation': validate_text_generation_config,
        'image_generation': validate_image_generation_config,
        'platform_publish': validate_platform_publish_config
    }
    
    validator = validators.get(node_type)
    if validator:
        return validator(config)
    
    return True

def validate_text_generation_config(config: Dict[str, Any]) -> bool:
    # 检查提示词长度
    if len(config.get('prompt', '')) > 10000:
        raise ValueError("Prompt too long")
    
    # 检查参数范围
    if not 0.1 <= config.get('temperature', 1.0) <= 2.0:
        raise ValueError("Invalid temperature value")
    
    return True
```

### 2. 资源限制

```python
# 执行资源限制
class ResourceLimiter:
    def __init__(self):
        self.max_execution_time = 3600  # 1小时
        self.max_memory_usage = 2 * 1024 * 1024 * 1024  # 2GB
        self.max_output_size = 100 * 1024 * 1024  # 100MB
    
    async def execute_with_limits(self, node: WorkflowNode, context: Dict[str, Any]) -> Any:
        # 设置执行超时
        try:
            result = await asyncio.wait_for(
                execute_node(node, context),
                timeout=self.max_execution_time
            )
            
            # 检查输出大小
            if sys.getsizeof(result) > self.max_output_size:
                raise ValueError("Output size exceeds limit")
            
            return result
            
        except asyncio.TimeoutError:
            raise WorkflowExecutionError("Node execution timeout")
```

### 3. 权限控制

```python
# 用户权限检查
def check_workflow_permissions(user_id: int, workflow_id: str, action: str) -> bool:
    # 检查用户是否有权限执行特定操作
    permissions = get_user_permissions(user_id)
    workflow_owner = get_workflow_owner(workflow_id)
    
    if action == 'execute':
        return user_id == workflow_owner or 'workflow_execute' in permissions
    elif action == 'edit':
        return user_id == workflow_owner or 'workflow_edit' in permissions
    elif action == 'delete':
        return user_id == workflow_owner or 'workflow_admin' in permissions
    
    return False
```

## 故障排除

### 常见问题

1. **工作流执行卡住**
   - 检查节点依赖关系是否正确
   - 查看是否存在循环依赖
   - 检查节点执行超时设置

2. **节点执行失败**
   - 查看节点配置是否正确
   - 检查输入数据格式
   - 查看执行日志中的错误信息

3. **内存不足**
   - 减少并行执行的节点数量
   - 优化大数据处理逻辑
   - 增加服务器内存配置

4. **执行时间过长**
   - 优化节点执行逻辑
   - 启用结果缓存
   - 调整超时设置

### 调试工具

```bash
# 查看工作流执行日志
docker-compose logs -f ai-service | grep workflow

# 查看执行状态
curl http://localhost:8000/api/v1/workflow/execution/{execution_id}/status

# 取消长时间运行的执行
curl -X POST http://localhost:8000/api/v1/workflow/execution/{execution_id}/cancel
```

## 扩展开发

### 1. 自定义节点类型

```python
class CustomNodeExecutor(WorkflowNodeExecutor):
    async def execute(self, node: WorkflowNode, context: Dict[str, Any]) -> Any:
        # 实现自定义逻辑
        config = node.config
        input_data = context.get('input_data', {})
        
        # 处理逻辑
        result = await self.process_data(input_data, config)
        
        return {
            'output': result,
            'metadata': {
                'processed_at': datetime.now().isoformat(),
                'node_type': 'custom'
            }
        }
    
    def validate_config(self, config: Dict[str, Any]) -> bool:
        # 验证配置
        required_fields = ['param1', 'param2']
        return all(field in config for field in required_fields)

# 注册自定义执行器
workflow_engine.register_executor(NodeType.CUSTOM, CustomNodeExecutor())
```

### 2. 集成外部服务

```python
class ExternalServiceExecutor(WorkflowNodeExecutor):
    def __init__(self, api_client):
        self.api_client = api_client
    
    async def execute(self, node: WorkflowNode, context: Dict[str, Any]) -> Any:
        config = node.config
        
        # 调用外部API
        response = await self.api_client.call_api(
            endpoint=config['endpoint'],
            method=config['method'],
            data=context
        )
        
        return {
            'response': response,
            'status_code': response.status_code
        }
```

这个完整的AI工作流系统为YouCreator.AI平台提供了强大的自动化内容生产能力，用户可以通过可视化界面创建复杂的AI工作流，实现从创意到发布的全自动化流程！
