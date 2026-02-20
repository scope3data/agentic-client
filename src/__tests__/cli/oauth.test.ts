/**
 * Tests for OAuth utility functions
 */

import { generateState } from '../../cli/oauth';

describe('generateState', () => {
  it('returns a non-empty hex string', () => {
    const state = generateState();
    expect(state).toMatch(/^[0-9a-f]+$/);
  });

  it('returns 32 hex characters (16 bytes)', () => {
    expect(generateState()).toHaveLength(32);
  });

  it('returns unique values', () => {
    expect(generateState()).not.toBe(generateState());
  });
});
