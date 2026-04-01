import { Command } from 'commander';
import { configCommand } from '../../../cli/commands/config';
import * as utils from '../../../cli/utils';

jest.mock('../../../cli/utils');

const mockLoadConfig = utils.loadConfig as jest.MockedFunction<typeof utils.loadConfig>;
const mockSaveConfig = utils.saveConfig as jest.MockedFunction<typeof utils.saveConfig>;
const mockClearConfig = utils.clearConfig as jest.MockedFunction<typeof utils.clearConfig>;
const mockGetConfigForDisplay = utils.getConfigForDisplay as jest.MockedFunction<
  typeof utils.getConfigForDisplay
>;

describe('config command', () => {
  let consoleOutput: string[];
  let consoleErrors: string[];
  let program: Command;
  const originalExit = process.exit;

  beforeEach(() => {
    consoleOutput = [];
    consoleErrors = [];
    jest.spyOn(console, 'log').mockImplementation((...args) => consoleOutput.push(args.join(' ')));
    jest
      .spyOn(console, 'error')
      .mockImplementation((...args) => consoleErrors.push(args.join(' ')));
    process.exit = jest.fn() as never;

    program = new Command();
    program.addCommand(configCommand);
    program.exitOverride();

    mockLoadConfig.mockReturnValue({});
    mockGetConfigForDisplay.mockReturnValue({});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.exit = originalExit;
  });

  describe('set', () => {
    it('should set persona value', async () => {
      await program.parseAsync(['node', 'test', 'config', 'set', 'persona', 'buyer']);

      expect(mockSaveConfig).toHaveBeenCalledWith(expect.objectContaining({ persona: 'buyer' }));
    });

    it('should set apiKey value', async () => {
      await program.parseAsync(['node', 'test', 'config', 'set', 'apiKey', 'sk-test-123']);

      expect(mockSaveConfig).toHaveBeenCalledWith(
        expect.objectContaining({ apiKey: 'sk-test-123' })
      );
    });

    it('should reject invalid persona', async () => {
      await program.parseAsync(['node', 'test', 'config', 'set', 'persona', 'admin']);

      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should reject invalid environment', async () => {
      await program.parseAsync(['node', 'test', 'config', 'set', 'environment', 'dev']);

      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should reject invalid config key', async () => {
      await program.parseAsync(['node', 'test', 'config', 'set', 'badKey', 'value']);

      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('get', () => {
    it('should show a specific key value', async () => {
      mockLoadConfig.mockReturnValue({ persona: 'buyer' });
      mockGetConfigForDisplay.mockReturnValue({ persona: 'buyer' });

      await program.parseAsync(['node', 'test', 'config', 'get', 'persona']);

      expect(consoleOutput.join('\n')).toContain('buyer');
    });

    it('should show "Not set" for missing key', async () => {
      mockLoadConfig.mockReturnValue({});
      mockGetConfigForDisplay.mockReturnValue({});

      await program.parseAsync(['node', 'test', 'config', 'get', 'persona']);

      expect(consoleOutput.join('\n')).toContain('Not set');
    });

    it('should list all config when no key specified', async () => {
      mockLoadConfig.mockReturnValue({ persona: 'buyer', environment: 'production' });
      mockGetConfigForDisplay.mockReturnValue({ persona: 'buyer', environment: 'production' });

      await program.parseAsync(['node', 'test', 'config', 'get']);

      const output = consoleOutput.join('\n');
      expect(output).toContain('Current configuration');
    });
  });

  describe('clear', () => {
    it('should call clearConfig', async () => {
      await program.parseAsync(['node', 'test', 'config', 'clear']);

      expect(mockClearConfig).toHaveBeenCalled();
      expect(consoleOutput.join('\n')).toContain('cleared');
    });
  });
});
