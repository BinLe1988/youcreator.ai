import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || '',
      db: process.env.REDIS_DB || 0
    };

    const isConnected = await checkRedisConnection(redisConfig);
    
    return NextResponse.json({
      connected: isConnected,
      service: 'Redis',
      config: {
        host: redisConfig.host,
        port: redisConfig.port,
        db: redisConfig.db
      },
      timestamp: new Date().toISOString(),
      error: isConnected ? null : 'Redis服务未启动或配置错误'
    });

  } catch (error) {
    console.error('Redis check error:', error);
    return NextResponse.json({
      connected: false,
      service: 'Redis',
      error: '连接检查失败: ' + (error instanceof Error ? error.message : '未知错误'),
      timestamp: new Date().toISOString()
    });
  }
}

async function checkRedisConnection(config: any): Promise<boolean> {
  try {
    // 这里应该使用真实的Redis连接库，如ioredis
    // 现在模拟检查逻辑
    
    const { exec } = require('child_process');
    
    return new Promise((resolve) => {
      // 尝试连接Redis端口
      exec(`nc -z ${config.host} ${config.port}`, (error: any) => {
        if (error) {
          resolve(false);
        } else {
          // 进一步检查Redis是否响应
          exec(`redis-cli -h ${config.host} -p ${config.port} ping`, (pingError: any, stdout: string) => {
            if (pingError || !stdout.includes('PONG')) {
              resolve(false);
            } else {
              resolve(true);
            }
          });
        }
      });
      
      setTimeout(() => resolve(false), 3000);
    });
  } catch (error) {
    return false;
  }
}
