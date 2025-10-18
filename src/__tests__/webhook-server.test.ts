import { WebhookServer, WebhookEvent } from '../webhook-server';

describe('WebhookServer', () => {
  let server: WebhookServer;

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  });

  it('should initialize with default config', () => {
    server = new WebhookServer();
    expect(server).toBeDefined();
  });

  it('should initialize with custom config', () => {
    server = new WebhookServer({
      port: 4000,
      path: '/custom-webhooks',
      secret: 'test-secret',
    });
    expect(server).toBeDefined();
  });

  it('should register event handlers', () => {
    server = new WebhookServer();
    const handler = jest.fn();
    server.on('test-event', handler);
    expect(handler).not.toHaveBeenCalled();
  });

  it('should unregister event handlers', () => {
    server = new WebhookServer();
    const handler = jest.fn();
    server.on('test-event', handler);
    server.off('test-event', handler);
    expect(handler).not.toHaveBeenCalled();
  });

  it('should return webhook URL', () => {
    server = new WebhookServer({ port: 3000, path: '/webhooks' });
    expect(server.getUrl()).toBe('http://localhost:3000/webhooks');
  });
});
