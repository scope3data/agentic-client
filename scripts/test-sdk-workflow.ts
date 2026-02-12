#!/usr/bin/env npx ts-node

/**
 * Scope3 SDK v2 - TypeScript SDK Workflow Test
 *
 * Tests the SDK programmatically (not via CLI).
 * Exercises all 3 personas and core operations.
 *
 * Usage:
 *   export SCOPE3_API_KEY=your_api_key
 *   npx ts-node scripts/test-sdk-workflow.ts
 *   npx ts-node scripts/test-sdk-workflow.ts --staging
 */

import { Scope3Client } from '../src';
import type { Persona, Environment } from '../src/types';

const API_KEY = process.env.SCOPE3_API_KEY;
if (!API_KEY) {
  console.error('Error: SCOPE3_API_KEY not set');
  process.exit(1);
}

const isStaging = process.argv.includes('--staging');
const environment: Environment = isStaging ? 'staging' : 'production';

let step = 0;
const log = (msg: string) => {
  step++;
  console.log(`\n[${step}] ${msg}`);
};
const pass = (msg: string) => console.log(`  PASS ${msg}`);
const fail = (msg: string) => console.log(`  FAIL ${msg}`);
const warn = (msg: string) => console.log(`  SKIP ${msg}`);

function makeClient(persona: Persona): Scope3Client {
  return new Scope3Client({
    apiKey: API_KEY!,
    persona,
    environment,
  });
}

async function testBuyer() {
  console.log('\n==========================================');
  console.log('  BUYER PERSONA');
  console.log('==========================================');

  const client = makeClient('buyer');
  let advertiserId = '';
  let bundleId = '';

  // List advertisers
  log('List advertisers');
  try {
    const result = await client.advertisers.list({ take: 3 });
    pass(`${result.data.length} advertiser(s)`);
  } catch (e: unknown) {
    fail((e as Error).message);
  }

  // Create advertiser
  log('Create advertiser');
  try {
    const result = await client.advertisers.create({
      name: `SDK Test ${Date.now()}`,
      description: 'TypeScript SDK test',
    });
    advertiserId = result.data.id;
    pass(`Created: ${advertiserId}`);
  } catch (e: unknown) {
    fail((e as Error).message);
  }

  // Get advertiser
  if (advertiserId) {
    log('Get advertiser');
    try {
      const result = await client.advertisers.get(advertiserId);
      pass(`Name: ${result.data.name}`);
    } catch (e: unknown) {
      fail((e as Error).message);
    }
  }

  // Update advertiser
  if (advertiserId) {
    log('Update advertiser');
    try {
      await client.advertisers.update(advertiserId, { name: 'SDK Test Updated' });
      pass('Updated');
    } catch (e: unknown) {
      fail((e as Error).message);
    }
  }

  // List buyer brands
  log('List buyer brands');
  try {
    const result = await client.buyerBrands.list({ take: 3 });
    pass(`${result.data.length} brand(s)`);
  } catch (e: unknown) {
    warn((e as Error).message);
  }

  // Create bundle
  if (advertiserId) {
    log('Create bundle');
    try {
      const result = await client.bundles.create({
        advertiserId,
        channels: ['display', 'video'],
        countries: ['US'],
      });
      bundleId = result.data.bundleId;
      pass(`Created: ${bundleId}`);
    } catch (e: unknown) {
      fail((e as Error).message);
    }
  }

  // Discover products
  if (bundleId) {
    log('Discover products');
    try {
      const result = await client.bundles.discoverProducts(bundleId, { groupLimit: 3 });
      pass(`${result.data.groups?.length ?? 0} group(s)`);
    } catch (e: unknown) {
      warn((e as Error).message);
    }
  }

  // List campaigns
  log('List campaigns');
  try {
    const result = await client.campaigns.list({ take: 3 });
    pass(`${result.data.length} campaign(s)`);
  } catch (e: unknown) {
    fail((e as Error).message);
  }

  // Get skill.md
  log('Get buyer skill.md');
  try {
    const skill = await client.getSkill();
    pass(`${skill.name} v${skill.version} - ${skill.commands.length} commands`);
  } catch (e: unknown) {
    warn((e as Error).message);
  }

  // Cleanup
  if (advertiserId) {
    log('Delete test advertiser');
    try {
      await client.advertisers.delete(advertiserId);
      pass(`Deleted: ${advertiserId}`);
    } catch (e: unknown) {
      warn((e as Error).message);
    }
  }
}

