"""
预定义AI工作流模板
"""
from datetime import datetime
from .workflow_engine import WorkflowDefinition, WorkflowNode, NodeType, WorkflowStatus

class WorkflowTemplates:
    """工作流模板管理器"""
    
    @staticmethod
    def create_blog_post_workflow() -> WorkflowDefinition:
        """创建博客文章生成工作流"""
        nodes = [
            # 输入节点
            WorkflowNode(
                id="input_topic",
                type=NodeType.INPUT,
                name="输入主题",
                description="输入博客文章主题",
                config={
                    "input_fields": ["topic", "target_audience", "tone"]
                },
                position={"x": 100, "y": 100}
            ),
            
            # 文章大纲生成
            WorkflowNode(
                id="generate_outline",
                type=NodeType.TEXT_GENERATION,
                name="生成文章大纲",
                description="根据主题生成文章大纲",
                config={
                    "prompt": "为主题'{topic}'生成一个详细的博客文章大纲，目标受众是{target_audience}，语调要{tone}。",
                    "max_length": 300,
                    "temperature": 0.7
                },
                position={"x": 300, "y": 100}
            ),
            
            # 文章内容生成
            WorkflowNode(
                id="generate_content",
                type=NodeType.TEXT_GENERATION,
                name="生成文章内容",
                description="根据大纲生成完整文章",
                config={
                    "prompt": "根据以下大纲写一篇完整的博客文章：{text}",
                    "max_length": 2000,
                    "temperature": 0.8
                },
                position={"x": 500, "y": 100}
            ),
            
            # 配图生成
            WorkflowNode(
                id="generate_image",
                type=NodeType.IMAGE_GENERATION,
                name="生成配图",
                description="为文章生成配图",
                config={
                    "prompt": "为博客文章'{topic}'生成一张配图",
                    "style": "professional",
                    "width": 800,
                    "height": 600
                },
                position={"x": 700, "y": 100}
            ),
            
            # 内容分析
            WorkflowNode(
                id="analyze_content",
                type=NodeType.CONTENT_ANALYSIS,
                name="内容分析",
                description="分析文章内容",
                config={
                    "analysis_type": "comprehensive"
                },
                position={"x": 500, "y": 300}
            ),
            
            # 内容优化
            WorkflowNode(
                id="optimize_content",
                type=NodeType.CONTENT_OPTIMIZATION,
                name="内容优化",
                description="优化文章内容",
                config={
                    "platform": "blog",
                    "optimization_level": "high"
                },
                position={"x": 700, "y": 300}
            ),
            
            # 输出节点
            WorkflowNode(
                id="output_result",
                type=NodeType.OUTPUT,
                name="输出结果",
                description="输出最终的博客文章",
                config={
                    "output_fields": ["optimized_content", "image_url", "suggested_tags"]
                },
                position={"x": 900, "y": 200}
            )
        ]
        
        edges = [
            {"from": "input_topic", "to": "generate_outline"},
            {"from": "generate_outline", "to": "generate_content"},
            {"from": "input_topic", "to": "generate_image"},
            {"from": "generate_content", "to": "analyze_content"},
            {"from": "analyze_content", "to": "optimize_content"},
            {"from": "optimize_content", "to": "output_result"},
            {"from": "generate_image", "to": "output_result"}
        ]
        
        return WorkflowDefinition(
            id="blog_post_workflow",
            name="博客文章生成工作流",
            description="自动生成博客文章，包括内容、配图和优化建议",
            version="1.0",
            nodes=nodes,
            edges=edges,
            metadata={
                "category": "content_creation",
                "difficulty": "beginner",
                "estimated_time": "5-10分钟"
            }
        )
    
    @staticmethod
    def create_social_media_workflow() -> WorkflowDefinition:
        """创建社交媒体内容生成工作流"""
        nodes = [
            # 输入节点
            WorkflowNode(
                id="input_idea",
                type=NodeType.INPUT,
                name="输入创意",
                description="输入社交媒体内容创意",
                config={
                    "input_fields": ["idea", "platform", "style"]
                },
                position={"x": 100, "y": 100}
            ),
            
            # 文案生成
            WorkflowNode(
                id="generate_copy",
                type=NodeType.TEXT_GENERATION,
                name="生成文案",
                description="生成社交媒体文案",
                config={
                    "prompt": "为{platform}平台创作一个关于'{idea}'的{style}风格文案",
                    "max_length": 500,
                    "temperature": 0.9
                },
                position={"x": 300, "y": 100}
            ),
            
            # 配图生成
            WorkflowNode(
                id="generate_visual",
                type=NodeType.IMAGE_GENERATION,
                name="生成配图",
                description="生成社交媒体配图",
                config={
                    "style": "social_media",
                    "width": 1080,
                    "height": 1080
                },
                position={"x": 300, "y": 300}
            ),
            
            # 背景音乐生成（可选）
            WorkflowNode(
                id="generate_music",
                type=NodeType.MUSIC_GENERATION,
                name="生成背景音乐",
                description="生成背景音乐",
                config={
                    "duration": 15,
                    "style": "upbeat"
                },
                position={"x": 300, "y": 500}
            ),
            
            # 内容分析
            WorkflowNode(
                id="analyze_content",
                type=NodeType.CONTENT_ANALYSIS,
                name="内容分析",
                description="分析内容特征",
                config={},
                position={"x": 500, "y": 200}
            ),
            
            # 平台优化
            WorkflowNode(
                id="optimize_for_platform",
                type=NodeType.CONTENT_OPTIMIZATION,
                name="平台优化",
                description="针对特定平台优化内容",
                config={
                    "optimization_level": "platform_specific"
                },
                position={"x": 700, "y": 200}
            ),
            
            # 发布到平台
            WorkflowNode(
                id="publish_content",
                type=NodeType.PLATFORM_PUBLISH,
                name="发布内容",
                description="发布到社交媒体平台",
                config={
                    "auto_publish": False
                },
                position={"x": 900, "y": 200}
            )
        ]
        
        edges = [
            {"from": "input_idea", "to": "generate_copy"},
            {"from": "input_idea", "to": "generate_visual"},
            {"from": "input_idea", "to": "generate_music"},
            {"from": "generate_copy", "to": "analyze_content"},
            {"from": "generate_visual", "to": "analyze_content"},
            {"from": "analyze_content", "to": "optimize_for_platform"},
            {"from": "optimize_for_platform", "to": "publish_content"},
            {"from": "generate_music", "to": "publish_content"}
        ]
        
        return WorkflowDefinition(
            id="social_media_workflow",
            name="社交媒体内容工作流",
            description="生成完整的社交媒体内容，包括文案、配图、音乐和发布",
            version="1.0",
            nodes=nodes,
            edges=edges,
            metadata={
                "category": "social_media",
                "difficulty": "intermediate",
                "estimated_time": "3-8分钟"
            }
        )
    
    @staticmethod
    def create_story_creation_workflow() -> WorkflowDefinition:
        """创建故事创作工作流"""
        nodes = [
            # 输入节点
            WorkflowNode(
                id="input_story_concept",
                type=NodeType.INPUT,
                name="故事概念输入",
                description="输入故事的基本概念",
                config={
                    "input_fields": ["genre", "main_character", "setting", "conflict"]
                },
                position={"x": 100, "y": 100}
            ),
            
            # 角色发展
            WorkflowNode(
                id="develop_characters",
                type=NodeType.TEXT_GENERATION,
                name="角色发展",
                description="发展故事角色",
                config={
                    "prompt": "为{genre}类型的故事发展主角{main_character}的详细背景和性格特征",
                    "max_length": 800,
                    "temperature": 0.8
                },
                position={"x": 300, "y": 50}
            ),
            
            # 情节大纲
            WorkflowNode(
                id="create_plot_outline",
                type=NodeType.TEXT_GENERATION,
                name="创建情节大纲",
                description="创建故事情节大纲",
                config={
                    "prompt": "为设定在{setting}的{genre}故事创建详细情节大纲，主要冲突是{conflict}",
                    "max_length": 1000,
                    "temperature": 0.7
                },
                position={"x": 300, "y": 150}
            ),
            
            # 故事写作
            WorkflowNode(
                id="write_story",
                type=NodeType.TEXT_GENERATION,
                name="故事写作",
                description="写作完整故事",
                config={
                    "prompt": "根据角色设定：{text}和情节大纲写一个完整的短篇故事",
                    "max_length": 3000,
                    "temperature": 0.9
                },
                position={"x": 500, "y": 100}
            ),
            
            # 场景插图
            WorkflowNode(
                id="create_illustrations",
                type=NodeType.IMAGE_GENERATION,
                name="创建插图",
                description="为故事创建插图",
                config={
                    "style": "illustration",
                    "width": 768,
                    "height": 1024
                },
                position={"x": 700, "y": 50}
            ),
            
            # 背景音效
            WorkflowNode(
                id="create_soundtrack",
                type=NodeType.MUSIC_GENERATION,
                name="创建配乐",
                description="为故事创建背景音乐",
                config={
                    "duration": 120,
                    "style": "cinematic"
                },
                position={"x": 700, "y": 150}
            ),
            
            # 故事分析
            WorkflowNode(
                id="analyze_story",
                type=NodeType.CONTENT_ANALYSIS,
                name="故事分析",
                description="分析故事的主题和情感",
                config={
                    "analysis_type": "literary"
                },
                position={"x": 500, "y": 300}
            ),
            
            # 输出整合
            WorkflowNode(
                id="compile_story_package",
                type=NodeType.OUTPUT,
                name="整合故事包",
                description="整合完整的故事包",
                config={
                    "output_fields": ["story_text", "illustrations", "soundtrack", "analysis"]
                },
                position={"x": 900, "y": 150}
            )
        ]
        
        edges = [
            {"from": "input_story_concept", "to": "develop_characters"},
            {"from": "input_story_concept", "to": "create_plot_outline"},
            {"from": "develop_characters", "to": "write_story"},
            {"from": "create_plot_outline", "to": "write_story"},
            {"from": "write_story", "to": "create_illustrations"},
            {"from": "write_story", "to": "create_soundtrack"},
            {"from": "write_story", "to": "analyze_story"},
            {"from": "create_illustrations", "to": "compile_story_package"},
            {"from": "create_soundtrack", "to": "compile_story_package"},
            {"from": "analyze_story", "to": "compile_story_package"}
        ]
        
        return WorkflowDefinition(
            id="story_creation_workflow",
            name="故事创作工作流",
            description="完整的故事创作流程，包括角色发展、情节创作、插图和配乐",
            version="1.0",
            nodes=nodes,
            edges=edges,
            metadata={
                "category": "creative_writing",
                "difficulty": "advanced",
                "estimated_time": "10-20分钟"
            }
        )
    
    @staticmethod
    def create_product_marketing_workflow() -> WorkflowDefinition:
        """创建产品营销内容工作流"""
        nodes = [
            # 产品信息输入
            WorkflowNode(
                id="input_product_info",
                type=NodeType.INPUT,
                name="产品信息输入",
                description="输入产品基本信息",
                config={
                    "input_fields": ["product_name", "features", "target_market", "unique_selling_points"]
                },
                position={"x": 100, "y": 100}
            ),
            
            # 市场分析
            WorkflowNode(
                id="market_analysis",
                type=NodeType.TEXT_GENERATION,
                name="市场分析",
                description="分析目标市场",
                config={
                    "prompt": "为产品{product_name}分析{target_market}市场，重点关注{unique_selling_points}",
                    "max_length": 600,
                    "temperature": 0.6
                },
                position={"x": 300, "y": 50}
            ),
            
            # 营销文案生成
            WorkflowNode(
                id="generate_marketing_copy",
                type=NodeType.TEXT_GENERATION,
                name="生成营销文案",
                description="生成产品营销文案",
                config={
                    "prompt": "为{product_name}写一个吸引{target_market}的营销文案，突出{features}和{unique_selling_points}",
                    "max_length": 800,
                    "temperature": 0.8
                },
                position={"x": 300, "y": 150}
            ),
            
            # 产品展示图
            WorkflowNode(
                id="create_product_visuals",
                type=NodeType.IMAGE_GENERATION,
                name="创建产品视觉",
                description="创建产品展示图",
                config={
                    "style": "product_photography",
                    "width": 1200,
                    "height": 800
                },
                position={"x": 500, "y": 50}
            ),
            
            # 广告音乐
            WorkflowNode(
                id="create_ad_music",
                type=NodeType.MUSIC_GENERATION,
                name="创建广告音乐",
                description="创建产品广告音乐",
                config={
                    "duration": 30,
                    "style": "commercial"
                },
                position={"x": 500, "y": 150}
            ),
            
            # 内容优化
            WorkflowNode(
                id="optimize_marketing_content",
                type=NodeType.CONTENT_OPTIMIZATION,
                name="优化营销内容",
                description="优化营销内容",
                config={
                    "platform": "marketing",
                    "optimization_level": "conversion_focused"
                },
                position={"x": 700, "y": 100}
            ),
            
            # 多平台发布
            WorkflowNode(
                id="multi_platform_publish",
                type=NodeType.PLATFORM_PUBLISH,
                name="多平台发布",
                description="发布到多个营销平台",
                config={
                    "platforms": ["xiaohongshu", "weibo", "douyin"],
                    "auto_publish": False
                },
                position={"x": 900, "y": 100}
            )
        ]
        
        edges = [
            {"from": "input_product_info", "to": "market_analysis"},
            {"from": "input_product_info", "to": "generate_marketing_copy"},
            {"from": "input_product_info", "to": "create_product_visuals"},
            {"from": "generate_marketing_copy", "to": "create_ad_music"},
            {"from": "market_analysis", "to": "optimize_marketing_content"},
            {"from": "generate_marketing_copy", "to": "optimize_marketing_content"},
            {"from": "create_product_visuals", "to": "optimize_marketing_content"},
            {"from": "create_ad_music", "to": "optimize_marketing_content"},
            {"from": "optimize_marketing_content", "to": "multi_platform_publish"}
        ]
        
        return WorkflowDefinition(
            id="product_marketing_workflow",
            name="产品营销工作流",
            description="完整的产品营销内容生成和发布流程",
            version="1.0",
            nodes=nodes,
            edges=edges,
            metadata={
                "category": "marketing",
                "difficulty": "intermediate",
                "estimated_time": "8-15分钟"
            }
        )
    
    @staticmethod
    def get_all_templates() -> List[WorkflowDefinition]:
        """获取所有预定义模板"""
        return [
            WorkflowTemplates.create_blog_post_workflow(),
            WorkflowTemplates.create_social_media_workflow(),
            WorkflowTemplates.create_story_creation_workflow(),
            WorkflowTemplates.create_product_marketing_workflow()
        ]
