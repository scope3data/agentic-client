import { Command } from 'commander';
import { storefrontCommand } from '../../../cli/commands/storefront';
import * as utils from '../../../cli/utils';
import * as format from '../../../cli/format';

jest.mock('../../../cli/utils');
jest.mock('../../../cli/format');

const mockCreateClient = utils.createClient as jest.MockedFunction<typeof utils.createClient>;
const mockFormatOutput = format.formatOutput as jest.MockedFunction<typeof format.formatOutput>;
const mockPrintError = format.printError as jest.MockedFunction<typeof format.printError>;
const mockPrintSuccess = format.printSuccess as jest.MockedFunction<typeof format.printSuccess>;

describe('storefront command', () => {
  let program: Command;
  let mockClient: {
    storefront: {
      get: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    agents: {
      list: jest.Mock;
      get: jest.Mock;
    };
  };
  const originalExit = process.exit;

  beforeEach(() => {
    mockClient = {
      storefront: {
        get: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      agents: {
        list: jest.fn(),
        get: jest.fn(),
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(mockClient as any);
    process.exit = jest.fn() as never;

    program = new Command();
    program.option('--api-key <key>', 'API key');
    program.option('--format <format>', 'Output format', 'table');
    program.option('--persona <persona>', 'Persona', 'storefront');
    program.addCommand(storefrontCommand);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.exit = originalExit;
  });

  describe('get', () => {
    it('should call client.storefront.get', async () => {
      mockClient.storefront.get.mockResolvedValue({
        data: { platformId: 'plat-1', name: 'Test' },
      });

      await program.parseAsync(['node', 'test', 'storefront', 'get', '--api-key', 'sk-test']);

      expect(mockClient.storefront.get).toHaveBeenCalled();
      expect(mockFormatOutput).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should call client.storefront.create with required args', async () => {
      mockClient.storefront.create.mockResolvedValue({
        data: { platformId: 'plat-1', name: 'My Store' },
      });

      await program.parseAsync([
        'node',
        'test',
        'storefront',
        'create',
        '--api-key',
        'sk-test',
        '--platform-id',
        'plat-1',
        '--name',
        'My Store',
      ]);

      expect(mockClient.storefront.create).toHaveBeenCalledWith(
        expect.objectContaining({
          platformId: 'plat-1',
          name: 'My Store',
        })
      );
      expect(mockPrintSuccess).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should call client.storefront.delete', async () => {
      mockClient.storefront.delete.mockResolvedValue(undefined);

      await program.parseAsync(['node', 'test', 'storefront', 'delete', '--api-key', 'sk-test']);

      expect(mockClient.storefront.delete).toHaveBeenCalled();
      expect(mockPrintSuccess).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should print error and exit on failure', async () => {
      mockClient.storefront.get.mockRejectedValue(new Error('Unauthorized'));

      await program.parseAsync(['node', 'test', 'storefront', 'get', '--api-key', 'sk-test']);

      expect(mockPrintError).toHaveBeenCalledWith('Unauthorized');
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('agents subcommand', () => {
    it('should call client.agents.list', async () => {
      mockClient.agents.list.mockResolvedValue({ data: [] });

      await program.parseAsync([
        'node',
        'test',
        'storefront',
        'agents',
        'list',
        '--api-key',
        'sk-test',
      ]);

      expect(mockClient.agents.list).toHaveBeenCalled();
      expect(mockFormatOutput).toHaveBeenCalled();
    });

    it('should call client.agents.get with agentId', async () => {
      mockClient.agents.get.mockResolvedValue({ data: { id: 'agent-1' } });

      await program.parseAsync([
        'node',
        'test',
        'storefront',
        'agents',
        'get',
        'agent-1',
        '--api-key',
        'sk-test',
      ]);

      expect(mockClient.agents.get).toHaveBeenCalledWith('agent-1');
    });
  });
});
