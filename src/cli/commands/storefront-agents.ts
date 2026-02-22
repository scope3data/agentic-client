/**
 * Storefront agent and task commands for the Storefront persona
 */

import { readFileSync } from 'fs';
import { Command } from 'commander';
import { createClient, GlobalOptions } from '../utils';
import { formatOutput, printError, printSuccess, OutputFormat } from '../format';

export const storefrontAgentsCommand = new Command('storefront-agents').description(
  'Manage storefront agents (storefront persona)'
);

// ── Agent CRUD ────────────────────────────────────────────────────

storefrontAgentsCommand
  .command('list')
  .description('List all storefront agents')
  .action(async (_options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.storefrontAgents.list();
      formatOutput(result, globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontAgentsCommand
  .command('get <id>')
  .description('Get a storefront agent by platform ID')
  .action(async (id: string, _options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.storefrontAgents.get(id);
      formatOutput(result, globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontAgentsCommand
  .command('create')
  .description('Create a new storefront agent')
  .requiredOption('--platform-id <id>', 'Platform ID (e.g. my-podcast-network)')
  .requiredOption('--platform-name <name>', 'Display name')
  .requiredOption('--publisher-domain <domain>', 'Publisher domain (e.g. mypodcasts.com)')
  .option('--disabled', 'Create agent in disabled state')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.storefrontAgents.create({
        platformId: options.platformId,
        platformName: options.platformName,
        publisherDomain: options.publisherDomain,
        enabled: !options.disabled,
      });

      formatOutput(result, globalOpts.format as OutputFormat);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      printSuccess(`Created agent: ${(result as any).platformId ?? options.platformId}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontAgentsCommand
  .command('update <id>')
  .description('Update a storefront agent')
  .option('--platform-name <name>', 'New display name')
  .option('--publisher-domain <domain>', 'New publisher domain')
  .option('--enabled', 'Enable the agent')
  .option('--disabled', 'Disable the agent')
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const data: { platformName?: string; publisherDomain?: string; enabled?: boolean } = {};
      if (options.platformName) data.platformName = options.platformName;
      if (options.publisherDomain) data.publisherDomain = options.publisherDomain;
      if (options.enabled) data.enabled = true;
      if (options.disabled) data.enabled = false;

      if (Object.keys(data).length === 0) {
        printError('No update fields provided');
        process.exit(1);
      }

      const result = await client.storefrontAgents.update(id, data);
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess('Agent updated');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontAgentsCommand
  .command('delete <id>')
  .description('Delete a storefront agent')
  .action(async (id: string, _options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      await client.storefrontAgents.delete(id);
      printSuccess(`Deleted agent: ${id}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontAgentsCommand
  .command('upload <id>')
  .description('Upload product templates from a CSV or JSON file')
  .option('--file <path>', 'Path to CSV or JSON file')
  .option('--content <string>', 'Inline file content')
  .requiredOption('--type <type>', 'File type: csv or json')
  .option('--append', 'Append to existing templates instead of replacing')
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      if (!options.file && !options.content) {
        printError('Either --file or --content is required');
        process.exit(1);
      }

      const content = options.file ? readFileSync(options.file, 'utf-8') : options.content;

      const result = await client.storefrontAgents.upload(id, {
        content,
        file_type: options.type,
        replace: !options.append,
      });

      formatOutput(result, globalOpts.format as OutputFormat);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      printSuccess(`Uploaded ${(result as any).templatesAdded ?? 0} template(s)`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontAgentsCommand
  .command('file-uploads <id>')
  .description('List product template file uploads for an agent')
  .option('--limit <n>', 'Maximum number of results', '20')
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.storefrontAgents.fileUploads(id, parseInt(options.limit, 10));
      formatOutput(result, globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// ── Tasks (HITL) ──────────────────────────────────────────────────

const tasksCommand = new Command('tasks').description('Manage HITL tasks for an agent');

tasksCommand
  .command('list <agentId>')
  .description('List tasks for a storefront agent')
  .option('--status <status>', 'Filter by status: pending, claimed, completed')
  .option('--capability <cap>', 'Filter by capability')
  .option('--limit <n>', 'Maximum number of results', '20')
  .action(async (agentId: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.storefrontAgents.tasks(agentId).list({
        status: options.status,
        capability: options.capability,
        limit: parseInt(options.limit, 10),
      });

      formatOutput(result, globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

tasksCommand
  .command('get <agentId> <taskId>')
  .description('Get a task by ID')
  .action(async (agentId: string, taskId: string, _options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.storefrontAgents.tasks(agentId).get(taskId);
      formatOutput(result, globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

tasksCommand
  .command('claim <agentId> <taskId>')
  .description('Claim a pending task')
  .option('--claimed-by <name>', 'Name of the reviewer claiming the task')
  .action(async (agentId: string, taskId: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      const result = await client.storefrontAgents.tasks(agentId).claim(taskId, {
        claimed_by: options.claimedBy,
      });

      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess(`Claimed task: ${taskId}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

tasksCommand
  .command('complete <agentId> <taskId>')
  .description('Complete a claimed task')
  .requiredOption('--result <json>', 'Result JSON object (e.g. \'{"approved":true}\')')
  .option(
    '--correction <json>',
    'Correction JSON (e.g. \'{"original":{},"corrected":{},"reason":"..."}\')'
  )
  .action(async (agentId: string, taskId: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);

      let result: Record<string, unknown>;
      try {
        result = JSON.parse(options.result);
      } catch {
        printError('--result must be valid JSON');
        process.exit(1);
        return;
      }

      let correction:
        | { original: Record<string, unknown>; corrected: Record<string, unknown>; reason?: string }
        | undefined;
      if (options.correction) {
        try {
          correction = JSON.parse(options.correction);
        } catch {
          printError('--correction must be valid JSON');
          process.exit(1);
          return;
        }
      }

      const response = await client.storefrontAgents.tasks(agentId).complete(taskId, {
        result,
        correction,
      });

      formatOutput(response, globalOpts.format as OutputFormat);
      printSuccess(`Completed task: ${taskId}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontAgentsCommand.addCommand(tasksCommand);

export { tasksCommand as storefrontTasksCommand };
