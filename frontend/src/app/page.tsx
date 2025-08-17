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
  GitBranch,
  PenTool
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

        {/* 独立创作工具导航 */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              独立创作工具
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              专业的创作界面，专注的创作体验
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 文字创作工具 */}
            <Link href="/text-creator">
              <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <PenTool className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-purple-600 transition-colors">文字创作</CardTitle>
                  <CardDescription>
                    小说、诗歌、剧本、文章创作
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                      小说创作 - 多种题材风格
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                      诗歌创作 - 现代诗古体诗
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                      剧本创作 - 话剧小品
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                      文本改进 - 智能优化
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-purple-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    立即使用 <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* 绘画创作工具 */}
            <Link href="/art-creator">
              <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Palette className="h-8 w-8 text-pink-600" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-pink-600 transition-colors">绘画创作</CardTitle>
                  <CardDescription>
                    多风格AI绘画生成
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-pink-400 rounded-full mr-2"></div>
                      自由创作 - 13种艺术风格
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-pink-400 rounded-full mr-2"></div>
                      人物肖像 - 专业肖像生成
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-pink-400 rounded-full mr-2"></div>
                      风景画作 - 自然风光创作
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-pink-400 rounded-full mr-2"></div>
                      角色设计 - 游戏动漫角色
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-pink-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    立即使用 <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* 音乐创作工具 */}
            <Link href="/music-creator">
              <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Music className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">音乐创作</CardTitle>
                  <CardDescription>
                    文字配乐、图片配乐
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                      文字配乐 - 12种音乐风格
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                      图片配乐 - 智能分析配乐
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                      主题音乐 - 冒险浪漫史诗
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                      环境音景 - 自然环境声音
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    立即使用 <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* 编程创作工具 */}
            <Link href="/code-creator">
              <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Code className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-green-600 transition-colors">编程创作</CardTitle>
                  <CardDescription>
                    代码生成、优化、调试
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      代码生成 - 15+编程语言
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      代码优化 - 性能可读性优化
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      代码调试 - 错误修复诊断
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      代码转换 - 语言间转换
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-green-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    立即使用 <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
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
                <Link href="/text-creator">
                  <Button size="lg" variant="secondary">
                    <PenTool className="mr-2 h-5 w-5" />
                    文字创作
                  </Button>
                </Link>
                <Link href="/art-creator">
                  <Button size="lg" variant="secondary">
                    <Palette className="mr-2 h-5 w-5" />
                    绘画创作
                  </Button>
                </Link>
                <Link href="/music-creator">
                  <Button size="lg" variant="secondary">
                    <Music className="mr-2 h-5 w-5" />
                    音乐创作
                  </Button>
                </Link>
                <Link href="/code-creator">
                  <Button size="lg" variant="secondary">
                    <Code className="mr-2 h-5 w-5" />
                    编程创作
                  </Button>
                </Link>
                <Link href="/polish">
                  <Button size="lg" variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                    <Sparkles className="mr-2 h-5 w-5" />
                    专业润色
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
