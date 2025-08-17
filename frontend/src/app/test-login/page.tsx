'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function TestLoginPage() {
  const [user, setUser] = useState<any>(null);
  const [loginForm, setLoginForm] = useState({
    email: 'demo@youcreator.ai',
    password: '123456'
  });
  const [testResults, setTestResults] = useState<string[]>([]);

  // 检查登录状态
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        const userInfo = localStorage.getItem('user_info');
        
        if (token && userInfo) {
          try {
            setUser(JSON.parse(userInfo));
            addTestResult('✅ 检测到已登录用户: ' + JSON.parse(userInfo).username);
          } catch (error) {
            addTestResult('❌ 用户信息解析失败');
          }
        } else {
          addTestResult('ℹ️ 当前未登录');
        }
      }
    };

    checkAuth();
  }, []);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // 测试登录
  const testLogin = async () => {
    addTestResult('🔄 开始测试登录...');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_info', JSON.stringify(data.user));
        setUser(data.user);
        addTestResult('✅ 登录成功: ' + data.user.username);
      } else {
        addTestResult('❌ 登录失败: ' + data.message);
      }
    } catch (error) {
      addTestResult('❌ 登录请求失败: ' + error);
    }
  };

  // 测试登出
  const testLogout = async () => {
    addTestResult('🔄 开始测试登出...');
    
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        setUser(null);
        addTestResult('✅ 登出成功');
      } else {
        addTestResult('❌ 登出失败: ' + data.message);
      }
    } catch (error) {
      addTestResult('❌ 登出请求失败: ' + error);
    }
  };

  // 测试注册
  const testRegister = async () => {
    addTestResult('🔄 开始测试注册...');
    
    const registerData = {
      username: 'testuser' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: '123456'
    };

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        addTestResult('✅ 注册成功: ' + registerData.username);
      } else {
        addTestResult('❌ 注册失败: ' + data.message);
      }
    } catch (error) {
      addTestResult('❌ 注册请求失败: ' + error);
    }
  };

  // 清空测试结果
  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔐 登录功能测试页面</h1>
      
      {/* 当前状态 */}
      <Card style={{ marginBottom: '20px' }}>
        <CardHeader>
          <CardTitle>当前登录状态</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div>
              <p><strong>已登录用户:</strong> {user.username}</p>
              <p><strong>邮箱:</strong> {user.email}</p>
              <p><strong>角色:</strong> {user.role}</p>
              <p><strong>ID:</strong> {user.id}</p>
            </div>
          ) : (
            <p>当前未登录</p>
          )}
        </CardContent>
      </Card>

      {/* 测试控制 */}
      <Card style={{ marginBottom: '20px' }}>
        <CardHeader>
          <CardTitle>测试控制</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            <div>
              <label>邮箱:</label>
              <Input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <label>密码:</label>
              <Input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button onClick={testLogin} disabled={!!user}>
              测试登录
            </Button>
            <Button onClick={testLogout} disabled={!user} variant="outline">
              测试登出
            </Button>
            <Button onClick={testRegister} variant="outline">
              测试注册
            </Button>
            <Button onClick={clearResults} variant="outline">
              清空日志
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 测试结果 */}
      <Card>
        <CardHeader>
          <CardTitle>测试日志 ({testResults.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto', 
            backgroundColor: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}>
            {testResults.length > 0 ? (
              testResults.map((result, index) => (
                <div key={index} style={{ marginBottom: '5px' }}>
                  {result}
                </div>
              ))
            ) : (
              <div style={{ color: '#666' }}>暂无测试日志</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 预设账户信息 */}
      <Card style={{ marginTop: '20px' }}>
        <CardHeader>
          <CardTitle>预设测试账户</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ fontSize: '14px' }}>
            <p><strong>演示账户:</strong></p>
            <p>邮箱: demo@youcreator.ai</p>
            <p>密码: 123456</p>
            <br />
            <p><strong>管理员账户:</strong></p>
            <p>邮箱: admin@youcreator.ai</p>
            <p>密码: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
