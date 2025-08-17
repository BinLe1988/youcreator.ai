'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  HardDrive, 
  Cloud, 
  Server, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Monitor,
  Zap,
  Search,
  FileText,
  Image,
  Music,
  Video
} from 'lucide-react';

interface StorageStatus {
  name: string;
  type: string;
  status: 'online' | 'offline' | 'error' | 'checking';
  url?: string;
  description: string;
  icon: React.ReactNode;
  lastCheck?: string;
  responseTime?: number;
  errorMessage?: string;
  features?: string[];
}

export default function StorageCheckPage() {
  const [storageList, setStorageList] = useState<StorageStatus[]>([
    {
      name: 'LocalStorage',
      type: 'Browser Storage',
      status: 'checking',
      description: '浏览器本地存储，用于用户设置和临时数据',
      icon: <HardDrive className="h-5 w-5" />,
      features: ['用户设置', '登录状态', '临时数据']
    },
    {
      name: 'SessionStorage',
      type: 'Browser Storage',
      status: 'checking',
      description: '会话存储，用于临时会话数据',
      icon: <Monitor className="h-5 w-5" />,
      features: ['会话数据', '临时状态', '表单数据']
    },
    {
      name: 'IndexedDB',
      type: 'Browser Database',
      status: 'checking',
      description: '浏览器数据库，用于离线数据存储',
      icon: <Database className="h-5 w-5" />,
      features: ['离线数据', '大容量存储', '结构化数据']
    },
    {
      name: 'MySQL',
      type: 'Relational Database',
      status: 'checking',
      url: 'http://localhost:3306',
      description: 'MySQL关系型数据库，用于结构化数据存储',
      icon: <Database className="h-5 w-5" />,
      features: ['用户数据', '项目信息', '权限管理']
    },
    {
      name: 'MongoDB',
      type: 'Document Database',
      status: 'checking',
      url: 'http://localhost:27017',
      description: 'MongoDB文档数据库，用于内容和媒体数据',
      icon: <FileText className="h-5 w-5" />,
      features: ['创作内容', '版本历史', '媒体元数据']
    },
    {
      name: 'Redis',
      type: 'Cache Storage',
      status: 'checking',
      url: 'http://localhost:6379',
      description: 'Redis缓存存储，用于高速数据访问',
      icon: <Zap className="h-5 w-5" />,
      features: ['缓存数据', '会话存储', '实时数据']
    },
    {
      name: 'OpenSearch',
      type: 'Search Engine',
      status: 'checking',
      url: 'http://localhost:9200',
      description: 'OpenSearch搜索引擎，用于全文搜索和分析',
      icon: <Search className="h-5 w-5" />,
      features: ['全文搜索', '内容分析', '推荐系统']
    },
    {
      name: 'File System',
      type: 'File Storage',
      status: 'checking',
      description: '本地文件系统，用于静态文件存储',
      icon: <HardDrive className="h-5 w-5" />,
      features: ['图片文件', '音频文件', '视频文件', '文档文件']
    },
    {
      name: 'Cloud Storage',
      type: 'Cloud Service',
      status: 'checking',
      description: '云存储服务，用于大文件和备份',
      icon: <Cloud className="h-5 w-5" />,
      features: ['大文件存储', 'CDN加速', '备份恢复']
    }
  ]);

  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>('');

  useEffect(() => {
    checkAllStorage();
  }, []);

  const checkAllStorage = async () => {
    setIsChecking(true);
    setLastCheckTime(new Date().toLocaleString());

    const updatedStorage = [...storageList];

    // 检查浏览器存储
    await checkBrowserStorage(updatedStorage);
    
    // 检查数据库连接
    await checkDatabaseConnections(updatedStorage);
    
    // 检查文件系统
    await checkFileSystem(updatedStorage);
    
    // 检查云存储
    await checkCloudStorage(updatedStorage);

    setStorageList(updatedStorage);
    setIsChecking(false);
  };

  const checkBrowserStorage = async (storage: StorageStatus[]) => {
    // LocalStorage检查
    const localStorageIndex = storage.findIndex(s => s.name === 'LocalStorage');
    if (localStorageIndex !== -1) {
      try {
        const testKey = 'storage_test_' + Date.now();
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        
        storage[localStorageIndex] = {
          ...storage[localStorageIndex],
          status: 'online',
          lastCheck: new Date().toLocaleTimeString(),
          responseTime: 1
        };
      } catch (error) {
        storage[localStorageIndex] = {
          ...storage[localStorageIndex],
          status: 'error',
          errorMessage: 'LocalStorage不可用',
          lastCheck: new Date().toLocaleTimeString()
        };
      }
    }

    // SessionStorage检查
    const sessionStorageIndex = storage.findIndex(s => s.name === 'SessionStorage');
    if (sessionStorageIndex !== -1) {
      try {
        const testKey = 'session_test_' + Date.now();
        sessionStorage.setItem(testKey, 'test');
        sessionStorage.removeItem(testKey);
        
        storage[sessionStorageIndex] = {
          ...storage[sessionStorageIndex],
          status: 'online',
          lastCheck: new Date().toLocaleTimeString(),
          responseTime: 1
        };
      } catch (error) {
        storage[sessionStorageIndex] = {
          ...storage[sessionStorageIndex],
          status: 'error',
          errorMessage: 'SessionStorage不可用',
          lastCheck: new Date().toLocaleTimeString()
        };
      }
    }

    // IndexedDB检查
    const indexedDBIndex = storage.findIndex(s => s.name === 'IndexedDB');
    if (indexedDBIndex !== -1) {
      try {
        if ('indexedDB' in window) {
          const request = indexedDB.open('test_db', 1);
          request.onsuccess = () => {
            storage[indexedDBIndex] = {
              ...storage[indexedDBIndex],
              status: 'online',
              lastCheck: new Date().toLocaleTimeString(),
              responseTime: 5
            };
            request.result.close();
            indexedDB.deleteDatabase('test_db');
          };
          request.onerror = () => {
            storage[indexedDBIndex] = {
              ...storage[indexedDBIndex],
              status: 'error',
              errorMessage: 'IndexedDB访问失败',
              lastCheck: new Date().toLocaleTimeString()
            };
          };
        } else {
          storage[indexedDBIndex] = {
            ...storage[indexedDBIndex],
            status: 'offline',
            errorMessage: 'IndexedDB不支持',
            lastCheck: new Date().toLocaleTimeString()
          };
        }
      } catch (error) {
        storage[indexedDBIndex] = {
          ...storage[indexedDBIndex],
          status: 'error',
          errorMessage: 'IndexedDB检查失败',
          lastCheck: new Date().toLocaleTimeString()
        };
      }
    }
  };

  const checkDatabaseConnections = async (storage: StorageStatus[]) => {
    const databases = ['MySQL', 'MongoDB', 'Redis', 'OpenSearch'];
    
    for (const dbName of databases) {
      const dbIndex = storage.findIndex(s => s.name === dbName);
      if (dbIndex !== -1) {
        try {
          const startTime = Date.now();
          
          // 尝试连接数据库API端点
          const response = await fetch(`/api/storage/check/${dbName.toLowerCase()}`, {
            method: 'GET',
            timeout: 5000
          } as any);
          
          const responseTime = Date.now() - startTime;
          
          if (response.ok) {
            const data = await response.json();
            storage[dbIndex] = {
              ...storage[dbIndex],
              status: data.connected ? 'online' : 'offline',
              lastCheck: new Date().toLocaleTimeString(),
              responseTime,
              errorMessage: data.connected ? undefined : data.error
            };
          } else {
            storage[dbIndex] = {
              ...storage[dbIndex],
              status: 'offline',
              lastCheck: new Date().toLocaleTimeString(),
              responseTime,
              errorMessage: `HTTP ${response.status}`
            };
          }
        } catch (error) {
          storage[dbIndex] = {
            ...storage[dbIndex],
            status: 'offline',
            lastCheck: new Date().toLocaleTimeString(),
            errorMessage: '连接超时或服务未启动'
          };
        }
      }
    }
  };

  const checkFileSystem = async (storage: StorageStatus[]) => {
    const fsIndex = storage.findIndex(s => s.name === 'File System');
    if (fsIndex !== -1) {
      try {
        // 检查文件上传API
        const response = await fetch('/api/storage/check/filesystem');
        
        if (response.ok) {
          const data = await response.json();
          storage[fsIndex] = {
            ...storage[fsIndex],
            status: data.available ? 'online' : 'offline',
            lastCheck: new Date().toLocaleTimeString(),
            responseTime: 10,
            errorMessage: data.available ? undefined : data.error
          };
        } else {
          storage[fsIndex] = {
            ...storage[fsIndex],
            status: 'offline',
            lastCheck: new Date().toLocaleTimeString(),
            errorMessage: '文件系统API不可用'
          };
        }
      } catch (error) {
        storage[fsIndex] = {
          ...storage[fsIndex],
          status: 'error',
          lastCheck: new Date().toLocaleTimeString(),
          errorMessage: '文件系统检查失败'
        };
      }
    }
  };

  const checkCloudStorage = async (storage: StorageStatus[]) => {
    const cloudIndex = storage.findIndex(s => s.name === 'Cloud Storage');
    if (cloudIndex !== -1) {
      try {
        // 检查云存储配置
        const response = await fetch('/api/storage/check/cloud');
        
        if (response.ok) {
          const data = await response.json();
          storage[cloudIndex] = {
            ...storage[cloudIndex],
            status: data.configured ? 'online' : 'offline',
            lastCheck: new Date().toLocaleTimeString(),
            responseTime: 50,
            errorMessage: data.configured ? undefined : '云存储未配置'
          };
        } else {
          storage[cloudIndex] = {
            ...storage[cloudIndex],
            status: 'offline',
            lastCheck: new Date().toLocaleTimeString(),
            errorMessage: '云存储API不可用'
          };
        }
      } catch (error) {
        storage[cloudIndex] = {
          ...storage[cloudIndex],
          status: 'offline',
          lastCheck: new Date().toLocaleTimeString(),
          errorMessage: '云存储未配置'
        };
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'offline':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'checking':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-100 text-green-800">在线</Badge>;
      case 'offline':
        return <Badge className="bg-red-100 text-red-800">离线</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">错误</Badge>;
      case 'checking':
        return <Badge className="bg-blue-100 text-blue-800">检查中</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">未知</Badge>;
    }
  };

  const onlineCount = storageList.filter(s => s.status === 'online').length;
  const offlineCount = storageList.filter(s => s.status === 'offline' || s.status === 'error').length;
  const totalCount = storageList.length;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* 页面标题 */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          存储可用性检查
        </h1>
        <p className="text-xl text-muted-foreground">
          检查YouCreator.AI平台各种存储服务的运行状态
        </p>
      </div>

      {/* 总体状态 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            总体状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{onlineCount}</div>
              <div className="text-sm text-muted-foreground">在线服务</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{offlineCount}</div>
              <div className="text-sm text-muted-foreground">离线服务</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{totalCount}</div>
              <div className="text-sm text-muted-foreground">总服务数</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {totalCount > 0 ? Math.round((onlineCount / totalCount) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">可用率</div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              最后检查: {lastCheckTime || '未检查'}
            </div>
            <Button onClick={checkAllStorage} disabled={isChecking}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? '检查中...' : '重新检查'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 存储服务列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storageList.map((storage, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {storage.icon}
                  <CardTitle className="text-lg">{storage.name}</CardTitle>
                </div>
                {getStatusIcon(storage.status)}
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(storage.status)}
                <Badge variant="outline">{storage.type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {storage.description}
              </p>
              
              {storage.url && (
                <div className="text-xs text-muted-foreground">
                  <strong>地址:</strong> {storage.url}
                </div>
              )}
              
              {storage.lastCheck && (
                <div className="text-xs text-muted-foreground">
                  <strong>检查时间:</strong> {storage.lastCheck}
                </div>
              )}
              
              {storage.responseTime && (
                <div className="text-xs text-muted-foreground">
                  <strong>响应时间:</strong> {storage.responseTime}ms
                </div>
              )}
              
              {storage.errorMessage && (
                <div className="text-xs text-red-600">
                  <strong>错误:</strong> {storage.errorMessage}
                </div>
              )}
              
              {storage.features && (
                <div>
                  <div className="text-xs font-medium mb-1">功能特性:</div>
                  <div className="flex flex-wrap gap-1">
                    {storage.features.map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 存储架构说明 */}
      <Card>
        <CardHeader>
          <CardTitle>存储架构说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">浏览器存储</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• LocalStorage: 持久化用户设置和登录状态</li>
                <li>• SessionStorage: 临时会话数据</li>
                <li>• IndexedDB: 离线数据和大容量存储</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">服务端存储</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• MySQL: 用户数据、项目信息、权限管理</li>
                <li>• MongoDB: 创作内容、版本历史、媒体元数据</li>
                <li>• Redis: 缓存、会话、实时数据</li>
                <li>• OpenSearch: 全文搜索、内容分析</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">文件存储</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 本地文件系统: 临时文件、开发环境</li>
                <li>• 云存储: 生产环境大文件存储</li>
                <li>• CDN: 静态资源加速分发</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">数据流向</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 用户操作 → 浏览器存储 → API → 服务端存储</li>
                <li>• 文件上传 → 临时存储 → 云存储/CDN</li>
                <li>• 搜索请求 → OpenSearch → 结果缓存</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
