/**
 * ARS ANGEL - Agent Class
 * Commit 4: Service registry integration
 */

import { AgentConfig, AgentState, Task, TaskPayload, ServiceDefinition, DebugStats } from './types';
import { MCPClient } from './mcp-client';
import { ServiceRegistry } from './service-registry';

export class ArsAngel {
  private config: AgentConfig;
  private state: AgentState = 'initializing';
  private tasks: Map<string, Task> = new Map();
  private mcpClient: MCPClient;
  private serviceRegistry: ServiceRegistry;

  private stats: DebugStats = { mcpCalls: 0, tasksRun: 0, errors: 0 };

  constructor(config: AgentConfig) {
    this.config = config;
    this.mcpClient = new MCPClient(config.mcpEndpoint);
    this.serviceRegistry = new ServiceRegistry(this.mcpClient);
    this.log('Agent created');
  }

  async initialize(): Promise<void> {
    this.log('Initializing...');
    await this.mcpClient.connect();
    await this.serviceRegistry.initialize();
    this.state = 'idle';
    this.log('Ready');
  }

  async shutdown(): Promise<void> {
    this.log('Shutting down...');
    await this.mcpClient.disconnect();
    this.tasks.clear();
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
    this.log(`Task submitted: ${task.id}`);
    this.processTask(task.id);
    return task.id;
  }

  // Service discovery passthrough
  async discoverServices(capabilities: string[]): Promise<ServiceDefinition[]> {
    return this.serviceRegistry.discover(capabilities);
  }

  async invokeService(
    serviceId: string,
    action: string,
    params: Record<string, unknown>
  ): Promise<unknown> {
    return this.serviceRegistry.invoke(serviceId, action, params);
  }

  private async processTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;

    try {
      // Planning phase
      task.status = 'planning';
      this.state = 'planning';

      const services = await this.serviceRegistry.discover(task.payload.services || []);
      if (services.length === 0) {
        throw new Error('No matching services');
      }

      // Execution phase
      task.status = 'running';
      this.state = 'executing';

      const result = await this.serviceRegistry.invoke(
        services[0].id,
        task.payload.action,
        task.payload.data
      );

      task.status = 'completed';
      task.result = result;
      this.stats.tasksRun++;
      this.log(`Task completed: ${taskId}`);

    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
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

  // Debug methods
  debug_dumpState(): void {
    if (!this.config.debug) return;
    console.log('\n=== DEBUG ===');
    console.log('State:', this.state);
    console.log('Tasks:', this.tasks.size);
    console.log('Stats:', this.stats);
    this.serviceRegistry.debug_printServices();
    console.log('=============\n');
  }

  debug_listTasks(): void {
    if (!this.config.debug) return;
    console.log('Tasks:', Array.from(this.tasks.values()));
  }

  private log(msg: string): void {
    if (this.config.debug) console.log(`[${this.config.name}] ${msg}`);
  }
}
