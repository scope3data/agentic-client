/**
 * REST adapter for Scope3 API
 * Primary adapter for human developers and CLI
 */

import type { ApiVersion, Persona, Scope3ClientConfig } from '../types';
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

/**
 * REST adapter implementation using native fetch
 */
export class RestAdapter implements BaseAdapter {
  readonly baseUrl: string;
  readonly version: ApiVersion;
  readonly persona: Persona;
  readonly debug: boolean;

  private readonly apiKey: string;
  private readonly timeout: number;

  constructor(config: Scope3ClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = resolveBaseUrl(config);
    this.version = resolveVersion(config);
    this.persona = resolvePersona(config);
    this.debug = config.debug ?? false;
    this.timeout = config.timeout ?? 30000;

    if (this.debug) {
      logger.setDebug(true);
      logger.debug('RestAdapter initialized', {
        baseUrl: this.baseUrl,
        version: this.version,
        persona: this.persona,
      });
    }
  }

  /**
   * Make an HTTP request to the Scope3 API
   */
  async request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const startTime = Date.now();

    // Build URL: publisher uses /api/v1/{path}, others use /api/{version}/{persona}/{path}
    let url: string;
    if (this.persona === 'publisher') {
      url = `${this.baseUrl}/api/v1${path}`;
    } else {
      const versionPath = this.version === 'latest' ? 'v2' : this.version;
      url = `${this.baseUrl}/api/${versionPath}/${this.persona}${path}`;
    }

    // Add query parameters
    if (options?.params) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      }
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    // Build request options
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      signal: AbortSignal.timeout(options?.timeout ?? this.timeout),
    };

    if (
      body &&
      (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE')
    ) {
      fetchOptions.body = JSON.stringify(body);
    }

    if (this.debug) {
      logger.debug('REST Request', {
        method,
        url,
        body: body ? sanitizeForLogging(body) : undefined,
      });
    }

    try {
      const response = await fetch(url, fetchOptions);
      const durationMs = Date.now() - startTime;

      // Handle 204 No Content
      if (response.status === 204) {
        if (this.debug) {
          logger.debug('REST Response', { status: 204, durationMs });
        }
        return undefined as T;
      }

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data: unknown;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text ? { message: text } : {};
      }

      if (this.debug) {
        logger.debug('REST Response', {
          status: response.status,
          durationMs,
          data: sanitizeForLogging(data),
        });
      }

      // Handle error responses
      if (!response.ok) {
        // Extract error from API envelope: { error: { code, message, details } }
        const envelope = data as Record<string, unknown>;
        const apiError = envelope?.error as Record<string, unknown> | undefined;

        const errorMessage =
          (apiError?.message as string) ??
          (envelope?.message as string) ??
          `HTTP ${response.status}`;

        const details = (apiError?.details as Record<string, unknown>) ?? undefined;

        throw new Scope3ApiError(response.status, errorMessage, details);
      }

      return data as T;
    } catch (error) {
      if (error instanceof Scope3ApiError) {
        throw error;
      }

      // Handle fetch errors (network, timeout, etc.)
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
          throw new Scope3ApiError(408, `Request timeout after ${this.timeout}ms`);
        }
        throw new Scope3ApiError(0, `Network error: ${error.message}`);
      }

      throw new Scope3ApiError(0, 'Unknown error occurred');
    }
  }

  /**
   * REST adapter doesn't need explicit connection
   */
  async connect(): Promise<void> {
    // No-op for REST adapter
  }

  /**
   * REST adapter doesn't need explicit disconnection
   */
  async disconnect(): Promise<void> {
    // No-op for REST adapter
  }
}
