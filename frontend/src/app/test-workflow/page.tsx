'use client';

import React, { useState, useEffect } from 'react';

export default function TestWorkflowPage() {
  const [templates, setTemplates] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('开始加载数据...');
        
        // 直接使用fetch而不是apiClient
        const templatesResponse = await fetch('/api/v1/workflow/templates');
        console.log('模板API响应状态:', templatesResponse.status);
        
        if (!templatesResponse.ok) {
          throw new Error(`模板API错误: ${templatesResponse.status}`);
        }
        
        const templatesData = await templatesResponse.json();
        console.log('模板数据:', templatesData);
        setTemplates(templatesData.templates || []);

        const workflowsResponse = await fetch('/api/v1/workflow/list');
        console.log('工作流API响应状态:', workflowsResponse.status);
        
        if (!workflowsResponse.ok) {
          throw new Error(`工作流API错误: ${workflowsResponse.status}`);
        }
        
        const workflowsData = await workflowsResponse.json();
        console.log('工作流数据:', workflowsData);
        setWorkflows(workflowsData.workflows || []);
        
      } catch (err) {
        console.error('加载数据失败:', err);
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>AI工作流测试页面</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>加载状态</h2>
        <p>加载中: {loading ? '是' : '否'}</p>
        {error && <p style={{ color: 'red' }}>错误: {error}</p>}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>模板数据 ({templates.length})</h2>
        {templates.length > 0 ? (
          <ul>
            {templates.map((template: any) => (
              <li key={template.id}>
                {template.name} - {template.category} - {template.difficulty}
              </li>
            ))}
          </ul>
        ) : (
          <p>没有模板数据</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>工作流数据 ({workflows.length})</h2>
        {workflows.length > 0 ? (
          <ul>
            {workflows.map((workflow: any) => (
              <li key={workflow.id}>
                {workflow.name} - v{workflow.version}
              </li>
            ))}
          </ul>
        ) : (
          <p>没有工作流数据</p>
        )}
      </div>

      <div>
        <h2>浏览器控制台</h2>
        <p>请打开浏览器开发者工具查看详细日志</p>
      </div>
    </div>
  );
}
