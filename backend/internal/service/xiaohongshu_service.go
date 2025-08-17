package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"strings"
	"time"

	"go.uber.org/zap"
)

// XiaohongshuService 小红书发布服务
type XiaohongshuService struct {
	logger    *zap.Logger
	apiKey    string
	apiSecret string
	baseURL   string
	client    *http.Client
}

// XiaohongshuConfig 小红书配置
type XiaohongshuConfig struct {
	APIKey    string `json:"api_key"`
	APISecret string `json:"api_secret"`
	BaseURL   string `json:"base_url"`
}

// NoteContent 笔记内容
type NoteContent struct {
	Title       string   `json:"title" binding:"required"`
	Content     string   `json:"content" binding:"required"`
	Images      []string `json:"images,omitempty"`
	AudioURL    string   `json:"audio_url,omitempty"`
	Tags        []string `json:"tags,omitempty"`
	Location    string   `json:"location,omitempty"`
	IsPrivate   bool     `json:"is_private,omitempty"`
	AllowComment bool    `json:"allow_comment"`
	AllowShare  bool     `json:"allow_share"`
}

// PublishRequest 发布请求
type PublishRequest struct {
	UserID      uint        `json:"user_id" binding:"required"`
	NoteContent NoteContent `json:"note_content" binding:"required"`
	AutoTags    bool        `json:"auto_tags,omitempty"`
	AutoFormat  bool        `json:"auto_format,omitempty"`
}

// PublishResponse 发布响应
type PublishResponse struct {
	Success bool   `json:"success"`
	NoteID  string `json:"note_id,omitempty"`
	URL     string `json:"url,omitempty"`
	Error   string `json:"error,omitempty"`
	Message string `json:"message,omitempty"`
}

// TagSuggestion 标签建议
type TagSuggestion struct {
	Tag         string  `json:"tag"`
	Relevance   float64 `json:"relevance"`
	Category    string  `json:"category"`
	Description string  `json:"description"`
}

// ContentAnalysis 内容分析结果
type ContentAnalysis struct {
	Theme        string          `json:"theme"`
	Mood         string          `json:"mood"`
	Style        string          `json:"style"`
	Keywords     []string        `json:"keywords"`
	SuggestedTags []TagSuggestion `json:"suggested_tags"`
	Category     string          `json:"category"`
}

