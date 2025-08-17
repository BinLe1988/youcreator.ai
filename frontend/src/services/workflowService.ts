/**
 * AI工作流服务
 */

import { apiClient } from './apiClient';

// 类型定义
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  estimated_time: string;
  node_count: number;
  version: string;
  metadata?: Record<string, any>;
}

export interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  description: string;
  config: Record<string, any>;
  inputs?: string[];
  outputs?: string[];
  position?: { x: number; y: number };
  status?: string;
}

export interface WorkflowEdge {
  from: string;
  to: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  current_node?: string;
  input_data: Record<string, any>;
  output_data?: Record<string, any>;
  start_time?: string;
  end_time?: string;
  error?: string;
  execution_log?: ExecutionLogEntry[];
}

export interface ExecutionLogEntry {
  node_id: string;
  node_name: string;
  status: string;
  result?: Record<string, any>;
  error?: string;
  timestamp: string;
}

export interface CreateWorkflowRequest {
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface ExecuteWorkflowRequest {
  workflow_id: string;
  input_data: Record<string, any>;
}

export interface NodeType {
  type: string;
  name: string;
  description: string;
  category: string;
  config_schema?: Record<string, any>;
}

class WorkflowService {
  private baseURL = '/api/v1/workflow';

  /**
   * 获取工作流模板列表
   */
  async getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        templates: WorkflowTemplate[];
        total: number;
      }>(`${this.baseURL}/templates`);
      
