#!/usr/bin/env npx tsx
/**
 * Detects drift between skill.md and SDK implementations for v2 Buyer API
 *
 * Usage:
 *   npx tsx scripts/detect-drift.ts [options]
 *
 * Options:
 *   --json  Output JSON (auto-enabled in GitHub Actions)
 */

import { fetchSkillMd } from '../src/skill/fetcher';
import { parseSkillMd } from '../src/skill/parser';

interface SdkMethod {
  method: string;
  path: string;
  sdk: string;
}

// Buyer SDK method inventory - maps endpoints to SDK methods
const SDK_METHODS: SdkMethod[] = [
  // Advertisers
  { method: 'GET', path: '/advertisers', sdk: 'advertisers.list()' },
  { method: 'GET', path: '/advertisers/{id}', sdk: 'advertisers.get()' },
  { method: 'POST', path: '/advertisers', sdk: 'advertisers.create()' },
  { method: 'PUT', path: '/advertisers/{id}', sdk: 'advertisers.update()' },
  { method: 'DELETE', path: '/advertisers/{id}', sdk: 'advertisers.delete()' },
  // Campaigns
  { method: 'GET', path: '/campaigns', sdk: 'campaigns.list()' },
  { method: 'GET', path: '/campaigns/{id}', sdk: 'campaigns.get()' },
  { method: 'POST', path: '/campaigns/discovery', sdk: 'campaigns.createDiscovery()' },
  { method: 'PUT', path: '/campaigns/discovery/{id}', sdk: 'campaigns.updateDiscovery()' },
  { method: 'POST', path: '/campaigns/performance', sdk: 'campaigns.createPerformance()' },
  { method: 'PUT', path: '/campaigns/performance/{id}', sdk: 'campaigns.updatePerformance()' },
  { method: 'POST', path: '/campaigns/audience', sdk: 'campaigns.createAudience()' },
  { method: 'POST', path: '/campaigns/{id}/execute', sdk: 'campaigns.execute()' },
  { method: 'POST', path: '/campaigns/{id}/pause', sdk: 'campaigns.pause()' },
  // Bundles
  { method: 'POST', path: '/bundles', sdk: 'bundles.create()' },
  { method: 'GET', path: '/bundles/{id}/discover-products', sdk: 'bundles.discoverProducts()' },
  { method: 'POST', path: '/bundles/discover-products', sdk: 'bundles.browseProducts()' },
  { method: 'GET', path: '/bundles/{id}/products', sdk: 'bundles.products().list()' },
  { method: 'POST', path: '/bundles/{id}/products', sdk: 'bundles.products().add()' },
  { method: 'DELETE', path: '/bundles/{id}/products', sdk: 'bundles.products().remove()' },
  // Reporting
  { method: 'GET', path: '/reporting/metrics', sdk: 'reporting.get()' },
  // Sales Agents
  { method: 'GET', path: '/sales-agents', sdk: 'salesAgents.list()' },
  { method: 'POST', path: '/sales-agents/{id}/accounts', sdk: 'salesAgents.registerAccount()' },
  // Signals
  { method: 'GET', path: '/signals', sdk: 'signals.list()' },
  { method: 'POST', path: '/campaign/signals/discover', sdk: 'signals.discover()' },
  // Conversion Events (nested under advertisers)
  {
    method: 'GET',
    path: '/advertisers/{id}/conversion-events',
    sdk: 'advertisers.conversionEvents().list()',
  },
  {
    method: 'GET',
    path: '/advertisers/{id}/conversion-events/{eventId}',
    sdk: 'advertisers.conversionEvents().get()',
  },
  {
    method: 'POST',
    path: '/advertisers/{id}/conversion-events',
    sdk: 'advertisers.conversionEvents().create()',
  },
  {
    method: 'PUT',
    path: '/advertisers/{id}/conversion-events/{eventId}',
    sdk: 'advertisers.conversionEvents().update()',
  },
  // Creative Sets (nested under advertisers)
  {
    method: 'GET',
    path: '/advertisers/{id}/creative-sets',
    sdk: 'advertisers.creativeSets().list()',
  },
  {
    method: 'POST',
    path: '/advertisers/{id}/creative-sets',
    sdk: 'advertisers.creativeSets().create()',
  },
  // Test Cohorts (nested under advertisers)
  {
    method: 'GET',
    path: '/advertisers/{id}/test-cohorts',
    sdk: 'advertisers.testCohorts().list()',
  },
  {
    method: 'POST',
    path: '/advertisers/{id}/test-cohorts',
    sdk: 'advertisers.testCohorts().create()',
  },
];

interface DriftReport {
  timestamp: string;
  skillCommands: number;
  sdkMethods: number;
  missing: string[];
  extra: string[];
  totalDrift: number;
  hasDrift: boolean;
}

function normalizeEndpoint(endpoint: string): string {
  return endpoint
    .replace(/\{[^}]+\}/g, '{id}')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '');
}

async function detectDrift(): Promise<DriftReport> {
  const skillMd = await fetchSkillMd({ persona: 'buyer', version: 'v2' });
  const parsed = parseSkillMd(skillMd);

  const sdkEndpoints = new Map<string, string>();
  for (const m of SDK_METHODS) {
    const key = `${m.method} ${normalizeEndpoint(m.path)}`;
    sdkEndpoints.set(key, m.sdk);
  }

  const skillEndpoints = new Map<string, string>();
  for (const cmd of parsed.commands) {
    if (cmd.method && cmd.path) {
      const key = `${cmd.method} ${normalizeEndpoint(cmd.path)}`;
      skillEndpoints.set(key, cmd.name);
    }
  }

  const missing = [...skillEndpoints.keys()].filter((e) => !sdkEndpoints.has(e));
  const extra = [...sdkEndpoints.keys()].filter((e) => !skillEndpoints.has(e));

  return {
    timestamp: new Date().toISOString(),
    skillCommands: skillEndpoints.size,
    sdkMethods: sdkEndpoints.size,
    missing,
    extra,
    totalDrift: missing.length + extra.length,
    hasDrift: missing.length + extra.length > 0,
  };
}

function printHumanReadable(report: DriftReport) {
  console.log('DRIFT DETECTION REPORT (v2 Buyer API)');
  console.log('='.repeat(50));
  console.log(`Generated: ${report.timestamp}`);
  console.log(`Skill commands: ${report.skillCommands}`);
  console.log(`SDK methods: ${report.sdkMethods}`);

  if (report.missing.length) {
    console.log(`\nMISSING IN SDK (${report.missing.length}):`);
    report.missing.forEach((e) => console.log(`  - ${e}`));
  }

  if (report.extra.length) {
    console.log(`\nEXTRA IN SDK (${report.extra.length}):`);
    report.extra.forEach((e) => console.log(`  - ${e}`));
  }

  if (!report.hasDrift) {
    console.log('\nNo drift detected!');
  }

  console.log('\n' + '='.repeat(50));
  console.log(`TOTAL DRIFT: ${report.totalDrift} items`);
}

async function main() {
  const jsonFlag = process.argv.includes('--json') || !!process.env.GITHUB_ACTIONS;

  try {
    const report = await detectDrift();

    if (jsonFlag) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      printHumanReadable(report);
    }

    process.exit(report.hasDrift ? 1 : 0);
  } catch (err) {
    console.error('Drift detection failed:', err);
    process.exit(1);
  }
}

main();
