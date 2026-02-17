/**
 * Conversion event commands (scoped to an advertiser)
 */

import { Command } from 'commander';
import { createClient, GlobalOptions } from '../utils';
import { formatOutput, printError, printSuccess, OutputFormat } from '../format';

export const conversionEventsCommand = new Command('conversion-events').description(
  'Manage conversion events for an advertiser'
);

conversionEventsCommand
  .command('list')
  .description('List conversion events for an advertiser')
  .requiredOption('--advertiser-id <id>', 'Advertiser ID')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.advertisers.conversionEvents(options.advertiserId).list();
      formatOutput(result, globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

conversionEventsCommand
  .command('get <id>')
  .description('Get a conversion event by ID')
  .requiredOption('--advertiser-id <id>', 'Advertiser ID')
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.advertisers.conversionEvents(options.advertiserId).get(id);
      formatOutput(result, globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

conversionEventsCommand
  .command('create')
  .description('Create a conversion event')
  .requiredOption('--advertiser-id <id>', 'Advertiser ID')
  .requiredOption('--name <name>', 'Event name')
  .requiredOption(
    '--type <type>',
    'Event type (PURCHASE, SIGNUP, LEAD, PAGE_VIEW, ADD_TO_CART, CUSTOM)'
  )
  .option('--description <desc>', 'Event description')
  .option('--value <n>', 'Conversion value')
  .option('--currency <code>', 'Currency code (e.g., USD)')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const data: Record<string, unknown> = {
        name: options.name,
        type: options.type,
      };
      if (options.description) data.description = options.description;
      if (options.value) data.value = parseFloat(options.value);
      if (options.currency) data.currency = options.currency;

      const result = await client.advertisers
        .conversionEvents(options.advertiserId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .create(data as any);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess(`Created conversion event: ${result.data.id}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

conversionEventsCommand
  .command('update <id>')
  .description('Update a conversion event')
  .requiredOption('--advertiser-id <id>', 'Advertiser ID')
  .option('--name <name>', 'New name')
  .option('--description <desc>', 'New description')
  .option('--value <n>', 'New conversion value')
  .option('--currency <code>', 'New currency code')
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const data: Record<string, unknown> = {};
      if (options.name) data.name = options.name;
      if (options.description) data.description = options.description;
      if (options.value) data.value = parseFloat(options.value);
      if (options.currency) data.currency = options.currency;

      if (Object.keys(data).length === 0) {
        printError('No update fields provided');
        process.exit(1);
      }

      const result = await client.advertisers
        .conversionEvents(options.advertiserId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update(id, data as any);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess('Conversion event updated');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });
