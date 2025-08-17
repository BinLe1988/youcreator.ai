package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"youcreator.ai/backend/internal/service"
)

// WorkflowHandler 工作流处理器
type WorkflowHandler struct {
	workflowService *service.WorkflowService
	logger          *zap.Logger
}

// NewWorkflowHandler 创建工作流处理器实例
func NewWorkflowHandler(workflowService *service.WorkflowService, logger *zap.Logger) *WorkflowHandler {
	return &WorkflowHandler{
		workflowService: workflowService,
		logger:          logger,
	}
}

// GetWorkflowTemplates 获取工作流模板
// @Summary 获取工作流模板列表
// @Description 获取所有可用的预定义工作流模板
// @Tags workflow
// @Produce json
// @Success 200 {array} service.WorkflowTemplate
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/workflow/templates [get]
func (h *WorkflowHandler) GetWorkflowTemplates(c *gin.Context) {
	templates, err := h.workflowService.GetWorkflowTemplates(c.Request.Context())
	if err != nil {
		h.logger.Error("Failed to get workflow templates", zap.Error(err))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to get templates",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"templates": templates,
		"total":     len(templates),
	})
}

// InstantiateTemplate 实例化工作流模板
// @Summary 实例化工作流模板
// @Description 根据模板ID创建工作流实例
// @Tags workflow
// @Param template_id path string true "模板ID"
// @Produce json
// @Success 200 {object} service.WorkflowDefinition
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/workflow/templates/{template_id}/instantiate [post]
func (h *WorkflowHandler) InstantiateTemplate(c *gin.Context) {
	templateID := c.Param("template_id")
	if templateID == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Missing template ID",
			Message: "Template ID is required",
		})
		return
	}

	workflow, err := h.workflowService.InstantiateTemplate(c.Request.Context(), templateID)
	if err != nil {
		h.logger.Error("Failed to instantiate template", zap.String("template_id", templateID), zap.Error(err))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to instantiate template",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"workflow": workflow,
		"message":  "Template instantiated successfully",
	})
}

// CreateWorkflow 创建自定义工作流
// @Summary 创建自定义工作流
// @Description 创建用户自定义的工作流
// @Tags workflow
// @Accept json
// @Produce json
// @Param request body service.CreateWorkflowRequest true "创建工作流请求"
// @Success 200 {object} service.WorkflowDefinition
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/workflow/create [post]
func (h *WorkflowHandler) CreateWorkflow(c *gin.Context) {
	var req service.CreateWorkflowRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Invalid request", zap.Error(err))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request format",
			Message: err.Error(),
		})
		return
	}

	// 验证必要字段
	if req.Name == "" || req.Description == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Missing required fields",
			Message: "Name and description are required",
		})
		return
	}

	if len(req.Nodes) == 0 {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid workflow",
			Message: "At least one node is required",
		})
		return
	}

	workflow, err := h.workflowService.CreateWorkflow(c.Request.Context(), &req)
	if err != nil {
		h.logger.Error("Failed to create workflow", zap.Error(err))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to create workflow",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"workflow": workflow,
		"message":  "Workflow created successfully",
	})
}

// ExecuteWorkflow 执行工作流
// @Summary 执行工作流
// @Description 启动工作流执行
// @Tags workflow
// @Accept json
// @Produce json
// @Param request body service.ExecuteWorkflowRequest true "执行工作流请求"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/workflow/execute [post]
func (h *WorkflowHandler) ExecuteWorkflow(c *gin.Context) {
	var req service.ExecuteWorkflowRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Invalid request", zap.Error(err))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request format",
			Message: err.Error(),
		})
		return
	}

	// 验证必要字段
	if req.WorkflowID == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Missing workflow ID",
			Message: "Workflow ID is required",
		})
		return
	}

	if req.InputData == nil {
		req.InputData = make(map[string]interface{})
	}

	executionID, err := h.workflowService.ExecuteWorkflow(c.Request.Context(), &req)
	if err != nil {
		h.logger.Error("Failed to execute workflow", zap.String("workflow_id", req.WorkflowID), zap.Error(err))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to execute workflow",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"execution_id": executionID,
		"status":       "started",
		"message":      "Workflow execution started",
	})
}

