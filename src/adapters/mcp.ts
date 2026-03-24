/**
 * MCP (Model Context Protocol) adapter for Scope3 API
 * Primary adapter for AI agents (Claude, etc.)
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { ApiVersion, Persona, Scope3ClientConfig } from '../types';
import type { ValidateMode } from '../validation';
import {
  BaseAdapter,
  HttpMethod,
  RequestOptions,
  Scope3ApiError,
  resolveBaseUrl,
  resolveVersion,
  resolvePersona,
  sanitizeForLogging,
} from './base';
import { logger } from '../utils/logger';

const SDK_VERSION = '2.0.0';

/**
 * MCP adapter implementation using Model Context Protocol
 * Uses the single `api_call` tool to make REST-style requests
 */
export class McpAdapter implements BaseAdapter {
  readonly baseUrl: string;
  readonly version: ApiVersion;
  readonly persona: Persona;
  readonly debug: boolean;
  readonly validate: ValidateMode | undefined;

  private readonly apiKey: string;
  private mcpClient: Client;
  private transport: StreamableHTTPClientTransport;
  private connected = false;
  private connectPromise: Promise<void> | null = null;

  constructor(config: Scope3ClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = resolveBaseUrl(config);
    this.version = resolveVersion(config);
    this.persona = resolvePersona(config);
    this.debug = config.debug ?? false;
    this.validate = config.validate ?? true;

    // Initialize MCP client
    this.mcpClient = new Client(
      {
        name: 'scope3-sdk',
        version: SDK_VERSION,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize transport
    this.transport = new StreamableHTTPClientTransport(new URL(`${this.baseUrl}/mcp`), {
      requestInit: {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      },
    });

    if (this.debug) {
      logger.setDebug(true);
      logger.debug('McpAdapter initialized', {
        baseUrl: this.baseUrl,
        version: this.version,
        persona: this.persona,
      });
    }
  }

  /**
   * Connect to MCP server
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }
    if (!this.connectPromise) {
      this.connectPromise = this.doConnect();
    }
    return this.connectPromise;
  }

  private async doConnect(): Promise<void> {
    try {
      await this.mcpClient.connect(this.transport);
      this.connected = true;

      if (this.debug) {
        logger.debug('MCP connected');
      }
    } catch (error) {
      this.connectPromise = null; // Allow retry on failure
      throw new Scope3ApiError(
        0,
        `Failed to connect to MCP server: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Disconnect from MCP server
   */
  async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      await this.mcpClient.close();
      await this.transport.close();
      this.connected = false;

      if (this.debug) {
        logger.debug('MCP disconnected');
      }
    } catch (error) {
      logger.error('Error disconnecting from MCP', error);
    }
  }

  /**
   * Make an API request via MCP using the api_call tool
   */
  async request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    // Ensure connected
    if (!this.connected) {
      await this.connect();
    }

    const startTime = Date.now();

    // Build full API path with version and persona
    const versionPath = this.version === 'latest' ? 'v2' : this.version;
    let fullPath = `/api/${versionPath}/${this.persona}${path}`;

    // Add query parameters to path
    if (options?.params) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      }
      const queryString = params.toString();
      if (queryString) {
        fullPath += `?${queryString}`;
      }
    }

    // Build MCP tool arguments for api_call
    const args: Record<string, unknown> = {
      method,
      path: fullPath,
      ...(body && typeof body === 'object' ? { body } : {}),
    };

    if (this.debug) {
      logger.debug('MCP Request', {
        tool: 'api_call',
        args: sanitizeForLogging(args),
      });
    }

    try {
      const result = await this.mcpClient.callTool({
        name: 'api_call',
        arguments: args,
      });

      // Check for MCP-level errors
      if (result.isError) {
        const errorContent = result.content as Array<{ type: string; text?: string }> | undefined;
        const errorMessage = errorContent?.[0]?.text ?? 'MCP tool call failed';
        try {
          const parsed = JSON.parse(errorMessage);
          throw new Scope3ApiError(
            parsed.status ?? parsed.code ?? 500,
            parsed.message ?? errorMessage,
            parsed.details
          );
        } catch (e) {
          if (e instanceof Scope3ApiError) throw e;
          throw new Scope3ApiError(500, errorMessage);
        }
      }

      const durationMs = Date.now() - startTime;

      if (this.debug) {
        logger.debug('MCP Response', {
          durationMs,
          hasStructuredContent: !!result.structuredContent,
        });
      }

      // Extract structured content
      if (result.structuredContent) {
        return result.structuredContent as T;
      }

      // Fall back to text content if no structured content
      const content = result.content as Array<{ type: string; text?: string }> | undefined;
      if (content && content.length > 0 && content[0].type === 'text' && content[0].text) {
        try {
          return JSON.parse(content[0].text) as T;
        } catch {
          // Return as message
          return { message: content[0].text } as T;
        }
      }

      throw new Scope3ApiError(500, 'MCP returned no content');
    } catch (error) {
      if (error instanceof Scope3ApiError) {
        throw error;
      }

      throw new Scope3ApiError(
        500,
        `MCP error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
