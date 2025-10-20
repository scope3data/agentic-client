export interface ClientConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
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
