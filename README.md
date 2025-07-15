# ARS ANGEL

> Arc ecosystem AI agent

**Last Updated:** 05/02/2026

## Status

🚧 **Under Development** 🚧

## Progress

- [x] Define core types
- [x] Basic agent class
- [x] MCP integration
- [ ] Service discovery (Ryzome)
- [ ] Approval workflow
- [ ] Token integration

## Installation

```bash
# Coming soon
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
```

## Architecture

```
┌─────────────────────────┐
│       ArsAngel          │
│  ┌───────────────────┐  │
│  │      Tasks        │  │
│  └─────────┬─────────┘  │
│            │            │
│  ┌─────────▼─────────┐  │
│  │    MCP Client     │  │
│  └─────────┬─────────┘  │
└────────────┼────────────┘
             │
             ▼
    Arc MCP Endpoint
```

## MCP Protocol

Model Context Protocol (MCP) is the communication layer for Arc agents.
Think of it as "HTTP for AI" - a standardized way for agents to talk to services.

### Connecting to MCP

```typescript
import { MCPClient } from 'ars-angel';

const mcp = new MCPClient('wss://mcp.arc.fun/v1');
await mcp.connect();

// Invoke a service
const result = await mcp.invoke('service.action', { param: 'value' });
```

### MCP Status

```typescript
mcp.getStatus(); // 'disconnected' | 'connecting' | 'connected' | 'error'
```

## Development

```bash
# Run in dev mode
npx ts-node index.ts
```

### Debug Mode

Set `debug: true` in config to enable verbose logging.

```typescript
const agent = new ArsAngel({
  name: 'test',
  version: '0.1.0',
  mcpEndpoint: 'wss://mcp.arc.fun/v1',
  debug: true,
});

agent.debug_dumpState(); // Print internal state
```

### Debug Methods (dev only)

- `debug_dumpState()` - Print full agent state
- `debug_listTasks()` - List all tasks
- `debug_mcpStats()` - Show MCP call statistics

---
*05/02/2026*
