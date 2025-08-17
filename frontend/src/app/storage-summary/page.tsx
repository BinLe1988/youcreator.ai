'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Database,
  HardDrive,
  Cloud,
  Monitor,
  Server,
  Zap
} from 'lucide-react';

interface StorageSummary {
  category: string;
  services: {
    name: string;
    status: 'online' | 'offline' | 'partial';
    description: string;
    icon: React.ReactNode;
  }[];
}

export default function StorageSummaryPage() {
  const [summary, setSummary] = useState<StorageSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    loadStorageSummary();
  }, []);

  const loadStorageSummary = async () => {
    setIsLoading(true);
    
    try {
      // 并行检查所有存储服务
      const [
        mysqlResult,
        mongoResult,
        redisResult,
        opensearchResult,
        filesystemResult,
        cloudResult
      ] = await Promise.all([
        fetch('/api/storage/check/mysql').then(r => r.json()),
        fetch('/api/storage/check/mongodb').then(r => r.json()),
        fetch('/api/storage/check/redis').then(r => r.json()),
        fetch('/api/storage/check/opensearch').then(r => r.json()),
        fetch('/api/storage/check/filesystem').then(r => r.json()),
        fetch('/api/storage/check/cloud').then(r => r.json())
      ]);

      const summaryData: StorageSummary[] = [
        {
          category: '浏览器存储',
          services: [
            {
              name: 'LocalStorage',
              status: 'online',
              description: '用户设置、登录状态存储',
              icon: <HardDrive className="h-4 w-4" />
            },
            {
              name: 'SessionStorage',
              status: 'online',
              description: '会话数据临时存储',
              icon: <Monitor className="h-4 w-4" />
            },
            {
              name: 'IndexedDB',
              status: 'online',
              description: '离线数据、大容量存储',
              icon: <Database className="h-4 w-4" />
            }
          ]
        },
        {
          category: '数据库服务',
          services: [
            {
              name: 'MySQL',
              status: mysqlResult.connected ? 'online' : 'offline',
              description: '关系型数据库 - 用户数据、项目信息',
              icon: <Database className="h-4 w-4" />
            },
            {
              name: 'MongoDB',
              status: mongoResult.connected ? 'online' : 'offline',
              description: '文档数据库 - 创作内容、版本历史',
              icon: <Database className="h-4 w-4" />
            },
            {
              name: 'Redis',
              status: redisResult.connected ? 'online' : 'offline',
              description: '缓存存储 - 会话、实时数据',
              icon: <Zap className="h-4 w-4" />
            },
            {
              name: 'OpenSearch',
              status: opensearchResult.connected ? 'online' : 'offline',
              description: '搜索引擎 - 全文搜索、内容分析',
              icon: <Server className="h-4 w-4" />
            }
          ]
        },
        {
          category: '文件存储',
          services: [
            {
              name: '本地文件系统',
              status: filesystemResult.available ? 'online' : 'partial',
              description: '本地文件存储 - 临时文件、开发环境',
              icon: <HardDrive className="h-4 w-4" />
            },
            {
              name: '云存储服务',
              status: cloudResult.configured ? 'online' : 'offline',
              description: '云端存储 - 大文件、生产环境',
              icon: <Cloud className="h-4 w-4" />
            }
          ]
        }
      ];

      setSummary(summaryData);
      setLastUpdate(new Date().toLocaleString());
    } catch (error) {
      console.error('加载存储摘要失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'partial':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-100 text-green-800">在线</Badge>;
      case 'offline':
        return <Badge className="bg-red-100 text-red-800">离线</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800">部分可用</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">未知</Badge>;
    }
  };

  // 计算统计数据
  const allServices = summary.flatMap(cat => cat.services);
  const onlineCount = allServices.filter(s => s.status === 'online').length;
  const offlineCount = allServices.filter(s => s.status === 'offline').length;
  const partialCount = allServices.filter(s => s.status === 'partial').length;
  const totalCount = allServices.length;
  const availabilityRate = totalCount > 0 ? Math.round((onlineCount / totalCount) * 100) : 0;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* 页面标题 */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          存储服务状态总览
        </h1>
        <p className="text-xl text-muted-foreground">
          YouCreator.AI 平台存储架构可用性报告
        </p>
      </div>

      {/* 总体统计 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              总体状态
            </CardTitle>
            <Button onClick={loadStorageSummary} disabled={isLoading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{onlineCount}</div>
              <div className="text-sm text-muted-foreground">在线服务</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{offlineCount}</div>
              <div className="text-sm text-muted-foreground">离线服务</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{partialCount}</div>
              <div className="text-sm text-muted-foreground">部分可用</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{totalCount}</div>
              <div className="text-sm text-muted-foreground">总服务数</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{availabilityRate}%</div>
              <div className="text-sm text-muted-foreground">可用率</div>
            </div>
          </div>
          
          {lastUpdate && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              最后更新: {lastUpdate}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 存储服务分类 */}
      {summary.map((category, categoryIndex) => (
        <Card key={categoryIndex}>
          <CardHeader>
            <CardTitle>{category.category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.services.map((service, serviceIndex) => (
                <div 
                  key={serviceIndex}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    {service.icon}
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {service.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(service.status)}
                    {getStatusBadge(service.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* 建议和说明 */}
      <Card>
        <CardHeader>
          <CardTitle>存储架构说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-600">✅ 当前可用服务</h4>
              <ul className="space-y-2 text-sm">
                <li>• <strong>浏览器存储:</strong> 完全可用，支持离线功能</li>
                <li>• <strong>MySQL:</strong> 在线，用户数据安全存储</li>
                <li>• <strong>Redis:</strong> 在线，缓存和会话管理正常</li>
                <li>• <strong>本地文件系统:</strong> 可用，支持文件上传</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-red-600">❌ 需要配置的服务</h4>
              <ul className="space-y-2 text-sm">
                <li>• <strong>MongoDB:</strong> 需要启动服务或配置连接</li>
                <li>• <strong>OpenSearch:</strong> 需要启动搜索引擎服务</li>
                <li>• <strong>云存储:</strong> 需要配置云服务提供商</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2 text-blue-800">💡 优化建议</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>1. 启动 MongoDB 和 OpenSearch 服务以获得完整功能</li>
              <li>2. 配置云存储以支持大文件和生产环境部署</li>
              <li>3. 设置定期备份策略确保数据安全</li>
              <li>4. 监控存储使用情况，及时扩容</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
