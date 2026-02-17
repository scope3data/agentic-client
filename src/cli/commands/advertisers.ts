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
  .option('--include-brand', 'Include resolved brand info for each advertiser')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.advertisers.list({
        take: parseInt(options.take, 10),
        skip: parseInt(options.skip, 10),
        status: options.status,
        includeBrand: options.includeBrand,
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
  .requiredOption('--brand-domain <domain>', 'Brand website domain (e.g., nike.com)')
  .option('--description <desc>', 'Advertiser description')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.advertisers.create({
        name: options.name,
        brandDomain: options.brandDomain,
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
  .option('--brand-domain <domain>', 'New brand domain')
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const updateData: { name?: string; description?: string; brandDomain?: string } = {};
      if (options.name) updateData.name = options.name;
      if (options.description) updateData.description = options.description;
      if (options.brandDomain) updateData.brandDomain = options.brandDomain;

      if (Object.keys(updateData).length === 0) {
        printError('No update fields provided. Use --name, --description, or --brand-domain');
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
