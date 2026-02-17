/**
 * Config commands for managing CLI configuration
 */

import * as path from 'path';
import * as os from 'os';
import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig, saveConfig, clearConfig, getConfigForDisplay } from '../utils';

export const configCommand = new Command('config').description('Manage CLI configuration');

/**
 * Set a config value
 */
configCommand
  .command('set <key> <value>')
  .description('Set a configuration value')
  .action((key: string, value: string) => {
    const validKeys = ['apiKey', 'version', 'environment', 'baseUrl', 'persona'];

    if (!validKeys.includes(key)) {
      console.error(chalk.red(`Invalid config key: ${key}`));
      console.error(`Valid keys: ${validKeys.join(', ')}`);
      process.exit(1);
    }

    // Validate version
    if (key === 'version' && !['v1', 'v2', 'latest'].includes(value)) {
      console.error(chalk.red(`Invalid version: ${value}`));
      console.error('Valid versions: v1, v2, latest');
      process.exit(1);
    }

    // Validate environment
    if (key === 'environment' && !['production', 'staging'].includes(value)) {
      console.error(chalk.red(`Invalid environment: ${value}`));
      console.error('Valid environments: production, staging');
      process.exit(1);
    }

    // Validate persona
    if (key === 'persona' && !['buyer', 'partner'].includes(value)) {
      console.error(chalk.red(`Invalid persona: ${value}`));
      console.error('Valid personas: buyer, partner');
      process.exit(1);
    }

    const config = loadConfig();
    (config as Record<string, string>)[key] = value;
    saveConfig(config);

    console.log(chalk.green(`Set ${key}`));

    // Security notice for API key
    if (key === 'apiKey') {
      console.log(chalk.yellow('\nSecurity Notice:'));
      console.log('API key stored in ~/.scope3/config.json with permissions 0600 (owner only)');
    }
  });

/**
 * Get config values
 */
configCommand
  .command('get [key]')
  .description('Get configuration value(s)')
  .action((key?: string) => {
    const config = loadConfig();
    const display = getConfigForDisplay(config);

    if (key) {
      if (!(key in config)) {
        console.log(chalk.gray('Not set'));
        return;
      }
      console.log((display as Record<string, string | undefined>)[key] ?? chalk.gray('Not set'));
    } else {
      // Show all config
      console.log(chalk.cyan('Current configuration:'));
      for (const [k, v] of Object.entries(display)) {
        if (v !== undefined) {
          console.log(`  ${chalk.yellow(k)}: ${v}`);
        }
      }

      const hasConfig = Object.values(display).some((v) => v !== undefined);
      if (!hasConfig) {
        console.log(chalk.gray('  No configuration set'));
      }
    }
  });

/**
 * Clear all config
 */
configCommand
  .command('clear')
  .description('Clear all configuration')
  .action(() => {
    clearConfig();
    console.log(chalk.green('Configuration cleared'));
  });

/**
 * Show config file path
 */
configCommand
  .command('path')
  .description('Show configuration file path')
  .action(() => {
    const configPath = path.join(os.homedir(), '.scope3', 'config.json');
    console.log(configPath);
  });
