/**
 * ARS ANGEL - Agent Class
 * Commit 3: MCP integration
 */

import { AgentConfig, AgentState, Task, TaskPayload, DebugStats } from './types';
import { MCPClient } from './mcp-client';

export class ArsAngel {
  private config: AgentConfig;
  private state: AgentState = 'initializing';
  private tasks: Map<string, Task> = new Map();
  private mcpClient: MCPClient;

  // Debug stats - remove for prod
  private stats: DebugStats = { mcpCalls: 0, tasksRun: 0, errors: 0 };

  constructor(config: AgentConfig) {
    this.config = config;
    this.mcpClient = new MCPClient(config.mcpEndpoint);
    this.log('Agent created');
  }

  async initialize(): Promise<void> {
    this.log('Initializing...');
    await this.mcpClient.connect();
    this.state = 'idle';
    this.log('Ready');
  }

  async shutdown(): Promise<void> {
    this.log('Shutting down...');
    await this.mcpClient.disconnect();
    this.tasks.clear();
  }

  async submitTask(type: 'query' | 'execute', payload: TaskPayload): Promise<string> {
    const task: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      payload,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.tasks.set(task.id, task);
    this.log(`Task submitted: ${task.id}`);

    // Process async
    this.processTask(task.id);

    return task.id;
  }

  private async processTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;

    try {
      task.status = 'running';
      this.state = 'executing';

      const result = await this.mcpClient.invoke(task.payload.action, task.payload.data);

      task.status = 'completed';
      this.stats.tasksRun++;
      this.log(`Task completed: ${taskId}`);

    } catch (error) {
      task.status = 'failed';
      this.stats.errors++;
      console.error(`Task failed: ${taskId}`, error);
    } finally {
      task.updatedAt = Date.now();
      this.state = 'idle';
    }
  }

  getState(): AgentState {
    return this.state;
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  getMcpStatus(): string {
    return this.mcpClient.getStatus();
  }

  // Debug methods
  debug_dumpState(): void {
    if (!this.config.debug) return;
    console.log('\n=== DEBUG STATE ===');
    console.log('Config:', this.config);
    console.log('State:', this.state);
    console.log('Tasks:', this.tasks.size);
    console.log('Stats:', this.stats);
    console.log('===================\n');
  }

  debug_listTasks(): void {
    if (!this.config.debug) return;
    console.log('Tasks:', Array.from(this.tasks.values()));
  }

  debug_mcpStats(): void {
    if (!this.config.debug) return;
    console.log('MCP calls:', this.mcpClient.debug_getCallCount());
  }

  private log(message: string): void {
    if (this.config.debug) {
      console.log(`[${this.config.name}] ${message}`);
    }
  }
}
