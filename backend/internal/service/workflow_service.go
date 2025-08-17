package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"go.uber.org/zap"
)

// WorkflowService 工作流服务
type WorkflowService struct {
	logger    *zap.Logger
	aiBaseURL string
	client    *http.Client
}

// WorkflowTemplate 工作流模板
type WorkflowTemplate struct {
	ID            string                 `json:"id"`
	Name          string                 `json:"name"`
	Description   string                 `json:"description"`
	Category      string                 `json:"category"`
	Difficulty    string                 `json:"difficulty"`
	EstimatedTime string                 `json:"estimated_time"`
	NodeCount     int                    `json:"node_count"`
	Version       string                 `json:"version"`
	Metadata      map[string]interface{} `json:"metadata,omitempty"`
}

// WorkflowDefinition 工作流定义
type WorkflowDefinition struct {
	ID          string                   `json:"id"`
	Name        string                   `json:"name"`
	Description string                   `json:"description"`
	Version     string                   `json:"version"`
	Nodes       []WorkflowNode           `json:"nodes"`
	Edges       []WorkflowEdge           `json:"edges"`
	Variables   map[string]interface{}   `json:"variables,omitempty"`
	Metadata    map[string]interface{}   `json:"metadata,omitempty"`
	CreatedAt   *time.Time               `json:"created_at,omitempty"`
	UpdatedAt   *time.Time               `json:"updated_at,omitempty"`
}

// WorkflowNode 工作流节点
type WorkflowNode struct {
	ID          string                 `json:"id"`
	Type        string                 `json:"type"`
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	Config      map[string]interface{} `json:"config"`
	Inputs      []string               `json:"inputs,omitempty"`
	Outputs     []string               `json:"outputs,omitempty"`
	Position    map[string]int         `json:"position,omitempty"`
	Status      string                 `json:"status,omitempty"`
}

// WorkflowEdge 工作流连接
type WorkflowEdge struct {
	From string `json:"from"`
	To   string `json:"to"`
}

// WorkflowExecution 工作流执行
type WorkflowExecution struct {
	ID           string                 `json:"id"`
	WorkflowID   string                 `json:"workflow_id"`
	Status       string                 `json:"status"`
	CurrentNode  string                 `json:"current_node,omitempty"`
	InputData    map[string]interface{} `json:"input_data"`
	OutputData   map[string]interface{} `json:"output_data,omitempty"`
	StartTime    *time.Time             `json:"start_time,omitempty"`
	EndTime      *time.Time             `json:"end_time,omitempty"`
	Error        string                 `json:"error,omitempty"`
	ExecutionLog []ExecutionLogEntry    `json:"execution_log,omitempty"`
}

// ExecutionLogEntry 执行日志条目
type ExecutionLogEntry struct {
	NodeID    string                 `json:"node_id"`
	NodeName  string                 `json:"node_name"`
	Status    string                 `json:"status"`
	Result    map[string]interface{} `json:"result,omitempty"`
	Error     string                 `json:"error,omitempty"`
	Timestamp string                 `json:"timestamp"`
}

// CreateWorkflowRequest 创建工作流请求
type CreateWorkflowRequest struct {
	Name        string                   `json:"name" binding:"required"`
	Description string                   `json:"description" binding:"required"`
	Nodes       []WorkflowNode           `json:"nodes" binding:"required"`
	Edges       []WorkflowEdge           `json:"edges" binding:"required"`
	Variables   map[string]interface{}   `json:"variables,omitempty"`
	Metadata    map[string]interface{}   `json:"metadata,omitempty"`
}

// ExecuteWorkflowRequest 执行工作流请求
type ExecuteWorkflowRequest struct {
	WorkflowID string                 `json:"workflow_id" binding:"required"`
	InputData  map[string]interface{} `json:"input_data" binding:"required"`
}

// WorkflowResponse 工作流响应
type WorkflowResponse struct {
	Success bool                   `json:"success"`
	Data    map[string]interface{} `json:"data,omitempty"`
	Error   string                 `json:"error,omitempty"`
}

// NewWorkflowService 创建工作流服务实例
func NewWorkflowService(logger *zap.Logger, aiBaseURL string) *WorkflowService {
	return &WorkflowService{
		logger:    logger,
		aiBaseURL: aiBaseURL,
		client: &http.Client{
			Timeout: 10 * time.Minute, // 工作流执行可能需要较长时间
		},
	}
}

