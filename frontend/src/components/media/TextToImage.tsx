'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Copy, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { mediaService, type TextToImageRequest, type StyleInfo } from '@/services/mediaService';

interface TextToImageProps {
  initialText?: string;
  onImageGenerated?: (imageUrl: string, prompt: string) => void;
}

export default function TextToImage({ initialText = '', onImageGenerated }: TextToImageProps) {
  const [text, setText] = useState(initialText);
  const [style, setStyle] = useState('realistic');
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [inferenceSteps, setInferenceSteps] = useState(20);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [availableStyles, setAvailableStyles] = useState<StyleInfo[]>([]);

  // 预设尺寸选项
  const sizePresets = [
    { label: '正方形 (512×512)', width: 512, height: 512 },
    { label: '横向 (768×512)', width: 768, height: 512 },
    { label: '纵向 (512×768)', width: 512, height: 768 },
    { label: '宽屏 (1024×576)', width: 1024, height: 576 },
    { label: '高清 (1024×1024)', width: 1024, height: 1024 },
  ];

  // 加载可用风格
  useEffect(() => {
    const loadStyles = async () => {
      try {
        const styles = await mediaService.getAvailableStyles();
        setAvailableStyles(styles);
      } catch (error) {
        console.error('Failed to load styles:', error);
        // 使用默认风格
        setAvailableStyles([
          { id: 'realistic', name: '写实风格', description: '照片级真实感' },
          { id: 'artistic', name: '艺术风格', description: '绘画艺术感' },
          { id: 'cartoon', name: '卡通风格', description: '动画卡通风' },
        ]);
      }
    };
    loadStyles();
  }, []);

  // 生成图片
  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error('请输入图片描述');
      return;
    }

    setIsGenerating(true);
    try {
      const request: TextToImageRequest = {
        text: text.trim(),
        style,
        width,
        height,
        num_inference_steps: inferenceSteps,
        guidance_scale: guidanceScale,
      };

      const response = await mediaService.textToImage(request);
      
      if (response.success && response.data?.image) {
        setGeneratedImage(response.data.image);
        setGeneratedPrompt(response.data.prompt || text);
        onImageGenerated?.(response.data.image, response.data.prompt || text);
        toast.success('图片生成成功！');
      } else {
        throw new Error(response.error || '图片生成失败');
      }
    } catch (error) {
      console.error('Image generation failed:', error);
      toast.error(error instanceof Error ? error.message : '图片生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

  // 下载图片
  const handleDownload = () => {
    if (generatedImage) {
      const filename = `generated-image-${Date.now()}.png`;
      mediaService.downloadMedia(generatedImage, filename);
      toast.success('图片下载开始');
    }
  };

  // 复制图片URL
  const handleCopyUrl = async () => {
    if (generatedImage) {
      try {
        await navigator.clipboard.writeText(generatedImage);
        toast.success('图片URL已复制到剪贴板');
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

  // 设置预设尺寸
  const handleSizePreset = (preset: typeof sizePresets[0]) => {
    setWidth(preset.width);
    setHeight(preset.height);
  };

  return (
    <div className="space-y-6">
      {/* 输入区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            文字配图
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 文字描述 */}
          <div className="space-y-2">
            <Label htmlFor="text-input">图片描述</Label>
            <Textarea
              id="text-input"
              placeholder="请描述您想要生成的图片，例如：一个宁静的湖边小屋，夕阳西下，水面波光粼粼..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* 风格选择 */}
          <div className="space-y-2">
            <Label>图片风格</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger>
                <SelectValue placeholder="选择图片风格" />
              </SelectTrigger>
              <SelectContent>
                {availableStyles.map((styleInfo) => (
                  <SelectItem key={styleInfo.id} value={styleInfo.id}>
                    <div>
                      <div className="font-medium">{styleInfo.name}</div>
                      <div className="text-sm text-muted-foreground">{styleInfo.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 尺寸设置 */}
          <div className="space-y-3">
            <Label>图片尺寸</Label>
            
            {/* 预设尺寸 */}
            <div className="flex flex-wrap gap-2">
              {sizePresets.map((preset, index) => (
                <Button
                  key={index}
                  variant={width === preset.width && height === preset.height ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSizePreset(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* 自定义尺寸 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">宽度: {width}px</Label>
                <Slider
                  id="width"
                  min={256}
                  max={1024}
                  step={64}
                  value={[width]}
                  onValueChange={(value) => setWidth(value[0])}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">高度: {height}px</Label>
                <Slider
                  id="height"
                  min={256}
                  max={1024}
                  step={64}
                  value={[height]}
                  onValueChange={(value) => setHeight(value[0])}
                />
              </div>
            </div>
          </div>

          {/* 高级设置 */}
          <details className="space-y-3">
            <summary className="cursor-pointer text-sm font-medium">高级设置</summary>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="steps">推理步数: {inferenceSteps}</Label>
                <Slider
                  id="steps"
                  min={10}
                  max={50}
                  step={1}
                  value={[inferenceSteps]}
                  onValueChange={(value) => setInferenceSteps(value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  更多步数通常产生更好的质量，但需要更长时间
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="guidance">引导强度: {guidanceScale}</Label>
                <Slider
                  id="guidance"
                  min={1}
                  max={20}
                  step={0.5}
                  value={[guidanceScale]}
                  onValueChange={(value) => setGuidanceScale(value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  更高的值让AI更严格遵循描述
                </p>
              </div>
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
                <ImageIcon className="mr-2 h-4 w-4" />
                生成图片
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 结果展示 */}
      {generatedImage && (
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
            {/* 生成的图片 */}
            <div className="relative">
              <img
                src={generatedImage}
                alt="Generated image"
                className="w-full rounded-lg shadow-lg"
                style={{ maxHeight: '600px', objectFit: 'contain' }}
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <Badge variant="secondary">{width}×{height}</Badge>
                <Badge variant="secondary">{style}</Badge>
              </div>
            </div>

            {/* 生成信息 */}
            {generatedPrompt && (
              <div className="space-y-2">
                <Label>使用的提示词</Label>
                <div className="p-3 bg-muted rounded-lg text-sm">
                  {generatedPrompt}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
