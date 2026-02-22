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
 *   scope3 --persona partner partners list
 *   scope3 campaigns create-discovery --advertiser-id xxx --bundle-id yyy --name "Q1 Campaign"
 *   scope3 bundles create --advertiser-id xxx --channels ctv,display
 */

import { Command } from 'commander';
import chalk from 'chalk';
import {
  advertisersCommand,
  bundlesCommand,
  campaignsCommand,
  configCommand,
  conversionEventsCommand,
  creativeSetsCommand,
  loginCommand,
  logoutCommand,
  partnersCommand,
  reportingCommand,
  salesAgentsCommand,
  storefrontAgentsCommand,
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
  .version('2.0.0', '-V, --cli-version')
  .option('--api-key <key>', 'API key (or use: config set apiKey <key>)')
  .option('--api-version <v>', 'API version: v1, v2, or latest (default: v2)')
  .option('--environment <env>', 'Environment: production or staging (default: production)')
  .option('--base-url <url>', 'Custom API base URL')
  .option('--format <format>', 'Output format: json, table, or yaml (default: table)')
  .option('--debug', 'Enable debug mode')
  .option('--persona <persona>', 'API persona: buyer, partner, or storefront (default: buyer)');

// Warn if the OAuth session token is expired before running any command
program.hook('preAction', (_thisCommand, actionCommand) => {
  const skipCommands = ['login', 'logout', 'config', 'commands'];
  if (skipCommands.includes(actionCommand.name())) return;

  // If an explicit key is provided, OAuth session state is irrelevant
  if (_thisCommand.opts().apiKey || process.env.SCOPE3_API_KEY) return;

  const config = loadConfig();
  if (!config.oauthAccessToken || !config.tokenExpiry) return;

  const now = Math.floor(Date.now() / 1000);
  if (now >= config.tokenExpiry) {
    console.error(chalk.yellow('Your session has expired. Run "scope3 login" to log in again.'));
    process.exit(1);
  }
});

// Add commands
program.addCommand(loginCommand);
program.addCommand(logoutCommand);
program.addCommand(advertisersCommand);
program.addCommand(bundlesCommand);
program.addCommand(campaignsCommand);
program.addCommand(configCommand);
program.addCommand(conversionEventsCommand);
program.addCommand(creativeSetsCommand);
program.addCommand(partnersCommand);
program.addCommand(reportingCommand);
program.addCommand(salesAgentsCommand);
program.addCommand(storefrontAgentsCommand);

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
    console.log('    create-discovery          Create a discovery campaign');
    console.log('    create-performance        Create a performance campaign');
    console.log('    create-audience           Create an audience campaign');
    console.log('    update-discovery <id>     Update a discovery campaign');
    console.log('    update-performance <id>   Update a performance campaign');
    console.log('    execute <id>              Execute a campaign (go live)');
    console.log('    pause <id>                Pause an active campaign');

    console.log(chalk.cyan('\n  reporting'));
    console.log('    get                       Get reporting metrics');

    console.log(chalk.cyan('\n  sales-agents'));
    console.log('    list                      List available sales agents');
    console.log('    register-account <id>     Register an account for a sales agent');

    console.log(chalk.cyan('\n  conversion-events'));
    console.log('    list                      List conversion events for an advertiser');
    console.log('    get <id>                  Get a conversion event by ID');
    console.log('    create                    Create a conversion event');
    console.log('    update <id>               Update a conversion event');

    console.log(chalk.cyan('\n  creative-sets'));
    console.log('    list                      List creative sets for an advertiser');
    console.log('    create                    Create a creative set');
    console.log('    add-asset <id>            Add an asset to a creative set');
    console.log('    remove-asset <id> <assetId>  Remove an asset from a creative set');

    // Partner persona
    console.log(chalk.blue.bold('\n\nPARTNER PERSONA') + chalk.gray(' (use --persona partner)'));
    console.log(chalk.gray('For technology partners - manage partners and agents\n'));

    console.log(chalk.cyan('  partners'));
    console.log('    list                      List all partners');
    console.log('    create                    Create a new partner');
    console.log('    update <id>               Update a partner');
    console.log('    archive <id>              Archive a partner');

    console.log(chalk.cyan('\n  partners agents'));
    console.log('    list                      List all agents');
    console.log('    get <id>                  Get agent details');
    console.log('    register                  Register a new agent');
    console.log('    update <id>               Update an agent');
    console.log('    oauth-authorize <id>      Start agent-level OAuth flow');
    console.log('    oauth-authorize-account <id>  Start per-account OAuth flow');
    console.log('    oauth-exchange <id>       Exchange OAuth code for tokens');

    // Storefront persona
    console.log(
      chalk.magenta.bold('\n\nSTOREFRONT PERSONA') + chalk.gray(' (use --persona storefront)')
    );
    console.log(
      chalk.gray(
        'For sellers (ad networks, sales houses, publishers) - manage agents on the Scope3 marketplace\n'
      )
    );

    console.log(chalk.cyan('  agents'));
    console.log('    list                      List all storefront agents');
    console.log('    get <id>                  Get a storefront agent by platform ID');
    console.log('    create                    Create a new storefront agent');
    console.log('    update <id>               Update a storefront agent');
    console.log('    delete <id>               Delete a storefront agent');
    console.log('    upload <id>               Upload product templates (CSV or JSON)');
    console.log('    file-uploads <id>         List product template file uploads');

    console.log(chalk.cyan('\n  agents tasks'));
    console.log('    list <agentId>            List HITL tasks for an agent');
    console.log('    get <agentId> <taskId>    Get a task by ID');
    console.log('    claim <agentId> <taskId>  Claim a pending task');
    console.log('    complete <agentId> <taskId>  Complete a claimed task');

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

// Default action when no command provided but options were given
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
