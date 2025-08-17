import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // 验证必需字段
    if (!username || !email || !password) {
      return NextResponse.json({
        success: false,
        message: '用户名、邮箱和密码不能为空'
      }, { status: 400 });
    }

    // 验证用户名长度
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json({
        success: false,
        message: '用户名长度应在3-20个字符之间'
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

    // 验证密码强度
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        message: '密码长度至少6个字符'
      }, { status: 400 });
    }

    // 模拟检查用户是否已存在
    const existingUsers = [
      'demo@youcreator.ai',
      'admin@youcreator.ai',
      'test@example.com'
    ];

    if (existingUsers.includes(email)) {
      return NextResponse.json({
        success: false,
        message: '该邮箱已被注册'
      }, { status: 409 });
    }

    // 模拟创建用户
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      username,
      email,
      avatar: '',
      role: 'user',
      created_at: new Date().toISOString(),
      email_verified: false
    };

    // 在实际应用中，这里应该：
    // 1. 加密密码
    // 2. 保存到数据库
    // 3. 发送验证邮件

    console.log('新用户注册:', newUser);

    return NextResponse.json({
      success: true,
      message: '注册成功，请登录',
      user: newUser
    });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({
      success: false,
      message: '服务器内部错误'
    }, { status: 500 });
  }
}
