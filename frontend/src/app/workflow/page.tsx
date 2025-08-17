'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Play, 
  Settings, 
  Trash2, 
  Copy, 
  Search,
  Filter,
  GitBranch,
  Zap,
  Clock,
  Users,
  TrendingUp,
  Sparkles,
  BookOpen,
  Share2,
  Palette,
  ShoppingBag
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';

// 类型定义
interface WorkflowTemplate {
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

interface WorkflowNode {
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

interface WorkflowEdge {
  from: string;
  to: string;
}

interface WorkflowDefinition {
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

export default function WorkflowPage() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('开始加载工作流数据...');
        
        // 使用直接的fetch调用而不是workflowService
        const [templatesResponse, workflowsResponse] = await Promise.all([
          fetch('/api/v1/workflow/templates'),
          fetch('/api/v1/workflow/list')
        ]);
        
        console.log('模板API状态:', templatesResponse.status);
        console.log('工作流API状态:', workflowsResponse.status);
        
        if (templatesResponse.ok) {
          const templatesData = await templatesResponse.json();
          console.log('模板数据:', templatesData);
          if (templatesData.success) {
            setTemplates(templatesData.templates || []);
          }
        } else {
          console.error('模板API失败:', templatesResponse.status);
        }
        
        if (workflowsResponse.ok) {
          const workflowsData = await workflowsResponse.json();
          console.log('工作流数据:', workflowsData);
          if (workflowsData.success) {
            setWorkflows(workflowsData.workflows || []);
          }
        } else {
          console.error('工作流API失败:', workflowsResponse.status);
        }
        
      } catch (error) {
        console.error('加载数据失败:', error);
        toast.error('加载数据失败: ' + (error instanceof Error ? error.message : '未知错误'));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 实例化模板
  const instantiateTemplate = async (templateId: string) => {
    try {
      console.log('实例化模板:', templateId);
      
      const response = await fetch(`/api/v1/workflow/templates/${templateId}/instantiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('实例化响应状态:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('实例化结果:', result);
        
        if (result.success) {
          toast.success('模板实例化成功');
          // 重新加载工作流列表
          const workflowsResponse = await fetch('/api/v1/workflow/list');
          if (workflowsResponse.ok) {
            const workflowsData = await workflowsResponse.json();
            if (workflowsData.success) {
              setWorkflows(workflowsData.workflows || []);
            }
          }
        } else {
          toast.error('实例化失败: ' + result.error);
        }
      } else {
        toast.error('实例化失败: HTTP ' + response.status);
      }
    } catch (error) {
      console.error('实例化模板失败:', error);
      toast.error('实例化失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 删除工作流
  const deleteWorkflow = async (workflowId: string) => {
    if (!confirm('确定要删除这个工作流吗？')) return;
    
    try {
      console.log('删除工作流:', workflowId);
      
      const response = await fetch(`/api/v1/workflow/${workflowId}`, {
        method: 'DELETE'
      });
      
      console.log('删除响应状态:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('删除结果:', result);
        
        if (result.success) {
          setWorkflows(prev => prev.filter(w => w.id !== workflowId));
          toast.success('工作流已删除');
        } else {
          toast.error('删除失败: ' + result.error);
        }
      } else {
        toast.error('删除失败: HTTP ' + response.status);
      }
    } catch (error) {
      console.error('删除工作流失败:', error);
      toast.error('删除失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 复制工作流
  const duplicateWorkflow = async (workflow: WorkflowDefinition) => {
    try {
      console.log('复制工作流:', workflow.id);
      
      const response = await fetch('/api/v1/workflow/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${workflow.name} (副本)`,
          description: workflow.description,
          nodes: workflow.nodes,
          edges: workflow.edges,
          variables: workflow.variables,
          metadata: { ...workflow.metadata, duplicated_from: workflow.id }
        })
      });
      
