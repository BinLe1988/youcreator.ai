package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// MediaService 媒体生成服务
type MediaService struct {
	logger    *zap.Logger
	aiBaseURL string
	client    *http.Client
}

// MediaGenerationRequest 媒体生成请求
type MediaGenerationRequest struct {
	Type   string                 `json:"type" binding:"required"`
	Params map[string]interface{} `json:"params" binding:"required"`
	UserID uint                   `json:"user_id"`
}

// TextToImageRequest 文字生成图片请求
type TextToImageRequest struct {
	Text              string  `json:"text" binding:"required"`
	Style             string  `json:"style,omitempty"`
	Width             int     `json:"width,omitempty"`
	Height            int     `json:"height,omitempty"`
	NumInferenceSteps int     `json:"num_inference_steps,omitempty"`
	GuidanceScale     float64 `json:"guidance_scale,omitempty"`
}

// TextToMusicRequest 文字生成音乐请求
type TextToMusicRequest struct {
	Text        string  `json:"text" binding:"required"`
	Duration    int     `json:"duration,omitempty"`
	Temperature float64 `json:"temperature,omitempty"`
	TopK        int     `json:"top_k,omitempty"`
	TopP        float64 `json:"top_p,omitempty"`
}

// ImageToMusicRequest 图片生成音乐请求
type ImageToMusicRequest struct {
	ImageBase64 string  `json:"image_base64" binding:"required"`
	Duration    int     `json:"duration,omitempty"`
	Temperature float64 `json:"temperature,omitempty"`
}

// MediaResponse 媒体生成响应
type MediaResponse struct {
	Success   bool                   `json:"success"`
	Data      map[string]interface{} `json:"data,omitempty"`
	Error     string                 `json:"error,omitempty"`
	RequestID string                 `json:"request_id,omitempty"`
}

// BatchGenerateRequest 批量生成请求
type BatchGenerateRequest struct {
	Requests []MediaGenerationRequest `json:"requests" binding:"required"`
}

// NewMediaService 创建媒体服务实例
func NewMediaService(logger *zap.Logger, aiBaseURL string) *MediaService {
	return &MediaService{
		logger:    logger,
		aiBaseURL: aiBaseURL,
		client: &http.Client{
			Timeout: 5 * time.Minute, // 媒体生成可能需要较长时间
		},
	}
}

// TextToImage 文字生成图片
func (s *MediaService) TextToImage(ctx context.Context, req *TextToImageRequest) (*MediaResponse, error) {
	s.logger.Info("Generating image from text", zap.String("text", req.Text))

	// 构建请求数据
	requestData := map[string]interface{}{
		"text":                req.Text,
		"style":               getStringOrDefault(req.Style, "realistic"),
		"width":               getIntOrDefault(req.Width, 512),
		"height":              getIntOrDefault(req.Height, 512),
		"num_inference_steps": getIntOrDefault(req.NumInferenceSteps, 20),
		"guidance_scale":      getFloat64OrDefault(req.GuidanceScale, 7.5),
	}

	return s.callAIService(ctx, "/api/v1/media/text-to-image", requestData)
}

// TextToMusic 文字生成音乐
func (s *MediaService) TextToMusic(ctx context.Context, req *TextToMusicRequest) (*MediaResponse, error) {
	s.logger.Info("Generating music from text", zap.String("text", req.Text))

	// 构建请求数据
	requestData := map[string]interface{}{
		"text":        req.Text,
		"duration":    getIntOrDefault(req.Duration, 10),
		"temperature": getFloat64OrDefault(req.Temperature, 1.0),
		"top_k":       getIntOrDefault(req.TopK, 250),
		"top_p":       getFloat64OrDefault(req.TopP, 0.0),
	}

	return s.callAIService(ctx, "/api/v1/media/text-to-music", requestData)
}

// ImageToMusic 图片生成音乐
func (s *MediaService) ImageToMusic(ctx context.Context, req *ImageToMusicRequest) (*MediaResponse, error) {
	s.logger.Info("Generating music from image")

	// 构建请求数据
	requestData := map[string]interface{}{
		"image_base64": req.ImageBase64,
		"duration":     getIntOrDefault(req.Duration, 10),
		"temperature":  getFloat64OrDefault(req.Temperature, 1.0),
	}

	return s.callAIService(ctx, "/api/v1/media/image-to-music", requestData)
}

// BatchGenerate 批量生成媒体内容
func (s *MediaService) BatchGenerate(ctx context.Context, req *BatchGenerateRequest) ([]*MediaResponse, error) {
	s.logger.Info("Batch generating media", zap.Int("count", len(req.Requests)))

	// 构建批量请求数据
	requestData := map[string]interface{}{
		"requests": req.Requests,
	}

	// 调用AI服务
	jsonData, err := json.Marshal(requestData)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "POST", s.aiBaseURL+"/api/v1/media/batch-generate", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to call AI service: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("AI service returned error: %s", string(body))
	}

	var responses []*MediaResponse
	if err := json.Unmarshal(body, &responses); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return responses, nil
}

// UploadImageAndGenerateMusic 上传图片并生成音乐
func (s *MediaService) UploadImageAndGenerateMusic(ctx context.Context, imageData []byte, filename string, duration int, temperature float64) (*MediaResponse, error) {
	s.logger.Info("Uploading image and generating music", zap.String("filename", filename))

	// 创建multipart表单
	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)

	// 添加文件
	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return nil, fmt.Errorf("failed to create form file: %w", err)
	}
	if _, err := part.Write(imageData); err != nil {
		return nil, fmt.Errorf("failed to write file data: %w", err)
	}

	// 添加其他参数
	writer.WriteField("duration", fmt.Sprintf("%d", duration))
	writer.WriteField("temperature", fmt.Sprintf("%.2f", temperature))

	writer.Close()

	// 创建请求
	httpReq, err := http.NewRequestWithContext(ctx, "POST", s.aiBaseURL+"/api/v1/media/upload-image-to-music", &buf)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := s.client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to call AI service: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("AI service returned error: %s", string(body))
	}

	var response MediaResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &response, nil
}

// GetAvailableStyles 获取可用的图片风格
func (s *MediaService) GetAvailableStyles(ctx context.Context) (map[string]interface{}, error) {
	httpReq, err := http.NewRequestWithContext(ctx, "GET", s.aiBaseURL+"/api/v1/media/styles", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := s.client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to call AI service: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("AI service returned error: %s", string(body))
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return result, nil
}

// callAIService 调用AI服务的通用方法
func (s *MediaService) callAIService(ctx context.Context, endpoint string, data map[string]interface{}) (*MediaResponse, error) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "POST", s.aiBaseURL+endpoint, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to call AI service: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("AI service returned error: %s", string(body))
	}

	var response MediaResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &response, nil
}

// 辅助函数
func getStringOrDefault(value, defaultValue string) string {
	if value == "" {
		return defaultValue
	}
	return value
}

func getIntOrDefault(value, defaultValue int) int {
	if value == 0 {
		return defaultValue
	}
	return value
}

func getFloat64OrDefault(value, defaultValue float64) float64 {
	if value == 0 {
		return defaultValue
	}
	return value
}
