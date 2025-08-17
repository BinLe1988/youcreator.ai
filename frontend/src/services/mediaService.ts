/**
 * 媒体生成服务 - 文字配图、文字配乐、图片配乐
 */

import { apiClient } from './apiClient';

// 类型定义
export interface TextToImageRequest {
  text: string;
  style?: string;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
}

export interface TextToMusicRequest {
  text: string;
  duration?: number;
  temperature?: number;
  top_k?: number;
  top_p?: number;
}

export interface ImageToMusicRequest {
  image_base64: string;
  duration?: number;
  temperature?: number;
}

export interface MediaResponse {
  success: boolean;
  data?: {
    image?: string;
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
  };
  error?: string;
  request_id?: string;
}

export interface BatchGenerateRequest {
  requests: Array<{
    id?: string;
    type: 'text_to_image' | 'text_to_music' | 'image_to_music';
    params: any;
  }>;
}

export interface StyleInfo {
  id: string;
  name: string;
  description: string;
}

export interface MediaCapabilities {
  text_to_image: {
    supported: boolean;
    styles: string[];
    max_resolution: {
      width: number;
      height: number;
    };
    inference_steps: {
      min: number;
      max: number;
    };
  };
  text_to_music: {
    supported: boolean;
    max_duration: number;
    min_duration: number;
    sample_rate: number;
    formats: string[];
  };
  image_to_music: {
    supported: boolean;
    max_duration: number;
    min_duration: number;
    supported_formats: string[];
    max_file_size: string;
  };
  batch_processing: {
    supported: boolean;
    max_requests: number;
    timeout: string;
  };
  rate_limits: {
    requests_per_minute: number;
    requests_per_hour: number;
  };
}

class MediaService {
  private baseURL = '/api/v1/media';

  /**
   * 文字生成图片
   */
  async textToImage(request: TextToImageRequest): Promise<MediaResponse> {
    try {
      const response = await apiClient.post<MediaResponse>(`${this.baseURL}/text-to-image`, request);
      return response.data;
    } catch (error) {
      console.error('Text to image generation failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 文字生成音乐
   */
  async textToMusic(request: TextToMusicRequest): Promise<MediaResponse> {
    try {
      const response = await apiClient.post<MediaResponse>(`${this.baseURL}/text-to-music`, request);
      return response.data;
    } catch (error) {
      console.error('Text to music generation failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 图片生成音乐
   */
  async imageToMusic(request: ImageToMusicRequest): Promise<MediaResponse> {
    try {
      const response = await apiClient.post<MediaResponse>(`${this.baseURL}/image-to-music`, request);
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
  ): Promise<MediaResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('duration', duration.toString());
      formData.append('temperature', temperature.toString());

      const response = await apiClient.post<MediaResponse>(
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
  async batchGenerate(request: BatchGenerateRequest): Promise<MediaResponse[]> {
    try {
      const response = await apiClient.post<MediaResponse[]>(`${this.baseURL}/batch-generate`, request);
      return response.data;
    } catch (error) {
      console.error('Batch generation failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 获取可用的图片风格
   */
  async getAvailableStyles(): Promise<StyleInfo[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: { styles: StyleInfo[] } }>(
        `${this.baseURL}/styles`
      );
      return response.data.data.styles;
    } catch (error) {
      console.error('Failed to get available styles:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 获取媒体生成能力
   */
  async getCapabilities(): Promise<MediaCapabilities> {
    try {
      const response = await apiClient.get<{ success: boolean; capabilities: MediaCapabilities }>(
        `${this.baseURL}/capabilities`
      );
      return response.data.capabilities;
    } catch (error) {
      console.error('Failed to get capabilities:', error);
      throw this.handleError(error);
    }
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
   * 创建音频播放URL
   */
  createAudioURL(audioBase64: string): string {
    // 如果已经是完整的data URL，直接返回
    if (audioBase64.startsWith('data:')) {
      return audioBase64;
    }
    // 否则添加data URL前缀
    return `data:audio/wav;base64,${audioBase64}`;
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
    return new Error('媒体生成服务出现未知错误');
  }
}

// 导出单例实例
export const mediaService = new MediaService();
export default mediaService;