// GetExecutionStatus 获取执行状态
// @Summary 获取工作流执行状态
// @Description 获取工作流执行的当前状态和进度
// @Tags workflow
// @Param execution_id path string true "执行ID"
// @Produce json
// @Success 200 {object} service.WorkflowExecution
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/workflow/execution/{execution_id}/status [get]
func (h *WorkflowHandler) GetExecutionStatus(c *gin.Context) {
	executionID := c.Param("execution_id")
	if executionID == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Missing execution ID",
			Message: "Execution ID is required",
		})
		return
	}

	execution, err := h.workflowService.GetExecutionStatus(c.Request.Context(), executionID)
	if err != nil {
		h.logger.Error("Failed to get execution status", zap.String("execution_id", executionID), zap.Error(err))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to get execution status",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"execution": execution,
	})
}

// CancelExecution 取消执行
// @Summary 取消工作流执行
// @Description 取消正在运行的工作流执行
// @Tags workflow
// @Param execution_id path string true "执行ID"
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/workflow/execution/{execution_id}/cancel [post]
func (h *WorkflowHandler) CancelExecution(c *gin.Context) {
	executionID := c.Param("execution_id")
	if executionID == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Missing execution ID",
			Message: "Execution ID is required",
		})
		return
	}

	err := h.workflowService.CancelExecution(c.Request.Context(), executionID)
	if err != nil {
		h.logger.Error("Failed to cancel execution", zap.String("execution_id", executionID), zap.Error(err))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to cancel execution",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"execution_id": executionID,
		"message":      "Execution cancelled successfully",
	})
}

// GetWorkflow 获取工作流详情
// @Summary 获取工作流详情
// @Description 获取指定工作流的详细信息
// @Tags workflow
// @Param workflow_id path string true "工作流ID"
// @Produce json
// @Success 200 {object} service.WorkflowDefinition
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/workflow/{workflow_id} [get]
func (h *WorkflowHandler) GetWorkflow(c *gin.Context) {
	workflowID := c.Param("workflow_id")
	if workflowID == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Missing workflow ID",
			Message: "Workflow ID is required",
		})
		return
	}

	workflow, err := h.workflowService.GetWorkflow(c.Request.Context(), workflowID)
	if err != nil {
		h.logger.Error("Failed to get workflow", zap.String("workflow_id", workflowID), zap.Error(err))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to get workflow",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"workflow": workflow,
	})
}

// ListWorkflows 列出工作流
// @Summary 列出工作流
// @Description 获取用户的所有工作流列表
// @Tags workflow
// @Param page query int false "页码" default(1)
// @Param limit query int false "每页数量" default(10)
// @Produce json
// @Success 200 {array} service.WorkflowDefinition
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/workflow/list [get]
func (h *WorkflowHandler) ListWorkflows(c *gin.Context) {
	// 获取分页参数
	page := 1
	if p := c.Query("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
			page = parsed
		}
	}

	limit := 10
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	workflows, err := h.workflowService.ListWorkflows(c.Request.Context())
	if err != nil {
		h.logger.Error("Failed to list workflows", zap.Error(err))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to list workflows",
			Message: err.Error(),
		})
		return
	}

	// 简单分页处理
	total := len(workflows)
	start := (page - 1) * limit
	end := start + limit

	if start >= total {
		workflows = []*service.WorkflowDefinition{}
	} else {
		if end > total {
			end = total
		}
		workflows = workflows[start:end]
	}

	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"workflows": workflows,
		"total":     total,
		"page":      page,
		"limit":     limit,
	})
}

// DeleteWorkflow 删除工作流
// @Summary 删除工作流
// @Description 删除指定的工作流
// @Tags workflow
// @Param workflow_id path string true "工作流ID"
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/workflow/{workflow_id} [delete]
func (h *WorkflowHandler) DeleteWorkflow(c *gin.Context) {
	workflowID := c.Param("workflow_id")
	if workflowID == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Missing workflow ID",
			Message: "Workflow ID is required",
		})
		return
	}

	err := h.workflowService.DeleteWorkflow(c.Request.Context(), workflowID)
	if err != nil {
		h.logger.Error("Failed to delete workflow", zap.String("workflow_id", workflowID), zap.Error(err))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to delete workflow",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"workflow_id": workflowID,
		"message":     "Workflow deleted successfully",
	})
}

// GetWorkflowStats 获取工作流统计
// @Summary 获取工作流统计信息
// @Description 获取工作流的执行统计和性能数据
// @Tags workflow
// @Param workflow_id path string true "工作流ID"
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/workflow/{workflow_id}/stats [get]
func (h *WorkflowHandler) GetWorkflowStats(c *gin.Context) {
	workflowID := c.Param("workflow_id")
	if workflowID == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Missing workflow ID",
			Message: "Workflow ID is required",
		})
		return
	}

	// 这里应该从数据库获取统计数据
	// 暂时返回模拟数据
	stats := gin.H{
		"workflow_id":      workflowID,
		"total_executions": 0,
		"successful_runs":  0,
		"failed_runs":      0,
		"average_duration": 0,
		"success_rate":     0.0,
		"last_execution":   nil,
		"popular_inputs":   []string{},
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"stats":   stats,
	})
}

