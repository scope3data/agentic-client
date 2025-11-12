#!/usr/bin/env ts-node
/**
 * Generates TypeScript SDK clients from OpenAPI specifications
 *
 * This script reads OpenAPI YAML files and generates:
 * - PlatformClient from platform-api.yaml (for brand advertisers/buyers)
 * - PartnerClient from partner-api.yaml (for DSPs/publishers/partners)
 *
 * Generated clients wrap MCP tool calls with typed methods.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface OpenAPISpec {
  info: {
    title: string;
    description: string;
  };
  paths: Record<string, Record<string, Operation>>;
  components?: {
    schemas?: Record<string, unknown>;
  };
}

interface Operation {
  operationId: string;
  summary?: string;
  description?: string;
  tags?: string[];
  requestBody?: {
    content: {
      'application/json': {
        schema: {
          $ref?: string;
          type?: string;
          properties?: Record<string, unknown>;
          required?: string[];
        };
      };
    };
  };
  responses?: Record<string, unknown>;
}

interface ResourceGroup {
  name: string;
  operations: Array<{
    operationId: string;
    methodName: string;
    summary?: string;
    description?: string;
    hasParams: boolean;
  }>;
}

function parseOpenAPISpec(filePath: string): OpenAPISpec {
  const content = fs.readFileSync(filePath, 'utf-8');
  return yaml.load(content) as OpenAPISpec;
}

function operationIdToMethodName(operationId: string, resourceName: string): string {
  // Convert snake_case operation IDs to camelCase method names
  // e.g., "brand_agent_list" on brandAgents resource -> "list"
  // e.g., "country_list" on targeting resource -> "countryList"
  // e.g., "tactic_link_campaign" on tactics resource -> "linkCampaign"

  const parts = operationId.split('_');

  // Convert resourceName to snake_case to match against operation ID
  // "brandAgents" -> "brand_agent", "mediaBuys" -> "media_buy"
  const resourceSnakeCase = resourceName
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/s$/, ''); // Remove trailing 's' for plural resources

  const resourceParts = resourceSnakeCase.split('_');

  // Check if operation ID starts with the resource name
  // e.g., "brand_agent_list" starts with ["brand", "agent"]
  let skipParts = 0;
  for (let i = 0; i < resourceParts.length && i < parts.length; i++) {
    if (parts[i] === resourceParts[i]) {
      skipParts++;
    } else {
      break;
    }
  }

  // If we matched the resource prefix, skip it
  const methodParts = skipParts > 0 ? parts.slice(skipParts) : parts;

  // Convert to camelCase
  return methodParts.map((part, i) =>
    i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
  ).join('');
}

function toCamelCase(str: string): string {
  // Convert "Brand Agents" or "brand_agents" to "brandAgents"
  return str
    .split(/[\s_-]+/)
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
}

function groupOperationsByResource(spec: OpenAPISpec): Map<string, ResourceGroup> {
  const groups = new Map<string, ResourceGroup>();

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (method !== 'post' || !operation.operationId) continue;

      // Skip mcp-initialize, it's handled by the base client
      if (operation.operationId === 'mcp_initialize') continue;

      // Extract resource name from operation ID or tags
      // e.g., "brand_agent_list" -> "brandAgents"
      const operationId = operation.operationId;
      let resourceName: string;

      if (operation.tags && operation.tags.length > 0) {
        // Use tag as resource name, convert to camelCase
        resourceName = toCamelCase(operation.tags[0]);
      } else {
        // Extract from operation ID
        const parts = operationId.split('_');
        // Find the action word index
        const actionIndex = parts.findIndex(p =>
          ['list', 'get', 'create', 'update', 'delete', 'execute', 'sync', 'validate', 'discover', 'save', 'mark'].includes(p)
        );

        if (actionIndex > 0) {
          // Resource name is everything before the action
          const resourceParts = parts.slice(0, actionIndex);
          resourceName = toCamelCase(resourceParts.join('_'));
        } else {
          // Default to first part
          resourceName = toCamelCase(parts[0]);
        }
      }

      if (!groups.has(resourceName)) {
        groups.set(resourceName, {
          name: resourceName,
          operations: [],
        });
      }

      const hasParams = !!(operation.requestBody?.content['application/json']?.schema);

      groups.get(resourceName)!.operations.push({
        operationId,
        methodName: operationIdToMethodName(operationId, resourceName),
        summary: operation.summary,
        description: operation.description,
        hasParams,
      });
    }
  }

  return groups;
}

function generateResourceClass(resource: ResourceGroup, typesImport: string): string {
  const className = `${resource.name.charAt(0).toUpperCase()}${resource.name.slice(1)}Resource`;

  let code = `import { Scope3Client } from '../../client';\n`;
  code += `import type { operations } from '../../types/${typesImport}';\n\n`;

  code += `export class ${className} {\n`;
  code += `  constructor(private client: Scope3Client) {}\n\n`;

  for (const op of resource.operations) {
    // Generate JSDoc comment
    if (op.summary || op.description) {
      code += `  /**\n`;
      if (op.summary) {
        code += `   * ${op.summary}\n`;
      }
      if (op.description && op.description !== op.summary) {
        code += `   * ${op.description.split('\n').join('\n   * ')}\n`;
      }
      code += `   */\n`;
    }

    // Generate method signature
    const paramsType = op.hasParams
      ? `operations['${op.operationId}']['requestBody']['content']['application/json']`
      : '{}';

    const responseType = `operations['${op.operationId}']['responses'][200]['content']['application/json']`;

    if (op.hasParams) {
      code += `  async ${op.methodName}(params: ${paramsType}): Promise<${responseType}> {\n`;
      code += `    return this.client['callTool']('${op.operationId}', params);\n`;
    } else {
      code += `  async ${op.methodName}(): Promise<${responseType}> {\n`;
      code += `    return this.client['callTool']('${op.operationId}', {});\n`;
    }
    code += `  }\n\n`;
  }

  code += `}\n`;

  return code;
}

function generateClientClass(
  clientName: string,
  apiTitle: string,
  apiDescription: string,
  resources: ResourceGroup[],
  typesImport: string
): string {
  let code = `import { Scope3Client } from './client';\n`;
  code += `import { ClientConfig } from './types';\n`;

  // Import all resource classes
  const clientDir = clientName.replace('Client', '').toLowerCase(); // "PlatformClient" -> "platform"
  for (const resource of resources) {
    const className = `${resource.name.charAt(0).toUpperCase()}${resource.name.slice(1)}Resource`;
    code += `import { ${className} } from './resources/${clientDir}/${resource.name}';\n`;
  }

  code += `\n`;
  code += `/**\n`;
  code += ` * ${apiTitle}\n`;
  code += ` * \n`;
  code += ` * ${apiDescription.split('\n').join('\n * ')}\n`;
  code += ` */\n`;
  code += `export class ${clientName} extends Scope3Client {\n`;

  // Declare resource properties
  for (const resource of resources) {
    const className = `${resource.name.charAt(0).toUpperCase()}${resource.name.slice(1)}Resource`;
    code += `  public readonly ${resource.name}: ${className};\n`;
  }

  code += `\n`;
  code += `  constructor(config: ClientConfig) {\n`;
  code += `    super(config);\n\n`;

  // Initialize resources
  for (const resource of resources) {
    const className = `${resource.name.charAt(0).toUpperCase()}${resource.name.slice(1)}Resource`;
    code += `    this.${resource.name} = new ${className}(this);\n`;
  }

  code += `  }\n\n`;

  // Add CLI support methods
  code += `  // Expose MCP methods for CLI dynamic command generation\n`;
  code += `  async listTools(): Promise<unknown> {\n`;
  code += `    if (!this.getClient()) {\n`;
  code += `      await this.connect();\n`;
  code += `    }\n`;
  code += `    return this.getClient().listTools();\n`;
  code += `  }\n\n`;

  code += `  async callTool<TRequest = Record<string, unknown>, TResponse = unknown>(\n`;
  code += `    toolName: string,\n`;
  code += `    args: TRequest\n`;
  code += `  ): Promise<TResponse> {\n`;
  code += `    return super.callTool(toolName, args);\n`;
  code += `  }\n`;

  code += `}\n`;

  return code;
}

