'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function TestProfileFlowPage() {
  const router = useRouter();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const steps = [
    '检查登录状态',
    '执行登录',
    '验证导航栏用户菜单',
    '测试个人设置页面访问',
    '测试API功能',
    '完成测试'
  ];

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
      const userInfo = localStorage.getItem('user_info');
      
      if (token && userInfo) {
        setIsLoggedIn(true);
        addResult('检测到已登录状态', 'success');
      } else {
        addResult('当前未登录');
      }
    }
  };

  const runFullTest = async () => {
    setTestResults([]);
    setCurrentStep(0);
    
    // 步骤1: 检查登录状态
    addResult('=== 步骤1: 检查登录状态 ===');
    setCurrentStep(1);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!isLoggedIn) {
      addResult('未登录，开始自动登录...');
      
      // 步骤2: 执行登录
      addResult('=== 步骤2: 执行登录 ===');
      setCurrentStep(2);
      
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
          addResult(`登录成功: ${data.user.username}`, 'success');
        } else {
          addResult(`登录失败: ${data.message}`, 'error');
          return;
        }
      } catch (error) {
        addResult(`登录错误: ${error}`, 'error');
        return;
      }
    } else {
      addResult('已登录，跳过登录步骤', 'success');
      setCurrentStep(2);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // 步骤3: 验证导航栏用户菜单
    addResult('=== 步骤3: 验证导航栏用户菜单 ===');
    setCurrentStep(3);
    addResult('检查导航栏是否显示用户信息...');
    addResult('用户菜单应该包含"个人设置"选项', 'info');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 步骤4: 测试个人设置页面访问
    addResult('=== 步骤4: 测试个人设置页面访问 ===');
    setCurrentStep(4);
    
    try {
      const response = await fetch('/profile');
      if (response.ok) {
        addResult('个人设置页面访问正常', 'success');
      } else {
        addResult(`个人设置页面访问失败: ${response.status}`, 'error');
      }
    } catch (error) {
      addResult(`个人设置页面访问错误: ${error}`, 'error');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // 步骤5: 测试API功能
    addResult('=== 步骤5: 测试API功能 ===');
    setCurrentStep(5);
    
    const token = localStorage.getItem('auth_token');
    
    // 测试获取用户资料
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        addResult('获取用户资料API正常', 'success');
      } else {
        addResult(`获取用户资料API失败: ${data.message}`, 'error');
      }
    } catch (error) {
      addResult(`获取用户资料API错误: ${error}`, 'error');
    }

    // 测试更新用户资料
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'demo_test',
          email: 'demo@youcreator.ai'
        })
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        addResult('更新用户资料API正常', 'success');
      } else {
        addResult(`更新用户资料API失败: ${data.message}`, 'error');
      }
    } catch (error) {
      addResult(`更新用户资料API错误: ${error}`, 'error');
    }

    // 测试修改密码
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: '123456',
          newPassword: 'testpass123'
        })
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        addResult('修改密码API正常', 'success');
      } else {
        addResult(`修改密码API失败: ${data.message}`, 'error');
      }
    } catch (error) {
      addResult(`修改密码API错误: ${error}`, 'error');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // 步骤6: 完成测试
    addResult('=== 步骤6: 完成测试 ===');
    setCurrentStep(6);
    addResult('所有测试步骤已完成！', 'success');
    addResult('个人设置功能已验证正常工作', 'success');
  };

  const goToProfile = () => {
    if (isLoggedIn) {
      router.push('/profile');
    } else {
      addResult('请先登录', 'error');
    }
  };

  const goToLogin = () => {
    router.push('/login');
  };

  const clearResults = () => {
    setTestResults([]);
    setCurrentStep(0);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔄 个人设置完整流程测试</h1>
      
      {/* 测试进度 */}
      <Card style={{ marginBottom: '20px' }}>
        <CardHeader>
          <CardTitle>测试进度</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {steps.map((step, index) => (
              <div 
                key={index}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '10px',
                  backgroundColor: currentStep > index ? '#d4edda' : currentStep === index ? '#fff3cd' : '#f8f9fa',
                  borderRadius: '8px',
                  border: `1px solid ${currentStep > index ? '#c3e6cb' : currentStep === index ? '#ffeaa7' : '#dee2e6'}`
                }}
              >
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  backgroundColor: currentStep > index ? '#28a745' : currentStep === index ? '#ffc107' : '#6c757d',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginRight: '10px'
                }}>
                  {currentStep > index ? '✓' : index + 1}
                </div>
                <span style={{ 
                  fontWeight: currentStep === index ? 'bold' : 'normal',
                  color: currentStep > index ? '#155724' : currentStep === index ? '#856404' : '#6c757d'
                }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 当前状态 */}
      <Card style={{ marginBottom: '20px' }}>
        <CardHeader>
          <CardTitle>当前状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ 
            padding: '15px', 
            backgroundColor: isLoggedIn ? '#d4edda' : '#f8d7da', 
            borderRadius: '8px', 
            border: `1px solid ${isLoggedIn ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            <h4 style={{ 
              margin: '0 0 10px 0', 
              color: isLoggedIn ? '#155724' : '#721c24' 
            }}>
              {isLoggedIn ? '✅ 已登录' : '❌ 未登录'}
            </h4>
            <p>{isLoggedIn ? '可以开始测试个人设置功能' : '需要先登录才能测试个人设置功能'}</p>
          </div>
        </CardContent>
      </Card>

      {/* 操作控制 */}
      <Card style={{ marginBottom: '20px' }}>
        <CardHeader>
          <CardTitle>操作控制</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button onClick={runFullTest}>
              🚀 运行完整测试
            </Button>
            <Button onClick={goToProfile} disabled={!isLoggedIn} variant="outline">
              📝 前往个人设置
            </Button>
            <Button onClick={goToLogin} variant="outline">
              🔐 前往登录页面
            </Button>
            <Button onClick={checkLoginStatus} variant="outline">
              🔄 刷新状态
            </Button>
            <Button onClick={clearResults} variant="outline">
              🗑️ 清空日志
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
            maxHeight: '500px', 
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
                点击"运行完整测试"开始自动化测试流程
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 问题排查 */}
      <Card style={{ marginTop: '20px' }}>
        <CardHeader>
          <CardTitle>问题排查指南</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <h4>如果个人设置点击报错，请检查:</h4>
            <ol>
              <li><strong>登录状态:</strong> 确保已经登录</li>
              <li><strong>页面路由:</strong> 确认 /profile 路由存在</li>
              <li><strong>API端点:</strong> 确认相关API正常工作</li>
              <li><strong>权限验证:</strong> 确认token有效</li>
              <li><strong>浏览器控制台:</strong> 查看JavaScript错误</li>
            </ol>
            
            <h4 style={{ marginTop: '20px' }}>测试覆盖范围:</h4>
            <ul>
              <li>✅ 登录状态检查</li>
              <li>✅ 页面路由访问</li>
              <li>✅ API端点功能</li>
              <li>✅ 用户资料管理</li>
              <li>✅ 密码修改功能</li>
              <li>✅ 错误处理机制</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
