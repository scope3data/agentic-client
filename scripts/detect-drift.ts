#!/usr/bin/env npx tsx
// Three-way drift detection: OpenAPI spec vs skill.md vs SDK source

import { readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYaml } from 'yaml';
import { fetchSkillMd } from '../src/skill/fetcher';
import { parseSkillMd } from '../src/skill/parser';

const __dirname = dirname(fileURLToPath(import.meta.url));

const OPENAPI_SPEC_URL = 'https://api.agentic.scope3.com/api/v2/buyer/openapi.yaml';

interface DriftReport {
  timestamp: string;
  sources: {
    spec: number;
    skill: number;
    sdk: number;
  };
  drift: {
    inSpecNotSkill: string[];
    inSkillNotSpec: string[];
    inSpecNotSdk: string[];
    inSdkNotSpec: string[];
  };
  totalDrift: number;
  hasDrift: boolean;
}

function normalizeEndpoint(endpoint: string): string {
  return endpoint
    .replace(/\{[^}]+\}/g, '{id}')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '');
}

async function fetchWithRetry(url: string, maxAttempts = 4): Promise<Response> {
  const base = 500;
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      if (response.ok) return response;
      if (response.status >= 500 || response.status === 429) {
        lastError = new Error(`${response.status} ${response.statusText}`);
      } else {
        return response;
      }
    } catch (err) {
      lastError = err;
    }
    if (attempt < maxAttempts - 1) {
      const delay = base * 2 ** attempt + Math.floor(Math.random() * base);
      const message = lastError instanceof Error ? lastError.message : String(lastError);
      console.error(
        `Fetch attempt ${attempt + 1}/${maxAttempts} for ${url} failed: ${message}. Retrying in ${delay}ms...`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  const message = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`Failed to fetch ${url} after ${maxAttempts} attempts: ${message}`);
}

async function fetchSpecEndpoints(): Promise<Map<string, string>> {
  const response = await fetchWithRetry(OPENAPI_SPEC_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
  }
  const spec = parseYaml(await response.text()) as {
    paths?: Record<string, Record<string, unknown>>;
  };
  const endpoints = new Map<string, string>();

  for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
    for (const method of Object.keys(pathItem)) {
      if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        const key = `${method.toUpperCase()} ${normalizeEndpoint(path)}`;
        endpoints.set(key, `${method.toUpperCase()} ${path}`);
      }
    }
  }
  return endpoints;
}

function extractSdkEndpoints(): Map<string, string> {
  const resourcesDir = join(__dirname, '../src/resources');
  const files = readdirSync(resourcesDir).filter((f) => f.endsWith('.ts') && f !== 'index.ts');
  const endpoints = new Map<string, string>();
  const pattern =
    /adapter\.request[^(]*\(\s*'(GET|POST|PUT|PATCH|DELETE)'\s*,\s*(?:`([^`]+)`|'([^']+)')/gs;

  for (const file of files) {
    const content = readFileSync(join(resourcesDir, file), 'utf-8');
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const method = match[1];
      let path = match[2] ?? match[3];
      path = path.replace(/\$\{[^}]+\}/g, '{id}');
      const key = `${method} ${normalizeEndpoint(path)}`;
      endpoints.set(key, `${method} ${path}`);
    }
  }
  return endpoints;
}

async function detectDrift(): Promise<DriftReport> {
  const [specEndpoints, skillMd, sdkEndpoints] = await Promise.all([
    fetchSpecEndpoints(),
    fetchSkillMd({ persona: 'buyer', version: 'v2' }),
    Promise.resolve(extractSdkEndpoints()),
  ]);

  const parsed = parseSkillMd(skillMd);
  const skillEndpoints = new Map<string, string>();
  for (const cmd of parsed.commands) {
    if (cmd.method && cmd.path) {
      const key = `${cmd.method} ${normalizeEndpoint(cmd.path)}`;
      skillEndpoints.set(key, cmd.name);
    }
  }

  const specKeys = new Set(specEndpoints.keys());
  const skillKeys = new Set(skillEndpoints.keys());
  const sdkKeys = new Set(sdkEndpoints.keys());

  const drift = {
    inSpecNotSkill: [...specKeys].filter((k) => !skillKeys.has(k)),
    inSkillNotSpec: [...skillKeys].filter((k) => !specKeys.has(k)),
    inSpecNotSdk: [...specKeys].filter((k) => !sdkKeys.has(k)),
    inSdkNotSpec: [...sdkKeys].filter((k) => !specKeys.has(k)),
  };

  const totalDrift =
    drift.inSpecNotSkill.length +
    drift.inSkillNotSpec.length +
    drift.inSpecNotSdk.length +
    drift.inSdkNotSpec.length;

  return {
    timestamp: new Date().toISOString(),
    sources: {
      spec: specEndpoints.size,
      skill: skillEndpoints.size,
      sdk: sdkEndpoints.size,
    },
    drift,
    totalDrift,
    hasDrift: totalDrift > 0,
  };
}

function printHumanReadable(report: DriftReport) {
  console.log('DRIFT DETECTION REPORT (v2 Buyer API)');
  console.log('='.repeat(50));
  console.log(`Generated: ${report.timestamp}`);
  console.log(`OpenAPI spec endpoints: ${report.sources.spec}`);
  console.log(`skill.md commands: ${report.sources.skill}`);
  console.log(`SDK methods: ${report.sources.sdk}`);

  console.log('\n--- skill.md vs OpenAPI spec ---');
  if (report.drift.inSpecNotSkill.length) {
    console.log(`\nIN SPEC, MISSING FROM skill.md (${report.drift.inSpecNotSkill.length}):`);
    report.drift.inSpecNotSkill.forEach((e) => console.log(`  - ${e}`));
  }
  if (report.drift.inSkillNotSpec.length) {
    console.log(`\nIN skill.md, NOT IN SPEC (${report.drift.inSkillNotSpec.length}):`);
    report.drift.inSkillNotSpec.forEach((e) => console.log(`  - ${e}`));
  }
  if (!report.drift.inSpecNotSkill.length && !report.drift.inSkillNotSpec.length) {
    console.log('No drift.');
  }

  console.log('\n--- SDK vs OpenAPI spec ---');
  if (report.drift.inSpecNotSdk.length) {
    console.log(`\nIN SPEC, MISSING FROM SDK (${report.drift.inSpecNotSdk.length}):`);
    report.drift.inSpecNotSdk.forEach((e) => console.log(`  - ${e}`));
  }
  if (report.drift.inSdkNotSpec.length) {
    console.log(`\nIN SDK, NOT IN SPEC (${report.drift.inSdkNotSpec.length}):`);
    report.drift.inSdkNotSpec.forEach((e) => console.log(`  - ${e}`));
  }
  if (!report.drift.inSpecNotSdk.length && !report.drift.inSdkNotSpec.length) {
    console.log('No drift.');
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
