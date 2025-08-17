'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Clock, 
  User, 
  Star, 
  ArrowRight, 
  FileText, 
  DollarSign, 
  Image, 
  Palette,
  Upload,
  Eye
} from 'lucide-react';

interface ComprehensivePolishServiceProps {
  content?: string;
  imageData?: string;
  contentType?: 'text' | 'image';
  projectId?: number;
}

interface PricingTier {
  id: string;
  name: string;
  description: string;
  pricePerUnit: number;
  unit: string;
  turnaround: string;
  features: string[];
}

const textPricingTiers: PricingTier[] = [
  {
    id: 'basic',
    name: '基础润色',
    description: '语法纠错、用词优化',
    pricePerUnit: 0.05,
    unit: '字',
    turnaround: '24-48小时',
    features: ['语法检查', '用词优化', '标点符号', '基础润色']
  },
  {
    id: 'professional',
    name: '专业润色',
    description: '结构优化、逻辑梳理、风格统一',
    pricePerUnit: 0.12,
    unit: '字',
    turnaround: '48-72小时',
    features: ['深度语法检查', '结构优化', '逻辑梳理', '风格统一', '专业建议']
  },
  {
    id: 'premium',
    name: '高级润色',
    description: '深度改写、创意提升、专业建议',
    pricePerUnit: 0.25,
    unit: '字',
    turnaround: '3-5个工作日',
    features: ['深度改写', '创意提升', '专业建议', '一对一沟通', '多轮修改']
  }
];

const imagePricingTiers: PricingTier[] = [
  {
    id: 'basic',
    name: '基础优化',
    description: '色彩调整、构图优化',
    pricePerUnit: 50,
    unit: '张',
    turnaround: '24-48小时',
    features: ['色彩校正', '亮度对比度调整', '基础构图优化', '细节清晰化']
  },
  {
    id: 'professional', 
    name: '专业绘制',
    description: '风格转换、细节完善、专业建议',
    pricePerUnit: 120,
    unit: '张',
    turnaround: '3-5个工作日',
    features: ['风格转换', '细节重绘', '构图重新设计', '专业艺术指导', '多版本方案']
  },
  {
    id: 'premium',
    name: '大师级创作',
    description: '完全重绘、艺术升华、收藏级品质',
    pricePerUnit: 300,
    unit: '张',
    turnaround: '7-10个工作日',
    features: ['完全重新创作', '艺术风格升华', '收藏级品质', '一对一艺术指导', '创作过程记录']
  }
];

const textEditors = [
  {
    id: 1,
    name: '张文华',
    avatar: '👨‍💼',
    specialties: ['小说', '散文', '诗歌'],
    experience: 8,
    rating: 4.9,
    completedOrders: 1250,
    description: '资深文学编辑，擅长小说和散文润色，注重文字的韵律和情感表达。'
  },
  {
    id: 2,
    name: '李雅琴',
    avatar: '👩‍💼',
    specialties: ['学术论文', '商业文案', '技术文档'],
    experience: 6,
    rating: 4.8,
    completedOrders: 890,
    description: '专业学术编辑，精通各类学术论文和商业文案的润色与优化。'
  },
  {
    id: 3,
    name: '王诗韵',
    avatar: '👩‍🎨',
    specialties: ['创意写作', '营销文案', '品牌故事'],
    experience: 5,
    rating: 4.9,
    completedOrders: 670,
    description: '创意写作专家，擅长营销文案和品牌故事的创作与润色。'
  }
];

const imageEditors = [
  {
    id: 4,
    name: '陈艺凡',
    avatar: '🎨',
    specialties: ['数字绘画', '概念设计', '插画创作'],
    experience: 10,
    rating: 4.9,
    completedOrders: 850,
    description: '资深数字艺术家，擅长概念设计和插画创作，作品多次获得国际奖项。'
  },
  {
    id: 5,
    name: '刘墨轩',
    avatar: '🖌️',
    specialties: ['传统绘画', '水墨画', '油画'],
    experience: 15,
    rating: 5.0,
    completedOrders: 420,
    description: '传统绘画大师，精通水墨画和油画技法，作品被多家美术馆收藏。'
  },
  {
    id: 6,
    name: '赵彩虹',
    avatar: '🌈',
    specialties: ['色彩设计', '视觉效果', '商业插画'],
    experience: 7,
    rating: 4.8,
    completedOrders: 960,
    description: '色彩设计专家，擅长商业插画和视觉效果设计，服务过多家知名品牌。'
  },
  {
    id: 7,
    name: '马创新',
    avatar: '🚀',
    specialties: ['科幻艺术', '游戏原画', '角色设计'],
    experience: 8,
    rating: 4.9,
    completedOrders: 730,
    description: '科幻艺术专家，专注游戏原画和角色设计，参与过多款知名游戏制作。'
  }
];