// NewXiaohongshuService 创建小红书服务实例
func NewXiaohongshuService(logger *zap.Logger, config XiaohongshuConfig) *XiaohongshuService {
	return &XiaohongshuService{
		logger:    logger,
		apiKey:    config.APIKey,
		apiSecret: config.APISecret,
		baseURL:   config.BaseURL,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// AnalyzeContent 分析内容并生成标签建议
func (s *XiaohongshuService) AnalyzeContent(ctx context.Context, content NoteContent) (*ContentAnalysis, error) {
	s.logger.Info("Analyzing content for Xiaohongshu", zap.String("title", content.Title))

	// 分析内容主题和情感
	analysis := &ContentAnalysis{
		Keywords: s.extractKeywords(content.Title + " " + content.Content),
	}

	// 根据内容分析主题
	analysis.Theme = s.analyzeTheme(content)
	analysis.Mood = s.analyzeMood(content)
	analysis.Style = s.analyzeStyle(content)
	analysis.Category = s.categorizeContent(content)

	// 生成标签建议
	analysis.SuggestedTags = s.generateTagSuggestions(analysis)

	return analysis, nil
}

// FormatContent 格式化内容为小红书风格
func (s *XiaohongshuService) FormatContent(ctx context.Context, content NoteContent, analysis *ContentAnalysis) (*NoteContent, error) {
	s.logger.Info("Formatting content for Xiaohongshu")

	formatted := content

	// 格式化标题 - 添加emoji和吸引人的元素
	formatted.Title = s.formatTitle(content.Title, analysis)

	// 格式化正文内容
	formatted.Content = s.formatContentBody(content.Content, analysis)

	// 自动生成标签
	if len(formatted.Tags) == 0 {
		formatted.Tags = s.selectBestTags(analysis.SuggestedTags, 8) // 小红书建议最多8个标签
	}

	return &formatted, nil
}

// PublishNote 发布笔记到小红书
func (s *XiaohongshuService) PublishNote(ctx context.Context, req *PublishRequest) (*PublishResponse, error) {
	s.logger.Info("Publishing note to Xiaohongshu", zap.Uint("user_id", req.UserID))

	// 分析内容
	analysis, err := s.AnalyzeContent(ctx, req.NoteContent)
	if err != nil {
		return nil, fmt.Errorf("failed to analyze content: %w", err)
	}

	// 格式化内容
	var formattedContent *NoteContent
	if req.AutoFormat {
		formattedContent, err = s.FormatContent(ctx, req.NoteContent, analysis)
		if err != nil {
			return nil, fmt.Errorf("failed to format content: %w", err)
		}
	} else {
		formattedContent = &req.NoteContent
	}

	// 自动生成标签
	if req.AutoTags && len(formattedContent.Tags) == 0 {
		formattedContent.Tags = s.selectBestTags(analysis.SuggestedTags, 8)
	}

	// 上传图片
	imageIDs, err := s.uploadImages(ctx, formattedContent.Images)
	if err != nil {
		return nil, fmt.Errorf("failed to upload images: %w", err)
	}

	// 发布笔记
	noteID, noteURL, err := s.createNote(ctx, formattedContent, imageIDs)
	if err != nil {
		return nil, fmt.Errorf("failed to create note: %w", err)
	}

	return &PublishResponse{
		Success: true,
		NoteID:  noteID,
		URL:     noteURL,
		Message: "笔记发布成功",
	}, nil
}

// BatchPublish 批量发布笔记
func (s *XiaohongshuService) BatchPublish(ctx context.Context, requests []*PublishRequest) ([]*PublishResponse, error) {
	s.logger.Info("Batch publishing notes to Xiaohongshu", zap.Int("count", len(requests)))

	responses := make([]*PublishResponse, len(requests))

	for i, req := range requests {
		response, err := s.PublishNote(ctx, req)
		if err != nil {
			responses[i] = &PublishResponse{
				Success: false,
				Error:   err.Error(),
			}
		} else {
			responses[i] = response
		}

		// 添加延迟避免频率限制
		if i < len(requests)-1 {
			time.Sleep(2 * time.Second)
		}
	}

	return responses, nil
}

// 私有方法实现

// extractKeywords 提取关键词
func (s *XiaohongshuService) extractKeywords(text string) []string {
	// 简单的关键词提取逻辑，实际项目中可以使用更复杂的NLP算法
	words := strings.Fields(strings.ToLower(text))
	keywordMap := make(map[string]int)

	// 过滤停用词并统计词频
	stopWords := map[string]bool{
		"的": true, "了": true, "在": true, "是": true, "我": true, "有": true, "和": true,
		"就": true, "不": true, "人": true, "都": true, "一": true, "一个": true, "上": true,
		"也": true, "很": true, "到": true, "说": true, "要": true, "去": true, "你": true,
		"会": true, "着": true, "没有": true, "看": true, "好": true, "自己": true, "这": true,
	}

	for _, word := range words {
		if len(word) > 1 && !stopWords[word] {
			keywordMap[word]++
		}
	}

	// 选择频率最高的关键词
	var keywords []string
	for word, count := range keywordMap {
		if count >= 1 && len(keywords) < 10 {
			keywords = append(keywords, word)
		}
	}

	return keywords
}

// analyzeTheme 分析内容主题
func (s *XiaohongshuService) analyzeTheme(content NoteContent) string {
	text := strings.ToLower(content.Title + " " + content.Content)

	themes := map[string][]string{
		"美食":   {"美食", "食物", "餐厅", "菜谱", "烹饪", "美味", "料理", "小吃"},
		"旅行":   {"旅行", "旅游", "景点", "攻略", "酒店", "机票", "风景", "度假"},
		"时尚":   {"时尚", "穿搭", "服装", "搭配", "潮流", "品牌", "包包", "鞋子"},
		"美妆":   {"美妆", "化妆", "护肤", "彩妆", "口红", "面膜", "保养", "美容"},
		"生活":   {"生活", "日常", "分享", "记录", "感悟", "心情", "随笔", "日记"},
		"科技":   {"科技", "数码", "手机", "电脑", "软件", "应用", "AI", "人工智能"},
		"健身":   {"健身", "运动", "锻炼", "瑜伽", "跑步", "减肥", "塑形", "健康"},
		"学习":   {"学习", "教育", "知识", "技能", "课程", "读书", "成长", "提升"},
		"艺术":   {"艺术", "绘画", "摄影", "音乐", "创作", "设计", "文艺", "审美"},
		"家居":   {"家居", "装修", "布置", "收纳", "家具", "装饰", "生活用品", "整理"},
	}

	maxScore := 0
	selectedTheme := "生活"

	for theme, keywords := range themes {
		score := 0
		for _, keyword := range keywords {
			if strings.Contains(text, keyword) {
				score++
			}
		}
		if score > maxScore {
			maxScore = score
			selectedTheme = theme
		}
	}

	return selectedTheme
}

// analyzeMood 分析内容情感
func (s *XiaohongshuService) analyzeMood(content NoteContent) string {
	text := strings.ToLower(content.Title + " " + content.Content)

	moods := map[string][]string{
		"开心": {"开心", "快乐", "高兴", "愉快", "兴奋", "满足", "幸福", "美好"},
		"平静": {"平静", "安静", "宁静", "舒适", "放松", "悠闲", "惬意", "温馨"},
		"感动": {"感动", "温暖", "感谢", "珍惜", "回忆", "怀念", "深刻", "意义"},
		"惊喜": {"惊喜", "意外", "发现", "新奇", "有趣", "神奇", "不可思议", "震撼"},
		"思考": {"思考", "反思", "感悟", "领悟", "理解", "认识", "体会", "启发"},
	}

	maxScore := 0
	selectedMood := "平静"

	for mood, keywords := range moods {
		score := 0
		for _, keyword := range keywords {
			if strings.Contains(text, keyword) {
				score++
			}
		}
		if score > maxScore {
			maxScore = score
			selectedMood = mood
		}
	}

	return selectedMood
}

// analyzeStyle 分析内容风格
func (s *XiaohongshuService) analyzeStyle(content NoteContent) string {
	// 根据内容长度和结构分析风格
	contentLength := len(content.Content)
	hasImages := len(content.Images) > 0

	if contentLength < 100 {
		return "简约"
	} else if contentLength > 500 {
		return "详细"
	} else if hasImages {
		return "图文并茂"
	} else {
		return "文字为主"
	}
}

// categorizeContent 内容分类
func (s *XiaohongshuService) categorizeContent(content NoteContent) string {
	// 根据主题返回小红书的内容分类
	theme := s.analyzeTheme(content)
	
	categoryMap := map[string]string{
		"美食": "美食",
		"旅行": "旅行",
		"时尚": "穿搭",
		"美妆": "美妆",
		"生活": "生活",
		"科技": "数码",
		"健身": "运动健身",
		"学习": "知识",
		"艺术": "艺术",
		"家居": "家居",
	}

	if category, exists := categoryMap[theme]; exists {
		return category
	}
	return "生活"
}

// generateTagSuggestions 生成标签建议
func (s *XiaohongshuService) generateTagSuggestions(analysis *ContentAnalysis) []TagSuggestion {
	var suggestions []TagSuggestion

	// 基于主题的标签
	themeTagsMap := map[string][]string{
		"美食":   {"美食分享", "好吃推荐", "美食探店", "家常菜", "美食记录"},
		"旅行":   {"旅行分享", "旅游攻略", "风景打卡", "旅行记录", "出行指南"},
		"时尚":   {"穿搭分享", "时尚搭配", "服装推荐", "潮流趋势", "风格展示"},
		"美妆":   {"美妆分享", "化妆教程", "护肤心得", "美妆推荐", "变美日记"},
		"生活":   {"生活分享", "日常记录", "生活感悟", "生活方式", "生活美学"},
		"科技":   {"科技分享", "数码评测", "软件推荐", "科技生活", "效率工具"},
		"健身":   {"健身分享", "运动记录", "健身教程", "健康生活", "运动日记"},
		"学习":   {"学习分享", "知识分享", "成长记录", "学习方法", "技能提升"},
		"艺术":   {"艺术分享", "创作记录", "审美分享", "文艺生活", "艺术欣赏"},
		"家居":   {"家居分享", "装修记录", "生活用品", "家居美学", "收纳整理"},
	}

	// 基于情感的标签
	moodTagsMap := map[string][]string{
		"开心": {"开心分享", "快乐时光", "美好生活", "幸福感"},
		"平静": {"岁月静好", "慢生活", "治愈系", "温馨时光"},
		"感动": {"感动瞬间", "温暖人心", "珍贵回忆", "感恩生活"},
		"惊喜": {"惊喜发现", "新奇体验", "有趣分享", "意外收获"},
		"思考": {"人生感悟", "深度思考", "成长感悟", "生活哲理"},
	}

	// 添加主题标签
	if themeTags, exists := themeTagsMap[analysis.Theme]; exists {
		for i, tag := range themeTags {
			suggestions = append(suggestions, TagSuggestion{
				Tag:         tag,
				Relevance:   0.9 - float64(i)*0.1,
				Category:    "主题",
				Description: fmt.Sprintf("基于%s主题的标签", analysis.Theme),
			})
		}
	}

	// 添加情感标签
	if moodTags, exists := moodTagsMap[analysis.Mood]; exists {
		for i, tag := range moodTags {
			suggestions = append(suggestions, TagSuggestion{
				Tag:         tag,
				Relevance:   0.8 - float64(i)*0.1,
				Category:    "情感",
				Description: fmt.Sprintf("基于%s情感的标签", analysis.Mood),
			})
		}
	}

	// 添加关键词标签
	for i, keyword := range analysis.Keywords {
		if i < 5 { // 最多5个关键词标签
			suggestions = append(suggestions, TagSuggestion{
				Tag:         keyword,
				Relevance:   0.7 - float64(i)*0.1,
				Category:    "关键词",
				Description: "基于内容关键词的标签",
			})
		}
	}

	return suggestions
}

// selectBestTags 选择最佳标签
func (s *XiaohongshuService) selectBestTags(suggestions []TagSuggestion, maxCount int) []string {
	// 按相关性排序并选择前N个
	var tags []string
	
	// 简单选择相关性最高的标签
	count := 0
	for _, suggestion := range suggestions {
		if count >= maxCount {
			break
		}
		if suggestion.Relevance > 0.5 {
			tags = append(tags, suggestion.Tag)
			count++
		}
	}

	return tags
}

// formatTitle 格式化标题
func (s *XiaohongshuService) formatTitle(title string, analysis *ContentAnalysis) string {
	// 根据主题添加合适的emoji
	emojiMap := map[string]string{
		"美食": "🍽️",
		"旅行": "✈️",
		"时尚": "👗",
		"美妆": "💄",
		"生活": "🌸",
		"科技": "📱",
		"健身": "💪",
		"学习": "📚",
		"艺术": "🎨",
		"家居": "🏠",
	}

	emoji := "✨"
	if themeEmoji, exists := emojiMap[analysis.Theme]; exists {
		emoji = themeEmoji
	}

	// 确保标题不超过30个字符（小红书限制）
	if len(title) > 27 {
		title = title[:27] + "..."
	}

	return fmt.Sprintf("%s %s", emoji, title)
}

// formatContentBody 格式化正文内容
func (s *XiaohongshuService) formatContentBody(content string, analysis *ContentAnalysis) string {
	// 添加分段和emoji，让内容更适合小红书风格
	formatted := content

	// 添加主题相关的结尾
	endingMap := map[string]string{
		"美食": "\n\n🍽️ 你们还有什么好吃的推荐吗？",
		"旅行": "\n\n✈️ 有去过的小伙伴吗？分享一下体验吧！",
		"时尚": "\n\n👗 你们觉得这个搭配怎么样？",
		"美妆": "\n\n💄 姐妹们有什么好用的产品推荐吗？",
		"生活": "\n\n🌸 生活中的小美好，你们也有吗？",
		"科技": "\n\n📱 大家对这个怎么看？",
		"健身": "\n\n💪 一起加油健身吧！",
		"学习": "\n\n📚 学习路上，我们一起进步！",
		"艺术": "\n\n🎨 艺术让生活更美好～",
		"家居": "\n\n🏠 打造温馨的家，一起努力！",
	}

	if ending, exists := endingMap[analysis.Theme]; exists {
		formatted += ending
	}

	// 添加标签提示
	formatted += "\n\n#分享生活 #记录美好"

	return formatted
}

// uploadImages 上传图片到小红书
func (s *XiaohongshuService) uploadImages(ctx context.Context, imageURLs []string) ([]string, error) {
	var imageIDs []string

	for _, imageURL := range imageURLs {
		imageID, err := s.uploadSingleImage(ctx, imageURL)
		if err != nil {
			s.logger.Error("Failed to upload image", zap.String("url", imageURL), zap.Error(err))
			continue
		}
		imageIDs = append(imageIDs, imageID)
	}

	return imageIDs, nil
}

// uploadSingleImage 上传单个图片
func (s *XiaohongshuService) uploadSingleImage(ctx context.Context, imageURL string) (string, error) {
	// 这里应该实现实际的图片上传逻辑
	// 由于小红书API的具体实现可能需要特定的认证和上传流程
	// 这里提供一个模拟实现
	
	s.logger.Info("Uploading image", zap.String("url", imageURL))
	
	// 模拟上传成功，返回图片ID
	return fmt.Sprintf("img_%d", time.Now().Unix()), nil
}

// createNote 创建笔记
func (s *XiaohongshuService) createNote(ctx context.Context, content *NoteContent, imageIDs []string) (string, string, error) {
	// 构建请求数据
	noteData := map[string]interface{}{
		"title":         content.Title,
		"content":       content.Content,
		"image_ids":     imageIDs,
		"tags":          content.Tags,
		"location":      content.Location,
		"is_private":    content.IsPrivate,
		"allow_comment": content.AllowComment,
		"allow_share":   content.AllowShare,
	}

	jsonData, err := json.Marshal(noteData)
	if err != nil {
		return "", "", fmt.Errorf("failed to marshal note data: %w", err)
	}

	// 创建请求
	req, err := http.NewRequestWithContext(ctx, "POST", s.baseURL+"/api/v1/note/create", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", "", fmt.Errorf("failed to create request: %w", err)
	}

	// 添加认证头
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.apiKey)

	// 发送请求
	resp, err := s.client.Do(req)
	if err != nil {
		return "", "", fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", "", fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", "", fmt.Errorf("API returned error: %s", string(body))
	}

	// 解析响应
	var result struct {
		Success bool   `json:"success"`
		NoteID  string `json:"note_id"`
		URL     string `json:"url"`
		Error   string `json:"error"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return "", "", fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if !result.Success {
		return "", "", fmt.Errorf("note creation failed: %s", result.Error)
	}

	return result.NoteID, result.URL, nil
}
