---
name: scope3-agentic-publisher
version: "1.0.0"
description: Scope3 Agentic Storefront API - Manage and publish agents to the Scope3 marketplace
api_base_url: https://api.agentic.scope3.com/api/v1
auth:
  type: bearer
  header: Authorization
  format: "Bearer {token}"
  obtain_url: https://agentic.scope3.com/user-api-keys
---

# Scope3 Agentic Publisher API

This API enables publishers to manage their agents in the Scope3 Agentic Storefront. All endpoints are owner-scoped (JWT `sub` = WorkOS user ID).

## Authentication

WorkOS OAuth — same flow as the builder MCP. Obtain a token via `scope3 login` and pass it as a Bearer token.

## Public Endpoints (no auth)

- `GET /api/v1/openapi.json` — OpenAPI 3.1 spec
- `GET /api/v1/skill.md` — This document
- `GET /api/v1/.well-known/oauth-authorization-server` — OAuth metadata
- `GET /api/v1/.well-known/oauth-protected-resource` — Resource metadata

## Agent Management

```http
GET    /api/v1/agents
POST   /api/v1/agents
PUT    /api/v1/agents/{id}
DELETE /api/v1/agents/{id}
```

## Traces

```http
GET  /api/v1/agents/{id}/traces
POST /api/v1/agents/{id}/traces
```

## Tasks

```http
GET  /api/v1/agents/{id}/tasks
GET  /api/v1/tasks/{id}/*
POST /api/v1/tasks/{id}/*
```

## Agent Configuration

```http
PUT /api/v1/agents/{id}/capabilities
PUT /api/v1/agents/{id}/notifications
PUT /api/v1/agents/{id}/llm-provider
PUT /api/v1/agents/{id}/inbound-filters
```

## Policy

```http
POST /api/v1/agents/{id}/synthesize-policy
```

## Files

```http
POST /api/v1/agents/{id}/upload
GET  /api/v1/agents/{id}/file-uploads
```

## Evaluations

```http
POST /api/v1/agents/{id}/evals
GET  /api/v1/evals/{id}
POST /api/v1/evals/compare
```

## Audit

```http
GET /api/v1/agents/{id}/config-changes
```
