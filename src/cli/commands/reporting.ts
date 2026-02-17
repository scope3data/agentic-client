/**
 * Reporting commands for retrieving campaign metrics
 */

import { Command } from 'commander';
import { createClient, GlobalOptions } from '../utils';
import { formatOutput, printError, OutputFormat } from '../format';

export const reportingCommand = new Command('reporting').description('View reporting metrics');

/**
 * Get reporting metrics
 */
reportingCommand
  .command('get')
  .description('Get reporting metrics')
  .option('--view <view>', 'Response format: summary or timeseries (default: summary)')
  .option('--days <n>', 'Number of days to include (default: 7)')
  .option('--start-date <date>', 'Start date (YYYY-MM-DD)')
  .option('--end-date <date>', 'End date (YYYY-MM-DD)')
  .option('--advertiser-id <id>', 'Filter by advertiser ID')
  .option('--campaign-id <id>', 'Filter by campaign ID')
  .option('--demo', 'Return demo data')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.reporting.get({
        view: options.view,
        days: options.days ? parseInt(options.days, 10) : undefined,
        startDate: options.startDate,
        endDate: options.endDate,
        advertiserId: options.advertiserId,
        campaignId: options.campaignId,
        demo: options.demo,
      });

      formatOutput(result, globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });
