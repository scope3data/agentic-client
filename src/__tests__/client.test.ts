/**
 * Tests for Scope3Client (REST-only)
 */

import { Scope3Client } from '../client';
import { TestCohortsResource } from '../resources/test-cohorts';
import { TasksResource } from '../resources/tasks';
import { PropertyListChecksResource } from '../resources/property-lists';
import { EventSourcesResource } from '../resources/event-sources';
import { MeasurementDataResource } from '../resources/measurement-data';
import { CatalogsResource } from '../resources/catalogs';
import { AudiencesResource } from '../resources/audiences';
import { SyndicationResource } from '../resources/syndication';
import { PropertyListsResource } from '../resources/property-lists';
import { CreativesResource } from '../resources/creatives';
import { DiscoveryResource } from '../resources/discovery';
import { AccountsResource } from '../resources/accounts';
import { NotificationPreferencesResource } from '../resources/notification-preferences';
import { ModerationResource } from '../resources/moderation';
import { StorefrontsResource } from '../resources/storefronts';
import { AuditLogsResource } from '../resources/audit-logs';
import { PlanningBriefsResource } from '../resources/planning-briefs';
import { BuyerBillingResource } from '../resources/billing';

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

    it('should reject storefront persona', () => {
      expect(() => new Scope3Client({ apiKey: 'test-key', persona: 'storefront' })).toThrow(
        'Scope3Client only supports the buyer persona'
      );
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
    let client: Scope3Client;

    beforeEach(() => {
      client = new Scope3Client({ apiKey: 'test-key', persona: 'buyer' });
    });

    it('should have advertisers resource', () => {
      expect(client.advertisers).toBeDefined();
      expect(typeof client.advertisers.list).toBe('function');
      expect(typeof client.advertisers.get).toBe('function');
      expect(typeof client.advertisers.create).toBe('function');
      expect(typeof client.advertisers.update).toBe('function');
      expect(typeof client.advertisers.delete).toBe('function');
    });

    it('should have campaigns resource with generic CRUD and actions', () => {
      expect(client.campaigns).toBeDefined();
      expect(typeof client.campaigns.list).toBe('function');
      expect(typeof client.campaigns.get).toBe('function');
      expect(typeof client.campaigns.create).toBe('function');
      expect(typeof client.campaigns.update).toBe('function');
      expect(typeof client.campaigns.delete).toBe('function');
      expect(typeof client.campaigns.execute).toBe('function');
      expect(typeof client.campaigns.pause).toBe('function');
    });

    it('should have reporting resource', () => {
      expect(client.reporting).toBeDefined();
      expect(typeof client.reporting.get).toBe('function');
    });

    it('should have tasks resource', () => {
      expect(client.tasks).toBeDefined();
      expect(client.tasks).toBeInstanceOf(TasksResource);
      expect(typeof client.tasks.get).toBe('function');
    });

    it('should have propertyListChecks resource', () => {
      expect(client.propertyListChecks).toBeDefined();
      expect(client.propertyListChecks).toBeInstanceOf(PropertyListChecksResource);
      expect(typeof client.propertyListChecks.check).toBe('function');
      expect(typeof client.propertyListChecks.getReport).toBe('function');
    });

    it('should have discovery resource', () => {
      expect(client.discovery).toBeDefined();
      expect(client.discovery).toBeInstanceOf(DiscoveryResource);
    });

    it('should have accounts resource', () => {
      expect(client.accounts).toBeDefined();
      expect(client.accounts).toBeInstanceOf(AccountsResource);
    });

    it('should have notificationPreferences resource', () => {
      expect(client.notificationPreferences).toBeDefined();
      expect(client.notificationPreferences).toBeInstanceOf(NotificationPreferencesResource);
    });

    it('should have moderation resource', () => {
      expect(client.moderation).toBeDefined();
      expect(client.moderation).toBeInstanceOf(ModerationResource);
    });

    it('should have storefronts resource', () => {
      expect(client.storefronts).toBeDefined();
      expect(client.storefronts).toBeInstanceOf(StorefrontsResource);
    });

    it('should have auditLogs resource', () => {
      expect(client.auditLogs).toBeDefined();
      expect(client.auditLogs).toBeInstanceOf(AuditLogsResource);
    });

    it('should have planningBriefs resource', () => {
      expect(client.planningBriefs).toBeDefined();
      expect(client.planningBriefs).toBeInstanceOf(PlanningBriefsResource);
    });

    it('should have billing resource', () => {
      expect(client.billing).toBeDefined();
      expect(client.billing).toBeInstanceOf(BuyerBillingResource);
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

      mockFetchSkillMd.mockResolvedValue('recovered markdown');
      mockParseSkillMd.mockReturnValue(fakeParsed);

      const result = await client.getSkill();

      expect(mockFetchSkillMd).toHaveBeenCalledTimes(2);
      expect(result).toEqual(fakeParsed);
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
        const a = client.advertisers.testCohorts('adv-123');
        const b = client.advertisers.testCohorts('adv-123');
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
  });
});
