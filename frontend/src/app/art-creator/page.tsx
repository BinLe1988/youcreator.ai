'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Image, User, Mountain, Sparkles, Download, Copy } from 'lucide-react';

interface ArtCreationResult {
  success: boolean;
  image_data?: string;
  images?: Array<{image: string, index: number}>;
  prompt?: string;
  style?: string;
  dimensions?: {width: number, height: number};
  error?: string;
}

const ArtCreatorPage = () => {
  const [activeTab, setActiveTab] = useState('free');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ArtCreationResult | null>(null);

  // 自由创作状态
  const [freeForm, setFreeForm] = useState({
    prompt: '',
    style: 'realistic',
    quality: 'high'
  });

  // 人物肖像状态
  const [portraitForm, setPortraitForm] = useState({
    description: '',
    style: 'realistic'
  });

  // 风景画状态
  const [landscapeForm, setLandscapeForm] = useState({
    scene: '',
    style: 'realistic'
  });

  const styles = [
    { value: 'realistic', label: '写实风格' },
    { value: 'anime', label: '动漫风格' },
    { value: 'oil_painting', label: '油画风格' },
    { value: 'watercolor', label: '水彩风格' },
    { value: 'sketch', label: '素描风格' },
    { value: 'digital_art', label: '数字艺术' },
    { value: 'fantasy', label: '奇幻风格' },
    { value: 'cyberpunk', label: '赛博朋克' },
    { value: 'impressionist', label: '印象派' },
    { value: 'abstract', label: '抽象艺术' }
  ];

  const generateArt = async (type: string, params: any) => {
    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/art/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          params
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: '生成失败，请检查网络连接'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFreeGenerate = () => {
    if (!freeForm.prompt.trim()) {
      alert('请输入画面描述');
      return;
    }
    generateArt('free', freeForm);
  };

  const handlePortraitGenerate = () => {
    if (!portraitForm.description.trim()) {
      alert('请输入人物描述');
      return;
    }
    generateArt('portrait', portraitForm);
  };

  const handleLandscapeGenerate = () => {
    if (!landscapeForm.scene.trim()) {
      alert('请输入风景描述');
      return;
    }
    generateArt('landscape', landscapeForm);
  };

  const downloadImage = () => {
    if (result?.image_data) {
      const link = document.createElement('a');
      link.href = result.image_data;
      link.download = `artwork_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const copyImageUrl = () => {
    if (result?.image_data) {
      navigator.clipboard.writeText(result.image_data);
      alert('图片链接已复制到剪贴板');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Palette className="w-8 h-8 text-pink-600" />
              <h1 className="text-4xl font-bold text-gray-800">绘画创作工具</h1>
            </div>
            <p className="text-gray-600 text-lg">AI驱动的多风格绘画创作平台</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧创作面板 */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-pink-600" />
                    创作面板
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="free" className="flex items-center gap-1">
                        <Palette className="w-4 h-4" />
                        自由创作
                      </TabsTrigger>
                      <TabsTrigger value="portrait" className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        人物肖像
                      </TabsTrigger>
                      <TabsTrigger value="landscape" className="flex items-center gap-1">
                        <Mountain className="w-4 h-4" />
                        风景画作
                      </TabsTrigger>
                    </TabsList>

                    {/* 自由创作 */}
                    <TabsContent value="free" className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">画面描述</label>
                        <Textarea
                          placeholder="请详细描述您想要创作的画面..."
                          value={freeForm.prompt}
                          onChange={(e) => setFreeForm({...freeForm, prompt: e.target.value})}
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">艺术风格</label>
                          <Select value={freeForm.style} onValueChange={(value) => setFreeForm({...freeForm, style: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {styles.map(style => (
                                <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">生成质量</label>
                          <Select value={freeForm.quality} onValueChange={(value) => setFreeForm({...freeForm, quality: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">草稿质量</SelectItem>
                              <SelectItem value="normal">标准质量</SelectItem>
                              <SelectItem value="high">高质量</SelectItem>
                              <SelectItem value="ultra">超高质量</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button 
                        onClick={handleFreeGenerate} 
                        disabled={isGenerating}
                        className="w-full bg-pink-600 hover:bg-pink-700"
                      >
                        {isGenerating ? '创作中...' : '开始自由创作'}
                      </Button>
                    </TabsContent>

                    {/* 人物肖像 */}
                    <TabsContent value="portrait" className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">人物描述</label>
                        <Textarea
                          placeholder="请描述人物的外貌特征、表情、服装等..."
                          value={portraitForm.description}
                          onChange={(e) => setPortraitForm({...portraitForm, description: e.target.value})}
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">肖像风格</label>
                        <Select value={portraitForm.style} onValueChange={(value) => setPortraitForm({...portraitForm, style: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {styles.map(style => (
                              <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={handlePortraitGenerate} 
                        disabled={isGenerating}
                        className="w-full bg-pink-600 hover:bg-pink-700"
                      >
                        {isGenerating ? '创作中...' : '生成人物肖像'}
                      </Button>
                    </TabsContent>

                    {/* 风景画作 */}
                    <TabsContent value="landscape" className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">风景描述</label>
                        <Textarea
                          placeholder="请描述您想要的风景场景..."
                          value={landscapeForm.scene}
                          onChange={(e) => setLandscapeForm({...landscapeForm, scene: e.target.value})}
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">风景风格</label>
                        <Select value={landscapeForm.style} onValueChange={(value) => setLandscapeForm({...landscapeForm, style: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {styles.map(style => (
                              <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={handleLandscapeGenerate} 
                        disabled={isGenerating}
                        className="w-full bg-pink-600 hover:bg-pink-700"
                      >
                        {isGenerating ? '创作中...' : '生成风景画作'}
                      </Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* 右侧结果面板 */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Image className="w-5 h-5 text-blue-600" />
                      创作结果
                    </span>
                    {result && result.success && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={copyImageUrl}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={downloadImage}>
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={() => window.open(`/polish?type=image&imageData=${encodeURIComponent(result.image_data)}`, '_blank')}
                        >
                          <Sparkles className="w-4 h-4 mr-1" />
                          润色
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                      <span className="ml-2 text-gray-600">AI正在创作中...</span>
                    </div>
                  ) : result ? (
                    <div className="space-y-4">
                      {result.success ? (
                        <>
                          <div className="flex items-center gap-2 mb-4">
                            <Badge variant="secondary">{result.style}</Badge>
                            {result.dimensions && (
                              <Badge variant="outline">
                                {result.dimensions.width}×{result.dimensions.height}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="bg-gray-50 p-2 rounded-lg">
                            <img
                              src={result.image_data || (result.images && result.images[0]?.image)}
                              alt="Generated artwork"
                              className="w-full h-auto rounded-lg shadow-sm"
                            />
                          </div>
                          
                          {result.prompt && (
                            <div className="text-sm text-gray-600">
                              <strong>提示词:</strong> {result.prompt}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-red-500 mb-2">创作失败</div>
                          <div className="text-gray-600 text-sm">{result.error}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      选择创作类型并填写描述，开始您的艺术创作
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ArtCreatorPage;
