package handler

import (
	"io"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"youcreator.ai/backend/internal/service"
)

// MediaHandler 媒体生成处理器
type MediaHandler struct {
	mediaService *service.MediaService
	logger       *zap.Logger
}

// NewMediaHandler 创建媒体处理器实例
func NewMediaHandler(mediaService *service.MediaService, logger *zap.Logger) *MediaHandler {
	return &MediaHandler{
		mediaService: mediaService,
		logger:       logger,
	}
}

// TextToImage 文字生成图片
// @Summary 文字生成图片
// @Description 根据文字描述生成图片
// @Tags media
// @Accept json
// @Produce json
// @Param request body service.TextToImageRequest true "文字生成图片请求"
// @Success 200 {object} service.MediaResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/media/text-to-image [post]
func (h *MediaHandler) TextToImage(c *gin.Context) {
	var req service.TextToImageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Invalid request", zap.Error(err))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request format",
			Message: err.Error(),
		})
		return
	}

	// 验证输入
	if req.Text == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid input",
			Message: "Text description is required",
		})
		return
	}

	result, err := h.mediaService.TextToImage(c.Request.Context(), &req)
	if err != nil {
		h.logger.Error("Failed to generate image from text", zap.Error(err))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Generation failed",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, result)
}

// TextToMusic 文字生成音乐
// @Summary 文字生成音乐
// @Description 根据文字描述生成音乐
// @Tags media
// @Accept json
// @Produce json
// @Param request body service.TextToMusicRequest true "文字生成音乐请求"
// @Success 200 {object} service.MediaResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/media/text-to-music [post]
func (h *MediaHandler) TextToMusic(c *gin.Context) {
	var req service.TextToMusicRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Invalid request", zap.Error(err))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request format",
			Message: err.Error(),
		})
		return
	}

	// 验证输入
	if req.Text == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid input",
			Message: "Text description is required",
		})
		return
	}

	result, err := h.mediaService.TextToMusic(c.Request.Context(), &req)
	if err != nil {
		h.logger.Error("Failed to generate music from text", zap.Error(err))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Generation failed",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, result)
}

// ImageToMusic 图片生成音乐
// @Summary 图片生成音乐
// @Description 根据图片生成音乐
// @Tags media
// @Accept json
// @Produce json
// @Param request body service.ImageToMusicRequest true "图片生成音乐请求"
// @Success 200 {object} service.MediaResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/media/image-to-music [post]
func (h *MediaHandler) ImageToMusic(c *gin.Context) {
	var req service.ImageToMusicRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Invalid request", zap.Error(err))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request format",
			Message: err.Error(),
		})
		return
	}

	// 验证输入
	if req.ImageBase64 == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid input",
			Message: "Image data is required",
		})
		return
	}

	result, err := h.mediaService.ImageToMusic(c.Request.Context(), &req)
	if err != nil {
		h.logger.Error("Failed to generate music from image", zap.Error(err))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Generation failed",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, result)
}

// UploadImageToMusic 上传图片生成音乐
// @Summary 上传图片生成音乐
// @Description 上传图片文件并生成音乐
// @Tags media
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "图片文件"
// @Param duration formData int false "音乐时长(秒)" default(10)
// @Param temperature formData number false "生成温度" default(1.0)
// @Success 200 {object} service.MediaResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/media/upload-image-to-music [post]
func (h *MediaHandler) UploadImageToMusic(c *gin.Context) {
	// 获取上传的文件
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		h.logger.Error("Failed to get uploaded file", zap.Error(err))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "File upload failed",
			Message: "No file uploaded or file is invalid",
		})
		return
	}
	defer file.Close()

	// 验证文件类型
	contentType := header.Header.Get("Content-Type")
	if contentType == "" {
		// 尝试从文件名推断
		contentType = "image/jpeg" // 默认值
	}
	
	if !isImageContentType(contentType) {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid file type",
			Message: "Only image files are allowed",
		})
		return
	}

	// 读取文件数据
	imageData, err := io.ReadAll(file)
	if err != nil {
		h.logger.Error("Failed to read file data", zap.Error(err))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "File processing failed",
			Message: err.Error(),
		})
		return
	}

	// 获取参数
	duration := 10
	if durationStr := c.PostForm("duration"); durationStr != "" {
		if d, err := strconv.Atoi(durationStr); err == nil && d > 0 && d <= 30 {
			duration = d
		}
	}

	temperature := 1.0
	if tempStr := c.PostForm("temperature"); tempStr != "" {
		if t, err := strconv.ParseFloat(tempStr, 64); err == nil && t >= 0.1 && t <= 2.0 {
			temperature = t
		}
	}

	result, err := h.mediaService.UploadImageAndGenerateMusic(
		c.Request.Context(),
		imageData,
		header.Filename,
		duration,
		temperature,
	)
	if err != nil {
		h.logger.Error("Failed to generate music from uploaded image", zap.Error(err))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Generation failed",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, result)
}

