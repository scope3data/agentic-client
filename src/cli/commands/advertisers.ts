/**
 * Advertiser commands
 */

import { Command } from 'commander';
import { createClient, GlobalOptions } from '../utils';
import { formatOutput, printError, printSuccess, OutputFormat } from '../format';

export const advertisersCommand = new Command('advertisers').description('Manage advertisers');

/**
 * List advertisers
 */
advertisersCommand
  .command('list')
  .description('List all advertisers')
  .option('--take <n>', 'Maximum number of results', '50')
  .option('--skip <n>', 'Number of results to skip', '0')
  .option('--status <status>', 'Filter by status (ACTIVE, ARCHIVED)')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.advertisers.list({
        take: parseInt(options.take, 10),
        skip: parseInt(options.skip, 10),
        status: options.status,
      });

      formatOutput(result, globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Get advertiser by ID
 */
advertisersCommand
  .command('get <id>')
  .description('Get advertiser by ID')
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.advertisers.get(id);
      formatOutput(result, globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Create advertiser
 */
advertisersCommand
  .command('create')
  .description('Create a new advertiser')
  .requiredOption('--name <name>', 'Advertiser name')
  .option('--description <desc>', 'Advertiser description')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.advertisers.create({
        name: options.name,
        description: options.description,
      });

      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess(`Created advertiser: ${result.data.id}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Update advertiser
 */
advertisersCommand
  .command('update <id>')
  .description('Update an advertiser')
  .option('--name <name>', 'New name')
  .option('--description <desc>', 'New description')
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const updateData: { name?: string; description?: string } = {};
      if (options.name) updateData.name = options.name;
      if (options.description) updateData.description = options.description;

      if (Object.keys(updateData).length === 0) {
        printError('No update fields provided. Use --name or --description');
        process.exit(1);
      }

      const result = await client.advertisers.update(id, updateData);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess('Advertiser updated');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Delete advertiser
 */
advertisersCommand
  .command('delete <id>')
  .description('Delete an advertiser')
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      await client.advertisers.delete(id);
      printSuccess(`Deleted advertiser: ${id}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });
