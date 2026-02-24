/**
 * Storefront commands for the Storefront persona
 */

import { readFileSync } from 'fs';
import { Command } from 'commander';
import { createClient, GlobalOptions, loadConfig, saveConfig } from '../utils';
import { formatOutput, printError, printSuccess, OutputFormat } from '../format';

const SINGLETON_STOREFRONT_ID = 'storefront';

const STOREFRONT_ID_HINT = 'Storefront is singleton-scoped. Use "storefront" if an ID is required.';

export const storefrontCommand = new Command('storefront')
  .alias('sf')
  .description(
    'Manage storefronts and internal agents on the Scope3 marketplace (JSON flags accept @file)'
  )
  .option('--storefront-id <id>', 'Storefront ID to scope agent operations');

function createStorefrontClient(options: GlobalOptions) {
  return createClient({ ...options, persona: 'storefront' });
}

function parseJson(value: string, flag: string): unknown {
  const raw = value.startsWith('@') ? readFileSync(value.slice(1), 'utf-8') : value;
  try {
    return JSON.parse(raw);
  } catch {
    printError(`${flag} must be valid JSON (you can also pass @path/to/file.json)`);
    process.exit(1);
  }
}

function parseOptionalInt(value: string | undefined, flag: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    printError(`${flag} must be a valid integer`);
    process.exit(1);
  }
  return parsed;
}

function parseOptionalFloat(value: string | undefined, flag: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    printError(`${flag} must be a valid number`);
    process.exit(1);
  }
  return parsed;
}

function ensureArray(value: unknown, flag: string): unknown[] {
  if (!Array.isArray(value)) {
    printError(`${flag} must be a JSON array`);
    process.exit(1);
  }
  return value;
}

function ensureObject(value: unknown, flag: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    printError(`${flag} must be a JSON object`);
    process.exit(1);
  }
  return value as Record<string, unknown>;
}

async function resolveStorefrontId(
  _client: ReturnType<typeof createStorefrontClient>,
  globalOpts: GlobalOptions,
  explicitId?: string
): Promise<string> {
  if (explicitId) {
    if (explicitId !== SINGLETON_STOREFRONT_ID) {
      throw new Error(
        `Only "${SINGLETON_STOREFRONT_ID}" is supported by the current storefront API. ${STOREFRONT_ID_HINT}`
      );
    }
    return SINGLETON_STOREFRONT_ID;
  }

  if (globalOpts.storefrontId) {
    if (globalOpts.storefrontId !== SINGLETON_STOREFRONT_ID) {
      throw new Error(
        `Only "${SINGLETON_STOREFRONT_ID}" is supported by the current storefront API. ${STOREFRONT_ID_HINT}`
      );
    }
    return SINGLETON_STOREFRONT_ID;
  }

  const config = loadConfig();
  if (config.storefrontId) {
    if (config.storefrontId !== SINGLETON_STOREFRONT_ID) {
      throw new Error(
        `Only "${SINGLETON_STOREFRONT_ID}" is supported by the current storefront API. ${STOREFRONT_ID_HINT}`
      );
    }
    return SINGLETON_STOREFRONT_ID;
  }
  return SINGLETON_STOREFRONT_ID;
}

async function getScopedContext(cmd: Command, explicitId?: string) {
  const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
  const client = createStorefrontClient(globalOpts);
  const storefrontId = await resolveStorefrontId(client, globalOpts, explicitId);
  return { globalOpts, client, storefrontId };
}

function settledValue(result: PromiseSettledResult<unknown>): unknown {
  if (result.status === 'fulfilled') {
    return result.value;
  }
  return {
    error: result.reason instanceof Error ? result.reason.message : String(result.reason),
  };
}

type SourceGroup = 'inventory' | 'audience' | 'signals' | 'account';

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function extractObjectArray(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter(isObjectRecord);
  }
  if (!isObjectRecord(value)) {
    return [];
  }

  const candidates = [
    'inventorySources',
    'audienceSources',
    'signalsSources',
    'accountSources',
    'sources',
    'items',
    'data',
  ];
  for (const key of candidates) {
    const nested = value[key];
    if (Array.isArray(nested)) {
      return nested.filter(isObjectRecord);
    }
  }

  return [];
}

function parseCsv(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  const list = value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  return list.length > 0 ? list : undefined;
}

function getSourceGroupOps(
  client: ReturnType<typeof createStorefrontClient>,
  source: SourceGroup
): {
  get: (storefrontId: string) => Promise<unknown>;
  set: (storefrontId: string, sources: unknown[]) => Promise<unknown>;
} {
  switch (source) {
    case 'inventory':
      return {
        get: (storefrontId: string) => client.storefrontAgents.getInventorySources(storefrontId),
        set: (storefrontId: string, sources: unknown[]) =>
          client.storefrontAgents.setInventorySources(storefrontId, sources),
      };
    case 'audience':
      return {
        get: (storefrontId: string) => client.storefrontAgents.getAudienceSources(storefrontId),
        set: (storefrontId: string, sources: unknown[]) =>
          client.storefrontAgents.setAudienceSources(storefrontId, sources),
      };
    case 'signals':
      return {
        get: (storefrontId: string) => client.storefrontAgents.getSignalsSources(storefrontId),
        set: (storefrontId: string, sources: unknown[]) =>
          client.storefrontAgents.setSignalsSources(storefrontId, sources),
      };
    case 'account':
      return {
        get: (storefrontId: string) => client.storefrontAgents.getAccountSources(storefrontId),
        set: (storefrontId: string, sources: unknown[]) =>
          client.storefrontAgents.setAccountSources(storefrontId, sources),
      };
  }
}

