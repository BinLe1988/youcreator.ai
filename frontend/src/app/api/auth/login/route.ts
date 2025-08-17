import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 验证必需字段
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: '邮箱和密码不能为空'
      }, { status: 400 });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: '邮箱格式不正确'
      }, { status: 400 });
    }

    // 模拟用户数据库
    const mockUsers = [
      {
        id: '1',
        username: 'demo',
        email: 'demo@youcreator.ai',
        password: '123456', // 实际应用中应该是加密的
        avatar: '',
        role: 'user',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        username: 'admin',
        email: 'admin@youcreator.ai',
        password: 'admin123',
        avatar: '',
        role: 'admin',
        created_at: '2024-01-01T00:00:00Z'
      }
    ];

    // 查找用户
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: '邮箱或密码错误'
      }, { status: 401 });
    }

    // 生成模拟JWT token
    const token = `jwt_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = user;

    return NextResponse.json({
      success: true,
      message: '登录成功',
      token,
      user: userInfo,
      expires_in: 7 * 24 * 60 * 60 * 1000 // 7天
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: '服务器内部错误'
    }, { status: 500 });
  }
}
