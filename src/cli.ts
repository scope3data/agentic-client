#!/usr/bin/env node

import { Command } from 'commander';
import { Scope3AgenticClient } from './sdk';
import Table from 'cli-table3';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { logger } from './utils/logger';

// Configuration file location
const CONFIG_DIR = path.join(os.homedir(), '.scope3');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const TOOLS_CACHE_FILE = path.join(CONFIG_DIR, 'tools-cache.json');
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CliConfig {
  apiKey?: string;
  environment?: 'production' | 'staging';
  baseUrl?: string;
}

interface ToolsCache {
  tools: McpTool[];
  timestamp: number;
}

interface McpTool {
  name: string;
  description?: string;
  inputSchema: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };
}

// Load config from file or environment
function loadConfig(): CliConfig {
  const config: CliConfig = {};

  // Try to load from config file
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const fileConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      config.apiKey = fileConfig.apiKey;
      config.environment = fileConfig.environment;
      config.baseUrl = fileConfig.baseUrl;
    } catch (error) {
      logger.warn('Failed to parse config file', { error });
      console.error(chalk.yellow('Warning: Failed to parse config file'));
    }
  }

  // Environment variables override config file
  if (process.env.SCOPE3_API_KEY) {
    config.apiKey = process.env.SCOPE3_API_KEY;
  }
  if (process.env.SCOPE3_ENVIRONMENT) {
    const env = process.env.SCOPE3_ENVIRONMENT.toLowerCase();
    if (env === 'production' || env === 'staging') {
      config.environment = env;
    } else {
      console.warn(
        chalk.yellow(
          `Warning: Invalid SCOPE3_ENVIRONMENT value "${process.env.SCOPE3_ENVIRONMENT}". ` +
            'Valid values: production, staging. Using default (production).'
        )
      );
    }
  }
  if (process.env.SCOPE3_BASE_URL) {
    config.baseUrl = process.env.SCOPE3_BASE_URL;
  }

  return config;
}

// Save config to file
function saveConfig(config: CliConfig): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 }); // Owner-only directory
  }

  // Write config with restricted permissions (owner read/write only)
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });

  console.log(chalk.green(`✓ Configuration saved to ${CONFIG_FILE}`));

  // Warn about plain-text storage if API key is being saved
  if (config.apiKey) {
    console.log(chalk.yellow('\n⚠  Security Notice:'));
    console.log(
      chalk.gray('   API key stored in plain text with file permissions 0600 (owner only)')
    );
    console.log(chalk.gray('   For better security, consider using environment variables:'));
    console.log(chalk.gray('   export SCOPE3_API_KEY=your_key'));
  }
}

// Load tools cache
function loadToolsCache(): ToolsCache | null {
  if (!fs.existsSync(TOOLS_CACHE_FILE)) {
    return null;
  }

  try {
    const cache: ToolsCache = JSON.parse(fs.readFileSync(TOOLS_CACHE_FILE, 'utf-8'));
    const age = Date.now() - cache.timestamp;

    if (age > CACHE_TTL) {
      return null; // Cache expired
    }

    return cache;
  } catch (error) {
    return null;
  }
}

// Save tools cache
function saveToolsCache(tools: McpTool[]): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  const cache: ToolsCache = {
    tools,
    timestamp: Date.now(),
  };

  fs.writeFileSync(TOOLS_CACHE_FILE, JSON.stringify(cache, null, 2));
}

// Fetch available tools from MCP server
async function fetchAvailableTools(
  client: Scope3AgenticClient,
  useCache = true
): Promise<McpTool[]> {
  // Try cache first
  if (useCache) {
    const cache = loadToolsCache();
    if (cache) {
      return cache.tools;
    }
  }

  // Fetch from server
  try {
    await client.connect();
    const response = (await client.listTools()) as { tools: McpTool[] };
    const tools = response.tools;

    // Save to cache
    saveToolsCache(tools);

    return tools;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error fetching tools', error);
    console.error(chalk.red('Error fetching tools:'), errorMessage);

    // Try to use stale cache as fallback
    if (fs.existsSync(TOOLS_CACHE_FILE)) {
      try {
        console.log(chalk.yellow('Using cached tools (may be outdated)'));
        const cache: ToolsCache = JSON.parse(fs.readFileSync(TOOLS_CACHE_FILE, 'utf-8'));
        return cache.tools;
      } catch (cacheError) {
        logger.warn('Failed to read stale cache', { error: cacheError });
        // Fall through to throw original error since we can't recover
      }
    }

    throw error;
  }
}

