/**
 * Campaign commands - supports discovery, performance, and audience campaign types
 */

import { Command } from 'commander';
import { createClient, GlobalOptions } from '../utils';
import { formatOutput, printError, printSuccess, OutputFormat } from '../format';
import type {
  CreateDiscoveryCampaignInput,
  CreatePerformanceCampaignInput,
  CreateAudienceCampaignInput,
  UpdateDiscoveryCampaignInput,
  UpdatePerformanceCampaignInput,
  FlightDates,
  Budget,
  CampaignConstraints,
  PerformanceConfig,
  PerformanceObjective,
  CampaignType,
  CampaignStatus,
} from '../../types';

export const campaignsCommand = new Command('campaigns').description('Manage campaigns');

/**
 * List campaigns
 */
campaignsCommand
  .command('list')
  .description('List all campaigns')
  .option('--take <n>', 'Maximum number of results', '50')
  .option('--skip <n>', 'Number of results to skip', '0')
  .option('--advertiser-id <id>', 'Filter by advertiser ID')
  .option('--type <type>', 'Filter by type (discovery, performance, audience)')
  .option('--status <status>', 'Filter by status (DRAFT, ACTIVE, PAUSED, COMPLETED, ARCHIVED)')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.campaigns.list({
        take: parseInt(options.take, 10),
        skip: parseInt(options.skip, 10),
        advertiserId: options.advertiserId,
        type: options.type as CampaignType | undefined,
        status: options.status as CampaignStatus | undefined,
      });

      formatOutput(result, globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Get campaign by ID
 */
campaignsCommand
  .command('get <id>')
  .description('Get campaign by ID')
  .action(async (id: string, _options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.campaigns.get(id);
      formatOutput(result, globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Create a discovery campaign
 */
campaignsCommand
  .command('create-discovery')
  .description('Create a discovery campaign')
  .requiredOption('--advertiser-id <id>', 'Advertiser ID')
  .requiredOption('--name <name>', 'Campaign name')
  .requiredOption('--bundle-id <id>', 'Bundle ID for inventory selection')
  .requiredOption('--start-date <date>', 'Start date (ISO format)')
  .requiredOption('--end-date <date>', 'End date (ISO format)')
  .requiredOption('--budget <amount>', 'Total budget amount')
  .option('--currency <code>', 'Budget currency (default: USD)', 'USD')
  .option('--pacing <type>', 'Budget pacing (EVEN, ASAP, FRONTLOADED)', 'EVEN')
  .option('--daily-cap <amount>', 'Daily spending cap')
  .option('--brief <text>', 'Campaign brief/description')
  .option('--channels <channels>', 'Comma-separated list of channels (e.g., ctv,display)')
  .option('--countries <codes>', 'Comma-separated list of country codes (e.g., US,CA)')
  .option('--product-ids <ids>', 'Comma-separated list of product IDs to include')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const flightDates: FlightDates = {
        startDate: options.startDate,
        endDate: options.endDate,
      };

      const budget: Budget = {
        total: parseFloat(options.budget),
        currency: options.currency,
        pacing: options.pacing,
      };

      if (options.dailyCap) {
        budget.dailyCap = parseFloat(options.dailyCap);
      }

      const constraints: CampaignConstraints = {};
      if (options.channels) {
        constraints.channels = options.channels.split(',').map((c: string) => c.trim());
      }
      if (options.countries) {
        constraints.countries = options.countries.split(',').map((c: string) => c.trim());
      }

      const data: CreateDiscoveryCampaignInput = {
        advertiserId: options.advertiserId,
        name: options.name,
        bundleId: options.bundleId,
        flightDates,
        budget,
        brief: options.brief,
        constraints: Object.keys(constraints).length > 0 ? constraints : undefined,
      };

      if (options.productIds) {
        data.productIds = options.productIds.split(',').map((id: string) => id.trim());
      }

      const result = await client.campaigns.createDiscovery(data);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess(`Created discovery campaign: ${result.data.id}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Create a performance campaign
 */
campaignsCommand
  .command('create-performance')
  .description('Create a new performance campaign')
  .requiredOption('--advertiser-id <id>', 'Advertiser ID')
  .requiredOption('--name <name>', 'Campaign name')
  .requiredOption('--start-date <date>', 'Start date (ISO format)')
  .requiredOption('--end-date <date>', 'End date (ISO format)')
  .requiredOption('--budget <amount>', 'Total budget amount')
  .requiredOption(
    '--objective <objective>',
    'Performance objective (ROAS, CONVERSIONS, LEADS, SALES)'
  )
  .option('--currency <code>', 'Budget currency (default: USD)', 'USD')
  .option('--pacing <type>', 'Budget pacing (EVEN, ASAP, FRONTLOADED)', 'EVEN')
  .option('--daily-cap <amount>', 'Daily spending cap')
  .option('--target-roas <value>', 'Target ROAS for optimization')
  .option('--channels <channels>', 'Comma-separated list of channels')
  .option('--countries <codes>', 'Comma-separated list of country codes')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const flightDates: FlightDates = {
        startDate: options.startDate,
        endDate: options.endDate,
      };

      const budget: Budget = {
        total: parseFloat(options.budget),
        currency: options.currency,
        pacing: options.pacing,
      };

      if (options.dailyCap) {
        budget.dailyCap = parseFloat(options.dailyCap);
      }

      const performanceConfig: PerformanceConfig = {
        objective: options.objective as PerformanceObjective,
      };

      if (options.targetRoas) {
        performanceConfig.goals = {
          targetRoas: parseFloat(options.targetRoas),
        };
      }

      const constraints: CampaignConstraints = {};
      if (options.channels) {
        constraints.channels = options.channels.split(',').map((c: string) => c.trim());
      }
      if (options.countries) {
        constraints.countries = options.countries.split(',').map((c: string) => c.trim());
      }

      const data: CreatePerformanceCampaignInput = {
        advertiserId: options.advertiserId,
        name: options.name,
        flightDates,
        budget,
        performanceConfig,
        constraints: Object.keys(constraints).length > 0 ? constraints : undefined,
      };

      const result = await client.campaigns.createPerformance(data);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess(`Created performance campaign: ${result.data.id}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Create an audience campaign
 */
campaignsCommand
  .command('create-audience')
  .description('Create a new audience campaign')
  .requiredOption('--advertiser-id <id>', 'Advertiser ID')
  .requiredOption('--name <name>', 'Campaign name')
  .requiredOption('--start-date <date>', 'Start date (ISO format)')
  .requiredOption('--end-date <date>', 'End date (ISO format)')
  .requiredOption('--budget <amount>', 'Total budget amount')
  .option('--currency <code>', 'Budget currency (default: USD)', 'USD')
  .option('--pacing <type>', 'Budget pacing (EVEN, ASAP, FRONTLOADED)', 'EVEN')
  .option('--daily-cap <amount>', 'Daily spending cap')
  .option('--signals <signals>', 'Comma-separated list of signal IDs')
  .option('--channels <channels>', 'Comma-separated list of channels')
  .option('--countries <codes>', 'Comma-separated list of country codes')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const flightDates: FlightDates = {
        startDate: options.startDate,
        endDate: options.endDate,
      };

      const budget: Budget = {
        total: parseFloat(options.budget),
        currency: options.currency,
        pacing: options.pacing,
      };

      if (options.dailyCap) {
        budget.dailyCap = parseFloat(options.dailyCap);
      }

      const constraints: CampaignConstraints = {};
      if (options.channels) {
        constraints.channels = options.channels.split(',').map((c: string) => c.trim());
      }
      if (options.countries) {
        constraints.countries = options.countries.split(',').map((c: string) => c.trim());
      }

      const data: CreateAudienceCampaignInput = {
        advertiserId: options.advertiserId,
        name: options.name,
        flightDates,
        budget,
        constraints: Object.keys(constraints).length > 0 ? constraints : undefined,
      };

      if (options.signals) {
        data.signals = options.signals.split(',').map((s: string) => s.trim());
      }

      const result = await client.campaigns.createAudience(data);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess(`Created audience campaign: ${result.data.id}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Update a discovery campaign
 */
campaignsCommand
  .command('update-discovery <id>')
  .description('Update a discovery campaign')
  .option('--name <name>', 'New name')
  .option('--start-date <date>', 'New start date')
  .option('--end-date <date>', 'New end date')
  .option('--budget <amount>', 'New total budget')
  .option('--brief <text>', 'New brief')
  .option('--product-ids <ids>', 'Comma-separated list of product IDs')
  .option('--channels <channels>', 'Comma-separated list of channels')
  .option('--countries <codes>', 'Comma-separated list of country codes')
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const data: UpdateDiscoveryCampaignInput = {};

      if (options.name) data.name = options.name;
      if (options.brief) data.brief = options.brief;

      if (options.startDate || options.endDate) {
        data.flightDates = {} as FlightDates;
        if (options.startDate) data.flightDates.startDate = options.startDate;
        if (options.endDate) data.flightDates.endDate = options.endDate;
      }

      if (options.budget) {
        data.budget = { total: parseFloat(options.budget) };
      }

      if (options.productIds) {
        data.productIds = options.productIds.split(',').map((pid: string) => pid.trim());
      }

      const constraints: CampaignConstraints = {};
      if (options.channels) {
        constraints.channels = options.channels.split(',').map((c: string) => c.trim());
      }
      if (options.countries) {
        constraints.countries = options.countries.split(',').map((c: string) => c.trim());
      }
      if (Object.keys(constraints).length > 0) {
        data.constraints = constraints;
      }

      if (Object.keys(data).length === 0) {
        printError('No update fields provided');
        process.exit(1);
      }

      const result = await client.campaigns.updateDiscovery(id, data);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess('Discovery campaign updated');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Update a performance campaign
 */
campaignsCommand
  .command('update-performance <id>')
  .description('Update a performance campaign')
  .option('--name <name>', 'New name')
  .option('--start-date <date>', 'New start date')
  .option('--end-date <date>', 'New end date')
  .option('--budget <amount>', 'New total budget')
  .option('--objective <objective>', 'New performance objective (ROAS, CONVERSIONS, LEADS, SALES)')
  .option('--target-roas <value>', 'New target ROAS')
  .option('--channels <channels>', 'Comma-separated list of channels')
  .option('--countries <codes>', 'Comma-separated list of country codes')
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const data: UpdatePerformanceCampaignInput = {};

      if (options.name) data.name = options.name;

      if (options.startDate || options.endDate) {
        data.flightDates = {} as FlightDates;
        if (options.startDate) data.flightDates.startDate = options.startDate;
        if (options.endDate) data.flightDates.endDate = options.endDate;
      }

      if (options.budget) {
        data.budget = { total: parseFloat(options.budget) };
      }

      if (options.objective || options.targetRoas) {
        data.performanceConfig = {} as PerformanceConfig;
        if (options.objective) {
          data.performanceConfig.objective = options.objective as PerformanceObjective;
        }
        if (options.targetRoas) {
          data.performanceConfig.goals = {
            targetRoas: parseFloat(options.targetRoas),
          };
        }
      }

      const constraints: CampaignConstraints = {};
      if (options.channels) {
        constraints.channels = options.channels.split(',').map((c: string) => c.trim());
      }
      if (options.countries) {
        constraints.countries = options.countries.split(',').map((c: string) => c.trim());
      }
      if (Object.keys(constraints).length > 0) {
        data.constraints = constraints;
      }

      if (Object.keys(data).length === 0) {
        printError('No update fields provided');
        process.exit(1);
      }

      const result = await client.campaigns.updatePerformance(id, data);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess('Performance campaign updated');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Execute campaign
 */
campaignsCommand
  .command('execute <id>')
  .description('Execute a campaign (go live)')
  .action(async (id: string, _options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.campaigns.execute(id);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess('Campaign executed');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Pause campaign
 */
campaignsCommand
  .command('pause <id>')
  .description('Pause an active campaign')
  .action(async (id: string, _options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.campaigns.pause(id);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess('Campaign paused');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });
