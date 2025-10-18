import { Scope3Client } from '../client';
import { ToolResponse } from '../types';

export interface SalesAgentRegisterRequest {
  name: string;
  endpointUrl: string;
  protocol: 'REST' | 'MCP' | 'A2A' | 'CUSTOM';
  authenticationType: 'API_KEY' | 'OAUTH' | 'NO_AUTH';
  description?: string;
  organizationId?: string;
  authConfig?: Record<string, any>;
}

export interface SalesAgentGetRequest {
  salesAgentId: string;
}

export interface SalesAgentUpdateRequest {
  salesAgentId: string;
  name?: string;
  description?: string;
  endpointUrl?: string;
  protocol?: 'REST' | 'MCP' | 'A2A' | 'CUSTOM';
  authenticationType?: 'API_KEY' | 'OAUTH' | 'NO_AUTH';
  authConfig?: Record<string, any>;
}

export interface SalesAgentUnregisterRequest {
  salesAgentId: string;
  confirm: boolean;
}

export interface SalesAgentAccountListRequest {
  salesAgentId: string;
}

export interface SalesAgentAccountRegisterRequest {
  salesAgentId: string;
  accountIdentifier: string;
  authConfig?: Record<string, any>;
}

export interface SalesAgentAccountUpdateRequest {
  salesAgentId: string;
  accountIdentifier: string;
  authConfig: Record<string, any>;
}

export interface SalesAgentAccountUnregisterRequest {
  salesAgentId: string;
  confirm: boolean;
}

export class SalesAgentsResource {
  constructor(private client: Scope3Client) {}

  async list(): Promise<ToolResponse> {
    return this.client['callTool']('sales_agent_list', {});
  }

  async get(request: SalesAgentGetRequest): Promise<ToolResponse> {
    return this.client['callTool']('sales_agent_get', request);
  }

  async register(request: SalesAgentRegisterRequest): Promise<ToolResponse> {
    return this.client['callTool']('sales_agent_register', request);
  }

  async update(request: SalesAgentUpdateRequest): Promise<ToolResponse> {
    return this.client['callTool']('sales_agent_update', request);
  }

  async unregister(request: SalesAgentUnregisterRequest): Promise<ToolResponse> {
    return this.client['callTool']('sales_agent_unregister', request);
  }

  async listAccounts(request: SalesAgentAccountListRequest): Promise<ToolResponse> {
    return this.client['callTool']('sales_agent_account_list', request);
  }

  async registerAccount(request: SalesAgentAccountRegisterRequest): Promise<ToolResponse> {
    return this.client['callTool']('sales_agent_account_register', request);
  }

  async updateAccount(request: SalesAgentAccountUpdateRequest): Promise<ToolResponse> {
    return this.client['callTool']('sales_agent_account_update', request);
  }

  async unregisterAccount(request: SalesAgentAccountUnregisterRequest): Promise<ToolResponse> {
    return this.client['callTool']('sales_agent_account_unregister', request);
  }
}