// Format output based on format option
function formatOutput(data: unknown, format: string): void {
  if (format === 'json') {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (!data) {
    console.log(chalk.yellow('No data to display'));
    return;
  }

  // Handle ToolResponse wrapper
  const dataObj = data as Record<string, unknown>;
  let actualData: unknown = dataObj.data || data;

  // Extract and display human-readable message if present (from MCP content.text)
  let humanMessage: string | undefined;
  if (typeof actualData === 'object' && actualData && '_message' in actualData) {
    const dataRecord = actualData as Record<string, unknown>;
    humanMessage = String(dataRecord._message);
    // Remove _message from the data to process
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _message, ...rest } = dataRecord;
    actualData = rest;
  }

  // Display the human-readable message first (if not in JSON mode)
  if (humanMessage) {
    console.log(chalk.cyan(humanMessage));
    console.log(); // Blank line before structured data
  }

  // If the response has an array field, extract it (common pattern for list responses)
  // Check for: items, brandAgents, campaigns, agents, etc.
  if (typeof actualData === 'object' && actualData && !Array.isArray(actualData)) {
    const dataRecord = actualData as Record<string, unknown>;
    // Find the first array field (including empty arrays)
    const arrayField = Object.keys(dataRecord).find((key) => Array.isArray(dataRecord[key]));
    if (arrayField) {
      actualData = dataRecord[arrayField];
    }
  }

  // If the response is just a single object with only a "message" field,
  // display the message directly without table formatting
  if (
    typeof actualData === 'object' &&
    actualData &&
    !Array.isArray(actualData) &&
    Object.keys(actualData).length === 1 &&
    'message' in actualData
  ) {
    console.log(String((actualData as Record<string, unknown>).message));
    return;
  }

  // Helper function to intelligently display or summarize values
  function summarizeValue(value: unknown): string {
    if (value === null || value === undefined) {
      return chalk.gray('(empty)');
    }

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) return chalk.gray('(empty array)');

      // Small arrays of primitives: show inline
      if (value.length <= 3 && value.every((item) => typeof item !== 'object' || item === null)) {
        const str = JSON.stringify(value);
        if (str.length <= 50) return str;
      }

      // Large or complex arrays: summarize
      return chalk.gray(`(${value.length} item${value.length === 1 ? '' : 's'})`);
    }

    // Handle objects
    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const keys = Object.keys(obj);
      if (keys.length === 0) return chalk.gray('(empty object)');

      // Simple objects with 1-2 primitive fields: show inline
      if (keys.length <= 2) {
        const allPrimitive = keys.every((k) => {
          const v = obj[k];
          return typeof v !== 'object' || v === null;
        });

        if (allPrimitive) {
          const str = JSON.stringify(value);
          if (str.length <= 50) return str;
        }
      }

      // Complex objects: summarize
      return chalk.gray(`(${keys.length} field${keys.length === 1 ? '' : 's'})`);
    }

    return String(value);
  }

  if (Array.isArray(actualData)) {
    if (actualData.length === 0) {
      console.log(chalk.yellow('No results found'));
      return;
    }

    if (format === 'list') {
      // List format: show each item with summaries for arrays/objects
      actualData.forEach((item, index) => {
        console.log(chalk.cyan(`\n${index + 1}.`));
        Object.entries(item).forEach(([key, value]) => {
          const displayValue = summarizeValue(value);
          console.log(`  ${chalk.yellow(key)}: ${displayValue}`);
        });
      });
      console.log(); // Extra line at end
    } else {
      // Table format: columnar view with summaries
      const keys = Object.keys(actualData[0]);
      const table = new Table({
        head: keys.map((k) => chalk.cyan(k)),
        wordWrap: true,
        wrapOnWordBoundary: false,
      });

      actualData.forEach((item) => {
        table.push(
          keys.map((k) => {
            const value = item[k];
            if (value === null || value === undefined) return '';

            // Use intelligent summarization for table cells too
            if (Array.isArray(value)) {
              if (value.length === 0) return '';
              // Small primitive arrays: show inline
              if (
                value.length <= 3 &&
                value.every((item) => typeof item !== 'object' || item === null)
              ) {
                const str = JSON.stringify(value);
                if (str.length <= 50) return str;
              }
              return `${value.length} item${value.length === 1 ? '' : 's'}`;
            }

            if (typeof value === 'object') {
              const obj = value as Record<string, unknown>;
              const objKeys = Object.keys(obj);
              if (objKeys.length === 0) return '';
              // Simple objects: show inline
              if (objKeys.length <= 2) {
                const allPrimitive = objKeys.every((k) => {
                  const v = obj[k];
                  return typeof v !== 'object' || v === null;
                });
                if (allPrimitive) {
                  const str = JSON.stringify(value);
                  if (str.length <= 50) return str;
                }
              }
              return `${objKeys.length} field${objKeys.length === 1 ? '' : 's'}`;
            }

            return String(value);
          })
        );
      });

      console.log(table.toString());
    }
  } else if (typeof actualData === 'object' && actualData) {
    // Create table for single object with summaries
    const table = new Table({
      wordWrap: true,
      wrapOnWordBoundary: false,
    });

    Object.entries(actualData as Record<string, unknown>).forEach(([key, value]) => {
      const displayValue = summarizeValue(value);
      table.push({ [chalk.cyan(key)]: displayValue });
    });

    console.log(table.toString());
  } else {
    console.log(actualData);
  }

  // Show success indicator if present (but don't duplicate message display)
  if (dataObj.success !== undefined) {
    console.log(dataObj.success ? chalk.green('✓ Success') : chalk.red('✗ Failed'));
  }
}