      return response.data.templates;
    } catch (error) {
      console.error('Failed to get workflow templates:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 实例化工作流模板
   */
  async instantiateTemplate(templateId: string): Promise<WorkflowDefinition> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        workflow: WorkflowDefinition;
        message: string;
      }>(`${this.baseURL}/templates/${templateId}/instantiate`);
      
      return response.data.workflow;
    } catch (error) {
      console.error('Failed to instantiate template:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 创建自定义工作流
   */
  async createWorkflow(request: CreateWorkflowRequest): Promise<WorkflowDefinition> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        workflow: WorkflowDefinition;
        message: string;
      }>(`${this.baseURL}/create`, request);
      
      return response.data.workflow;
    } catch (error) {
      console.error('Failed to create workflow:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 执行工作流
   */
  async executeWorkflow(request: ExecuteWorkflowRequest): Promise<string> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        execution_id: string;
        status: string;
        message: string;
      }>(`${this.baseURL}/execute`, request);
      
      return response.data.execution_id;
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 获取执行状态
   */
  async getExecutionStatus(executionId: string): Promise<WorkflowExecution> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        execution: WorkflowExecution;
      }>(`${this.baseURL}/execution/${executionId}/status`);
      
      return response.data.execution;
    } catch (error) {
      console.error('Failed to get execution status:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 取消执行
   */
  async cancelExecution(executionId: string): Promise<void> {
    try {
      await apiClient.post<{
        success: boolean;
        execution_id: string;
        message: string;
      }>(`${this.baseURL}/execution/${executionId}/cancel`);
    } catch (error) {
      console.error('Failed to cancel execution:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 获取工作流详情
   */
  async getWorkflow(workflowId: string): Promise<WorkflowDefinition> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        workflow: WorkflowDefinition;
      }>(`${this.baseURL}/${workflowId}`);
      
      return response.data.workflow;
    } catch (error) {
      console.error('Failed to get workflow:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 列出工作流
   */
  async listWorkflows(page: number = 1, limit: number = 10): Promise<{
    workflows: WorkflowDefinition[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        workflows: WorkflowDefinition[];
        total: number;
        page: number;
        limit: number;
      }>(`${this.baseURL}/list`, {
        params: { page, limit }
      });
      
      return {
        workflows: response.data.workflows,
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit
      };
    } catch (error) {
      console.error('Failed to list workflows:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 删除工作流
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    try {
      await apiClient.delete<{
        success: boolean;
        workflow_id: string;
        message: string;
      }>(`${this.baseURL}/${workflowId}`);
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 获取支持的节点类型
   */
  async getNodeTypes(): Promise<NodeType[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        node_types: NodeType[];
        total: number;
      }>(`${this.baseURL}/node-types`);
      
      return response.data.node_types;
    } catch (error) {
      console.error('Failed to get node types:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 轮询执行状态直到完成
   */
  async pollExecutionStatus(
    executionId: string,
    onProgress?: (execution: WorkflowExecution) => void,
    interval: number = 2000
  ): Promise<WorkflowExecution> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const execution = await this.getExecutionStatus(executionId);
          
          if (onProgress) {
            onProgress(execution);
          }

          if (execution.status === 'completed' || execution.status === 'failed' || execution.status === 'cancelled') {
            resolve(execution);
          } else {
            setTimeout(poll, interval);
          }
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  /**
   * 验证工作流定义
   */
  validateWorkflow(workflow: Partial<WorkflowDefinition>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!workflow.name || workflow.name.trim().length === 0) {
      errors.push('工作流名称不能为空');
    }

    if (!workflow.description || workflow.description.trim().length === 0) {
      errors.push('工作流描述不能为空');
    }

    if (!workflow.nodes || workflow.nodes.length === 0) {
      errors.push('工作流至少需要一个节点');
    }

    if (workflow.nodes) {
      // 检查节点ID唯一性
      const nodeIds = workflow.nodes.map(node => node.id);
      const uniqueIds = new Set(nodeIds);
      if (nodeIds.length !== uniqueIds.size) {
        errors.push('节点ID必须唯一');
      }

      // 检查必要字段
      workflow.nodes.forEach((node, index) => {
        if (!node.id) {
          errors.push(`节点 ${index + 1} 缺少ID`);
        }
        if (!node.type) {
          errors.push(`节点 ${node.id || index + 1} 缺少类型`);
        }
        if (!node.name) {
          errors.push(`节点 ${node.id || index + 1} 缺少名称`);
        }
      });
    }

    if (workflow.edges) {
      const nodeIds = new Set(workflow.nodes?.map(node => node.id) || []);
      workflow.edges.forEach((edge, index) => {
        if (!nodeIds.has(edge.from)) {
          errors.push(`连接 ${index + 1} 的源节点不存在: ${edge.from}`);
        }
        if (!nodeIds.has(edge.to)) {
          errors.push(`连接 ${index + 1} 的目标节点不存在: ${edge.to}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 生成工作流预览数据
   */
  generateWorkflowPreview(workflow: WorkflowDefinition): {
    nodeCount: number;
    edgeCount: number;
    categories: string[];
    estimatedTime: string;
    complexity: 'simple' | 'medium' | 'complex';
  } {
    const nodeCount = workflow.nodes.length;
    const edgeCount = workflow.edges.length;
    
    // 统计节点类型分类
    const categories = [...new Set(workflow.nodes.map(node => {
      const categoryMap: Record<string, string> = {
        'input': '输入输出',
        'output': '输入输出',
        'text_generation': 'AI生成',
        'image_generation': 'AI生成',
        'music_generation': 'AI生成',
        'content_analysis': '内容处理',
        'content_optimization': '内容处理',
        'platform_publish': '平台集成',
        'condition': '流程控制',
        'loop': '流程控制',
        'merge': '流程控制'
      };
      return categoryMap[node.type] || '其他';
    }))];

    // 估算执行时间
    let estimatedMinutes = 0;
    workflow.nodes.forEach(node => {
      switch (node.type) {
        case 'text_generation':
          estimatedMinutes += 1;
          break;
        case 'image_generation':
          estimatedMinutes += 2;
          break;
        case 'music_generation':
          estimatedMinutes += 3;
          break;
        case 'content_analysis':
        case 'content_optimization':
          estimatedMinutes += 0.5;
          break;
        case 'platform_publish':
          estimatedMinutes += 1;
          break;
        default:
          estimatedMinutes += 0.2;
      }
    });

    const estimatedTime = estimatedMinutes < 1 
      ? '< 1分钟' 
      : estimatedMinutes < 60 
        ? `${Math.ceil(estimatedMinutes)}分钟`
        : `${Math.ceil(estimatedMinutes / 60)}小时`;

    // 判断复杂度
    let complexity: 'simple' | 'medium' | 'complex' = 'simple';
    if (nodeCount > 10 || edgeCount > 15) {
      complexity = 'complex';
    } else if (nodeCount > 5 || edgeCount > 8) {
      complexity = 'medium';
    }

    return {
      nodeCount,
      edgeCount,
      categories,
      estimatedTime,
      complexity
    };
  }

  /**
   * 创建快速工作流
   */
  createQuickWorkflow(type: 'blog' | 'social' | 'story' | 'marketing', params: Record<string, any>): CreateWorkflowRequest {
    const baseWorkflows = {
      blog: {
        name: '博客文章生成',
        description: '自动生成博客文章，包括内容、配图和优化建议',
        nodes: [
          {
            id: 'input',
            type: 'input',
            name: '输入主题',
            description: '输入博客主题',
            config: { input_fields: ['topic', 'target_audience', 'tone'] },
            position: { x: 100, y: 100 }
          },
          {
            id: 'generate_content',
            type: 'text_generation',
            name: '生成内容',
            description: '生成博客内容',
            config: {
              prompt: '为主题"{topic}"写一篇面向{target_audience}的{tone}风格博客文章',
              max_length: 2000,
              temperature: 0.8
            },
            position: { x: 300, y: 100 }
          },
          {
            id: 'generate_image',
            type: 'image_generation',
            name: '生成配图',
            description: '生成文章配图',
            config: {
              style: 'professional',
              width: 800,
              height: 600
            },
            position: { x: 500, y: 100 }
          },
          {
            id: 'optimize',
            type: 'content_optimization',
            name: '内容优化',
            description: '优化文章内容',
            config: {
              platform: 'blog',
              optimization_level: 'high'
            },
            position: { x: 700, y: 100 }
          },
          {
            id: 'output',
            type: 'output',
            name: '输出结果',
            description: '输出最终结果',
            config: { output_fields: ['optimized_content', 'image_url', 'suggested_tags'] },
            position: { x: 900, y: 100 }
          }
        ],
        edges: [
          { from: 'input', to: 'generate_content' },
          { from: 'input', to: 'generate_image' },
          { from: 'generate_content', to: 'optimize' },
          { from: 'optimize', to: 'output' },
          { from: 'generate_image', to: 'output' }
        ]
      },
      social: {
        name: '社交媒体内容',
        description: '生成社交媒体内容，包括文案、配图和音乐',
        nodes: [
          {
            id: 'input',
            type: 'input',
            name: '输入创意',
            description: '输入创意想法',
            config: { input_fields: ['idea', 'platform', 'style'] },
            position: { x: 100, y: 100 }
          },
          {
            id: 'generate_copy',
            type: 'text_generation',
            name: '生成文案',
            description: '生成社交媒体文案',
            config: {
              prompt: '为{platform}平台创作关于"{idea}"的{style}风格文案',
              max_length: 500,
              temperature: 0.9
            },
            position: { x: 300, y: 50 }
          },
          {
            id: 'generate_image',
            type: 'image_generation',
            name: '生成配图',
            description: '生成配图',
            config: {
              style: 'social_media',
              width: 1080,
              height: 1080
            },
            position: { x: 300, y: 150 }
          },
          {
            id: 'generate_music',
            type: 'music_generation',
            name: '生成音乐',
            description: '生成背景音乐',
            config: {
              duration: 15,
              style: 'upbeat'
            },
            position: { x: 300, y: 250 }
          },
          {
            id: 'optimize',
            type: 'content_optimization',
            name: '平台优化',
            description: '针对平台优化',
            config: {
              optimization_level: 'platform_specific'
            },
            position: { x: 500, y: 150 }
          },
          {
            id: 'publish',
            type: 'platform_publish',
            name: '发布内容',
            description: '发布到平台',
            config: {
              auto_publish: false
            },
            position: { x: 700, y: 150 }
          }
        ],
        edges: [
          { from: 'input', to: 'generate_copy' },
          { from: 'input', to: 'generate_image' },
          { from: 'input', to: 'generate_music' },
          { from: 'generate_copy', to: 'optimize' },
          { from: 'generate_image', to: 'optimize' },
          { from: 'optimize', to: 'publish' },
          { from: 'generate_music', to: 'publish' }
        ]
      }
    };

    const template = baseWorkflows[type];
    if (!template) {
      throw new Error(`Unknown workflow type: ${type}`);
    }

    return {
      ...template,
      variables: params,
      metadata: {
        type,
        created_by: 'quick_workflow',
        ...params
      }
    };
  }

  /**
   * 错误处理
   */
  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.response?.data?.error) {
      return new Error(error.response.data.error);
    }
    if (error.message) {
      return new Error(error.message);
    }
    return new Error('工作流服务出现未知错误');
  }
}

// 导出单例实例
export const workflowService = new WorkflowService();
export default workflowService;
