/**
 * Tests for AdvertisersResource
 */

import { AdvertisersResource } from '../../resources/advertisers';
import type { BaseAdapter } from '../../adapters/base';
import { TestCohortsResource } from '../../resources/test-cohorts';
import { EventSourcesResource } from '../../resources/event-sources';
import { MeasurementDataResource } from '../../resources/measurement-data';
import { CatalogsResource } from '../../resources/catalogs';
import { AudiencesResource } from '../../resources/audiences';
import { SyndicationResource } from '../../resources/syndication';
import { PropertyListsResource } from '../../resources/property-lists';

describe('AdvertisersResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: AdvertisersResource;

  beforeEach(() => {
    mockAdapter = {
      baseUrl: 'https://api.test.com',
      version: 'v2',
      persona: 'buyer' as const,
      debug: false,
      validate: false,
      request: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
    resource = new AdvertisersResource(mockAdapter);
  });

  describe('list', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ items: [], total: 0 });

      await resource.list();

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/advertisers', undefined, {
        params: {
          take: undefined,
          skip: undefined,
          status: undefined,
          name: undefined,
          includeBrand: undefined,
        },
      });
    });

    it('should pass pagination and filter params', async () => {
      mockAdapter.request.mockResolvedValue({ items: [], total: 0 });

      await resource.list({ take: 10, skip: 20, status: 'ACTIVE', name: 'Acme' });

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/advertisers', undefined, {
        params: { take: 10, skip: 20, status: 'ACTIVE', name: 'Acme', includeBrand: undefined },
      });
    });
  });

  describe('get', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ id: '123', name: 'Test' });

      await resource.get('123');

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/advertisers/123');
    });
  });

  describe('create', () => {
    it('should call adapter with correct path and body', async () => {
      mockAdapter.request.mockResolvedValue({ id: '123', name: 'New Advertiser' });

      await resource.create({
        name: 'New Advertiser',
        brandDomain: 'test.com',
        description: 'Test desc',
      });

      expect(mockAdapter.request).toHaveBeenCalledWith('POST', '/advertisers', {
        name: 'New Advertiser',
        brandDomain: 'test.com',
        description: 'Test desc',
      });
    });
  });

  describe('update', () => {
    it('should call adapter with correct path and body', async () => {
      mockAdapter.request.mockResolvedValue({ id: '123', name: 'Updated' });

      await resource.update('123', { name: 'Updated' });

      expect(mockAdapter.request).toHaveBeenCalledWith('PUT', '/advertisers/123', {
        name: 'Updated',
      });
    });
  });

  describe('delete', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue(undefined);

      await resource.delete('123');

      expect(mockAdapter.request).toHaveBeenCalledWith('DELETE', '/advertisers/123');
    });
  });

  describe('validateDataDeliveryCredential', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ data: { valid: true } });

      await resource.validateDataDeliveryCredential('adv-123', 'my-cred');

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/advertisers/adv-123/data-delivery-credentials/my-cred/validate'
      );
    });
  });

  describe('listAvailableAccounts', () => {
    it('should call adapter with correct path', async () => {
      mockAdapter.request.mockResolvedValue({ data: [] });

      await resource.listAvailableAccounts('adv-123');

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'GET',
        '/advertisers/adv-123/accounts/available'
      );
    });
  });

  describe('updateAccountReportingBucket', () => {
    it('should call adapter with correct path and body', async () => {
      const data = { bucket: 's3://reports' };
      mockAdapter.request.mockResolvedValue({ data: {} });

      await resource.updateAccountReportingBucket('adv-123', 'link-456', data);

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'PUT',
        '/advertisers/adv-123/accounts/link-456/reporting-bucket',
        data
      );
    });
  });

  describe('sub-resources', () => {
    it('should return testCohorts resource for advertiser', () => {
      const testCohorts = resource.testCohorts('adv-123');
      expect(testCohorts).toBeInstanceOf(TestCohortsResource);
    });

    it('should return eventSources resource for advertiser', () => {
      const eventSources = resource.eventSources('adv-123');
      expect(eventSources).toBeInstanceOf(EventSourcesResource);
    });

    it('should return measurementData resource for advertiser', () => {
      const measurementData = resource.measurementData('adv-123');
      expect(measurementData).toBeInstanceOf(MeasurementDataResource);
    });

    it('should return catalogs resource for advertiser', () => {
      const catalogs = resource.catalogs('adv-123');
      expect(catalogs).toBeInstanceOf(CatalogsResource);
    });

    it('should return audiences resource for advertiser', () => {
      const audiences = resource.audiences('adv-123');
      expect(audiences).toBeInstanceOf(AudiencesResource);
    });

    it('should return syndication resource for advertiser', () => {
      const syndication = resource.syndication('adv-123');
      expect(syndication).toBeInstanceOf(SyndicationResource);
    });

    it('should return propertyLists resource for advertiser', () => {
      const propertyLists = resource.propertyLists('adv-123');
      expect(propertyLists).toBeInstanceOf(PropertyListsResource);
    });
  });
});