function asSourceGroup(value: string): SourceGroup {
  if (value === 'inventory' || value === 'audience' || value === 'signals' || value === 'account') {
    return value;
  }
  printError('--source must be one of: inventory, audience, signals, account');
  process.exit(1);
}

function asHostingMode(value: string): 'hosted' | 'external' {
  if (value === 'hosted' || value === 'external') {
    return value;
  }
  printError('--hosting must be one of: hosted, external');
  process.exit(1);
}

type StorefrontRole = 'sales' | 'signals' | 'crm';

function asStorefrontRole(value: string | undefined): StorefrontRole | undefined {
  if (!value) {
    return undefined;
  }
  if (value === 'sales' || value === 'signals' || value === 'crm') {
    return value;
  }
  printError('--role must be one of: sales, signals, crm');
  process.exit(1);
}

function ensureRequired(value: string | undefined, flag: string, context: string): string {
  if (!value || value.trim().length === 0) {
    printError(`${flag} is required when ${context}`);
    process.exit(1);
  }
  return value;
}

async function connectExternalAgent(
  client: ReturnType<typeof createStorefrontClient>,
  storefrontId: string,
  options: {
    source: string;
    id: string;
    name: string;
    agentUrl: string;
    agentType?: string;
    channels?: string;
    domains?: string;
    activatesOn?: string;
    overwrite?: boolean;
  }
): Promise<unknown> {
  const source = asSourceGroup(options.source);
  const ops = getSourceGroupOps(client, source);
  const currentPayload = await ops.get(storefrontId);
  const currentSources = extractObjectArray(currentPayload);

  const existingIdx = currentSources.findIndex((sourceRecord) => sourceRecord.id === options.id);
  if (existingIdx >= 0 && !options.overwrite) {
    throw new Error(
      `A ${source} source with id "${options.id}" already exists. Use --overwrite to replace it.`
    );
  }

  const connection: Record<string, unknown> = {
    id: options.id,
    name: options.name,
    execution: {
      type: 'agent',
      agentUrl: options.agentUrl,
    },
  };
  if (options.agentType) {
    connection.agentType = options.agentType;
  }

  if (source === 'inventory') {
    const channels = parseCsv(options.channels);
    if (channels) {
      connection.channels = channels;
    }
  }

  if (source === 'signals') {
    const domains = parseCsv(options.domains);
    if (!domains) {
      throw new Error('--domains is required when --source signals');
    }
    connection.domains = domains;
    const activatesOn = parseCsv(options.activatesOn);
    if (activatesOn) {
      connection.activatesOn = activatesOn;
    }
  }

  if (source === 'audience') {
    const activatesOn = parseCsv(options.activatesOn);
    if (activatesOn) {
      connection.activatesOn = activatesOn;
    }
  }

  const nextSources = [...currentSources];
  if (existingIdx >= 0) {
    nextSources[existingIdx] = connection;
  } else {
    nextSources.push(connection);
  }

  return ops.set(storefrontId, nextSources);
}

function moveSubcommandOrThrow(from: Command, to: Command, name: string): void {
  const subcommands = from.commands as Command[];
  const index = subcommands.findIndex((subcommand) => subcommand.name() === name);
  if (index < 0) {
    throw new Error(
      `Internal CLI wiring error: missing "${name}" under "${from.name()}" while building storefront commands`
    );
  }
  const [command] = subcommands.splice(index, 1);
  to.addCommand(command);
}

// ── Storefront management ────────────────────────────────────────────────────

export const storefrontsCommand = new Command('storefronts').description('Manage your storefronts');

storefrontsCommand
  .command('list')
  .description('List storefronts')
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