// GetWorkflowTemplates 获取工作流模板列表
func (s *WorkflowService) GetWorkflowTemplates(ctx context.Context) ([]*WorkflowTemplate, error) {
	s.logger.Info("Getting workflow templates")

	resp, err := s.callAIService(ctx, "GET", "/api/v1/workflow/templates", nil)
	if err != nil {
		return nil, err
	}

	var response WorkflowResponse
	if err := json.Unmarshal(resp, &response); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if !response.Success {
		return nil, fmt.Errorf("AI service error: %s", response.Error)
	}

	// 解析模板数据
	templatesData, ok := response.Data["templates"].([]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid templates data format")
	}

	var templates []*WorkflowTemplate
	for _, templateData := range templatesData {
		templateMap, ok := templateData.(map[string]interface{})
		if !ok {
			continue
		}

		template := &WorkflowTemplate{
			ID:            getString(templateMap, "id"),
			Name:          getString(templateMap, "name"),
			Description:   getString(templateMap, "description"),
			Category:      getString(templateMap, "category"),
			Difficulty:    getString(templateMap, "difficulty"),
			EstimatedTime: getString(templateMap, "estimated_time"),
			NodeCount:     getInt(templateMap, "node_count"),
			Version:       getString(templateMap, "version"),
		}

		templates = append(templates, template)
	}

	return templates, nil
}

// InstantiateTemplate 实例化工作流模板
func (s *WorkflowService) InstantiateTemplate(ctx context.Context, templateID string) (*WorkflowDefinition, error) {
	s.logger.Info("Instantiating workflow template", zap.String("template_id", templateID))

	endpoint := fmt.Sprintf("/api/v1/workflow/templates/%s/instantiate", templateID)
	resp, err := s.callAIService(ctx, "POST", endpoint, nil)
	if err != nil {
		return nil, err
	}

	var response WorkflowResponse
	if err := json.Unmarshal(resp, &response); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if !response.Success {
		return nil, fmt.Errorf("AI service error: %s", response.Error)
	}

	workflowID := getString(response.Data, "workflow_id")
	return s.GetWorkflow(ctx, workflowID)
}

// CreateWorkflow 创建自定义工作流
func (s *WorkflowService) CreateWorkflow(ctx context.Context, req *CreateWorkflowRequest) (*WorkflowDefinition, error) {
	s.logger.Info("Creating custom workflow", zap.String("name", req.Name))

	resp, err := s.callAIService(ctx, "POST", "/api/v1/workflow/create", req)
	if err != nil {
		return nil, err
	}

	var response WorkflowResponse
	if err := json.Unmarshal(resp, &response); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if !response.Success {
		return nil, fmt.Errorf("AI service error: %s", response.Error)
	}

	workflowID := getString(response.Data, "workflow_id")
	return s.GetWorkflow(ctx, workflowID)
}

