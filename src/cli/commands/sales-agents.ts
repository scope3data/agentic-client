/**
 * Sales agent commands for browsing agents and registering accounts
 */

import { Command } from 'commander';
import { createClient, GlobalOptions } from '../utils';
import { formatOutput, printError, printSuccess, OutputFormat } from '../format';

export const salesAgentsCommand = new Command('sales-agents').description(
  'Browse and connect with sales agents'
);

/**
 * List sales agents
 */
salesAgentsCommand
  .command('list')
  .description('List available sales agents')
  .option('--status <status>', 'Filter by status (PENDING, ACTIVE)')
  .option('--relationship <rel>', 'Filter by relationship (SELF, MARKETPLACE)')
  .option('--name <name>', 'Filter by agent name')
  .option('--limit <n>', 'Maximum number of results', '20')
  .option('--offset <n>', 'Number of results to skip', '0')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.salesAgents.list({
        status: options.status,
        relationship: options.relationship,
        name: options.name,
        limit: parseInt(options.limit, 10),
        offset: parseInt(options.offset, 10),
      });

      formatOutput(result, globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Register an account with a sales agent
 */
salesAgentsCommand
  .command('register-account <agentId>')
  .description('Register an account for a sales agent')
  .requiredOption('--advertiser-id <id>', 'Advertiser ID to connect')
  .requiredOption('--account-id <id>', 'Account identifier for this agent')
  .option('--auth-token <token>', 'Bearer token for API_KEY agents')
  .action(async (agentId: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const data: {
        advertiserId: string;
        accountIdentifier: string;
        auth?: { type: string; token: string };
      } = {
        advertiserId: options.advertiserId,
        accountIdentifier: options.accountId,
      };

      if (options.authToken) {
        data.auth = { type: 'bearer', token: options.authToken };
      }

      const result = await client.salesAgents.registerAccount(agentId, data);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess('Account registered');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });
