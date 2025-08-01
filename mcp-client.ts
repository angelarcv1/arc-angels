/**
 * ARS ANGEL - MCP Client
 * Commit 4: Unchanged from commit 3
 */

import { MCPConnection, MCPRequest, MCPResponse } from './types';

export class MCPClient {
  private connection: MCPConnection;
  private callCount = 0;

  constructor(endpoint: string) {
    this.connection = {
      endpoint,
      status: 'disconnected',
    };
  }

  async connect(): Promise<void> {
    this.connection.status = 'connecting';
    console.log(`[MCP] Connecting to ${this.connection.endpoint}...`);
    await this.delay(100);
    this.connection.status = 'connected';
    this.connection.lastPing = Date.now();
    console.log('[MCP] Connected');
  }

  async disconnect(): Promise<void> {
    this.connection.status = 'disconnected';
    console.log('[MCP] Disconnected');
  }

  async invoke(method: string, params: Record<string, unknown>): Promise<unknown> {
    if (this.connection.status !== 'connected') {
      throw new Error('MCP not connected');
    }

    this.callCount++;

    const request: MCPRequest = {
      id: `mcp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      method,
      params,
      timestamp: Date.now(),
    };

    console.log(`[MCP] Invoke: ${method}`);
    const response = await this.send(request);

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.result;
  }

  getStatus(): MCPConnection['status'] {
    return this.connection.status;
  }

  debug_getCallCount(): number {
    return this.callCount;
  }

  private async send(request: MCPRequest): Promise<MCPResponse> {
    await this.delay(50);
    return {
      id: request.id,
      result: { ok: true },
      timestamp: Date.now(),
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }
}
