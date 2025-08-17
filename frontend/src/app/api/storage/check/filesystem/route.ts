import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    const tempDir = process.env.TEMP_DIR || path.join(process.cwd(), 'temp');
    
    const checks = await Promise.all([
      checkDirectoryAccess(uploadDir, 'uploads'),
      checkDirectoryAccess(tempDir, 'temp'),
      checkDiskSpace(),
      checkFileOperations()
    ]);

    const allPassed = checks.every(check => check.success);
    
    return NextResponse.json({
      available: allPassed,
      service: 'File System',
      checks: checks,
      config: {
        uploadDir,
        tempDir
      },
      timestamp: new Date().toISOString(),
      error: allPassed ? null : '文件系统访问受限或空间不足'
    });

  } catch (error) {
    console.error('File system check error:', error);
    return NextResponse.json({
      available: false,
      service: 'File System',
      error: '文件系统检查失败: ' + (error instanceof Error ? error.message : '未知错误'),
      timestamp: new Date().toISOString()
    });
  }
}

async function checkDirectoryAccess(dirPath: string, name: string) {
  try {
    // 检查目录是否存在，不存在则创建
    await fs.access(dirPath);
  } catch (error) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (mkdirError) {
      return {
        name: `${name} directory`,
        success: false,
        error: `无法创建目录: ${dirPath}`
      };
    }
  }

  try {
    // 测试写入权限
    const testFile = path.join(dirPath, `test_${Date.now()}.txt`);
    await fs.writeFile(testFile, 'test');
    await fs.unlink(testFile);
    
    return {
      name: `${name} directory`,
      success: true,
      path: dirPath
    };
  } catch (error) {
    return {
      name: `${name} directory`,
      success: false,
      error: `目录无写入权限: ${dirPath}`
    };
  }
}

async function checkDiskSpace() {
  try {
    const { exec } = require('child_process');
    
    return new Promise((resolve) => {
      exec('df -h .', (error: any, stdout: string) => {
        if (error) {
          resolve({
            name: 'disk space',
            success: false,
            error: '无法获取磁盘空间信息'
          });
          return;
        }

        const lines = stdout.split('\n');
        if (lines.length > 1) {
          const parts = lines[1].split(/\s+/);
          const available = parts[3];
          const usage = parts[4];
          
          // 解析可用空间
          const availableStr = available.replace(/[^\d.]/g, '');
          const availableNum = parseFloat(availableStr);
          const unit = available.slice(-2);
          
          // 转换为GB
          let availableGB = 0;
          if (unit.includes('G') || unit.includes('g')) {
            availableGB = availableNum;
          } else if (unit.includes('T') || unit.includes('t')) {
            availableGB = availableNum * 1024;
          } else if (unit.includes('M') || unit.includes('m')) {
            availableGB = availableNum / 1024;
          } else {
            availableGB = availableNum / (1024 * 1024 * 1024);
          }

          // 检查可用空间是否大于1GB
          const hasEnoughSpace = availableGB > 1;

          resolve({
            name: 'disk space',
            success: hasEnoughSpace,
            available: available,
            usage: usage,
            availableGB: Math.round(availableGB * 100) / 100,
            error: hasEnoughSpace ? undefined : '磁盘可用空间不足1GB'
          });
        } else {
          resolve({
            name: 'disk space',
            success: false,
            error: '无法解析磁盘空间信息'
          });
        }
      });
    });
  } catch (error) {
    return {
      name: 'disk space',
      success: false,
      error: '磁盘空间检查失败'
    };
  }
}

async function checkFileOperations() {
  try {
    const testDir = path.join(process.cwd(), 'temp');
    const testFile = path.join(testDir, `fileops_test_${Date.now()}.txt`);
    const testContent = 'File operations test';

    // 确保测试目录存在
    await fs.mkdir(testDir, { recursive: true });

    // 测试写入
    await fs.writeFile(testFile, testContent);

    // 测试读取
    const readContent = await fs.readFile(testFile, 'utf-8');
    
    // 测试删除
    await fs.unlink(testFile);

    return {
      name: 'file operations',
      success: readContent === testContent,
      operations: ['write', 'read', 'delete']
    };
  } catch (error) {
    return {
      name: 'file operations',
      success: false,
      error: '文件操作测试失败'
    };
  }
}
