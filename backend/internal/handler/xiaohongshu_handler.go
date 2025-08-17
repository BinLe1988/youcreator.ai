package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"youcreator.ai/backend/internal/service"
)

// XiaohongshuHandler 小红书发布处理器
type XiaohongshuHandler struct {
	xiaohongshuService *service.XiaohongshuService
	logger             *zap.Logger
}

// NewXiaohongshuHandler 创建小红书处理器实例
func NewXiaohongshuHandler(xiaohongshuService *service.XiaohongshuService, logger *zap.Logger) *XiaohongshuHandler {
	return &XiaohongshuHandler{
		xiaohongshuService: xiaohongshuService,
		logger:             logger,
	}
}

// AnalyzeContent 分析内容
// @Summary 分析内容并生成标签建议
// @Description 分析笔记内容，生成主题、情感、标签等建议
// @Tags xiaohongshu
// @Accept json
// @Produce json
// @Param request body service.NoteContent true "笔记内容"
// @Success 200 {object} service.ContentAnalysis
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/xiaohongshu/analyze [post]
func (h *XiaohongshuHandler) AnalyzeContent(c *gin.Context) {
	var content service.NoteContent
	if err := c.ShouldBindJSON(&content); err != nil {
		h.logger.Error("Invalid request", zap.Error(err))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request format",
			Message: err.Error(),
		})
		return
	}

	// 验证必要字段
	if content.Title == "" || content.Content == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Missing required fields",
			Message: "Title and content are required",
		})
		return
	}

	analysis, err := h.xiaohongshuService.AnalyzeContent(c.Request.Context(), content)
	if err != nil {
		h.logger.Error("Failed to analyze content", zap.Error(err))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Analysis failed",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, analysis)
}

// FormatContent 格式化内容
// @Summary 格式化内容为小红书风格
// @Description 将内容格式化为适合小红书的风格，包括标题优化、内容排版等
// @Tags xiaohongshu
// @Accept json
// @Produce json
// @Param request body service.NoteContent true "原始笔记内容"
// @Success 200 {object} service.NoteContent
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/xiaohongshu/format [post]
func (h *XiaohongshuHandler) FormatContent(c *gin.Context) {
	var content service.NoteContent
	if err := c.ShouldBindJSON(&content); err != nil {
		h.logger.Error("Invalid request", zap.Error(err))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request format",
			Message: err.Error(),
		})
		return
	}

	// 先分析内容
	analysis, err := h.xiaohongshuService.AnalyzeContent(c.Request.Context(), content)
	if err != nil {
		h.logger.Error("Failed to analyze content", zap.Error(err))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Analysis failed",
			Message: err.Error(),
		})
		return
	}

	// 格式化内容
	formatted, err := h.xiaohongshuService.FormatContent(c.Request.Context(), content, analysis)
	if err != nil {
		h.logger.Error("Failed to format content", zap.Error(err))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Formatting failed",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, formatted)
}

// PublishNote 发布笔记
// @Summary 发布笔记到小红书
// @Description 将内容发布到小红书平台
// @Tags xiaohongshu
// @Accept json
// @Produce json
// @Param request body service.PublishRequest true "发布请求"
// @Success 200 {object} service.PublishResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/xiaohongshu/publish [post]
func (h *XiaohongshuHandler) PublishNote(c *gin.Context) {
	var req service.PublishRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Invalid request", zap.Error(err))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request format",
			Message: err.Error(),
		})
		return
	}

	// 验证必要字段
	if req.UserID == 0 {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Missing user ID",
			Message: "User ID is required",
		})
		return
	}

	if req.NoteContent.Title == "" || req.NoteContent.Content == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Missing required fields",
			Message: "Title and content are required",
		})
		return
	}

	response, err := h.xiaohongshuService.PublishNote(c.Request.Context(), &req)
	if err != nil {
		h.logger.Error("Failed to publish note", zap.Error(err))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Publish failed",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response)
}

