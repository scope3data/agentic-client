export interface ClientConfig {
  apiKey: string;
  environment?: Environment;
  baseUrl?: string;
  timeout?: number;
  debug?: boolean;
}

export interface DebugInfo {
  toolName: string;
  request: Record<string, unknown>;
  response: unknown;
  rawResponse?: string;
  durationMs?: number;
}

export interface ToolResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ErrorResponse {
  error: string;
  details?: Record<string, unknown>;
}

export type Environment = 'production' | 'staging';
