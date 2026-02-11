#!/usr/bin/env node

/**
 * Scope3 CLI - Command line interface for the Scope3 Agentic Platform
 *
 * Usage:
 *   scope3 [options] <command>
 *
 * Examples:
 *   scope3 config set apiKey sk_xxx
 *   scope3 --persona buyer advertisers list
 *   scope3 --persona brand brands list
 *   scope3 campaigns create-bundle --advertiser-id xxx --bundle-id yyy --name "Q1 Campaign"
 *   scope3 bundles create --advertiser-id xxx --channels ctv,display
 */

import { Command } from 'commander';
import {
  advertisersCommand,
  brandsCommand,
  bundlesCommand,
  campaignsCommand,
  configCommand,
} from './commands';

const program = new Command();

program
  .name('scope3')
  .description('Scope3 Agentic Platform CLI')
  .version('2.0.0', '-V, --cli-version')
  .option('--api-key <key>', 'API key for authentication')
  .option('--api-version <v>', 'API version: v1, v2, or latest', 'v2')
  .option('--environment <env>', 'Environment: production or staging', 'production')
  .option('--base-url <url>', 'Custom API base URL')
  .option('--format <format>', 'Output format: json, table, or yaml', 'table')
  .option('--debug', 'Enable debug mode')
  .option('--persona <persona>', 'API persona: buyer, brand, or partner', 'buyer');

// Add commands
program.addCommand(advertisersCommand);
program.addCommand(brandsCommand);
program.addCommand(bundlesCommand);
program.addCommand(campaignsCommand);
program.addCommand(configCommand);

// Error handling
program.exitOverride((err) => {
  if (err.code === 'commander.help') {
    process.exit(0);
  }
  if (err.code === 'commander.version') {
    process.exit(0);
  }
  process.exit(1);
});

// Parse and execute
program.parse();