      console.log('复制响应状态:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('复制结果:', result);
        
        if (result.success) {
          setWorkflows(prev => [result.workflow, ...prev]);
          toast.success('工作流已复制');
        } else {
          toast.error('复制失败: ' + result.error);
        }
      } else {
        toast.error('复制失败: HTTP ' + response.status);
      }
    } catch (error) {
      console.error('复制工作流失败:', error);
      toast.error('复制失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 过滤模板
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 过滤工作流
  const filteredWorkflows = workflows.filter(workflow => {
    return workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // 获取分类列表
  const categories = ['all', ...new Set(templates.map(t => t.category))];
  const categoryLabels: Record<string, string> = {
    all: '全部',
    content_creation: '内容创作',
    social_media: '社交媒体',
    creative_writing: '创意写作',
    marketing: '营销推广'
  };

  // 获取难度颜色
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取分类图标
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content_creation': return <BookOpen className="h-4 w-4" />;
      case 'social_media': return <Share2 className="h-4 w-4" />;
      case 'creative_writing': return <Palette className="h-4 w-4" />;
      case 'marketing': return <ShoppingBag className="h-4 w-4" />;
      default: return <GitBranch className="h-4 w-4" />;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 space-y-8">
        {/* 页面标题 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI工作流平台
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            通过可视化工作流，让AI内容生产变得简单高效
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Zap className="h-3 w-3 mr-1" />
              自动化
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <GitBranch className="h-3 w-3 mr-1" />
              可视化
            </Badge>
            <Badge variant="secondary" className="bg-pink-100 text-pink-800">
              <Sparkles className="h-3 w-3 mr-1" />
              智能化
            </Badge>
          </div>
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <GitBranch className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{templates.length}</div>
                <div className="text-sm text-muted-foreground">预设模板</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{workflows.length}</div>
                <div className="text-sm text-muted-foreground">我的工作流</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <Play className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-muted-foreground">执行次数</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">100%</div>
                <div className="text-sm text-muted-foreground">成功率</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和过滤 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索工作流模板或我的工作流..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="flex items-center gap-1"
                  >
                    {getCategoryIcon(category)}
                    {categoryLabels[category] || category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 主要内容 */}
        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              工作流模板
            </TabsTrigger>
            <TabsTrigger value="my-workflows" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              我的工作流
            </TabsTrigger>
          </TabsList>

          {/* 工作流模板 */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">预设模板</h2>
              <Link href="/workflow/editor">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  创建自定义工作流
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(template.category)}
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                        </div>
                        <Badge className={getDifficultyColor(template.difficulty)}>
                          {template.difficulty}
                        </Badge>
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <GitBranch className="h-3 w-3" />
                          {template.node_count} 个节点
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {template.estimated_time}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1" 
                          onClick={() => instantiateTemplate(template.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          使用模板
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <GitBranch className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium mb-2">没有找到匹配的模板</p>
                <p className="text-muted-foreground">尝试调整搜索条件或分类筛选</p>
              </div>
            )}
          </TabsContent>

          {/* 我的工作流 */}
          <TabsContent value="my-workflows" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">我的工作流</h2>
              <Link href="/workflow/editor">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  创建新工作流
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-8 w-16 bg-gray-200 rounded"></div>
                          <div className="h-8 w-16 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredWorkflows.map((workflow) => (
                  <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{workflow.name}</h3>
                            <Badge variant="outline">v{workflow.version}</Badge>
                            {workflow.metadata?.category && (
                              <Badge variant="secondary">
                                {categoryLabels[workflow.metadata.category] || workflow.metadata.category}
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-3">{workflow.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <GitBranch className="h-3 w-3" />
                              {workflow.nodes.length} 个节点
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {workflow.updated_at 
                                ? `更新于 ${new Date(workflow.updated_at).toLocaleDateString()}`
                                : '未知时间'
                              }
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link href={`/workflow/editor?id=${workflow.id}`}>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-1" />
                              编辑
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => duplicateWorkflow(workflow)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            复制
                          </Button>
                          <Link href={`/workflow/execution?workflow_id=${workflow.id}`}>
                            <Button size="sm">
                              <Play className="h-4 w-4 mr-1" />
                              执行
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteWorkflow(workflow.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && filteredWorkflows.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium mb-2">还没有创建工作流</p>
                <p className="text-muted-foreground mb-4">开始创建您的第一个AI工作流吧</p>
                <Link href="/workflow/editor">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    创建工作流
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* 功能介绍 */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-center">AI工作流的优势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">自动化流程</h3>
                <p className="text-sm text-muted-foreground">
                  将复杂的内容创作流程自动化，提高工作效率
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <GitBranch className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">可视化编辑</h3>
                <p className="text-sm text-muted-foreground">
                  拖拽式界面，无需编程即可创建复杂的AI工作流
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="font-semibold">智能优化</h3>
                <p className="text-sm text-muted-foreground">
                  AI自动优化工作流执行，确保最佳性能和结果
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
