'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Copy, RefreshCw, Music, Play, Pause, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { mediaService, type TextToMusicRequest } from '@/services/mediaService';

interface TextToMusicProps {
  initialText?: string;
  onMusicGenerated?: (audioUrl: string, description: string) => void;
}

export default function TextToMusic({ initialText = '', onMusicGenerated }: TextToMusicProps) {
  const [text, setText] = useState(initialText);
  const [duration, setDuration] = useState(10);
  const [temperature, setTemperature] = useState(1.0);
  const [topK, setTopK] = useState(250);
  const [topP, setTopP] = useState(0.0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [generatedDescription, setGeneratedDescription] = useState<string>('');
  const [sampleRate, setSampleRate] = useState<number>(32000);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // 音乐风格建议
  const musicStyleSuggestions = [
    '宁静的环境音乐',
    '激动人心的史诗音乐',
    '轻松的爵士乐',
    '神秘的电子音乐',
    '温暖的原声吉他',
    '古典管弦乐',
    '现代流行音乐',
    '放松的钢琴曲',
  ];

  // 生成音乐
  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error('请输入音乐描述');
      return;
    }

    setIsGenerating(true);
    try {
      const request: TextToMusicRequest = {
        text: text.trim(),
        duration,
        temperature,
        top_k: topK,
        top_p: topP,
      };

      const response = await mediaService.textToMusic(request);
      
      if (response.success && response.data?.audio) {
        const audioUrl = mediaService.createAudioURL(response.data.audio);
        setGeneratedAudio(audioUrl);
        setGeneratedDescription(response.data.description || text);
        setSampleRate(response.data.sample_rate || 32000);
        onMusicGenerated?.(audioUrl, response.data.description || text);
        toast.success('音乐生成成功！');
      } else {
        throw new Error(response.error || '音乐生成失败');
      }
    } catch (error) {
      console.error('Music generation failed:', error);
      toast.error(error instanceof Error ? error.message : '音乐生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

  // 播放/暂停音乐
  const handlePlayPause = () => {
    if (!generatedAudio) return;

    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
    } else {
      const audio = new Audio(generatedAudio);
      audio.addEventListener('ended', () => setIsPlaying(false));
      audio.addEventListener('pause', () => setIsPlaying(false));
      audio.addEventListener('play', () => setIsPlaying(true));
      setAudioElement(audio);
      audio.play();
    }
  };

  // 下载音乐
  const handleDownload = () => {
    if (generatedAudio) {
      const filename = `generated-music-${Date.now()}.wav`;
      mediaService.downloadMedia(generatedAudio, filename);
      toast.success('音乐下载开始');
    }
  };

  // 复制音乐URL
  const handleCopyUrl = async () => {
    if (generatedAudio) {
      try {
        await navigator.clipboard.writeText(generatedAudio);
        toast.success('音乐URL已复制到剪贴板');
      } catch (error) {
        toast.error('复制失败');
      }
    }
  };

  // 重新生成
  const handleRegenerate = () => {
    if (text.trim()) {
      handleGenerate();
    }
  };

  // 使用建议
  const handleUseSuggestion = (suggestion: string) => {
    setText(suggestion);
  };

  return (
    <div className="space-y-6">
      {/* 输入区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            文字配乐
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 音乐描述 */}
          <div className="space-y-2">
            <Label htmlFor="text-input">音乐描述</Label>
            <Textarea
              id="text-input"
              placeholder="请描述您想要的音乐风格和情感，例如：宁静的钢琴曲，带有温暖的情感，适合阅读时聆听..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* 风格建议 */}
          <div className="space-y-2">
            <Label>风格建议</Label>
            <div className="flex flex-wrap gap-2">
              {musicStyleSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleUseSuggestion(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* 基础设置 */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="duration">音乐时长: {duration}秒</Label>
              <Slider
                id="duration"
                min={5}
                max={30}
                step={1}
                value={[duration]}
                onValueChange={(value) => setDuration(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                较长的时长需要更多生成时间
              </p>
            </div>
          </div>

          {/* 高级设置 */}
          <details className="space-y-3">
            <summary className="cursor-pointer text-sm font-medium">高级设置</summary>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="temperature">创造性: {temperature}</Label>
                <Slider
                  id="temperature"
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  value={[temperature]}
                  onValueChange={(value) => setTemperature(value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  更高的值产生更有创意但可能不太连贯的音乐
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="topk">多样性 (Top-K): {topK}</Label>
                <Slider
                  id="topk"
                  min={50}
                  max={500}
                  step={10}
                  value={[topK]}
                  onValueChange={(value) => setTopK(value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  控制音乐生成的多样性
                </p>
              </div>
              {topP > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="topp">核心采样 (Top-P): {topP}</Label>
                  <Slider
                    id="topp"
                    min={0.0}
                    max={1.0}
                    step={0.1}
                    value={[topP]}
                    onValueChange={(value) => setTopP(value[0])}
                  />
                  <p className="text-xs text-muted-foreground">
                    0表示不使用，大于0时与Top-K配合使用
                  </p>
                </div>
              )}
            </div>
          </details>

          {/* 生成按钮 */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !text.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Music className="mr-2 h-4 w-4" />
                生成音乐
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 结果展示 */}
      {generatedAudio && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>生成结果</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRegenerate}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  重新生成
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                  <Copy className="h-4 w-4 mr-1" />
                  复制链接
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-1" />
                  下载
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 音乐播放器 */}
            <div className="flex items-center justify-center p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <Button
                    onClick={handlePlayPause}
                    size="lg"
                    className="rounded-full w-16 h-16"
                  >
                    {isPlaying ? (
                      <Pause className="h-8 w-8" />
                    ) : (
                      <Play className="h-8 w-8 ml-1" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground">
                    点击播放生成的音乐
                  </span>
                </div>
              </div>
            </div>

            {/* 音乐信息 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{duration}s</div>
                <div className="text-sm text-muted-foreground">时长</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{sampleRate}Hz</div>
                <div className="text-sm text-muted-foreground">采样率</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{temperature}</div>
                <div className="text-sm text-muted-foreground">创造性</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">WAV</div>
                <div className="text-sm text-muted-foreground">格式</div>
              </div>
            </div>

            {/* 生成信息 */}
            {generatedDescription && (
              <div className="space-y-2">
                <Label>音乐描述</Label>
                <div className="p-3 bg-muted rounded-lg text-sm">
                  {generatedDescription}
                </div>
              </div>
            )}

            {/* 原生音频控件（备用） */}
            <details className="space-y-2">
              <summary className="cursor-pointer text-sm font-medium">音频控件</summary>
              <audio controls className="w-full" src={generatedAudio}>
                您的浏览器不支持音频播放。
              </audio>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