// Create client instance
function createClient(
  apiKey?: string,
  environment?: 'production' | 'staging',
  baseUrl?: string,
  debug?: boolean
): Scope3AgenticClient {
  const config = loadConfig();

  const finalApiKey = apiKey || config.apiKey;
  if (!finalApiKey) {
    console.error(chalk.red('Error: API key is required'));
    console.log('Set it via:');
    console.log('  - Environment variable: export SCOPE3_API_KEY=your_key');
    console.log('  - Config command: scope3 config set apiKey your_key');
    console.log('  - Flag: --api-key your_key');
    process.exit(1);
  }

  return new Scope3AgenticClient({
    apiKey: finalApiKey,
    environment: environment || config.environment,
    baseUrl: baseUrl || config.baseUrl,
    debug: debug || false,
  });
}

// Parse parameter value based on schema type
function parseParameterValue(value: string, schema: Record<string, unknown>): unknown {
  const type = schema.type as string;

  if (type === 'object' || type === 'array') {
    try {
      return JSON.parse(value);
    } catch (error) {
      logger.error('Invalid JSON parameter', error, { value, type });
      console.error(chalk.red(`Error: Invalid JSON for parameter: ${value}`));
      process.exit(1);
    }
  }

  if (type === 'integer' || type === 'number') {
    const num = Number(value);
    if (isNaN(num)) {
      logger.error('Invalid number parameter', undefined, { value, type });
      console.error(chalk.red(`Error: Invalid number: ${value}`));
      process.exit(1);
    }
    return num;
  }

  if (type === 'boolean') {
    if (value === 'true') return true;
    if (value === 'false') return false;
    logger.error('Invalid boolean parameter', undefined, { value, type });
    console.error(chalk.red(`Error: Invalid boolean (use 'true' or 'false'): ${value}`));
    process.exit(1);
  }

  // Default to string
  return value;
}

