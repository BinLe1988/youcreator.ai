'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  FileText, 
  MessageSquare,
  Download,
  Eye
} from 'lucide-react';

interface PolishOrder {
  id: string;
  title: string;
  content: string;
  contentType: 'text' | 'image';
  serviceType: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  contentCount: number;
  unit: string;
  totalPrice: number;
  editor?: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  deadline: string;
  completedAt?: string;
}

const mockOrders: PolishOrder[] = [
  {
    id: 'PO001',
    title: '科幻小说第一章',
    content: '在遥远的未来，人类已经掌握了星际旅行的技术...',
    contentType: 'text',
    serviceType: '专业润色',
    status: 'completed',
    contentCount: 1200,
    unit: '字',
    totalPrice: 144.00,
    editor: {
      name: '张文华',
      avatar: '👨‍💼'
    },
    createdAt: '2024-01-15',
    deadline: '2024-01-18',
    completedAt: '2024-01-17'
  },
  {
    id: 'PO002',
    title: '商业计划书摘要',
    content: '本项目旨在开发一款创新的移动应用...',
    contentType: 'text',
    serviceType: '高级润色',
    status: 'in_progress',
    contentCount: 800,
    unit: '字',
    totalPrice: 200.00,
    editor: {
      name: '李雅琴',
      avatar: '👩‍💼'
    },
    createdAt: '2024-01-16',
    deadline: '2024-01-21'
  },
  {
    id: 'PO003',
    title: '科幻角色设计图',
    content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    contentType: 'image',
    serviceType: '专业绘制',
    status: 'assigned',
    contentCount: 1,
    unit: '张',
    totalPrice: 120.00,
    editor: {
      name: '陈艺凡',
      avatar: '🎨'
    },
    createdAt: '2024-01-17',
    deadline: '2024-01-22'
  },
  {
    id: 'PO004',
    title: '学术论文引言',
    content: '随着人工智能技术的快速发展...',
    contentType: 'text',
    serviceType: '专业润色',
    status: 'pending',
    contentCount: 1000,
    unit: '字',
    totalPrice: 120.00,
    createdAt: '2024-01-18',
    deadline: '2024-01-21'
  },
  {
    id: 'PO005',
    title: '风景画作品',
    content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    contentType: 'image',
    serviceType: '大师级创作',
    status: 'completed',
    contentCount: 1,
    unit: '张',
    totalPrice: 300.00,
    editor: {
      name: '刘墨轩',
      avatar: '🖌️'
    },
    createdAt: '2024-01-10',
    deadline: '2024-01-20',
    completedAt: '2024-01-19'
  }
];

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'pending':
      return { label: '待分配', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
    case 'assigned':
      return { label: '已分配', color: 'bg-blue-100 text-blue-800', icon: User };
    case 'in_progress':
      return { label: '进行中', color: 'bg-purple-100 text-purple-800', icon: AlertCircle };
    case 'completed':
      return { label: '已完成', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    case 'cancelled':
      return { label: '已取消', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    default:
      return { label: '未知', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
  }
};

export default function PolishOrdersPage() {
  const [activeTab, setActiveTab] = useState('all');

  const filteredOrders = mockOrders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return ['pending', 'assigned'].includes(order.status);
    if (activeTab === 'in_progress') return order.status === 'in_progress';
    if (activeTab === 'completed') return order.status === 'completed';
    return true;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 页面标题 */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">我的润色订单</h1>
            <p className="text-gray-600">管理和跟踪您的润色服务订单</p>
          </div>

          {/* 订单统计 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {mockOrders.length}
                </div>
                <div className="text-sm text-gray-600">总订单</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {mockOrders.filter(o => ['pending', 'assigned'].includes(o.status)).length}
                </div>
                <div className="text-sm text-gray-600">待处理</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {mockOrders.filter(o => o.status === 'in_progress').length}
                </div>
                <div className="text-sm text-gray-600">进行中</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {mockOrders.filter(o => o.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">已完成</div>
              </CardContent>
            </Card>
          </div>

          {/* 订单列表 */}
          <Card>
            <CardHeader>
              <CardTitle>订单列表</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">全部</TabsTrigger>
                  <TabsTrigger value="pending">待处理</TabsTrigger>
                  <TabsTrigger value="in_progress">进行中</TabsTrigger>
                  <TabsTrigger value="completed">已完成</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                  <div className="space-y-4">
                    {filteredOrders.map((order) => {
                      const statusInfo = getStatusInfo(order.status);
                      const StatusIcon = statusInfo.icon;

                      return (
                        <Card key={order.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                  <h3 className="font-semibold text-lg">{order.title}</h3>
                                  <Badge className={statusInfo.color}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusInfo.label}
                                  </Badge>
                                  <Badge variant="outline">{order.serviceType}</Badge>
                                  <Badge variant={order.contentType === 'image' ? 'default' : 'secondary'}>
                                    {order.contentType === 'image' ? '🎨 绘画' : '📝 文字'}
                                  </Badge>
                                </div>

                                {order.contentType === 'image' ? (
                                  <div className="bg-gray-50 p-2 rounded-lg">
                                    <img
                                      src={order.content}
                                      alt={order.title}
                                      className="w-20 h-20 object-cover rounded"
                                    />
                                  </div>
                                ) : (
                                  <p className="text-gray-600 text-sm line-clamp-2">
                                    {order.content}
                                  </p>
                                )}

                                <div className="flex items-center gap-6 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <FileText className="w-4 h-4" />
                                    {order.contentCount} {order.unit}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    创建于 {order.createdAt}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    截止 {order.deadline}
                                  </div>
                                  {order.editor && (
                                    <div className="flex items-center gap-1">
                                      <span>{order.editor.avatar}</span>
                                      {order.editor.name}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-3">
                                <div className="text-right">
                                  <div className="text-lg font-bold text-purple-600">
                                    ¥{order.totalPrice.toFixed(2)}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    订单号: {order.id}
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="w-4 h-4 mr-1" />
                                    查看
                                  </Button>
                                  {order.status === 'in_progress' && (
                                    <Button size="sm" variant="outline">
                                      <MessageSquare className="w-4 h-4 mr-1" />
                                      沟通
                                    </Button>
                                  )}
                                  {order.status === 'completed' && (
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                      <Download className="w-4 h-4 mr-1" />
                                      下载
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    {filteredOrders.length === 0 && (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">暂无相关订单</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
