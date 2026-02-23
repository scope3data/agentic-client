/**
 * CLI utility functions
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Scope3Client } from '../client';
import { getDefaultBaseUrl } from '../adapters/base';
import type { Scope3ClientConfig, ApiVersion, Environment, Persona } from '../types';

/**
 * CLI configuration
 */
export interface CliConfig {
  apiKey?: string;
  version?: ApiVersion;
  environment?: Environment;
  baseUrl?: string;
  persona?: Persona;
  storefrontId?: string;
  oauthAccessToken?: string;
  /** Unix timestamp (seconds) when oauthAccessToken expires */
  tokenExpiry?: number;
}

/**
 * Global CLI options from commander
 */
export interface GlobalOptions {
  apiKey?: string;
  apiVersion?: string;
  environment?: string;
  baseUrl?: string;
  format?: string;
  debug?: boolean;
  persona?: string;
  storefrontId?: string;
}

// Config file paths
const CONFIG_DIR = path.join(os.homedir(), '.scope3');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

/**
 * Load CLI configuration from file
 */
export function loadConfig(): CliConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(content) as CliConfig;
    }
  } catch (error) {
    // Ignore errors, return empty config
  }
  return {};
}

/**
 * Save CLI configuration to file
 */
export function saveConfig(config: CliConfig): void {
  // Create directory if it doesn't exist
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }

  // Write config file with restricted permissions
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
}

/**
 * Clear CLI configuration
 */
export function clearConfig(): void {
  if (fs.existsSync(CONFIG_FILE)) {
    fs.unlinkSync(CONFIG_FILE);
  }
}

/**
 * Get config value for display (redact sensitive values)
 */
export function getConfigForDisplay(config: CliConfig): Record<string, string | undefined> {
  return {
    apiKey: config.apiKey ? `${config.apiKey.slice(0, 8)}...${config.apiKey.slice(-4)}` : undefined,
    version: config.version,
    environment: config.environment,
    baseUrl: config.baseUrl,
    persona: config.persona,
    storefrontId: config.storefrontId,
    oauthToken: config.oauthAccessToken ? '<saved>' : undefined,
    tokenExpiry: config.tokenExpiry ? new Date(config.tokenExpiry * 1000).toISOString() : undefined,
  };
}

/**
 * Resolve the API base URL from options and config, without a client.
 * Used by auth flows that need to call the API before a client is available.
 */
export function resolveBaseUrl(options?: { environment?: string; baseUrl?: string }): string {
  const config = loadConfig();
  if (options?.baseUrl) return options.baseUrl.replace(/\/$/, '');
  if (config.baseUrl) return config.baseUrl.replace(/\/$/, '');
  const environment = options?.environment || config.environment || 'production';
  return getDefaultBaseUrl(environment === 'staging' ? 'staging' : 'production');
}

/**
 * Create a Scope3Client from CLI options
 */
export function createClient(options: GlobalOptions): Scope3Client {
  const config = loadConfig();

  // Explicit overrides (CLI flag or env var) always win
  const explicitKey = options.apiKey || process.env.SCOPE3_API_KEY;
  let apiKey: string | undefined;

  if (explicitKey) {
    apiKey = explicitKey;
  } else if (config.apiKey && config.oauthAccessToken) {
    throw new Error(
      'Both an API key and an OAuth session are configured.\n' +
        '  - Run "scope3 logout" to remove the OAuth session, or\n' +
        '  - Run "scope3 config clear" to start fresh'
    );
  } else {
    apiKey = config.oauthAccessToken || config.apiKey;
  }

  if (!apiKey) {
    throw new Error(
      'Not authenticated. Log in via:\n' +
        '  - Browser login: scope3 login\n' +
        '  - CLI flag: --api-key <key>\n' +
        '  - Config: scope3 config set apiKey <key>\n' +
        '  - Environment: SCOPE3_API_KEY=<key>'
    );
  }

  // Resolve persona (CLI flag > config > default 'buyer')
  const persona = (options.persona || config.persona || 'buyer') as Persona;

  // Resolve other options
  const version = (options.apiVersion || config.version || 'v2') as ApiVersion;
  const environment = (options.environment || config.environment || 'production') as Environment;
  const baseUrl = options.baseUrl || config.baseUrl;

  const clientConfig: Scope3ClientConfig = {
    apiKey,
    persona,
    version,
    environment,
    debug: options.debug,
  };

  if (baseUrl) {
    clientConfig.baseUrl = baseUrl;
  }

  return new Scope3Client(clientConfig);
}

/**
 * Parse a JSON string into an object
 * Returns the original string if parsing fails
 */
export function parseJsonArg<T>(value: string): T | string {
  try {
    return JSON.parse(value) as T;
  } catch {
    return value;
  }
}
