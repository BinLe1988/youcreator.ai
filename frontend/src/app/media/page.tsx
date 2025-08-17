'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Music, Palette, Sparkles, Send, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import TextToImage from '@/components/media/TextToImage';
import TextToMusic from '@/components/media/TextToMusic';
import ImageToMusic from '@/components/media/ImageToMusic';

export default function MediaPage() {
  const [activeTab, setActiveTab] = useState('text-to-image');
  const [generatedContent, setGeneratedContent] = useState<{
    type: string;
    imageUrl?: string;
    audioUrl?: string;
    prompt?: string;
    description?: string;
  } | null>(null);

  // 处理内容生成完成
  const handleContentGenerated = (type: string, data: any) => {
    setGeneratedContent({
      type,
      ...data
    });
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 space-y-8">
        {/* 页面标题 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI 媒体创作工具
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            使用先进的AI技术，为您的创作添加视觉和听觉元素
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Sparkles className="h-3 w-3 mr-1" />
              AI驱动
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Palette className="h-3 w-3 mr-1" />
              多模态
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Music className="h-3 w-3 mr-1" />
              创意无限
            </Badge>
          </div>
        </div>

        {/* 生成内容后的小红书发布提示 */}
        {generatedContent && (
          <Card className="border-pink-200 bg-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-pink-800">
                <Send className="h-5 w-5" />
                内容已生成，可以发布到小红书了！
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-pink-700 mb-4">
                您的AI创作内容已经准备就绪，现在可以一键发布到小红书，让更多人看到您的精彩创作。
              </p>
              <Link href="/xiaohongshu">
                <Button className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700">
                  <Send className="mr-2 h-4 w-4" />
                  发布到小红书
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* 功能介绍卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <ImageIcon className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">文字配图</CardTitle>
              <CardDescription>
                根据文字描述生成精美图片，支持多种艺术风格
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 多种艺术风格选择</li>
                <li>• 自定义图片尺寸</li>
                <li>• 高质量图像生成</li>
                <li>• 实时预览和调整</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <Music className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">文字配乐</CardTitle>
              <CardDescription>
                将文字描述转换为动听的背景音乐
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 情感化音乐生成</li>
                <li>• 可调节音乐时长</li>
                <li>• 多种音乐风格</li>
                <li>• 高品质音频输出</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <Palette className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">图片配乐</CardTitle>
              <CardDescription>
                为图片智能匹配合适的背景音乐
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 智能图片分析</li>
                <li>• 情感氛围匹配</li>
                <li>• 自动风格识别</li>
                <li>• 个性化音乐创作</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 主要功能区域 */}
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text-to-image" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  文字配图
                </TabsTrigger>
                <TabsTrigger value="text-to-music" className="flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  文字配乐
                </TabsTrigger>
                <TabsTrigger value="image-to-music" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  图片配乐
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="text-to-image" className="space-y-4">
                  <TextToImage
                    onImageGenerated={(imageUrl, prompt) => {
                      handleContentGenerated('image', { imageUrl, prompt });
                    }}
                  />
                </TabsContent>

                <TabsContent value="text-to-music" className="space-y-4">
                  <TextToMusic
                    onMusicGenerated={(audioUrl, description) => {
                      handleContentGenerated('music', { audioUrl, description });
                    }}
                  />
                </TabsContent>

                <TabsContent value="image-to-music" className="space-y-4">
                  <ImageToMusic
                    onMusicGenerated={(audioUrl, imageCaption, musicDescription) => {
                      handleContentGenerated('image-music', { 
                        audioUrl, 
                        imageCaption, 
                        description: musicDescription 
                      });
                    }}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* 使用提示 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              使用提示
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-600">文字配图技巧</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 使用具体、生动的描述词汇</li>
                  <li>• 指定艺术风格可获得更好效果</li>
                  <li>• 描述光线、色彩、构图等细节</li>
                  <li>• 避免过于复杂的场景描述</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">音乐生成技巧</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 描述情感和氛围比具体乐器更有效</li>
                  <li>• 可以指定音乐类型和节奏</li>
                  <li>• 较短的时长通常质量更好</li>
                  <li>• 图片配乐会自动分析图片内容</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 小红书发布推广 */}
        <Card className="bg-gradient-to-r from-pink-50 to-red-50 border-pink-200">
          <CardHeader>
            <CardTitle className="text-center text-pink-800">
              将您的创作分享到小红书
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-pink-700">
              AI生成的精美内容可以直接发布到小红书，让更多人欣赏您的创作才华
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/xiaohongshu">
                <Button className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700">
                  <Send className="mr-2 h-4 w-4" />
                  立即发布
                </Button>
              </Link>
              <Button variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50">
                了解更多
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 技术说明 */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-center">技术支持</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                本平台使用最新的AI技术，包括Stable Diffusion图像生成、MusicGen音乐创作等
              </p>
              <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                <span>• Stable Diffusion</span>
                <span>• MusicGen</span>
                <span>• BLIP图像理解</span>
                <span>• FastAPI后端</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
