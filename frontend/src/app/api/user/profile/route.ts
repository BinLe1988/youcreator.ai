import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 获取Authorization头
    const authorization = request.headers.get('authorization');
    const token = authorization?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({
        success: false,
        message: '未提供认证token'
      }, { status: 401 });
    }

    // 这里应该验证token并获取用户信息
    // 现在返回模拟数据
    const userProfile = {
      id: '1',
      username: 'demo',
      email: 'demo@youcreator.ai',
      phone: '+86 138****8888',
      bio: '热爱AI创作的用户',
      location: '北京市',
      website: 'https://example.com',
      avatar: '',
      role: 'user',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      user: userProfile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({
      success: false,
      message: '服务器内部错误'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 获取Authorization头
    const authorization = request.headers.get('authorization');
    const token = authorization?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({
        success: false,
        message: '未提供认证token'
      }, { status: 401 });
    }

    const body = await request.json();
    const { username, email, phone, bio, location, website } = body;

    // 验证必需字段
    if (!username || !email) {
      return NextResponse.json({
        success: false,
        message: '用户名和邮箱不能为空'
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

    // 验证用户名长度
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json({
        success: false,
        message: '用户名长度应在3-20个字符之间'
      }, { status: 400 });
    }

    // 验证网站URL格式（如果提供）
    if (website && website.trim()) {
      try {
        new URL(website);
      } catch {
        return NextResponse.json({
          success: false,
          message: '网站URL格式不正确'
        }, { status: 400 });
      }
    }

    // 在实际应用中，这里应该：
    // 1. 验证token有效性
    // 2. 检查用户名和邮箱是否已被其他用户使用
    // 3. 更新数据库中的用户信息

    const updatedUser = {
      id: '1',
      username: username.trim(),
      email: email.trim(),
      phone: phone?.trim() || '',
      bio: bio?.trim() || '',
      location: location?.trim() || '',
      website: website?.trim() || '',
      avatar: '',
      role: 'user',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: new Date().toISOString()
    };

    console.log('用户资料更新:', updatedUser);

    return NextResponse.json({
      success: true,
      message: '个人信息更新成功',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({
      success: false,
      message: '服务器内部错误'
    }, { status: 500 });
  }
}