// Parse tool name into resource and method
function parseToolName(toolName: string): { resource: string; method: string } {
  const parts = toolName.split('_');

  if (parts.length < 2) {
    return { resource: 'tools', method: toolName };
  }

  // Handle cases like "campaigns_create", "brand_agents_list", etc.
  const method = parts[parts.length - 1];
  const resource = parts.slice(0, -1).join('-');

  return { resource, method };
}

// Main program
const program = new Command();

program
  .name('scope3')
  .description('CLI tool for Scope3 Agentic API (dynamically generated from MCP server)')
  .version('1.0.0')
  .option('--api-key <key>', 'API key for authentication')
  .option(
    '--environment <env>',
    'Environment: production or staging (default: production)',
    'production'
  )
  .option('--base-url <url>', 'Base URL for API (overrides environment)')
  .option('--format <format>', 'Output format: json, table, or list (default: table)', 'table')
  .option('--debug', 'Enable debug mode (show request/response details)')
  .option('--no-cache', 'Skip cache and fetch fresh tools list');

// Config command
const configCmd = program.command('config').description('Manage CLI configuration');

configCmd
  .command('set')
  .description('Set configuration value')
  .argument('<key>', 'Configuration key (apiKey, environment, or baseUrl)')
  .argument('<value>', 'Configuration value')
  .action((key: string, value: string) => {
    const config = loadConfig();
    if (key === 'apiKey') {
      config.apiKey = value;
    } else if (key === 'environment') {
      if (value !== 'production' && value !== 'staging') {
        console.error(chalk.red(`Error: Invalid environment: ${value}`));
        console.log('Valid values: production, staging');
        process.exit(1);
      }
      config.environment = value as 'production' | 'staging';
    } else if (key === 'baseUrl') {
      config.baseUrl = value;
    } else {
      console.error(chalk.red(`Error: Unknown config key: ${key}`));
      console.log('Valid keys: apiKey, environment, baseUrl');
      process.exit(1);
    }
    saveConfig(config);
  });

configCmd
  .command('get')
  .description('Get configuration value')
  .argument('[key]', 'Configuration key (apiKey or baseUrl). If omitted, shows all config')
  .action((key?: string) => {
    const config = loadConfig();
    if (!key) {
      // Redact sensitive values when displaying full config
      const safeConfig = { ...config };
      if (safeConfig.apiKey) {
        safeConfig.apiKey = safeConfig.apiKey.substring(0, 8) + '...[REDACTED]';
      }
      console.log(JSON.stringify(safeConfig, null, 2));
    } else if (key in config) {
      console.log(config[key as keyof CliConfig]);
    } else {
      console.error(chalk.red(`Error: Unknown config key: ${key}`));
      process.exit(1);
    }
  });

configCmd
  .command('clear')
  .description('Clear all configuration')
  .action(() => {
    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE);
      console.log(chalk.green('Configuration cleared'));
    } else {
      console.log(chalk.yellow('No configuration file found'));
    }
  });

// List available tools command
program
  .command('list-tools')
  .description('List all available API tools')
  .option('--refresh', 'Refresh tools cache')
  .action(async (options) => {
    const globalOpts = program.opts();
    const client = createClient(
      globalOpts.apiKey,
      globalOpts.environment,
      globalOpts.baseUrl,
      globalOpts.debug
    );

    try {
      const useCache = !options.refresh && globalOpts.cache !== false;
      const tools = await fetchAvailableTools(client, useCache);

      console.log(chalk.green(`\nFound ${tools.length} available tools:\n`));

      // Group by resource
      const grouped: Record<string, McpTool[]> = {};
      tools.forEach((tool) => {
        const { resource } = parseToolName(tool.name);
        if (!grouped[resource]) {
          grouped[resource] = [];
        }
        grouped[resource].push(tool);
      });

      // Display grouped
      Object.entries(grouped)
        .sort()
        .forEach(([resource, resourceTools]) => {
          console.log(chalk.cyan.bold(`\n${resource}:`));
          resourceTools.forEach((tool) => {
            const { method } = parseToolName(tool.name);
            const desc = tool.description || 'No description';
            console.log(`  ${chalk.yellow(method)} - ${desc}`);
          });
        });

      console.log();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red('Error:'), errorMessage);
      process.exit(1);
    } finally {
      await client.disconnect();
    }
  });

