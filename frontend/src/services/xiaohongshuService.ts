/**
 * 小红书发布服务
 */

import { apiClient } from './apiClient';

// 类型定义
export interface NoteContent {
  title: string;
  content: string;
  images?: string[];
  audioURL?: string;
  tags?: string[];
  location?: string;
  isPrivate?: boolean;
  allowComment?: boolean;
  allowShare?: boolean;
}

export interface PublishRequest {
  user_id: number;
  note_content: NoteContent;
  auto_tags?: boolean;
  auto_format?: boolean;
}

export interface PublishResponse {
  success: boolean;
  note_id?: string;
  url?: string;
  error?: string;
  message?: string;
}

export interface TagSuggestion {
  tag: string;
  relevance: number;
  category: string;
  description: string;
}

export interface ContentAnalysis {
  theme: string;
  mood: string;
  style: string;
  keywords: string[];
  suggested_tags: TagSuggestion[];
  category: string;
}

export interface PreviewData {
  original_content: NoteContent;
  formatted_content: NoteContent;
  analysis: ContentAnalysis;
  preview_url: string;
  estimated_reach: {
    estimated_views: number;
    estimated_likes: number;
    estimated_comments: number;
    confidence: string;
    factors: string[];
  };
  optimization_tips: string[];
}

export interface PublishHistory {
  total: number;
  page: number;
  limit: number;
  data: Array<{
    id: string;
    title: string;
    published_at: string;
    status: string;
    views: number;
    likes: number;
    comments: number;
    url: string;
  }>;
}

export interface PlatformStats {
  total_notes: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_followers: number;
  engagement_rate: number;
  popular_tags: string[];
  best_time: string;
  trending_topics: string[];
}

class XiaohongshuService {
  private baseURL = '/api/v1/xiaohongshu';

