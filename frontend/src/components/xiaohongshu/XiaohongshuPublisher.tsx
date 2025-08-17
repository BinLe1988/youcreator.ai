'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Send, 
  Eye, 
  Sparkles, 
  Tag, 
  Image as ImageIcon, 
  Music, 
  MapPin, 
  Clock,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Share2,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  xiaohongshuService, 
  type NoteContent, 
  type PublishRequest, 
  type ContentAnalysis,
  type PreviewData,
  type TagSuggestion 
} from '@/services/xiaohongshuService';

interface XiaohongshuPublisherProps {
  initialContent?: {
    title?: string;
    description?: string;
    imageUrl?: string;
    audioUrl?: string;
  };
  onPublished?: (noteId: string, url: string) => void;
}

export default function XiaohongshuPublisher({ 
  initialContent, 
  onPublished 
}: XiaohongshuPublisherProps) {
  const [noteContent, setNoteContent] = useState<NoteContent>({
    title: initialContent?.title || '',
    content: initialContent?.description || '',
    images: initialContent?.imageUrl ? [initialContent.imageUrl] : [],
    audioURL: initialContent?.audioUrl || '',
    tags: [],
    location: '',
    isPrivate: false,
    allowComment: true,
    allowShare: true,
  });

  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [tagSuggestions, setTagSuggestions] = useState<TagSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [autoFormat, setAutoFormat] = useState(true);
  const [autoTags, setAutoTags] = useState(true);
  const [activeTab, setActiveTab] = useState('edit');

  // 自动分析内容
  useEffect(() => {
    if (noteContent.title && noteContent.content) {
      handleAnalyzeContent();
    }
  }, [noteContent.title, noteContent.content]);

  // 分析内容
  const handleAnalyzeContent = async () => {
    if (!noteContent.title.trim() || !noteContent.content.trim()) {
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysisResult = await xiaohongshuService.analyzeContent(noteContent);
      setAnalysis(analysisResult);

      // 获取标签建议
      const suggestions = await xiaohongshuService.getTagSuggestions(noteContent);
      setTagSuggestions(suggestions);

      toast.success('内容分析完成');
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('内容分析失败');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 预览笔记
  const handlePreview = async () => {
    setIsPreviewing(true);
    try {
      const preview = await xiaohongshuService.previewNote(noteContent);
      setPreviewData(preview);
      setActiveTab('preview');
      toast.success('预览生成成功');
    } catch (error) {
      console.error('Preview failed:', error);
      toast.error('预览生成失败');
    } finally {
      setIsPreviewing(false);
    }
  };

  // 发布笔记
  const handlePublish = async () => {
    // 验证内容
    const validation = xiaohongshuService.validateNoteContent(noteContent);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }

    setIsPublishing(true);
    try {
      const publishRequest: PublishRequest = {
        user_id: 1, // 这里应该从用户状态获取
        note_content: noteContent,
        auto_format: autoFormat,
        auto_tags: autoTags,
      };

      const response = await xiaohongshuService.publishNote(publishRequest);
      
      if (response.success) {
        toast.success('笔记发布成功！');
        onPublished?.(response.note_id!, response.url!);
      } else {
        throw new Error(response.error || '发布失败');
      }
    } catch (error) {
      console.error('Publish failed:', error);
      toast.error(error instanceof Error ? error.message : '发布失败');
    } finally {
      setIsPublishing(false);
    }
  };

  // 添加标签
  const handleAddTag = (tag: string) => {
    if (noteContent.tags && noteContent.tags.length >= 8) {
      toast.error('最多只能添加8个标签');
      return;
    }

    if (noteContent.tags?.includes(tag)) {
      return;
    }

    setNoteContent(prev => ({
      ...prev,
      tags: [...(prev.tags || []), tag]
    }));
  };

  // 移除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setNoteContent(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  // 智能优化内容
  const handleOptimizeContent = () => {
    if (analysis) {
      const optimizedTitle = xiaohongshuService.generateSmartTitle(noteContent.content, analysis.theme);
      const optimizedContent = xiaohongshuService.optimizeContentForXiaohongshu(noteContent.content, analysis.theme);
      const suggestedTags = xiaohongshuService.generateTrendingTags(analysis.theme, analysis.keywords);

      setNoteContent(prev => ({
        ...prev,
        title: optimizedTitle,
        content: optimizedContent,
        tags: suggestedTags
      }));

      toast.success('内容已智能优化');
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
          发布到小红书
        </h2>
        <p className="text-muted-foreground">
          将您的创作内容发布到小红书，触达更多用户
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            编辑内容
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            预览效果
          </TabsTrigger>
          <TabsTrigger value="publish" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            发布设置
          </TabsTrigger>
        </TabsList>

        {/* 编辑内容 */}
        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                笔记内容
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 标题 */}
              <div className="space-y-2">
                <Label htmlFor="title">标题 *</Label>
                <Input
                  id="title"
                  placeholder="输入吸引人的标题（最多30字符）"
                  value={noteContent.title}
                  onChange={(e) => setNoteContent(prev => ({ ...prev, title: e.target.value }))}
                  maxLength={30}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {noteContent.title.length}/30
                </div>
              </div>

              {/* 内容 */}
              <div className="space-y-2">
                <Label htmlFor="content">正文内容 *</Label>
                <Textarea
                  id="content"
                  placeholder="分享您的精彩内容..."
                  value={noteContent.content}
                  onChange={(e) => setNoteContent(prev => ({ ...prev, content: e.target.value }))}
                  rows={8}
                  maxLength={1000}
                  className="resize-none"
                />
                <div className="text-xs text-muted-foreground text-right">
                  {noteContent.content.length}/1000
                </div>
              </div>

              {/* 媒体内容 */}
              {(noteContent.images?.length || noteContent.audioURL) && (
                <div className="space-y-2">
                  <Label>媒体内容</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* 图片 */}
                    {noteContent.images?.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <Badge variant="secondary" className="absolute top-2 left-2">
                          <ImageIcon className="h-3 w-3 mr-1" />
                          图片 {index + 1}
                        </Badge>
                      </div>
                    ))}

                    {/* 音频 */}
                    {noteContent.audioURL && (
                      <div className="flex items-center justify-center p-4 bg-muted rounded-lg border">
                        <div className="text-center space-y-2">
                          <Music className="h-8 w-8 mx-auto text-muted-foreground" />
                          <Badge variant="secondary">
                            <Music className="h-3 w-3 mr-1" />
                            背景音乐
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 位置 */}
              <div className="space-y-2">
                <Label htmlFor="location">位置（可选）</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="添加位置信息"
                    value={noteContent.location}
                    onChange={(e) => setNoteContent(prev => ({ ...prev, location: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 智能优化按钮 */}
              {analysis && (
                <div className="flex justify-center">
                  <Button
                    onClick={handleOptimizeContent}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    智能优化内容
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 标签管理 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                标签管理
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 已选标签 */}
              {noteContent.tags && noteContent.tags.length > 0 && (
                <div className="space-y-2">
                  <Label>已选标签 ({noteContent.tags.length}/8)</Label>
                  <div className="flex flex-wrap gap-2">
                    {noteContent.tags.map((tag, index) => (
                      <Badge key={index} variant="default" className="flex items-center gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 标签建议 */}
              {tagSuggestions.length > 0 && (
                <div className="space-y-2">
                  <Label>推荐标签</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {tagSuggestions.slice(0, 8).map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddTag(suggestion.tag)}
                        disabled={noteContent.tags?.includes(suggestion.tag)}
                        className="justify-start text-xs"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {suggestion.tag}
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {Math.round(suggestion.relevance * 100)}%
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 内容分析 */}
          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  内容分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">{analysis.theme}</div>
                    <div className="text-sm text-muted-foreground">主题</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{analysis.mood}</div>
                    <div className="text-sm text-muted-foreground">情感</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600">{analysis.style}</div>
                    <div className="text-sm text-muted-foreground">风格</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-orange-600">{analysis.category}</div>
                    <div className="text-sm text-muted-foreground">分类</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 预览效果 */}
        <TabsContent value="preview" className="space-y-6">
          {previewData ? (
            <>
              {/* 格式化后的内容预览 */}
              <Card>
                <CardHeader>
                  <CardTitle>小红书预览效果</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 标题 */}
                  <div className="text-lg font-semibold">
                    {previewData.formatted_content.title}
                  </div>

                  {/* 内容 */}
                  <div className="whitespace-pre-wrap text-sm">
                    {previewData.formatted_content.content}
                  </div>

                  {/* 标签 */}
                  {previewData.formatted_content.tags && (
                    <div className="flex flex-wrap gap-2">
                      {previewData.formatted_content.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* 媒体内容 */}
                  {previewData.formatted_content.images && previewData.formatted_content.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {previewData.formatted_content.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 预估数据 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    预估表现
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-600">
                        <Users className="h-5 w-5" />
                        {previewData.estimated_reach.estimated_views}
                      </div>
                      <div className="text-sm text-muted-foreground">预估浏览</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-2xl font-bold text-red-600">
                        <Heart className="h-5 w-5" />
                        {previewData.estimated_reach.estimated_likes}
                      </div>
                      <div className="text-sm text-muted-foreground">预估点赞</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-600">
                        <MessageCircle className="h-5 w-5" />
                        {previewData.estimated_reach.estimated_comments}
                      </div>
                      <div className="text-sm text-muted-foreground">预估评论</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 优化建议 */}
              {previewData.optimization_tips.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      优化建议
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {previewData.optimization_tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Eye className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">点击预览按钮查看效果</p>
                <Button onClick={handlePreview} disabled={isPreviewing}>
                  {isPreviewing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      生成预览中...
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      生成预览
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 发布设置 */}
        <TabsContent value="publish" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                发布设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 自动优化选项 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>自动格式化</Label>
                    <p className="text-sm text-muted-foreground">
                      自动优化内容格式，使其更适合小红书风格
                    </p>
                  </div>
                  <Switch
                    checked={autoFormat}
                    onCheckedChange={setAutoFormat}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>自动添加标签</Label>
                    <p className="text-sm text-muted-foreground">
                      根据内容分析自动添加相关标签
                    </p>
                  </div>
                  <Switch
                    checked={autoTags}
                    onCheckedChange={setAutoTags}
                  />
                </div>
              </div>

              {/* 隐私设置 */}
              <div className="space-y-4">
                <Label>隐私设置</Label>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>私密笔记</Label>
                    <p className="text-sm text-muted-foreground">
                      只有自己可以看到
                    </p>
                  </div>
                  <Switch
                    checked={noteContent.isPrivate}
                    onCheckedChange={(checked) => 
                      setNoteContent(prev => ({ ...prev, isPrivate: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>允许评论</Label>
                    <p className="text-sm text-muted-foreground">
                      其他用户可以评论这篇笔记
                    </p>
                  </div>
                  <Switch
                    checked={noteContent.allowComment}
                    onCheckedChange={(checked) => 
                      setNoteContent(prev => ({ ...prev, allowComment: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>允许分享</Label>
                    <p className="text-sm text-muted-foreground">
                      其他用户可以分享这篇笔记
                    </p>
                  </div>
                  <Switch
                    checked={noteContent.allowShare}
                    onCheckedChange={(checked) => 
                      setNoteContent(prev => ({ ...prev, allowShare: checked }))
                    }
                  />
                </div>
              </div>

              {/* 最佳发布时间提示 */}
              <Card className="bg-blue-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <Label className="text-blue-900">最佳发布时间建议</Label>
                  </div>
                  <div className="space-y-1 text-sm text-blue-800">
                    {xiaohongshuService.getBestPublishTime().map((time, index) => (
                      <div key={index}>
                        <strong>{time.time}</strong> - {time.reason}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 操作按钮 */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={handlePreview}
          variant="outline"
          disabled={isPreviewing || !noteContent.title || !noteContent.content}
        >
          {isPreviewing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              预览中...
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              预览效果
            </>
          )}
        </Button>

        <Button
          onClick={handlePublish}
          disabled={isPublishing || !noteContent.title || !noteContent.content}
          className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700"
        >
          {isPublishing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              发布中...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              发布到小红书
            </>
          )}
        </Button>
      </div>

      {/* 分析状态 */}
      {isAnalyzing && (
        <div className="text-center text-sm text-muted-foreground">
          <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
          正在分析内容...
        </div>
      )}
    </div>
  );
}
