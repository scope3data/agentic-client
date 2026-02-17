/**
 * Partner and agent commands for the Partner persona
 */

import { Command } from 'commander';
import { createClient, GlobalOptions } from '../utils';
import { formatOutput, printError, printSuccess, OutputFormat } from '../format';

export const partnersCommand = new Command('partners').description(
  'Manage partners and agents (partner persona)'
);

// ── Partner CRUD ─────────────────────────────────────────────────

partnersCommand
  .command('list')
  .description('List all partners')
  .option('--take <n>', 'Maximum number of results', '50')
  .option('--skip <n>', 'Number of results to skip', '0')
  .option('--status <status>', 'Filter by status (ACTIVE, ARCHIVED)')
  .option('--name <name>', 'Filter by name')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.partners.list({
        take: parseInt(options.take, 10),
        skip: parseInt(options.skip, 10),
        status: options.status,
        name: options.name,
      });

      formatOutput(result, globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

partnersCommand
  .command('create')
  .description('Create a new partner')
  .requiredOption('--name <name>', 'Partner name')
  .option('--description <desc>', 'Partner description')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.partners.create({
        name: options.name,
        description: options.description,
      });

      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess(`Created partner: ${result.data.id}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

partnersCommand
  .command('update <id>')
  .description('Update a partner')
  .option('--name <name>', 'New name')
  .option('--description <desc>', 'New description')
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const updateData: { name?: string; description?: string } = {};
      if (options.name) updateData.name = options.name;
      if (options.description) updateData.description = options.description;

      if (Object.keys(updateData).length === 0) {
        printError('No update fields provided');
        process.exit(1);
      }

      const result = await client.partners.update(id, updateData);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess('Partner updated');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

partnersCommand
  .command('archive <id>')
  .description('Archive a partner')
  .action(async (id: string, _options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      await client.partners.archive(id);
      printSuccess(`Archived partner: ${id}`);
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
  .command('register')
  .description('Register a new agent')
  .requiredOption('--partner-id <id>', 'Partner ID')
  .requiredOption('--type <type>', 'Agent type (SALES, SIGNAL, CREATIVE, OUTCOME)')
  .requiredOption('--name <name>', 'Agent name')
  .requiredOption('--endpoint-url <url>', 'Agent endpoint URL')
  .requiredOption('--protocol <proto>', 'Protocol (MCP, A2A)')
  .requiredOption(
    '--account-policy <policy>',
    'Account policy (comma-separated: advertiser_account,marketplace_account)'
  )
  .requiredOption('--auth-type <type>', 'Authentication type (API_KEY, NO_AUTH, JWT, OAUTH)')
  .option('--auth-token <token>', 'Bearer token for API_KEY auth')
  .option('--description <desc>', 'Agent description')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const data: Record<string, unknown> = {
        partnerId: options.partnerId,
        type: options.type,
        name: options.name,
        endpointUrl: options.endpointUrl,
        protocol: options.protocol,
        accountPolicy: options.accountPolicy.split(',').map((p: string) => p.trim()),
        authenticationType: options.authType,
        description: options.description,
      };

      if (options.authToken) {
        data.auth = { type: 'bearer', token: options.authToken };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await client.agents.register(data as any);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess(`Registered agent: ${result.data.agentId}`);
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
  .option('--account-policy <policy>', 'New account policy (comma-separated)')
  .action(async (agentId: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const data: Record<string, unknown> = {};
      if (options.name) data.name = options.name;
      if (options.description) data.description = options.description;
      if (options.status) data.status = options.status;
      if (options.endpointUrl) data.endpointUrl = options.endpointUrl;
      if (options.accountPolicy) {
        data.accountPolicy = options.accountPolicy.split(',').map((p: string) => p.trim());
      }

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

partnersCommand.addCommand(agentsCommand);

export { agentsCommand };
