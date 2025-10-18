import axios, { AxiosInstance, AxiosError } from 'axios';
import { ClientConfig, Environment, ErrorResponse } from './types';

export class Scope3Client {
  private readonly client: AxiosInstance;
  private readonly apiKey: string;

  constructor(config: ClientConfig) {
    this.apiKey = config.apiKey;

    const baseURL = config.baseUrl || this.getDefaultBaseUrl('production');

    this.client = axios.create({
      baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    this.setupInterceptors();
  }

  private getDefaultBaseUrl(env: Environment): string {
    return env === 'production'
      ? 'https://api.agentic.scope3.com'
      : 'https://api.agentic.staging.scope3.com';
  }

  private setupInterceptors(): void {
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ErrorResponse>) => {
        if (error.response) {
          const errorData = error.response.data;
          throw new Error(
            errorData?.error || `API Error: ${error.response.status} ${error.response.statusText}`
          );
        } else if (error.request) {
          throw new Error('No response received from API');
        } else {
          throw new Error(`Request setup error: ${error.message}`);
        }
      }
    );
  }

  protected async post<TRequest, TResponse>(
    endpoint: string,
    data: TRequest
  ): Promise<TResponse> {
    const response = await this.client.post<TResponse>(endpoint, data);
    return response.data;
  }

  protected getClient(): AxiosInstance {
    return this.client;
  }
}