  /**
   * 分析内容并生成建议
   */
  async analyzeContent(content: NoteContent): Promise<ContentAnalysis> {
    try {
      const response = await apiClient.post<ContentAnalysis>(`${this.baseURL}/analyze`, content);
      return response.data;
    } catch (error) {
      console.error('Content analysis failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 格式化内容为小红书风格
   */
  async formatContent(content: NoteContent): Promise<NoteContent> {
    try {
      const response = await apiClient.post<NoteContent>(`${this.baseURL}/format`, content);
      return response.data;
    } catch (error) {
      console.error('Content formatting failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 预览笔记效果
   */
  async previewNote(content: NoteContent): Promise<PreviewData> {
    try {
      const response = await apiClient.post<PreviewData>(`${this.baseURL}/preview`, content);
      return response.data;
    } catch (error) {
      console.error('Note preview failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 获取标签建议
   */
  async getTagSuggestions(content: NoteContent): Promise<TagSuggestion[]> {
    try {
      const response = await apiClient.post<TagSuggestion[]>(`${this.baseURL}/tags/suggest`, content);
      return response.data;
    } catch (error) {
      console.error('Tag suggestions failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 发布笔记到小红书
   */
  async publishNote(request: PublishRequest): Promise<PublishResponse> {
    try {
      const response = await apiClient.post<PublishResponse>(`${this.baseURL}/publish`, request);
      return response.data;
    } catch (error) {
      console.error('Note publishing failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 批量发布笔记
   */
  async batchPublish(requests: PublishRequest[]): Promise<PublishResponse[]> {
    try {
      const response = await apiClient.post<PublishResponse[]>(`${this.baseURL}/batch-publish`, requests);
      return response.data;
    } catch (error) {
      console.error('Batch publishing failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 获取发布历史
   */
  async getPublishHistory(userId: number, page: number = 1, limit: number = 10): Promise<PublishHistory> {
    try {
      const response = await apiClient.get<PublishHistory>(`${this.baseURL}/history`, {
        params: { user_id: userId, page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get publish history:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 获取平台统计
   */
  async getPlatformStats(userId: number): Promise<PlatformStats> {
    try {
      const response = await apiClient.get<PlatformStats>(`${this.baseURL}/stats`, {
        params: { user_id: userId }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get platform stats:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 从媒体生成结果创建笔记内容
   */
  createNoteFromMediaGeneration(
    title: string,
    description: string,
    imageUrl?: string,
    audioUrl?: string,
    additionalContent?: string
  ): NoteContent {
    let content = description;
    
    if (additionalContent) {
      content += '\n\n' + additionalContent;
    }

    // 添加AI生成标识
    content += '\n\n✨ 由AI创作助手生成';

    const noteContent: NoteContent = {
      title,
      content,
      images: imageUrl ? [imageUrl] : [],
      audioURL: audioUrl,
      tags: [],
      allowComment: true,
      allowShare: true,
      isPrivate: false,
    };

    return noteContent;
  }

  /**
   * 智能生成笔记标题
   */
  generateSmartTitle(content: string, theme?: string): string {
    // 提取内容关键词
    const keywords = this.extractKeywords(content);
    
    // 根据主题添加emoji
    const emojiMap: Record<string, string> = {
      '美食': '🍽️',
      '旅行': '✈️',
      '时尚': '👗',
      '美妆': '💄',
      '生活': '🌸',
      '科技': '📱',
      '健身': '💪',
      '学习': '📚',
      '艺术': '🎨',
      '家居': '🏠',
    };

    const emoji = theme && emojiMap[theme] ? emojiMap[theme] : '✨';
    
    // 生成吸引人的标题
    const titleTemplates = [
      `${emoji} ${keywords[0]}分享`,
      `${emoji} 关于${keywords[0]}的那些事`,
      `${emoji} ${keywords[0]}体验记录`,
      `${emoji} 我的${keywords[0]}心得`,
      `${emoji} ${keywords[0]}种草笔记`,
    ];

    return titleTemplates[Math.floor(Math.random() * titleTemplates.length)];
  }

  /**
   * 优化内容为小红书风格
   */
  optimizeContentForXiaohongshu(content: string, theme?: string): string {
    let optimized = content;

    // 添加段落分隔
    optimized = optimized.replace(/。/g, '。\n\n');
    
    // 添加emoji
    const emojiMap: Record<string, string[]> = {
      '美食': ['🍽️', '😋', '👍', '💯'],
      '旅行': ['✈️', '🌍', '📸', '🎒'],
      '时尚': ['👗', '💅', '✨', '👠'],
      '美妆': ['💄', '💋', '✨', '🌟'],
      '生活': ['🌸', '☀️', '🌈', '💕'],
      '科技': ['📱', '💻', '🔥', '👍'],
      '健身': ['💪', '🏃‍♀️', '🔥', '💯'],
      '学习': ['📚', '✏️', '🎯', '💡'],
      '艺术': ['🎨', '✨', '🌟', '💫'],
      '家居': ['🏠', '🌿', '✨', '💕'],
    };

    // 随机添加相关emoji
    if (theme && emojiMap[theme]) {
      const emojis = emojiMap[theme];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      optimized = `${randomEmoji} ${optimized}`;
    }

    // 添加互动引导
    const interactionPrompts = [
      '\n\n你们觉得怎么样？',
      '\n\n有同感的小伙伴吗？',
      '\n\n大家有什么建议吗？',
      '\n\n一起讨论一下吧！',
      '\n\n你们也试试看吧！',
    ];

    optimized += interactionPrompts[Math.floor(Math.random() * interactionPrompts.length)];

    return optimized;
  }

  /**
   * 生成热门标签
   */
  generateTrendingTags(theme: string, keywords: string[]): string[] {
    const baseTags = ['分享生活', '记录美好', '日常分享'];
    
    const themeTags: Record<string, string[]> = {
      '美食': ['美食分享', '好吃推荐', '美食探店', '家常菜', '美食记录'],
      '旅行': ['旅行分享', '旅游攻略', '风景打卡', '旅行记录', '出行指南'],
      '时尚': ['穿搭分享', '时尚搭配', '服装推荐', '潮流趋势', '风格展示'],
      '美妆': ['美妆分享', '化妆教程', '护肤心得', '美妆推荐', '变美日记'],
      '生活': ['生活分享', '日常记录', '生活感悟', '生活方式', '生活美学'],
      '科技': ['科技分享', '数码评测', '软件推荐', '科技生活', '效率工具'],
      '健身': ['健身分享', '运动记录', '健身教程', '健康生活', '运动日记'],
      '学习': ['学习分享', '知识分享', '成长记录', '学习方法', '技能提升'],
      '艺术': ['艺术分享', '创作记录', '审美分享', '文艺生活', '艺术欣赏'],
      '家居': ['家居分享', '装修记录', '生活用品', '家居美学', '收纳整理'],
    };

    let tags = [...baseTags];
    
    if (themeTags[theme]) {
      tags = tags.concat(themeTags[theme].slice(0, 3));
    }

    // 添加关键词标签
    keywords.slice(0, 2).forEach(keyword => {
      tags.push(keyword);
    });

    return tags.slice(0, 8); // 小红书最多8个标签
  }

  /**
   * 验证笔记内容
   */
  validateNoteContent(content: NoteContent): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!content.title || content.title.trim().length === 0) {
      errors.push('标题不能为空');
    }

    if (content.title && content.title.length > 30) {
      errors.push('标题不能超过30个字符');
    }

    if (!content.content || content.content.trim().length === 0) {
      errors.push('内容不能为空');
    }

    if (content.content && content.content.length > 1000) {
      errors.push('内容不能超过1000个字符');
    }

    if (content.tags && content.tags.length > 8) {
      errors.push('标签不能超过8个');
    }

    if (content.images && content.images.length > 9) {
      errors.push('图片不能超过9张');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 获取最佳发布时间建议
   */
  getBestPublishTime(): { time: string; reason: string }[] {
    return [
      {
        time: '20:00-22:00',
        reason: '晚上用户活跃度最高，容易获得更多曝光'
      },
      {
        time: '12:00-14:00',
        reason: '午休时间，用户有时间浏览内容'
      },
      {
        time: '18:00-19:00',
        reason: '下班时间，用户开始放松浏览'
      },
      {
        time: '周末 10:00-12:00',
        reason: '周末上午，用户有充足时间互动'
      }
    ];
  }

  /**
   * 提取关键词
   */
  private extractKeywords(text: string): string[] {
    // 简单的关键词提取
    const words = text.split(/\s+/).filter(word => word.length > 1);
    return words.slice(0, 5);
  }

  /**
   * 错误处理
   */
  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.response?.data?.error) {
      return new Error(error.response.data.error);
    }
    if (error.message) {
      return new Error(error.message);
    }
    return new Error('小红书服务出现未知错误');
  }
}

// 导出单例实例
export const xiaohongshuService = new XiaohongshuService();
export default xiaohongshuService;
