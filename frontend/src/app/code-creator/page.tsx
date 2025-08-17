'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Code, Terminal, Bug, FileText, RefreshCw, Download, Copy, Sparkles } from 'lucide-react';

interface CodeCreationResult {
  success: boolean;
  code?: string;
  content?: string;
  language?: string;
  description?: string;
  explanation?: string;
  task_type?: string;
  metadata?: any;
  error?: string;
}

const CodeCreatorPage = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<CodeCreationResult | null>(null);

  // 代码生成状态
  const [generateForm, setGenerateForm] = useState({
    description: '',
    language: 'python',
    style: 'clean',
    includeComments: true,
    includeTests: false
  });

  // 代码优化状态
  const [optimizeForm, setOptimizeForm] = useState({
    code: '',
    language: 'python',
    optimizationType: 'performance'
  });

  // 代码调试状态
  const [debugForm, setDebugForm] = useState({
    code: '',
    language: 'python',
    errorMessage: ''
  });

  // 代码解释状态
  const [explainForm, setExplainForm] = useState({
    code: '',
    language: 'python'
  });

  // 代码转换状态
  const [convertForm, setConvertForm] = useState({
    code: '',
    fromLanguage: 'python',
    toLanguage: 'javascript'
  });

  const languages = [
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'typescript', label: 'TypeScript' }
  ];

  const codeStyles = [
    { value: 'clean', label: '简洁清晰' },
    { value: 'professional', label: '专业规范' },
    { value: 'efficient', label: '高效优化' },
    { value: 'beginner', label: '初学者友好' },
    { value: 'advanced', label: '高级特性' }
  ];

  const optimizationTypes = [
    { value: 'performance', label: '性能优化' },
    { value: 'readability', label: '可读性优化' },
    { value: 'memory', label: '内存优化' },
    { value: 'security', label: '安全优化' },
    { value: 'style', label: '代码风格优化' }
  ];

  const generateCode = async (type: string, params: any) => {
    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/code/generate', {
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

  const handleGenerate = () => {
    if (!generateForm.description.trim()) {
      alert('请输入功能描述');
      return;
    }
    generateCode('generate', generateForm);
  };

  const handleOptimize = () => {
    if (!optimizeForm.code.trim()) {
      alert('请输入要优化的代码');
      return;
    }
    generateCode('optimize', optimizeForm);
  };

  const handleDebug = () => {
    if (!debugForm.code.trim()) {
      alert('请输入要调试的代码');
      return;
    }
    generateCode('debug', debugForm);
  };

  const handleExplain = () => {
    if (!explainForm.code.trim()) {
      alert('请输入要解释的代码');
      return;
    }
    generateCode('explain', explainForm);
  };

  const handleConvert = () => {
    if (!convertForm.code.trim()) {
      alert('请输入要转换的代码');
      return;
    }
    if (convertForm.fromLanguage === convertForm.toLanguage) {
      alert('源语言和目标语言不能相同');
      return;
    }
    generateCode('convert', convertForm);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板');
    });
  };

  const downloadCode = () => {
    if (result?.code) {
      const blob = new Blob([result.code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated_code.${result.language === 'cpp' ? 'cpp' : result.language}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Code className="w-8 h-8 text-green-600" />
              <h1 className="text-4xl font-bold text-gray-800">编程创作工具</h1>
            </div>
            <p className="text-gray-600 text-lg">AI驱动的智能代码生成与优化平台</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧功能面板 */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    代码创作面板
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="generate" className="flex items-center gap-1">
                        <Code className="w-4 h-4" />
                        生成
                      </TabsTrigger>
                      <TabsTrigger value="optimize" className="flex items-center gap-1">
                        <RefreshCw className="w-4 h-4" />
                        优化
                      </TabsTrigger>
                      <TabsTrigger value="debug" className="flex items-center gap-1">
                        <Bug className="w-4 h-4" />
                        调试
                      </TabsTrigger>
                      <TabsTrigger value="explain" className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        解释
                      </TabsTrigger>
                      <TabsTrigger value="convert" className="flex items-center gap-1">
                        <Terminal className="w-4 h-4" />
                        转换
                      </TabsTrigger>
                    </TabsList>

                    {/* 代码生成 */}
                    <TabsContent value="generate" className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">功能描述</label>
                        <Textarea
                          placeholder="请描述您想要实现的功能，例如：写一个计算斐波那契数列的函数"
                          value={generateForm.description}
                          onChange={(e) => setGenerateForm({...generateForm, description: e.target.value})}
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">编程语言</label>
                          <Select value={generateForm.language} onValueChange={(value) => setGenerateForm({...generateForm, language: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {languages.map(lang => (
                                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">代码风格</label>
                          <Select value={generateForm.style} onValueChange={(value) => setGenerateForm({...generateForm, style: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {codeStyles.map(style => (
                                <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="comments"
                            checked={generateForm.includeComments}
                            onCheckedChange={(checked) => setGenerateForm({...generateForm, includeComments: checked})}
                          />
                          <label htmlFor="comments" className="text-sm">包含注释</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="tests"
                            checked={generateForm.includeTests}
                            onCheckedChange={(checked) => setGenerateForm({...generateForm, includeTests: checked})}
                          />
                          <label htmlFor="tests" className="text-sm">包含测试</label>
                        </div>
                      </div>
                      <Button 
                        onClick={handleGenerate} 
                        disabled={isGenerating}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {isGenerating ? '生成中...' : '生成代码'}
                      </Button>
                    </TabsContent>

                    {/* 代码优化 */}
                    <TabsContent value="optimize" className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">待优化代码</label>
                        <Textarea
                          placeholder="请粘贴需要优化的代码..."
                          value={optimizeForm.code}
                          onChange={(e) => setOptimizeForm({...optimizeForm, code: e.target.value})}
                          rows={8}
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">编程语言</label>
                          <Select value={optimizeForm.language} onValueChange={(value) => setOptimizeForm({...optimizeForm, language: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {languages.map(lang => (
                                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">优化类型</label>
                          <Select value={optimizeForm.optimizationType} onValueChange={(value) => setOptimizeForm({...optimizeForm, optimizationType: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {optimizationTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button 
                        onClick={handleOptimize} 
                        disabled={isGenerating}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {isGenerating ? '优化中...' : '优化代码'}
                      </Button>
                    </TabsContent>

                    {/* 代码调试 */}
                    <TabsContent value="debug" className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">待调试代码</label>
                        <Textarea
                          placeholder="请粘贴有问题的代码..."
                          value={debugForm.code}
                          onChange={(e) => setDebugForm({...debugForm, code: e.target.value})}
                          rows={8}
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">编程语言</label>
                          <Select value={debugForm.language} onValueChange={(value) => setDebugForm({...debugForm, language: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {languages.map(lang => (
                                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">错误信息（可选）</label>
                          <Textarea
                            placeholder="如果有错误信息，请粘贴到这里..."
                            value={debugForm.errorMessage}
                            onChange={(e) => setDebugForm({...debugForm, errorMessage: e.target.value})}
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={handleDebug} 
                        disabled={isGenerating}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {isGenerating ? '调试中...' : '调试代码'}
                      </Button>
                    </TabsContent>

                    {/* 代码解释 */}
                    <TabsContent value="explain" className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">待解释代码</label>
                        <Textarea
                          placeholder="请粘贴需要解释的代码..."
                          value={explainForm.code}
                          onChange={(e) => setExplainForm({...explainForm, code: e.target.value})}
                          rows={8}
                          className="font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">编程语言</label>
                        <Select value={explainForm.language} onValueChange={(value) => setExplainForm({...explainForm, language: value})}>
                          <SelectTrigger className="w-full md:w-1/2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map(lang => (
                              <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={handleExplain} 
                        disabled={isGenerating}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {isGenerating ? '解释中...' : '解释代码'}
                      </Button>
                    </TabsContent>

                    {/* 代码转换 */}
                    <TabsContent value="convert" className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">待转换代码</label>
                        <Textarea
                          placeholder="请粘贴需要转换的代码..."
                          value={convertForm.code}
                          onChange={(e) => setConvertForm({...convertForm, code: e.target.value})}
                          rows={8}
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">源语言</label>
                          <Select value={convertForm.fromLanguage} onValueChange={(value) => setConvertForm({...convertForm, fromLanguage: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {languages.map(lang => (
                                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">目标语言</label>
                          <Select value={convertForm.toLanguage} onValueChange={(value) => setConvertForm({...convertForm, toLanguage: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {languages.map(lang => (
                                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button 
                        onClick={handleConvert} 
                        disabled={isGenerating}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {isGenerating ? '转换中...' : '转换代码'}
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
                      <Terminal className="w-5 h-5 text-blue-600" />
                      生成结果
                    </span>
                    {result && result.success && result.code && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(result.code!)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={downloadCode}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      <span className="ml-2 text-gray-600">AI正在处理中...</span>
                    </div>
                  ) : result ? (
                    <div className="space-y-4">
                      {result.success ? (
                        <>
                          <div className="flex items-center gap-2 mb-4">
                            <Badge variant="secondary">{result.language}</Badge>
                            <Badge variant="outline">{result.task_type}</Badge>
                            {result.metadata?.source && (
                              <Badge variant={result.metadata.source === 'ai_service' ? 'default' : 'secondary'}>
                                {result.metadata.source === 'ai_service' ? 'AI生成' : '示例'}
                              </Badge>
                            )}
                          </div>
                          
                          {result.code && (
                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                              <pre className="text-sm font-mono whitespace-pre-wrap">
                                {result.code}
                              </pre>
                            </div>
                          )}
                          
                          {result.explanation && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-semibold text-blue-800 mb-2">说明</h4>
                              <p className="text-sm text-blue-700 whitespace-pre-wrap">
                                {result.explanation}
                              </p>
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
                          <div className="text-red-500 mb-2">处理失败</div>
                          <div className="text-gray-600 text-sm">{result.error}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      选择功能并填写相关信息，开始您的编程创作
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

export default CodeCreatorPage;
