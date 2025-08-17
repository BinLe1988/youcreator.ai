'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Copy, RefreshCw, Music, Play, Pause, Volume2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { mediaService, type ImageToMusicRequest } from '@/services/mediaService';

interface ImageToMusicProps {
  initialImage?: string;
  onMusicGenerated?: (audioUrl: string, imageCaption: string, musicDescription: string) => void;
}

export default function ImageToMusic({ initialImage, onMusicGenerated }: ImageToMusicProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(initialImage || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(10);
  const [temperature, setTemperature] = useState(1.0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState<string>('');
  const [musicDescription, setMusicDescription] = useState<string>('');
  const [sampleRate, setSampleRate] = useState<number>(32000);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件
    const validation = mediaService.validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setSelectedFile(file);

    // 创建预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 移除选中的图片
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 生成音乐
  const handleGenerate = async () => {
    if (!selectedImage) {
      toast.error('请先选择一张图片');
      return;
    }

    setIsGenerating(true);
    try {
      let response;

      if (selectedFile) {
        // 使用文件上传方式
        response = await mediaService.uploadImageAndGenerateMusic(
          selectedFile,
          duration,
          temperature
        );
      } else {
        // 使用base64方式
        const request: ImageToMusicRequest = {
          image_base64: selectedImage,
          duration,
          temperature,
        };
        response = await mediaService.imageToMusic(request);
      }
      
      if (response.success && response.data?.audio) {
        const audioUrl = mediaService.createAudioURL(response.data.audio);
        setGeneratedAudio(audioUrl);
        setImageCaption(response.data.image_caption || '');
        setMusicDescription(response.data.music_description || '');
        setSampleRate(response.data.sample_rate || 32000);
        onMusicGenerated?.(audioUrl, response.data.image_caption || '', response.data.music_description || '');
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
      const filename = `image-music-${Date.now()}.wav`;
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
    if (selectedImage) {
      handleGenerate();
    }
  };

  return (
    <div className="space-y-6">
      {/* 输入区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            图片配乐
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 图片上传区域 */}
          <div className="space-y-2">
            <Label>选择图片</Label>
            
            {!selectedImage ? (
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">点击上传图片</p>
                <p className="text-sm text-muted-foreground mb-4">
                  支持 JPG、PNG、WebP、GIF 格式，最大 10MB
                </p>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  选择文件
                </Button>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Selected image"
                  className="w-full max-h-96 object-contain rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary" className="bg-black/50 text-white">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    {selectedFile ? selectedFile.name : '已选择图片'}
                  </Badge>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* 音乐设置 */}
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
                AI会根据图片内容和情感生成相应的音乐
              </p>
            </div>

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
                更高的值产生更有创意的音乐，但可能与图片关联度较低
              </p>
            </div>
          </div>

          {/* 生成按钮 */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedImage}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                分析图片并生成音乐...
              </>
            ) : (
              <>
                <Music className="mr-2 h-4 w-4" />
                生成配乐
              </>
            )}
          </Button>

          {/* 功能说明 */}
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="font-medium mb-1">🎵 图片配乐功能说明：</p>
            <ul className="space-y-1 text-xs">
              <li>• AI会自动分析图片的内容、色彩和情感</li>
              <li>• 根据图片特征生成匹配的背景音乐</li>
              <li>• 支持风景、人物、抽象等各种类型的图片</li>
              <li>• 生成的音乐会体现图片的氛围和情感</li>
            </ul>
          </div>
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
            <div className="flex items-center justify-center p-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
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
                    为您的图片生成的专属配乐
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

            {/* 图片分析结果 */}
            {imageCaption && (
              <div className="space-y-2">
                <Label>图片分析</Label>
                <div className="p-3 bg-blue-50 rounded-lg text-sm">
                  <p className="font-medium text-blue-900 mb-1">AI识别的图片内容：</p>
                  <p className="text-blue-800">{imageCaption}</p>
                </div>
              </div>
            )}

            {/* 音乐描述 */}
            {musicDescription && (
              <div className="space-y-2">
                <Label>音乐描述</Label>
                <div className="p-3 bg-green-50 rounded-lg text-sm">
                  <p className="font-medium text-green-900 mb-1">生成的音乐风格：</p>
                  <p className="text-green-800">{musicDescription}</p>
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