// Dynamic command generation
async function setupDynamicCommands() {
  const globalOpts = program.opts();

  // For help/version/config commands, don't fetch tools
  const args = process.argv.slice(2);
  if (
    args.length === 0 ||
    args.includes('--help') ||
    args.includes('-h') ||
    args.includes('--version') ||
    args.includes('-V') ||
    args[0] === 'config' ||
    args[0] === 'list-tools'
  ) {
    return;
  }

  try {
    const client = createClient(
      globalOpts.apiKey,
      globalOpts.environment,
      globalOpts.baseUrl,
      globalOpts.debug
    );
    const useCache = globalOpts.cache !== false;
    const tools = await fetchAvailableTools(client, useCache);
    await client.disconnect();

    // Group tools by resource
    const resourceGroups: Record<string, McpTool[]> = {};
    tools.forEach((tool) => {
      const { resource } = parseToolName(tool.name);
      if (!resourceGroups[resource]) {
        resourceGroups[resource] = [];
      }
      resourceGroups[resource].push(tool);
    });

    // Create commands for each resource
    Object.entries(resourceGroups).forEach(([resourceName, resourceTools]) => {
      const resourceCmd = program
        .command(resourceName)
        .description(`Manage ${resourceName} (${resourceTools.length} operations)`);

      resourceTools.forEach((tool) => {
        const { method } = parseToolName(tool.name);
        const cmd = resourceCmd
          .command(method)
          .description(tool.description || `${method} operation`);

        // Add options from schema
        const properties = (tool.inputSchema.properties || {}) as Record<
          string,
          Record<string, unknown>
        >;
        const required = tool.inputSchema.required || [];

        Object.entries(properties).forEach(([paramName, paramSchema]) => {
          const isRequired = required.includes(paramName);
          const paramType = paramSchema.type as string;
          const paramDesc = (paramSchema.description as string) || paramName;

          const flag = `--${paramName} <value>`;
          const description = `${paramDesc}${isRequired ? ' (required)' : ' (optional)'} [${paramType}]`;

          cmd.option(flag, description);
        });

        // Action handler
        cmd.action(async (options) => {
          const client = createClient(
            globalOpts.apiKey,
            globalOpts.environment,
            globalOpts.baseUrl,
            globalOpts.debug
          );

          try {
            await client.connect();

            // Build request from options
            const request: Record<string, unknown> = {};
            Object.entries(properties).forEach(([paramName, paramSchema]) => {
              const value = options[paramName];
              if (value !== undefined) {
                request[paramName] = parseParameterValue(
                  value,
                  paramSchema as Record<string, unknown>
                );
              }
            });

            // Validate required params
            const missing = required.filter((p) => request[p] === undefined);
            if (missing.length > 0) {
              console.error(chalk.red(`Error: Missing required parameters: ${missing.join(', ')}`));
              process.exit(1);
            }

            // Call the tool
            const result = await client.callTool(tool.name, request);
            formatOutput(result, globalOpts.format);
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            logger.error('Tool execution failed', error, { toolName: tool.name });
            console.error(chalk.red('Error:'), errorMessage);
            if (errorStack && process.env.DEBUG) {
              console.error(chalk.gray(errorStack));
            }
            process.exit(1);
          } finally {
            await client.disconnect();
          }
        });
      });
    });
  } catch (error) {
    // If we can't fetch tools, show a helpful error
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('CLI initialization failed', error);
    console.error(chalk.red('Error initializing CLI:'), errorMessage);
    console.log(chalk.yellow('\nMake sure your API key is configured:'));
    console.log('  scope3 config set apiKey YOUR_KEY');
    console.log('\nOr set via environment:');
    console.log('  export SCOPE3_API_KEY=YOUR_KEY');
    process.exit(1);
  }
}

// Setup and parse
setupDynamicCommands()
  .then(() => {
    program.parse();
  })
  .catch((error) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Fatal CLI error', error);
    console.error(chalk.red('Fatal error:'), errorMessage);
    process.exit(1);
  });
