/**
 * Simple structured logging utility
 *
 * Outputs logs in JSON format in production, human-readable in development.
 */

type LogSeverity = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';

export class Logger {
  private static instance: Logger;
  private readonly isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.log('DEBUG', message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log('INFO', message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log('WARNING', message, data);
  }

  error(message: string, error?: unknown, data?: Record<string, unknown>): void {
    const errorData: Record<string, unknown> = { ...data };

    if (error instanceof Error) {
      errorData.error = {
        message: error.message,
        name: error.name,
        stack: error.stack,
      };
    } else if (error) {
      errorData.error = String(error);
    }

    this.log('ERROR', message, errorData);
  }

  private log(severity: LogSeverity, message: string, data?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      // Development: Human-readable format
      const prefix = `[${severity}]`;
      const timestamp = new Date().toISOString();
      const logMessage = `${timestamp} ${prefix} ${message}`;

      if (data) {
        console.error(logMessage, JSON.stringify(data, null, 2));
      } else {
        console.error(logMessage);
      }
    } else {
      // Production: Structured JSON
      const structuredLog: Record<string, unknown> = {
        message,
        severity,
        timestamp: new Date().toISOString(),
        ...data,
      };

      console.error(JSON.stringify(structuredLog));
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
