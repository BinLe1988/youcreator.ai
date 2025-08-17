'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function VerifyLoginPage() {
  const router = useRouter();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const addResult = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    setTestResults(prev => [...prev, `${timestamp} ${icon} ${message}`]);
  };

  const checkCurrentUser = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      const userInfo = localStorage.getItem('user_info');
      
      if (token && userInfo) {
        try {
          const user = JSON.parse(userInfo);
          setCurrentUser(user);
          addResult(`检测到已登录用户: ${user.username} (${user.email})`, 'success');
        } catch (error) {
          addResult('用户信息解析失败', 'error');
        }
      } else {
        addResult('当前未登录');
      }
    }
  };

  const testAutoLogin = async () => {
    addResult('开始自动登录测试...');
    
    const testCredentials = {
      email: 'demo@youcreator.ai',
      password: '123456'
    };

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCredentials),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_info', JSON.stringify(data.user));
        setCurrentUser(data.user);
        addResult(`自动登录成功: ${data.user.username}`, 'success');
      } else {
        addResult(`自动登录失败: ${data.message}`, 'error');
      }
    } catch (error) {
      addResult(`自动登录错误: ${error}`, 'error');
    }
  };

  const testLogout = () => {
    addResult('执行登出操作...');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    setCurrentUser(null);
    addResult('登出成功', 'success');
  };

  const goToLogin = () => {
    router.push('/login');
  };

  const goToDebug = () => {
    router.push('/debug-login');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔍 登录功能验证页面</h1>
      
      {/* 当前状态 */}
      <Card style={{ marginBottom: '20px' }}>
        <CardHeader>
          <CardTitle>当前登录状态</CardTitle>
        </CardHeader>
        <CardContent>
          {currentUser ? (
            <div style={{ padding: '15px', backgroundColor: '#d4edda', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#155724' }}>✅ 已登录</h4>
              <p><strong>用户名:</strong> {currentUser.username}</p>
              <p><strong>邮箱:</strong> {currentUser.email}</p>
              <p><strong>角色:</strong> {currentUser.role}</p>
              <p><strong>用户ID:</strong> {currentUser.id}</p>
            </div>
          ) : (
            <div style={{ padding: '15px', backgroundColor: '#f8d7da', borderRadius: '8px', border: '1px solid #f5c6cb' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#721c24' }}>❌ 未登录</h4>
              <p>请先登录以使用完整功能</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <Card style={{ marginBottom: '20px' }}>
        <CardHeader>
          <CardTitle>操作控制</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button onClick={checkCurrentUser} variant="outline">
              刷新状态
            </Button>
            <Button onClick={testAutoLogin} disabled={!!currentUser}>
              自动登录测试
            </Button>
            <Button onClick={testLogout} disabled={!currentUser} variant="outline">
              登出
            </Button>
            <Button onClick={goToLogin} variant="outline">
              前往登录页
            </Button>
            <Button onClick={goToDebug} variant="outline">
              调试页面
            </Button>
            <Button onClick={clearResults} variant="outline">
              清空日志
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 测试日志 */}
      <Card>
        <CardHeader>
          <CardTitle>测试日志 ({testResults.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto', 
            backgroundColor: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '14px',
            border: '1px solid #dee2e6'
          }}>
            {testResults.length > 0 ? (
              testResults.map((result, index) => (
                <div key={index} style={{ marginBottom: '8px', lineHeight: '1.4' }}>
                  {result}
                </div>
              ))
            ) : (
              <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
                暂无测试日志，点击上方按钮开始测试
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 使用说明 */}
      <Card style={{ marginTop: '20px' }}>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <h4>测试步骤:</h4>
            <ol>
              <li><strong>检查当前状态:</strong> 查看是否已经登录</li>
              <li><strong>自动登录测试:</strong> 使用预设账户自动登录</li>
              <li><strong>手动登录测试:</strong> 点击"前往登录页"进行手动登录</li>
              <li><strong>功能验证:</strong> 登录后检查导航栏是否显示用户信息</li>
              <li><strong>登出测试:</strong> 测试登出功能是否正常</li>
            </ol>
            
            <h4 style={{ marginTop: '20px' }}>预设测试账户:</h4>
            <p><strong>演示账户:</strong> demo@youcreator.ai / 123456</p>
            <p><strong>管理员账户:</strong> admin@youcreator.ai / admin123</p>
            
            <h4 style={{ marginTop: '20px' }}>故障排除:</h4>
            <p>如果登录仍然失败，请:</p>
            <ul>
              <li>检查浏览器控制台是否有JavaScript错误</li>
              <li>确认网络连接正常</li>
              <li>尝试清空浏览器缓存和LocalStorage</li>
              <li>使用调试页面进行详细测试</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