// BatchGenerate 批量生成媒体内容
// @Summary 批量生成媒体内容
// @Description 批量生成多种媒体内容
// @Tags media
// @Accept json
// @Produce json
// @Param request body service.BatchGenerateRequest true "批量生成请求"
// @Success 200 {array} service.MediaResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/media/batch-generate [post]
func (h *MediaHandler) BatchGenerate(c *gin.Context) {
	var req service.BatchGenerateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Invalid request", zap.Error(err))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request format",
			Message: err.Error(),
		})
		return
	}

	// 验证输入
	if len(req.Requests) == 0 {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid input",
			Message: "At least one request is required",
		})
		return
	}

	if len(req.Requests) > 10 {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Too many requests",
			Message: "Maximum 10 requests allowed per batch",
		})
		return
	}

	results, err := h.mediaService.BatchGenerate(c.Request.Context(), &req)
	if err != nil {
		h.logger.Error("Failed to batch generate media", zap.Error(err))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Batch generation failed",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, results)
}

// GetStyles 获取可用的图片风格
// @Summary 获取可用的图片风格
// @Description 获取所有可用的图片生成风格
// @Tags media
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/media/styles [get]
func (h *MediaHandler) GetStyles(c *gin.Context) {
	result, err := h.mediaService.GetAvailableStyles(c.Request.Context())
	if err != nil {
		h.logger.Error("Failed to get available styles", zap.Error(err))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to get styles",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetMediaCapabilities 获取媒体生成能力
// @Summary 获取媒体生成能力
// @Description 获取当前支持的媒体生成功能和限制
// @Tags media
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/media/capabilities [get]
func (h *MediaHandler) GetMediaCapabilities(c *gin.Context) {
	capabilities := map[string]interface{}{
		"text_to_image": map[string]interface{}{
			"supported": true,
			"styles": []string{
				"realistic", "artistic", "cartoon", "sketch", "oil_painting", "watercolor",
			},
			"max_resolution": map[string]int{
				"width":  1024,
				"height": 1024,
			},
			"inference_steps": map[string]int{
				"min": 10,
				"max": 50,
			},
		},
		"text_to_music": map[string]interface{}{
			"supported": true,
			"max_duration": 30,
			"min_duration": 5,
			"sample_rate":  32000,
			"formats":      []string{"wav"},
		},
		"image_to_music": map[string]interface{}{
			"supported":      true,
			"max_duration":   30,
			"min_duration":   5,
			"supported_formats": []string{"jpg", "jpeg", "png", "webp"},
			"max_file_size":  "10MB",
		},
		"batch_processing": map[string]interface{}{
			"supported":     true,
			"max_requests":  10,
			"timeout":       "5 minutes",
		},
		"rate_limits": map[string]interface{}{
			"requests_per_minute": 10,
			"requests_per_hour":   100,
		},
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"success":      true,
		"capabilities": capabilities,
	})
}

// 辅助函数：检查是否为图片内容类型
func isImageContentType(contentType string) bool {
	imageTypes := []string{
		"image/jpeg",
		"image/jpg", 
		"image/png",
		"image/gif",
		"image/webp",
		"image/bmp",
		"image/tiff",
	}

	for _, imageType := range imageTypes {
		if contentType == imageType {
			return true
		}
	}
	return false
}