// GetNodeTypes 获取支持的节点类型
// @Summary 获取支持的节点类型
// @Description 获取工作流中支持的所有节点类型和配置
// @Tags workflow
// @Produce json
// @Success 200 {array} map[string]interface{}
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/workflow/node-types [get]
func (h *WorkflowHandler) GetNodeTypes(c *gin.Context) {
	// 定义支持的节点类型
	nodeTypes := []gin.H{
		{
			"type":        "input",
			"name":        "输入节点",
			"description": "接收用户输入数据",
			"category":    "input_output",
			"config_schema": gin.H{
				"input_fields": gin.H{
					"type":        "array",
					"description": "输入字段列表",
					"required":    true,
				},
			},
		},
		{
			"type":        "text_generation",
			"name":        "文本生成",
			"description": "使用AI生成文本内容",
			"category":    "ai_generation",
			"config_schema": gin.H{
				"prompt": gin.H{
					"type":        "string",
					"description": "生成提示词",
					"required":    true,
				},
				"max_length": gin.H{
					"type":        "integer",
					"description": "最大长度",
					"default":     500,
				},
				"temperature": gin.H{
					"type":        "number",
					"description": "生成温度",
					"default":     0.7,
				},
			},
		},
		{
			"type":        "image_generation",
			"name":        "图像生成",
			"description": "使用AI生成图像",
			"category":    "ai_generation",
			"config_schema": gin.H{
				"prompt": gin.H{
					"type":        "string",
					"description": "图像描述",
				},
				"style": gin.H{
					"type":        "string",
					"description": "图像风格",
					"default":     "realistic",
				},
				"width": gin.H{
					"type":        "integer",
					"description": "图像宽度",
					"default":     512,
				},
				"height": gin.H{
					"type":        "integer",
					"description": "图像高度",
					"default":     512,
				},
			},
		},
		{
			"type":        "music_generation",
			"name":        "音乐生成",
			"description": "使用AI生成音乐",
			"category":    "ai_generation",
			"config_schema": gin.H{
				"description": gin.H{
					"type":        "string",
					"description": "音乐描述",
				},
				"duration": gin.H{
					"type":        "integer",
					"description": "音乐时长(秒)",
					"default":     10,
				},
				"style": gin.H{
					"type":        "string",
					"description": "音乐风格",
					"default":     "ambient",
				},
			},
		},
		{
			"type":        "content_analysis",
			"name":        "内容分析",
			"description": "分析内容特征和属性",
			"category":    "processing",
			"config_schema": gin.H{
				"analysis_type": gin.H{
					"type":        "string",
					"description": "分析类型",
					"default":     "comprehensive",
				},
			},
		},
		{
			"type":        "content_optimization",
			"name":        "内容优化",
			"description": "优化内容格式和质量",
			"category":    "processing",
			"config_schema": gin.H{
				"platform": gin.H{
					"type":        "string",
					"description": "目标平台",
					"required":    true,
				},
				"optimization_level": gin.H{
					"type":        "string",
					"description": "优化级别",
					"default":     "standard",
				},
			},
		},
		{
			"type":        "platform_publish",
			"name":        "平台发布",
			"description": "发布内容到社交媒体平台",
			"category":    "integration",
			"config_schema": gin.H{
				"platform": gin.H{
					"type":        "string",
					"description": "发布平台",
					"required":    true,
				},
				"auto_publish": gin.H{
					"type":        "boolean",
					"description": "自动发布",
					"default":     false,
				},
			},
		},
		{
			"type":        "condition",
			"name":        "条件判断",
			"description": "根据条件选择执行路径",
			"category":    "control_flow",
			"config_schema": gin.H{
				"condition": gin.H{
					"type":        "string",
					"description": "判断条件",
					"required":    true,
				},
			},
		},
		{
			"type":        "output",
			"name":        "输出节点",
			"description": "输出最终结果",
			"category":    "input_output",
			"config_schema": gin.H{
				"output_fields": gin.H{
					"type":        "array",
					"description": "输出字段列表",
					"required":    true,
				},
			},
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"node_types": nodeTypes,
		"total":      len(nodeTypes),
	})
}
