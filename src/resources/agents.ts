import { Scope3Client } from '../client';
import { ToolResponse } from '../types';

export type AgentType = 'SALES' | 'OUTCOME';
export type AgentStatus = 'PENDING' | 'ACTIVE' | 'DISABLED';
export type AgentRelationship = 'SELF' | 'SCOPE3' | 'MARKETPLACE';

export interface JWTAuthConfig {
  type: 'jwt';
  privateKey: string;
  issuer: string;
  subject: string;
  keyId: string;
  scope: string;
  tokenEndpointUrl: string;
  audienceUrl: string;
  algorithm?: 'ES256' | 'RS256';
  environment?: string;
}

export interface ApiKeyAuthConfig {
  auth: {
    type: 'bearer' | 'apikey' | 'api_key';
    token: string;
  };
}

export interface OAuthAuthConfig {
  auth: {
    type: 'oauth' | 'oauth2';
    token: string;
  };
}

export interface NoAuthConfig {}

export type AgentAuthConfig = JWTAuthConfig | ApiKeyAuthConfig | OAuthAuthConfig | NoAuthConfig;

export interface AgentListRequest {
  type?: AgentType;
  status?: AgentStatus;
  organizationId?: string;
  relationship?: AgentRelationship;
  name?: string;
}

export interface AgentGetRequest {
  agentId: string;
}

export interface AgentRegisterRequest {
  type: AgentType;
  name: string;
  endpointUrl: string;
  protocol: 'MCP' | 'A2A';
  authenticationType?: 'API_KEY' | 'OAUTH' | 'NO_AUTH' | 'JWT';
  description?: string;
  organizationId?: string;
  authConfig?: AgentAuthConfig;
}

export interface AgentUpdateRequest {
  agentId: string;
  name?: string;
  description?: string;
  endpointUrl?: string;
  protocol?: 'MCP' | 'A2A';
  authenticationType?: 'API_KEY' | 'OAUTH' | 'NO_AUTH' | 'JWT';
  authConfig?: AgentAuthConfig;
}

export interface AgentUnregisterRequest {
  agentId: string;
}

export class AgentsResource {
  constructor(private client: Scope3Client) {}

  async list(request?: AgentListRequest): Promise<ToolResponse> {
    return this.client['callTool']('agent_list', request || {});
  }

  async get(request: AgentGetRequest): Promise<ToolResponse> {
    return this.client['callTool']('agent_get', request);
  }

  async register(request: AgentRegisterRequest): Promise<ToolResponse> {
    return this.client['callTool']('agent_register', request);
  }

  async update(request: AgentUpdateRequest): Promise<ToolResponse> {
    return this.client['callTool']('agent_update', request);
  }

  async unregister(request: AgentUnregisterRequest): Promise<ToolResponse> {
    return this.client['callTool']('agent_unregister', request);
  }
}
