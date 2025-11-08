import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { ClientConfig, Environment } from './types';
import { logger } from './utils/logger';

export class Scope3Client {
  protected readonly mcpClient: Client;
  protected readonly apiKey: string;
  protected readonly baseUrl: string;
  private transport?: StreamableHTTPClientTransport;
  private connected = false;

  constructor(config: ClientConfig) {
    this.apiKey = config.apiKey;

    // Priority: explicit baseUrl > environment > default to production
    const baseURL = config.baseUrl || this.getDefaultBaseUrl(config.environment || 'production');
    this.baseUrl = baseURL;

    logger.info('Initializing Scope3 client', {
      baseUrl: baseURL,
      environment: config.environment || 'production',
      isCustomUrl: !!config.baseUrl,
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
    if (!this.connected) {
      await this.connect();
    }

    const result = await this.mcpClient.callTool({
      name: toolName,
      arguments: args as Record<string, unknown>,
    });

    // MCP tools return content array, extract the response from text content
    if (result.content && Array.isArray(result.content) && result.content.length > 0) {
      const content = result.content[0];
      if (content.type === 'text') {
        // Try to parse as JSON first, if that fails return the text as-is
        try {
          return JSON.parse(content.text) as TResponse;
        } catch {
          // If not JSON, return the text wrapped in an object
          return { message: content.text } as TResponse;
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
