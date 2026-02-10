/**
 * ARS ANGEL - Service Registry
 * Commit 5: Ryzome integration
 * 10/02/2026
 */

import { ServiceDefinition } from './types';
import { MCPClient } from './mcp-client';

export class ServiceRegistry {
  private services: Map<string, ServiceDefinition> = new Map();
  private mcpClient: MCPClient;

  // TODO: fetch from Ryzome in prod
  private static DEV_SERVICES: ServiceDefinition[] = [
    {
      id: 'soul-graph',
      name: 'Soul Graph',
      endpoint: 'mcp://soul-graph.arc.fun',
      capabilities: ['memory', 'personality', 'context'],
      trustScore: 0.95,
    },
    {
      id: 'listen-defi',
      name: 'Listen DeFi',
      endpoint: 'mcp://listen.arc.fun',
      capabilities: ['swap', 'stake', 'portfolio'],
      trustScore: 0.92,
    },
  ];

  constructor(mcpClient: MCPClient) {
    this.mcpClient = mcpClient;
  }

  async initialize(): Promise<void> {
    for (const service of ServiceRegistry.DEV_SERVICES) {
      this.services.set(service.id, service);
    }
  }

  async discover(capabilities: string[]): Promise<ServiceDefinition[]> {
    const matches: ServiceDefinition[] = [];
    for (const service of this.services.values()) {
      if (capabilities.some((c) => service.capabilities.includes(c))) {
        matches.push(service);
      }
    }
    return matches.sort((a, b) => b.trustScore - a.trustScore);
  }

  async invoke(
    serviceId: string,
    action: string,
    params: Record<string, unknown>
  ): Promise<unknown> {
    const service = this.services.get(serviceId);
    if (!service) throw new Error(`Service not found: ${serviceId}`);

    return this.mcpClient.invoke(`${service.endpoint}/${action}`, params);
  }

  getService(id: string): ServiceDefinition | undefined {
    return this.services.get(id);
  }

  listServices(): ServiceDefinition[] {
    return Array.from(this.services.values());
  }
}
