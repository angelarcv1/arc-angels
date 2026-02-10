/**
 * ARS ANGEL - MCP Client
 * Commit 5: Added retry logic
 */

import { MCPConnection, MCPRequest, MCPResponse } from './types';

export class MCPClient {
  private connection: MCPConnection;
  private retryAttempts = 3;

  constructor(endpoint: string) {
    this.connection = { endpoint, status: 'disconnected' };
  }

  async connect(): Promise<void> {
    this.connection.status = 'connecting';
    await this.delay(100);
    this.connection.status = 'connected';
  }

  async disconnect(): Promise<void> {
    this.connection.status = 'disconnected';
  }

  async invoke<T = unknown>(method: string, params: Record<string, unknown>): Promise<T> {
    if (this.connection.status !== 'connected') {
      throw new Error('MCP not connected');
    }

    const request: MCPRequest = {
      id: `mcp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      method,
      params,
      timestamp: Date.now(),
    };

    return this.sendWithRetry<T>(request);
  }

  getStatus(): MCPConnection['status'] {
    return this.connection.status;
  }

  private async sendWithRetry<T>(request: MCPRequest): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < this.retryAttempts; i++) {
      try {
        const response = await this.send(request);
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response.result as T;
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        await this.delay(Math.pow(2, i) * 100);
      }
    }

    throw lastError ?? new Error('MCP request failed');
  }

  private async send(request: MCPRequest): Promise<MCPResponse> {
    await this.delay(50);
    return { id: request.id, result: { ok: true }, timestamp: Date.now() };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }
}
