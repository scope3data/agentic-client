/**
 * CLI utility functions
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Scope3Client } from '../client';
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
  };
}

/**
 * Create a Scope3Client from CLI options
 */
export function createClient(options: GlobalOptions): Scope3Client {
  const config = loadConfig();

  // Resolve API key (CLI flag > config > env var)
  const apiKey = options.apiKey || config.apiKey || process.env.SCOPE3_API_KEY;

  if (!apiKey) {
    throw new Error(
      'API key required. Set via:\n' +
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
