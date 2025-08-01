/**
 * ARS ANGEL - Types
 * Commit 4: Added service types
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

// Task types
export interface Task {
  id: string;
  type: TaskType;
  payload: TaskPayload;
  status: TaskStatus;
  result?: unknown;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export type TaskType = 'query' | 'execute' | 'compose';
export type TaskStatus = 'pending' | 'planning' | 'running' | 'completed' | 'failed';

export interface TaskPayload {
  action: string;
  data: Record<string, unknown>;
  services?: string[];
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
  lastPing?: number;
}

// Service types (Ryzome)
export interface ServiceDefinition {
  id: string;
  name: string;
  endpoint: string;
  capabilities: string[];
  trustScore: number;
}

// Debug - remove later
export interface DebugStats {
  mcpCalls: number;
  tasksRun: number;
  errors: number;
}
