/**
 * Storefront agent and task commands for the Storefront persona
 */

import { readFileSync } from 'fs';
import { Command } from 'commander';
import { createClient, GlobalOptions } from '../utils';
import { formatOutput, printError, printSuccess, OutputFormat } from '../format';

export const storefrontCommand = new Command('storefront')
  .alias('sf')
  .description('Manage your storefront agents on the Scope3 marketplace');

function createStorefrontClient(options: GlobalOptions) {
  return createClient({ ...options, persona: 'storefront' });
}

function parseJson(value: string, flag: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    printError(`${flag} must be valid JSON`);
    process.exit(1);
  }
}

// ── Agent CRUD ────────────────────────────────────────────────────

storefrontCommand
  .command('list')
  .description('List all storefront agents')
  .action(async (_options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      formatOutput(await client.storefrontAgents.list(), globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontCommand
  .command('get <id>')
  .description('Get a storefront agent by platform ID')
  .action(async (id: string, _options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      formatOutput(await client.storefrontAgents.get(id), globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontCommand
  .command('create')
  .description('Create a new storefront agent')
  .requiredOption('--platform-id <id>', 'Platform ID (e.g. my-podcast-network)')
  .requiredOption('--platform-name <name>', 'Display name')
  .requiredOption('--publisher-domain <domain>', 'Publisher domain (e.g. mypodcasts.com)')
  .option('--disabled', 'Create agent in disabled state')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
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

storefrontCommand
  .command('update <id>')
  .description('Update a storefront agent')
  .option('--platform-name <name>', 'New display name')
  .option('--publisher-domain <domain>', 'New publisher domain')
  .option('--enabled', 'Enable the agent')
  .option('--disabled', 'Disable the agent')
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      const data: { platformName?: string; publisherDomain?: string; enabled?: boolean } = {};
      if (options.platformName) data.platformName = options.platformName;
      if (options.publisherDomain) data.publisherDomain = options.publisherDomain;
      if (options.enabled) data.enabled = true;
      if (options.disabled) data.enabled = false;
      if (Object.keys(data).length === 0) {
        printError('No update fields provided');
        process.exit(1);
      }
      formatOutput(
        await client.storefrontAgents.update(id, data),
        globalOpts.format as OutputFormat
      );
      printSuccess('Agent updated');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontCommand
  .command('delete <id>')
  .description('Delete a storefront agent')
  .action(async (id: string, _options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      await client.storefrontAgents.delete(id);
      printSuccess(`Deleted agent: ${id}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// ── Product templates ─────────────────────────────────────────────

storefrontCommand
  .command('upload <id>')
  .description('Upload product templates from a CSV or JSON file')
  .option('--file <path>', 'Path to CSV or JSON file')
  .option('--content <string>', 'Inline file content')
  .requiredOption('--type <type>', 'File type: csv or json')
  .option('--append', 'Append to existing templates instead of replacing')
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
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

storefrontCommand
  .command('file-uploads <id>')
  .description('List product template file uploads for an agent')
  .option('--limit <n>', 'Maximum number of results', '20')
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      formatOutput(
        await client.storefrontAgents.fileUploads(id, parseInt(options.limit, 10)),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// ── Traces ────────────────────────────────────────────────────────

const tracesCommand = new Command('traces').description('Manage decision traces');

tracesCommand
  .command('list <id>')
  .description('List decision traces for an agent')
  .option('--capability <cap>', 'Filter by capability')
  .option('--type <type>', 'Filter by trace type')
  .option('--min-confidence <n>', 'Minimum confidence score (0-1)')
  .option('--limit <n>', 'Maximum number of results', '20')
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      formatOutput(
        await client.storefrontAgents.traces(id).list({
          capability: options.capability,
          trace_type: options.type,
          min_confidence: options.minConfidence ? parseFloat(options.minConfidence) : undefined,
          limit: parseInt(options.limit, 10),
        }),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

tracesCommand
  .command('add <id>')
  .description('Add a decision trace to an agent')
  .requiredOption(
    '--trace-type <type>',
    'Trace type: recommendation, correction, outcome, policy, exception'
  )
  .requiredOption('--capability <cap>', 'Capability name (e.g. get_products)')
  .requiredOption('--decision <json>', 'Decision object as JSON')
  .option('--reasoning <text>', 'Reasoning explanation')
  .option('--valid-until <date>', 'Expiry date (ISO 8601)')
  .option('--brief-context <json>', 'Brief context as JSON')
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      const result = await client.storefrontAgents.traces(id).add({
        trace_type: options.traceType,
        capability: options.capability,
        decision: parseJson(options.decision, '--decision') as Record<string, unknown>,
        reasoning: options.reasoning,
        valid_until: options.validUntil,
        brief_context: options.briefContext
          ? (parseJson(options.briefContext, '--brief-context') as Record<string, unknown>)
          : undefined,
      });
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess('Trace added');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontCommand.addCommand(tracesCommand);

// ── Tasks (HITL) ──────────────────────────────────────────────────

const tasksCommand = new Command('tasks').description('Manage HITL tasks');

tasksCommand
  .command('list <agentId>')
  .description('List tasks for a storefront agent')
  .option('--status <status>', 'Filter by status: pending, claimed, completed')
  .option('--capability <cap>', 'Filter by capability')
  .option('--limit <n>', 'Maximum number of results', '20')
  .action(async (agentId: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      formatOutput(
        await client.storefrontAgents.tasks(agentId).list({
          status: options.status,
          capability: options.capability,
          limit: parseInt(options.limit, 10),
        }),
        globalOpts.format as OutputFormat
      );
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
      const client = createStorefrontClient(globalOpts);
      formatOutput(
        await client.storefrontAgents.tasks(agentId).get(taskId),
        globalOpts.format as OutputFormat
      );
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
      const client = createStorefrontClient(globalOpts);
      formatOutput(
        await client.storefrontAgents
          .tasks(agentId)
          .claim(taskId, { claimed_by: options.claimedBy }),
        globalOpts.format as OutputFormat
      );
      printSuccess(`Claimed task: ${taskId}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

tasksCommand
  .command('complete <agentId> <taskId>')
  .description('Complete a claimed task')
  .requiredOption('--result <json>', 'Result JSON (e.g. \'{"approved":true}\')')
  .option(
    '--correction <json>',
    'Correction JSON (e.g. \'{"original":{},"corrected":{},"reason":"..."}\')'
  )
  .action(async (agentId: string, taskId: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      const result = parseJson(options.result, '--result') as Record<string, unknown>;
      const correction = options.correction
        ? (parseJson(options.correction, '--correction') as {
            original: Record<string, unknown>;
            corrected: Record<string, unknown>;
            reason?: string;
          })
        : undefined;
      formatOutput(
        await client.storefrontAgents.tasks(agentId).complete(taskId, { result, correction }),
        globalOpts.format as OutputFormat
      );
      printSuccess(`Completed task: ${taskId}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontCommand.addCommand(tasksCommand);

// ── Capabilities ──────────────────────────────────────────────────

const capabilitiesCommand = new Command('capabilities').description(
  'Manage automation capabilities'
);

capabilitiesCommand
  .command('get <id>')
  .description('Get capability settings for an agent')
  .action(async (id: string, _options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      formatOutput(
        await client.storefrontAgents.getCapabilities(id),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

capabilitiesCommand
  .command('set <id>')
  .description('Update capability modes for an agent')
  .requiredOption(
    '--capabilities <json>',
    'Capabilities JSON (e.g. \'{"get_products":{"mode":"automated"},"create_media_buy":{"mode":"human"}}\')'
  )
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      const capabilities = parseJson(options.capabilities, '--capabilities') as Record<
        string,
        { mode: string }
      >;
      formatOutput(
        await client.storefrontAgents.setCapabilities(id, capabilities),
        globalOpts.format as OutputFormat
      );
      printSuccess('Capabilities updated');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontCommand.addCommand(capabilitiesCommand);

// ── Notifications ─────────────────────────────────────────────────

storefrontCommand
  .command('notifications <id>')
  .description('Configure HITL notification channels')
  .requiredOption(
    '--channels <json>',
    'Channels JSON (e.g. \'[{"type":"webhook","destination":"https://..."}]\')'
  )
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      const channels = parseJson(options.channels, '--channels') as {
        type: string;
        destination: string;
      }[];
      formatOutput(
        await client.storefrontAgents.setNotifications(id, channels),
        globalOpts.format as OutputFormat
      );
      printSuccess('Notifications configured');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// ── LLM provider ──────────────────────────────────────────────────

const llmProviderCommand = new Command('llm-provider').description('Manage LLM provider config');

llmProviderCommand
  .command('get <id>')
  .description('Get LLM provider config for an agent')
  .action(async (id: string, _options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      formatOutput(
        await client.storefrontAgents.getLlmProvider(id),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

llmProviderCommand
  .command('set <id>')
  .description('Set LLM provider for an agent')
  .requiredOption('--provider <name>', 'Provider: gemini, openai, or anthropic')
  .option('--model-id <id>', 'Model ID (e.g. gpt-4o)')
  .option('--api-key <key>', 'API key for the provider')
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      formatOutput(
        await client.storefrontAgents.setLlmProvider(id, {
          provider: options.provider,
          model_id: options.modelId,
          api_key: options.apiKey,
        }),
        globalOpts.format as OutputFormat
      );
      printSuccess('LLM provider updated');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontCommand.addCommand(llmProviderCommand);

// ── Inbound filters ───────────────────────────────────────────────

const inboundFiltersCommand = new Command('inbound-filters').description(
  'Manage inbound brief filters'
);

inboundFiltersCommand
  .command('get <id>')
  .description('Get inbound filters for an agent')
  .action(async (id: string, _options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      formatOutput(
        await client.storefrontAgents.getInboundFilters(id),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

inboundFiltersCommand
  .command('set <id>')
  .description('Set inbound filters for an agent')
  .requiredOption(
    '--filters <json>',
    'Filters JSON (e.g. \'[{"type":"category_block","config":{"categories":["gambling"]}}]\')'
  )
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      const filters = parseJson(options.filters, '--filters') as unknown[];
      formatOutput(
        await client.storefrontAgents.setInboundFilters(id, filters),
        globalOpts.format as OutputFormat
      );
      printSuccess('Inbound filters updated');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontCommand.addCommand(inboundFiltersCommand);

// ── Storefront sources ────────────────────────────────────────────

function makeGetSetCommand(
  name: string,
  description: string,
  optionName: string,
  getFn: (id: string) => Promise<unknown>,
  setFn: (id: string, sources: unknown[]) => Promise<unknown>
): Command {
  const cmd = new Command(name).description(description);
  cmd
    .command('get <id>')
    .description(`Get ${name} for an agent`)
    .action(async (id: string, _opts: unknown, c: Command) => {
      try {
        const globalOpts = c.optsWithGlobals() as GlobalOptions;
        const client = createStorefrontClient(globalOpts);
        formatOutput(
          await getFn.call(client.storefrontAgents, id),
          globalOpts.format as OutputFormat
        );
      } catch (error) {
        printError(error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });
  cmd
    .command('set <id>')
    .description(`Set ${name} for an agent`)
    .requiredOption(`--${optionName} <json>`, `${name} JSON array`)
    .action(async (id: string, opts: Record<string, string>, c: Command) => {
      try {
        const globalOpts = c.optsWithGlobals() as GlobalOptions;
        const client = createStorefrontClient(globalOpts);
        const camelKey = optionName.replace(/-([a-z])/g, (_, l: string) => l.toUpperCase());
        const sources = parseJson(opts[camelKey], `--${optionName}`) as unknown[];
        formatOutput(
          await setFn.call(client.storefrontAgents, id, sources),
          globalOpts.format as OutputFormat
        );
        printSuccess(`${name} updated`);
      } catch (error) {
        printError(error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });
  return cmd;
}

storefrontCommand.addCommand(
  makeGetSetCommand(
    'inventory-sources',
    'Manage inventory sources (ad servers, supply)',
    'inventory-sources',
    function (
      this: import('../../resources/storefront-agents').StorefrontAgentsResource,
      id: string
    ) {
      return this.getInventorySources(id);
    },
    function (
      this: import('../../resources/storefront-agents').StorefrontAgentsResource,
      id: string,
      s: unknown[]
    ) {
      return this.setInventorySources(id, s);
    }
  )
);
storefrontCommand.addCommand(
  makeGetSetCommand(
    'audience-sources',
    'Manage audience/identity sources',
    'audience-sources',
    function (
      this: import('../../resources/storefront-agents').StorefrontAgentsResource,
      id: string
    ) {
      return this.getAudienceSources(id);
    },
    function (
      this: import('../../resources/storefront-agents').StorefrontAgentsResource,
      id: string,
      s: unknown[]
    ) {
      return this.setAudienceSources(id, s);
    }
  )
);
storefrontCommand.addCommand(
  makeGetSetCommand(
    'account-sources',
    'Manage CRM account sources',
    'account-sources',
    function (
      this: import('../../resources/storefront-agents').StorefrontAgentsResource,
      id: string
    ) {
      return this.getAccountSources(id);
    },
    function (
      this: import('../../resources/storefront-agents').StorefrontAgentsResource,
      id: string,
      s: unknown[]
    ) {
      return this.setAccountSources(id, s);
    }
  )
);
storefrontCommand.addCommand(
  makeGetSetCommand(
    'rate-cards',
    'Manage pricing rate cards',
    'rate-cards',
    function (
      this: import('../../resources/storefront-agents').StorefrontAgentsResource,
      id: string
    ) {
      return this.getRateCards(id);
    },
    function (
      this: import('../../resources/storefront-agents').StorefrontAgentsResource,
      id: string,
      s: unknown[]
    ) {
      return this.setRateCards(id, s);
    }
  )
);

// ── Policy ────────────────────────────────────────────────────────

storefrontCommand
  .command('synthesize-policy <id>')
  .description('Synthesize and apply a decision policy from traces')
  .option('--dry-run', 'Preview policy without applying it')
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      formatOutput(
        await client.storefrontAgents.synthesizePolicy(id, !options.dryRun),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// ── Evals ─────────────────────────────────────────────────────────

const evalsCommand = new Command('evals').description('Run and compare agent evaluations');

evalsCommand
  .command('run <id>')
  .description('Run evaluation briefs against an agent')
  .requiredOption(
    '--briefs <json>',
    'Briefs JSON array (e.g. \'[{"brief":"Looking for podcast sponsorship..."}]\')'
  )
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      const briefs = parseJson(options.briefs, '--briefs') as { brief: string }[];
      formatOutput(
        await client.storefrontAgents.evals.run(id, briefs),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

evalsCommand
  .command('get <evalId>')
  .description('Get an eval result by ID')
  .action(async (evalId: string, _options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      formatOutput(
        await client.storefrontAgents.evals.get(evalId),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

evalsCommand
  .command('compare')
  .description('Compare two eval results')
  .requiredOption('--eval-a <id>', 'First eval ID')
  .requiredOption('--eval-b <id>', 'Second eval ID')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      formatOutput(
        await client.storefrontAgents.evals.compare(options.evalA, options.evalB),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontCommand.addCommand(evalsCommand);

// ── Audit ─────────────────────────────────────────────────────────

storefrontCommand
  .command('audit <id>')
  .description('Show configuration change history for an agent')
  .option('--limit <n>', 'Maximum number of results', '50')
  .action(async (id: string, options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      formatOutput(
        await client.storefrontAgents.audit(id, parseInt(options.limit, 10)),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

export { storefrontCommand as storefrontAgentsCommand, tasksCommand as storefrontTasksCommand };
