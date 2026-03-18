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

  // Strip Zodios-specific code (imports and endpoint definitions)
  content = content.replace(/^import\s+\{[^}]*\}\s+from\s+['"]@zodios\/core['"];?\s*\n/m, '');
  content = content.replace(/\n*const\s+endpoints\s*=\s*makeApi\([\s\S]*$/, '\n');

  if (!content.startsWith('/* eslint-disable */')) {
    content =
      '/* eslint-disable */\n// Auto-generated from OpenAPI spec - DO NOT EDIT\n\n' + content;
  }

  content = content.replace(/z\.union\(\[\]\)/g, 'z.never()');
  content = content.replace(/z\.array\(z\.never\(\)\)/g, 'z.array(z.unknown())');

  // Fix path params: generator always uses 'id', needs the specific param name
  const pathParamFixes: Array<[RegExp, string]> = [
    [/path: '\/campaigns\/:campaignId',([\s\S]*?)name: 'id',/g, "path: '/campaigns/:campaignId',$1name: 'campaignId',"],
    [/path: '\/advertisers\/:advertiserId',([\s\S]*?)name: 'id',/g, "path: '/advertisers/:advertiserId',$1name: 'advertiserId',"],
    [/path: '\/tasks\/:taskId',([\s\S]*?)name: 'id',/g, "path: '/tasks/:taskId',$1name: 'taskId',"],
    [/path: '\/sales-agents\/:agentId',([\s\S]*?)name: 'id',/g, "path: '/sales-agents/:agentId',$1name: 'agentId',"],
  ];
  for (const [pattern, replacement] of pathParamFixes) {
    content = content.replace(pattern, replacement);
  }

  // Remove regex validators that conflict with datetime({ offset: true })
  content = content.replace(
    /\.regex\(\s*\/\^[^/]+\(\?:Z\)\)\$\/\s*\)\s*\.datetime\(\{ offset: true \}\)/g,
    '.datetime({ offset: true })'
  );

  content = content.replace(/\\&/g, '&');

  // Normalize schema names to PascalCase
  const nameRenames: Array<[RegExp, string]> = [];
  const namePattern = /^const ([a-z]\w*_\w+|[a-z]\w+) = /gm;
  let nameMatch;
  while ((nameMatch = namePattern.exec(content)) !== null) {
    const original = nameMatch[1];
    const pascal = original
      .replace(/_/g, ' ')
      .replace(/(?:^|\s)\w/g, (c) => c.trimStart().toUpperCase())
      .replace(/\s/g, '');
    if (pascal !== original) {
      nameRenames.push([new RegExp(`\\b${original}\\b`, 'g'), pascal]);
    }
  }
  for (const [pattern, replacement] of nameRenames) {
    content = content.replace(pattern, replacement);
  }

  // Remove duplicate aliases that collapse to the same name after PascalCase normalization
  // e.g. "const DiscoverProductsBody = DiscoverProductsBody;" becomes a self-reference
  content = content.replace(/^const (\w+) = \1;\n/gm, '');
  // Remove duplicate export keys
  const exportLines = new Set<string>();
  content = content.replace(
    /(export const schemas = \{[\s\S]*?\};)/,
    (exportBlock) => {
      return exportBlock.replace(/^(\s+\w+,?)$/gm, (line) => {
        const key = line.trim().replace(/,$/, '');
        if (exportLines.has(key)) return '';
        exportLines.add(key);
        return line;
      });
    }
  );

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
`;
  writeFileSync(join(schemasDir, 'index.ts'), indexContent);

  console.log('\nSchema generation complete!');
}

main().catch((err) => {
  console.error('Schema generation failed:', err);
  process.exit(1);
});
