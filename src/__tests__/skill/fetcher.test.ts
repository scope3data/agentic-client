/**
 * Tests for skill.md fetcher
 */

import { fetchSkillMd, getBundledSkillMd } from '../../skill/fetcher';
import { getBundledSkillMd as getBundledSkillMdFromBundled } from '../../skill/bundled';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Suppress console.warn in tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});
afterAll(() => {
  console.warn = originalWarn;
});

const baseUrl = 'https://api.agentic.scope3.com';

describe('fetchSkillMd', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should fetch skill.md with default options (v2, buyer persona)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('# Skill v2'),
    });

    const result = await fetchSkillMd();

    expect(mockFetch).toHaveBeenCalledWith(
      `${baseUrl}/api/v2/buyer/skill.md`,
      expect.objectContaining({
        headers: { Accept: 'text/markdown, text/plain, */*' },
      })
    );
    expect(result).toBe('# Skill v2');
  });

  it('should fetch v1 skill.md when specified', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('# Skill v1'),
    });

    await fetchSkillMd({ version: 'v1' });

    expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/v1/buyer/skill.md`, expect.anything());
  });

  it('should fetch latest skill.md (maps to v2)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('# Skill latest'),
    });

    await fetchSkillMd({ version: 'latest' });

    expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/v2/buyer/skill.md`, expect.anything());
  });

  it('should use custom base URL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('# Custom'),
    });

    await fetchSkillMd({ baseUrl: 'https://custom.com' });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://custom.com/api/v2/buyer/skill.md',
      expect.anything()
    );
  });

  it('should fetch partner persona skill.md', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('# Partner Skill'),
    });

    await fetchSkillMd({ persona: 'partner' });

    expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/v2/partner/skill.md`, expect.anything());
  });

  it('should fall back to bundled buyer skill on non-200 response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
    });

    const result = await fetchSkillMd();

    expect(result).toBe(getBundledSkillMdFromBundled('buyer'));
  });

  it('should fall back to bundled skill on network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await fetchSkillMd();

    expect(result).toBe(getBundledSkillMdFromBundled('buyer'));
  });

  it('should fall back to bundled skill on timeout', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    mockFetch.mockRejectedValue(abortError);

    const result = await fetchSkillMd();

    expect(result).toBe(getBundledSkillMdFromBundled('buyer'));
  });

  it('should fall back to bundled skill on non-Error throw', async () => {
    mockFetch.mockRejectedValue('string error');

    const result = await fetchSkillMd();

    expect(result).toBe(getBundledSkillMdFromBundled('buyer'));
  });

  it('should fall back to bundled partner skill on non-200 for partner persona', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const result = await fetchSkillMd({ persona: 'partner' });

    expect(result).toBe(getBundledSkillMdFromBundled('partner'));
  });

  it('should fetch storefront skill.md from /api/v1/skill.md (no persona segment)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('# Publisher Skill'),
    });

    await fetchSkillMd({ persona: 'storefront' });

    expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/v1/skill.md`, expect.anything());
  });

  it('should fall back to bundled storefront skill on non-200', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
    });

    const result = await fetchSkillMd({ persona: 'storefront' });

    expect(result).toBe(getBundledSkillMdFromBundled('storefront'));
  });
});

describe('getBundledSkillMd', () => {
  it('should return buyer skill.md content by default', () => {
    const result = getBundledSkillMd();
    expect(result).toBe(getBundledSkillMdFromBundled('buyer'));
  });

  it('should return buyer skill.md content with buyer persona', () => {
    const result = getBundledSkillMd('buyer');
    expect(result).toContain('scope3-agentic-buyer');
  });

  it('should return partner skill.md content with partner persona', () => {
    const result = getBundledSkillMd('partner');
    expect(result).toContain('scope3-agentic-partner');
  });

  it('should return storefront skill.md content with storefront persona', () => {
    const result = getBundledSkillMd('storefront');
    expect(result).toContain('scope3-storefront-api');
  });

  it('should contain expected version header', () => {
    const result = getBundledSkillMd('buyer');
    expect(result).toContain('2.0.0');
  });
});
