#!/usr/bin/env node

import { Command } from 'commander';
import { Scope3AgenticClient } from './sdk';
import Table from 'cli-table3';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Configuration file location
const CONFIG_DIR = path.join(os.homedir(), '.scope3');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

interface CliConfig {
  apiKey?: string;
  baseUrl?: string;
}

interface MethodConfig {
  params: string[];
  optional?: boolean;
  required?: string[];
  json?: string[];
  array?: string[];
}

// Load config from file or environment
function loadConfig(): CliConfig {
  const config: CliConfig = {};

  // Try to load from config file
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const fileConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      config.apiKey = fileConfig.apiKey;
      config.baseUrl = fileConfig.baseUrl;
    } catch (error) {
      console.error(chalk.yellow('Warning: Failed to parse config file'));
    }
  }

  // Environment variables override config file
  if (process.env.SCOPE3_API_KEY) {
    config.apiKey = process.env.SCOPE3_API_KEY;
  }
  if (process.env.SCOPE3_BASE_URL) {
    config.baseUrl = process.env.SCOPE3_BASE_URL;
  }

  return config;
}

// Save config to file
function saveConfig(config: CliConfig): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  console.log(chalk.green(`Configuration saved to ${CONFIG_FILE}`));
}

// Format output based on format option
function formatOutput(data: any, format: string): void {
  if (format === 'json') {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  // Table format
  if (!data) {
    console.log(chalk.yellow('No data to display'));
    return;
  }

  // Handle ToolResponse wrapper
  const actualData = data.data || data;

  if (Array.isArray(actualData)) {
    if (actualData.length === 0) {
      console.log(chalk.yellow('No results found'));
      return;
    }

    // Create table from array
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
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value);
        })
      );
    });

    console.log(table.toString());
  } else if (typeof actualData === 'object') {
    // Create table for single object
    const table = new Table({
      wordWrap: true,
      wrapOnWordBoundary: false,
    });

    Object.entries(actualData).forEach(([key, value]) => {
      let displayValue: string;
      if (value === null || value === undefined) {
        displayValue = '';
      } else if (typeof value === 'object') {
        displayValue = JSON.stringify(value, null, 2);
      } else {
        displayValue = String(value);
      }
      table.push({ [chalk.cyan(key)]: displayValue });
    });

    console.log(table.toString());
  } else {
    console.log(actualData);
  }

  // Show success/message if present
  if (data.success !== undefined) {
    console.log(data.success ? chalk.green('✓ Success') : chalk.red('✗ Failed'));
  }
  if (data.message) {
    console.log(chalk.blue('Message:'), data.message);
  }
}

// Create client instance
function createClient(apiKey?: string, baseUrl?: string): Scope3AgenticClient {
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
    baseUrl: baseUrl || config.baseUrl,
  });
}

// Parse JSON argument
function parseJsonArg(value: string): any {
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error(chalk.red(`Error: Invalid JSON: ${value}`));
    process.exit(1);
  }
}

// Parse array argument
function parseArrayArg(value: string): string[] {
  return value.split(',').map((s) => s.trim());
}

// Main program
const program = new Command();

program
  .name('scope3')
  .description('CLI tool for Scope3 Agentic API')
  .version('1.0.0')
  .option('--api-key <key>', 'API key for authentication')
  .option('--base-url <url>', 'Base URL for API (default: production)')
  .option('--format <format>', 'Output format: json or table', 'table');

// Config command
const configCmd = program.command('config').description('Manage CLI configuration');

