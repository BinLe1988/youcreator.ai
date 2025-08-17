import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const mongoConfig = {
      host: process.env.MONGODB_HOST || 'localhost',
      port: process.env.MONGODB_PORT || 27017,
      database: process.env.MONGODB_DATABASE || 'youcreator',
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/youcreator'
    };

    const isConnected = await checkMongoDBConnection(mongoConfig);
    
    return NextResponse.json({
      connected: isConnected,
      service: 'MongoDB',
      config: {
        host: mongoConfig.host,
        port: mongoConfig.port,
        database: mongoConfig.database
      },
      timestamp: new Date().toISOString(),
      error: isConnected ? null : 'MongoDB服务未启动或配置错误'
    });

  } catch (error) {
    console.error('MongoDB check error:', error);
    return NextResponse.json({
      connected: false,
      service: 'MongoDB',
      error: '连接检查失败: ' + (error instanceof Error ? error.message : '未知错误'),
      timestamp: new Date().toISOString()
    });
  }
}

async function checkMongoDBConnection(config: any): Promise<boolean> {
  try {
    // 这里应该使用真实的MongoDB连接库，如mongodb
    // 现在模拟检查逻辑
    
    const { exec } = require('child_process');
    
    return new Promise((resolve) => {
      // 尝试连接MongoDB端口
      exec(`nc -z ${config.host} ${config.port}`, (error: any) => {
        if (error) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
      
      setTimeout(() => resolve(false), 3000);
    });
  } catch (error) {
    return false;
  }
}
