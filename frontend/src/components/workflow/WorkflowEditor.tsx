'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, 
  Save, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Settings, 
  Eye,
  Loader2,
  Zap,
  GitBranch,
  Square,
  Circle
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  workflowService, 
  type WorkflowDefinition, 
  type WorkflowNode, 
  type WorkflowEdge,
  type NodeType,
  type CreateWorkflowRequest
} from '@/services/workflowService';

interface WorkflowEditorProps {
  initialWorkflow?: WorkflowDefinition;
  onSave?: (workflow: WorkflowDefinition) => void;
  onExecute?: (executionId: string) => void;
}

interface CanvasNode extends WorkflowNode {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function WorkflowEditor({ 
  initialWorkflow, 
  onSave, 
  onExecute 
}: WorkflowEditorProps) {
  const [workflow, setWorkflow] = useState<WorkflowDefinition>(
    initialWorkflow || {
      id: '',
      name: '新工作流',
      description: '',
      version: '1.0',
      nodes: [],
      edges: [],
      variables: {},
      metadata: {}
    }
  );

  const [canvasNodes, setCanvasNodes] = useState<CanvasNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<CanvasNode | null>(null);
  const [nodeTypes, setNodeTypes] = useState<NodeType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [draggedNode, setDraggedNode] = useState<CanvasNode | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // 加载节点类型
  useEffect(() => {
    const loadNodeTypes = async () => {
      try {
        const types = await workflowService.getNodeTypes();
        setNodeTypes(types);
      } catch (error) {
        console.error('Failed to load node types:', error);
        toast.error('加载节点类型失败');
      }
    };
    loadNodeTypes();
  }, []);

  // 初始化画布节点
  useEffect(() => {
    if (workflow.nodes.length > 0) {
      const nodes: CanvasNode[] = workflow.nodes.map(node => ({
        ...node,
        x: node.position?.x || 100,
        y: node.position?.y || 100,
        width: 200,
        height: 80
      }));
      setCanvasNodes(nodes);
    }
  }, [workflow.nodes]);

  // 添加节点
  const addNode = useCallback((nodeType: NodeType) => {
    const newNode: CanvasNode = {
      id: `node_${Date.now()}`,
      type: nodeType.type,
      name: nodeType.name,
      description: nodeType.description,
      config: {},
      x: 100 + canvasNodes.length * 50,
      y: 100 + canvasNodes.length * 50,
      width: 200,
      height: 80,
      position: { x: 100 + canvasNodes.length * 50, y: 100 + canvasNodes.length * 50 }
    };

    setCanvasNodes(prev => [...prev, newNode]);
    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
  }, [canvasNodes.length]);

  // 删除节点
  const deleteNode = useCallback((nodeId: string) => {
    setCanvasNodes(prev => prev.filter(node => node.id !== nodeId));
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      edges: prev.edges.filter(edge => edge.from !== nodeId && edge.to !== nodeId)
    }));
    setSelectedNode(null);
  }, []);

  // 更新节点
  const updateNode = useCallback((nodeId: string, updates: Partial<CanvasNode>) => {
    setCanvasNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      )
    }));
  }, []);

  // 添加连接
  const addConnection = useCallback((fromId: string, toId: string) => {
    // 检查是否已存在连接
    const existingEdge = workflow.edges.find(
      edge => edge.from === fromId && edge.to === toId
    );
    
    if (existingEdge) {
      toast.error('连接已存在');
      return;
    }

    // 检查是否会形成循环
    const wouldCreateCycle = (from: string, to: string): boolean => {
      const visited = new Set<string>();
      const stack = [to];

      while (stack.length > 0) {
        const current = stack.pop()!;
        if (current === from) return true;
        if (visited.has(current)) continue;
        visited.add(current);

        const outgoingEdges = workflow.edges.filter(edge => edge.from === current);
        stack.push(...outgoingEdges.map(edge => edge.to));
      }

      return false;
    };

    if (wouldCreateCycle(fromId, toId)) {
      toast.error('不能创建循环连接');
      return;
    }

    const newEdge: WorkflowEdge = { from: fromId, to: toId };
    setWorkflow(prev => ({
      ...prev,
      edges: [...prev.edges, newEdge]
    }));
  }, [workflow.edges]);

  // 删除连接
  const deleteConnection = useCallback((fromId: string, toId: string) => {
    setWorkflow(prev => ({
      ...prev,
      edges: prev.edges.filter(edge => !(edge.from === fromId && edge.to === toId))
    }));
  }, []);

  // 鼠标事件处理
  const handleMouseDown = useCallback((e: React.MouseEvent, node: CanvasNode) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.shiftKey) {
      // Shift + 点击开始连接
      if (connectionStart === null) {
        setConnectionStart(node.id);
        setIsConnecting(true);
      } else if (connectionStart !== node.id) {
        addConnection(connectionStart, node.id);
        setConnectionStart(null);
        setIsConnecting(false);
      }
    } else {
      // 普通拖拽
      setSelectedNode(node);
      setDraggedNode(node);
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left - node.x,
          y: e.clientY - rect.top - node.y
        });
      }
    }
  }, [connectionStart, addConnection]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggedNode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left - dragOffset.x;
      const newY = e.clientY - rect.top - dragOffset.y;

      updateNode(draggedNode.id, { 
        x: Math.max(0, newX), 
        y: Math.max(0, newY),
        position: { x: Math.max(0, newX), y: Math.max(0, newY) }
      });
    }
  }, [draggedNode, dragOffset, updateNode]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // 取消连接模式
  const cancelConnection = useCallback(() => {
    setConnectionStart(null);
    setIsConnecting(false);
  }, []);

  // 保存工作流
  const saveWorkflow = useCallback(async () => {
    const validation = workflowService.validateWorkflow(workflow);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }

    setIsLoading(true);
    try {
      const request: CreateWorkflowRequest = {
        name: workflow.name,
        description: workflow.description,
        nodes: workflow.nodes,
        edges: workflow.edges,
        variables: workflow.variables,
        metadata: workflow.metadata
      };

      const savedWorkflow = await workflowService.createWorkflow(request);
      setWorkflow(savedWorkflow);
      onSave?.(savedWorkflow);
      toast.success('工作流保存成功');
    } catch (error) {
      console.error('Failed to save workflow:', error);
      toast.error('保存失败');
    } finally {
      setIsLoading(false);
    }
  }, [workflow, onSave]);

  // 执行工作流
  const executeWorkflow = useCallback(async () => {
    if (!workflow.id) {
      toast.error('请先保存工作流');
      return;
    }

    setIsLoading(true);
    try {
      const executionId = await workflowService.executeWorkflow({
        workflow_id: workflow.id,
        input_data: workflow.variables || {}
      });
      
      onExecute?.(executionId);
      toast.success('工作流执行已启动');
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      toast.error('执行失败');
    } finally {
      setIsLoading(false);
    }
  }, [workflow.id, workflow.variables, onExecute]);

  // 获取节点样式
  const getNodeStyle = useCallback((node: CanvasNode) => {
    const baseStyle = {
      left: node.x,
      top: node.y,
      width: node.width,
      height: node.height
    };

    const typeColors: Record<string, string> = {
      'input': 'border-blue-500 bg-blue-50',
      'output': 'border-green-500 bg-green-50',
      'text_generation': 'border-purple-500 bg-purple-50',
      'image_generation': 'border-pink-500 bg-pink-50',
      'music_generation': 'border-orange-500 bg-orange-50',
      'content_analysis': 'border-yellow-500 bg-yellow-50',
      'content_optimization': 'border-indigo-500 bg-indigo-50',
      'platform_publish': 'border-red-500 bg-red-50',
      'condition': 'border-gray-500 bg-gray-50'
    };

    const colorClass = typeColors[node.type] || 'border-gray-300 bg-white';
    const selectedClass = selectedNode?.id === node.id ? 'ring-2 ring-blue-400' : '';
    const connectingClass = connectionStart === node.id ? 'ring-2 ring-green-400' : '';

    return {
      style: baseStyle,
      className: `absolute border-2 rounded-lg p-3 cursor-pointer select-none ${colorClass} ${selectedClass} ${connectingClass}`
    };
  }, [selectedNode, connectionStart]);

  // 渲染连接线
  const renderConnections = useCallback(() => {
    return workflow.edges.map((edge, index) => {
      const fromNode = canvasNodes.find(node => node.id === edge.from);
      const toNode = canvasNodes.find(node => node.id === edge.to);

      if (!fromNode || !toNode) return null;

      const x1 = fromNode.x + fromNode.width;
      const y1 = fromNode.y + fromNode.height / 2;
      const x2 = toNode.x;
      const y2 = toNode.y + toNode.height / 2;

      // 贝塞尔曲线控制点
      const cp1x = x1 + (x2 - x1) / 3;
      const cp1y = y1;
      const cp2x = x2 - (x2 - x1) / 3;
      const cp2y = y2;

      const path = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;

      return (
        <g key={`${edge.from}-${edge.to}`}>
          <path
            d={path}
            stroke="#6b7280"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
            className="hover:stroke-blue-500 cursor-pointer"
            onClick={() => deleteConnection(edge.from, edge.to)}
          />
        </g>
      );
    });
  }, [workflow.edges, canvasNodes, deleteConnection]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧工具栏 */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* 工作流信息 */}
        <div className="p-4 border-b border-gray-200">
          <div className="space-y-3">
            <div>
              <Label htmlFor="workflow-name">工作流名称</Label>
              <Input
                id="workflow-name"
                value={workflow.name}
                onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
                placeholder="输入工作流名称"
              />
            </div>
            <div>
              <Label htmlFor="workflow-description">描述</Label>
              <Textarea
                id="workflow-description"
                value={workflow.description}
                onChange={(e) => setWorkflow(prev => ({ ...prev, description: e.target.value }))}
                placeholder="输入工作流描述"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* 节点类型面板 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold mb-3">节点类型</h3>
            <div className="space-y-2">
              {nodeTypes.map((nodeType) => (
                <Button
                  key={nodeType.type}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => addNode(nodeType)}
                >
                  <div>
                    <div className="font-medium">{nodeType.name}</div>
                    <div className="text-xs text-muted-foreground">{nodeType.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* 节点属性面板 */}
        {selectedNode && (
          <div className="border-t border-gray-200 p-4">
            <h3 className="font-semibold mb-3">节点属性</h3>
            <div className="space-y-3">
              <div>
                <Label>节点名称</Label>
                <Input
                  value={selectedNode.name}
                  onChange={(e) => updateNode(selectedNode.id, { name: e.target.value })}
                />
              </div>
              <div>
                <Label>描述</Label>
                <Textarea
                  value={selectedNode.description}
                  onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
                  rows={2}
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteNode(selectedNode.id)}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除节点
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 主画布区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部工具栏 */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {canvasNodes.length} 个节点
            </Badge>
            <Badge variant="outline">
              {workflow.edges.length} 个连接
            </Badge>
            {isConnecting && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                连接模式 - 点击目标节点
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {isConnecting && (
              <Button variant="outline" size="sm" onClick={cancelConnection}>
                取消连接
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={saveWorkflow} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              保存
            </Button>
            <Button size="sm" onClick={executeWorkflow} disabled={isLoading || !workflow.id}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              执行
            </Button>
          </div>
        </div>

        {/* 画布 */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full relative bg-gray-50 overflow-auto"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={() => {
              setSelectedNode(null);
              if (isConnecting) {
                cancelConnection();
              }
            }}
          >
            {/* 网格背景 */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />

            {/* SVG 连接线 */}
            <svg
              ref={svgRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 1 }}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#6b7280"
                  />
                </marker>
              </defs>
              {renderConnections()}
            </svg>

            {/* 节点 */}
            {canvasNodes.map((node) => {
              const { style, className } = getNodeStyle(node);
              return (
                <div
                  key={node.id}
                  style={style}
                  className={className}
                  onMouseDown={(e) => handleMouseDown(e, node)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {node.type}
                    </Badge>
                    <div className="flex space-x-1">
                      <Circle className="h-3 w-3 text-gray-400" />
                      <Square className="h-3 w-3 text-gray-400" />
                    </div>
                  </div>
                  <div className="font-medium text-sm truncate">{node.name}</div>
                  <div className="text-xs text-gray-500 truncate">{node.description}</div>
                </div>
              );
            })}

            {/* 空状态 */}
            {canvasNodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">开始构建您的工作流</p>
                  <p className="text-sm">从左侧面板拖拽节点到画布上</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部状态栏 */}
        <div className="bg-white border-t border-gray-200 px-4 py-2 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <div>
              提示: Shift + 点击节点来创建连接 | 点击连接线可以删除连接
            </div>
            <div className="flex items-center space-x-4">
              <span>版本: {workflow.version}</span>
              {workflow.id && <span>ID: {workflow.id}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
