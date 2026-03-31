/**
 * Tests for ReportingResource
 */

import { ReportingResource } from '../../resources/reporting';
import type { BaseAdapter } from '../../adapters/base';

// Mock the validation module
jest.mock('../../validation', () => ({
  shouldValidateResponse: jest.fn(),
  validateResponse: jest.fn(),
}));

// Mock the schemas registry
jest.mock('../../schemas/registry', () => ({
  reportingSchemas: {
    response: { parse: jest.fn() },
  },
}));

import { shouldValidateResponse, validateResponse } from '../../validation';
import { reportingSchemas } from '../../schemas/registry';

const mockShouldValidate = shouldValidateResponse as jest.Mock;
const mockValidateResponse = validateResponse as jest.Mock;

function createMockAdapter(overrides?: Partial<BaseAdapter>): jest.Mocked<BaseAdapter> {
  return {
    baseUrl: 'https://api.test.com',
    version: 'v2',
    persona: 'buyer' as const,
    debug: false,
    validate: false,
    request: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    ...overrides,
  } as jest.Mocked<BaseAdapter>;
}

describe('ReportingResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: ReportingResource;

  beforeEach(() => {
    mockAdapter = createMockAdapter();
    resource = new ReportingResource(mockAdapter);
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should call adapter with correct path and no params', async () => {
      mockAdapter.request.mockResolvedValue({ summary: {} });
      mockShouldValidate.mockReturnValue(false);

      await resource.get();

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/reporting/metrics', undefined, {
        params: {
          view: undefined,
          days: undefined,
          startDate: undefined,
          endDate: undefined,
          advertiserId: undefined,
          campaignId: undefined,
          demo: undefined,
        },
      });
    });

    it('should pass all params when provided', async () => {
      mockAdapter.request.mockResolvedValue({ summary: {} });
      mockShouldValidate.mockReturnValue(false);

      await resource.get({
        view: 'summary',
        days: 30,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        advertiserId: 'adv-1',
        campaignId: 'camp-1',
        demo: true,
      });

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/reporting/metrics', undefined, {
        params: {
          view: 'summary',
          days: 30,
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          advertiserId: 'adv-1',
          campaignId: 'camp-1',
          demo: true,
        },
      });
    });

    it('should validate response when validation is enabled', async () => {
      const validatingAdapter = createMockAdapter({ validate: true });
      const validatingResource = new ReportingResource(validatingAdapter);

      const mockResult = { summary: { impressions: 100 } };
      validatingAdapter.request.mockResolvedValue(mockResult);
      mockShouldValidate.mockReturnValue(true);
      mockValidateResponse.mockReturnValue(mockResult);

      const result = await validatingResource.get();

      expect(mockShouldValidate).toHaveBeenCalledWith(true);
      expect(mockValidateResponse).toHaveBeenCalledWith(reportingSchemas.response, mockResult);
      expect(result).toBe(mockResult);
    });

    it('should skip validation when validation is disabled', async () => {
      const mockResult = { summary: {} };
      mockAdapter.request.mockResolvedValue(mockResult);
      mockShouldValidate.mockReturnValue(false);

      const result = await resource.get();

      expect(mockShouldValidate).toHaveBeenCalledWith(false);
      expect(mockValidateResponse).not.toHaveBeenCalled();
      expect(result).toBe(mockResult);
    });
  });
});
