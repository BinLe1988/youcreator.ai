'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function TestProfilePage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const addResult = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    setTestResults(prev => [...prev, `${timestamp} ${icon} ${message}`]);
  };

  const checkLoginStatus = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      const userInfoStr = localStorage.getItem('user_info');
      
      if (token && userInfoStr) {
        try {
          const user = JSON.parse(userInfoStr);
          setIsLoggedIn(true);
          setUserInfo(user);
          addResult(`检测到登录用户: ${user.username}`, 'success');
        } catch (error) {
          addResult('用户信息解析失败', 'error');
        }
      } else {
        addResult('当前未登录，需要先登录才能访问个人设置');
      }
    }
  };

  const testLogin = async () => {
    addResult('开始自动登录测试...');
    
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

      if (response.ok && data.success) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_info', JSON.stringify(data.user));
        setIsLoggedIn(true);
        setUserInfo(data.user);
        addResult(`登录成功: ${data.user.username}`, 'success');
      } else {
        addResult(`登录失败: ${data.message}`, 'error');
      }
    } catch (error) {
      addResult(`登录错误: ${error}`, 'error');
    }
  };

  const testGetProfile = async () => {
    if (!isLoggedIn) {
      addResult('请先登录', 'error');
      return;
    }

    addResult('测试获取用户资料...');
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        addResult(`获取用户资料成功: ${data.user.username}`, 'success');
      } else {
        addResult(`获取用户资料失败: ${data.message}`, 'error');
      }
    } catch (error) {
      addResult(`获取用户资料错误: ${error}`, 'error');
    }
  };

  const testUpdateProfile = async () => {
    if (!isLoggedIn) {
      addResult('请先登录', 'error');
      return;
    }

    addResult('测试更新用户资料...');
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'demo_updated',
          email: 'demo@youcreator.ai',
          phone: '+86 138****8888',
          bio: '这是更新后的个人简介',
          location: '上海市',
          website: 'https://example.com'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        addResult(`更新用户资料成功`, 'success');
        // 更新本地用户信息
        localStorage.setItem('user_info', JSON.stringify(data.user));
        setUserInfo(data.user);
      } else {
        addResult(`更新用户资料失败: ${data.message}`, 'error');
      }
    } catch (error) {
      addResult(`更新用户资料错误: ${error}`, 'error');
    }
  };

  const testChangePassword = async () => {
    if (!isLoggedIn) {
      addResult('请先登录', 'error');
      return;
    }

    addResult('测试修改密码...');
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: '123456',
          newPassword: 'newpass123'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        addResult(`修改密码成功`, 'success');
      } else {
        addResult(`修改密码失败: ${data.message}`, 'error');
      }
    } catch (error) {
      addResult(`修改密码错误: ${error}`, 'error');
    }
  };

  const goToProfile = () => {
    if (isLoggedIn) {
      window.location.href = '/profile';
    } else {
      addResult('请先登录', 'error');
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>👤 个人设置功能测试</h1>
      
      {/* 登录状态 */}
      <Card style={{ marginBottom: '20px' }}>
        <CardHeader>
          <CardTitle>当前状态</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoggedIn && userInfo ? (
            <div style={{ padding: '15px', backgroundColor: '#d4edda', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#155724' }}>✅ 已登录</h4>
              <p><strong>用户名:</strong> {userInfo.username}</p>
              <p><strong>邮箱:</strong> {userInfo.email}</p>
              <p><strong>角色:</strong> {userInfo.role}</p>
            </div>
          ) : (
            <div style={{ padding: '15px', backgroundColor: '#f8d7da', borderRadius: '8px', border: '1px solid #f5c6cb' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#721c24' }}>❌ 未登录</h4>
              <p>需要先登录才能测试个人设置功能</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 测试控制 */}
      <Card style={{ marginBottom: '20px' }}>
        <CardHeader>
          <CardTitle>功能测试</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
            <Button onClick={testLogin} disabled={isLoggedIn} variant="outline">
              自动登录
            </Button>
            <Button onClick={testGetProfile} disabled={!isLoggedIn} variant="outline">
              获取资料
            </Button>
            <Button onClick={testUpdateProfile} disabled={!isLoggedIn} variant="outline">
              更新资料
            </Button>
            <Button onClick={testChangePassword} disabled={!isLoggedIn} variant="outline">
              修改密码
            </Button>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button onClick={goToProfile} disabled={!isLoggedIn}>
              前往个人设置
            </Button>
            <Button onClick={checkLoginStatus} variant="outline">
              刷新状态
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
              <li><strong>自动登录:</strong> 使用演示账户登录</li>
              <li><strong>获取资料:</strong> 测试获取用户资料API</li>
              <li><strong>更新资料:</strong> 测试更新用户信息</li>
              <li><strong>修改密码:</strong> 测试密码修改功能</li>
              <li><strong>前往个人设置:</strong> 访问完整的个人设置页面</li>
            </ol>
            
            <h4 style={{ marginTop: '20px' }}>功能特色:</h4>
            <ul>
              <li>✅ 个人信息管理 - 用户名、邮箱、手机、简介等</li>
              <li>✅ 头像上传 - 支持图片上传和预览</li>
              <li>✅ 密码修改 - 安全的密码更新</li>
              <li>✅ 通知设置 - 邮件、推送通知管理</li>
              <li>✅ 界面设置 - 主题、语言偏好</li>
              <li>✅ 数据导出 - 下载个人数据</li>
              <li>✅ 账户删除 - 危险操作保护</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
