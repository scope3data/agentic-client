/**
 * Tests for SalesAgentsResource
 */

import { SalesAgentsResource } from '../../resources/sales-agents';
import type { BaseAdapter } from '../../adapters/base';

// Mock the validation module
jest.mock('../../validation', () => ({
  shouldValidateInput: jest.fn(),
  shouldValidateResponse: jest.fn(),
  validateInput: jest.fn(),
  validateResponse: jest.fn(),
}));

// Mock the schemas registry
jest.mock('../../schemas/registry', () => ({
  salesAgentSchemas: {
    listResponse: { parse: jest.fn() },
    registerAccountInput: { parse: jest.fn() },
    accountResponse: { parse: jest.fn() },
  },
}));

import {
  shouldValidateInput,
  shouldValidateResponse,
  validateInput,
  validateResponse,
} from '../../validation';
import { salesAgentSchemas } from '../../schemas/registry';

const mockShouldValidateInput = shouldValidateInput as jest.Mock;
const mockShouldValidateResponse = shouldValidateResponse as jest.Mock;
const mockValidateInput = validateInput as jest.Mock;
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

describe('SalesAgentsResource', () => {
  let mockAdapter: jest.Mocked<BaseAdapter>;
  let resource: SalesAgentsResource;

  beforeEach(() => {
    mockAdapter = createMockAdapter();
    resource = new SalesAgentsResource(mockAdapter);
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should call adapter with correct path and no params', async () => {
      mockAdapter.request.mockResolvedValue({ items: [] });
      mockShouldValidateResponse.mockReturnValue(false);

      await resource.list();

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/sales-agents', undefined, {
        params: {
          status: undefined,
          relationship: undefined,
          name: undefined,
          limit: undefined,
          offset: undefined,
        },
      });
    });

    it('should pass filter params when provided', async () => {
      mockAdapter.request.mockResolvedValue({ items: [] });
      mockShouldValidateResponse.mockReturnValue(false);

      await resource.list({
        status: 'ACTIVE',
        relationship: 'CONNECTED',
        name: 'Test Agent',
        limit: 10,
        offset: 20,
      });

      expect(mockAdapter.request).toHaveBeenCalledWith('GET', '/sales-agents', undefined, {
        params: {
          status: 'ACTIVE',
          relationship: 'CONNECTED',
          name: 'Test Agent',
          limit: 10,
          offset: 20,
        },
      });
    });

    it('should validate response when validation is enabled', async () => {
      const validatingAdapter = createMockAdapter({ validate: true });
      const validatingResource = new SalesAgentsResource(validatingAdapter);

      const mockResult = { items: [{ id: 'sa-1' }] };
      const validatedResult = { items: [{ id: 'sa-1', validated: true }] };
      validatingAdapter.request.mockResolvedValue(mockResult);
      mockShouldValidateResponse.mockReturnValue(true);
      mockValidateResponse.mockReturnValue(validatedResult);

      const result = await validatingResource.list();

      expect(mockShouldValidateResponse).toHaveBeenCalledWith(true);
      expect(mockValidateResponse).toHaveBeenCalledWith(salesAgentSchemas.listResponse, mockResult);
      expect(result).toBe(validatedResult);
    });
  });

  describe('registerAccount', () => {
    it('should call adapter with correct path and body', async () => {
      const input = { advertiserId: 'adv-1', accountIdentifier: 'acc-ident-1' };
      mockAdapter.request.mockResolvedValue({ id: 'acc-1' });
      mockShouldValidateInput.mockReturnValue(false);
      mockShouldValidateResponse.mockReturnValue(false);

      await resource.registerAccount('agent-123', input);

      expect(mockAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/sales-agents/agent-123/accounts',
        input
      );
    });

    it('should validate input and response when validation is enabled', async () => {
      const validatingAdapter = createMockAdapter({ validate: true });
      const validatingResource = new SalesAgentsResource(validatingAdapter);

      const input = { advertiserId: 'adv-1', accountIdentifier: 'acc-ident-1' };
      const validatedInput = {
        advertiserId: 'adv-1',
        accountIdentifier: 'acc-ident-1',
        validated: true,
      };
      const mockResult = { id: 'acc-1' };
      const validatedResult = { id: 'acc-1', validated: true };

      mockShouldValidateInput.mockReturnValue(true);
      mockShouldValidateResponse.mockReturnValue(true);
      mockValidateInput.mockReturnValue(validatedInput);
      validatingAdapter.request.mockResolvedValue(mockResult);
      mockValidateResponse.mockReturnValue(validatedResult);

      const result = await validatingResource.registerAccount('agent-123', input);

      expect(mockValidateInput).toHaveBeenCalledWith(salesAgentSchemas.registerAccountInput, input);
      expect(validatingAdapter.request).toHaveBeenCalledWith(
        'POST',
        '/sales-agents/agent-123/accounts',
        validatedInput
      );
      expect(mockValidateResponse).toHaveBeenCalledWith(
        salesAgentSchemas.accountResponse,
        mockResult
      );
      expect(result).toBe(validatedResult);
    });
  });
});
