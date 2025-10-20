# Media Agent MCP Server

MCP (Model Context Protocol) server implementation for Scope3 Media Agents, built with [fastmcp](https://www.npmjs.com/package/fastmcp).

## Overview

This MCP server provides tools to interact with media agents that implement the Media Agent Protocol. Media agents are autonomous systems that optimize media buying on behalf of advertisers.

## Installation

```bash
npm install @scope3/agentic-client
```

## Usage

### As a Standalone Server

Set environment variables and run:

```bash
export MEDIA_AGENT_URL=https://your-media-agent.example.com
export MEDIA_AGENT_API_KEY=your_api_key
npx scope3-media-agent
```

### Programmatically

```typescript
import { MediaAgentMCP } from '@scope3/agentic-client';

const server = new MediaAgentMCP({
  mediaAgentUrl: 'https://your-media-agent.example.com',
  apiKey: process.env.MEDIA_AGENT_API_KEY,
  name: 'my-media-agent',
  version: '1.0.0',
});

await server.start();
```

## Available Tools

### `get_proposed_tactics`

Get tactic proposals from the media agent. Called when setting up a campaign.

**Parameters:**
- `campaignId` (required): Campaign ID
- `seatId` (required): Seat/account ID
- `budgetRange`: Budget range with min/max/currency
- `startDate`: Campaign start date (ISO 8601)
- `endDate`: Campaign end date (ISO 8601)
- `channels`: Array of channels (display, video, audio, native, ctv)
- `countries`: Array of ISO country codes
- `objectives`: Campaign objectives
- `brief`: Campaign brief text
- `acceptedPricingMethods`: Accepted pricing methods

**Returns:** List of proposed tactics with execution plans, budget capacity, and pricing

### `manage_tactic`

Accept or decline tactic assignment.

**Parameters:**
- `tacticId` (required): ID of the tactic
- `tacticContext` (required): Complete tactic details
- `brandAgentId` (required): Brand agent ID
- `seatId` (required): Seat/account ID
- `customFields`: Custom fields from advertiser

**Returns:** Acknowledgment of assignment

### `tactic_context_updated`

Notification of tactic changes (budget, schedule, etc.).

**Parameters:**
- `tacticId` (required): Tactic ID
- `tactic` (required): Current tactic state
- `patch` (required): JSON Patch format changes

### `tactic_creatives_updated`

Notification of creative changes.

**Parameters:**
- `tacticId` (required): Tactic ID
- `creatives` (required): Updated creative assets
- `patch` (required): JSON Patch format changes

### `tactic_feedback`

Performance feedback from the orchestrator.

**Parameters:**
- `tacticId` (required): Tactic ID
- `startDate` (required): Start of feedback interval
- `endDate` (required): End of feedback interval
- `deliveryIndex` (required): Delivery performance (100 = on target)
- `performanceIndex` (required): Performance vs target (100 = maximum)

## Configuration

### Environment Variables

- `MEDIA_AGENT_URL`: URL of your media agent server (required)
- `MEDIA_AGENT_API_KEY`: API key for authentication (optional)

## Media Agent Protocol

The MCP server communicates with media agents that implement the [Media Agent Protocol](https://docs.agentic.scope3.com/media-agent-protocol). Your media agent must implement these endpoints:

- `POST /get-proposed-tactics`
- `POST /manage-tactic`
- `POST /tactic-context-updated`
- `POST /tactic-creatives-updated`
- `POST /tactic-feedback`

See the OpenAPI specification in `media-agent-openapi.yaml` for full details.
