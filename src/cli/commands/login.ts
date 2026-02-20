/**
 * Login and logout commands
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { generateState, openBrowser, waitForCallback, CALLBACK_PORT } from '../oauth';
import { loadConfig, saveConfig, resolveBaseUrl } from '../utils';

const PROVIDERS = ['google', 'github', 'microsoft'] as const;
type Provider = (typeof PROVIDERS)[number];

export const loginCommand = new Command('login')
  .description('Log in to Scope3 via browser OAuth')
  .option(
    '--provider <provider>',
    `OAuth provider: ${PROVIDERS.join(', ')} (default: google)`,
    'google'
  )
  .option('--environment <env>', 'Environment: production or staging')
  .option('--base-url <url>', 'Custom API base URL')
  .action(async (options) => {
    const provider = options.provider as Provider;

    if (!PROVIDERS.includes(provider)) {
      console.error(
        chalk.red(`Invalid provider: ${provider}. Must be one of: ${PROVIDERS.join(', ')}`)
      );
      process.exit(1);
    }

    const baseUrl = resolveBaseUrl({
      environment: options.environment,
      baseUrl: options.baseUrl,
    });

    const state = generateState();
    const redirectUri = `http://localhost:${CALLBACK_PORT}/callback`;
    const authUrlParams = new URLSearchParams({ provider, redirect_uri: redirectUri, state });

    let authorizationUrl: string;
    try {
      const response = await fetch(`${baseUrl}/auth/url?${authUrlParams}`);
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`${response.status}: ${body}`);
      }
      const data = (await response.json()) as { authorizationUrl: string };
      authorizationUrl = data.authorizationUrl;
    } catch (error) {
      console.error(
        chalk.red(
          `Failed to get authorization URL: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      );
      process.exit(1);
    }

    console.log(chalk.cyan('\nOpening browser for login...'));
    console.log(chalk.gray(`If the browser does not open, visit:\n  ${authorizationUrl}\n`));

    try {
      openBrowser(authorizationUrl);
    } catch (error) {
      console.error(chalk.red(error instanceof Error ? error.message : 'Failed to open browser'));
      process.exit(1);
    }

    let code: string;
    try {
      const result = await waitForCallback(CALLBACK_PORT, state);
      code = result.code;
    } catch (error) {
      console.error(chalk.red(error instanceof Error ? error.message : 'Login failed'));
      process.exit(1);
    }

    let serviceToken: string;
    try {
      const response = await fetch(`${baseUrl}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`${response.status}: ${body}`);
      }
      const data = (await response.json()) as Record<string, unknown>;
      const token = data.service_token || data.access_token;
      if (!token || typeof token !== 'string' || token.trim() === '') {
        throw new Error(`No token in response. Got keys: ${Object.keys(data).join(', ')}`);
      }
      serviceToken = token;
    } catch (error) {
      console.error(
        chalk.red(
          `Token exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      );
      process.exit(1);
    }

    const config = loadConfig();
    saveConfig({
      ...config,
      oauthAccessToken: serviceToken,
      tokenExpiry: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    });

    console.log(chalk.green('Logged in successfully.'));
    console.log(chalk.gray('Try: scope3 advertisers list'));
  });

export const logoutCommand = new Command('logout')
  .description('Log out and clear saved credentials')
  .action(() => {
    const config = loadConfig();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { oauthAccessToken, tokenExpiry, ...rest } = config;
    saveConfig(rest);
    console.log(chalk.green('Logged out.'));
  });
