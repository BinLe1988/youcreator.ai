'use client';

import React, { useState, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Music, Upload, Play, Pause, Download, Sparkles, Volume2 } from 'lucide-react';

interface MusicCreationResult {
  success: boolean;
  audio_data?: string;
  description?: string;
  duration?: number;
  style?: string;
  mood?: string;
  sample_rate?: number;
  metadata?: any;
  error?: string;
}

const MusicCreatorPage = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<MusicCreationResult | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 文字生成音乐状态
  const [textForm, setTextForm] = useState({
    description: '',
    duration: 15,
    style: 'ambient',
    mood: 'peaceful'
  });

  // 主题音乐状态
  const [themeForm, setThemeForm] = useState({
    theme: 'adventure',
    duration: 30
  });

  // 环境音景状态
  const [ambientForm, setAmbientForm] = useState({
    environment: 'forest',
    duration: 60
  });

  const musicStyles = [
    { value: 'ambient', label: '环境音乐' },
    { value: 'classical', label: '古典音乐' },
    { value: 'electronic', label: '电子音乐' },
    { value: 'jazz', label: '爵士乐' },
    { value: 'rock', label: '摇滚乐' },
    { value: 'pop', label: '流行音乐' },
    { value: 'folk', label: '民谣' },
    { value: 'orchestral', label: '管弦乐' },
    { value: 'piano', label: '钢琴曲' },
    { value: 'acoustic', label: '原声音乐' },
    { value: 'cinematic', label: '电影配乐' },
    { value: 'meditation', label: '冥想音乐' }
  ];

  const moods = [
    { value: 'happy', label: '快乐' },
    { value: 'sad', label: '悲伤' },
    { value: 'peaceful', label: '平静' },
    { value: 'energetic', label: '充满活力' },
    { value: 'mysterious', label: '神秘' },
    { value: 'romantic', label: '浪漫' },
    { value: 'epic', label: '史诗' },
    { value: 'nostalgic', label: '怀旧' }
  ];

  const themes = [
    { value: 'adventure', label: '冒险' },
    { value: 'romance', label: '浪漫' },
    { value: 'mystery', label: '神秘' },
    { value: 'victory', label: '胜利' },
    { value: 'sadness', label: '悲伤' },
    { value: 'hope', label: '希望' },
    { value: 'nature', label: '自然' },
    { value: 'space', label: '太空' },
    { value: 'childhood', label: '童年' },
    { value: 'epic', label: '史诗' }
  ];

  const environments = [
    { value: 'forest', label: '森林' },
    { value: 'ocean', label: '海洋' },
    { value: 'rain', label: '雨天' },
    { value: 'city', label: '城市' },
    { value: 'mountain', label: '山区' },
    { value: 'cafe', label: '咖啡厅' },
    { value: 'library', label: '图书馆' },
    { value: 'fireplace', label: '壁炉' }
  ];

  const generateMusic = async (type: string, params: any) => {
    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/music/generate', {
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

  const handleTextGenerate = () => {
    if (!textForm.description.trim()) {
      alert('请输入音乐描述');
      return;
    }
    generateMusic('text', textForm);
  };

  const handleThemeGenerate = () => {
    generateMusic('theme', themeForm);
  };

  const handleAmbientGenerate = () => {
    generateMusic('ambient', ambientForm);
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const downloadAudio = () => {
    if (result?.audio_data) {
      const link = document.createElement('a');
      link.href = result.audio_data;
      link.download = `music_${Date.now()}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Music className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-800">音乐创作工具</h1>
            </div>
            <p className="text-gray-600 text-lg">AI驱动的智能音乐创作平台</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧创作面板 */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    音乐创作面板
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="text" className="flex items-center gap-1">
                        <Music className="w-4 h-4" />
                        文字生成
                      </TabsTrigger>
                      <TabsTrigger value="theme" className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        主题音乐
                      </TabsTrigger>
                      <TabsTrigger value="ambient" className="flex items-center gap-1">
                        <Volume2 className="w-4 h-4" />
                        环境音景
                      </TabsTrigger>
                    </TabsList>

                    {/* 文字生成音乐 */}
                    <TabsContent value="text" className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">音乐描述</label>
                        <Textarea
                          placeholder="请描述您想要的音乐风格、情感和场景..."
                          value={textForm.description}
                          onChange={(e) => setTextForm({...textForm, description: e.target.value})}
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">音乐风格</label>
                          <Select value={textForm.style} onValueChange={(value) => setTextForm({...textForm, style: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {musicStyles.map(style => (
                                <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">情感基调</label>
                          <Select value={textForm.mood} onValueChange={(value) => setTextForm({...textForm, mood: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {moods.map(mood => (
                                <SelectItem key={mood.value} value={mood.value}>{mood.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">时长: {textForm.duration}秒</label>
                          <Slider
                            value={[textForm.duration]}
                            onValueChange={(value) => setTextForm({...textForm, duration: value[0]})}
                            max={120}
                            min={5}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={handleTextGenerate} 
                        disabled={isGenerating}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {isGenerating ? '创作中...' : '生成音乐'}
                      </Button>
                    </TabsContent>

                    {/* 主题音乐 */}
                    <TabsContent value="theme" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">音乐主题</label>
                          <Select value={themeForm.theme} onValueChange={(value) => setThemeForm({...themeForm, theme: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {themes.map(theme => (
                                <SelectItem key={theme.value} value={theme.value}>{theme.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">时长: {themeForm.duration}秒</label>
                          <Slider
                            value={[themeForm.duration]}
                            onValueChange={(value) => setThemeForm({...themeForm, duration: value[0]})}
                            max={180}
                            min={10}
                            step={10}
                            className="w-full"
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={handleThemeGenerate} 
                        disabled={isGenerating}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {isGenerating ? '创作中...' : '生成主题音乐'}
                      </Button>
                    </TabsContent>

                    {/* 环境音景 */}
                    <TabsContent value="ambient" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">环境场景</label>
                          <Select value={ambientForm.environment} onValueChange={(value) => setAmbientForm({...ambientForm, environment: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {environments.map(env => (
                                <SelectItem key={env.value} value={env.value}>{env.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">时长: {ambientForm.duration}秒</label>
                          <Slider
                            value={[ambientForm.duration]}
                            onValueChange={(value) => setAmbientForm({...ambientForm, duration: value[0]})}
                            max={300}
                            min={30}
                            step={30}
                            className="w-full"
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={handleAmbientGenerate} 
                        disabled={isGenerating}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {isGenerating ? '创作中...' : '生成环境音景'}
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
                      <Music className="w-5 h-5 text-green-600" />
                      音乐作品
                    </span>
                    {result && result.success && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={togglePlayPause}>
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button size="sm" variant="outline" onClick={downloadAudio}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">AI正在创作中...</span>
                    </div>
                  ) : result ? (
                    <div className="space-y-4">
                      {result.success ? (
                        <>
                          <div className="flex items-center gap-2 mb-4">
                            <Badge variant="secondary">{result.style}</Badge>
                            <Badge variant="outline">{result.duration}秒</Badge>
                            {result.metadata?.source && (
                              <Badge variant={result.metadata.source === 'ai_service' ? 'default' : 'secondary'}>
                                {result.metadata.source === 'ai_service' ? 'AI生成' : '示例'}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <audio
                              ref={audioRef}
                              src={result.audio_data}
                              onEnded={() => setIsPlaying(false)}
                              className="w-full"
                              controls
                            />
                          </div>
                          
                          {result.description && (
                            <div className="text-sm text-gray-600">
                              <strong>描述:</strong> {result.description}
                            </div>
                          )}

                          {result.metadata?.note && (
                            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                              {result.metadata.note}
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
                      选择创作类型并填写描述，开始您的音乐创作
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

export default MusicCreatorPage;
