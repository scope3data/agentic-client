import { z } from 'zod';
import { Scope3ApiError } from '../adapters/base';
import {
  validateInput,
  validateResponse,
  shouldValidateInput,
  shouldValidateResponse,
} from '../validation';

const testSchema = z.object({
  name: z.string(),
  count: z.number(),
});

describe('shouldValidateInput', () => {
  it('returns true for true', () => {
    expect(shouldValidateInput(true)).toBe(true);
  });

  it('returns true for "input"', () => {
    expect(shouldValidateInput('input')).toBe(true);
  });

  it('returns false for "response"', () => {
    expect(shouldValidateInput('response')).toBe(false);
  });

  it('returns false for false', () => {
    expect(shouldValidateInput(false)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(shouldValidateInput(undefined)).toBe(false);
  });
});

describe('shouldValidateResponse', () => {
  it('returns true for true', () => {
    expect(shouldValidateResponse(true)).toBe(true);
  });

  it('returns true for "response"', () => {
    expect(shouldValidateResponse('response')).toBe(true);
  });

  it('returns false for "input"', () => {
    expect(shouldValidateResponse('input')).toBe(false);
  });

  it('returns false for false', () => {
    expect(shouldValidateResponse(false)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(shouldValidateResponse(undefined)).toBe(false);
  });
});

describe('validateInput', () => {
  it('returns parsed data on valid input', () => {
    const result = validateInput(testSchema, { name: 'test', count: 5 });
    expect(result).toEqual({ name: 'test', count: 5 });
  });

  it('throws Scope3ApiError with status 400 on invalid input', () => {
    expect(() => validateInput(testSchema, { name: 123 })).toThrow(Scope3ApiError);
    try {
      validateInput(testSchema, { name: 123 });
    } catch (e) {
      const err = e as Scope3ApiError;
      expect(err.status).toBe(400);
      expect(err.message).toContain('Input validation failed');
      expect(err.details?.validationErrors).toBeDefined();
    }
  });
});

describe('validateResponse', () => {
  it('returns parsed data on valid response', () => {
    const result = validateResponse(testSchema, { name: 'test', count: 5 });
    expect(result).toEqual({ name: 'test', count: 5 });
  });

  it('throws Scope3ApiError with status 502 on invalid response', () => {
    expect(() => validateResponse(testSchema, { bad: 'data' })).toThrow(Scope3ApiError);
    try {
      validateResponse(testSchema, { bad: 'data' });
    } catch (e) {
      const err = e as Scope3ApiError;
      expect(err.status).toBe(502);
      expect(err.message).toContain('Response validation failed');
      expect(err.details?.validationErrors).toBeDefined();
    }
  });
});
