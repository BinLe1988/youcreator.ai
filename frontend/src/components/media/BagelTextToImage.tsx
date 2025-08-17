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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Download, 
  Copy, 
  RefreshCw, 
  Image as ImageIcon,
  Sparkles,
  Wand2,
  Grid3X3,
  ZoomIn,
  Settings,
  Eye,
  Shuffle
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  bagelMediaService, 
  type BagelTextToImageRequest, 
  type BagelStyleInfo,
  type ImageVariationsRequest,
  type ImageUpscaleRequest
} from '@/services/bagelMediaService';

interface BagelTextToImageProps {
  initialText?: string;
  onImageGenerated?: (imageUrl: string, prompt: string, metadata?: any) => void;
}

export default function BagelTextToImage({ initialText = '', onImageGenerated }: BagelTextToImageProps) {
  const [text, setText] = useState(initialText);
  const [style, setStyle] = useState('realistic');
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [inferenceSteps, setInferenceSteps] = useState(20);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [numImages, setNumImages] = useState(1);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [useRandomSeed, setUseRandomSeed] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Array<{image: string; index: number}>>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [availableStyles, setAvailableStyles] = useState<BagelStyleInfo[]>([]);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 预设尺寸选项
  const sizePresets = [
    { label: '正方形 (512×512)', width: 512, height: 512 },
    { label: '横向 (768×512)', width: 768, height: 512 },
    { label: '纵向 (512×768)', width: 512, height: 768 },
    { label: '宽屏 (1024×576)', width: 1024, height: 576 },
    { label: '高清 (1024×1024)', width: 1024, height: 1024 },
  ];

  // 加载Bagel模型信息和风格
  useEffect(() => {
    const loadBagelInfo = async () => {
      try {
        const [styles, capabilities] = await Promise.all([
          bagelMediaService.getAvailableStyles(),
          bagelMediaService.getCapabilities()
        ]);
        setAvailableStyles(styles);
        setModelInfo(capabilities);
      } catch (error) {
        console.error('Failed to load Bagel info:', error);
        // 使用默认风格
        setAvailableStyles([
          { id: 'realistic', name: '写实风格', description: '照片级真实感' },
          { id: 'artistic', name: '艺术风格', description: '绘画艺术感' },
          { id: 'anime', name: '动漫风格', description: '日式动漫风格' },
        ]);
      }
    };
    loadBagelInfo();
  }, []);

  // 自动生成负面提示词
  useEffect(() => {
    if (!negativePrompt) {
      const autoNegative = bagelMediaService.generateNegativePrompt(style);
      setNegativePrompt(autoNegative);
    }
  }, [style]);

  // 生成图片
  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error('请输入图片描述');
      return;
    }

    setIsGenerating(true);
    try {
      const request: BagelTextToImageRequest = {
        text: text.trim(),
        style,
        width,
        height,
        num_inference_steps: inferenceSteps,
        guidance_scale: guidanceScale,
        negative_prompt: negativePrompt || undefined,
        num_images: numImages,
        seed: useRandomSeed ? undefined : seed,
      };

      const response = await bagelMediaService.textToImage(request);
      
      if (response.success && response.data?.images) {
        setGeneratedImages(response.data.images);
        setSelectedImageIndex(0);
        setGeneratedPrompt(response.data.prompt || text);
        
        // 回调第一张图片
        if (response.data.images.length > 0) {
          onImageGenerated?.(
            response.data.images[0].image, 
            response.data.prompt || text,
            response.data.metadata
          );
        }
        
        toast.success(`成功生成 ${response.data.images.length} 张图片！`);
      } else {
        throw new Error(response.error || '图片生成失败');
      }
    } catch (error) {
      console.error('Bagel image generation failed:', error);
      toast.error(error instanceof Error ? error.message : '图片生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

  // 生成图像变体
  const handleGenerateVariations = async () => {
    if (generatedImages.length === 0) {
      toast.error('请先生成一张图片');
      return;
    }

    const baseImage = generatedImages[selectedImageIndex].image;
    
    try {
      const request: ImageVariationsRequest = {
        base_image: baseImage,
        prompt: text.trim(),
        num_variations: 4,
        variation_strength: 0.7
      };

      const response = await bagelMediaService.generateImageVariations(request);
      
      if (response.success && response.data?.variations) {
        // 将变体添加到图片列表
        const variations = response.data.variations.map((v, index) => ({
          image: v.image,
          index: generatedImages.length + index
        }));
        
        setGeneratedImages(prev => [...prev, ...variations]);
        toast.success(`生成了 ${variations.length} 个变体！`);
      } else {
        throw new Error(response.error || '变体生成失败');
      }
    } catch (error) {
      console.error('Variations generation failed:', error);
      toast.error(error instanceof Error ? error.message : '变体生成失败');
    }
  };

  // 图像放大
  const handleUpscaleImage = async () => {
    if (generatedImages.length === 0) {
      toast.error('请先生成一张图片');
      return;
    }

    const selectedImage = generatedImages[selectedImageIndex].image;
    
    try {
      const request: ImageUpscaleRequest = {
        image_data: selectedImage,
        scale_factor: 2,
        enhance_quality: true
      };

      const response = await bagelMediaService.upscaleImage(request);
      
      if (response.success && response.data?.image) {
        // 添加放大后的图片
        const upscaledImage = {
          image: response.data.image,
          index: generatedImages.length
        };
        
        setGeneratedImages(prev => [...prev, upscaledImage]);
        setSelectedImageIndex(generatedImages.length);
        toast.success('图片放大成功！');
      } else {
        throw new Error(response.error || '图片放大失败');
      }
    } catch (error) {
      console.error('Image upscaling failed:', error);
      toast.error(error instanceof Error ? error.message : '图片放大失败');
    }
  };

  // 下载图片
  const handleDownload = () => {
    if (generatedImages.length > 0) {
      const selectedImage = generatedImages[selectedImageIndex];
      const filename = `bagel-generated-${selectedImage.index}-${Date.now()}.png`;
      bagelMediaService.downloadMedia(selectedImage.image, filename);
      toast.success('图片下载开始');
    }
  };

  // 复制图片URL
  const handleCopyUrl = async () => {
    if (generatedImages.length > 0) {
      const selectedImage = generatedImages[selectedImageIndex];
      try {
        await navigator.clipboard.writeText(selectedImage.image);
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

  // 随机种子
  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 1000000);
    setSeed(randomSeed);
  };

  // 设置预设尺寸
  const handleSizePreset = (preset: typeof sizePresets[0]) => {
    setWidth(preset.width);
    setHeight(preset.height);
  };

  // 智能增强提示词
  const handleEnhancePrompt = () => {
    const enhanced = bagelMediaService.enhancePrompt(text, style);
    setText(enhanced);
    toast.success('提示词已智能增强');
  };

  return (
    <div className="space-y-6">
      {/* Bagel模型信息 */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Wand2 className="h-5 w-5" />
            Bagel AI 图像生成
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Sparkles className="h-3 w-3 mr-1" />
              高质量生成
            </Badge>
            <Badge variant="secondary" className="bg-pink-100 text-pink-800">
              <Eye className="h-3 w-3 mr-1" />
              多风格支持
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Grid3X3 className="h-3 w-3 mr-1" />
              批量生成
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <ZoomIn className="h-3 w-3 mr-1" />
              图像放大
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 输入区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Bagel 文字配图
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 文字描述 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="text-input">图片描述</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnhancePrompt}
                disabled={!text.trim()}
              >
                <Wand2 className="h-3 w-3 mr-1" />
                智能增强
              </Button>
            </div>
            <Textarea
              id="text-input"
              placeholder="请详细描述您想要生成的图片，Bagel模型能理解复杂的描述..."
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

          {/* 基础设置 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>生成数量: {numImages}</Label>
              <Slider
                min={1}
                max={4}
                step={1}
                value={[numImages]}
                onValueChange={(value) => setNumImages(value[0])}
              />
            </div>
            <div className="space-y-2">
              <Label>推理步数: {inferenceSteps}</Label>
              <Slider
                min={10}
                max={50}
                step={1}
                value={[inferenceSteps]}
                onValueChange={(value) => setInferenceSteps(value[0])}
              />
            </div>
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>高级设置</Label>
              <Switch
                checked={showAdvanced}
                onCheckedChange={setShowAdvanced}
              />
            </div>
            
            {showAdvanced && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                {/* 引导强度 */}
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

                {/* 负面提示词 */}
                <div className="space-y-2">
                  <Label htmlFor="negative">负面提示词</Label>
                  <Textarea
                    id="negative"
                    placeholder="描述您不想在图片中看到的内容..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                </div>

                {/* 随机种子 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>随机种子</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={useRandomSeed}
                        onCheckedChange={setUseRandomSeed}
                      />
                      <span className="text-sm text-muted-foreground">随机</span>
                    </div>
                  </div>
                  {!useRandomSeed && (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="输入种子值"
                        value={seed || ''}
                        onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generateRandomSeed}
                      >
                        <Shuffle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 生成按钮 */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !text.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Bagel AI 生成中...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                使用 Bagel 生成图片
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 结果展示 */}
      {generatedImages.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bagel 生成结果</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleGenerateVariations}>
                  <Grid3X3 className="h-4 w-4 mr-1" />
                  生成变体
                </Button>
                <Button variant="outline" size="sm" onClick={handleUpscaleImage}>
                  <ZoomIn className="h-4 w-4 mr-1" />
                  图像放大
                </Button>
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
            {/* 图片选择器 */}
            {generatedImages.length > 1 && (
              <div className="space-y-2">
                <Label>选择图片 ({selectedImageIndex + 1}/{generatedImages.length})</Label>
                <div className="grid grid-cols-4 gap-2">
                  {generatedImages.map((img, index) => (
                    <div
                      key={index}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                        selectedImageIndex === index ? 'border-purple-500' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={img.image}
                        alt={`Generated ${index + 1}`}
                        className="w-full aspect-square object-cover"
                      />
                      <Badge 
                        variant={selectedImageIndex === index ? "default" : "secondary"}
                        className="absolute top-1 left-1 text-xs"
                      >
                        {index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 主图片显示 */}
            <div className="relative">
              <img
                src={generatedImages[selectedImageIndex].image}
                alt="Generated image"
                className="w-full rounded-lg shadow-lg"
                style={{ maxHeight: '600px', objectFit: 'contain' }}
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Bagel AI
                </Badge>
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

            {/* Bagel模型特色功能提示 */}
            <div className="text-sm text-muted-foreground bg-purple-50 p-3 rounded-lg border border-purple-200">
              <p className="font-medium mb-1 text-purple-900">🎨 Bagel模型特色：</p>
              <ul className="space-y-1 text-xs text-purple-800">
                <li>• 更高的图像质量和细节表现</li>
                <li>• 更准确的提示词理解能力</li>
                <li>• 支持图像变体和超分辨率放大</li>
                <li>• 优化的负面提示词处理</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
