package main

import (
	"log"
	"net/http"
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

// 模拟文本生成函数
func generateMockText(req map[string]interface{}) string {
	prompt, ok := req["prompt"].(string)
	if !ok {
		prompt = "默认主题"
	}
	
	taskType, ok := req["task_type"].(string)
	if !ok {
		taskType = "文本创作"
	}

	// 根据任务类型生成不同的模拟内容
	switch {
	case strings.Contains(strings.ToLower(taskType), "小说"):
		return generateMockNovel(prompt)
	case strings.Contains(strings.ToLower(taskType), "诗歌"):
		return generateMockPoem(prompt)
	case strings.Contains(strings.ToLower(taskType), "剧本"):
		return generateMockScript(prompt)
	case strings.Contains(strings.ToLower(taskType), "文章"):
		return generateMockArticle(prompt)
	default:
		return generateMockGeneral(prompt)
	}
}

func generateMockNovel(prompt string) string {
	return fmt.Sprintf(`第一章 开始

在这个繁华的都市里，李明是一个普通的上班族。每天朝九晚五的生活让他感到疲惫，直到那一天，他遇到了改变命运的机会。

关于"%s"的故事就这样开始了。

那是一个阳光明媚的周末，李明正在咖啡厅里享受难得的悠闲时光。突然，一个陌生的女孩走了过来，她的眼中闪烁着神秘的光芒。

"你好，"她轻声说道，"我想你就是我要找的人。"

李明抬起头，看着这个美丽而神秘的女孩，心中涌起了一种前所未有的感觉。他不知道，这次相遇将彻底改变他的人生轨迹。

"我是谁？"李明疑惑地问道。

女孩微笑着坐下，"你是那个能够改变世界的人。"

从那一刻起，李明的平凡生活开始了不平凡的转折...

（这是AI生成的示例小说开头，实际使用时会根据您的具体要求生成更丰富的内容）`, prompt)
}

func generateMockPoem(prompt string) string {
	return fmt.Sprintf(`关于"%s"的诗

春风轻抚大地，
万物复苏生机。
心中有梦想，
脚下有力量。

时光如流水，
岁月似飞花。
珍惜每一刻，
拥抱每一天。

生活虽平凡，
但心可飞翔。
在这美好的世界里，
我们都是诗人。

（这是AI生成的示例诗歌，实际使用时会根据您的具体要求和风格偏好生成更符合要求的诗歌作品）`, prompt)
}

func generateMockScript(prompt string) string {
	return fmt.Sprintf(`剧本：%s

场景：咖啡厅内，下午时光

人物：
- 小李：年轻的程序员，内向但善良
- 小王：小李的朋友，外向开朗
- 服务员：咖啡厅工作人员

第一幕

（小李独自坐在角落的桌子旁，面前放着一杯咖啡和一台笔记本电脑）

小李：（自言自语）又是一个人的周末...

（小王推门而入，四处张望，看到小李后走过去）

小王：嘿，小李！我就知道你在这里。

小李：（抬头）小王？你怎么来了？

小王：（坐下）我路过这里，想起你说过喜欢这家咖啡厅的环境。怎么样，最近工作还顺利吗？

小李：还行吧，就是有点累。你呢？

小王：我啊，刚刚完成了一个大项目，现在轻松多了。对了，我有个好消息要告诉你...

（这是AI生成的示例剧本开头，实际使用时会根据您的具体要求生成完整的剧本内容）`, prompt)
}

func generateMockArticle(prompt string) string {
	return fmt.Sprintf(`关于"%s"的思考

引言

在当今快速发展的社会中，我们经常需要停下来思考一些重要的问题。今天，我想和大家分享一些关于这个话题的看法和思考。

主要观点

首先，我们需要认识到这个问题的重要性。在我们的日常生活中，这个话题影响着我们的方方面面，从个人发展到社会进步，都与之息息相关。

其次，我们应该从多个角度来分析这个问题。不同的人可能会有不同的看法，这正是讨论的价值所在。通过交流和碰撞，我们能够获得更深入的理解。

最后，我们需要将理论与实践相结合。仅仅停留在理论层面是不够的，我们需要在实际生活中应用这些思考和认识。

结论

总的来说，这个话题值得我们深入思考和持续关注。只有通过不断的学习和实践，我们才能在这个领域取得真正的进步。

（这是AI生成的示例文章，实际使用时会根据您的具体要求和文章类型生成更专业和深入的内容）`, prompt)
}

func generateMockGeneral(prompt string) string {
	return fmt.Sprintf(`关于"%s"的内容

这是一段由AI生成的示例文本。在实际应用中，AI会根据您提供的具体要求、风格偏好和内容类型，生成更加精准和个性化的内容。

当前的文本生成功能支持多种类型的创作，包括但不限于：
- 小说创作：支持不同题材和风格的小说写作
- 诗歌创作：包括现代诗、古体诗等多种诗歌形式
- 剧本创作：话剧、小品等戏剧作品
- 文章写作：议论文、说明文、散文等各类文章
- 文本改进：对现有文本进行优化和完善

我们的AI系统会不断学习和改进，为您提供更好的创作体验。

（这是演示版本的输出，正式版本会提供更丰富和高质量的内容生成服务）`, prompt)
}

func main() {
	// 加载环境变量
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// 创建Gin路由
	r := gin.Default()

	// 添加CORS中间件
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		
		c.Next()
	})

	// 健康检查端点
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "youcreator-backend",
			"version": "1.0.0",
		})
	})

	// API路由组
	api := r.Group("/api/v1")
	{
		// 认证路由
		auth := api.Group("/auth")
		{
			auth.POST("/login", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{
					"message": "Login endpoint",
					"token":   "demo-jwt-token",
				})
			})
			
			auth.POST("/register", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{
					"message": "Register endpoint",
				})
			})
		}

		// 项目路由
		projects := api.Group("/projects")
		{
			projects.GET("", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{
					"projects": []gin.H{
						{
							"id":   1,
							"name": "示例写作项目",
							"type": "writing",
						},
						{
							"id":   2,
							"name": "示例绘画项目",
							"type": "painting",
						},
					},
				})
			})
			
			projects.POST("", func(c *gin.Context) {
				c.JSON(http.StatusCreated, gin.H{
					"message": "Project created",
					"id":      123,
				})
			})
		}

		// AI生成路由
		ai := api.Group("/ai")
		{
			ai.POST("/text/generate", func(c *gin.Context) {
				var req map[string]interface{}
				if err := c.ShouldBindJSON(&req); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{
						"success": false,
						"error":   "Invalid request format",
					})
					return
				}

				// 调用AI服务
				aiServiceURL := "http://localhost:8000"
				resp, err := http.Post(aiServiceURL+"/generate/text", "application/json", nil)
				if err != nil {
					// 返回模拟数据作为备用
					c.JSON(http.StatusOK, gin.H{
						"success": true,
						"data": gin.H{
							"text": generateMockText(req),
							"metadata": gin.H{
								"word_count": 500,
								"generated_at": "2024-01-01T00:00:00Z",
							},
						},
					})
					return
				}
				defer resp.Body.Close()

				// 如果AI服务不可用，返回模拟数据
				c.JSON(http.StatusOK, gin.H{
					"success": true,
					"data": gin.H{
						"text": generateMockText(req),
						"metadata": gin.H{
							"word_count": 500,
							"generated_at": "2024-01-01T00:00:00Z",
						},
					},
				})
			})
			
			ai.POST("/image/generate", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{
					"success": true,
					"data": gin.H{
						"image_url": "http://localhost:8080/generated/image.png",
					},
				})
			})
		}
	}

	// 启动服务器
	port := "8080"
	log.Printf("Server starting on port %s", port)
	log.Fatal(r.Run(":" + port))
}
