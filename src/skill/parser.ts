/**
 * Parser for skill.md files
 * Extracts structured data from markdown format
 */

import type { ParsedSkill, SkillCommand, SkillParameter, SkillExample } from './types';

/**
 * Parse skill.md content into structured data
 *
 * @param content Raw skill.md content
 * @returns Parsed skill structure
 */
export function parseSkillMd(content: string): ParsedSkill {
  const skill: ParsedSkill = {
    name: '',
    version: '',
    description: '',
    apiBase: '',
    commands: [],
    examples: [],
  };

  // Parse YAML header (either --- front matter or ```yaml block)
  const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const yamlBlockMatch = content.match(/```yaml\n([\s\S]*?)```/);
  const yamlContent = frontMatterMatch?.[1] ?? yamlBlockMatch?.[1];
  if (yamlContent) {
    skill.name = extractYamlValue(yamlContent, 'name') ?? '';
    skill.version = extractYamlValue(yamlContent, 'version') ?? '';
    skill.description = extractYamlValue(yamlContent, 'description') ?? '';
    skill.apiBase =
      extractYamlValue(yamlContent, 'api_base_url') ??
      extractYamlValue(yamlContent, 'api_base') ??
      '';
  }

  // Parse command tables
  skill.commands = parseCommandTables(content);

  // Parse code examples
  skill.examples = parseExamples(content);

  return skill;
}

/**
 * Extract a value from simple YAML content
 */
function extractYamlValue(yaml: string, key: string): string | undefined {
  const regex = new RegExp(`^${key}:\\s*(.+)$`, 'm');
  const match = yaml.match(regex);
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : undefined;
}

/**
 * Parse command tables from markdown
 */
function parseCommandTables(content: string): SkillCommand[] {
  const commands: SkillCommand[] = [];

  // Match tables with Method | Endpoint | Description format
  const tableRegex = /\| Method \| Endpoint \| Description \|\n\|[-|]+\|\n((?:\|[^\n]+\|\n?)+)/g;

  let match;
  while ((match = tableRegex.exec(content)) !== null) {
    const rows = match[1].trim().split('\n');

    for (const row of rows) {
      const cells = row
        .split('|')
        .filter(Boolean)
        .map((c) => c.trim());

      if (cells.length >= 3) {
        const [method, endpoint, description] = cells;

        // Generate command name from endpoint
        const name = generateCommandName(method, endpoint);

        commands.push({
          name,
          method,
          path: endpoint,
          description,
          parameters: extractParametersFromEndpoint(endpoint),
        });
      }
    }
  }

  // Also parse MCP tools table
  const mcpTableRegex = /\| Tool \| Operations \|\n\|[-|]+\|\n((?:\|[^\n]+\|\n?)+)/g;

  while ((match = mcpTableRegex.exec(content)) !== null) {
    const rows = match[1].trim().split('\n');

    for (const row of rows) {
      const cells = row
        .split('|')
        .filter(Boolean)
        .map((c) => c.trim());

      if (cells.length >= 2) {
        const [tool, operations] = cells;
        const toolName = tool.replace(/`/g, '');
        const ops = operations.split(',').map((o) => o.trim());

        for (const op of ops) {
          commands.push({
            name: `${toolName} ${op}`,
            mcpTool: toolName,
            description: `${op} operation for ${toolName}`,
            parameters: [],
          });
        }
      }
    }
  }

  return commands;
}

/**
 * Generate a command name from method and endpoint
 */
function generateCommandName(method: string, endpoint: string): string {
  // Remove parameter placeholders and leading slash
  const path = endpoint.replace(/\{[^}]+\}/g, '').replace(/^\//, '');
  const segments = path.split('/').filter(Boolean);

  // Build name from path
  const resource = segments[0] || 'unknown';

  // Determine action from method
  let action: string;
  switch (method.toUpperCase()) {
    case 'GET':
      action = endpoint.includes('{') ? 'get' : 'list';
      break;
    case 'POST':
      if (endpoint.includes('/execute')) action = 'execute';
      else if (endpoint.includes('/pause')) action = 'pause';
      else action = 'create';
      break;
    case 'PUT':
    case 'PATCH':
      action = 'update';
      break;
    case 'DELETE':
      action = 'delete';
      break;
    default:
      action = method.toLowerCase();
  }

  // Handle nested resources
  if (segments.length > 1 && segments[1] !== '{id}') {
    return `${segments[0]} ${segments[1]} ${action}`;
  }

  return `${resource} ${action}`;
}

/**
 * Extract parameters from endpoint path
 */
function extractParametersFromEndpoint(endpoint: string): SkillParameter[] {
  const params: SkillParameter[] = [];
  const paramRegex = /\{([^}]+)\}/g;

  let match;
  while ((match = paramRegex.exec(endpoint)) !== null) {
    params.push({
      name: match[1],
      type: 'string',
      required: true,
      description: `${match[1]} parameter`,
    });
  }

  return params;
}

/**
 * Parse code examples from markdown
 */
function parseExamples(content: string): SkillExample[] {
  const examples: SkillExample[] = [];

  // Match code blocks with language
  const codeBlockRegex = /```(\w+)\n([\s\S]*?)```/g;

  let match;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const [, language, code] = match;

    // Skip yaml header and workflow diagrams
    if (language === 'yaml' || code.includes('→')) {
      continue;
    }

    // Try to extract title from preceding text
    const precedingText = content.slice(Math.max(0, match.index - 100), match.index);
    const titleMatch = precedingText.match(/### ([^\n]+)\n?$/);
    const title = titleMatch ? titleMatch[1] : `${language} example`;

    examples.push({
      title,
      language,
      code: code.trim(),
    });
  }

  return examples;
}