function main() {
  const projectRoot = path.join(__dirname, '..');

  // Parse OpenAPI specs
  console.log('📖 Parsing OpenAPI specifications...');
  const platformSpec = parseOpenAPISpec(path.join(projectRoot, 'platform-api.yaml'));
  const partnerSpec = parseOpenAPISpec(path.join(projectRoot, 'partner-api.yaml'));

  // Group operations by resource
  console.log('🔍 Analyzing API operations...');
  const platformResources = Array.from(groupOperationsByResource(platformSpec).values());
  const partnerResources = Array.from(groupOperationsByResource(partnerSpec).values());

  console.log(`  Platform API: ${platformResources.length} resource groups`);
  console.log(`  Partner API: ${partnerResources.length} resource groups`);

  // Create output directories
  const platformResourcesDir = path.join(projectRoot, 'src/resources/platform');
  const partnerResourcesDir = path.join(projectRoot, 'src/resources/partner');

  fs.mkdirSync(platformResourcesDir, { recursive: true });
  fs.mkdirSync(partnerResourcesDir, { recursive: true });

  // Generate Platform resources
  console.log('\n🏗️  Generating Platform API resources...');
  for (const resource of platformResources) {
    const code = generateResourceClass(resource, 'platform-api');
    const filePath = path.join(platformResourcesDir, `${resource.name}.ts`);
    fs.writeFileSync(filePath, code);
    console.log(`  ✓ ${resource.name} (${resource.operations.length} operations)`);
  }

  // Generate Partner resources
  console.log('\n🏗️  Generating Partner API resources...');
  for (const resource of partnerResources) {
    const code = generateResourceClass(resource, 'partner-api');
    const filePath = path.join(partnerResourcesDir, `${resource.name}.ts`);
    fs.writeFileSync(filePath, code);
    console.log(`  ✓ ${resource.name} (${resource.operations.length} operations)`);
  }

  // Generate client classes
  console.log('\n🎯 Generating client classes...');

  const platformClient = generateClientClass(
    'PlatformClient',
    platformSpec.info.title,
    platformSpec.info.description,
    platformResources,
    'platform-api'
  );
  fs.writeFileSync(path.join(projectRoot, 'src/platform-client.ts'), platformClient);
  console.log('  ✓ PlatformClient');

  const partnerClient = generateClientClass(
    'PartnerClient',
    partnerSpec.info.title,
    partnerSpec.info.description,
    partnerResources,
    'partner-api'
  );
  fs.writeFileSync(path.join(projectRoot, 'src/partner-client.ts'), partnerClient);
  console.log('  ✓ PartnerClient');

  console.log('\n✅ SDK generation complete!');
}

main();
