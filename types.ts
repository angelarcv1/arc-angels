/**
 * ARS ANGEL - Types
 * Commit 3: Added MCP types
 */

export interface AgentConfig {
  name: string;
  version: string;
  description?: string;
  mcpEndpoint: string;
  debug?: boolean;
}

export type AgentState =
  | 'initializing'
  | 'idle'
  | 'planning'
  | 'executing'
  | 'error';

export interface Task {
  id: string;
  type: TaskType;
  payload: TaskPayload;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
}

export type TaskType = 'query' | 'execute';
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface TaskPayload {
  action: string;
  data: Record<string, unknown>;
}

// MCP Protocol Types
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
  lastPing?: number;
}

// Debug types - will remove in prod
export interface DebugStats {
  mcpCalls: number;
  tasksRun: number;
  errors: number;
}
