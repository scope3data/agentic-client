/**
 * OAuth utilities for the CLI login flow
 */

import * as crypto from 'crypto';
import * as http from 'http';
import { execFile } from 'child_process';

/** Generate a random state string for CSRF protection */
export function generateState(): string {
  return crypto.randomBytes(16).toString('hex');
}

/** Open a URL in the system default browser */
export function openBrowser(url: string): void {
  if (!url.startsWith('https://')) {
    throw new Error('Authorization URL must use HTTPS');
  }
  if (process.platform === 'darwin') {
    execFile('open', [url]);
  } else if (process.platform === 'win32') {
    execFile('cmd', ['/c', 'start', '', url]);
  } else {
    execFile('xdg-open', [url]);
  }
}

/** Start a local HTTP server and wait for the OAuth callback */
export function waitForCallback(port: number, expectedState: string): Promise<{ code: string }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (!req.url) {
        res.writeHead(400);
        res.end();
        return;
      }

      const url = new URL(req.url, `http://localhost:${port}`);

      if (url.pathname !== '/callback') {
        res.writeHead(404);
        res.end();
        return;
      }

      const error = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');
      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(htmlPage('Login failed', errorDescription || error));
        clearTimeout(timeout);
        server.close();
        reject(new Error(`OAuth error: ${errorDescription || error}`));
        return;
      }

      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');

      if (!code || !state) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(htmlPage('Login failed', 'Missing code or state in callback.'));
        clearTimeout(timeout);
        server.close();
        reject(new Error('Missing code or state in OAuth callback'));
        return;
      }

      if (state !== expectedState) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(htmlPage('Login failed', 'State mismatch. Please try again.'));
        clearTimeout(timeout);
        server.close();
        reject(new Error('State mismatch in OAuth callback'));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(
        htmlPage('Logged in successfully', 'You can close this tab and return to your terminal.')
      );
      clearTimeout(timeout);
      server.close();
      resolve({ code });
    });

    const timeout = setTimeout(
      () => {
        server.close();
        reject(new Error('Login timed out after 5 minutes. Please try again.'));
      },
      5 * 60 * 1000
    );

    server.on('error', (err: NodeJS.ErrnoException) => {
      clearTimeout(timeout);
      if (err.code === 'EADDRINUSE') {
        reject(new Error(`Port ${port} is already in use. Free it up and try again.`));
      } else {
        reject(err);
      }
    });

    server.listen(port, 'localhost');
  });
}

/** The fixed local port used for the OAuth callback. Must be registered in WorkOS. */
export const CALLBACK_PORT = 12345;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function htmlPage(heading: string, body: string): string {
  const icon = heading.includes('success') ? '✓' : '✗';
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Scope3 CLI</title></head>
<body style="font-family:sans-serif;max-width:400px;margin:80px auto;text-align:center;">
  <h2>${icon} ${escapeHtml(heading)}</h2>
  <p>${escapeHtml(body)}</p>
</body>
</html>`;
}
