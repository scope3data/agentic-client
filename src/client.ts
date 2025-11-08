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

    // Enable logger debug mode if debug is enabled
    if (this.debug) {
      logger.setDebug(true);
    }

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

  private sanitizeForLogging(obj: unknown): unknown {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const sensitiveKeys = [
      'apiKey',
      'api_key',
      'token',
      'password',
      'secret',
      'auth',
      'authorization',
      'credentials',
    ];

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeForLogging(item));
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeForLogging(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
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
      const sanitizedRequest = this.sanitizeForLogging(request);
      logger.info('MCP Request', { request: sanitizedRequest });
    }

    const result = await this.mcpClient.callTool(request);
    const durationMs = Date.now() - startTime;

    if (this.debug) {
      const sanitizedResult = this.sanitizeForLogging(result);
      logger.info('MCP Response', {
        toolName,
        duration: `${durationMs}ms`,
        result: sanitizedResult,
      });
    }

    // MCP tools MUST return structured content according to Scope3 API spec
    // If structuredContent is missing, this is an API bug that needs to be fixed upstream

    // Check for structuredContent (required)
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

    // FAIL LOUDLY: structuredContent is missing
    // This helps catch API bugs that need upstream fixes
    const content = result.content as Array<{ type: string; text?: string }> | undefined;
    const firstContent = content && content.length > 0 ? content[0] : null;
    const errorDetails = {
      toolName,
      hasContent: Boolean(content),
      contentType: firstContent?.type,
      textPreview:
        firstContent?.type === 'text' && firstContent.text
          ? firstContent.text.substring(0, 200)
          : undefined,
    };

    logger.error('MCP API VIOLATION: Missing structuredContent', errorDetails);

    throw new Error(
      `MCP API returned response without structuredContent for tool "${toolName}". ` +
        `This violates the Scope3 API specification. ` +
        `The API must be fixed to include structuredContent in all responses. ` +
        `Debug info: ${JSON.stringify(errorDetails)}`
    );
  }

  protected getClient(): Client {
    return this.mcpClient;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }
}
