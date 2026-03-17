#!/usr/bin/env npx tsx
/**
 * Generates Zod schemas from the v2 Buyer OpenAPI spec
 *
 * Usage: npx tsx scripts/generate-schemas.ts
 */
import { execFileSync, execSync } from 'child_process';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BUYER_SPEC_URL = 'https://api.agentic.scope3.com/api/v2/buyer/openapi.yaml';
const BUYER_SPEC_PATH = join(__dirname, '../.context/attachments/buyer-api-v2.yaml');

function postProcessSchemas(filePath: string) {
  let content = readFileSync(filePath, 'utf-8');

  if (!content.startsWith('/* eslint-disable */')) {
    content =
      '/* eslint-disable */\n// @ts-nocheck\n// Auto-generated from OpenAPI spec - DO NOT EDIT\n\n' + content;
  }

  content = content.replace(/z\.union\(\[\]\)/g, 'z.never()');
  content = content.replace(/z\.array\(z\.never\(\)\)/g, 'z.array(z.unknown())');

  // Fix path parameter names to match path tokens (e.g., :campaignId needs name: 'campaignId')
  // The generator incorrectly uses 'id' for all path params
  const pathParamFixes: Array<[RegExp, string]> = [
    [/path: '\/campaigns\/:campaignId',([\s\S]*?)name: 'id',/g, "path: '/campaigns/:campaignId',$1name: 'campaignId',"],
    [/path: '\/advertisers\/:advertiserId',([\s\S]*?)name: 'id',/g, "path: '/advertisers/:advertiserId',$1name: 'advertiserId',"],
    [/path: '\/tasks\/:taskId',([\s\S]*?)name: 'id',/g, "path: '/tasks/:taskId',$1name: 'taskId',"],
    [/path: '\/sales-agents\/:agentId',([\s\S]*?)name: 'id',/g, "path: '/sales-agents/:agentId',$1name: 'agentId',"],
  ];
  for (const [pattern, replacement] of pathParamFixes) {
    content = content.replace(pattern, replacement);
  }

  // Remove redundant regex validators that conflict with datetime({ offset: true })
  // The regex only allows 'Z' suffix but datetime({ offset: true }) should allow offsets
  content = content.replace(
    /\.regex\(\s*\/\^[^/]+\(\?:Z\)\)\$\/\s*\)\s*\.datetime\(\{ offset: true \}\)/g,
    '.datetime({ offset: true })'
  );

  content = content.replace(/\\&/g, '&');

  writeFileSync(filePath, content);

  execSync(`npx prettier --write "${filePath}"`, { stdio: 'inherit' });
}

async function main() {
  console.log('Starting schema generation for v2 Buyer API...\n');

  const schemasDir = join(__dirname, '../src/schemas');
  mkdirSync(schemasDir, { recursive: true });

  let specPath: string;

  if (existsSync(BUYER_SPEC_PATH)) {
    console.log(`Using local spec: ${BUYER_SPEC_PATH}`);
    specPath = BUYER_SPEC_PATH;
  } else {
    console.log(`Local spec not found, fetching from ${BUYER_SPEC_URL}...`);
    const response = await fetch(BUYER_SPEC_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch spec: ${response.status} ${response.statusText}`);
    }
    const spec = await response.text();
    specPath = '/tmp/buyer-api-v2.yaml';
    writeFileSync(specPath, spec);
    console.log(`Downloaded spec to ${specPath}`);
  }

  const outputFile = join(schemasDir, 'buyer.ts');
  console.log(`Generating schemas to ${outputFile}...`);

  execFileSync('npx', ['openapi-zod-client', specPath, '-o', outputFile, '--export-schemas'], {
    stdio: 'inherit',
  });

  postProcessSchemas(outputFile);

  const indexContent = `// Auto-generated - DO NOT EDIT
// Regenerate with: npm run generate-schemas

export * as buyer from './buyer';
export { z } from 'zod';
`;
  writeFileSync(join(schemasDir, 'index.ts'), indexContent);

  console.log('\nSchema generation complete!');
}

main().catch((err) => {
  console.error('Schema generation failed:', err);
  process.exit(1);
});
