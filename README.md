# ARS ANGEL

> Arc ecosystem AI agent

## Status

🟡 **Beta** - Feature complete, testing in progress

**Last Updated:** 10/02/2026

## Progress

- [x] Core types
- [x] Agent lifecycle
- [x] MCP integration
- [x] Service discovery
- [x] Human-in-the-loop approval
- [ ] Token integration (coming soon)
- [ ] Production hardening

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
  approvalMode: 'threshold',
});

await agent.initialize();

// Listen for events
agent.onEvent((event) => {
  if (event.type === 'approval_required') {
    console.log('Approval needed:', event.request);
    // agent.approveTask(event.request.taskId);
  }
});

// Submit a task
await agent.submitTask('execute', {
  action: 'memory.recall',
  data: { query: 'user context' },
  services: ['memory'],
});
```

## Architecture

```
┌──────────────────────────────────────────┐
│               ArsAngel                   │
│  ┌──────────────┐    ┌───────────────┐   │
│  │    Tasks     │    │   Approval    │   │
│  └──────┬───────┘    │   Manager     │   │
│         │            └───────┬───────┘   │
│  ┌──────▼───────────────────▼────────┐   │
│  │         Service Registry          │   │
│  │        (Ryzome Marketplace)       │   │
│  └──────────────┬────────────────────┘   │
│                 │                        │
│  ┌──────────────▼────────────────────┐   │
│  │           MCP Client              │   │
│  └───────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

## MCP Protocol

```typescript
const mcp = new MCPClient('wss://mcp.arc.fun/v1');
await mcp.connect();
const result = await mcp.invoke('service.action', { param: 'value' });
```

## Service Discovery

```typescript
const services = await agent.discoverServices(['memory', 'context']);
const result = await agent.invokeService('soul-graph', 'recall', {
  query: 'recent context',
});
```

## Approval Workflow

For sensitive operations, the agent supports human-in-the-loop approval.

### Approval Modes

| Mode | Description |
|------|-------------|
| `auto` | Approve all tasks automatically |
| `manual` | Require approval for all `execute` tasks |
| `threshold` | Auto-approve if within trust threshold |

```typescript
const agent = new ArsAngel({
  // ...
  approvalMode: 'threshold',
  approvalThreshold: {
    trustedServices: ['soul-graph'],
  },
});

// Handle approval requests
agent.onEvent((e) => {
  if (e.type === 'approval_required') {
    // Show to user, then:
    agent.approveTask(e.request.taskId);
    // or: agent.rejectTask(e.request.taskId);
  }
});
```

## Roadmap

- [ ] Token integration for service payments
- [ ] On-chain settlement
- [ ] Multi-agent coordination

---
*10/02/2026*
