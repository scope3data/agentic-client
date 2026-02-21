/**
 * Fetcher for skill.md files
 * Fetches from API with fallback to bundled version
 */

import { getBundledSkillMd } from './bundled';
import type { FetchSkillOptions } from './types';
import { logger } from '../utils/logger';

const DEFAULT_BASE_URL = 'https://api.agentic.scope3.com';
const DEFAULT_TIMEOUT = 5000;

/**
 * Fetch skill.md content from the API
 * Falls back to bundled version on error
 *
 * @param options Fetch options
 * @returns skill.md content as string
 */
export async function fetchSkillMd(options: FetchSkillOptions = {}): Promise<string> {
  const version = options.version ?? 'v2';
  const persona = options.persona ?? 'buyer';
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;

  // Build URL: storefront uses /api/v1/skill.md, others use /api/{version}/{persona}/skill.md
  const url =
    persona === 'storefront'
      ? `${baseUrl}/api/v1/skill.md`
      : `${baseUrl}/api/${version === 'latest' ? 'v2' : version}/${persona}/skill.md`;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(timeout),
      headers: {
        Accept: 'text/markdown, text/plain, */*',
      },
    });

    if (response.ok) {
      return response.text();
    }

    // Non-200 response, use fallback
    logger.warn(`Failed to fetch skill.md (${response.status}), using bundled version`);
    return getBundledSkillMd(persona);
  } catch (error) {
    // Network error or timeout, use fallback
    if (error instanceof Error) {
      logger.warn(`Failed to fetch skill.md: ${error.message}, using bundled version`);
    }
    return getBundledSkillMd(persona);
  }
}

/**
 * Get the bundled skill.md content for a persona
 * @deprecated Use getBundledSkillMd(persona) instead
 */
export { getBundledSkillMd };
