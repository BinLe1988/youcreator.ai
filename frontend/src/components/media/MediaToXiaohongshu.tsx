'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowRight, 
  Image as ImageIcon, 
  Music, 
  Palette, 
  Send,
  Sparkles,
  Eye,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import TextToImage from './TextToImage';
import TextToMusic from './TextToMusic';
import ImageToMusic from './ImageToMusic';
import XiaohongshuPublisher from '../xiaohongshu/XiaohongshuPublisher';

interface GeneratedContent {
  type: 'image' | 'music' | 'image-music';
  title: string;
  description: string;
  imageUrl?: string;
  audioUrl?: string;
  prompt?: string;
  imageCaption?: string;
  musicDescription?: string;
}

export default function MediaToXiaohongshu() {
  const [activeStep, setActiveStep] = useState<'generate' | 'publish'>('generate');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [publishedNoteId, setPublishedNoteId] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  // 处理图片生成完成
  const handleImageGenerated = (imageUrl: string, prompt: string) => {
    const content: GeneratedContent = {
      type: 'image',
      title: '✨ AI生成的精美图片',
      description: `刚刚用AI生成了这张超棒的图片！\n\n🎨 创作描述：${prompt}\n\n真的太神奇了，AI的创造力让人惊叹！你们觉得怎么样？`,
      imageUrl,
      prompt,
    };
    
    setGeneratedContent(content);
    toast.success('图片已生成，可以发布到小红书了！');
  };

  // 处理音乐生成完成
  const handleMusicGenerated = (audioUrl: string, description: string) => {
    const content: GeneratedContent = {
      type: 'music',
      title: '🎵 AI创作的美妙音乐',
      description: `用AI创作了一段超棒的音乐！\n\n🎶 音乐风格：${description}\n\n听起来真的很治愈，分享给大家一起欣赏～`,
      audioUrl,
      musicDescription: description,
    };
    
    setGeneratedContent(content);
    toast.success('音乐已生成，可以发布到小红书了！');
  };

  // 处理图片配乐完成
  const handleImageMusicGenerated = (audioUrl: string, imageCaption: string, musicDescription: string) => {
    const content: GeneratedContent = {
      type: 'image-music',
      title: '🎨🎵 图片配乐作品',
      description: `用AI为图片创作了专属配乐！\n\n📸 图片内容：${imageCaption}\n🎵 音乐风格：${musicDescription}\n\n视听结合的感觉真的很棒，你们也试试看吧！`,
      imageUrl: generatedContent?.imageUrl, // 如果有之前生成的图片
      audioUrl,
      imageCaption,
      musicDescription,
    };
    
    setGeneratedContent(content);
    toast.success('图片配乐已完成，可以发布到小红书了！');
  };

  // 处理发布完成
  const handlePublished = (noteId: string, url: string) => {
    setPublishedNoteId(noteId);
    setPublishedUrl(url);
    toast.success('内容已成功发布到小红书！');
  };

  // 重新开始
  const handleRestart = () => {
    setActiveStep('generate');
    setGeneratedContent(null);
    setPublishedNoteId(null);
    setPublishedUrl(null);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          AI创作 → 小红书发布
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          用AI生成精美内容，一键发布到小红书，让更多人看到您的创作
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Sparkles className="h-3 w-3 mr-1" />
            AI生成
          </Badge>
          <Badge variant="secondary" className="bg-pink-100 text-pink-800">
            <Send className="h-3 w-3 mr-1" />
            一键发布
          </Badge>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <Eye className="h-3 w-3 mr-1" />
            智能优化
          </Badge>
        </div>
      </div>

      {/* 步骤指示器 */}
      <div className="flex items-center justify-center space-x-4">
        <div className={`flex items-center space-x-2 ${activeStep === 'generate' ? 'text-blue-600' : 'text-green-600'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            activeStep === 'generate' ? 'bg-blue-100 border-2 border-blue-600' : 'bg-green-100'
          }`}>
            {activeStep === 'generate' ? '1' : <CheckCircle className="h-5 w-5" />}
          </div>
          <span className="font-medium">AI内容生成</span>
        </div>
        
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
        
        <div className={`flex items-center space-x-2 ${
          activeStep === 'publish' ? 'text-blue-600' : 
          publishedNoteId ? 'text-green-600' : 'text-muted-foreground'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            activeStep === 'publish' ? 'bg-blue-100 border-2 border-blue-600' : 
            publishedNoteId ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            {publishedNoteId ? <CheckCircle className="h-5 w-5" /> : '2'}
          </div>
          <span className="font-medium">发布到小红书</span>
        </div>
      </div>

      {/* 主要内容区域 */}
      {activeStep === 'generate' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">选择创作类型</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="text-to-image" className="w-full">
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
                <TabsContent value="text-to-image">
                  <TextToImage onImageGenerated={handleImageGenerated} />
                </TabsContent>

                <TabsContent value="text-to-music">
                  <TextToMusic onMusicGenerated={handleMusicGenerated} />
                </TabsContent>

                <TabsContent value="image-to-music">
                  <ImageToMusic onMusicGenerated={handleImageMusicGenerated} />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* 生成内容预览和发布按钮 */}
      {generatedContent && activeStep === 'generate' && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              内容生成完成
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 内容预览 */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">{generatedContent.title}</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-4">
                {generatedContent.description}
              </p>
              
              {/* 媒体内容 */}
              <div className="grid grid-cols-2 gap-4">
                {generatedContent.imageUrl && (
                  <div className="space-y-2">
                    <Badge variant="secondary">
                      <ImageIcon className="h-3 w-3 mr-1" />
                      生成的图片
                    </Badge>
                    <img
                      src={generatedContent.imageUrl}
                      alt="Generated content"
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
                
                {generatedContent.audioUrl && (
                  <div className="space-y-2">
                    <Badge variant="secondary">
                      <Music className="h-3 w-3 mr-1" />
                      生成的音乐
                    </Badge>
                    <div className="flex items-center justify-center h-32 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border">
                      <div className="text-center">
                        <Music className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <audio controls className="w-full">
                          <source src={generatedContent.audioUrl} type="audio/wav" />
                        </audio>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 发布按钮 */}
            <div className="flex justify-center">
              <Button
                onClick={() => setActiveStep('publish')}
                size="lg"
                className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700"
              >
                <Send className="mr-2 h-5 w-5" />
                发布到小红书
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 小红书发布界面 */}
      {activeStep === 'publish' && generatedContent && (
        <XiaohongshuPublisher
          initialContent={{
            title: generatedContent.title,
            description: generatedContent.description,
            imageUrl: generatedContent.imageUrl,
            audioUrl: generatedContent.audioUrl,
          }}
          onPublished={handlePublished}
        />
      )}

      {/* 发布成功 */}
      {publishedNoteId && publishedUrl && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              发布成功！
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-green-700">
              您的内容已成功发布到小红书！
            </p>
            
            <div className="flex gap-4">
              <Button
                onClick={() => window.open(publishedUrl, '_blank')}
                variant="outline"
              >
                <Eye className="mr-2 h-4 w-4" />
                查看笔记
              </Button>
              
              <Button onClick={handleRestart}>
                <Sparkles className="mr-2 h-4 w-4" />
                创作新内容
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 功能说明 */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-center">功能特色</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">AI智能创作</h3>
              <p className="text-sm text-muted-foreground">
                使用先进的AI技术生成高质量的图片和音乐内容
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">智能优化</h3>
              <p className="text-sm text-muted-foreground">
                自动分析内容并优化为适合小红书的格式和风格
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto">
                <Send className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="font-semibold">一键发布</h3>
              <p className="text-sm text-muted-foreground">
                无需手动操作，直接将优化后的内容发布到小红书
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
