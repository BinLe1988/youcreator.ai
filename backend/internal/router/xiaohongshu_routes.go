package router

import (
	"github.com/gin-gonic/gin"
	"youcreator.ai/backend/internal/handler"
	"youcreator.ai/backend/internal/middleware"
)

// SetupXiaohongshuRoutes 设置小红书发布相关路由
func SetupXiaohongshuRoutes(r *gin.RouterGroup, xiaohongshuHandler *handler.XiaohongshuHandler) {
	// 小红书发布路由组
	xhs := r.Group("/xiaohongshu")
	
	// 应用认证中间件
	xhs.Use(middleware.AuthRequired())
	
	// 应用速率限制中间件
	xhs.Use(middleware.RateLimit(20, 60)) // 每分钟20次请求
	
	// 内容分析和格式化
	xhs.POST("/analyze", xiaohongshuHandler.AnalyzeContent)
	xhs.POST("/format", xiaohongshuHandler.FormatContent)
	xhs.POST("/preview", xiaohongshuHandler.PreviewNote)
	
	// 标签相关
	xhs.POST("/tags/suggest", xiaohongshuHandler.GetTagSuggestions)
	
	// 发布相关
	xhs.POST("/publish", xiaohongshuHandler.PublishNote)
	xhs.POST("/batch-publish", xiaohongshuHandler.BatchPublish)
	
	// 历史和统计
	xhs.GET("/history", xiaohongshuHandler.GetPublishHistory)
	xhs.GET("/stats", xiaohongshuHandler.GetPlatformStats)
}

// SetupPublicXiaohongshuRoutes 设置公开的小红书路由（不需要认证）
func SetupPublicXiaohongshuRoutes(r *gin.RouterGroup, xiaohongshuHandler *handler.XiaohongshuHandler) {
	// 公开的小红书路由
	public := r.Group("/public/xiaohongshu")
	
	// 应用更宽松的速率限制
	public.Use(middleware.RateLimit(10, 60)) // 每分钟10次请求
	
	// 演示功能（限制功能）
	public.POST("/demo/analyze", middleware.DemoLimiter(), xiaohongshuHandler.AnalyzeContent)
	public.POST("/demo/format", middleware.DemoLimiter(), xiaohongshuHandler.FormatContent)
	public.POST("/demo/tags", middleware.DemoLimiter(), xiaohongshuHandler.GetTagSuggestions)
}
