/**
 * Tests for Scope3Client (REST-only)
 */

import { Scope3Client } from '../client';
import { ConversionEventsResource } from '../resources/conversion-events';
import { CreativeSetsResource } from '../resources/creative-sets';
import { TestCohortsResource } from '../resources/test-cohorts';
import { BundleProductsResource } from '../resources/products';
import { TasksResource } from '../resources/tasks';
import { PropertyListChecksResource } from '../resources/property-lists';
import { EventSourcesResource } from '../resources/event-sources';
import { MeasurementDataResource } from '../resources/measurement-data';
import { CatalogsResource } from '../resources/catalogs';
import { AudiencesResource } from '../resources/audiences';
import { SyndicationResource } from '../resources/syndication';
import { PropertyListsResource } from '../resources/property-lists';
import { CreativesResource } from '../resources/creatives';

jest.mock('../skill', () => ({
  fetchSkillMd: jest.fn(),
  parseSkillMd: jest.fn(),
}));

import { fetchSkillMd, parseSkillMd } from '../skill';

const mockFetchSkillMd = fetchSkillMd as jest.Mock;
const mockParseSkillMd = parseSkillMd as jest.Mock;

describe('Scope3Client', () => {
  describe('initialization', () => {
    it('should require apiKey', () => {
      expect(() => new Scope3Client({ apiKey: '', persona: 'buyer' })).toThrow(
        'apiKey is required'
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => new Scope3Client({} as any)).toThrow('apiKey is required');
    });

    it('should throw for whitespace-only apiKey', () => {
      expect(() => new Scope3Client({ apiKey: '   ', persona: 'buyer' })).toThrow(
        'apiKey is required'
      );
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

    it('should have tasks resource', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
      expect(client.tasks).toBeDefined();
      expect(client.tasks).toBeInstanceOf(TasksResource);
      expect(typeof client.tasks.get).toBe('function');
    });

    it('should have propertyListChecks resource', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
      expect(client.propertyListChecks).toBeDefined();
      expect(client.propertyListChecks).toBeInstanceOf(PropertyListChecksResource);
      expect(typeof client.propertyListChecks.check).toBe('function');
      expect(typeof client.propertyListChecks.getReport).toBe('function');
    });
  });

  describe('storefront persona resources', () => {
    it('should have storefront resource', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'storefront' });
      expect(client.storefront).toBeDefined();
      expect(typeof client.storefront.get).toBe('function');
      expect(typeof client.storefront.create).toBe('function');
      expect(typeof client.storefront.update).toBe('function');
      expect(typeof client.storefront.delete).toBe('function');
    });

    it('should have inventorySources resource', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'storefront' });
      expect(client.inventorySources).toBeDefined();
      expect(typeof client.inventorySources.list).toBe('function');
      expect(typeof client.inventorySources.get).toBe('function');
      expect(typeof client.inventorySources.create).toBe('function');
      expect(typeof client.inventorySources.update).toBe('function');
      expect(typeof client.inventorySources.delete).toBe('function');
    });

    it('should have agents resource', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'storefront' });
      expect(client.agents).toBeDefined();
      expect(typeof client.agents.list).toBe('function');
      expect(typeof client.agents.get).toBe('function');
      expect(typeof client.agents.update).toBe('function');
    });

    it('should have readiness resource', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'storefront' });
      expect(client.readiness).toBeDefined();
      expect(typeof client.readiness.check).toBe('function');
    });

    it('should have billing resource', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'storefront' });
      expect(client.billing).toBeDefined();
      expect(typeof client.billing.get).toBe('function');
      expect(typeof client.billing.connect).toBe('function');
      expect(typeof client.billing.status).toBe('function');
      expect(typeof client.billing.transactions).toBe('function');
      expect(typeof client.billing.payouts).toBe('function');
      expect(typeof client.billing.onboardingUrl).toBe('function');
    });

    it('should have notifications resource', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'storefront' });
      expect(client.notifications).toBeDefined();
      expect(typeof client.notifications.list).toBe('function');
      expect(typeof client.notifications.markAsRead).toBe('function');
      expect(typeof client.notifications.acknowledge).toBe('function');
      expect(typeof client.notifications.markAllAsRead).toBe('function');
    });

    it('should NOT have advertisers', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'storefront' });
      expect(() => client.advertisers).toThrow(
        'advertisers is only available with the buyer persona'
      );
    });

    it('should NOT have campaigns', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'storefront' });
      expect(() => client.campaigns).toThrow('campaigns is only available with the buyer persona');
    });
  });

  describe('buyer persona cannot access storefront resources', () => {
    it('should throw when accessing storefront', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
      expect(() => client.storefront).toThrow(
        'storefront is only available with the storefront persona'
      );
    });

    it('should throw when accessing inventorySources', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
      expect(() => client.inventorySources).toThrow(
        'inventorySources is only available with the storefront persona'
      );
    });

    it('should throw when accessing agents', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
      expect(() => client.agents).toThrow('agents is only available with the storefront persona');
    });

    it('should throw when accessing readiness', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
      expect(() => client.readiness).toThrow(
        'readiness is only available with the storefront persona'
      );
    });

    it('should throw when accessing billing', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
      expect(() => client.billing).toThrow('billing is only available with the storefront persona');
    });

    it('should throw when accessing notifications', () => {
      const client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
      expect(() => client.notifications).toThrow(
        'notifications is only available with the storefront persona'
      );
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

  // ── getSkill ─────────────────────────────────────────────────

  describe('getSkill', () => {
    let client: Scope3Client;

    const fakeParsed = {
      name: 'scope3-agentic-buyer',
      version: '2.0.0',
      description: 'Buyer skill',
      apiBase: 'https://api.agentic.scope3.com',
      commands: [],
      examples: [],
    };

    beforeEach(() => {
      mockFetchSkillMd.mockReset();
      mockParseSkillMd.mockReset();
      client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
    });

    it('should fetch and parse skill.md on first call', async () => {
      mockFetchSkillMd.mockResolvedValue('# Skill\nraw markdown');
      mockParseSkillMd.mockReturnValue(fakeParsed);

      const result = await client.getSkill();

      expect(mockFetchSkillMd).toHaveBeenCalledTimes(1);
      expect(mockFetchSkillMd).toHaveBeenCalledWith({
        version: 'v2',
        persona: 'buyer',
        baseUrl: 'https://api.agentic.scope3.com',
      });
      expect(mockParseSkillMd).toHaveBeenCalledTimes(1);
      expect(mockParseSkillMd).toHaveBeenCalledWith('# Skill\nraw markdown');
      expect(result).toEqual(fakeParsed);
    });

    it('should cache the result and only fetch once', async () => {
      mockFetchSkillMd.mockResolvedValue('markdown');
      mockParseSkillMd.mockReturnValue(fakeParsed);

      const first = await client.getSkill();
      const second = await client.getSkill();
      const third = await client.getSkill();

      expect(mockFetchSkillMd).toHaveBeenCalledTimes(1);
      expect(mockParseSkillMd).toHaveBeenCalledTimes(1);
      expect(first).toBe(second);
      expect(second).toBe(third);
    });

    it('should return the same promise for concurrent calls', async () => {
      mockFetchSkillMd.mockResolvedValue('markdown');
      mockParseSkillMd.mockReturnValue(fakeParsed);

      const [a, b, c] = await Promise.all([
        client.getSkill(),
        client.getSkill(),
        client.getSkill(),
      ]);

      expect(mockFetchSkillMd).toHaveBeenCalledTimes(1);
      expect(a).toBe(b);
      expect(b).toBe(c);
    });

    it('should clear cache on error so next call retries', async () => {
      mockFetchSkillMd.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.getSkill()).rejects.toThrow('Network error');

      // After error, cache should be cleared — next call should retry
      mockFetchSkillMd.mockResolvedValue('recovered markdown');
      mockParseSkillMd.mockReturnValue(fakeParsed);

      const result = await client.getSkill();

      expect(mockFetchSkillMd).toHaveBeenCalledTimes(2);
      expect(result).toEqual(fakeParsed);
    });

    it('should pass correct params for storefront persona', async () => {
      const sfClient = new Scope3Client({ apiKey: 'test-key', persona: 'storefront' });
      mockFetchSkillMd.mockResolvedValue('markdown');
      mockParseSkillMd.mockReturnValue({ ...fakeParsed, name: 'scope3-agentic-storefront' });

      await sfClient.getSkill();

      expect(mockFetchSkillMd).toHaveBeenCalledWith(
        expect.objectContaining({ persona: 'storefront' })
      );
    });

    it('should pass correct params for custom version', async () => {
      const v1Client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer', version: 'v1' });
      mockFetchSkillMd.mockResolvedValue('markdown');
      mockParseSkillMd.mockReturnValue(fakeParsed);

      await v1Client.getSkill();

      expect(mockFetchSkillMd).toHaveBeenCalledWith(expect.objectContaining({ version: 'v1' }));
    });

    it('should pass correct params for custom baseUrl', async () => {
      const customClient = new Scope3Client({
        apiKey: 'test-key',
        persona: 'buyer',
        baseUrl: 'https://custom.api.com',
      });
      mockFetchSkillMd.mockResolvedValue('markdown');
      mockParseSkillMd.mockReturnValue(fakeParsed);

      await customClient.getSkill();

      expect(mockFetchSkillMd).toHaveBeenCalledWith(
        expect.objectContaining({ baseUrl: 'https://custom.api.com' })
      );
    });
  });

  // ── Sub-resource access ──────────────────────────────────────

  describe('sub-resource access', () => {
    describe('advertisers sub-resources', () => {
      let client: Scope3Client;

      beforeEach(() => {
        client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
      });

      it('conversionEvents() returns a ConversionEventsResource', () => {
        const resource = client.advertisers.conversionEvents('adv-123');
        expect(resource).toBeInstanceOf(ConversionEventsResource);
      });

      it('conversionEvents() has list, get, create, update methods', () => {
        const resource = client.advertisers.conversionEvents('adv-123');
        expect(typeof resource.list).toBe('function');
        expect(typeof resource.get).toBe('function');
        expect(typeof resource.create).toBe('function');
        expect(typeof resource.update).toBe('function');
      });

      it('creativeSets() returns a CreativeSetsResource', () => {
        const resource = client.advertisers.creativeSets('adv-456');
        expect(resource).toBeInstanceOf(CreativeSetsResource);
      });

      it('creativeSets() has list, create, addAsset, removeAsset methods', () => {
        const resource = client.advertisers.creativeSets('adv-456');
        expect(typeof resource.list).toBe('function');
        expect(typeof resource.create).toBe('function');
        expect(typeof resource.addAsset).toBe('function');
        expect(typeof resource.removeAsset).toBe('function');
      });

      it('testCohorts() returns a TestCohortsResource', () => {
        const resource = client.advertisers.testCohorts('adv-789');
        expect(resource).toBeInstanceOf(TestCohortsResource);
      });

      it('testCohorts() has list and create methods', () => {
        const resource = client.advertisers.testCohorts('adv-789');
        expect(typeof resource.list).toBe('function');
        expect(typeof resource.create).toBe('function');
      });

      it('returns a new resource instance each call (not cached)', () => {
        const a = client.advertisers.conversionEvents('adv-123');
        const b = client.advertisers.conversionEvents('adv-123');
        expect(a).not.toBe(b);
      });

      it('returns different resources for different advertiser IDs', () => {
        const a = client.advertisers.conversionEvents('adv-1');
        const b = client.advertisers.conversionEvents('adv-2');
        expect(a).not.toBe(b);
      });

      it('eventSources() returns an EventSourcesResource', () => {
        const resource = client.advertisers.eventSources('adv-123');
        expect(resource).toBeInstanceOf(EventSourcesResource);
      });

      it('measurementData() returns a MeasurementDataResource', () => {
        const resource = client.advertisers.measurementData('adv-123');
        expect(resource).toBeInstanceOf(MeasurementDataResource);
      });

      it('catalogs() returns a CatalogsResource', () => {
        const resource = client.advertisers.catalogs('adv-123');
        expect(resource).toBeInstanceOf(CatalogsResource);
      });

      it('audiences() returns an AudiencesResource', () => {
        const resource = client.advertisers.audiences('adv-123');
        expect(resource).toBeInstanceOf(AudiencesResource);
      });

      it('syndication() returns a SyndicationResource', () => {
        const resource = client.advertisers.syndication('adv-123');
        expect(resource).toBeInstanceOf(SyndicationResource);
      });

      it('propertyLists() returns a PropertyListsResource', () => {
        const resource = client.advertisers.propertyLists('adv-123');
        expect(resource).toBeInstanceOf(PropertyListsResource);
      });
    });

    describe('campaigns sub-resources', () => {
      let client: Scope3Client;

      beforeEach(() => {
        client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
      });

      it('creatives() returns a CreativesResource', () => {
        const resource = client.campaigns.creatives('camp-123');
        expect(resource).toBeInstanceOf(CreativesResource);
      });

      it('creatives() has list, get, update, delete methods', () => {
        const resource = client.campaigns.creatives('camp-123');
        expect(typeof resource.list).toBe('function');
        expect(typeof resource.get).toBe('function');
        expect(typeof resource.update).toBe('function');
        expect(typeof resource.delete).toBe('function');
      });

      it('returns a new resource instance each call', () => {
        const a = client.campaigns.creatives('camp-123');
        const b = client.campaigns.creatives('camp-123');
        expect(a).not.toBe(b);
      });
    });

    describe('bundles sub-resources', () => {
      let client: Scope3Client;

      beforeEach(() => {
        client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
      });

      it('products() returns a BundleProductsResource', () => {
        const resource = client.bundles.products('bundle-123');
        expect(resource).toBeInstanceOf(BundleProductsResource);
      });

      it('products() has list, add, remove methods', () => {
        const resource = client.bundles.products('bundle-123');
        expect(typeof resource.list).toBe('function');
        expect(typeof resource.add).toBe('function');
        expect(typeof resource.remove).toBe('function');
      });

      it('returns a new resource instance each call', () => {
        const a = client.bundles.products('bundle-123');
        const b = client.bundles.products('bundle-123');
        expect(a).not.toBe(b);
      });
    });

    describe('storefront persona cannot access buyer sub-resources', () => {
      it('should throw when accessing advertisers sub-resources', () => {
        const client = new Scope3Client({ apiKey: 'test-key', persona: 'storefront' });
        expect(() => client.advertisers.conversionEvents('adv-1')).toThrow(
          'advertisers is only available with the buyer persona'
        );
      });

      it('should throw when accessing bundles sub-resources', () => {
        const client = new Scope3Client({ apiKey: 'test-key', persona: 'storefront' });
        expect(() => client.bundles.products('bundle-1')).toThrow(
          'bundles is only available with the buyer persona'
        );
      });
    });
  });
});
