'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenTool, BookOpen, FileText, Theater, Sparkles, Download, Copy, RefreshCw } from 'lucide-react';

interface TextCreationResult {
  success: boolean;
  content: string;
  task_type: string;
  word_count: number;
  metadata?: any;
  error?: string;
}

const TextCreatorPage = () => {
  const [activeTab, setActiveTab] = useState('novel');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<TextCreationResult | null>(null);

  // 小说创作状态
  const [novelForm, setNovelForm] = useState({
    theme: '',
    genre: '现代都市',
    length: '短篇',
    style: '第三人称'
  });

  // 诗歌创作状态
  const [poemForm, setPoemForm] = useState({
    theme: '',
    style: '现代诗',
    mood: '抒情'
  });

  // 剧本创作状态
  const [scriptForm, setScriptForm] = useState({
    theme: '',
    type: '短剧',
    characters: 3
  });

  // 文章写作状态
  const [articleForm, setArticleForm] = useState({
    topic: '',
    type: '议论文',
    audience: '一般读者'
  });

  // 文本改进状态
  const [improveForm, setImproveForm] = useState({
    originalText: '',
    improvementType: '语言优化'
  });

  const genres = ['现代都市', '古代言情', '科幻未来', '奇幻冒险', '悬疑推理', '历史传奇'];
  const poemStyles = ['现代诗', '古体诗', '自由诗', '散文诗', '儿童诗'];
  const scriptTypes = ['短剧', '话剧', '小品', '独角戏', '音乐剧'];
  const articleTypes = ['议论文', '说明文', '记叙文', '散文', '评论文', '科普文'];
  const improvementTypes = ['语言优化', '结构调整', '内容扩展', '风格转换', '错误修正'];

  const generateText = async (type: string, params: any) => {
    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/text/generate', {
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
        content: '',
        task_type: type,
        word_count: 0,
        error: '生成失败，请检查网络连接'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNovelGenerate = () => {
    if (!novelForm.theme.trim()) {
      alert('请输入小说主题');
      return;
    }
    generateText('novel', novelForm);
  };

  const handlePoemGenerate = () => {
    if (!poemForm.theme.trim()) {
      alert('请输入诗歌主题');
      return;
    }
    generateText('poem', poemForm);
  };

  const handleScriptGenerate = () => {
    if (!scriptForm.theme.trim()) {
      alert('请输入剧本主题');
      return;
    }
    generateText('script', scriptForm);
  };

  const handleArticleGenerate = () => {
    if (!articleForm.topic.trim()) {
      alert('请输入文章主题');
      return;
    }
    generateText('article', articleForm);
  };

  const handleImproveGenerate = () => {
    if (!improveForm.originalText.trim()) {
      alert('请输入要改进的文本');
      return;
    }
    generateText('improve', improveForm);
  };

  const copyToClipboard = () => {
    if (result?.content) {
      navigator.clipboard.writeText(result.content);
      alert('内容已复制到剪贴板');
    }
  };

  const downloadText = () => {
    if (result?.content) {
      const blob = new Blob([result.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${result.task_type}_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <PenTool className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-800">文字创作工具</h1>
          </div>
          <p className="text-gray-600 text-lg">AI驱动的多样化文字创作平台</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧创作面板 */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  创作面板
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="novel" className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      小说
                    </TabsTrigger>
                    <TabsTrigger value="poem" className="flex items-center gap-1">
                      <PenTool className="w-4 h-4" />
                      诗歌
                    </TabsTrigger>
                    <TabsTrigger value="script" className="flex items-center gap-1">
                      <Theater className="w-4 h-4" />
                      剧本
                    </TabsTrigger>
                    <TabsTrigger value="article" className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      文章
                    </TabsTrigger>
                    <TabsTrigger value="improve" className="flex items-center gap-1">
                      <RefreshCw className="w-4 h-4" />
                      改进
                    </TabsTrigger>
                  </TabsList>

                  {/* 小说创作 */}
                  <TabsContent value="novel" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">小说主题</label>
                        <Input
                          placeholder="请输入小说主题..."
                          value={novelForm.theme}
                          onChange={(e) => setNovelForm({...novelForm, theme: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">小说类型</label>
                        <Select value={novelForm.genre} onValueChange={(value) => setNovelForm({...novelForm, genre: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {genres.map(genre => (
                              <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">小说长度</label>
                        <Select value={novelForm.length} onValueChange={(value) => setNovelForm({...novelForm, length: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="短篇">短篇</SelectItem>
                            <SelectItem value="中篇">中篇</SelectItem>
                            <SelectItem value="长篇">长篇</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">叙述方式</label>
                        <Select value={novelForm.style} onValueChange={(value) => setNovelForm({...novelForm, style: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="第一人称">第一人称</SelectItem>
                            <SelectItem value="第三人称">第三人称</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      onClick={handleNovelGenerate} 
                      disabled={isGenerating}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isGenerating ? '创作中...' : '开始创作小说'}
                    </Button>
                  </TabsContent>

                  {/* 诗歌创作 */}
                  <TabsContent value="poem" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">诗歌主题</label>
                        <Input
                          placeholder="请输入诗歌主题..."
                          value={poemForm.theme}
                          onChange={(e) => setPoemForm({...poemForm, theme: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">诗歌风格</label>
                        <Select value={poemForm.style} onValueChange={(value) => setPoemForm({...poemForm, style: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {poemStyles.map(style => (
                              <SelectItem key={style} value={style}>{style}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">情感基调</label>
                        <Select value={poemForm.mood} onValueChange={(value) => setPoemForm({...poemForm, mood: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="抒情">抒情</SelectItem>
                            <SelectItem value="叙事">叙事</SelectItem>
                            <SelectItem value="哲理">哲理</SelectItem>
                            <SelectItem value="讽刺">讽刺</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      onClick={handlePoemGenerate} 
                      disabled={isGenerating}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isGenerating ? '创作中...' : '开始创作诗歌'}
                    </Button>
                  </TabsContent>

                  {/* 剧本创作 */}
                  <TabsContent value="script" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">剧本主题</label>
                        <Input
                          placeholder="请输入剧本主题..."
                          value={scriptForm.theme}
                          onChange={(e) => setScriptForm({...scriptForm, theme: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">剧本类型</label>
                        <Select value={scriptForm.type} onValueChange={(value) => setScriptForm({...scriptForm, type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {scriptTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">主要角色数量</label>
                        <Select value={scriptForm.characters.toString()} onValueChange={(value) => setScriptForm({...scriptForm, characters: parseInt(value)})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2人</SelectItem>
                            <SelectItem value="3">3人</SelectItem>
                            <SelectItem value="4">4人</SelectItem>
                            <SelectItem value="5">5人</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      onClick={handleScriptGenerate} 
                      disabled={isGenerating}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isGenerating ? '创作中...' : '开始创作剧本'}
                    </Button>
                  </TabsContent>

                  {/* 文章写作 */}
                  <TabsContent value="article" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">文章主题</label>
                        <Input
                          placeholder="请输入文章主题..."
                          value={articleForm.topic}
                          onChange={(e) => setArticleForm({...articleForm, topic: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">文章类型</label>
                        <Select value={articleForm.type} onValueChange={(value) => setArticleForm({...articleForm, type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {articleTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">目标读者</label>
                        <Select value={articleForm.audience} onValueChange={(value) => setArticleForm({...articleForm, audience: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="学生">学生</SelectItem>
                            <SelectItem value="专业人士">专业人士</SelectItem>
                            <SelectItem value="一般读者">一般读者</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      onClick={handleArticleGenerate} 
                      disabled={isGenerating}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isGenerating ? '写作中...' : '开始写作文章'}
                    </Button>
                  </TabsContent>

                  {/* 文本改进 */}
                  <TabsContent value="improve" className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">原始文本</label>
                      <Textarea
                        placeholder="请输入要改进的文本..."
                        value={improveForm.originalText}
                        onChange={(e) => setImproveForm({...improveForm, originalText: e.target.value})}
                        rows={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">改进类型</label>
                      <Select value={improveForm.improvementType} onValueChange={(value) => setImproveForm({...improveForm, improvementType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {improvementTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleImproveGenerate} 
                      disabled={isGenerating}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isGenerating ? '改进中...' : '开始改进文本'}
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
                    <FileText className="w-5 h-5 text-blue-600" />
                    创作结果
                  </span>
                  {result && result.success && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={copyToClipboard}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={downloadText}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => window.open(`/polish?content=${encodeURIComponent(result.content)}`, '_blank')}
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-gray-600">AI正在创作中...</span>
                  </div>
                ) : result ? (
                  <div className="space-y-4">
                    {result.success ? (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="secondary">{result.task_type}</Badge>
                          <Badge variant="outline">{result.word_count} 字</Badge>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                            {result.content}
                          </pre>
                        </div>
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
                    选择创作类型并填写信息，开始您的创作之旅
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextCreatorPage;
