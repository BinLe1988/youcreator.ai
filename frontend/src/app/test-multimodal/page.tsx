'use client';

import React, { useState } from 'react';

export default function TestMultimodalPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testTextToImage = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('开始调用API...');
      const response = await fetch('/api/v1/multimodal/text-to-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '一只可爱的小猫',
          style: 'realistic',
          width: 512,
          height: 512
        })
      });

      console.log('API响应状态:', response.status);
      console.log('API响应头:', response.headers);

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setResult(`成功生成图片: ${imageUrl}`);
        console.log('图片URL:', imageUrl);
      } else {
        const errorText = await response.text();
        setResult(`API错误 ${response.status}: ${errorText}`);
        console.error('API错误:', response.status, errorText);
      }
    } catch (error) {
      console.error('网络错误:', error);
      setResult(`网络错误: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>多模态API测试页面</h1>
      
      <button 
        onClick={testTextToImage}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? '测试中...' : '测试文字配图API'}
      </button>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h3>测试结果:</h3>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {result || '点击按钮开始测试'}
        </pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>浏览器控制台:</h3>
        <p>请打开浏览器开发者工具的控制台查看详细日志</p>
      </div>
    </div>
  );
}