async function testBrand() {
  console.log('\n==========================================');
  console.log('  BRAND PERSONA');
  console.log('==========================================');

  const client = makeClient('brand');
  let brandId = '';

  // List brands
  log('List brands');
  try {
    const result = await client.brands.list({ take: 3 });
    pass(`${result.data.length} brand(s)`);
  } catch (e: unknown) {
    fail((e as Error).message);
  }

  // Create brand
  log('Create brand');
  try {
    const result = await client.brands.create({
      manifestUrl: 'https://example.com/test-manifest.json',
    });
    brandId = result.data.id;
    pass(`Created: ${brandId}`);
  } catch (e: unknown) {
    fail((e as Error).message);
  }

  // Get brand
  if (brandId) {
    log('Get brand');
    try {
      const result = await client.brands.get(brandId);
      pass(`Got brand: ${result.data.id}`);
    } catch (e: unknown) {
      fail((e as Error).message);
    }
  }

  // Update brand
  if (brandId) {
    log('Update brand');
    try {
      await client.brands.update(brandId, {
        manifestUrl: 'https://example.com/updated-manifest.json',
      });
      pass('Updated');
    } catch (e: unknown) {
      fail((e as Error).message);
    }
  }

  // Get skill.md
  log('Get brand skill.md');
  try {
    const skill = await client.getSkill();
    pass(`${skill.name} v${skill.version} - ${skill.commands.length} commands`);
  } catch (e: unknown) {
    warn((e as Error).message);
  }

  // Cleanup
  if (brandId) {
    log('Delete test brand');
    try {
      await client.brands.delete(brandId);
      pass(`Deleted: ${brandId}`);
    } catch (e: unknown) {
      warn((e as Error).message);
    }
  }
}

async function testPartner() {
  console.log('\n==========================================');
  console.log('  PARTNER PERSONA');
  console.log('==========================================');

  const client = makeClient('partner');

  // Health check
  log('Health check');
  try {
    const result = await client.health.check();
    pass(`Status: ${result.data.status}`);
  } catch (e: unknown) {
    fail((e as Error).message);
  }

  // Get skill.md
  log('Get partner skill.md');
  try {
    const skill = await client.getSkill();
    pass(`${skill.name} v${skill.version} - ${skill.commands.length} commands`);
  } catch (e: unknown) {
    warn((e as Error).message);
  }
}

async function testPersonaGuards() {
  console.log('\n==========================================');
  console.log('  PERSONA GUARDS');
  console.log('==========================================');

  // Verify wrong-persona access throws
  const buyer = makeClient('buyer');

  log('Buyer cannot access brands (brand persona)');
  try {
    buyer.brands; // eslint-disable-line @typescript-eslint/no-unused-expressions
    fail('Should have thrown');
  } catch (e: unknown) {
    pass(`Threw: ${(e as Error).message}`);
  }

  log('Buyer cannot access health (partner persona)');
  try {
    buyer.health; // eslint-disable-line @typescript-eslint/no-unused-expressions
    fail('Should have thrown');
  } catch (e: unknown) {
    pass(`Threw: ${(e as Error).message}`);
  }

  const brand = makeClient('brand');

  log('Brand cannot access advertisers (buyer persona)');
  try {
    brand.advertisers; // eslint-disable-line @typescript-eslint/no-unused-expressions
    fail('Should have thrown');
  } catch (e: unknown) {
    pass(`Threw: ${(e as Error).message}`);
  }
}

async function main() {
  console.log('==========================================');
  console.log('  SCOPE3 SDK v2 WORKFLOW TEST');
  console.log(`  Environment: ${environment}`);
  console.log('==========================================');

  await testBuyer();
  await testBrand();
  await testPartner();
  await testPersonaGuards();

  console.log('\n==========================================');
  console.log('  ALL DONE');
  console.log('==========================================\n');
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
