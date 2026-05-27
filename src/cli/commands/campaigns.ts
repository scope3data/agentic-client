/**
 * Campaign commands
 */

import { Command } from 'commander';
import { createClient, GlobalOptions } from '../utils';
import { formatOutput, printError, printSuccess, OutputFormat } from '../format';
import type {
  CreateCampaignInput,
  UpdateCampaignInput,
  FlightDates,
  Budget,
  CampaignConstraints,
  CampaignType,
  CampaignStatus,
} from '../../types';

export const campaignsCommand = new Command('campaigns').description('Manage campaigns');

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

campaignsCommand
  .command('create')
  .description('Create a campaign')
  .requiredOption('--advertiser-id <id>', 'Advertiser ID')
  .requiredOption('--name <name>', 'Campaign name')
  .requiredOption('--type <type>', 'Campaign type (discovery, performance, audience)')
  .requiredOption('--start-date <date>', 'Start date (ISO format)')
  .requiredOption('--end-date <date>', 'End date (ISO format)')
  .requiredOption('--budget <amount>', 'Total budget amount')
  .option('--currency <code>', 'Budget currency (default: USD)', 'USD')
  .option('--pacing <type>', 'Budget pacing (EVEN, ASAP, FRONTLOADED)', 'EVEN')
  .option('--daily-cap <amount>', 'Daily spending cap')
  .option('--brief <text>', 'Campaign brief/description')
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

      const data: CreateCampaignInput = {
        advertiserId: options.advertiserId,
        name: options.name,
        type: options.type as CampaignType,
        flightDates,
        budget,
        brief: options.brief,
        constraints: Object.keys(constraints).length > 0 ? constraints : undefined,
      };

      const result = await client.campaigns.create(data);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess(`Created campaign: ${result.data.id}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

campaignsCommand
  .command('update <id>')
  .description('Update a campaign')
  .option('--name <name>', 'New name')
  .option('--start-date <date>', 'New start date')
  .option('--end-date <date>', 'New end date')
  .option('--budget <amount>', 'New total budget')
  .option('--brief <text>', 'New brief')
  .option('--channels <channels>', 'Comma-separated list of channels')
  .option('--countries <codes>', 'Comma-separated list of country codes')
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const data: UpdateCampaignInput = {};

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

      const result = await client.campaigns.update(id, data);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess('Campaign updated');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

campaignsCommand
  .command('delete <id>')
  .description('Delete a campaign')
  .action(async (id: string, _options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      await client.campaigns.delete(id);
      printSuccess('Campaign deleted');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

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
