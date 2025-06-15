/**
 * ARS ANGEL - Initial Types
 * Commit 1: Just getting started
 */

// Basic config - will expand later
export interface AgentConfig {
  name: string;
  version: string;
  debug?: boolean;
}

// Simple state
export type AgentState = 'idle' | 'running' | 'error';

// Task placeholder
export interface Task {
  id: string;
  type: string;
  data: any; // TODO: proper typing
}
