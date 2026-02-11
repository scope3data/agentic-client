import { timingSafeEqual } from 'crypto';
import express from 'express';
import type { Express, Request, Response, NextFunction } from 'express';
import { Server } from 'http';

export interface WebhookEvent<T = Record<string, unknown>> {
  type: string;
  timestamp: string;
  data: T;
}

export type WebhookHandler = (event: WebhookEvent) => Promise<void> | void;

export interface WebhookServerConfig {
  port?: number;
  path?: string;
  secret?: string;
}

export class WebhookServer {
  private app: Express;
  private server?: Server;
  private handlers: Map<string, WebhookHandler[]>;
  private config: Required<WebhookServerConfig>;

  constructor(config: WebhookServerConfig = {}) {
    this.app = express();
    this.handlers = new Map();
    this.config = {
      port: config.port ?? 3000,
      path: config.path ?? '/webhooks',
      secret: config.secret ?? '',
    };

    if (!this.config.secret) {
      console.warn('WebhookServer: No secret configured. Webhook endpoint is unauthenticated.');
    }

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json({ limit: '10kb' }));

    if (this.config.secret) {
      this.app.use((req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers['authorization'];
        const expectedAuth = `Bearer ${this.config.secret}`;

        if (
          !authHeader ||
          authHeader.length !== expectedAuth.length ||
          !timingSafeEqual(Buffer.from(authHeader), Buffer.from(expectedAuth))
        ) {
          res.status(401).json({ error: 'Unauthorized' });
          return;
        }

        next();
      });
    }
  }

  private setupRoutes(): void {
    this.app.post(this.config.path, async (req: Request, res: Response) => {
      try {
        const body = req.body;
        if (!body || typeof body !== 'object' || typeof body.type !== 'string' || !body.type) {
          res.status(400).json({ error: 'Invalid webhook event format' });
          return;
        }
        const event = body as WebhookEvent;

        const handlers = this.handlers.get(event.type) || [];
        const allHandlers = this.handlers.get('*') || [];

        await Promise.all([
          ...handlers.map((handler) => handler(event)),
          ...allHandlers.map((handler) => handler(event)),
        ]);

        res.status(200).json({ success: true });
      } catch (error) {
        console.error(
          'Webhook handler error:',
          error instanceof Error ? error.message : 'Unknown error'
        );
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    this.app.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({ status: 'ok' });
    });
  }

  on(eventType: string, handler: WebhookHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    const handlers = this.handlers.get(eventType) ?? [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }

  off(eventType: string, handler?: WebhookHandler): void {
    if (!handler) {
      this.handlers.delete(eventType);
      return;
    }

    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.config.port, () => {
        console.log(`Webhook server listening on port ${this.config.port}`);
        console.log(`Webhook endpoint: http://localhost:${this.config.port}${this.config.path}`);
        resolve();
      });
      this.server.on('error', (err) => {
        reject(err);
      });
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Webhook server stopped');
          resolve();
        }
      });
    });
  }

  getUrl(): string {
    return `http://localhost:${this.config.port}${this.config.path}`;
  }
}
