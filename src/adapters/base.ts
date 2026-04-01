/**
 * Base adapter interface for Scope3 API communication
 */

import type { ApiVersion, Persona, Scope3ClientConfig } from '../types';
import type { ValidateMode } from '../validation';

/**
 * HTTP methods supported by the adapter
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Request options for adapter calls
 */
export interface RequestOptions {
  /** Query parameters */
  params?: Record<string, string | number | boolean | undefined>;
  /** Request timeout override */
  timeout?: number;
}

/**
 * Base adapter interface that all adapters must implement
 */
export interface BaseAdapter {
  /** Base URL for API requests */
  readonly baseUrl: string;
  /** API version being used */
  readonly version: ApiVersion;
  /** API persona being used */
  readonly persona: Persona;
  /** Whether debug mode is enabled */
  readonly debug: boolean;
  /** Validation mode */
  readonly validate: ValidateMode | undefined;

  /**
   * Make an API request
   * @param method HTTP method
   * @param path API path (without base URL, version, or persona prefix)
   * @param body Request body (for POST/PUT/PATCH/DELETE)
   * @param options Additional request options
   */
  request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T>;

  /**
   * Connect to the API (for adapters that require connection setup)
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the API (for adapters that require cleanup)
   */
  disconnect(): Promise<void>;
}

/**
 * Get the default base URL for an environment
 */
export function getDefaultBaseUrl(environment: 'production' | 'staging' = 'production'): string {
  return environment === 'staging'
    ? 'https://api.agentic.staging.scope3.com'
    : 'https://api.agentic.scope3.com';
}

/**
 * Resolve the base URL from config
 */
export function resolveBaseUrl(config: Scope3ClientConfig): string {
  if (config.baseUrl) {
    return config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }
  return getDefaultBaseUrl(config.environment);
}

/**
 * Resolve the API version from config
 */
export function resolveVersion(config: Scope3ClientConfig): ApiVersion {
  return config.version ?? 'v2';
}

/**
 * Resolve the persona from config
 */
export function resolvePersona(config: Scope3ClientConfig): Persona {
  return config.persona;
}

/**
 * Validate and encode a resource ID for use in URL paths
 * Prevents path traversal and URL injection
 */
export function validateResourceId(id: string): string {
  if (!id || typeof id !== 'string') {
    throw new Scope3ApiError(400, 'Resource ID is required');
  }
  if (
    id.includes('/') ||
    id.includes('\\') ||
    id.includes('?') ||
    id.includes('#') ||
    id.includes('..')
  ) {
    throw new Scope3ApiError(400, 'Invalid resource ID format');
  }
  return encodeURIComponent(id);
}

/**
 * Custom error class for Scope3 API errors
 */
export class Scope3ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'Scope3ApiError';
  }
}

/**
 * Sanitize data for logging (remove sensitive fields)
 */
export function sanitizeForLogging(obj: unknown, depth = 0): unknown {
  if (depth > 10 || obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForLogging(item, depth + 1));
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    const sensitiveKeys = ['apiKey', 'api_key', 'token', 'password', 'secret', 'authorization'];

    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeForLogging(value, depth + 1);
      }
    }
    return sanitized;
  }

  return obj;
}
