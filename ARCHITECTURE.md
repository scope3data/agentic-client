# Media Agent Architecture

## Two Deployment Models

There are **two ways** to deploy a media agent, depending on who's calling it:

### 1. HTTP Media Agent (for Scope3 Orchestrator)

**Use When**: The Scope3 platform orchestrator calls your media agent

```
Scope3 Orchestrator → HTTP POST → Media Agent (Express) → Scope3 API
```

**Command**:
```bash
export SCOPE3_API_KEY=your_key
npx simple-media-agent  # Runs on port 8080
```

**What It Does**:
- Exposes HTTP endpoints (`/get-proposed-tactics`, `/manage-tactic`, etc.)
- Waits for Scope3 platform to POST requests
- Implements Media Agent Protocol over HTTP

**File**: `src/simple-media-agent.ts`

---

### 2. MCP Media Agent (for Brand Agents)

**Use When**: A brand agent (running in Claude/LLM) calls your media agent

```
Claude/Brand Agent → MCP stdio → Media Agent (MCP Server) → Scope3 API
```

**Command**:
```bash
export SCOPE3_API_KEY=your_key
npx simple-media-agent-mcp  # MCP stdio
```

**What It Does**:
- Exposes MCP tools (`get_proposed_tactics`, `manage_tactic`)
- Communicates via stdio (MCP protocol)
- Brand agent can directly call tools

**File**: `src/simple-media-agent-with-mcp.ts`

---

## Why Two Models?

### HTTP Model
- ✅ Called BY the Scope3 platform
- ✅ Receives webhooks for reporting, tactic updates
- ✅ Standard web server architecture
- ❌ Not directly callable by LLMs

### MCP Model
- ✅ Called BY brand agents (LLMs)
- ✅ Native LLM integration
- ✅ No HTTP server needed
- ❌ Can't receive webhooks from Scope3

---

## The Generic MCP Proxy (Deprecated for Our Use Case)

**What is `scope3-media-agent`?**

This is a **generic MCP proxy** that forwards MCP calls to ANY media agent's HTTP endpoints:

```
Claude → MCP Proxy → HTTP POST → Any Media Agent
```

**Why it exists**: To let brand agents call media agents that only expose HTTP endpoints.

**Why you don't need it**: If your media agent exposes MCP tools directly (`simple-media-agent-mcp`), the proxy is unnecessary!

---

## Quick Decision Guide

**Q: Who is calling my media agent?**

- **Scope3 Platform** → Use `npx simple-media-agent` (HTTP)
- **Brand Agent/LLM** → Use `npx simple-media-agent-mcp` (MCP)
- **Third-party HTTP media agent** → Use `npx scope3-media-agent` (MCP Proxy)

---

## Examples

### Example 1: Platform Integration
```bash
# Deploy media agent that Scope3 platform can call
npx simple-media-agent
# → HTTP server on port 8080
# → Scope3 platform POSTs to http://your-domain:8080/manage-tactic
```

### Example 2: Brand Agent Integration
```bash
# Brand agent running in Claude Desktop
export SCOPE3_API_KEY=your_key
npx simple-media-agent-mcp
# → MCP server on stdio
# → Brand agent calls get_proposed_tactics tool
# → No HTTP server needed!
```

### Example 3: Third-Party Media Agent
```bash
# Terminal 1: Some other media agent with HTTP endpoints
npx other-media-agent --port 8080

# Terminal 2: MCP proxy for brand agent to call it
export MEDIA_AGENT_URL=http://localhost:8080
npx scope3-media-agent
# → Brand agent calls MCP tools
# → Proxy forwards to HTTP endpoints
```

---

## Summary

- **`simple-media-agent`**: HTTP server for Scope3 platform
- **`simple-media-agent-mcp`**: MCP server for brand agents (NO PROXY NEEDED!)
- **`scope3-media-agent`**: Generic MCP→HTTP proxy (for third-party agents)

You were right to question the proxy! For our simple media agent, the MCP version (`simple-media-agent-mcp`) IS the MCP server directly.