export const ComprehensivePolishService: React.FC<ComprehensivePolishServiceProps> = ({ 
  content = '', 
  imageData = '', 
  contentType = 'text', 
  projectId 
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'image'>(contentType);
  const [selectedTier, setSelectedTier] = useState<string>('professional');
  const [textContent, setTextContent] = useState<string>(content);
  const [imageContent, setImageContent] = useState<string>(imageData);
  const [requirements, setRequirements] = useState<string>('');
  const [selectedEditor, setSelectedEditor] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isImageMode = activeTab === 'image';
  const pricingTiers = isImageMode ? imagePricingTiers : textPricingTiers;
  const editors = isImageMode ? imageEditors : textEditors;
  
  const contentLength = isImageMode ? 1 : textContent.length;
  const selectedPricing = pricingTiers.find(tier => tier.id === selectedTier);
  const totalPrice = contentLength * (selectedPricing?.pricePerUnit || 0);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageContent(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitOrder = async () => {
    if (isImageMode && !imageContent) {
      alert('请上传要润色的图片');
      return;
    }
    if (!isImageMode && !textContent.trim()) {
      alert('请输入要润色的文本');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/polish/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: isImageMode ? imageContent : textContent,
          contentType: activeTab,
          serviceType: selectedTier,
          requirements,
          editorId: selectedEditor,
          projectId
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(`${isImageMode ? '绘画' : '文字'}润色订单提交成功！我们会尽快为您安排专业${isImageMode ? '画家' : '编辑'}。`);
      } else {
        alert('提交失败：' + result.error);
      }
    } catch (error) {
      alert('提交失败，请检查网络连接');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">专业润色服务</h1>
        </div>
        <p className="text-gray-600 text-lg">文字润色 & 绘画优化 - 让专业人士为您的作品增光添彩</p>
      </div>

      {/* 服务类型选择 */}
      <Card>
        <CardHeader>
          <CardTitle>选择服务类型</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'text' | 'image')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                文字润色
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                绘画优化
              </TabsTrigger>
            </TabsList>

            {/* 文字润色 */}
            <TabsContent value="text" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        待润色文本
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="请输入需要润色的文本内容..."
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        rows={12}
                        className="resize-none"
                      />
                      <div className="mt-2 text-sm text-gray-500">
                        字数统计: {textContent.length} 字
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  {/* 文字服务选择 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>选择润色服务</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {textPricingTiers.map((tier) => (
                          <div
                            key={tier.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              selectedTier === tier.id
                                ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedTier(tier.id)}
                          >
                            <div className="space-y-3">
                              <div>
                                <h3 className="font-semibold text-lg">{tier.name}</h3>
                                <p className="text-sm text-gray-600">{tier.description}</p>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-2xl font-bold text-purple-600">
                                    ¥{tier.pricePerUnit}
                                  </span>
                                  <span className="text-sm text-gray-500">/{tier.unit}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Clock className="w-4 h-4" />
                                  {tier.turnaround}
                                </div>
                              </div>

                              <div className="space-y-1">
                                {tier.features.map((feature, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm">
                                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                                    {feature}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* 绘画优化 */}
            <TabsContent value="image" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Image className="w-5 h-5" />
                        待优化图片
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!imageContent ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4">点击上传图片或拖拽图片到此处</p>
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
                          >
                            选择图片
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="relative">
                            <img
                              src={imageContent}
                              alt="待优化图片"
                              className="w-full h-auto rounded-lg shadow-sm max-h-96 object-contain"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="absolute top-2 right-2"
                              onClick={() => setImageContent('')}
                            >
                              重新选择
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  {/* 绘画服务选择 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>选择优化服务</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {imagePricingTiers.map((tier) => (
                          <div
                            key={tier.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              selectedTier === tier.id
                                ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedTier(tier.id)}
                          >
                            <div className="space-y-3">
                              <div>
                                <h3 className="font-semibold text-lg">{tier.name}</h3>
                                <p className="text-sm text-gray-600">{tier.description}</p>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-2xl font-bold text-purple-600">
                                    ¥{tier.pricePerUnit}
                                  </span>
                                  <span className="text-sm text-gray-500">/{tier.unit}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Clock className="w-4 h-4" />
                                  {tier.turnaround}
                                </div>
                              </div>

                              <div className="space-y-1">
                                {tier.features.map((feature, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm">
                                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                                    {feature}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 特殊要求 */}
      <Card>
        <CardHeader>
          <CardTitle>特殊要求（可选）</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={isImageMode 
              ? "请描述您的特殊要求，如风格偏好、色彩要求、构图建议等..." 
              : "请描述您的特殊要求，如文风偏好、目标读者、特定格式要求等..."
            }
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* 专家推荐和订单摘要 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 推荐专家 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              推荐{isImageMode ? '画家' : '编辑'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {editors.map((editor) => (
              <div
                key={editor.id}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  selectedEditor === editor.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedEditor(editor.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{editor.avatar}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{editor.name}</h4>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm">{editor.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {editor.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    
                    <p className="text-xs text-gray-600">{editor.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{editor.experience}年经验</span>
                      <span>{editor.completedOrders}单完成</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 订单摘要 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              订单摘要
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>服务类型:</span>
                <span className="font-medium">{selectedPricing?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>{isImageMode ? '图片数量' : '文字数量'}:</span>
                <span className="font-medium">{contentLength} {selectedPricing?.unit}</span>
              </div>
              <div className="flex justify-between">
                <span>单价:</span>
                <span className="font-medium">¥{selectedPricing?.pricePerUnit}/{selectedPricing?.unit}</span>
              </div>
              <div className="flex justify-between">
                <span>预计完成:</span>
                <span className="font-medium">{selectedPricing?.turnaround}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>总价:</span>
                <span className="text-purple-600">¥{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handleSubmitOrder}
              disabled={isSubmitting || (!textContent.trim() && !imageContent)}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              {isSubmitting ? (
                '提交中...'
              ) : (
                <>
                  提交{isImageMode ? '绘画优化' : '文字润色'}订单
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              提交订单后，我们会在1小时内为您安排专业{isImageMode ? '画家' : '编辑'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComprehensivePolishService;
