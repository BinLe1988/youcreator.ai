package router

import (
	"github.com/gin-gonic/gin"
	"youcreator.ai/backend/internal/handler"
	"youcreator.ai/backend/internal/middleware"
)

// SetupMediaRoutes 设置媒体生成相关路由
func SetupMediaRoutes(r *gin.RouterGroup, mediaHandler *handler.MediaHandler) {
	// 媒体生成路由组
	media := r.Group("/media")
	
	// 应用认证中间件（可选，根据需求决定是否需要登录）
	// media.Use(middleware.AuthRequired())
	
	// 应用速率限制中间件
	media.Use(middleware.RateLimit(10, 60)) // 每分钟10次请求
	
	// 文字生成图片
	media.POST("/text-to-image", mediaHandler.TextToImage)
	
	// 文字生成音乐
	media.POST("/text-to-music", mediaHandler.TextToMusic)
	
	// 图片生成音乐
	media.POST("/image-to-music", mediaHandler.ImageToMusic)
	
	// 上传图片生成音乐
	media.POST("/upload-image-to-music", mediaHandler.UploadImageToMusic)
	
	// 批量生成
	media.POST("/batch-generate", mediaHandler.BatchGenerate)
	
	// 获取可用风格
	media.GET("/styles", mediaHandler.GetStyles)
	
	// 获取媒体生成能力
	media.GET("/capabilities", mediaHandler.GetMediaCapabilities)
}

// SetupPublicMediaRoutes 设置公开的媒体路由（不需要认证）
func SetupPublicMediaRoutes(r *gin.RouterGroup, mediaHandler *handler.MediaHandler) {
	// 公开的媒体路由
	public := r.Group("/public/media")
	
	// 应用更宽松的速率限制
	public.Use(middleware.RateLimit(5, 60)) // 每分钟5次请求
	
	// 获取可用风格（公开）
	public.GET("/styles", mediaHandler.GetStyles)
	
	// 获取媒体生成能力（公开）
	public.GET("/capabilities", mediaHandler.GetMediaCapabilities)
	
	// 演示端点（限制功能）
	public.POST("/demo/text-to-image", middleware.DemoLimiter(), mediaHandler.TextToImage)
}
