/**
 * Tests for Scope3Client
 */

import { Scope3Client } from '../client';

describe('Scope3Client', () => {
  describe('initialization', () => {
    it('should require apiKey', () => {
      expect(() => new Scope3Client({ apiKey: '', persona: 'buyer' })).toThrow(
        'apiKey is required'
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => new Scope3Client({} as any)).toThrow('apiKey is required');
    });

    it('should require persona', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => new Scope3Client({ apiKey: 'test-key' } as any)).toThrow('persona is required');
    });

    it('should default to v2 version', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
      expect(client.version).toBe('v2');
    });

    it('should allow custom version', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer', version: 'v1' });
      expect(client.version).toBe('v1');
    });

    it('should default to production base URL', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
      expect(client.baseUrl).toBe('https://api.agentic.scope3.com');
    });

    it('should use staging URL when environment is staging', () => {
      const client = new Scope3Client({
        apiKey: 'test-key',
        persona: 'buyer',
        environment: 'staging',
      });
      expect(client.baseUrl).toBe('https://api.agentic.staging.scope3.com');
    });

    it('should allow custom base URL', () => {
      const client = new Scope3Client({
        apiKey: 'test-key',
        persona: 'buyer',
        baseUrl: 'https://custom.api.com',
      });
      expect(client.baseUrl).toBe('https://custom.api.com');
    });

    it('should remove trailing slash from base URL', () => {
      const client = new Scope3Client({
        apiKey: 'test-key',
        persona: 'buyer',
        baseUrl: 'https://custom.api.com/',
      });
      expect(client.baseUrl).toBe('https://custom.api.com');
    });

    it('should store persona', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
      expect(client.persona).toBe('buyer');
    });
  });

  describe('buyer persona resources', () => {
    it('should have advertisers resource', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
      expect(client.advertisers).toBeDefined();
      expect(typeof client.advertisers.list).toBe('function');
      expect(typeof client.advertisers.get).toBe('function');
      expect(typeof client.advertisers.create).toBe('function');
      expect(typeof client.advertisers.update).toBe('function');
      expect(typeof client.advertisers.delete).toBe('function');
    });

    it('should have campaigns resource with type-specific methods', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
      expect(client.campaigns).toBeDefined();
      expect(typeof client.campaigns.list).toBe('function');
      expect(typeof client.campaigns.get).toBe('function');
      expect(typeof client.campaigns.createDiscovery).toBe('function');
      expect(typeof client.campaigns.updateDiscovery).toBe('function');
      expect(typeof client.campaigns.createPerformance).toBe('function');
      expect(typeof client.campaigns.updatePerformance).toBe('function');
      expect(typeof client.campaigns.createAudience).toBe('function');
      expect(typeof client.campaigns.execute).toBe('function');
      expect(typeof client.campaigns.pause).toBe('function');
    });

    it('should have bundles resource', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
      expect(client.bundles).toBeDefined();
      expect(typeof client.bundles.create).toBe('function');
      expect(typeof client.bundles.discoverProducts).toBe('function');
      expect(typeof client.bundles.browseProducts).toBe('function');
      expect(typeof client.bundles.products).toBe('function');
    });

    it('should return products resource for bundle with list, add, remove', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
      const products = client.bundles.products('bundle-123');
      expect(products).toBeDefined();
      expect(typeof products.list).toBe('function');
      expect(typeof products.add).toBe('function');
      expect(typeof products.remove).toBe('function');
    });

    it('should have signals resource', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
      expect(client.signals).toBeDefined();
      expect(typeof client.signals.discover).toBe('function');
      expect(typeof client.signals.list).toBe('function');
    });

    it('should have reporting resource', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
      expect(client.reporting).toBeDefined();
      expect(typeof client.reporting.get).toBe('function');
    });

    it('should have salesAgents resource', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
      expect(client.salesAgents).toBeDefined();
      expect(typeof client.salesAgents.list).toBe('function');
      expect(typeof client.salesAgents.registerAccount).toBe('function');
    });
  });

  describe('partner persona resources', () => {
    it('should have partners resource', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'partner' });
      expect(client.partners).toBeDefined();
      expect(typeof client.partners.list).toBe('function');
      expect(typeof client.partners.create).toBe('function');
      expect(typeof client.partners.update).toBe('function');
      expect(typeof client.partners.archive).toBe('function');
    });

    it('should have agents resource', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'partner' });
      expect(client.agents).toBeDefined();
      expect(typeof client.agents.list).toBe('function');
      expect(typeof client.agents.get).toBe('function');
      expect(typeof client.agents.register).toBe('function');
      expect(typeof client.agents.update).toBe('function');
    });

    it('should NOT have advertisers', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'partner' });
      expect(() => client.advertisers).toThrow(
        'advertisers is only available with the buyer persona'
      );
    });

    it('should NOT have campaigns', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'partner' });
      expect(() => client.campaigns).toThrow('campaigns is only available with the buyer persona');
    });
  });

  describe('adapter selection', () => {
    it('should default to REST adapter', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
      expect(client.baseUrl).toBe('https://api.agentic.scope3.com');
    });

    it('should use MCP adapter when specified', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer', adapter: 'mcp' });
      expect(client.baseUrl).toBe('https://api.agentic.scope3.com');
    });
  });

  describe('version handling', () => {
    it('should support latest version', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer', version: 'latest' });
      expect(client.version).toBe('latest');
    });

    it('should support v1 version', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer', version: 'v1' });
      expect(client.version).toBe('v1');
    });
  });

  describe('publisher persona', () => {
    it('should initialize without error', () => {
      expect(() => new Scope3Client({ apiKey: 'test-key', persona: 'publisher' })).not.toThrow();
    });

    it('should throw when accessing buyer resources', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'publisher' });
      expect(() => client.advertisers).toThrow(
        'advertisers is only available with the buyer persona'
      );
    });

    it('should throw when accessing partner resources', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'publisher' });
      expect(() => client.partners).toThrow('partners is only available with the partner persona');
    });
  });

  describe('connect/disconnect', () => {
    it('should connect and disconnect without error for REST', async () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
      await expect(client.connect()).resolves.toBeUndefined();
      await expect(client.disconnect()).resolves.toBeUndefined();
    });
  });

  describe('debug mode', () => {
    it('should default to debug off', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
      expect(client.debug).toBe(false);
    });

    it('should enable debug when specified', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer', debug: true });
      expect(client.debug).toBe(true);
    });
  });
});
