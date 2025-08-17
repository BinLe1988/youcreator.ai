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
import Link from 'next/link';
import Layout from '@/components/layout/Layout';

export default function WorkflowSimplePage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 模拟数据
  const mockTemplates = [
    {
      id: 'blog-writer',
      name: '博客文章生成器',
      description: '自动生成高质量博客文章，包括内容、配图和SEO优化',
      category: 'content_creation',
      difficulty: 'beginner',
      estimated_time: '5-10分钟',
      node_count: 5,
      version: '1.0'
    },
    {
      id: 'social-media-pack',
      name: '社交媒体内容包',
      description: '一键生成社交媒体文案、配图和短视频脚本',
      category: 'social_media',
      difficulty: 'beginner',
      estimated_time: '3-5分钟',
      node_count: 4,
      version: '1.2'
    },
    {
      id: 'story-creator',
      name: '故事创作助手',
      description: '创作完整的故事，包括情节、人物和配图',
      category: 'creative_writing',
      difficulty: 'intermediate',
      estimated_time: '10-15分钟',
      node_count: 8,
      version: '1.1'
    }
  ];

  const mockWorkflows = [
    {
      id: 'user-workflow-1',
      name: '我的博客助手',
      description: '基于博客生成器模板创建的个人工作流',
      version: '1.0',
      nodes: [],
      edges: [],
      metadata: { category: 'content_creation' },
      updated_at: '2024-08-15T10:30:00Z'
    }
  ];

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        // 先显示模拟数据
        setTemplates(mockTemplates);
        setWorkflows(mockWorkflows);
        setIsLoading(false);

        // 然后尝试加载真实数据
        try {
          const [templatesResponse, workflowsResponse] = await Promise.all([
            fetch('/api/v1/workflow/templates'),
            fetch('/api/v1/workflow/list')
          ]);
          
          if (templatesResponse.ok) {
            const templatesData = await templatesResponse.json();
            if (templatesData.success) {
              setTemplates(templatesData.templates || mockTemplates);
            }
          }
          
          if (workflowsResponse.ok) {
            const workflowsData = await workflowsResponse.json();
            if (workflowsData.success) {
              setWorkflows(workflowsData.workflows || mockWorkflows);
            }
          }
        } catch (error) {
          console.log('使用模拟数据:', error);
        }
        
      } catch (error) {
        console.error('加载数据失败:', error);
        setTemplates(mockTemplates);
        setWorkflows(mockWorkflows);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 实例化模板
  const instantiateTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/v1/workflow/templates/${templateId}/instantiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('模板实例化成功！');
          // 添加到工作流列表
          setWorkflows(prev => [result.workflow, ...prev]);
        }
      }
    } catch (error) {
      console.error('实例化失败:', error);
      alert('实例化失败');
    }
  };

  // 过滤模板
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
                  placeholder="搜索工作流模板..."
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
              工作流模板 ({templates.length})
            </TabsTrigger>
            <TabsTrigger value="my-workflows" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              我的工作流 ({workflows.length})
            </TabsTrigger>
          </TabsList>

          {/* 工作流模板 */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">预设模板</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                创建自定义工作流
              </Button>
            </div>

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

            {filteredTemplates.length === 0 && (
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
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                创建新工作流
              </Button>
            </div>

            <div className="space-y-4">
              {workflows.map((workflow) => (
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
                            {workflow.nodes?.length || 0} 个节点
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
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          编辑
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4 mr-1" />
                          复制
                        </Button>
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-1" />
                          执行
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
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

            {workflows.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium mb-2">还没有创建工作流</p>
                <p className="text-muted-foreground mb-4">开始创建您的第一个AI工作流吧</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  创建工作流
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
