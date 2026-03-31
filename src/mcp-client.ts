/**
 * Scope3McpClient - Thin connection helper for MCP consumers
 *
 * MCP consumers (Claude, ChatGPT, Cursor, etc.) already have an MCP client.
 * The server handles auth, routing, and validation. This client just wires up
 * the connection with correct auth and URL, then gets out of the way.
 *
 * The v2 buyer MCP surface is 4 tools: api_call, ask_about_capability, help, health.
 * This client gives you direct access to all of them — no typed resource wrappers,
 * no request() indirection, no adapter pattern.
 *
 * @example
 * ```typescript
 * const mcp = new Scope3McpClient({ apiKey: 'sk_xxx' });
 * await mcp.connect();
 *
 * // Call tools directly — same as the MCP server exposes them
 * const result = await mcp.callTool('api_call', {
 *   method: 'GET',
 *   path: '/api/v2/buyer/advertisers',
 * });
 *
 * // Ask what the API can do
 * const capabilities = await mcp.callTool('ask_about_capability', {
 *   question: 'How do I create a campaign?',
 * });
 *
 * // List available tools
 * const tools = await mcp.listTools();
 *
 * // Read a resource
 * const resource = await mcp.readResource('scope3://schema/advertiser');
 *
 * await mcp.disconnect();
 * ```
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { CallToolResult, ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';
import type { ApiVersion, Persona, Environment } from './types';
import { Scope3ApiError, getDefaultBaseUrl } from './adapters/base';
import { logger } from './utils/logger';

// Re-export MCP types for consumers
export type { CallToolResult, ReadResourceResult };

const SDK_VERSION = '2.1.0';

export interface Scope3McpClientConfig {
  /** API key (Bearer token) for authentication */
  apiKey: string;
  /** API persona — determines which MCP surface to connect to */
  persona?: Persona;
  /** API version (default: 'v2') */
  version?: ApiVersion;
  /** Environment (default: 'production') */
  environment?: Environment;
  /** Custom base URL (overrides environment) */
  baseUrl?: string;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Thin MCP connection helper for AI agent consumers.
 *
 * Connects to the Scope3 MCP server with auth, then exposes callTool(),
 * readResource(), and listTools() as direct passthroughs. No typed resource
 * wrappers, no adapter indirection.
 */
export class Scope3McpClient {
  readonly baseUrl: string;

  private readonly mcpClient: Client;
  private readonly transport: StreamableHTTPClientTransport;
  private connected = false;
  private connectPromise: Promise<void> | null = null;
  private readonly debugMode: boolean;

  constructor(config: Scope3McpClientConfig) {
    if (!config.apiKey) {
      throw new Error('apiKey is required');
    }

    this.debugMode = config.debug ?? false;
    this.baseUrl = config.baseUrl?.replace(/\/$/, '') ?? getDefaultBaseUrl(config.environment);

    this.mcpClient = new Client(
      { name: 'scope3-sdk', version: SDK_VERSION },
      { capabilities: { tools: {} } }
    );

    // Build MCP endpoint URL — the server routes based on auth token
    this.transport = new StreamableHTTPClientTransport(new URL(`${this.baseUrl}/mcp`), {
      requestInit: {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      },
    });

    if (this.debugMode) {
      logger.setDebug(true);
      logger.debug('Scope3McpClient initialized', { baseUrl: this.baseUrl });
    }
  }

  /**
   * Connect to the MCP server. Called automatically on first tool call.
   */
  async connect(): Promise<void> {
    if (this.connected) return;
    if (!this.connectPromise) {
      this.connectPromise = this.doConnect();
    }
    return this.connectPromise;
  }

  private async doConnect(): Promise<void> {
    try {
      await this.mcpClient.connect(this.transport);
      this.connected = true;
      if (this.debugMode) {
        logger.debug('MCP connected');
      }
    } catch (error) {
      this.connectPromise = null;
      throw new Scope3ApiError(
        0,
        `Failed to connect to MCP server: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Disconnect from the MCP server.
   */
  async disconnect(): Promise<void> {
    if (!this.connected) return;
    try {
      await this.mcpClient.close();
      await this.transport.close();
      this.connected = false;
      if (this.debugMode) {
        logger.debug('MCP disconnected');
      }
    } catch (error) {
      logger.error('Error disconnecting from MCP', error);
    }
  }

  /**
   * Call an MCP tool directly. Auto-connects on first call.
   *
   * The v2 buyer surface exposes: api_call, ask_about_capability, help, health.
   */
  async callTool(name: string, args?: Record<string, unknown>): Promise<CallToolResult> {
    if (!this.connected) await this.connect();

    if (this.debugMode) {
      logger.debug('callTool', { name, args });
    }

    const result = await this.mcpClient.callTool({
      name,
      arguments: args,
    });

    return result as CallToolResult;
  }

  /**
   * Read an MCP resource directly. Auto-connects on first call.
   */
  async readResource(uri: string): Promise<ReadResourceResult> {
    if (!this.connected) await this.connect();

    if (this.debugMode) {
      logger.debug('readResource', { uri });
    }

    return this.mcpClient.readResource({ uri });
  }

  /**
   * List all available MCP tools. Auto-connects on first call.
   */
  async listTools(): Promise<{
    tools: Array<{ name: string; description?: string; inputSchema?: unknown }>;
  }> {
    if (!this.connected) await this.connect();
    return this.mcpClient.listTools();
  }

  /** Whether the client is currently connected */
  get isConnected(): boolean {
    return this.connected;
  }
}
