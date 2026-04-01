/**
 * Tests for OAuth utility functions
 */

import * as http from 'http';
import { execFile } from 'child_process';
import { generateState, openBrowser, waitForCallback } from '../../cli/oauth';

jest.mock('child_process', () => ({
  execFile: jest.fn(),
}));

const mockedExecFile = execFile as unknown as jest.Mock;

describe('generateState', () => {
  it('returns a non-empty hex string', () => {
    const state = generateState();
    expect(state).toMatch(/^[0-9a-f]+$/);
  });

  it('returns 32 hex characters (16 bytes)', () => {
    expect(generateState()).toHaveLength(32);
  });

  it('returns unique values', () => {
    expect(generateState()).not.toBe(generateState());
  });
});

describe('openBrowser', () => {
  beforeEach(() => {
    mockedExecFile.mockReset();
  });

  it('throws on non-HTTPS URLs', () => {
    expect(() => openBrowser('http://example.com')).toThrow('Authorization URL must use HTTPS');
    expect(mockedExecFile).not.toHaveBeenCalled();
  });

  it('calls "open" on macOS', () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'darwin' });

    openBrowser('https://example.com/auth');

    expect(mockedExecFile).toHaveBeenCalledWith(
      'open',
      ['https://example.com/auth'],
      expect.any(Function)
    );

    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });

  it('calls "cmd /c start" on Windows', () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'win32' });

    openBrowser('https://example.com/auth');

    expect(mockedExecFile).toHaveBeenCalledWith(
      'cmd',
      ['/c', 'start', '', 'https://example.com/auth'],
      expect.any(Function)
    );

    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });

  it('calls "xdg-open" on Linux', () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'linux' });

    openBrowser('https://example.com/auth');

    expect(mockedExecFile).toHaveBeenCalledWith(
      'xdg-open',
      ['https://example.com/auth'],
      expect.any(Function)
    );

    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });

  it('logs warning when exec fails', () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    mockedExecFile.mockImplementation(
      (_cmd: string, _args: string[], cb: (err: Error | null) => void) => {
        cb(new Error('spawn failed'));
      }
    );

    openBrowser('https://example.com/auth');

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Could not open browser'));

    consoleSpy.mockRestore();
    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });
});

describe('waitForCallback', () => {
  const TEST_STATE = 'abc123state';

  function makeRequest(port: number, path: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const req = http.get(`http://localhost:${port}${path}`, (res) => {
        res.resume();
        resolve(res.statusCode ?? 0);
      });
      req.on('error', reject);
    });
  }

  it('resolves with authorization code on valid callback', async () => {
    const port = 19100 + Math.floor(Math.random() * 100);
    const promise = waitForCallback(port, TEST_STATE);

    await new Promise((r) => setTimeout(r, 50));

    const statusCode = await makeRequest(port, `/callback?code=authcode123&state=${TEST_STATE}`);

    const result = await promise;
    expect(result).toEqual({ code: 'authcode123' });
    expect(statusCode).toBe(200);
  });

  it('rejects on state mismatch', async () => {
    const port = 19200 + Math.floor(Math.random() * 100);
    const promise = waitForCallback(port, TEST_STATE);

    await new Promise((r) => setTimeout(r, 50));
    // Fire request but don't await — the server rejects the promise
    makeRequest(port, '/callback?code=authcode123&state=wrong_state').catch(() => {});

    await expect(promise).rejects.toThrow('State mismatch in OAuth callback');
  });

  it('rejects when error parameter is present', async () => {
    const port = 19300 + Math.floor(Math.random() * 100);
    const promise = waitForCallback(port, TEST_STATE);

    await new Promise((r) => setTimeout(r, 50));
    makeRequest(port, '/callback?error=access_denied&error_description=User+denied+access').catch(
      () => {}
    );

    await expect(promise).rejects.toThrow('OAuth error: User denied access');
  });

  it('rejects when code is missing', async () => {
    const port = 19400 + Math.floor(Math.random() * 100);
    const promise = waitForCallback(port, TEST_STATE);

    await new Promise((r) => setTimeout(r, 50));
    makeRequest(port, `/callback?state=${TEST_STATE}`).catch(() => {});

    await expect(promise).rejects.toThrow('Missing code or state in OAuth callback');
  });

  it('returns 404 for non-callback paths', async () => {
    const port = 19600 + Math.floor(Math.random() * 100);
    const promise = waitForCallback(port, TEST_STATE);

    await new Promise((r) => setTimeout(r, 50));

    const statusCode = await makeRequest(port, '/other-path');
    expect(statusCode).toBe(404);

    // Clean up: send valid callback so server shuts down
    await makeRequest(port, `/callback?code=cleanup&state=${TEST_STATE}`);
    await promise;
  });

  it('rejects with EADDRINUSE when port is occupied', async () => {
    const port = 19800 + Math.floor(Math.random() * 100);

    const blocker = http.createServer();
    await new Promise<void>((resolve) => blocker.listen(port, 'localhost', resolve));

    try {
      const promise = waitForCallback(port, TEST_STATE);
      await expect(promise).rejects.toThrow(`Port ${port} is already in use`);
    } finally {
      await new Promise<void>((resolve) => blocker.close(() => resolve()));
    }
  });
});
