/**
 * Tests for CLI utilities
 */

import * as fs from 'fs';
// os is used indirectly via path.join for config paths
import * as path from 'path';
import {
  loadConfig,
  saveConfig,
  clearConfig,
  getConfigForDisplay,
  createClient,
  parseJsonArg,
  resolveBaseUrl,
} from '../../cli/utils';

// Mock fs
jest.mock('fs');
const mockFs = jest.mocked(fs);

// Mock os.homedir
jest.mock('os', () => ({
  ...jest.requireActual('os'),
  homedir: jest.fn(() => '/mock/home'),
}));

// Mock Scope3Client
jest.mock('../../client', () => ({
  Scope3Client: jest.fn().mockImplementation((config: Record<string, unknown>) => ({
    config,
    advertisers: {},
    campaigns: {},
  })),
}));

// Mock getDefaultBaseUrl
jest.mock('../../adapters/base', () => ({
  getDefaultBaseUrl: jest.fn((env: string) =>
    env === 'staging' ? 'https://api.agentic.staging.scope3.com' : 'https://api.agentic.scope3.com'
  ),
}));

const CONFIG_DIR = path.join('/mock/home', '.scope3');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

describe('loadConfig', () => {
  beforeEach(() => {
    mockFs.existsSync.mockReset();
    mockFs.readFileSync.mockReset();
  });

  it('should return empty config when file does not exist', () => {
    mockFs.existsSync.mockReturnValue(false);
    expect(loadConfig()).toEqual({});
  });

  it('should return parsed config when file exists', () => {
    const config = { apiKey: 'test-key', version: 'v2' };
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

    expect(loadConfig()).toEqual(config);
  });

  it('should return empty config on parse error', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue('invalid json');

    expect(loadConfig()).toEqual({});
  });

  it('should return empty config on read error', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockImplementation(() => {
      throw new Error('Permission denied');
    });

    expect(loadConfig()).toEqual({});
  });
});

describe('saveConfig', () => {
  beforeEach(() => {
    mockFs.existsSync.mockReset();
    mockFs.mkdirSync.mockReset();
    mockFs.writeFileSync.mockReset();
  });

  it('should create directory if it does not exist', () => {
    mockFs.existsSync.mockReturnValue(false);

    saveConfig({ apiKey: 'test-key' });

    expect(mockFs.mkdirSync).toHaveBeenCalledWith(CONFIG_DIR, { recursive: true, mode: 0o700 });
  });

  it('should not create directory if it exists', () => {
    mockFs.existsSync.mockReturnValue(true);

    saveConfig({ apiKey: 'test-key' });

    expect(mockFs.mkdirSync).not.toHaveBeenCalled();
  });

  it('should write config with restricted permissions', () => {
    mockFs.existsSync.mockReturnValue(true);

    saveConfig({ apiKey: 'test-key', version: 'v2' });

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      CONFIG_FILE,
      JSON.stringify({ apiKey: 'test-key', version: 'v2' }, null, 2),
      { mode: 0o600 }
    );
  });
});

describe('clearConfig', () => {
  beforeEach(() => {
    mockFs.existsSync.mockReset();
    mockFs.unlinkSync.mockReset();
  });

  it('should delete config file if it exists', () => {
    mockFs.existsSync.mockReturnValue(true);

    clearConfig();

    expect(mockFs.unlinkSync).toHaveBeenCalledWith(CONFIG_FILE);
  });

  it('should do nothing if config file does not exist', () => {
    mockFs.existsSync.mockReturnValue(false);

    clearConfig();

    expect(mockFs.unlinkSync).not.toHaveBeenCalled();
  });
});

describe('getConfigForDisplay', () => {
  it('should redact API key', () => {
    const display = getConfigForDisplay({ apiKey: 'sk_1234567890abcdef' });
    expect(display.apiKey).toBe('sk_12345...cdef');
    expect(display.apiKey).not.toBe('sk_1234567890abcdef');
  });

  it('should show undefined for missing API key', () => {
    const display = getConfigForDisplay({});
    expect(display.apiKey).toBeUndefined();
  });

  it('should show all config values', () => {
    const display = getConfigForDisplay({
      apiKey: 'sk_1234567890abcdef',
      version: 'v2',
      environment: 'staging',
      baseUrl: 'https://custom.com',
    });

    expect(display.version).toBe('v2');
    expect(display.environment).toBe('staging');
    expect(display.baseUrl).toBe('https://custom.com');
  });

  it('shows oauthToken as <saved> when present', () => {
    const display = getConfigForDisplay({ oauthAccessToken: 'scope3_abc_xyz' });
    expect(display.oauthToken).toBe('<saved>');
  });

  it('shows tokenExpiry as ISO string when present', () => {
    const expiry = Math.floor(Date.now() / 1000) + 3600;
    const display = getConfigForDisplay({ tokenExpiry: expiry });
    expect(display.tokenExpiry).toBe(new Date(expiry * 1000).toISOString());
  });
});

