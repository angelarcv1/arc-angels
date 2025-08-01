/**
 * ARS ANGEL - Service Registry
 * Commit 4: Ryzome marketplace integration
 */

import { ServiceDefinition } from './types';
import { MCPClient } from './mcp-client';

export class ServiceRegistry {
  private services: Map<string, ServiceDefinition> = new Map();
  private mcpClient: MCPClient;

  // TEMP: hardcoded for dev - will fetch from Ryzome
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
    console.log('[Registry] Loading services...');
    // TODO: fetch from Ryzome API
    for (const service of ServiceRegistry.DEV_SERVICES) {
      this.services.set(service.id, service);
    }
    console.log(`[Registry] Loaded ${this.services.size} services`);
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
    if (!service) {
      throw new Error(`Service not found: ${serviceId}`);
    }
    console.log(`[Registry] ${service.name}.${action}`);
    return this.mcpClient.invoke(`${service.endpoint}/${action}`, params);
  }

  getService(id: string): ServiceDefinition | undefined {
    return this.services.get(id);
  }

  listServices(): ServiceDefinition[] {
    return Array.from(this.services.values());
  }

  // Debug
  debug_printServices(): void {
    console.log('[Registry] Services:');
    for (const s of this.services.values()) {
      console.log(`  - ${s.id}: ${s.capabilities.join(', ')}`);
    }
  }
}
