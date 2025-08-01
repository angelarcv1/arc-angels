# ARS ANGEL

> Arc ecosystem AI agent

**Last Updated:** 07/02/2026

## Status

🟡 **Alpha** - Core features working

## Progress

- [x] Define core types
- [x] Basic agent class
- [x] MCP integration
- [x] Service discovery (Ryzome)
- [ ] Human-in-the-loop approval
- [ ] Token integration

## Installation

```bash
npm install ars-angel
```

## Quick Start

```typescript
import { ArsAngel } from 'ars-angel';

const agent = new ArsAngel({
  name: 'my-agent',
  version: '0.1.0',
  mcpEndpoint: 'wss://mcp.arc.fun/v1',
});

await agent.initialize();

// Submit a task
const taskId = await agent.submitTask('query', {
  action: 'memory.recall',
  data: { query: 'user preferences' },
  services: ['memory'],
});
```

## Architecture

```
┌────────────────────────────────────┐
│            ArsAngel                │
│  ┌────────────────────────────┐    │
│  │          Tasks             │    │
│  └──────────────┬─────────────┘    │
│                 │                  │
│  ┌──────────────▼─────────────┐    │
│  │      Service Registry      │    │
│  │  (Ryzome Marketplace)      │    │
│  └──────────────┬─────────────┘    │
│                 │                  │
│  ┌──────────────▼─────────────┐    │
│  │        MCP Client          │    │
│  └──────────────┬─────────────┘    │
└─────────────────┼──────────────────┘
                  │
                  ▼
         Arc MCP Services
   ┌─────────┬─────────┬─────────┐
   │  Soul   │ Listen  │  ...    │
   │  Graph  │  DeFi   │         │
   └─────────┴─────────┴─────────┘
```

## MCP Protocol

Model Context Protocol (MCP) is the communication layer for Arc agents.
Think of it as "HTTP for AI" - a standardized way for agents to talk to services.

```typescript
import { MCPClient } from 'ars-angel';

const mcp = new MCPClient('wss://mcp.arc.fun/v1');
await mcp.connect();
const result = await mcp.invoke('service.action', { param: 'value' });
```

## Service Discovery

The agent automatically discovers services from the Ryzome marketplace.

```typescript
// Find services with specific capabilities
const services = await agent.discoverServices(['memory', 'context']);

// Invoke a specific service
const result = await agent.invokeService('soul-graph', 'recall', {
  query: 'recent context',
});
```

### Available Services (Dev)

| Service | Capabilities | Trust Score |
|---------|--------------|-------------|
| Soul Graph | memory, personality, context | 0.95 |
| Listen DeFi | swap, stake, portfolio | 0.92 |

> Note: Production will fetch services dynamically from Ryzome

## Development

```bash
npx ts-node index.ts
```

### Debug Mode

```typescript
const agent = new ArsAngel({
  // ...config
  debug: true,
});

agent.debug_dumpState();
agent.debug_listTasks();
```

---
*07/02/2026*
