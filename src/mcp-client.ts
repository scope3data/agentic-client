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
import type {
  CallToolResult,
  ReadResourceResult,
  ListToolsResult,
} from '@modelcontextprotocol/sdk/types.js';
import type { Environment } from './types';
import { Scope3ApiError, getDefaultBaseUrl, sanitizeForLogging } from './adapters/base';
import { logger } from './utils/logger';

// Re-export MCP types for consumers
export type { CallToolResult, ReadResourceResult, ListToolsResult };

const SDK_VERSION = '2.1.0';

export interface Scope3McpClientConfig {
  /** API key (Bearer token) for authentication */
  apiKey: string;
  /** Environment (default: 'production') */
  environment?: Environment;
  /** Custom base URL (overrides environment) */
  baseUrl?: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Idle timeout in ms before auto-disconnect (default: 300000 = 5 min, 0 to disable) */
  idleTimeoutMs?: number;
  /** Token expiry time — epoch ms or Date object. If set, expired tokens cause disconnect + error. */
  tokenExpiresAt?: Date | number;
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

  private mcpClient: Client | null = null;
  private transport: StreamableHTTPClientTransport | null = null;
  private connected = false;
  private connectPromise: Promise<void> | null = null;
  private readonly debugMode: boolean;
  private readonly apiKey: string;
  private readonly idleTimeoutMs: number;
  private readonly tokenExpiresAt: number | null;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: Scope3McpClientConfig) {
    const trimmedKey = config.apiKey?.trim();
    if (!trimmedKey) {
      throw new Error('apiKey is required');
    }

    this.apiKey = trimmedKey;
    this.debugMode = config.debug ?? false;
    this.idleTimeoutMs = config.idleTimeoutMs ?? 300_000;
    this.tokenExpiresAt =
      config.tokenExpiresAt != null
        ? config.tokenExpiresAt instanceof Date
          ? config.tokenExpiresAt.getTime()
          : config.tokenExpiresAt
        : null;
    this.baseUrl = config.baseUrl?.replace(/\/$/, '') ?? getDefaultBaseUrl(config.environment);

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
      this.mcpClient = new Client(
        { name: 'scope3-sdk', version: SDK_VERSION },
        { capabilities: { tools: {}, experimental: { apps: {} } } }
      );

      this.transport = new StreamableHTTPClientTransport(new URL(`${this.baseUrl}/mcp`), {
        requestInit: {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      });

      await this.mcpClient.connect(this.transport);
      this.connected = true;
      if (this.debugMode) {
        logger.debug('MCP connected');
      }
    } catch (error) {
      this.connectPromise = null;
      this.mcpClient = null;
      this.transport = null;
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
    this.clearIdleTimer();
    try {
      await this.mcpClient?.close();
      await this.transport?.close();
    } catch (error) {
      logger.error('Error disconnecting from MCP', error);
    } finally {
      this.connected = false;
      this.connectPromise = null;
      this.mcpClient = null;
      this.transport = null;
      if (this.debugMode) {
        logger.debug('MCP disconnected');
      }
    }
  }

  private resetIdleTimer(): void {
    this.clearIdleTimer();
    if (this.idleTimeoutMs > 0) {
      this.idleTimer = setTimeout(() => {
        void this.disconnect();
      }, this.idleTimeoutMs);
    }
  }

  private clearIdleTimer(): void {
    if (this.idleTimer !== null) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  private isTokenExpired(): boolean {
    if (this.tokenExpiresAt === null) return false;
    return Date.now() >= this.tokenExpiresAt;
  }

  private async ensureValidConnection(): Promise<void> {
    if (this.connected && this.isTokenExpired()) {
      await this.disconnect();
      throw new Scope3ApiError(0, 'API token has expired. Please provide a fresh token.');
    }
    if (!this.connected) await this.connect();
  }

  private getClient(): Client {
    if (!this.mcpClient) {
      throw new Scope3ApiError(0, 'MCP client is not connected');
    }
    return this.mcpClient;
  }

  /**
   * Call an MCP tool directly. Auto-connects on first call.
   *
   * The v2 buyer surface exposes: api_call, ask_about_capability, help, health.
   */
  async callTool(name: string, args?: Record<string, unknown>): Promise<CallToolResult> {
    await this.ensureValidConnection();

    if (this.debugMode) {
      logger.debug('callTool', { name, args: sanitizeForLogging(args) });
    }

    const result = await this.getClient().callTool({
      name,
      arguments: args,
    });

    this.resetIdleTimer();
    return result as CallToolResult;
  }

  /**
   * Read an MCP resource directly. Auto-connects on first call.
   */
  async readResource(uri: string): Promise<ReadResourceResult> {
    await this.ensureValidConnection();

    if (this.debugMode) {
      logger.debug('readResource', { uri });
    }

    const result = await this.getClient().readResource({ uri });
    this.resetIdleTimer();
    return result;
  }

  /**
   * List all available MCP tools. Auto-connects on first call.
   */
  async listTools(): Promise<ListToolsResult> {
    await this.ensureValidConnection();
    const result = await this.getClient().listTools();
    this.resetIdleTimer();
    return result;
  }

  /** Whether the client is currently connected */
  get isConnected(): boolean {
    return this.connected;
  }
}