storefrontsCommand
  .command('get [id]')
  .description('Get storefront details')
  .action(async (id: string | undefined, _options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      formatOutput(await client.storefrontAgents.get(id), globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontsCommand
  .command('create')
  .description('Initialize storefront configuration')
  .requiredOption('--platform-name <name>', 'Display name')
  .requiredOption('--publisher-domain <domain>', 'Publisher domain (e.g. mypodcasts.com)')
  .option('--role <role>', 'Storefront role: sales, signals, or crm')
  .option('--disabled', 'Create storefront in disabled state')
  .option('--use', 'Set this storefront as your default')
  .action(async (options, cmd) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      const result = await client.storefrontAgents.create({
        platformName: options.platformName,
        publisherDomain: options.publisherDomain,
        enabled: !options.disabled,
        role: asStorefrontRole(options.role),
      });
      formatOutput(result, globalOpts.format as OutputFormat);
      if (options.use) {
        const config = loadConfig();
        config.storefrontId = SINGLETON_STOREFRONT_ID;
        saveConfig(config);
      }
      printSuccess('Storefront configured');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontsCommand
  .command('update [id]')
  .description('Update a storefront (uses selected storefront if id omitted)')
  .option('--platform-name <name>', 'New display name')
  .option('--publisher-domain <domain>', 'New publisher domain')
  .option('--role <role>', 'Storefront role: sales, signals, or crm')
  .option('--enabled', 'Enable storefront')
  .option('--disabled', 'Disable storefront')
  .action(async (id: string | undefined, options, cmd) => {
    try {
      const { globalOpts, client, storefrontId } = await getScopedContext(cmd, id);
      const data: {
        platformName?: string;
        publisherDomain?: string;
        enabled?: boolean;
        role?: StorefrontRole;
      } = {};
      if (options.platformName) data.platformName = options.platformName;
      if (options.publisherDomain) data.publisherDomain = options.publisherDomain;
      if (options.role) data.role = asStorefrontRole(options.role);
      if (options.enabled) data.enabled = true;
      if (options.disabled) data.enabled = false;
      if (Object.keys(data).length === 0) {
        printError('No update fields provided');
        process.exit(1);
      }

      formatOutput(
        await client.storefrontAgents.update(storefrontId, data),
        globalOpts.format as OutputFormat
      );
      printSuccess('Storefront updated');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontsCommand
  .command('delete [id]')
  .description('Delete a storefront (not supported by current API)')
  .action(async (id: string | undefined, _options: unknown, cmd: Command) => {
    try {
      const { client, storefrontId } = await getScopedContext(cmd, id);
      await client.storefrontAgents.delete(storefrontId);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontsCommand
  .command('use <id>')
  .description('Set default storefront ID for scoped storefront commands (must be "storefront")')
  .action(async (id: string, _options: unknown, cmd: Command) => {
    try {
      if (id !== SINGLETON_STOREFRONT_ID) {
        throw new Error(
          `Only "${SINGLETON_STOREFRONT_ID}" is supported by the current storefront API`
        );
      }
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      await client.storefrontAgents.get(id);

      const config = loadConfig();
      config.storefrontId = id;
      saveConfig(config);

      printSuccess(`Default storefront set: ${id}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontsCommand
  .command('current')
  .description('Show current default storefront selection')
  .action((_options: unknown, cmd: Command) => {
    const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
    const config = loadConfig();
    if (!config.storefrontId) {
      printError(`No default storefront configured. ${STOREFRONT_ID_HINT}`);
      process.exit(1);
    }
    formatOutput({ storefrontId: config.storefrontId }, globalOpts.format as OutputFormat);
  });

// ── Internal agents and operations ───────────────────────────────────────────

const agentsCommand = new Command('agents').description(
  'Manage internal agents (hosted and externally connected)'
);

agentsCommand
  .command('list [storefrontId]')
  .description('List internal agents (hosted and connected external agents)')
  .option('--raw', 'Include underlying source payloads')
  .action(async (storefrontId: string | undefined, options, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      const [inventory, audience, signals, accounts, hostedSales] = await Promise.allSettled([
        client.storefrontAgents.getInventorySources(resolvedId),
        client.storefrontAgents.getAudienceSources(resolvedId),
        client.storefrontAgents.getSignalsSources(resolvedId),
        client.storefrontAgents.getAccountSources(resolvedId),
        client.storefrontAgents.getHostedSalesAgent(resolvedId),
      ]);

      const inventorySources =
        inventory.status === 'fulfilled' ? extractObjectArray(inventory.value) : [];
      const audienceSources =
        audience.status === 'fulfilled' ? extractObjectArray(audience.value) : [];
      const signalsSources =
        signals.status === 'fulfilled' ? extractObjectArray(signals.value) : [];
      const accountSources =
        accounts.status === 'fulfilled' ? extractObjectArray(accounts.value) : [];

      const internalAgents: Record<string, unknown>[] = [];

      const addConnectedAgents = (sourceGroup: SourceGroup, sources: Record<string, unknown>[]) => {
        for (const source of sources) {
          const execution = source.execution;
          if (!isObjectRecord(execution)) {
            continue;
          }
          const executionType = execution.type;
          if (executionType !== 'agent') {
            continue;
          }

          const agentId =
            (typeof source.id === 'string' && source.id.length > 0 ? source.id : undefined) ??
            (typeof source.name === 'string' && source.name.length > 0 ? source.name : undefined) ??
            `${sourceGroup}-agent`;

          internalAgents.push({
            id: agentId,
            name: typeof source.name === 'string' ? source.name : agentId,
            agentType:
              typeof source.agentType === 'string'
                ? source.agentType
                : typeof source.role === 'string'
                  ? source.role
                  : sourceGroup,
            source: sourceGroup,
            hosting: 'external',
            executionType: 'agent',
            agentUrl: typeof execution.agentUrl === 'string' ? execution.agentUrl : undefined,
          });
        }
      };

      addConnectedAgents('inventory', inventorySources);
      addConnectedAgents('audience', audienceSources);
      addConnectedAgents('signals', signalsSources);
      addConnectedAgents('account', accountSources);

      if (hostedSales.status === 'fulfilled' && isObjectRecord(hostedSales.value)) {
        const hosted = hostedSales.value;
        internalAgents.push({
          id:
            (typeof hosted.id === 'string' && hosted.id.length > 0 && hosted.id) ||
            'hosted-sales-agent',
          name:
            (typeof hosted.name === 'string' && hosted.name.length > 0 && hosted.name) ||
            'Hosted Sales Agent',
          agentType: 'sales',
          source: 'hosted',
          hosting: 'hosted',
          mcpUrl: typeof hosted.mcpUrl === 'string' ? hosted.mcpUrl : undefined,
          a2aUrl: typeof hosted.a2aUrl === 'string' ? hosted.a2aUrl : undefined,
        });
      }

      const response: Record<string, unknown> = {
        storefrontId: resolvedId,
        internalAgents,
        summary: {
          total: internalAgents.length,
          hosted: internalAgents.filter((agent) => agent.hosting === 'hosted').length,
          connectedExternal: internalAgents.filter((agent) => agent.hosting === 'external').length,
        },
      };

      if (options.raw) {
        response.raw = {
          inventorySources: settledValue(inventory),
          audienceSources: settledValue(audience),
          signalsSources: settledValue(signals),
          accountSources: settledValue(accounts),
          hostedSalesAgent: settledValue(hostedSales),
        };
      }

      formatOutput(response, globalOpts.format as OutputFormat);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

agentsCommand
  .command('create [storefrontId]')
  .description('Create an internal agent (hosted or externally connected)')
  .option('--hosting <hosting>', 'Hosting mode: hosted or external', 'external')
  .option('--agent-type <type>', 'Agent type (e.g. sales, signals, creative)', 'sales')
  .option(
    '--source <source>',
    'Source type for external agents: inventory, audience, signals, or account'
  )
  .option('--id <id>', 'Agent/connection ID (external)')
  .option('--name <name>', 'Connection display name (external)')
  .option('--agent-url <url>', 'Agent endpoint URL (external)')
  .option('--channels <csv>', 'Comma-separated channels (inventory sources)')
  .option('--domains <csv>', 'Comma-separated domains (signals sources)')
  .option('--activates-on <csv>', 'Comma-separated inventory source IDs (audience sources)')
  .option('--overwrite', 'Overwrite an existing external connection with the same ID')
  .action(async (storefrontId: string | undefined, options, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      const hosting = asHostingMode(options.hosting);

      if (hosting === 'hosted') {
        const agentType = String(options.agentType || '').toLowerCase();
        if (agentType !== 'sales') {
          printError(
            `Hosted agent type "${options.agentType}" is not supported by the current API. Supported hosted type: sales`
          );
          process.exit(1);
        }
        formatOutput(
          await client.storefrontAgents.provisionHostedSalesAgent(resolvedId),
          globalOpts.format as OutputFormat
        );
        printSuccess('Hosted sales agent created');
        return;
      }

      const source = ensureRequired(options.source, '--source', '--hosting external');
      const id = ensureRequired(options.id, '--id', '--hosting external');
      const name = ensureRequired(options.name, '--name', '--hosting external');
      const agentUrl = ensureRequired(options.agentUrl, '--agent-url', '--hosting external');

      formatOutput(
        await connectExternalAgent(client, resolvedId, {
          source,
          id,
          name,
          agentUrl,
          agentType: options.agentType,
          channels: options.channels,
          domains: options.domains,
          activatesOn: options.activatesOn,
          overwrite: options.overwrite,
        }),
        globalOpts.format as OutputFormat
      );
      printSuccess(`External agent "${id}" connected via ${source} source`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

agentsCommand
  .command('connect [storefrontId]')
  .description('Connect an existing external internal agent via a source connector')
  .requiredOption(
    '--source <source>',
    'Connection source type: inventory, audience, signals, or account'
  )
  .requiredOption('--id <id>', 'Connection ID')
  .requiredOption('--name <name>', 'Connection display name')
  .requiredOption('--agent-url <url>', 'Agent endpoint URL')
  .option('--agent-type <type>', 'Agent type label (e.g. sales, signals, creative)')
  .option('--channels <csv>', 'Comma-separated channels (inventory sources)')
  .option('--domains <csv>', 'Comma-separated domains (signals sources)')
  .option('--activates-on <csv>', 'Comma-separated inventory source IDs (audience sources)')
  .option('--overwrite', 'Overwrite an existing connection with the same ID')
  .action(async (storefrontId: string | undefined, options, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await connectExternalAgent(client, resolvedId, {
          source: options.source,
          id: options.id,
          name: options.name,
          agentUrl: options.agentUrl,
          agentType: options.agentType,
          channels: options.channels,
          domains: options.domains,
          activatesOn: options.activatesOn,
          overwrite: options.overwrite,
        }),
        globalOpts.format as OutputFormat
      );
      printSuccess(`Connected external agent "${options.id}" via ${options.source} source`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

agentsCommand
  .command('disconnect [storefrontId]')
  .description('Disconnect an external internal agent from a source connector')
  .requiredOption(
    '--source <source>',
    'Connection source type: inventory, audience, signals, or account'
  )
  .requiredOption('--id <id>', 'Connection ID to remove')
  .action(async (storefrontId: string | undefined, options, cmd: Command) => {
    try {
      const source = asSourceGroup(options.source);
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      const ops = getSourceGroupOps(client, source);
      const currentPayload = await ops.get(resolvedId);
      const currentSources = extractObjectArray(currentPayload);
      const nextSources = currentSources.filter((sourceRecord) => sourceRecord.id !== options.id);

      if (nextSources.length === currentSources.length) {
        printError(`No ${source} source found with id "${options.id}"`);
        process.exit(1);
      }

      formatOutput(await ops.set(resolvedId, nextSources), globalOpts.format as OutputFormat);
      printSuccess(`Disconnected external agent "${options.id}" from ${source} source`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Product templates
agentsCommand
  .command('upload [storefrontId]')
  .description('Upload product templates from a CSV or JSON file')
  .option('--file <path>', 'Path to CSV or JSON file')
  .option('--content <string>', 'Inline file content')
  .requiredOption('--type <type>', 'File type: csv or json')
  .option('--append', 'Append to existing templates instead of replacing')
  .action(async (storefrontId: string | undefined, options, cmd) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      if (!options.file && !options.content) {
        printError('Either --file or --content is required');
        process.exit(1);
      }
      const content = options.file ? readFileSync(options.file, 'utf-8') : options.content;
      const result = await client.storefrontAgents.upload(resolvedId, {
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

agentsCommand
  .command('file-uploads [storefrontId]')
  .description('List product template file uploads')
  .option('--limit <n>', 'Maximum number of results', '20')
  .action(async (storefrontId: string | undefined, options, cmd) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await client.storefrontAgents.fileUploads(resolvedId, parseInt(options.limit, 10)),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Traces
const tracesCommand = new Command('traces').description('Manage decision traces');

tracesCommand
  .command('list [storefrontId]')
  .description('List decision traces')
  .option('--capability <cap>', 'Filter by capability')
  .option('--type <type>', 'Filter by trace type')
  .option('--min-confidence <n>', 'Minimum confidence score (0-1)')
  .option('--limit <n>', 'Maximum number of results', '20')
  .action(async (storefrontId: string | undefined, options, cmd) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await client.storefrontAgents.traces(resolvedId).list({
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
  .command('add [storefrontId]')
  .description('Add a decision trace')
  .requiredOption(
    '--trace-type <type>',
    'Trace type: recommendation, correction, outcome, policy, exception'
  )
  .requiredOption('--capability <cap>', 'Capability name (e.g. get_products)')
  .requiredOption('--decision <json>', 'Decision object as JSON')
  .option('--reasoning <text>', 'Reasoning explanation')
  .option('--valid-until <date>', 'Expiry date (ISO 8601)')
  .option('--brief-context <json>', 'Brief context as JSON')
  .action(async (storefrontId: string | undefined, options, cmd) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      const result = await client.storefrontAgents.traces(resolvedId).add({
        trace_type: options.traceType,
        capability: options.capability,
        decision: ensureObject(parseJson(options.decision, '--decision'), '--decision'),
        reasoning: options.reasoning,
        valid_until: options.validUntil,
        brief_context: options.briefContext
          ? ensureObject(parseJson(options.briefContext, '--brief-context'), '--brief-context')
          : undefined,
      });
      formatOutput(result, globalOpts.format as OutputFormat);
      printSuccess('Trace added');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

agentsCommand.addCommand(tracesCommand);

// Tasks
const tasksCommand = new Command('tasks').description('Manage HITL tasks');

tasksCommand
  .command('list [storefrontId]')
  .description('List HITL tasks')
  .option('--status <status>', 'Filter by status: pending, claimed, completed')
  .option('--capability <cap>', 'Filter by capability')
  .option('--limit <n>', 'Maximum number of results', '20')
  .action(async (storefrontId: string | undefined, options, cmd) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await client.storefrontAgents.tasks(resolvedId).list({
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
  .command('get <taskId> [storefrontId]')
  .description('Get a task by ID')
  .action(
    async (taskId: string, storefrontId: string | undefined, _options: unknown, cmd: Command) => {
      try {
        const {
          globalOpts,
          client,
          storefrontId: resolvedId,
        } = await getScopedContext(cmd, storefrontId);
        formatOutput(
          await client.storefrontAgents.tasks(resolvedId).get(taskId),
          globalOpts.format as OutputFormat
        );
      } catch (error) {
        printError(error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    }
  );

tasksCommand
  .command('claim <taskId> [storefrontId]')
  .description('Claim a pending task')
  .option('--claimed-by <name>', 'Name of the reviewer claiming the task')
  .action(async (taskId: string, storefrontId: string | undefined, options, cmd) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await client.storefrontAgents
          .tasks(resolvedId)
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
  .command('complete <taskId> [storefrontId]')
  .description('Complete a claimed task')
  .requiredOption('--result <json>', 'Result JSON (e.g. \'{"approved":true}\')')
  .option(
    '--correction <json>',
    'Correction JSON (e.g. \'{"original":{},"corrected":{},"reason":"..."}\')'
  )
  .action(async (taskId: string, storefrontId: string | undefined, options, cmd) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      const result = ensureObject(parseJson(options.result, '--result'), '--result');
      const correction = options.correction
        ? ensureObject(parseJson(options.correction, '--correction'), '--correction')
        : undefined;
      if (correction && (!('original' in correction) || !('corrected' in correction))) {
        printError('--correction must include "original" and "corrected" objects');
        process.exit(1);
      }

      formatOutput(
        await client.storefrontAgents.tasks(resolvedId).complete(taskId, {
          result,
          correction: correction as
            | {
                original: Record<string, unknown>;
                corrected: Record<string, unknown>;
                reason?: string;
              }
            | undefined,
        }),
        globalOpts.format as OutputFormat
      );
      printSuccess(`Completed task: ${taskId}`);
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

agentsCommand.addCommand(tasksCommand);

// Capabilities
const capabilitiesCommand = new Command('capabilities').description(
  'Manage automation capabilities'
);

capabilitiesCommand
  .command('get [storefrontId]')
  .description('Get capability settings')
  .action(async (storefrontId: string | undefined, _options: unknown, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await client.storefrontAgents.getCapabilities(resolvedId),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

capabilitiesCommand
  .command('set [storefrontId]')
  .description('Update capability modes')
  .requiredOption(
    '--capabilities <json>',
    'Capabilities JSON (e.g. \'{"get_products":{"mode":"automated"}}\')'
  )
  .action(async (storefrontId: string | undefined, options, cmd) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      const capabilities = ensureObject(
        parseJson(options.capabilities, '--capabilities'),
        '--capabilities'
      ) as Record<string, { mode: string }>;
      formatOutput(
        await client.storefrontAgents.setCapabilities(resolvedId, capabilities),
        globalOpts.format as OutputFormat
      );
      printSuccess('Capabilities updated');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

agentsCommand.addCommand(capabilitiesCommand);

// Notifications
agentsCommand
  .command('notifications [storefrontId]')
  .description('Configure HITL notification channels')
  .requiredOption(
    '--channels <json>',
    'Channels JSON (e.g. \'[{"type":"webhook","destination":"https://..."}]\')'
  )
  .action(async (storefrontId: string | undefined, options, cmd) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      const channels = ensureArray(parseJson(options.channels, '--channels'), '--channels') as {
        type: string;
        destination: string;
      }[];
      formatOutput(
        await client.storefrontAgents.setNotifications(resolvedId, channels),
        globalOpts.format as OutputFormat
      );
      printSuccess('Notifications configured');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// LLM provider
const llmProviderCommand = new Command('llm-provider').description('Manage LLM provider config');

llmProviderCommand
  .command('get [storefrontId]')
  .description('Get LLM provider config')
  .action(async (storefrontId: string | undefined, _options: unknown, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await client.storefrontAgents.getLlmProvider(resolvedId),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

llmProviderCommand
  .command('set [storefrontId]')
  .description('Set LLM provider')
  .requiredOption('--provider <name>', 'Provider: gemini, openai, or anthropic')
  .option('--model-id <id>', 'Model ID (e.g. gpt-4o)')
  .option('--api-key <key>', 'API key for the provider')
  .action(async (storefrontId: string | undefined, options, cmd) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await client.storefrontAgents.setLlmProvider(resolvedId, {
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

agentsCommand.addCommand(llmProviderCommand);

// Inbound filters
const inboundFiltersCommand = new Command('inbound-filters').description(
  'Manage inbound brief filters'
);

inboundFiltersCommand
  .command('get [storefrontId]')
  .description('Get inbound filters')
  .action(async (storefrontId: string | undefined, _options: unknown, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await client.storefrontAgents.getInboundFilters(resolvedId),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

inboundFiltersCommand
  .command('set [storefrontId]')
  .description('Set inbound filters')
  .requiredOption(
    '--filters <json>',
    'Filters JSON (e.g. \'[{"type":"category_block","config":{"categories":["gambling"]}}]\')'
  )
  .action(async (storefrontId: string | undefined, options, cmd) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      const filters = ensureArray(parseJson(options.filters, '--filters'), '--filters');
      formatOutput(
        await client.storefrontAgents.setInboundFilters(resolvedId, filters),
        globalOpts.format as OutputFormat
      );
      printSuccess('Inbound filters updated');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

agentsCommand.addCommand(inboundFiltersCommand);

// Source-like resources
function makeGetSetCommand(
  name: string,
  description: string,
  optionName: string,
  getFn: (id: string) => Promise<unknown>,
  setFn: (id: string, sources: unknown[]) => Promise<unknown>
): Command {
  const cmd = new Command(name).description(description);
  cmd
    .command('get [storefrontId]')
    .description(`Get ${name}`)
    .action(async (storefrontId: string | undefined, _opts: unknown, c: Command) => {
      try {
        const {
          globalOpts,
          client,
          storefrontId: resolvedId,
        } = await getScopedContext(c, storefrontId);
        formatOutput(
          await getFn.call(client.storefrontAgents, resolvedId),
          globalOpts.format as OutputFormat
        );
      } catch (error) {
        printError(error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });

  cmd
    .command('set [storefrontId]')
    .description(`Set ${name}`)
    .requiredOption(`--${optionName} <json>`, `${name} JSON array`)
    .action(async (storefrontId: string | undefined, opts: Record<string, string>, c: Command) => {
      try {
        const {
          globalOpts,
          client,
          storefrontId: resolvedId,
        } = await getScopedContext(c, storefrontId);
        const camelKey = optionName.replace(/-([a-z])/g, (_, l: string) => l.toUpperCase());
        const sources = ensureArray(
          parseJson(opts[camelKey], `--${optionName}`),
          `--${optionName}`
        );
        formatOutput(
          await setFn.call(client.storefrontAgents, resolvedId, sources),
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

agentsCommand.addCommand(
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

agentsCommand.addCommand(
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

agentsCommand.addCommand(
  makeGetSetCommand(
    'signals-sources',
    'Manage signals provider sources',
    'signals-sources',
    function (
      this: import('../../resources/storefront-agents').StorefrontAgentsResource,
      id: string
    ) {
      return this.getSignalsSources(id);
    },
    function (
      this: import('../../resources/storefront-agents').StorefrontAgentsResource,
      id: string,
      s: unknown[]
    ) {
      return this.setSignalsSources(id, s);
    }
  )
);

agentsCommand.addCommand(
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

agentsCommand.addCommand(
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

agentsCommand.addCommand(
  makeGetSetCommand(
    'proposal-templates',
    'Manage proposal templates',
    'proposal-templates',
    function (
      this: import('../../resources/storefront-agents').StorefrontAgentsResource,
      id: string
    ) {
      return this.getProposalTemplates(id);
    },
    function (
      this: import('../../resources/storefront-agents').StorefrontAgentsResource,
      id: string,
      s: unknown[]
    ) {
      return this.setProposalTemplates(id, s);
    }
  )
);

// Resale program
const resaleProgramCommand = new Command('resale-program').description(
  'Manage resale program configuration'
);

resaleProgramCommand
  .command('get [storefrontId]')
  .description('Get resale program settings')
  .action(async (storefrontId: string | undefined, _options: unknown, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await client.storefrontAgents.getResaleProgram(resolvedId),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

resaleProgramCommand
  .command('set [storefrontId]')
  .description('Set resale program settings')
  .requiredOption('--resale-program <json>', 'Resale program JSON object')
  .action(async (storefrontId: string | undefined, options, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      const resaleProgram = ensureObject(
        parseJson(options.resaleProgram, '--resale-program'),
        '--resale-program'
      );
      formatOutput(
        await client.storefrontAgents.setResaleProgram(resolvedId, resaleProgram),
        globalOpts.format as OutputFormat
      );
      printSuccess('Resale program updated');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

agentsCommand.addCommand(resaleProgramCommand);

// Billing
const billingCommand = new Command('billing').description('Manage Stripe Connect billing');

billingCommand
  .command('connect [storefrontId]')
  .description('Provision Stripe Express account and get onboarding URL')
  .action(async (storefrontId: string | undefined, _options: unknown, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await client.storefrontAgents.connectBilling(resolvedId),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

billingCommand
  .command('get [storefrontId]')
  .description('Get billing configuration')
  .action(async (storefrontId: string | undefined, _options: unknown, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await client.storefrontAgents.getBilling(resolvedId),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

billingCommand
  .command('set [storefrontId]')
  .description('Update billing configuration')
  .option('--platform-fee-percent <n>', 'Platform fee percent (0-100)')
  .option(
    '--fees <json>',
    'JSON array of fee objects (e.g. \'[{"name":"DSP fee","feePercent":5}]\')'
  )
  .option('--currency <code>', 'Three-letter currency code (e.g. USD)')
  .option('--default-net-days <days>', 'Default payout net terms in days')
  .action(async (storefrontId: string | undefined, options, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      const payload: {
        platformFeePercent?: number;
        fees?: Array<{ name: string; description?: string; feePercent: number }>;
        currency?: string;
        defaultNetDays?: number;
      } = {};

      const platformFeePercent = parseOptionalFloat(
        options.platformFeePercent,
        '--platform-fee-percent'
      );
      if (platformFeePercent !== undefined) {
        payload.platformFeePercent = platformFeePercent;
      }

      if (options.fees) {
        payload.fees = ensureArray(parseJson(options.fees, '--fees'), '--fees') as Array<{
          name: string;
          description?: string;
          feePercent: number;
        }>;
      }

      if (options.currency) {
        payload.currency = String(options.currency).toUpperCase();
      }

      const defaultNetDays = parseOptionalInt(options.defaultNetDays, '--default-net-days');
      if (defaultNetDays !== undefined) {
        payload.defaultNetDays = defaultNetDays;
      }

      if (Object.keys(payload).length === 0) {
        printError(
          'Provide at least one billing field: --platform-fee-percent, --fees, --currency, --default-net-days'
        );
        process.exit(1);
      }

      formatOutput(
        await client.storefrontAgents.updateBilling(resolvedId, payload),
        globalOpts.format as OutputFormat
      );
      printSuccess('Billing updated');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

billingCommand
  .command('status [storefrontId]')
  .description('Get Stripe account status and balance')
  .action(async (storefrontId: string | undefined, _options: unknown, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await client.storefrontAgents.getBillingStatus(resolvedId),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

billingCommand
  .command('transactions [storefrontId]')
  .description('List Stripe balance transactions')
  .option('--limit <n>', 'Maximum number of results')
  .option('--starting-after <cursor>', 'Pagination cursor from previous page')
  .action(async (storefrontId: string | undefined, options, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await client.storefrontAgents.listBillingTransactions(resolvedId, {
          limit: parseOptionalInt(options.limit, '--limit'),
          starting_after: options.startingAfter,
        }),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

billingCommand
  .command('payouts [storefrontId]')
  .description('List Stripe payouts to bank')
  .option('--limit <n>', 'Maximum number of results')
  .option('--starting-after <cursor>', 'Pagination cursor from previous page')
  .action(async (storefrontId: string | undefined, options, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await client.storefrontAgents.listBillingPayouts(resolvedId, {
          limit: parseOptionalInt(options.limit, '--limit'),
          starting_after: options.startingAfter,
        }),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

billingCommand
  .command('onboard [storefrontId]')
  .description('Get a fresh Stripe onboarding URL')
  .action(async (storefrontId: string | undefined, _options: unknown, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await client.storefrontAgents.getBillingOnboardingUrl(resolvedId),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Hosted sales agent
const hostedSalesAgentCommand = new Command('hosted-sales-agent').description(
  'Manage hosted sales agent provisioning'
);

hostedSalesAgentCommand
  .command('get [storefrontId]')
  .description('Get hosted sales agent details')
  .action(async (storefrontId: string | undefined, _options: unknown, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await client.storefrontAgents.getHostedSalesAgent(resolvedId),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

hostedSalesAgentCommand
  .command('provision [storefrontId]')
  .description('Provision hosted sales agent')
  .action(async (storefrontId: string | undefined, _options: unknown, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await client.storefrontAgents.provisionHostedSalesAgent(resolvedId),
        globalOpts.format as OutputFormat
      );
      printSuccess('Hosted sales agent provisioned');
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

agentsCommand.addCommand(hostedSalesAgentCommand);

// Testing and sessions
agentsCommand
  .command('sandbox [storefrontId]')
  .description('Provision or fetch sandbox account for testing')
  .option('--advertiser-name <name>', 'Optional advertiser name for sandbox provisioning')
  .action(async (storefrontId: string | undefined, options, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await client.storefrontAgents.provisionSandbox(resolvedId, {
          advertiser_name: options.advertiserName,
        }),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

agentsCommand
  .command('test [storefrontId]')
  .description('Run test buyer suite')
  .option('--max-briefs <n>', 'Maximum number of briefs to run')
  .option('--scenarios <json>', 'JSON array of scenario names')
  .action(async (storefrontId: string | undefined, options, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      const parsedScenarios = options.scenarios
        ? ensureArray(parseJson(options.scenarios, '--scenarios'), '--scenarios')
        : undefined;
      if (parsedScenarios && parsedScenarios.some((s) => typeof s !== 'string')) {
        printError('--scenarios must be an array of strings');
        process.exit(1);
      }
      const scenarios = parsedScenarios as string[] | undefined;
      formatOutput(
        await client.storefrontAgents.runTest(resolvedId, {
          max_briefs: parseOptionalInt(options.maxBriefs, '--max-briefs'),
          scenarios,
        }),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

const testRunsCommand = new Command('test-runs').description('Manage storefront test runs');

testRunsCommand
  .command('list [storefrontId]')
  .description('List test runs for a storefront')
  .option('--limit <n>', 'Maximum number of results')
  .action(async (storefrontId: string | undefined, options, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await client.storefrontAgents.listTestRuns(
          resolvedId,
          parseOptionalInt(options.limit, '--limit')
        ),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

testRunsCommand
  .command('get <testRunId>')
  .description('Get test run details by ID')
  .action(async (testRunId: string, _options: unknown, cmd: Command) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createStorefrontClient(globalOpts);
      formatOutput(
        await client.storefrontAgents.getTestRun(testRunId),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

agentsCommand.addCommand(testRunsCommand);

agentsCommand
  .command('sessions')
  .description('Get session tool-call thread for selected storefront')
  .requiredOption('--session-id <id>', 'Session ID to retrieve')
  .option('--storefront-id <id>', 'Storefront ID override')
  .action(async (options, cmd: Command) => {
    try {
      const overrideId = options.storefrontId as string | undefined;
      const { globalOpts, client, storefrontId } = await getScopedContext(cmd, overrideId);
      formatOutput(
        await client.storefrontAgents.getSessionThread(storefrontId, options.sessionId),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Diagnostics
agentsCommand
  .command('readiness [storefrontId]')
  .description('Get storefront readiness checklist and blockers')
  .action(async (storefrontId: string | undefined, _options: unknown, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await client.storefrontAgents.getReadiness(resolvedId),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

agentsCommand
  .command('coverage [storefrontId]')
  .description('Get capability coverage by inventory source')
  .action(async (storefrontId: string | undefined, _options: unknown, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await client.storefrontAgents.getCoverage(resolvedId),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

agentsCommand
  .command('health [storefrontId]')
  .description('Get operational health statistics')
  .action(async (storefrontId: string | undefined, _options: unknown, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await client.storefrontAgents.getHealth(resolvedId),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

agentsCommand
  .command('doctor [storefrontId]')
  .description('Run combined readiness/coverage/health/billing diagnostics')
  .action(async (storefrontId: string | undefined, _options: unknown, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      const [readiness, coverage, health] = await Promise.all([
        client.storefrontAgents.getReadiness(resolvedId),
        client.storefrontAgents.getCoverage(resolvedId),
        client.storefrontAgents.getHealth(resolvedId),
      ]);

      let billingStatus: unknown;
      let billingStatusError: string | undefined;
      try {
        billingStatus = await client.storefrontAgents.getBillingStatus(resolvedId);
      } catch (error) {
        billingStatusError =
          error instanceof Error ? error.message : 'Unknown billing status error';
      }

      formatOutput(
        {
          storefrontId: resolvedId,
          readiness,
          coverage,
          health,
          billingStatus,
          billingStatusError,
        },
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Policy
agentsCommand
  .command('synthesize-policy [storefrontId]')
  .description('Synthesize and apply a decision policy from traces')
  .option('--dry-run', 'Preview policy without applying it')
  .action(async (storefrontId: string | undefined, options, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await client.storefrontAgents.synthesizePolicy(resolvedId, !options.dryRun),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Evals
const evalsCommand = new Command('evals').description('Run and compare evaluations');

evalsCommand
  .command('run [storefrontId]')
  .description('Run evaluation briefs against selected storefront')
  .requiredOption(
    '--briefs <json>',
    'Briefs JSON array (e.g. \'[{"brief":"Looking for podcast sponsorship..."}]\')'
  )
  .action(async (storefrontId: string | undefined, options, cmd: Command) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      const briefs = ensureArray(parseJson(options.briefs, '--briefs'), '--briefs') as {
        brief: string;
      }[];
      if (briefs.some((b) => !b || typeof b !== 'object' || typeof b.brief !== 'string')) {
        printError('--briefs must be an array of objects with a string "brief" field');
        process.exit(1);
      }
      formatOutput(
        await client.storefrontAgents.evals.run(resolvedId, briefs),
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

agentsCommand.addCommand(evalsCommand);

// Audit
agentsCommand
  .command('audit [storefrontId]')
  .description('Show configuration change history')
  .option('--limit <n>', 'Maximum number of results', '50')
  .action(async (storefrontId: string | undefined, options, cmd) => {
    try {
      const {
        globalOpts,
        client,
        storefrontId: resolvedId,
      } = await getScopedContext(cmd, storefrontId);
      formatOutput(
        await client.storefrontAgents.audit(resolvedId, parseInt(options.limit, 10)),
        globalOpts.format as OutputFormat
      );
    } catch (error) {
      printError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

storefrontCommand.addCommand(storefrontsCommand);

const catalogCommand = new Command('catalog').description(
  'Manage product catalog uploads and file history'
);
const testingCommand = new Command('testing').description(
  'Run storefront tests/evals and inspect sessions'
);
const diagnosticsCommand = new Command('diagnostics').description(
  'Inspect readiness, coverage, health, and change history'
);

moveSubcommandOrThrow(agentsCommand, catalogCommand, 'upload');
moveSubcommandOrThrow(agentsCommand, catalogCommand, 'file-uploads');

moveSubcommandOrThrow(agentsCommand, testingCommand, 'sandbox');
moveSubcommandOrThrow(agentsCommand, testingCommand, 'test');
moveSubcommandOrThrow(agentsCommand, testingCommand, 'test-runs');
moveSubcommandOrThrow(agentsCommand, testingCommand, 'evals');
moveSubcommandOrThrow(agentsCommand, testingCommand, 'sessions');

moveSubcommandOrThrow(agentsCommand, diagnosticsCommand, 'readiness');
moveSubcommandOrThrow(agentsCommand, diagnosticsCommand, 'coverage');
moveSubcommandOrThrow(agentsCommand, diagnosticsCommand, 'health');
moveSubcommandOrThrow(agentsCommand, diagnosticsCommand, 'doctor');
moveSubcommandOrThrow(agentsCommand, diagnosticsCommand, 'audit');

moveSubcommandOrThrow(agentsCommand, storefrontCommand, 'resale-program');
moveSubcommandOrThrow(agentsCommand, storefrontCommand, 'hosted-sales-agent');

storefrontCommand.addCommand(billingCommand);
storefrontCommand.addCommand(catalogCommand);
storefrontCommand.addCommand(testingCommand);
storefrontCommand.addCommand(diagnosticsCommand);
storefrontCommand.addCommand(agentsCommand);

export { agentsCommand as storefrontAgentsCommand, tasksCommand as storefrontTasksCommand };
