/**
 * Creative set commands (scoped to an advertiser)
 */

import { Command } from 'commander';
import { createClient, GlobalOptions } from '../utils';
import { formatOutput, printError, printSuccess, OutputFormat } from '../format';

export const creativeSetsCommand = new Command('creative-sets').description(
  'Manage creative sets for an advertiser'
);

creativeSetsCommand
  .command('list')
  .description('List creative sets for an advertiser')
  .requiredOption('--advertiser-id <id>', 'Advertiser ID')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.advertisers.creativeSets(options.advertiserId).list();
      formatOutput(result, globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

creativeSetsCommand
  .command('create')
  .description('Create a creative set')
  .requiredOption('--advertiser-id <id>', 'Advertiser ID')
  .requiredOption('--name <name>', 'Creative set name')
  .requiredOption('--type <type>', 'Creative set type (e.g., video, display)')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.advertisers.creativeSets(options.advertiserId).create({
        name: options.name,
        type: options.type,
      });
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess(`Created creative set: ${result.data.id}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

creativeSetsCommand
  .command('add-asset <creativeSetId>')
  .description('Add an asset to a creative set')
  .requiredOption('--advertiser-id <id>', 'Advertiser ID')
  .requiredOption('--asset-url <url>', 'Asset URL')
  .requiredOption('--name <name>', 'Asset name')
  .requiredOption('--type <type>', 'Asset type (e.g., video, image)')
  .option('--duration <seconds>', 'Asset duration in seconds (for video)')
  .action(async (creativeSetId: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const data: Record<string, unknown> = {
        assetUrl: options.assetUrl,
        name: options.name,
        type: options.type,
      };
      if (options.duration) data.duration = parseInt(options.duration, 10);

      const result = await client.advertisers
        .creativeSets(options.advertiserId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .addAsset(creativeSetId, data as any);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess(`Added asset: ${result.data.id}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

creativeSetsCommand
  .command('remove-asset <creativeSetId> <assetId>')
  .description('Remove an asset from a creative set')
  .requiredOption('--advertiser-id <id>', 'Advertiser ID')
  .action(async (creativeSetId: string, assetId: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      await client.advertisers
        .creativeSets(options.advertiserId)
        .removeAsset(creativeSetId, assetId);
      printSuccess(`Removed asset: ${assetId}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });
