#!/usr/bin/env node

/**
 * Scope3 CLI - Command line interface for the Scope3 Agentic Platform
 *
 * Usage:
 *   scope3 [options] <command>
 *
 * Examples:
 *   scope3 config set apiKey sk_xxx
 *   scope3 advertisers list
 *   scope3 campaigns create --advertiser-id xxx --type discovery --name "Q1 Campaign"
 */

import { Command } from 'commander';
import chalk from 'chalk';
import {
  advertisersCommand,
  campaignsCommand,
  configCommand,
  loginCommand,
  logoutCommand,
  reportingCommand,
} from './commands';
import { loadConfig } from './utils';

const program = new Command();

program
  .name('scope3')
  .description(
    'Scope3 Agentic Platform CLI\n\n' +
      'Quick Start:\n' +
      '  scope3 config set apiKey <your-key>    Save API key\n' +
      '  scope3 config set environment staging  Use staging (optional)\n' +
      '  scope3 advertisers list                Run commands\n\n' +
      'Documentation: https://github.com/scope3data/agentic-client#cli'
  )
  .version('3.0.0', '-V, --cli-version')
  .option('--api-key <key>', 'API key (or use: config set apiKey <key>)')
  .option('--api-version <v>', 'API version: v1, v2, or latest (default: v2)')
  .option('--environment <env>', 'Environment: production or staging (default: production)')
  .option('--base-url <url>', 'Custom API base URL')
  .option('--format <format>', 'Output format: json, table, or yaml (default: table)')
  .option('--debug', 'Enable debug mode')
  .option('--persona <persona>', 'API persona: buyer or storefront (default: buyer)');

program.hook('preAction', (_thisCommand, actionCommand) => {
  const skipCommands = ['login', 'logout', 'config', 'commands'];
  if (skipCommands.includes(actionCommand.name())) return;

  if (_thisCommand.opts().apiKey || process.env.SCOPE3_API_KEY) return;

  const config = loadConfig();
  if (!config.oauthAccessToken || !config.tokenExpiry) return;

  const now = Math.floor(Date.now() / 1000);
  if (now >= config.tokenExpiry) {
    console.error(chalk.yellow('Your session has expired. Run "scope3 login" to log in again.'));
    process.exit(1);
  }
});

program.addCommand(loginCommand);
program.addCommand(logoutCommand);
program.addCommand(advertisersCommand);
program.addCommand(campaignsCommand);
program.addCommand(configCommand);
program.addCommand(reportingCommand);

program.action(() => {
  const opts = program.opts();
  const hasOptions = opts.apiKey || opts.environment || opts.persona;

  if (hasOptions) {
    console.log(chalk.yellow('\nNote: Global options must be used WITH a command.\n'));
    console.log('Examples:');
    console.log(
      chalk.cyan('  scope3 --api-key <key> advertisers list') +
        chalk.gray('  # pass options with command')
    );
    console.log(
      chalk.cyan('  scope3 config set apiKey <key>') + chalk.gray('           # or save to config')
    );
    console.log(
      chalk.cyan('  scope3 config set environment staging') +
        chalk.gray('   # then run commands normally\n')
    );
  }
  program.help();
});

program.exitOverride((err) => {
  if (err.code === 'commander.help') {
    process.exit(0);
  }
  if (err.code === 'commander.version') {
    process.exit(0);
  }
  process.exit(1);
});

program.parse();