// BatchPublish 批量发布笔记
// @Summary 批量发布笔记到小红书
// @Description 批量发布多个笔记到小红书平台
// @Tags xiaohongshu
// @Accept json
// @Produce json
// @Param request body []service.PublishRequest true "批量发布请求"
// @Success 200 {array} service.PublishResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/xiaohongshu/batch-publish [post]
func (h *XiaohongshuHandler) BatchPublish(c *gin.Context) {
	var requests []*service.PublishRequest
	if err := c.ShouldBindJSON(&requests); err != nil {
		h.logger.Error("Invalid request", zap.Error(err))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request format",
			Message: err.Error(),
		})
		return
	}

	// 验证请求数量
	if len(requests) == 0 {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Empty request list",
			Message: "At least one publish request is required",
		})
		return
	}

	if len(requests) > 10 {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Too many requests",
			Message: "Maximum 10 requests allowed per batch",
		})
		return
	}

	responses, err := h.xiaohongshuService.BatchPublish(c.Request.Context(), requests)
	if err != nil {
		h.logger.Error("Failed to batch publish", zap.Error(err))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Batch publish failed",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, responses)
}

// GetTagSuggestions 获取标签建议
// @Summary 获取标签建议
// @Description 根据内容获取标签建议
// @Tags xiaohongshu
// @Accept json
// @Produce json
// @Param request body service.NoteContent true "笔记内容"
// @Success 200 {array} service.TagSuggestion
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/xiaohongshu/tags/suggest [post]
func (h *XiaohongshuHandler) GetTagSuggestions(c *gin.Context) {
	var content service.NoteContent
	if err := c.ShouldBindJSON(&content); err != nil {
		h.logger.Error("Invalid request", zap.Error(err))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request format",
			Message: err.Error(),
		})
		return
	}

	analysis, err := h.xiaohongshuService.AnalyzeContent(c.Request.Context(), content)
	if err != nil {
		h.logger.Error("Failed to analyze content", zap.Error(err))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Analysis failed",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, analysis.SuggestedTags)
}

// PreviewNote 预览笔记
// @Summary 预览格式化后的笔记
// @Description 预览笔记在小红书上的显示效果
// @Tags xiaohongshu
// @Accept json
// @Produce json
// @Param request body service.NoteContent true "笔记内容"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/xiaohongshu/preview [post]
func (h *XiaohongshuHandler) PreviewNote(c *gin.Context) {
	var content service.NoteContent
	if err := c.ShouldBindJSON(&content); err != nil {
		h.logger.Error("Invalid request", zap.Error(err))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request format",
			Message: err.Error(),
		})
		return
	}

	// 分析内容
	analysis, err := h.xiaohongshuService.AnalyzeContent(c.Request.Context(), content)
	if err != nil {
		h.logger.Error("Failed to analyze content", zap.Error(err))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Analysis failed",
			Message: err.Error(),
		})
		return
	}

	// 格式化内容
	formatted, err := h.xiaohongshuService.FormatContent(c.Request.Context(), content, analysis)
	if err != nil {
		h.logger.Error("Failed to format content", zap.Error(err))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Formatting failed",
			Message: err.Error(),
		})
		return
	}

	// 返回预览数据
	preview := map[string]interface{}{
		"original_content":  content,
		"formatted_content": formatted,
		"analysis":          analysis,
		"preview_url":       "", // 可以生成预览链接
		"estimated_reach":   h.estimateReach(analysis),
		"optimization_tips": h.getOptimizationTips(analysis),
	}

	c.JSON(http.StatusOK, preview)
}

