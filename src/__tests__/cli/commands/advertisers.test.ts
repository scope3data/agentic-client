import { Command } from 'commander';
import { advertisersCommand } from '../../../cli/commands/advertisers';
import * as utils from '../../../cli/utils';
import * as format from '../../../cli/format';

jest.mock('../../../cli/utils');
jest.mock('../../../cli/format');

const mockCreateClient = utils.createClient as jest.MockedFunction<typeof utils.createClient>;
const mockFormatOutput = format.formatOutput as jest.MockedFunction<typeof format.formatOutput>;
const mockPrintError = format.printError as jest.MockedFunction<typeof format.printError>;

describe('advertisers command', () => {
  let program: Command;
  let mockClient: {
    advertisers: {
      list: jest.Mock;
      get: jest.Mock;
      create: jest.Mock;
      delete: jest.Mock;
    };
  };
  const originalExit = process.exit;

  beforeEach(() => {
    mockClient = {
      advertisers: {
        list: jest.fn(),
        get: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(mockClient as any);
    process.exit = jest.fn() as never;

    program = new Command();
    program.option('--api-key <key>', 'API key');
    program.option('--format <format>', 'Output format', 'table');
    program.option('--persona <persona>', 'Persona', 'buyer');
    program.addCommand(advertisersCommand);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.exit = originalExit;
  });

  describe('list', () => {
    it('should call client.advertisers.list with default params', async () => {
      mockClient.advertisers.list.mockResolvedValue({ data: [] });

      await program.parseAsync(['node', 'test', 'advertisers', 'list', '--api-key', 'sk-test']);

      expect(mockClient.advertisers.list).toHaveBeenCalledWith(
        expect.objectContaining({ take: 50, skip: 0 })
      );
      expect(mockFormatOutput).toHaveBeenCalled();
    });

    it('should pass custom take/skip options', async () => {
      mockClient.advertisers.list.mockResolvedValue({ data: [] });

      await program.parseAsync([
        'node',
        'test',
        'advertisers',
        'list',
        '--api-key',
        'sk-test',
        '--take',
        '10',
        '--skip',
        '20',
      ]);

      expect(mockClient.advertisers.list).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10, skip: 20 })
      );
    });
  });

  describe('get', () => {
    it('should call client.advertisers.get with id', async () => {
      mockClient.advertisers.get.mockResolvedValue({ data: { id: 'adv-1' } });

      await program.parseAsync([
        'node',
        'test',
        'advertisers',
        'get',
        'adv-1',
        '--api-key',
        'sk-test',
      ]);

      expect(mockClient.advertisers.get).toHaveBeenCalledWith('adv-1');
      expect(mockFormatOutput).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should print error and exit on failure', async () => {
      mockClient.advertisers.list.mockRejectedValue(new Error('Network error'));

      await program.parseAsync(['node', 'test', 'advertisers', 'list', '--api-key', 'sk-test']);

      expect(mockPrintError).toHaveBeenCalledWith('Network error');
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should handle non-Error throws', async () => {
      mockClient.advertisers.get.mockRejectedValue('string error');

      await program.parseAsync([
        'node',
        'test',
        'advertisers',
        'get',
        'adv-1',
        '--api-key',
        'sk-test',
      ]);

      expect(mockPrintError).toHaveBeenCalledWith('Unknown error');
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('delete', () => {
    it('should call client.advertisers.delete with id', async () => {
      mockClient.advertisers.delete.mockResolvedValue(undefined);

      await program.parseAsync([
        'node',
        'test',
        'advertisers',
        'delete',
        'adv-1',
        '--api-key',
        'sk-test',
      ]);

      expect(mockClient.advertisers.delete).toHaveBeenCalledWith('adv-1');
    });
  });
});
