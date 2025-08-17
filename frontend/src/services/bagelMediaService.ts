/**
 * Bagel模型媒体生成服务
 */

import { apiClient } from './apiClient';

// 类型定义
export interface BagelTextToImageRequest {
  text: string;
  style?: string;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  negative_prompt?: string;
  num_images?: number;
  seed?: number;
}

export interface ImageVariationsRequest {
  base_image: string;
  prompt: string;
  num_variations?: number;
  variation_strength?: number;
}

export interface ImageUpscaleRequest {
  image_data: string;
  scale_factor?: number;
  enhance_quality?: boolean;
}

export interface BagelMediaResponse {
  success: boolean;
  data?: {
    image?: string;
    images?: Array<{
      image: string;
      index: number;
    }>;
    variations?: Array<{
      image: string;
      index: number;
      variation_strength: number;
    }>;
    audio?: string;
    prompt?: string;
    description?: string;
    image_caption?: string;
    music_description?: string;
    duration?: number;
    sample_rate?: number;
    style?: string;
    dimensions?: {
      width: number;
      height: number;
    };
    model?: string;
    parameters?: any;
    metadata?: any;
    original_size?: {
      width: number;
      height: number;
    };
    new_size?: {
      width: number;
      height: number;
    };
    scale_factor?: number;
  };
  error?: string;
  model?: string;
}

export interface BagelStyleInfo {
  id: string;
  name: string;
  description: string;
}

export interface BagelModelInfo {
  model_name: string;
  capabilities: any;
  features: string[];
  advantages: string[];
}

class BagelMediaService {
  private baseURL = '/api/v1/bagel';

