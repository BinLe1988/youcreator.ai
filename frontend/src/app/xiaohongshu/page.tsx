'use client';

import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Send, 
  TrendingUp, 
  Users, 
  Heart, 
  MessageCircle,
  Image as ImageIcon,
  Music,
  Palette,
  ArrowRight
} from 'lucide-react';
import MediaToXiaohongshu from '@/components/media/MediaToXiaohongshu';
import XiaohongshuPublisher from '@/components/xiaohongshu/XiaohongshuPublisher';

export default function XiaohongshuPage() {
  return (
    <Layout>
      <div className="container mx-auto py-8 space-y-8">
      {/* 页面标题 */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
          小红书内容发布平台
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          将AI生成的精美内容智能优化并发布到小红书，触达更多用户
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary" className="bg-pink-100 text-pink-800">
            <Heart className="h-3 w-3 mr-1" />
            小红书官方
          </Badge>
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <Sparkles className="h-3 w-3 mr-1" />
            AI优化
          </Badge>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <TrendingUp className="h-3 w-3 mr-1" />
            智能推荐
          </Badge>
        </div>
      </div>

      {/* 平台优势展示 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-2">
              <Sparkles className="h-6 w-6 text-pink-600" />
            </div>
            <CardTitle className="text-lg">AI智能创作</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              使用先进AI技术生成高质量图片和音乐，为您的创作提供无限灵感
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
              <Send className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-lg">一键发布</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              智能格式化内容，自动添加标签，一键发布到小红书平台
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle className="text-lg">数据分析</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              智能分析内容表现，提供优化建议，提升笔记曝光率
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-lg">用户互动</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              优化内容格式，提高用户参与度，增加点赞评论分享
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 主要功能区域 */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="ai-to-xiaohongshu" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ai-to-xiaohongshu" className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  <ArrowRight className="h-3 w-3" />
                  <Send className="h-4 w-4" />
                </div>
                AI创作 → 小红书
              </TabsTrigger>
              <TabsTrigger value="direct-publish" className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                直接发布
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="ai-to-xiaohongshu" className="space-y-4">
                <div className="text-center space-y-2 mb-6">
                  <h3 className="text-xl font-semibold">AI创作 + 小红书发布</h3>
                  <p className="text-muted-foreground">
                    使用AI生成精美内容，然后智能优化并发布到小红书
                  </p>
                </div>
                <MediaToXiaohongshu />
              </TabsContent>

              <TabsContent value="direct-publish" className="space-y-4">
                <div className="text-center space-y-2 mb-6">
                  <h3 className="text-xl font-semibold">直接发布内容</h3>
                  <p className="text-muted-foreground">
                    直接编辑和发布您的内容到小红书
                  </p>
                </div>
                <XiaohongshuPublisher />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* 创作流程说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">创作发布流程</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 步骤1 */}
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <div className="flex items-center gap-1">
                    <ImageIcon className="h-5 w-5 text-blue-600" />
                    <Music className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <Badge className="absolute -top-2 -right-2 bg-blue-600">1</Badge>
              </div>
              <h3 className="font-semibold">AI内容生成</h3>
              <p className="text-sm text-muted-foreground">
                选择文字配图、文字配乐或图片配乐，让AI为您创作精美内容
              </p>
            </div>

            {/* 步骤2 */}
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
                <Badge className="absolute -top-2 -right-2 bg-purple-600">2</Badge>
              </div>
              <h3 className="font-semibold">智能优化</h3>
              <p className="text-sm text-muted-foreground">
                AI自动分析内容主题和情感，优化标题格式，生成热门标签
              </p>
            </div>

            {/* 步骤3 */}
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto">
                  <Send className="h-6 w-6 text-pink-600" />
                </div>
                <Badge className="absolute -top-2 -right-2 bg-pink-600">3</Badge>
              </div>
              <h3 className="font-semibold">一键发布</h3>
              <p className="text-sm text-muted-foreground">
                预览效果，调整设置，一键发布到小红书，开始获得曝光和互动
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 成功案例展示 */}
      <Card className="bg-gradient-to-r from-pink-50 to-red-50">
        <CardHeader>
          <CardTitle className="text-center">平台数据</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600 mb-1">10K+</div>
              <div className="text-sm text-muted-foreground">成功发布笔记</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">500K+</div>
              <div className="text-sm text-muted-foreground">总浏览量</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">50K+</div>
              <div className="text-sm text-muted-foreground">获得点赞</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">95%</div>
              <div className="text-sm text-muted-foreground">用户满意度</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 使用技巧 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            小红书运营技巧
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-pink-600">内容创作技巧</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
                  标题要有吸引力，适当使用emoji增加视觉效果
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
                  内容要真实有用，分享个人体验和感受
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
                  图片要清晰美观，符合小红书的审美风格
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
                  适当添加话题标签，提高内容可发现性
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-red-600">发布时机建议</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  晚上8-10点是用户活跃高峰期
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  周末上午用户有更多时间浏览和互动
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  节假日期间发布相关主题内容效果更好
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  保持规律发布，建立用户期待
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </Layout>
  );
}
