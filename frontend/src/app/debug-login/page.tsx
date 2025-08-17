'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DebugLoginPage() {
  const [email, setEmail] = useState('demo@youcreator.ai');
  const [password, setPassword] = useState('123456');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult('开始登录请求...');

    try {
      console.log('发送登录请求:', { email, password });
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('响应状态:', response.status);
      console.log('响应头:', response.headers);

      const data = await response.json();
      console.log('响应数据:', data);

      if (response.ok) {
        if (data.success) {
          setResult(`✅ 登录成功！
用户: ${data.user.username}
邮箱: ${data.user.email}
Token: ${data.token.substring(0, 20)}...`);
          
          // 保存到localStorage
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user_info', JSON.stringify(data.user));
        } else {
          setResult(`❌ 登录失败: ${data.message}`);
        }
      } else {
        setResult(`❌ HTTP错误: ${response.status} - ${data.message || '未知错误'}`);
      }
    } catch (error) {
      console.error('登录错误:', error);
      setResult(`❌ 网络错误: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectAPI = async () => {
    setResult('测试直接API调用...');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'demo@youcreator.ai',
          password: '123456'
        }),
      });

      const data = await response.json();
      setResult(`直接API测试结果:
状态: ${response.status}
成功: ${data.success}
消息: ${data.message}
数据: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`直接API测试失败: ${error}`);
    }
  };

  const checkLocalStorage = () => {
    const token = localStorage.getItem('auth_token');
    const userInfo = localStorage.getItem('user_info');
    
    setResult(`LocalStorage检查:
Token: ${token ? token.substring(0, 30) + '...' : '无'}
用户信息: ${userInfo || '无'}`);
  };

  const clearStorage = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    setResult('已清空LocalStorage');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔍 登录调试页面</h1>
      
      <form onSubmit={handleLogin} style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>登录表单测试</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label>邮箱:</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginTop: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>密码:</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginTop: '5px' }}
          />
        </div>
        
        <Button type="submit" disabled={isLoading} style={{ marginRight: '10px' }}>
          {isLoading ? '登录中...' : '登录'}
        </Button>
        
        <Button type="button" onClick={testDirectAPI} variant="outline" style={{ marginRight: '10px' }}>
          测试API
        </Button>
        
        <Button type="button" onClick={checkLocalStorage} variant="outline" style={{ marginRight: '10px' }}>
          检查存储
        </Button>
        
        <Button type="button" onClick={clearStorage} variant="outline">
          清空存储
        </Button>
      </form>

      <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>测试结果:</h3>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '14px' }}>
          {result || '点击按钮开始测试'}
        </pre>
      </div>

      <div style={{ padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <h3>预设测试账户:</h3>
        <p><strong>演示账户:</strong></p>
        <p>邮箱: demo@youcreator.ai</p>
        <p>密码: 123456</p>
        <br />
        <p><strong>管理员账户:</strong></p>
        <p>邮箱: admin@youcreator.ai</p>
        <p>密码: admin123</p>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>💡 使用浏览器开发者工具查看控制台日志获取更多调试信息</p>
      </div>
    </div>
  );
}
