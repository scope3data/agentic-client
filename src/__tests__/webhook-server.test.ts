import { WebhookServer, WebhookHandler } from '../webhook-server';
import http from 'http';

/**
 * Helper: make an HTTP request to a running WebhookServer.
 * Avoids needing supertest as a dependency.
 */
function makeRequest(options: {
  port: number;
  method: string;
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
}): Promise<{ status: number; body: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    const payload = options.body ? JSON.stringify(options.body) : undefined;
    const req = http.request(
      {
        hostname: 'localhost',
        port: options.port,
        path: options.path,
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk: Buffer) => {
          data += chunk.toString();
        });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode ?? 0, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode ?? 0, body: {} });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

/** Pick a random high port to avoid test collisions */
function randomPort(): number {
  return 10000 + Math.floor(Math.random() * 50000);
}

describe('WebhookServer', () => {
  let server: WebhookServer;
  let port: number;

  afterEach(async () => {
    if (server) {
      await server.stop().catch(() => {
        // Server may already be stopped — ignore close errors
      });
    }
  });

  // ── Construction & defaults ────────────────────────────────────

  describe('constructor', () => {
    it('should initialize with default config', () => {
      server = new WebhookServer();
      expect(server).toBeDefined();
      expect(server.getUrl()).toBe('http://localhost:3000/webhooks');
    });

    it('should accept custom port, path, and secret', () => {
      server = new WebhookServer({ port: 4567, path: '/hooks', secret: 's3cret' });
      expect(server.getUrl()).toBe('http://localhost:4567/hooks');
    });

    it('should warn when no secret is configured', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      server = new WebhookServer();
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('No secret configured'));
      warnSpy.mockRestore();
    });

    it('should not warn when secret IS configured', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      server = new WebhookServer({ secret: 'tok' });
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  // ── getUrl ─────────────────────────────────────────────────────

  describe('getUrl', () => {
    it('should return URL based on port and path', () => {
      server = new WebhookServer({ port: 8888, path: '/events' });
      expect(server.getUrl()).toBe('http://localhost:8888/events');
    });

    it('should use defaults when nothing is provided', () => {
      server = new WebhookServer();
      expect(server.getUrl()).toBe('http://localhost:3000/webhooks');
    });
  });

  // ── Handler registration (on / off) ───────────────────────────

  describe('handler registration', () => {
    beforeEach(() => {
      server = new WebhookServer();
    });

    it('should register a handler for a specific event type', () => {
      const handler = jest.fn();
      server.on('order.created', handler);
      // No assertion on internal state — verified through dispatch tests
      expect(handler).not.toHaveBeenCalled();
    });

    it('should register a wildcard handler', () => {
      const handler = jest.fn();
      server.on('*', handler);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should allow multiple handlers for the same event type', () => {
      const h1 = jest.fn();
      const h2 = jest.fn();
      server.on('order.created', h1);
      server.on('order.created', h2);
      // Both registered without error
    });

    it('should allow the same handler for different event types', () => {
      const handler = jest.fn();
      server.on('order.created', handler);
      server.on('order.updated', handler);
    });
  });

  describe('handler removal', () => {
    beforeEach(() => {
      server = new WebhookServer();
    });

    it('off(type) without handler removes all handlers for that type', () => {
      const h1 = jest.fn();
      const h2 = jest.fn();
      server.on('order.created', h1);
      server.on('order.created', h2);
      server.off('order.created');
      // Verified through dispatch tests — handlers should not fire
    });

    it('off(type, handler) removes only the specific handler', () => {
      const h1 = jest.fn();
      const h2 = jest.fn();
      server.on('order.created', h1);
      server.on('order.created', h2);
      server.off('order.created', h1);
      // h2 should still be registered (verified through dispatch)
    });

    it('off() is safe when no handlers exist for the type', () => {
      expect(() => server.off('nonexistent')).not.toThrow();
      expect(() => server.off('nonexistent', jest.fn())).not.toThrow();
    });

    it('off() with a handler that was never registered does nothing', () => {
      const registered = jest.fn();
      const notRegistered = jest.fn();
      server.on('order.created', registered);
      server.off('order.created', notRegistered);
      // registered is still there (verified through dispatch)
    });
  });

  // ── Lifecycle (start / stop) ───────────────────────────────────

  describe('lifecycle', () => {
    it('should start and begin listening', async () => {
      port = randomPort();
      server = new WebhookServer({ port });
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      await server.start();
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(`listening on port ${port}`));
      logSpy.mockRestore();
    });

    it('should stop gracefully', async () => {
      port = randomPort();
      server = new WebhookServer({ port });
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      await server.start();
      await server.stop();
      expect(logSpy).toHaveBeenCalledWith('Webhook server stopped');
      logSpy.mockRestore();
    });

    it('should resolve immediately when stopping a server that was never started', async () => {
      server = new WebhookServer();
      await expect(server.stop()).resolves.toBeUndefined();
    });

    it('should reject start when port is already in use', async () => {
      port = randomPort();
      const first = new WebhookServer({ port });
      await first.start();

      const second = new WebhookServer({ port });
      await expect(second.start()).rejects.toThrow();

      await first.stop();
    });
  });

  // ── Health endpoint ────────────────────────────────────────────

  describe('GET /health', () => {
    it('should return status ok', async () => {
      port = randomPort();
      server = new WebhookServer({ port });
      jest.spyOn(console, 'log').mockImplementation();
      jest.spyOn(console, 'warn').mockImplementation();
      await server.start();

      const res = await makeRequest({ port, method: 'GET', path: '/health' });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });

    it('should respond to /health even when secret is configured', async () => {
      port = randomPort();
      server = new WebhookServer({ port, secret: 'my-secret' });
      jest.spyOn(console, 'log').mockImplementation();
      await server.start();

      // /health is behind the auth middleware when secret is set,
      // so it should require auth too (express middleware applies globally)
      const resNoAuth = await makeRequest({ port, method: 'GET', path: '/health' });
      // The auth middleware is applied globally, so /health requires auth
      expect(resNoAuth.status).toBe(401);

      const resWithAuth = await makeRequest({
        port,
        method: 'GET',
        path: '/health',
        headers: { Authorization: 'Bearer my-secret' },
      });
      expect(resWithAuth.status).toBe(200);
      expect(resWithAuth.body).toEqual({ status: 'ok' });
    });
  });

  // ── Event dispatch via HTTP ────────────────────────────────────

  describe('event dispatch', () => {
    beforeEach(async () => {
      port = randomPort();
      server = new WebhookServer({ port });
      jest.spyOn(console, 'log').mockImplementation();
      jest.spyOn(console, 'warn').mockImplementation();
      await server.start();
    });

    it('should invoke the specific handler for a matching event type', async () => {
      const handler = jest.fn();
      server.on('order.created', handler);

      const event = { type: 'order.created', timestamp: '2026-01-01T00:00:00Z', data: { id: '1' } };
      const res = await makeRequest({ port, method: 'POST', path: '/webhooks', body: event });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(event);
    });

    it('should invoke the wildcard handler for any event type', async () => {
      const wildcard = jest.fn();
      server.on('*', wildcard);

      const event = { type: 'anything', timestamp: '', data: {} };
      await makeRequest({ port, method: 'POST', path: '/webhooks', body: event });

      expect(wildcard).toHaveBeenCalledTimes(1);
      expect(wildcard).toHaveBeenCalledWith(event);
    });

    it('should invoke both specific and wildcard handlers', async () => {
      const specific = jest.fn();
      const wildcard = jest.fn();
      server.on('order.created', specific);
      server.on('*', wildcard);

      const event = { type: 'order.created', timestamp: '', data: {} };
      await makeRequest({ port, method: 'POST', path: '/webhooks', body: event });

      expect(specific).toHaveBeenCalledTimes(1);
      expect(wildcard).toHaveBeenCalledTimes(1);
    });

    it('should invoke multiple handlers registered for the same type', async () => {
      const h1 = jest.fn();
      const h2 = jest.fn();
      server.on('order.created', h1);
      server.on('order.created', h2);

      const event = { type: 'order.created', timestamp: '', data: {} };
      await makeRequest({ port, method: 'POST', path: '/webhooks', body: event });

      expect(h1).toHaveBeenCalledTimes(1);
      expect(h2).toHaveBeenCalledTimes(1);
    });

    it('should not invoke handlers for non-matching event types', async () => {
      const handler = jest.fn();
      server.on('order.created', handler);

      const event = { type: 'order.updated', timestamp: '', data: {} };
      await makeRequest({ port, method: 'POST', path: '/webhooks', body: event });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should not invoke removed handlers (off with no handler arg)', async () => {
      const handler = jest.fn();
      server.on('order.created', handler);
      server.off('order.created');

      const event = { type: 'order.created', timestamp: '', data: {} };
      await makeRequest({ port, method: 'POST', path: '/webhooks', body: event });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should not invoke a specific removed handler but still invoke remaining ones', async () => {
      const h1 = jest.fn();
      const h2 = jest.fn();
      server.on('order.created', h1);
      server.on('order.created', h2);
      server.off('order.created', h1);

      const event = { type: 'order.created', timestamp: '', data: {} };
      await makeRequest({ port, method: 'POST', path: '/webhooks', body: event });

      expect(h1).not.toHaveBeenCalled();
      expect(h2).toHaveBeenCalledTimes(1);
    });

    it('should handle async handlers', async () => {
      const order: string[] = [];
      const asyncHandler: WebhookHandler = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        order.push('async');
      };
      const syncHandler: WebhookHandler = () => {
        order.push('sync');
      };
      server.on('test', asyncHandler);
      server.on('test', syncHandler);

      const event = { type: 'test', timestamp: '', data: {} };
      const res = await makeRequest({ port, method: 'POST', path: '/webhooks', body: event });

      expect(res.status).toBe(200);
      expect(order).toContain('async');
      expect(order).toContain('sync');
    });

    it('should succeed with 200 when no handlers are registered for the event type', async () => {
      const event = { type: 'unhandled.event', timestamp: '', data: {} };
      const res = await makeRequest({ port, method: 'POST', path: '/webhooks', body: event });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
    });
  });

  // ── Invalid events (400) ───────────────────────────────────────

  describe('invalid events', () => {
    beforeEach(async () => {
      port = randomPort();
      server = new WebhookServer({ port });
      jest.spyOn(console, 'log').mockImplementation();
      jest.spyOn(console, 'warn').mockImplementation();
      await server.start();
    });

    it('should return 400 when body is missing the type field', async () => {
      const res = await makeRequest({
        port,
        method: 'POST',
        path: '/webhooks',
        body: { data: { foo: 'bar' } },
      });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Invalid webhook event format' });
    });

    it('should return 400 when type is empty string', async () => {
      const res = await makeRequest({
        port,
        method: 'POST',
        path: '/webhooks',
        body: { type: '', data: {} },
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 when type is not a string', async () => {
      const res = await makeRequest({
        port,
        method: 'POST',
        path: '/webhooks',
        body: { type: 123, data: {} },
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for null body', async () => {
      const res = await makeRequest({
        port,
        method: 'POST',
        path: '/webhooks',
        body: null,
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for an array body', async () => {
      const res = await makeRequest({
        port,
        method: 'POST',
        path: '/webhooks',
        body: [{ type: 'order.created' }],
      });
      // Arrays technically pass typeof === 'object', but lack type at the top level
      // Express parses this as an array which has no .type property
      expect(res.status).toBe(400);
    });
  });

  // ── Handler errors (500) ───────────────────────────────────────

  describe('handler errors', () => {
    beforeEach(async () => {
      port = randomPort();
      server = new WebhookServer({ port });
      jest.spyOn(console, 'log').mockImplementation();
      jest.spyOn(console, 'warn').mockImplementation();
      await server.start();
    });

    it('should return 500 when a handler throws synchronously', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      server.on('fail', () => {
        throw new Error('handler boom');
      });

      const res = await makeRequest({
        port,
        method: 'POST',
        path: '/webhooks',
        body: { type: 'fail', timestamp: '', data: {} },
      });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Internal server error' });
      expect(errorSpy).toHaveBeenCalledWith('Webhook handler error:', 'handler boom');
      errorSpy.mockRestore();
    });

    it('should return 500 when an async handler rejects', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      server.on('fail', async () => {
        throw new Error('async boom');
      });

      const res = await makeRequest({
        port,
        method: 'POST',
        path: '/webhooks',
        body: { type: 'fail', timestamp: '', data: {} },
      });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Internal server error' });
      errorSpy.mockRestore();
    });

    it('should handle non-Error throws gracefully', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      server.on('fail', () => {
        throw 'string error'; // eslint-disable-line no-throw-literal
      });

      const res = await makeRequest({
        port,
        method: 'POST',
        path: '/webhooks',
        body: { type: 'fail', timestamp: '', data: {} },
      });

      expect(res.status).toBe(500);
      expect(errorSpy).toHaveBeenCalledWith('Webhook handler error:', 'Unknown error');
      errorSpy.mockRestore();
    });

    it('should not crash the server after a handler error', async () => {
      jest.spyOn(console, 'error').mockImplementation();
      server.on('fail', () => {
        throw new Error('boom');
      });

      // First request triggers error
      await makeRequest({
        port,
        method: 'POST',
        path: '/webhooks',
        body: { type: 'fail', timestamp: '', data: {} },
      });

      // Server should still be responsive
      const healthRes = await makeRequest({ port, method: 'GET', path: '/health' });
      expect(healthRes.status).toBe(200);

      // A valid event should still be processed
      const okHandler = jest.fn();
      server.on('ok', okHandler);
      const res = await makeRequest({
        port,
        method: 'POST',
        path: '/webhooks',
        body: { type: 'ok', timestamp: '', data: {} },
      });
      expect(res.status).toBe(200);
      expect(okHandler).toHaveBeenCalledTimes(1);
    });
  });

  // ── Authentication ─────────────────────────────────────────────

  describe('authentication', () => {
    it('should not require auth when no secret is configured', async () => {
      port = randomPort();
      server = new WebhookServer({ port });
      jest.spyOn(console, 'log').mockImplementation();
      jest.spyOn(console, 'warn').mockImplementation();
      await server.start();

      const res = await makeRequest({
        port,
        method: 'POST',
        path: '/webhooks',
        body: { type: 'test', timestamp: '', data: {} },
      });
      expect(res.status).toBe(200);
    });

    it('should return 401 when secret is set and no Authorization header is sent', async () => {
      port = randomPort();
      server = new WebhookServer({ port, secret: 'test-secret' });
      jest.spyOn(console, 'log').mockImplementation();
      await server.start();

      const res = await makeRequest({
        port,
        method: 'POST',
        path: '/webhooks',
        body: { type: 'test', timestamp: '', data: {} },
      });
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Unauthorized' });
    });

    it('should return 401 when the wrong token is provided', async () => {
      port = randomPort();
      server = new WebhookServer({ port, secret: 'correct-secret' });
      jest.spyOn(console, 'log').mockImplementation();
      await server.start();

      const res = await makeRequest({
        port,
        method: 'POST',
        path: '/webhooks',
        body: { type: 'test', timestamp: '', data: {} },
        headers: { Authorization: 'Bearer wrong-secret' },
      });
      expect(res.status).toBe(401);
    });

    it('should return 401 when Authorization header format is wrong', async () => {
      port = randomPort();
      server = new WebhookServer({ port, secret: 'my-secret' });
      jest.spyOn(console, 'log').mockImplementation();
      await server.start();

      const res = await makeRequest({
        port,
        method: 'POST',
        path: '/webhooks',
        body: { type: 'test', timestamp: '', data: {} },
        headers: { Authorization: 'Basic my-secret' },
      });
      expect(res.status).toBe(401);
    });

    it('should accept requests with the correct Bearer token', async () => {
      port = randomPort();
      server = new WebhookServer({ port, secret: 'valid-token' });
      jest.spyOn(console, 'log').mockImplementation();
      await server.start();

      const handler = jest.fn();
      server.on('authed', handler);

      const res = await makeRequest({
        port,
        method: 'POST',
        path: '/webhooks',
        body: { type: 'authed', timestamp: '', data: {} },
        headers: { Authorization: 'Bearer valid-token' },
      });

      expect(res.status).toBe(200);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should reject tokens of different length via timing-safe comparison', async () => {
      port = randomPort();
      server = new WebhookServer({ port, secret: 'short' });
      jest.spyOn(console, 'log').mockImplementation();
      await server.start();

      const res = await makeRequest({
        port,
        method: 'POST',
        path: '/webhooks',
        body: { type: 'test', timestamp: '', data: {} },
        headers: { Authorization: 'Bearer a-much-longer-token-value' },
      });
      expect(res.status).toBe(401);
    });
  });

  // ── Custom path ────────────────────────────────────────────────

  describe('custom webhook path', () => {
    it('should accept events on custom path', async () => {
      port = randomPort();
      server = new WebhookServer({ port, path: '/custom/hooks' });
      jest.spyOn(console, 'log').mockImplementation();
      jest.spyOn(console, 'warn').mockImplementation();
      await server.start();

      const handler = jest.fn();
      server.on('test', handler);

      const res = await makeRequest({
        port,
        method: 'POST',
        path: '/custom/hooks',
        body: { type: 'test', timestamp: '', data: {} },
      });

      expect(res.status).toBe(200);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should return 404 on default path when custom path is configured', async () => {
      port = randomPort();
      server = new WebhookServer({ port, path: '/custom/hooks' });
      jest.spyOn(console, 'log').mockImplementation();
      jest.spyOn(console, 'warn').mockImplementation();
      await server.start();

      const res = await makeRequest({
        port,
        method: 'POST',
        path: '/webhooks',
        body: { type: 'test', timestamp: '', data: {} },
      });

      // Express returns 404 for unmatched routes (no body by default)
      expect(res.status).toBe(404);
    });
  });
});
