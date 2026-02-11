/**
 * Bundle commands - manage media bundles and product discovery
 */

import { Command } from 'commander';
import { createClient, GlobalOptions, parseJsonArg } from '../utils';
import { formatOutput, printError, printSuccess, OutputFormat } from '../format';
import type {
  CreateBundleInput,
  DiscoverProductsParams,
  BrowseProductsInput,
  AddBundleProductsInput,
  BundleProductInput,
  RemoveBundleProductsInput,
} from '../../types';

export const bundlesCommand = new Command('bundles').description(
  'Manage media bundles and product discovery'
);

/**
 * Create a bundle
 */
bundlesCommand
  .command('create')
  .description('Create a new media bundle')
  .requiredOption('--advertiser-id <id>', 'Advertiser ID')
  .option('--channels <channels>', 'Comma-separated list of channels (e.g., ctv,display)')
  .option('--countries <codes>', 'Comma-separated list of country codes (e.g., US,CA)')
  .option('--brief <text>', 'Campaign brief/description')
  .option('--budget <amount>', 'Budget amount')
  .option('--start-date <date>', 'Flight start date (ISO format)')
  .option('--end-date <date>', 'Flight end date (ISO format)')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const data: CreateBundleInput = {
        advertiserId: options.advertiserId,
      };

      if (options.channels) {
        data.channels = options.channels.split(',').map((c: string) => c.trim());
      }
      if (options.countries) {
        data.countries = options.countries.split(',').map((c: string) => c.trim());
      }
      if (options.brief) {
        data.brief = options.brief;
      }
      if (options.budget) {
        data.budget = parseFloat(options.budget);
      }
      if (options.startDate && options.endDate) {
        data.flightDates = {
          startDate: options.startDate,
          endDate: options.endDate,
        };
      }

      const result = await client.bundles.create(data);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess(`Created bundle: ${result.data.bundleId}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Discover products for a bundle
 */
bundlesCommand
  .command('discover-products <bundle-id>')
  .description('Discover available products for a bundle')
  .option('--group-limit <n>', 'Max groups to return (default: 10, max: 50)')
  .option('--group-offset <n>', 'Groups to skip for pagination')
  .option('--products-per-group <n>', 'Products per group (default: 5, max: 50)')
  .option('--publisher-domain <domain>', 'Filter by publisher domain')
  .action(async (bundleId: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const params: DiscoverProductsParams = {};

      if (options.groupLimit) {
        params.groupLimit = parseInt(options.groupLimit, 10);
      }
      if (options.groupOffset) {
        params.groupOffset = parseInt(options.groupOffset, 10);
      }
      if (options.productsPerGroup) {
        params.productsPerGroup = parseInt(options.productsPerGroup, 10);
      }
      if (options.publisherDomain) {
        params.publisherDomain = options.publisherDomain;
      }

      const result = await client.bundles.discoverProducts(bundleId, params);
      formatOutput(result, globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Browse products without an existing bundle
 */
bundlesCommand
  .command('browse-products')
  .description('Browse available products without creating a bundle')
  .requiredOption('--advertiser-id <id>', 'Advertiser ID')
  .option('--channels <channels>', 'Comma-separated list of channels')
  .option('--countries <codes>', 'Comma-separated list of country codes')
  .option('--brief <text>', 'Campaign brief for context')
  .option('--publisher-domain <domain>', 'Filter by publisher domain')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const data: BrowseProductsInput = {
        advertiserId: options.advertiserId,
      };

      if (options.channels) {
        data.channels = options.channels.split(',').map((c: string) => c.trim());
      }
      if (options.countries) {
        data.countries = options.countries.split(',').map((c: string) => c.trim());
      }
      if (options.brief) {
        data.brief = options.brief;
      }
      if (options.publisherDomain) {
        data.publisherDomain = options.publisherDomain;
      }

      const result = await client.bundles.browseProducts(data);
      formatOutput(result, globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Products sub-commands for bundles
const productsCommand = bundlesCommand.command('products').description('Manage bundle products');

/**
 * List bundle products
 */
productsCommand
  .command('list <bundle-id>')
  .description('List all products in a bundle')
  .action(async (bundleId: string, _options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.bundles.products(bundleId).list();
      formatOutput(result, globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Add products to a bundle
 */
productsCommand
  .command('add <bundle-id>')
  .description('Add products to a bundle')
  .requiredOption(
    '--products <json>',
    'Products to add as JSON string (array of {productId, salesAgentId, groupId, groupName, cpm?, budget?})'
  )
  .action(async (bundleId: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const parsed = parseJsonArg<BundleProductInput[]>(options.products);
      if (typeof parsed === 'string') {
        printError('Invalid JSON for --products. Expected an array of product objects.');
        process.exit(1);
      }

      const data: AddBundleProductsInput = {
        products: parsed,
      };

      const result = await client.bundles.products(bundleId).add(data);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess(`Added ${data.products.length} product(s) to bundle`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Remove products from a bundle
 */
productsCommand
  .command('remove <bundle-id>')
  .description('Remove products from a bundle')
  .requiredOption('--product-ids <ids>', 'Comma-separated list of product IDs to remove')
  .action(async (bundleId: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const data: RemoveBundleProductsInput = {
        productIds: options.productIds.split(',').map((id: string) => id.trim()),
      };

      await client.bundles.products(bundleId).remove(data);
      printSuccess(`Removed ${data.productIds.length} product(s) from bundle`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });
