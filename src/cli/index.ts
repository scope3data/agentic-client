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
import chalk from 'chalk';
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
  .description(
    'Scope3 Agentic Platform CLI\n\n' +
      'Documentation: https://github.com/scope3data/agentic-client#cli'
  )
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

// Add 'commands' command to list all available commands
const commandsCmd = new Command('commands')
  .description('List all available commands')
  .action(() => {
    console.log(chalk.bold('\nScope3 CLI - Commands by Persona\n'));

    // Buyer persona (default)
    console.log(
      chalk.green.bold('BUYER PERSONA') + chalk.gray(' (default, or use --persona buyer)')
    );
    console.log(
      chalk.gray('For programmatic ad buyers - manage advertisers, campaigns, and inventory\n')
    );

    console.log(chalk.cyan('  advertisers'));
    console.log('    list                      List all advertisers');
    console.log('    get <id>                  Get advertiser by ID');
    console.log('    create                    Create a new advertiser');
    console.log('    update <id>               Update an advertiser');
    console.log('    delete <id>               Delete an advertiser');

    console.log(chalk.cyan('\n  brands') + chalk.gray(' (buyer context)'));
    console.log('    list                      List brands available to link');
    console.log('    link                      Link a brand to an advertiser');
    console.log('    unlink                    Unlink a brand from an advertiser');
    console.log('    get-linked                Get the brand linked to an advertiser');

    console.log(chalk.cyan('\n  bundles'));
    console.log('    create                    Create a new media bundle');
    console.log('    discover-products <id>    Discover available products for a bundle');
    console.log('    browse-products           Browse products without creating a bundle');
    console.log('    products list <id>        List products in a bundle');
    console.log('    products add <id>         Add products to a bundle');
    console.log('    products remove <id>      Remove products from a bundle');

    console.log(chalk.cyan('\n  campaigns'));
    console.log('    list                      List all campaigns');
    console.log('    get <id>                  Get campaign by ID');
    console.log('    create-bundle             Create a bundle campaign');
    console.log('    create-performance        Create a performance campaign');
    console.log('    create-audience           Create an audience campaign');
    console.log('    update-bundle <id>        Update a bundle campaign');
    console.log('    update-performance <id>   Update a performance campaign');
    console.log('    execute <id>              Execute a campaign (go live)');
    console.log('    pause <id>                Pause an active campaign');

    // Brand persona
    console.log(chalk.magenta.bold('\n\nBRAND PERSONA') + chalk.gray(' (use --persona brand)'));
    console.log(chalk.gray('For brand owners - manage brand identity and manifests\n'));

    console.log(chalk.cyan('  brands'));
    console.log('    list                      List all owned brands');
    console.log('    get <id>                  Get brand by ID');
    console.log('    create                    Create a new brand');
    console.log('    update <id>               Update a brand');
    console.log('    delete <id>               Delete a brand');

    // Partner persona
    console.log(chalk.blue.bold('\n\nPARTNER PERSONA') + chalk.gray(' (use --persona partner)'));
    console.log(chalk.gray('For DSPs and publishers - integration health monitoring\n'));
    console.log(chalk.gray('  (Partner CLI commands not yet implemented)'));

    // Config (all personas)
    console.log(chalk.yellow.bold('\n\nCONFIGURATION') + chalk.gray(' (all personas)'));
    console.log(chalk.cyan('\n  config'));
    console.log('    set <key> <value>         Set a configuration value');
    console.log('    get [key]                 Get configuration value(s)');
    console.log('    clear                     Clear all configuration');
    console.log('    path                      Show configuration file path');

    console.log(chalk.gray('\n─────────────────────────────────────────────────────────────'));
    console.log(chalk.gray('Run "scope3 <command> --help" for details on a specific command.'));
    console.log(chalk.gray('Docs: https://github.com/scope3data/agentic-client#cli\n'));
  });

program.addCommand(commandsCmd);

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