// GetPublishHistory 获取发布历史
// @Summary 获取发布历史
// @Description 获取用户的小红书发布历史
// @Tags xiaohongshu
// @Produce json
// @Param user_id query int true "用户ID"
// @Param page query int false "页码" default(1)
// @Param limit query int false "每页数量" default(10)
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/xiaohongshu/history [get]
func (h *XiaohongshuHandler) GetPublishHistory(c *gin.Context) {
	userID := c.Query("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Missing user ID",
			Message: "User ID is required",
		})
		return
	}

	page := 1
	if p := c.Query("page"); p != "" {
		// 解析页码
	}

	limit := 10
	if l := c.Query("limit"); l != "" {
		// 解析限制数量
	}

	// 这里应该从数据库获取发布历史
	// 暂时返回模拟数据
	history := map[string]interface{}{
		"total": 0,
		"page":  page,
		"limit": limit,
		"data":  []interface{}{},
	}

	c.JSON(http.StatusOK, history)
}

// GetPlatformStats 获取平台统计
// @Summary 获取小红书平台统计信息
// @Description 获取发布统计、互动数据等
// @Tags xiaohongshu
// @Produce json
// @Param user_id query int true "用户ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/xiaohongshu/stats [get]
func (h *XiaohongshuHandler) GetPlatformStats(c *gin.Context) {
	userID := c.Query("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Missing user ID",
			Message: "User ID is required",
		})
		return
	}

	// 模拟统计数据
	stats := map[string]interface{}{
		"total_notes":     0,
		"total_views":     0,
		"total_likes":     0,
		"total_comments":  0,
		"total_shares":    0,
		"total_followers": 0,
		"engagement_rate": 0.0,
		"popular_tags":    []string{},
		"best_time":       "20:00-22:00",
		"trending_topics": []string{},
	}

	c.JSON(http.StatusOK, stats)
}

// 辅助方法

// estimateReach 估算触达范围
func (h *XiaohongshuHandler) estimateReach(analysis *service.ContentAnalysis) map[string]interface{} {
	// 根据内容分析估算可能的触达范围
	baseReach := 100

	// 根据主题调整
	themeMultiplier := map[string]float64{
		"美食": 1.5,
		"旅行": 1.4,
		"时尚": 1.3,
		"美妆": 1.6,
		"生活": 1.2,
		"科技": 1.1,
		"健身": 1.3,
		"学习": 1.0,
		"艺术": 1.1,
		"家居": 1.2,
	}

	multiplier := 1.0
	if m, exists := themeMultiplier[analysis.Theme]; exists {
		multiplier = m
	}

	estimatedReach := int(float64(baseReach) * multiplier)

	return map[string]interface{}{
		"estimated_views":    estimatedReach,
		"estimated_likes":    estimatedReach / 10,
		"estimated_comments": estimatedReach / 50,
		"confidence":         "medium",
		"factors": []string{
			fmt.Sprintf("主题: %s", analysis.Theme),
			fmt.Sprintf("情感: %s", analysis.Mood),
			fmt.Sprintf("标签数量: %d", len(analysis.SuggestedTags)),
		},
	}
}

// getOptimizationTips 获取优化建议
func (h *XiaohongshuHandler) getOptimizationTips(analysis *service.ContentAnalysis) []string {
	var tips []string

	// 基于分析结果给出建议
	if len(analysis.Keywords) < 3 {
		tips = append(tips, "建议增加更多关键词，提高内容的可发现性")
	}

	if len(analysis.SuggestedTags) < 5 {
		tips = append(tips, "建议添加更多相关标签，最多可以添加8个")
	}

	// 根据主题给出具体建议
	themeAdvice := map[string]string{
		"美食": "建议添加具体的菜品名称和餐厅位置信息",
		"旅行": "建议添加具体的地点标签和旅行时间",
		"时尚": "建议添加品牌信息和搭配技巧",
		"美妆": "建议添加产品信息和使用心得",
		"生活": "建议分享更多生活细节和感悟",
	}

	if advice, exists := themeAdvice[analysis.Theme]; exists {
		tips = append(tips, advice)
	}

	// 通用建议
	tips = append(tips, "建议在晚上8-10点发布，获得更好的曝光效果")
	tips = append(tips, "建议与粉丝积极互动，提高参与度")

	return tips
}
