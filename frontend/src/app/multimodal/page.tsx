'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Image as ImageIcon, 
  Music, 
  FileText,
  Sparkles,
  Download,
  Upload,
  Play,
  Pause,
  Wand2
} from 'lucide-react';

interface GeneratedContent {
  image?: string;
  music?: string;
  text?: string;
  metadata?: any;
}

const MultimodalPage = () => {
  const [activeTab, setActiveTab] = useState('text-to-image');
  const [inputText, setInputText] = useState('');
  const [imageStyle, setImageStyle] = useState('realistic');
  const [musicStyle, setMusicStyle] = useState('ambient');
  const [musicDuration, setMusicDuration] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({});
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const imageStyles = [
    { id: 'realistic', name: '写实风格', desc: '照片级真实效果' },
    { id: 'artistic', name: '艺术风格', desc: '绘画艺术效果' },
    { id: 'cartoon', name: '卡通风格', desc: '可爱卡通效果' },
    { id: 'abstract', name: '抽象风格', desc: '抽象艺术效果' },
    { id: 'vintage', name: '复古风格', desc: '怀旧复古效果' },
    { id: 'minimalist', name: '简约风格', desc: '简洁现代效果' }
  ];

  const musicStyles = [
    { id: 'ambient', name: '环境音乐', desc: '轻柔背景音乐' },
    { id: 'orchestral', name: '管弦乐', desc: '宏大交响效果' },
    { id: 'electronic', name: '电子音乐', desc: '现代电子风格' },
    { id: 'acoustic', name: '原声音乐', desc: '温暖原声效果' },
    { id: 'jazz', name: '爵士乐', desc: '优雅爵士风格' },
    { id: 'classical', name: '古典音乐', desc: '经典古典风格' }
  ];

  const handleTextToImage = async () => {
    if (!inputText.trim()) {
      alert('请输入文字描述');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/v1/multimodal/text-to-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          style: imageStyle,
          width: 512,
          height: 512
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setGeneratedContent(prev => ({ ...prev, image: imageUrl }));
      } else {
        alert('图像生成失败，请稍后重试');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('网络错误，请检查连接');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTextToMusic = async () => {
    if (!inputText.trim()) {
      alert('请输入文字描述');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/v1/multimodal/text-to-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          style: musicStyle,
          duration: musicDuration
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const musicUrl = URL.createObjectURL(blob);
        setGeneratedContent(prev => ({ ...prev, music: musicUrl }));
      } else {
        alert('音乐生成失败，请稍后重试');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('网络错误，请检查连接');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageToMusic = async () => {
    if (!uploadedImage) {
      alert('请上传图片文件');
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);
      formData.append('style', musicStyle);
      formData.append('duration', musicDuration.toString());

      const response = await fetch('/api/v1/multimodal/image-to-music', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const blob = await response.blob();
        const musicUrl = URL.createObjectURL(blob);
        setGeneratedContent(prev => ({ ...prev, music: musicUrl }));
      } else {
        alert('图片配乐生成失败，请稍后重试');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('网络错误，请检查连接');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompleteContent = async () => {
    if (!inputText.trim()) {
      alert('请输入文字描述');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/v1/multimodal/complete-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          imageStyle,
          musicStyle,
          duration: musicDuration
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGeneratedContent({
            text: data.text,
            image: data.image,
            music: data.music,
            metadata: data.metadata
          });
        } else {
          alert('完整内容生成失败：' + data.error);
        }
      } else {
        alert('完整内容生成失败，请稍后重试');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('网络错误，请检查连接');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
    } else {
      alert('请选择有效的图片文件');
    }
  };

  const downloadContent = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Wand2 className="w-8 h-8 text-purple-400" />
              <h1 className="text-4xl font-bold text-white">AI多模态创作</h1>
            </div>
            <p className="text-gray-300 text-lg">文字、图像、音乐的智能创作平台</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧创作面板 */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-800/50 border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    多模态创作面板
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4 bg-gray-700">
                      <TabsTrigger value="text-to-image" className="flex items-center gap-1 text-white">
                        <ImageIcon className="w-4 h-4" />
                        文字配图
                      </TabsTrigger>
                      <TabsTrigger value="text-to-music" className="flex items-center gap-1 text-white">
                        <Music className="w-4 h-4" />
                        文字配乐
                      </TabsTrigger>
                      <TabsTrigger value="image-to-music" className="flex items-center gap-1 text-white">
                        <Upload className="w-4 h-4" />
                        图片配乐
                      </TabsTrigger>
                      <TabsTrigger value="complete" className="flex items-center gap-1 text-white">
                        <FileText className="w-4 h-4" />
                        完整创作
                      </TabsTrigger>
                    </TabsList>

                    {/* 文字配图 */}
                    <TabsContent value="text-to-image" className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">文字描述</label>
                        <Textarea
                          placeholder="请描述您想要生成的图像，例如：一只可爱的小猫在花园里玩耍"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          rows={4}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">图像风格</label>
                        <Select value={imageStyle} onValueChange={setImageStyle}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            {imageStyles.map(style => (
                              <SelectItem key={style.id} value={style.id} className="text-white">
                                {style.name} - {style.desc}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={handleTextToImage} 
                        disabled={isGenerating}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        {isGenerating ? '生成中...' : '生成图片'}
                      </Button>
                    </TabsContent>

                    {/* 文字配乐 */}
                    <TabsContent value="text-to-music" className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">文字描述</label>
                        <Textarea
                          placeholder="请描述您想要的音乐风格和情感，例如：轻松愉快的春天旋律"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          rows={4}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">音乐风格</label>
                          <Select value={musicStyle} onValueChange={setMusicStyle}>
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              {musicStyles.map(style => (
                                <SelectItem key={style.id} value={style.id} className="text-white">
                                  {style.name} - {style.desc}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">时长: {musicDuration}秒</label>
                          <Slider
                            value={[musicDuration]}
                            onValueChange={(value) => setMusicDuration(value[0])}
                            max={120}
                            min={10}
                            step={10}
                            className="w-full"
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={handleTextToMusic} 
                        disabled={isGenerating}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        {isGenerating ? '生成中...' : '生成音乐'}
                      </Button>
                    </TabsContent>

                    {/* 图片配乐 */}
                    <TabsContent value="image-to-music" className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">上传图片</label>
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                          {uploadedImage ? (
                            <div className="space-y-2">
                              <img
                                src={URL.createObjectURL(uploadedImage)}
                                alt="Uploaded"
                                className="w-32 h-32 object-cover mx-auto rounded-lg"
                              />
                              <p className="text-white text-sm">{uploadedImage.name}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setUploadedImage(null)}
                                className="border-gray-600 text-white"
                              >
                                重新选择
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-300 mb-4">点击上传图片或拖拽图片到此处</p>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="image-upload"
                              />
                              <Button 
                                onClick={() => document.getElementById('image-upload')?.click()}
                                variant="outline"
                                className="border-gray-600 text-white"
                              >
                                选择图片
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">音乐风格</label>
                          <Select value={musicStyle} onValueChange={setMusicStyle}>
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              {musicStyles.map(style => (
                                <SelectItem key={style.id} value={style.id} className="text-white">
                                  {style.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">时长: {musicDuration}秒</label>
                          <Slider
                            value={[musicDuration]}
                            onValueChange={(value) => setMusicDuration(value[0])}
                            max={120}
                            min={10}
                            step={10}
                            className="w-full"
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={handleImageToMusic} 
                        disabled={isGenerating || !uploadedImage}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        {isGenerating ? '生成中...' : '生成配乐'}
                      </Button>
                    </TabsContent>

                    {/* 完整创作 */}
                    <TabsContent value="complete" className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">创作主题</label>
                        <Textarea
                          placeholder="请描述您想要创作的完整内容主题，例如：春天的美好时光"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          rows={4}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">图像风格</label>
                          <Select value={imageStyle} onValueChange={setImageStyle}>
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              {imageStyles.map(style => (
                                <SelectItem key={style.id} value={style.id} className="text-white">
                                  {style.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">音乐风格</label>
                          <Select value={musicStyle} onValueChange={setMusicStyle}>
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              {musicStyles.map(style => (
                                <SelectItem key={style.id} value={style.id} className="text-white">
                                  {style.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">时长: {musicDuration}秒</label>
                          <Slider
                            value={[musicDuration]}
                            onValueChange={(value) => setMusicDuration(value[0])}
                            max={120}
                            min={10}
                            step={10}
                            className="w-full"
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={handleCompleteContent} 
                        disabled={isGenerating}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        {isGenerating ? '创作中...' : '生成完整内容'}
                      </Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* 右侧结果面板 */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-800/50 border-gray-700 shadow-xl h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-green-400" />
                      生成结果
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                      <span className="ml-2 text-gray-300">AI正在创作中...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* 生成的图片 */}
                      {generatedContent.image && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-md font-medium text-white">生成的图片</h3>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadContent(generatedContent.image!, 'generated-image.svg')}
                              className="border-gray-600 text-white"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                          <img
                            src={generatedContent.image}
                            alt="Generated"
                            className="w-full rounded-lg border border-gray-600"
                          />
                        </div>
                      )}

                      {/* 生成的音乐 */}
                      {generatedContent.music && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-md font-medium text-white">生成的音乐</h3>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadContent(generatedContent.music!, 'generated-music.wav')}
                              className="border-gray-600 text-white"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="bg-gray-700 p-4 rounded-lg">
                            <audio
                              controls
                              src={generatedContent.music}
                              className="w-full"
                            >
                              您的浏览器不支持音频播放
                            </audio>
                          </div>
                        </div>
                      )}

                      {/* 生成的文字 */}
                      {generatedContent.text && (
                        <div className="space-y-2">
                          <h3 className="text-md font-medium text-white">生成的文字</h3>
                          <div className="bg-gray-700 p-4 rounded-lg text-gray-300 text-sm whitespace-pre-wrap">
                            {generatedContent.text}
                          </div>
                        </div>
                      )}

                      {/* 元数据 */}
                      {generatedContent.metadata && (
                        <div className="space-y-2">
                          <h3 className="text-md font-medium text-white">生成信息</h3>
                          <div className="bg-gray-700 p-4 rounded-lg text-gray-300 text-sm">
                            <p>生成时间: {generatedContent.metadata.generation_time?.toFixed(2)}秒</p>
                            {generatedContent.metadata.style_analysis && (
                              <div className="mt-2">
                                <p>风格分析:</p>
                                <ul className="ml-4 mt-1">
                                  <li>情绪: {generatedContent.metadata.style_analysis.mood}</li>
                                  <li>类型: {generatedContent.metadata.style_analysis.genre}</li>
                                  <li>主题: {generatedContent.metadata.style_analysis.content_theme}</li>
                                </ul>
                              </div>
                            )}
                            {generatedContent.metadata.note && (
                              <div className="mt-2 text-blue-400 text-xs">
                                {generatedContent.metadata.note}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 空状态 */}
                      {!generatedContent.image && !generatedContent.music && !generatedContent.text && (
                        <div className="flex items-center justify-center h-64 text-gray-400">
                          <div className="text-center">
                            <Wand2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>选择创作类型并开始您的AI创作之旅</p>
                          </div>
                        </div>
                      )}
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

export default MultimodalPage;
