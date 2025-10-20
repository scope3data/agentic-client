import { Scope3AgenticClient } from '../sdk';

describe('Scope3AgenticClient', () => {
  let client: Scope3AgenticClient;

  beforeEach(() => {
    client = new Scope3AgenticClient({
      apiKey: 'test-api-key',
    });
  });

  it('should initialize with default production URL', () => {
    expect(client).toBeDefined();
  });

  it('should have all resource modules', () => {
    expect(client.assets).toBeDefined();
    expect(client.brandAgents).toBeDefined();
    expect(client.brandStandards).toBeDefined();
    expect(client.brandStories).toBeDefined();
    expect(client.campaigns).toBeDefined();
    expect(client.channels).toBeDefined();
    expect(client.creatives).toBeDefined();
    expect(client.salesAgents).toBeDefined();
    expect(client.tactics).toBeDefined();
    expect(client.mediaBuys).toBeDefined();
    expect(client.notifications).toBeDefined();
    expect(client.products).toBeDefined();
  });

  it('should accept custom base URL', () => {
    const customClient = new Scope3AgenticClient({
      apiKey: 'test-api-key',
      baseUrl: 'https://custom.api.com',
    });
    expect(customClient).toBeDefined();
  });

  it('should accept custom timeout', () => {
    const customClient = new Scope3AgenticClient({
      apiKey: 'test-api-key',
      timeout: 60000,
    });
    expect(customClient).toBeDefined();
  });
});
