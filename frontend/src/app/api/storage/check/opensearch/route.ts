import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const opensearchConfig = {
      host: process.env.OPENSEARCH_HOST || 'localhost',
      port: process.env.OPENSEARCH_PORT || 9200,
      url: process.env.OPENSEARCH_URL || 'http://localhost:9200',
      username: process.env.OPENSEARCH_USERNAME || 'admin',
      password: process.env.OPENSEARCH_PASSWORD || 'admin'
    };

    const isConnected = await checkOpenSearchConnection(opensearchConfig);
    
    return NextResponse.json({
      connected: isConnected,
      service: 'OpenSearch',
      config: {
        host: opensearchConfig.host,
        port: opensearchConfig.port,
        url: opensearchConfig.url
      },
      timestamp: new Date().toISOString(),
      error: isConnected ? null : 'OpenSearch服务未启动或配置错误'
    });

  } catch (error) {
    console.error('OpenSearch check error:', error);
    return NextResponse.json({
      connected: false,
      service: 'OpenSearch',
      error: '连接检查失败: ' + (error instanceof Error ? error.message : '未知错误'),
      timestamp: new Date().toISOString()
    });
  }
}

async function checkOpenSearchConnection(config: any): Promise<boolean> {
  try {
    // 尝试访问OpenSearch健康检查端点
    const response = await fetch(`${config.url}/_cluster/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 添加超时
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const health = await response.json();
      return health.status === 'green' || health.status === 'yellow';
    }
    
    return false;
  } catch (error) {
    // 如果HTTP请求失败，尝试端口检查
    try {
      const { exec } = require('child_process');
      
      return new Promise((resolve) => {
        exec(`nc -z ${config.host} ${config.port}`, (error: any) => {
          resolve(!error);
        });
        
        setTimeout(() => resolve(false), 3000);
      });
    } catch (portError) {
      return false;
    }
  }
}
