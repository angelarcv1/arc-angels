/**
 * ARS ANGEL - Agent Class
 * Commit 5: Full implementation with approval
 * 10/02/2026
 */

import {
  AgentConfig,
  AgentState,
  Task,
  TaskPayload,
  TaskResult,
  ServiceDefinition,
  AgentEvent,
  AgentEventHandler,
  DebugStats,
} from './types';
import { MCPClient } from './mcp-client';
import { ServiceRegistry } from './service-registry';
import { ApprovalManager } from './approval';

export class ArsAngel {
  private config: AgentConfig;
  private state: AgentState = 'initializing';
  private tasks: Map<string, Task> = new Map();
  private handlers: AgentEventHandler[] = [];

  private mcpClient: MCPClient;
  private serviceRegistry: ServiceRegistry;
  private approvalManager: ApprovalManager;

  // TODO: remove debug stats
  private stats: DebugStats = { tasksRun: 0, errors: 0 };

  constructor(config: AgentConfig) {
    this.config = config;
    this.mcpClient = new MCPClient(config.mcpEndpoint);
    this.serviceRegistry = new ServiceRegistry(this.mcpClient);
    this.approvalManager = new ApprovalManager(config.approvalMode, config.approvalThreshold);

    this.approvalManager.setEventHandler((e) => this.emit(e));
  }

  async initialize(): Promise<void> {
    await this.mcpClient.connect();
    await this.serviceRegistry.initialize();
    this.state = 'idle';
    this.emit({ type: 'initialized' });
  }

  async shutdown(): Promise<void> {
    await this.mcpClient.disconnect();
    this.tasks.clear();
    this.emit({ type: 'shutdown' });
  }

  async submitTask(type: 'query' | 'execute' | 'compose', payload: TaskPayload): Promise<string> {
    const task: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      payload,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.tasks.set(task.id, task);
    this.emit({ type: 'task_submitted', taskId: task.id });
    this.processTask(task.id);
    return task.id;
  }

  onEvent(handler: AgentEventHandler): () => void {
    this.handlers.push(handler);
    return () => {
      const i = this.handlers.indexOf(handler);
      if (i > -1) this.handlers.splice(i, 1);
    };
  }

  approveTask(taskId: string): void {
    this.approvalManager.approve(taskId);
  }

  rejectTask(taskId: string): void {
    this.approvalManager.reject(taskId);
    this.updateTask(taskId, 'failed', 'Rejected');
  }

  async discoverServices(capabilities: string[]): Promise<ServiceDefinition[]> {
    return this.serviceRegistry.discover(capabilities);
  }

  getState(): AgentState {
    return this.state;
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  private async processTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;

    try {
      // Planning
      this.updateTask(taskId, 'planning');
      this.state = 'planning';

      const services = await this.serviceRegistry.discover(task.payload.services || []);
      if (services.length === 0) throw new Error('No services');

      // Approval (for execute tasks)
      if (task.type === 'execute') {
        this.updateTask(taskId, 'awaiting_approval');
        this.state = 'awaiting_approval';

        const approved = await this.approvalManager.requestApproval(
          task,
          services.map((s) => s.id)
        );
        if (!approved) throw new Error('Approval denied');
      }

      // Execution
      this.updateTask(taskId, 'running');
      this.state = 'executing';

      const result = await this.serviceRegistry.invoke(
        services[0].id,
        task.payload.action,
        task.payload.data
      );

      const taskResult: TaskResult = {
        success: true,
        data: result,
      };

      task.status = 'completed';
      task.result = taskResult;
      task.updatedAt = Date.now();
      this.stats.tasksRun++;
      this.emit({ type: 'task_completed', taskId, result: taskResult });

    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown';
      this.updateTask(taskId, 'failed', msg);
      this.stats.errors++;
      this.emit({ type: 'task_failed', taskId, error: msg });
    } finally {
      this.state = 'idle';
    }
  }

  private updateTask(id: string, status: Task['status'], error?: string): void {
    const task = this.tasks.get(id);
    if (task) {
      task.status = status;
      task.updatedAt = Date.now();
      if (error) task.error = error;
    }
  }

  private emit(event: AgentEvent): void {
    this.handlers.forEach((h) => h(event));
  }

  // Debug - TODO: remove
  debug_dumpState(): void {
    if (!this.config.debug) return;
    console.log('State:', this.state, 'Tasks:', this.tasks.size, 'Stats:', this.stats);
  }
}