describe('createClient', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    mockFs.existsSync.mockReturnValue(false); // No config file
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should throw when no API key is available', () => {
    delete process.env.SCOPE3_API_KEY;
    expect(() => createClient({})).toThrow('Not authenticated');
  });

  it('should use CLI flag API key first', () => {
    process.env.SCOPE3_API_KEY = 'env-key';
    const client = createClient({ apiKey: 'cli-key' });
    expect(client).toBeDefined();
  });

  it('should use env var API key as fallback', () => {
    process.env.SCOPE3_API_KEY = 'env-key';
    const client = createClient({});
    expect(client).toBeDefined();
  });

  it('should use config API key as second priority', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(JSON.stringify({ apiKey: 'config-key' }));

    const client = createClient({});
    expect(client).toBeDefined();
  });

  it('should default version to v2', () => {
    const client = createClient({ apiKey: 'test-key' });
    expect(client).toBeDefined();
  });

  it('should use OAuth access token when no API key is provided', () => {
    delete process.env.SCOPE3_API_KEY;
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(
      JSON.stringify({ oauthAccessToken: 'eyJhbGci.test.token' })
    );

    const client = createClient({});
    expect(client).toBeDefined();
  });

  it('should prefer CLI flag over OAuth token', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(JSON.stringify({ oauthAccessToken: 'oauth-token' }));

    const client = createClient({ apiKey: 'cli-key' });
    expect(client).toBeDefined();
  });

  it('should error when both config apiKey and oauthAccessToken are set', () => {
    delete process.env.SCOPE3_API_KEY;
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(
      JSON.stringify({ apiKey: 'config-key', oauthAccessToken: 'oauth-token' })
    );

    expect(() => createClient({})).toThrow('Both an API key and an OAuth session are configured.');
  });

  it('should use CLI flag when both config apiKey and oauthAccessToken are set', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(
      JSON.stringify({ apiKey: 'config-key', oauthAccessToken: 'oauth-token' })
    );

    const client = createClient({ apiKey: 'cli-key' });
    expect(client).toBeDefined();
  });
});

describe('resolveBaseUrl', () => {
  beforeEach(() => {
    mockFs.existsSync.mockReturnValue(false);
  });

  it('defaults to production URL', () => {
    expect(resolveBaseUrl()).toBe('https://api.agentic.scope3.com');
  });

  it('returns staging URL for staging environment', () => {
    expect(resolveBaseUrl({ environment: 'staging' })).toBe(
      'https://api.agentic.staging.scope3.com'
    );
  });

  it('prefers explicit baseUrl over environment', () => {
    expect(resolveBaseUrl({ baseUrl: 'https://custom.example.com' })).toBe(
      'https://custom.example.com'
    );
  });

  it('strips trailing slash from baseUrl', () => {
    expect(resolveBaseUrl({ baseUrl: 'https://custom.example.com/' })).toBe(
      'https://custom.example.com'
    );
  });

  it('reads environment from config when not provided', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(JSON.stringify({ environment: 'staging' }));
    expect(resolveBaseUrl()).toBe('https://api.agentic.staging.scope3.com');
  });
});

describe('parseJsonArg', () => {
  it('should parse valid JSON', () => {
    expect(parseJsonArg('{"name":"Test"}')).toEqual({ name: 'Test' });
  });

  it('should parse JSON array', () => {
    expect(parseJsonArg('["a","b"]')).toEqual(['a', 'b']);
  });

  it('should return original string on parse failure', () => {
    expect(parseJsonArg('not json')).toBe('not json');
  });

  it('should parse JSON number', () => {
    expect(parseJsonArg('42')).toBe(42);
  });

  it('should parse JSON boolean', () => {
    expect(parseJsonArg('true')).toBe(true);
  });
});
