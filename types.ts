/**
 * ARS ANGEL - Types
 * Commit 5: Added approval types
 * 10/02/2026
 */

// Agent config
export interface AgentConfig {
  name: string;
  version: string;
  description?: string;
  mcpEndpoint: string;
  approvalMode: ApprovalMode;
  approvalThreshold?: ApprovalThreshold;
  debug?: boolean; // TODO: remove for v1
}

export type ApprovalMode = 'auto' | 'manual' | 'threshold';

export interface ApprovalThreshold {
  trustedServices: string[];
}

// Agent state
export type AgentState =
  | 'initializing'
  | 'idle'
  | 'planning'
  | 'executing'
  | 'awaiting_approval'
  | 'error';

// Task types
export interface Task {
  id: string;
  type: TaskType;
  payload: TaskPayload;
  status: TaskStatus;
  result?: TaskResult;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export type TaskType = 'query' | 'execute' | 'compose';
export type TaskStatus = 'pending' | 'planning' | 'awaiting_approval' | 'running' | 'completed' | 'failed';

export interface TaskPayload {
  action: string;
  data: Record<string, unknown>;
  services?: string[];
}

export interface TaskResult {
  success: boolean;
  data: unknown;
}

// MCP types
export interface MCPRequest {
  id: string;
  method: string;
  params: Record<string, unknown>;
  timestamp: number;
}

export interface MCPResponse {
  id: string;
  result?: unknown;
  error?: MCPError;
  timestamp: number;
}

export interface MCPError {
  code: number;
  message: string;
}

export interface MCPConnection {
  endpoint: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
}

// Service types
export interface ServiceDefinition {
  id: string;
  name: string;
  endpoint: string;
  capabilities: string[];
  trustScore: number;
}

// Approval types
export interface ApprovalRequest {
  taskId: string;
  action: string;
  services: string[];
  expiresAt: number;
}

// Events
export type AgentEvent =
  | { type: 'initialized' }
  | { type: 'task_submitted'; taskId: string }
  | { type: 'task_completed'; taskId: string; result: TaskResult }
  | { type: 'task_failed'; taskId: string; error: string }
  | { type: 'approval_required'; request: ApprovalRequest }
  | { type: 'shutdown' };

export type AgentEventHandler = (event: AgentEvent) => void;

// Debug - TODO: remove
export interface DebugStats {
  tasksRun: number;
  errors: number;
}
