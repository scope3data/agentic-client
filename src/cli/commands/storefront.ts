/**
 * Storefront and agent commands for the Storefront persona
 */

import { Command } from 'commander';
import { createClient, GlobalOptions } from '../utils';
import { formatOutput, printError, printSuccess, OutputFormat } from '../format';

export const storefrontCommand = new Command('storefront').description(
  'Manage storefront and agents (storefront persona)'
);

// ── Storefront CRUD ─────────────────────────────────────────────

storefrontCommand
  .command('get')
  .description('Get storefront details')
  .action(async (_options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.storefront.get();
      formatOutput(result, globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontCommand
  .command('create')
  .description('Create a new storefront')
  .requiredOption('--platform-id <id>', 'Platform ID')
  .requiredOption('--name <name>', 'Storefront name')
  .option('--publisher-domain <domain>', 'Publisher domain')
  .option('--plan <plan>', 'Plan')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.storefront.create({
        platformId: options.platformId,
        name: options.name,
        publisherDomain: options.publisherDomain,
        plan: options.plan,
      });

      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess(`Created storefront: ${result.data.platformId}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontCommand
  .command('update')
  .description('Update the storefront')
  .option('--name <name>', 'New name')
  .option('--publisher-domain <domain>', 'New publisher domain')
  .option('--plan <plan>', 'New plan')
  .option('--enabled <enabled>', 'Enable or disable')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const updateData: Record<string, unknown> = {};
      if (options.name) updateData.name = options.name;
      if (options.publisherDomain) updateData.publisherDomain = options.publisherDomain;
      if (options.plan) updateData.plan = options.plan;
      if (options.enabled !== undefined) updateData.enabled = options.enabled === 'true';

      if (Object.keys(updateData).length === 0) {
        printError('No update fields provided');
        process.exit(1);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await client.storefront.update(updateData as any);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess('Storefront updated');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontCommand
  .command('delete')
  .description('Delete the storefront')
  .action(async (_options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      await client.storefront.delete();
      printSuccess('Storefront deleted');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// ── Agent management ─────────────────────────────────────────────

const agentsCommand = new Command('agents').description('Manage agents');

agentsCommand
  .command('list')
  .description('List all agents')
  .option('--type <type>', 'Filter by type (SALES, SIGNAL, CREATIVE, OUTCOME)')
  .option('--status <status>', 'Filter by status (PENDING, ACTIVE, DISABLED)')
  .option('--relationship <rel>', 'Filter by relationship (SELF, MARKETPLACE)')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.agents.list({
        type: options.type,
        status: options.status,
        relationship: options.relationship,
      });

      formatOutput(result, globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

agentsCommand
  .command('get <agentId>')
  .description('Get agent details')
  .action(async (agentId: string, _options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.agents.get(agentId);
      formatOutput(result, globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

agentsCommand
  .command('update <agentId>')
  .description('Update an agent')
  .option('--name <name>', 'New name')
  .option('--description <desc>', 'New description')
  .option('--status <status>', 'New status (PENDING, ACTIVE, DISABLED)')
  .option('--endpoint-url <url>', 'New endpoint URL')
  .action(async (agentId: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const data: Record<string, unknown> = {};
      if (options.name) data.name = options.name;
      if (options.description) data.description = options.description;
      if (options.status) data.status = options.status;
      if (options.endpointUrl) data.endpointUrl = options.endpointUrl;

      if (Object.keys(data).length === 0) {
        printError('No update fields provided');
        process.exit(1);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await client.agents.update(agentId, data as any);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess('Agent updated');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

agentsCommand
  .command('oauth-authorize <agentId>')
  .description('Start agent-level OAuth flow')
  .action(async (agentId: string, _options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.agents.authorizeOAuth(agentId);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess('Present the authorizationUrl to the user to complete OAuth');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

agentsCommand
  .command('oauth-authorize-account <agentId>')
  .description('Start per-account OAuth flow')
  .action(async (agentId: string, _options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.agents.authorizeAccountOAuth(agentId);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess('Present the authorizationUrl to the user to complete OAuth');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

agentsCommand
  .command('oauth-exchange <agentId>')
  .description('Exchange OAuth code for tokens')
  .requiredOption('--code <code>', 'Authorization code')
  .requiredOption('--state <state>', 'State parameter')
  .action(async (agentId: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.agents.exchangeOAuthCode(agentId, {
        code: options.code,
        state: options.state,
      });

      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess('OAuth code exchanged');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontCommand.addCommand(agentsCommand);

export { agentsCommand };
