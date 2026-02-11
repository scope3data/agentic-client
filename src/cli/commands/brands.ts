/**
 * Brand commands - supports both buyer and brand persona modes
 *
 * Brand persona: manage brand identities directly (list, get, create, update, delete)
 * Buyer persona: discover brands and manage brand-advertiser links (list, link, unlink, get-linked)
 */

import { Command } from 'commander';
import { createClient, GlobalOptions, parseJsonArg } from '../utils';
import { formatOutput, printError, printSuccess, OutputFormat } from '../format';
import type { CreateBrandInput, UpdateBrandInput, BrandManifest } from '../../types';

export const brandsCommand = new Command('brands').description(
  'Manage brands (behavior depends on --persona)'
);

/**
 * List brands
 * - Brand persona: lists all owned brands
 * - Buyer persona: lists all brands available to the buyer
 */
brandsCommand
  .command('list')
  .description('List brands (brand persona: owned brands, buyer persona: available brands)')
  .option('--take <n>', 'Maximum number of results', '50')
  .option('--skip <n>', 'Number of results to skip', '0')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      const persona = globalOpts.persona || 'buyer';

      if (persona === 'brand') {
        const result = await client.brands.list({
          take: parseInt(options.take, 10),
          skip: parseInt(options.skip, 10),
        });
        formatOutput(result, globalOpts.format as OutputFormat);
      } else {
        // Buyer persona - use buyerBrands
        const result = await client.buyerBrands.list({
          take: parseInt(options.take, 10),
          skip: parseInt(options.skip, 10),
        });
        formatOutput(result, globalOpts.format as OutputFormat);
      }
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Get a brand by ID (brand persona only)
 */
brandsCommand
  .command('get <id>')
  .description('Get brand by ID (brand persona)')
  .action(async (id: string, _options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      if ((globalOpts.persona || 'buyer') !== 'brand') {
        printError('The "brands get" command requires --persona brand');
        process.exit(1);
      }
      const client = createClient(globalOpts);

      const result = await client.brands.get(id);
      formatOutput(result, globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Create a brand (brand persona only)
 */
brandsCommand
  .command('create')
  .description('Create a new brand (brand persona)')
  .option('--manifest-url <url>', 'Brand manifest URL')
  .option('--manifest-json <json>', 'Brand manifest as JSON string')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      if ((globalOpts.persona || 'buyer') !== 'brand') {
        printError('The "brands create" command requires --persona brand');
        process.exit(1);
      }
      const client = createClient(globalOpts);

      const data: CreateBrandInput = {};

      if (options.manifestUrl) {
        data.manifestUrl = options.manifestUrl;
      }

      if (options.manifestJson) {
        const parsed = parseJsonArg<BrandManifest>(options.manifestJson);
        if (typeof parsed === 'string') {
          printError('Invalid JSON for --manifest-json');
          process.exit(1);
        }
        data.manifestJson = parsed;
      }

      if (!data.manifestUrl && !data.manifestJson) {
        printError('Either --manifest-url or --manifest-json is required');
        process.exit(1);
      }

      const result = await client.brands.create(data);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess(`Created brand: ${result.data.id}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Update a brand (brand persona only)
 */
brandsCommand
  .command('update <id>')
  .description('Update a brand (brand persona)')
  .option('--manifest-url <url>', 'New brand manifest URL')
  .option('--manifest-json <json>', 'New brand manifest as JSON string')
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      if ((globalOpts.persona || 'buyer') !== 'brand') {
        printError('The "brands update" command requires --persona brand');
        process.exit(1);
      }
      const client = createClient(globalOpts);

      const data: UpdateBrandInput = {};

      if (options.manifestUrl) {
        data.manifestUrl = options.manifestUrl;
      }

      if (options.manifestJson) {
        const parsed = parseJsonArg<BrandManifest>(options.manifestJson);
        if (typeof parsed === 'string') {
          printError('Invalid JSON for --manifest-json');
          process.exit(1);
        }
        data.manifestJson = parsed;
      }

      if (!data.manifestUrl && !data.manifestJson) {
        printError('Provide --manifest-url or --manifest-json to update');
        process.exit(1);
      }

      const result = await client.brands.update(id, data);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess('Brand updated');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Delete a brand (brand persona only)
 */
brandsCommand
  .command('delete <id>')
  .description('Delete a brand (brand persona)')
  .action(async (id: string, _options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      if ((globalOpts.persona || 'buyer') !== 'brand') {
        printError('The "brands delete" command requires --persona brand');
        process.exit(1);
      }
      const client = createClient(globalOpts);

      await client.brands.delete(id);
      printSuccess(`Deleted brand: ${id}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// ── Buyer persona brand-advertiser linking commands ──────────────────

/**
 * Link a brand to an advertiser (buyer persona)
 */
brandsCommand
  .command('link')
  .description('Link a brand to an advertiser (buyer persona)')
  .requiredOption('--advertiser-id <id>', 'Advertiser ID')
  .requiredOption('--brand-id <id>', 'Brand ID to link')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.advertisers.brand(options.advertiserId).link({
        brandId: options.brandId,
      });

      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess(`Linked brand ${options.brandId} to advertiser ${options.advertiserId}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Unlink a brand from an advertiser (buyer persona)
 */
brandsCommand
  .command('unlink')
  .description('Unlink the brand from an advertiser (buyer persona)')
  .requiredOption('--advertiser-id <id>', 'Advertiser ID')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      await client.advertisers.brand(options.advertiserId).unlink();
      printSuccess(`Unlinked brand from advertiser ${options.advertiserId}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Get the brand linked to an advertiser (buyer persona)
 */
brandsCommand
  .command('get-linked')
  .description('Get the brand linked to an advertiser (buyer persona)')
  .requiredOption('--advertiser-id <id>', 'Advertiser ID')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.advertisers.brand(options.advertiserId).get();
      formatOutput(result, globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });
