#!/usr/bin/env npx ts-node

/**
 * Scope3 SDK v2 - TypeScript SDK Workflow Test
 *
 * Tests the SDK programmatically (not via CLI).
 * Exercises both personas and core operations.
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
      brandDomain: 'example.com',
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

  // List sales agents
  log('List sales agents');
  try {
    await client.salesAgents.list();
    pass(`Listed sales agents`);
  } catch (e: unknown) {
    warn((e as Error).message);
  }

  // Get reporting
  log('Get reporting');
  try {
    await client.reporting.get({ days: 7, view: 'summary' });
    pass('Got reporting metrics');
  } catch (e: unknown) {
    warn((e as Error).message);
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

async function testStorefront() {
  console.log('\n==========================================');
  console.log('  STOREFRONT PERSONA');
  console.log('==========================================');

  const client = makeClient('storefront');

  // Get storefront
  log('Get storefront');
  try {
    await client.storefront.get();
    pass('Got storefront');
  } catch (e: unknown) {
    fail((e as Error).message);
  }

  // List agents
  log('List storefront agents');
  try {
    await client.agents.list();
    pass('Listed agents');
  } catch (e: unknown) {
    fail((e as Error).message);
  }

  // Get skill.md
  log('Get storefront skill.md');
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

  const buyer = makeClient('buyer');

  log('Buyer cannot access storefront (storefront persona)');
  try {
    buyer.storefront; // eslint-disable-line @typescript-eslint/no-unused-expressions
    fail('Should have thrown');
  } catch (e: unknown) {
    pass(`Threw: ${(e as Error).message}`);
  }

  log('Buyer cannot access agents (storefront persona)');
  try {
    buyer.agents; // eslint-disable-line @typescript-eslint/no-unused-expressions
    fail('Should have thrown');
  } catch (e: unknown) {
    pass(`Threw: ${(e as Error).message}`);
  }

  const storefront = makeClient('storefront');

  log('Storefront cannot access advertisers (buyer persona)');
  try {
    storefront.advertisers; // eslint-disable-line @typescript-eslint/no-unused-expressions
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
  await testStorefront();
  await testPersonaGuards();

  console.log('\n==========================================');
  console.log('  ALL DONE');
  console.log('==========================================\n');
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