// ExecuteWorkflow 执行工作流
func (s *WorkflowService) ExecuteWorkflow(ctx context.Context, req *ExecuteWorkflowRequest) (string, error) {
	s.logger.Info("Executing workflow", zap.String("workflow_id", req.WorkflowID))

	resp, err := s.callAIService(ctx, "POST", "/api/v1/workflow/execute", req)
	if err != nil {
		return "", err
	}

	var response WorkflowResponse
	if err := json.Unmarshal(resp, &response); err != nil {
		return "", fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if !response.Success {
		return "", fmt.Errorf("AI service error: %s", response.Error)
	}

	return getString(response.Data, "execution_id"), nil
}

// GetExecutionStatus 获取执行状态
func (s *WorkflowService) GetExecutionStatus(ctx context.Context, executionID string) (*WorkflowExecution, error) {
	s.logger.Info("Getting execution status", zap.String("execution_id", executionID))

	endpoint := fmt.Sprintf("/api/v1/workflow/execution/%s/status", executionID)
	resp, err := s.callAIService(ctx, "GET", endpoint, nil)
	if err != nil {
		return nil, err
	}

	var response WorkflowResponse
	if err := json.Unmarshal(resp, &response); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if !response.Success {
		return nil, fmt.Errorf("AI service error: %s", response.Error)
	}

	// 解析执行数据
	execution := &WorkflowExecution{
		ID:          getString(response.Data, "execution_id"),
		WorkflowID:  getString(response.Data, "workflow_id"),
		Status:      getString(response.Data, "status"),
		CurrentNode: getString(response.Data, "current_node"),
		Error:       getString(response.Data, "error"),
	}

	// 解析时间
	if startTimeStr := getString(response.Data, "start_time"); startTimeStr != "" {
		if startTime, err := time.Parse(time.RFC3339, startTimeStr); err == nil {
			execution.StartTime = &startTime
		}
	}

	if endTimeStr := getString(response.Data, "end_time"); endTimeStr != "" {
		if endTime, err := time.Parse(time.RFC3339, endTimeStr); err == nil {
			execution.EndTime = &endTime
		}
	}

	// 解析输入输出数据
	if inputData, ok := response.Data["input_data"].(map[string]interface{}); ok {
		execution.InputData = inputData
	}

	if outputData, ok := response.Data["output_data"].(map[string]interface{}); ok {
		execution.OutputData = outputData
	}

	// 解析执行日志
	if logData, ok := response.Data["execution_log"].([]interface{}); ok {
		for _, logEntry := range logData {
			if logMap, ok := logEntry.(map[string]interface{}); ok {
				entry := ExecutionLogEntry{
					NodeID:    getString(logMap, "node_id"),
					NodeName:  getString(logMap, "node_name"),
					Status:    getString(logMap, "status"),
					Error:     getString(logMap, "error"),
					Timestamp: getString(logMap, "timestamp"),
				}

				if result, ok := logMap["result"].(map[string]interface{}); ok {
					entry.Result = result
				}

				execution.ExecutionLog = append(execution.ExecutionLog, entry)
			}
		}
	}

	return execution, nil
}

// CancelExecution 取消执行
func (s *WorkflowService) CancelExecution(ctx context.Context, executionID string) error {
	s.logger.Info("Cancelling execution", zap.String("execution_id", executionID))

	endpoint := fmt.Sprintf("/api/v1/workflow/execution/%s/cancel", executionID)
	resp, err := s.callAIService(ctx, "POST", endpoint, nil)
	if err != nil {
		return err
	}

	var response WorkflowResponse
	if err := json.Unmarshal(resp, &response); err != nil {
		return fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if !response.Success {
		return fmt.Errorf("AI service error: %s", response.Error)
	}

	return nil
}

// GetWorkflow 获取工作流详情
func (s *WorkflowService) GetWorkflow(ctx context.Context, workflowID string) (*WorkflowDefinition, error) {
	s.logger.Info("Getting workflow", zap.String("workflow_id", workflowID))

	endpoint := fmt.Sprintf("/api/v1/workflow/%s", workflowID)
	resp, err := s.callAIService(ctx, "GET", endpoint, nil)
	if err != nil {
		return nil, err
	}

	var response WorkflowResponse
	if err := json.Unmarshal(resp, &response); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if !response.Success {
		return nil, fmt.Errorf("AI service error: %s", response.Error)
	}

	// 解析工作流数据
	workflow := &WorkflowDefinition{
		ID:          getString(response.Data, "id"),
		Name:        getString(response.Data, "name"),
		Description: getString(response.Data, "description"),
		Version:     getString(response.Data, "version"),
	}

	// 解析时间
	if createdAtStr := getString(response.Data, "created_at"); createdAtStr != "" {
		if createdAt, err := time.Parse(time.RFC3339, createdAtStr); err == nil {
			workflow.CreatedAt = &createdAt
		}
	}

	if updatedAtStr := getString(response.Data, "updated_at"); updatedAtStr != "" {
		if updatedAt, err := time.Parse(time.RFC3339, updatedAtStr); err == nil {
			workflow.UpdatedAt = &updatedAt
		}
	}

	// 解析节点
	if nodesData, ok := response.Data["nodes"].([]interface{}); ok {
		for _, nodeData := range nodesData {
			if nodeMap, ok := nodeData.(map[string]interface{}); ok {
				node := WorkflowNode{
					ID:          getString(nodeMap, "id"),
					Type:        getString(nodeMap, "type"),
					Name:        getString(nodeMap, "name"),
					Description: getString(nodeMap, "description"),
					Status:      getString(nodeMap, "status"),
				}

				if config, ok := nodeMap["config"].(map[string]interface{}); ok {
					node.Config = config
				}

				if inputs, ok := nodeMap["inputs"].([]interface{}); ok {
					for _, input := range inputs {
						if inputStr, ok := input.(string); ok {
							node.Inputs = append(node.Inputs, inputStr)
						}
					}
				}

				if outputs, ok := nodeMap["outputs"].([]interface{}); ok {
					for _, output := range outputs {
						if outputStr, ok := output.(string); ok {
							node.Outputs = append(node.Outputs, outputStr)
						}
					}
				}

				if position, ok := nodeMap["position"].(map[string]interface{}); ok {
					node.Position = make(map[string]int)
					if x, ok := position["x"].(float64); ok {
						node.Position["x"] = int(x)
					}
					if y, ok := position["y"].(float64); ok {
						node.Position["y"] = int(y)
					}
				}

				workflow.Nodes = append(workflow.Nodes, node)
			}
		}
	}

	// 解析连接
	if edgesData, ok := response.Data["edges"].([]interface{}); ok {
		for _, edgeData := range edgesData {
			if edgeMap, ok := edgeData.(map[string]interface{}); ok {
				edge := WorkflowEdge{
					From: getString(edgeMap, "from"),
					To:   getString(edgeMap, "to"),
				}
				workflow.Edges = append(workflow.Edges, edge)
			}
		}
	}

	// 解析变量和元数据
	if variables, ok := response.Data["variables"].(map[string]interface{}); ok {
		workflow.Variables = variables
	}

	if metadata, ok := response.Data["metadata"].(map[string]interface{}); ok {
		workflow.Metadata = metadata
	}

	return workflow, nil
}

// ListWorkflows 列出工作流
func (s *WorkflowService) ListWorkflows(ctx context.Context) ([]*WorkflowDefinition, error) {
	s.logger.Info("Listing workflows")

	resp, err := s.callAIService(ctx, "GET", "/api/v1/workflow/list", nil)
	if err != nil {
		return nil, err
	}

	var response WorkflowResponse
	if err := json.Unmarshal(resp, &response); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if !response.Success {
		return nil, fmt.Errorf("AI service error: %s", response.Error)
	}

	// 解析工作流列表
	workflowsData, ok := response.Data["workflows"].([]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid workflows data format")
	}

	var workflows []*WorkflowDefinition
	for _, workflowData := range workflowsData {
		if workflowMap, ok := workflowData.(map[string]interface{}); ok {
			workflow := &WorkflowDefinition{
				ID:          getString(workflowMap, "id"),
				Name:        getString(workflowMap, "name"),
				Description: getString(workflowMap, "description"),
				Version:     getString(workflowMap, "version"),
			}

			// 解析时间
			if createdAtStr := getString(workflowMap, "created_at"); createdAtStr != "" {
				if createdAt, err := time.Parse(time.RFC3339, createdAtStr); err == nil {
					workflow.CreatedAt = &createdAt
				}
			}

			if updatedAtStr := getString(workflowMap, "updated_at"); updatedAtStr != "" {
				if updatedAt, err := time.Parse(time.RFC3339, updatedAtStr); err == nil {
					workflow.UpdatedAt = &updatedAt
				}
			}

			if metadata, ok := workflowMap["metadata"].(map[string]interface{}); ok {
				workflow.Metadata = metadata
			}

			workflows = append(workflows, workflow)
		}
	}

	return workflows, nil
}

// DeleteWorkflow 删除工作流
func (s *WorkflowService) DeleteWorkflow(ctx context.Context, workflowID string) error {
	s.logger.Info("Deleting workflow", zap.String("workflow_id", workflowID))

	endpoint := fmt.Sprintf("/api/v1/workflow/%s", workflowID)
	resp, err := s.callAIService(ctx, "DELETE", endpoint, nil)
	if err != nil {
		return err
	}

	var response WorkflowResponse
	if err := json.Unmarshal(resp, &response); err != nil {
		return fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if !response.Success {
		return fmt.Errorf("AI service error: %s", response.Error)
	}

	return nil
}

// callAIService 调用AI服务的通用方法
func (s *WorkflowService) callAIService(ctx context.Context, method, endpoint string, data interface{}) ([]byte, error) {
	var body io.Reader
	if data != nil {
		jsonData, err := json.Marshal(data)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request: %w", err)
		}
		body = bytes.NewBuffer(jsonData)
	}

	req, err := http.NewRequestWithContext(ctx, method, s.aiBaseURL+endpoint, body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	if data != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call AI service: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("AI service returned error: %s", string(respBody))
	}

	return respBody, nil
}

// 辅助函数
func getString(data map[string]interface{}, key string) string {
	if value, ok := data[key].(string); ok {
		return value
	}
	return ""
}

func getInt(data map[string]interface{}, key string) int {
	if value, ok := data[key].(float64); ok {
		return int(value)
	}
	return 0
}