  /**
   * 使用Bagel模型进行文字生成图片
   */
  async textToImage(request: BagelTextToImageRequest): Promise<BagelMediaResponse> {
    try {
      const response = await apiClient.post<BagelMediaResponse>(`${this.baseURL}/text-to-image`, request);
      return response.data;
    } catch (error) {
      console.error('Bagel text to image generation failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 生成图像变体
   */
  async generateImageVariations(request: ImageVariationsRequest): Promise<BagelMediaResponse> {
    try {
      const response = await apiClient.post<BagelMediaResponse>(`${this.baseURL}/image-variations`, request);
      return response.data;
    } catch (error) {
      console.error('Image variations generation failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 图像超分辨率放大
   */
  async upscaleImage(request: ImageUpscaleRequest): Promise<BagelMediaResponse> {
    try {
      const response = await apiClient.post<BagelMediaResponse>(`${this.baseURL}/upscale-image`, request);
      return response.data;
    } catch (error) {
      console.error('Image upscaling failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 文字生成音乐
   */
  async textToMusic(request: {
    text: string;
    duration?: number;
    temperature?: number;
    top_k?: number;
    top_p?: number;
  }): Promise<BagelMediaResponse> {
    try {
      const response = await apiClient.post<BagelMediaResponse>(`${this.baseURL}/text-to-music`, request);
      return response.data;
    } catch (error) {
      console.error('Text to music generation failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 图片生成音乐
   */
  async imageToMusic(request: {
    image_base64: string;
    duration?: number;
    temperature?: number;
  }): Promise<BagelMediaResponse> {
    try {
      const response = await apiClient.post<BagelMediaResponse>(`${this.baseURL}/image-to-music`, request);
      return response.data;
    } catch (error) {
      console.error('Image to music generation failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 上传图片并生成音乐
   */
  async uploadImageAndGenerateMusic(
    file: File,
    duration: number = 10,
    temperature: number = 1.0
  ): Promise<BagelMediaResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('duration', duration.toString());
      formData.append('temperature', temperature.toString());

      const response = await apiClient.post<BagelMediaResponse>(
        `${this.baseURL}/upload-image-to-music`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Upload image to music generation failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 批量生成媒体内容
   */
  async batchGenerate(requests: Array<{
    id?: string;
    type: string;
    params: any;
  }>): Promise<BagelMediaResponse[]> {
    try {
      const response = await apiClient.post<BagelMediaResponse[]>(`${this.baseURL}/batch-generate`, {
        requests
      });
      return response.data;
    } catch (error) {
      console.error('Batch generation failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 获取Bagel模型信息
   */
  async getModelInfo(): Promise<BagelModelInfo> {
    try {
      const response = await apiClient.get<{ success: boolean; data: BagelModelInfo }>(`${this.baseURL}/model-info`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get Bagel model info:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 获取Bagel支持的图片风格
   */
  async getAvailableStyles(): Promise<BagelStyleInfo[]> {
    try {
      const response = await apiClient.get<{ 
        success: boolean; 
        data: { styles: BagelStyleInfo[]; model: string } 
      }>(`${this.baseURL}/styles`);
      return response.data.data.styles;
    } catch (error) {
      console.error('Failed to get Bagel styles:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 获取Bagel模型能力
   */
  async getCapabilities(): Promise<any> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any }>(`${this.baseURL}/capabilities`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get Bagel capabilities:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<any> {
    try {
      const response = await apiClient.get(`${this.baseURL}/health`);
      return response.data;
    } catch (error) {
      console.error('Bagel health check failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 智能提示词增强
   */
  enhancePrompt(text: string, style: string = 'realistic'): string {
    // 基于Bagel模型特性的提示词增强
    const styleEnhancements: Record<string, string> = {
      realistic: 'photorealistic, high quality, detailed, 8k resolution, professional photography',
      artistic: 'artistic masterpiece, beautiful composition, creative, expressive, fine art',
      anime: 'anime style, manga, japanese animation, vibrant colors, detailed character design',
      cartoon: 'cartoon style, animated, colorful, playful, character illustration',
      sketch: 'pencil sketch, hand drawn, artistic sketch, black and white, detailed lineart',
      oil_painting: 'oil painting style, classical art, brushstrokes, rich colors, artistic',
      watercolor: 'watercolor painting, soft colors, flowing, artistic, traditional media',
      digital_art: 'digital art, concept art, detailed, modern, digital painting',
      fantasy: 'fantasy art, magical, mystical, epic, detailed fantasy illustration',
      sci_fi: 'science fiction, futuristic, high tech, cyberpunk, detailed sci-fi art',
      portrait: 'portrait photography, professional headshot, detailed face, studio lighting',
      landscape: 'landscape photography, scenic view, natural beauty, wide angle, detailed',
      abstract: 'abstract art, modern, creative, unique composition, artistic expression'
    };

    const enhancement = styleEnhancements[style] || 'high quality, detailed';
    const qualityBoost = 'masterpiece, best quality, ultra detailed, sharp focus';
    
    return `${text}, ${enhancement}, ${qualityBoost}`;
  }

  /**
   * 生成负面提示词
   */
  generateNegativePrompt(style: string = 'realistic'): string {
    const baseNegative = 'low quality, blurry, distorted, ugly, bad anatomy, bad proportions, deformed, duplicate, cropped, out of frame';
    
    const styleSpecificNegative: Record<string, string> = {
      realistic: 'cartoon, anime, painting, drawing, illustration, rendered',
      anime: 'realistic, photographic, 3d render, western cartoon',
      cartoon: 'realistic, photographic, anime, dark, scary',
      sketch: 'colored, painted, photographic, realistic',
      oil_painting: 'digital, photographic, modern, cartoon',
      watercolor: 'digital, photographic, oil painting, acrylic',
      digital_art: 'traditional media, hand drawn, photographic',
      fantasy: 'modern, contemporary, realistic photography',
      sci_fi: 'medieval, fantasy, traditional, historical',
      portrait: 'full body, landscape, multiple people, crowd',
      landscape: 'portrait, close up, indoor, people, characters',
      abstract: 'realistic, photographic, representational, literal'
    };

    const styleNeg = styleSpecificNegative[style] || '';
    
    return styleNeg ? `${baseNegative}, ${styleNeg}` : baseNegative;
  }

  /**
   * 验证图片文件
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: '不支持的文件格式。请上传 JPG、PNG、WebP 或 GIF 格式的图片。',
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: '文件大小超过限制。请上传小于 10MB 的图片。',
      };
    }

    return { valid: true };
  }

  /**
   * 将文件转换为base64
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * 下载生成的媒体文件
   */
  downloadMedia(dataUrl: string, filename: string): void {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * 创建音频播放URL
   */
  createAudioURL(audioBase64: string): string {
    if (audioBase64.startsWith('data:')) {
      return audioBase64;
    }
    return `data:audio/wav;base64,${audioBase64}`;
  }

  /**
   * 错误处理
   */
  private handleError(error: any): Error {
    if (error.response?.data?.detail) {
      return new Error(error.response.data.detail);
    }
    if (error.response?.data?.error) {
      return new Error(error.response.data.error);
    }
    if (error.message) {
      return new Error(error.message);
    }
    return new Error('Bagel媒体生成服务出现未知错误');
  }
}

// 导出单例实例
export const bagelMediaService = new BagelMediaService();
export default bagelMediaService;
