'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Eye,
  Download,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  workflowService, 
  type WorkflowExecution as WorkflowExecutionType,
  type ExecutionLogEntry
} from '@/services/workflowService';

interface WorkflowExecutionProps {
  executionId: string;
  onComplete?: (execution: WorkflowExecutionType) => void;
  onError?: (error: string) => void;
}

export default function WorkflowExecution({ 
  executionId, 
  onComplete, 
  onError 
}: WorkflowExecutionProps) {
  const [execution, setExecution] = useState<WorkflowExecutionType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [showAllLogs, setShowAllLogs] = useState(false);

  // 获取执行状态
  const fetchExecutionStatus = useCallback(async () => {
    try {
      const executionData = await workflowService.getExecutionStatus(executionId);
      setExecution(executionData);
      
      // 如果执行完成，停止轮询
      if (executionData.status === 'completed') {
        setIsPolling(false);
        onComplete?.(executionData);
        toast.success('工作流执行完成');
      } else if (executionData.status === 'failed') {
        setIsPolling(false);
        onError?.(executionData.error || '执行失败');
        toast.error('工作流执行失败');
      } else if (executionData.status === 'cancelled') {
        setIsPolling(false);
        toast.info('工作流执行已取消');
      }
    } catch (error) {
      console.error('Failed to fetch execution status:', error);
      setIsPolling(false);
      onError?.(error instanceof Error ? error.message : '获取状态失败');
    } finally {
      setIsLoading(false);
    }
  }, [executionId, onComplete, onError]);

  // 开始轮询
  const startPolling = useCallback(() => {
    setIsPolling(true);
    const interval = setInterval(async () => {
      if (!isPolling) {
        clearInterval(interval);
        return;
      }
      await fetchExecutionStatus();
    }, 2000);

    return () => clearInterval(interval);
  }, [fetchExecutionStatus, isPolling]);

  // 初始化和轮询
  useEffect(() => {
    fetchExecutionStatus();
    
    // 如果状态是运行中，开始轮询
    if (execution?.status === 'running' || execution?.status === 'pending') {
      const cleanup = startPolling();
      return cleanup;
    }
  }, [executionId]);

  // 取消执行
  const cancelExecution = useCallback(async () => {
    try {
      await workflowService.cancelExecution(executionId);
      setIsPolling(false);
      toast.success('执行已取消');
    } catch (error) {
      console.error('Failed to cancel execution:', error);
      toast.error('取消失败');
    }
  }, [executionId]);

  // 重新执行
  const retryExecution = useCallback(async () => {
    if (!execution) return;
    
    try {
      const newExecutionId = await workflowService.executeWorkflow({
        workflow_id: execution.workflow_id,
        input_data: execution.input_data
      });
      
      // 这里应该导航到新的执行页面或更新当前页面
      toast.success('重新执行已启动');
    } catch (error) {
      console.error('Failed to retry execution:', error);
      toast.error('重新执行失败');
    }
  }, [execution]);

  // 获取状态颜色和图标
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Clock className="h-4 w-4" />,
          label: '等待中'
        };
      case 'running':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          label: '运行中'
        };
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="h-4 w-4" />,
          label: '已完成'
        };
      case 'failed':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <XCircle className="h-4 w-4" />,
          label: '失败'
        };
      case 'cancelled':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <Square className="h-4 w-4" />,
          label: '已取消'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <AlertCircle className="h-4 w-4" />,
          label: '未知'
        };
    }
  };

  // 计算进度
  const calculateProgress = () => {
    if (!execution?.execution_log) return 0;
    
    const totalNodes = execution.execution_log.length;
    const completedNodes = execution.execution_log.filter(
      log => log.status === 'completed'
    ).length;
    
    return totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0;
  };

  // 格式化时间
  const formatDuration = (startTime?: string, endTime?: string) => {
    if (!startTime) return '未知';
    
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = end.getTime() - start.getTime();
    
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟`;
    } else if (minutes > 0) {
      return `${minutes}分钟${seconds % 60}秒`;
    } else {
      return `${seconds}秒`;
    }
  };

  // 切换日志展开状态
  const toggleLogExpansion = (nodeId: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // 下载执行结果
  const downloadResult = () => {
    if (!execution?.output_data) return;
    
    const dataStr = JSON.stringify(execution.output_data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `workflow_result_${executionId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    toast.success('结果已下载');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span>加载执行状态...</span>
        </CardContent>
      </Card>
    );
  }

  if (!execution) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
          <span>执行实例不存在</span>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getStatusInfo(execution.status);
  const progress = calculateProgress();

  return (
    <div className="space-y-6">
      {/* 执行概览 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {statusInfo.icon}
              工作流执行监控
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={statusInfo.color}>
                {statusInfo.label}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchExecutionStatus}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">执行ID</div>
              <div className="font-mono text-sm">{execution.id}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">工作流ID</div>
              <div className="font-mono text-sm">{execution.workflow_id}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">开始时间</div>
              <div className="text-sm">
                {execution.start_time 
                  ? new Date(execution.start_time).toLocaleString()
                  : '未知'
                }
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">执行时长</div>
              <div className="text-sm">
                {formatDuration(execution.start_time, execution.end_time)}
              </div>
            </div>
          </div>

          {/* 进度条 */}
          {execution.status === 'running' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>执行进度</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              {execution.current_node && (
                <div className="text-sm text-muted-foreground">
                  当前节点: {execution.current_node}
                </div>
              )}
            </div>
          )}

          {/* 错误信息 */}
          {execution.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 font-medium mb-1">
                <XCircle className="h-4 w-4" />
                执行错误
              </div>
              <div className="text-red-700 text-sm">{execution.error}</div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2">
            {execution.status === 'running' && (
              <Button variant="outline" onClick={cancelExecution}>
                <Square className="h-4 w-4 mr-2" />
                取消执行
              </Button>
            )}
            {(execution.status === 'failed' || execution.status === 'cancelled') && (
              <Button variant="outline" onClick={retryExecution}>
                <RefreshCw className="h-4 w-4 mr-2" />
                重新执行
              </Button>
            )}
            {execution.status === 'completed' && execution.output_data && (
              <Button variant="outline" onClick={downloadResult}>
                <Download className="h-4 w-4 mr-2" />
                下载结果
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 执行日志 */}
      {execution.execution_log && execution.execution_log.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>执行日志</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllLogs(!showAllLogs)}
              >
                {showAllLogs ? '收起' : '展开全部'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {execution.execution_log.map((log, index) => {
                const isExpanded = expandedLogs.has(log.node_id) || showAllLogs;
                const logStatusInfo = getStatusInfo(log.status);
                
                return (
                  <div key={`${log.node_id}-${index}`} className="border rounded-lg p-3">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleLogExpansion(log.node_id)}
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                        <div className="flex items-center gap-2">
                          {logStatusInfo.icon}
                          <span className="font-medium">{log.node_name}</span>
                        </div>
                        <Badge variant="outline" className={logStatusInfo.color}>
                          {logStatusInfo.label}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="mt-3 pl-7 space-y-2">
                        <div className="text-sm text-muted-foreground">
                          节点ID: {log.node_id}
                        </div>
                        
                        {log.error && (
                          <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            错误: {log.error}
                          </div>
                        )}
                        
                        {log.result && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium">执行结果:</div>
                            <pre className="p-2 bg-gray-50 border rounded text-xs overflow-x-auto">
                              {JSON.stringify(log.result, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 输入数据 */}
      {execution.input_data && Object.keys(execution.input_data).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>输入数据</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="p-3 bg-gray-50 border rounded text-sm overflow-x-auto">
              {JSON.stringify(execution.input_data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* 输出结果 */}
      {execution.output_data && Object.keys(execution.output_data).length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>输出结果</CardTitle>
              <Button variant="outline" size="sm" onClick={downloadResult}>
                <Download className="h-4 w-4 mr-2" />
                下载
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="p-3 bg-gray-50 border rounded text-sm overflow-x-auto">
              {JSON.stringify(execution.output_data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
