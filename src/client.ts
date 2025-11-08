import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { ClientConfig, Environment, DebugInfo } from './types';
import { logger } from './utils/logger';

export class Scope3Client {
  protected readonly mcpClient: Client;
  protected readonly apiKey: string;
  protected readonly baseUrl: string;
  protected readonly debug: boolean;
  private transport?: StreamableHTTPClientTransport;
  private connected = false;
  public lastDebugInfo?: DebugInfo;

  constructor(config: ClientConfig) {
    this.apiKey = config.apiKey;
    this.debug = config.debug || false;

    // Priority: explicit baseUrl > environment > default to production
    const baseURL = config.baseUrl || this.getDefaultBaseUrl(config.environment || 'production');
    this.baseUrl = baseURL;

    logger.info('Initializing Scope3 client', {
      baseUrl: baseURL,
      environment: config.environment || 'production',
      isCustomUrl: !!config.baseUrl,
      debug: this.debug,
    });

    this.mcpClient = new Client(
      {
        name: '@scope3/agentic-client',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.transport = new StreamableHTTPClientTransport(new URL(`${baseURL}/mcp`), {
      requestInit: {
        headers: {
          'x-scope3-api-key': this.apiKey,
        },
      },
    });
  }

  private getDefaultBaseUrl(env: Environment): string {
    return env === 'production'
      ? 'https://api.agentic.scope3.com'
      : 'https://api.agentic.staging.scope3.com';
  }

  async connect(): Promise<void> {
    if (this.connected || !this.transport) {
      return;
    }

    await this.mcpClient.connect(this.transport);
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    await this.mcpClient.close();
    if (this.transport) {
      await this.transport.close();
    }
    this.connected = false;
  }

  protected async callTool<TRequest, TResponse>(
    toolName: string,
    args: TRequest
  ): Promise<TResponse> {
    const startTime = Date.now();

    if (!this.connected) {
      await this.connect();
    }

    const request = {
      name: toolName,
      arguments: args as Record<string, unknown>,
    };

    if (this.debug) {
      logger.info('MCP Request', { request });
    }

    const result = await this.mcpClient.callTool(request);
    const durationMs = Date.now() - startTime;

    if (this.debug) {
      logger.info('MCP Response', {
        toolName,
        duration: `${durationMs}ms`,
        result,
      });
    }

    // MCP tools can return structured content or text content
    // Priority: structuredContent > parsed JSON from text > raw text

    // Check for structuredContent first (preferred)
    if (result.structuredContent) {
      if (this.debug) {
        this.lastDebugInfo = {
          toolName,
          request: args as Record<string, unknown>,
          response: result.structuredContent,
          durationMs,
        };
      }
      return result.structuredContent as TResponse;
    }

    // Fall back to text content
    if (result.content && Array.isArray(result.content) && result.content.length > 0) {
      const content = result.content[0];
      if (content.type === 'text') {
        const rawResponse = content.text;

        // Try to parse as JSON first, if that fails return the text as-is
        try {
          const parsed = JSON.parse(rawResponse);

          // Store debug info if enabled
          if (this.debug) {
            this.lastDebugInfo = {
              toolName,
              request: args as Record<string, unknown>,
              response: parsed,
              rawResponse,
              durationMs,
            };
          }

          return parsed as TResponse;
        } catch {
          // If not JSON, return the text wrapped in an object
          if (this.debug) {
            logger.warn('MCP tool returned non-JSON text (no structuredContent)', {
              toolName,
              textLength: rawResponse.length,
            });

            this.lastDebugInfo = {
              toolName,
              request: args as Record<string, unknown>,
              response: { message: rawResponse },
              rawResponse,
              durationMs,
            };
          }

          return { message: rawResponse } as TResponse;
        }
      }
    }

    throw new Error('Unexpected tool response format');
  }

  protected getClient(): Client {
    return this.mcpClient;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }
}
