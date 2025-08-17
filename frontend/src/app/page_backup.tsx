'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Music, 
  Code, 
  Send,
  ArrowRight,
  Heart,
  Users,
  TrendingUp,
  Zap,
  Palette,
  BookOpen,
  GitBranch
} from 'lucide-react';
import Layout from '@/components/layout/Layout';

export default function HomePage() {
  return (
    <Layout>
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI驱动的创作平台
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  YouCreator.AI
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
                  专注于创作的AI应用 - 基于AI的多模态创作编辑器
                </p>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                  集成智能写作、AI绘画、音乐创作、代码编写，一键发布到小红书
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/media">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Sparkles className="mr-2 h-5 w-5" />
                    开始AI创作
                  </Button>
                </Link>
                <Link href="/workflow">
                  <Button size="lg" variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-50">
                    <GitBranch className="mr-2 h-5 w-5" />
                    AI工作流
                    <Badge variant="secondary" className="ml-2 text-xs">Beta</Badge>
                  </Button>
                </Link>
                <Link href="/xiaohongshu">
                  <Button size="lg" variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50">
                    <Send className="mr-2 h-5 w-5" />
                    发布到小红书
                    <Badge variant="destructive" className="ml-2 text-xs">Hot</Badge>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              强大的AI创作能力
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              从内容创作到平台发布，一站式解决您的创作需求
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 智能写作 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">智能写作</CardTitle>
                <CardDescription>
                  AI辅助文章、小说、剧本创作
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 多种写作风格</li>
                  <li>• 智能续写补全</li>
                  <li>• 语法错误检查</li>
                  <li>• 创意灵感生成</li>
                </ul>
              </CardContent>
            </Card>

            {/* AI绘画 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <ImageIcon className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">AI绘画</CardTitle>
                <CardDescription>
                  文本到图像生成，艺术创作
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 多种艺术风格</li>
                  <li>• 高清图像生成</li>
                  <li>• 自定义尺寸</li>
                  <li>• 实时预览调整</li>
                </ul>
              </CardContent>
            </Card>

            {/* 音乐创作 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Music className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">音乐创作</CardTitle>
                <CardDescription>
                  AI协助旋律、和声创作
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 多种音乐风格</li>
                  <li>• 情感化创作</li>
                  <li>• 图片配乐</li>
                  <li>• 高品质输出</li>
                </ul>
              </CardContent>
            </Card>

            {/* 代码编写 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">代码编写</CardTitle>
                <CardDescription>
                  智能代码生成、调试和优化
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 多语言支持</li>
                  <li>• 智能补全</li>
                  <li>• 错误检测</li>
                  <li>• 性能优化</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 小红书发布功能亮点 */}
        <section className="bg-gradient-to-r from-pink-50 to-red-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center space-y-4 mb-12">
              <Badge variant="secondary" className="bg-pink-100 text-pink-800">
                <Heart className="h-3 w-3 mr-1" />
                新功能上线
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                一键发布到小红书
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                AI生成内容 + 智能优化 + 一键发布，让您的创作触达更多用户
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* 功能介绍 */}
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">AI智能创作</h3>
                    <p className="text-gray-600">
                      使用先进的AI技术生成高质量的图片和音乐内容，为您的小红书笔记提供丰富的素材
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">智能优化</h3>
                    <p className="text-gray-600">
                      自动分析内容主题和情感，优化标题格式，生成热门标签，提高笔记的曝光率和互动率
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Send className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">一键发布</h3>
                    <p className="text-gray-600">
                      预览效果，调整设置，一键发布到小红书平台，无需手动操作，省时省力
                    </p>
                  </div>
                </div>

                <Link href="/xiaohongshu">
                  <Button size="lg" className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700">
                    立即体验
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              {/* 流程图 */}
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Palette className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">AI内容生成</h4>
                      <p className="text-sm text-gray-600">文字配图、文字配乐、图片配乐</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">智能优化</h4>
                      <p className="text-sm text-gray-600">内容分析、标签生成、格式优化</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                      <Send className="h-6 w-6 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">发布到小红书</h4>
                      <p className="text-sm text-gray-600">预览效果、一键发布、数据追踪</p>
                    </div>
                    <Heart className="h-5 w-5 text-pink-500" />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* 技术架构 */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              四层架构设计
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              现代化的技术栈，确保高性能和可扩展性
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-blue-600">表现层</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Next.js 14 前端应用</p>
                <div className="space-y-1 text-xs text-gray-500">
                  <div>React 18</div>
                  <div>TypeScript</div>
                  <div>Tailwind CSS</div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-green-600">业务逻辑层</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Go 后端服务</p>
                <div className="space-y-1 text-xs text-gray-500">
                  <div>Go 1.21+</div>
                  <div>Gin框架</div>
                  <div>WebSocket</div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-purple-600">数据访问层</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">多数据库支持</p>
                <div className="space-y-1 text-xs text-gray-500">
                  <div>MySQL 8.0</div>
                  <div>MongoDB 6.0</div>
                  <div>OpenSearch 2.x</div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-orange-600">AI模型层</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Python AI服务</p>
                <div className="space-y-1 text-xs text-gray-500">
                  <div>Python 3.11+</div>
                  <div>FastAPI</div>
                  <div>PyTorch</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 统计数据 */}
        <section className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">
                平台数据
              </h2>
              <p className="text-xl text-gray-300">
                用数据说话，见证平台成长
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">10K+</div>
                <div className="text-gray-300">AI创作内容</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">5K+</div>
                <div className="text-gray-300">小红书笔记</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">100K+</div>
                <div className="text-gray-300">用户互动</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-pink-400 mb-2">95%</div>
                <div className="text-gray-300">用户满意度</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="text-center py-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                开始您的AI创作之旅
              </h2>
              <p className="text-xl mb-8 opacity-90">
                让AI成为您的创作伙伴，将想象变为现实
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/media">
                  <Button size="lg" variant="secondary">
                    <Sparkles className="mr-2 h-5 w-5" />
                    开始创作
                  </Button>
                </Link>
                <Link href="/xiaohongshu">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                    <Send className="mr-2 h-5 w-5" />
                    发布到小红书
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
}