configCmd
  .command('set')
  .description('Set configuration value')
  .argument('<key>', 'Configuration key (apiKey or baseUrl)')
  .argument('<value>', 'Configuration value')
  .action((key: string, value: string) => {
    const config = loadConfig();
    if (key === 'apiKey') {
      config.apiKey = value;
    } else if (key === 'baseUrl') {
      config.baseUrl = value;
    } else {
      console.error(chalk.red(`Error: Unknown config key: ${key}`));
      console.log('Valid keys: apiKey, baseUrl');
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
      console.log(JSON.stringify(config, null, 2));
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

// Resource commands - Auto-generated
const resources: Record<string, Record<string, MethodConfig>> = {
  agents: {
    list: { params: ['type', 'status', 'organizationId', 'relationship', 'name'], optional: true },
    get: { params: ['agentId'], required: ['agentId'] },
    register: {
      params: [
        'type',
        'name',
        'endpointUrl',
        'protocol',
        'authenticationType',
        'description',
        'organizationId',
        'authConfig',
      ],
      required: ['type', 'name', 'endpointUrl', 'protocol'],
    },
    update: {
      params: [
        'agentId',
        'name',
        'description',
        'endpointUrl',
        'protocol',
        'authenticationType',
        'authConfig',
      ],
      required: ['agentId'],
    },
    unregister: { params: ['agentId'], required: ['agentId'] },
  },
  assets: {
    upload: {
      params: ['brandAgentId', 'assets'],
      required: ['brandAgentId', 'assets'],
      json: ['assets'],
    },
    list: { params: ['brandAgentId'], optional: true },
  },
  'brand-agents': {
    list: { params: [], optional: true },
    create: {
      params: ['name', 'description', 'nickname', 'externalId', 'advertiserDomains'],
      required: ['name'],
      array: ['advertiserDomains'],
    },
    get: { params: ['brandAgentId'], required: ['brandAgentId'] },
    update: {
      params: ['brandAgentId', 'name', 'description', 'tacticSeedDataCoop'],
      required: ['brandAgentId'],
    },
    delete: { params: ['brandAgentId'], required: ['brandAgentId'] },
  },
  'brand-standards': {
    list: {
      params: ['where', 'orderBy', 'take', 'skip'],
      optional: true,
      json: ['where', 'orderBy'],
    },
    create: {
      params: [
        'brandAgentId',
        'prompt',
        'name',
        'description',
        'isArchived',
        'countries',
        'channels',
        'brands',
      ],
      required: ['brandAgentId', 'prompt'],
      array: ['countries', 'channels', 'brands'],
    },
    delete: { params: ['brandStandardId'], required: ['brandStandardId'] },
  },
  'brand-stories': {
    list: { params: ['brandAgentId'], required: ['brandAgentId'] },
    create: {
      params: ['brandAgentId', 'name', 'prompt', 'countries', 'channels', 'languages', 'brands'],
      required: ['brandAgentId', 'name', 'prompt'],
      array: ['countries', 'channels', 'languages', 'brands'],
    },
    update: { params: ['brandStoryId', 'prompt'], required: ['brandStoryId', 'prompt'] },
    delete: { params: ['brandStoryId'], required: ['brandStoryId'] },
  },
  campaigns: {
    list: { params: ['brandAgentId', 'status', 'limit', 'offset'], optional: true },
    create: {
      params: [
        'prompt',
        'brandAgentId',
        'name',
        'budget',
        'startDate',
        'endDate',
        'scoringWeights',
        'outcomeScoreWindowDays',
        'segmentIds',
        'dealIds',
        'visibility',
        'status',
      ],
      required: ['prompt', 'brandAgentId'],
      json: ['budget', 'scoringWeights'],
      array: ['segmentIds', 'dealIds'],
    },
    update: {
      params: [
        'campaignId',
        'name',
        'prompt',
        'status',
        'budget',
        'startDate',
        'endDate',
        'scoringWeights',
        'outcomeScoreWindowDays',
        'segmentIds',
        'dealIds',
        'visibility',
      ],
      required: ['campaignId'],
      json: ['budget', 'scoringWeights'],
      array: ['segmentIds', 'dealIds'],
    },
    delete: { params: ['campaignId', 'hardDelete'], required: ['campaignId'] },
    'get-summary': { params: ['campaignId'], required: ['campaignId'] },
    'list-tactics': { params: ['campaignId', 'includeArchived'], required: ['campaignId'] },
    'validate-brief': { params: ['brief', 'brandAgentId', 'threshold'], required: ['brief'] },
  },
  channels: {
    list: { params: [], optional: true },
  },
  creatives: {
    list: { params: ['brandAgentId', 'campaignId'], optional: true },
    create: {
      params: [
        'brandAgentId',
        'name',
        'organizationId',
        'description',
        'formatSource',
        'formatId',
        'mediaUrl',
        'content',
        'assemblyMethod',
        'campaignId',
      ],
      required: ['brandAgentId', 'name'],
      json: ['content'],
    },
    get: { params: ['creativeId'], required: ['creativeId'] },
    update: { params: ['creativeId', 'name', 'status'], required: ['creativeId'] },
    delete: { params: ['creativeId'], required: ['creativeId'] },
    assign: { params: ['creativeId', 'campaignId'], required: ['creativeId', 'campaignId'] },
    'sync-sales-agents': { params: ['creativeId'], required: ['creativeId'] },
  },
  tactics: {
    list: { params: ['campaignId', 'includeArchived'], optional: true },
    create: {
      params: ['name', 'campaignId', 'prompt', 'channelCodes', 'countryCodes'],
      required: ['name', 'campaignId'],
      array: ['channelCodes', 'countryCodes'],
    },
    get: { params: ['tacticId'], required: ['tacticId'] },
    update: {
      params: ['tacticId', 'name', 'prompt', 'channelCodes', 'countryCodes'],
      required: ['tacticId'],
      array: ['channelCodes', 'countryCodes'],
    },
    delete: { params: ['tacticId'], required: ['tacticId'] },
    'link-campaign': { params: ['tacticId', 'campaignId'], required: ['tacticId', 'campaignId'] },
    'unlink-campaign': { params: ['tacticId', 'campaignId'], required: ['tacticId', 'campaignId'] },
  },
  'media-buys': {
    list: { params: ['tacticId', 'campaignId', 'includeArchived'], optional: true },
    create: {
      params: ['tacticId', 'name', 'products', 'budget', 'description', 'creativeIds'],
      required: ['tacticId', 'name', 'products', 'budget'],
      json: ['products', 'budget'],
      array: ['creativeIds'],
    },
    get: { params: ['mediaBuyId'], required: ['mediaBuyId'] },
    update: {
      params: ['mediaBuyId', 'name', 'budget', 'cpm', 'creativeIds'],
      required: ['mediaBuyId'],
      json: ['budget'],
      array: ['creativeIds'],
    },
    delete: { params: ['mediaBuyId'], required: ['mediaBuyId'] },
    execute: { params: ['mediaBuyId'], required: ['mediaBuyId'] },
  },
  notifications: {
    list: { params: ['unreadOnly', 'limit'], optional: true },
    'mark-read': { params: ['notificationId'], required: ['notificationId'] },
    'mark-acknowledged': { params: ['notificationId'], required: ['notificationId'] },
    'mark-all-read': { params: [], optional: true },
  },
  products: {
    list: { params: ['salesAgentId'], optional: true },
    discover: { params: ['salesAgentId'], optional: true },
    sync: { params: ['salesAgentId'], required: ['salesAgentId'] },
  },
};

// Generate commands for each resource
Object.entries(resources).forEach(([resourceName, methods]) => {
  const resourceCmd = program.command(resourceName).description(`Manage ${resourceName}`);

  Object.entries(methods).forEach(([methodName, config]) => {
    const cmd = resourceCmd.command(methodName).description(`${methodName} ${resourceName}`);

    // Add options for each parameter
    config.params.forEach((param) => {
      const isRequired = config.required?.includes(param);
      const flag = `--${param} <value>`;
      const description = isRequired ? `${param} (required)` : `${param} (optional)`;
      cmd.option(flag, description);
    });

    cmd.action(async (options) => {
      const globalOpts = program.opts();
      const client = createClient(globalOpts.apiKey, globalOpts.baseUrl);

      try {
        // Build request object
        const request: any = {};

        config.params.forEach((param) => {
          const value = options[param];
          if (value !== undefined) {
            // Parse JSON fields
            if (config.json?.includes(param)) {
              request[param] = parseJsonArg(value);
            }
            // Parse array fields
            else if (config.array?.includes(param)) {
              request[param] = parseArrayArg(value);
            }
            // Parse numeric fields (only for actual numbers, not IDs that are strings)
            else if (
              ['limit', 'offset', 'take', 'skip', 'threshold', 'outcomeScoreWindowDays'].includes(
                param
              )
            ) {
              request[param] = parseInt(value, 10);
            }
            // Parse numeric ID fields (brandAgentId, organizationId, creativeId are numbers)
            else if (['brandAgentId', 'organizationId', 'creativeId'].includes(param)) {
              request[param] = parseInt(value, 10);
            }
            // Parse boolean fields
            else if (
              [
                'hardDelete',
                'includeArchived',
                'tacticSeedDataCoop',
                'isArchived',
                'unreadOnly',
              ].includes(param)
            ) {
              request[param] = value === 'true';
            }
            // Regular string fields
            else {
              request[param] = value;
            }
          }
        });

        // Validate required params
        const missingParams = config.required?.filter((p) => !options[p]) || [];
        if (missingParams.length > 0) {
          console.error(
            chalk.red(`Error: Missing required parameters: ${missingParams.join(', ')}`)
          );
          process.exit(1);
        }

        // Call the appropriate method
        const resourceKey = resourceName.replace(/-/g, '');
        const camelCaseResource = resourceKey.charAt(0).toLowerCase() + resourceKey.slice(1);
        const camelCaseMethod = methodName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

        let resource = (client as any)[camelCaseResource];

        // Handle special cases
        if (resourceName === 'brand-agents') resource = client.brandAgents;
        if (resourceName === 'brand-standards') resource = client.brandStandards;
        if (resourceName === 'brand-stories') resource = client.brandStories;
        if (resourceName === 'media-buys') resource = client.mediaBuys;

        if (!resource || typeof resource[camelCaseMethod] !== 'function') {
          console.error(chalk.red(`Error: Method ${camelCaseMethod} not found on ${resourceName}`));
          process.exit(1);
        }

        const result = await resource[camelCaseMethod](
          Object.keys(request).length > 0 ? request : undefined
        );

        formatOutput(result, globalOpts.format);
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        if (error.stack && process.env.DEBUG) {
          console.error(chalk.gray(error.stack));
        }
        process.exit(1);
      } finally {
        await client.disconnect();
      }
    });
  });
});

// Parse arguments
program.parse();
