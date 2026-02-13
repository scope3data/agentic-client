/**
 * CLI output formatting utilities
 */

import chalk from 'chalk';
import Table from 'cli-table3';

export type OutputFormat = 'json' | 'table' | 'yaml';

/**
 * Format and print output based on format type
 */
export function formatOutput(data: unknown, format: OutputFormat = 'table'): void {
  if (format === 'json') {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (format === 'yaml') {
    console.log(toYaml(data));
    return;
  }

  // Table format (default)
  printTable(data);
}

/**
 * Check if a value looks like an API response with data array
 * Supports: { data: [...], meta?: { pagination } } or { data: [...], pagination }
 */
function isDataArrayResponse(data: unknown): data is {
  data: unknown[];
  meta?: { pagination?: { total: number; take: number; skip: number; hasMore: boolean } };
  pagination?: { total: number; take: number; skip: number; hasMore: boolean };
} {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj = data as Record<string, unknown>;
  return 'data' in obj && Array.isArray(obj.data);
}

/**
 * Check if a value looks like an API response with nested data object containing an array
 * Supports: { data: { campaigns: [...], total }, meta } or { data: { items: [...] } }
 */
function isNestedDataResponse(data: unknown): {
  items: unknown[];
  total?: number;
} | null {
  if (typeof data !== 'object' || data === null) {
    return null;
  }
  const obj = data as Record<string, unknown>;
  if (!('data' in obj) || typeof obj.data !== 'object' || obj.data === null) {
    return null;
  }

  const dataObj = obj.data as Record<string, unknown>;

  // Look for common array property names
  const arrayKeys = ['campaigns', 'items', 'bundles', 'products', 'brands', 'advertisers'];
  for (const key of arrayKeys) {
    if (key in dataObj && Array.isArray(dataObj[key])) {
      return {
        items: dataObj[key] as unknown[],
        total: typeof dataObj.total === 'number' ? dataObj.total : undefined,
      };
    }
  }

  return null;
}

/**
 * Check if a value looks like a legacy paginated response
 */
function isLegacyPaginatedResponse(data: unknown): data is { items: unknown[]; total?: number } {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj = data as Record<string, unknown>;
  return 'items' in obj && Array.isArray(obj.items);
}

/**
 * Print data as a table
 */
function printTable(data: unknown): void {
  // Handle null/undefined
  if (data === null || data === undefined) {
    console.log(chalk.gray('No data'));
    return;
  }

  // Handle arrays (list of items)
  if (Array.isArray(data)) {
    if (data.length === 0) {
      console.log(chalk.gray('No items'));
      return;
    }
    printArrayTable(data);
    return;
  }

  // Handle API responses with data array { data: [...], meta?: { pagination } }
  if (isDataArrayResponse(data)) {
    if (data.data.length === 0) {
      console.log(chalk.gray('No items'));
      return;
    }
    printArrayTable(data.data);
    // Check for pagination in meta.pagination or directly in pagination
    const pag = data.meta?.pagination ?? data.pagination;
    if (pag && typeof pag.total === 'number') {
      console.log(chalk.gray(`\nShowing ${data.data.length} of ${pag.total} items`));
    }
    return;
  }

  // Handle nested data responses { data: { campaigns: [...], total } }
  const nested = isNestedDataResponse(data);
  if (nested) {
    if (nested.items.length === 0) {
      console.log(chalk.gray('No items'));
      return;
    }
    printArrayTable(nested.items);
    if (typeof nested.total === 'number') {
      console.log(chalk.gray(`\nShowing ${nested.items.length} of ${nested.total} items`));
    }
    return;
  }

  // Handle legacy paginated responses { items: [...], total }
  if (isLegacyPaginatedResponse(data)) {
    if (data.items.length === 0) {
      console.log(chalk.gray('No items'));
      return;
    }
    printArrayTable(data.items);
    if (typeof data.total === 'number') {
      console.log(chalk.gray(`\nShowing ${data.items.length} of ${data.total} items`));
    }
    return;
  }

  // Handle single object
  if (typeof data === 'object') {
    printObjectTable(data as Record<string, unknown>);
    return;
  }

  // Handle primitives
  console.log(String(data));
}

/**
 * Print an array of objects as a table
 */
function printArrayTable(items: unknown[]): void {
  if (items.length === 0) return;

  // Get keys from first item
  const firstItem = items[0];
  if (typeof firstItem !== 'object' || firstItem === null) {
    items.forEach((item) => console.log(String(item)));
    return;
  }

  const keys = Object.keys(firstItem as Record<string, unknown>);

  // Select columns: priority keys first, then remaining, max 6 total
  const priorityKeys = ['id', 'name', 'status', 'type', 'createdAt', 'updatedAt'];
  const displayKeys = [
    ...priorityKeys.filter((k) => keys.includes(k)),
    ...keys.filter((k) => !priorityKeys.includes(k)),
  ].slice(0, 6);

  const table = new Table({
    head: displayKeys.map((k) => chalk.cyan(k)),
    wordWrap: true,
    wrapOnWordBoundary: false,
  });

  for (const item of items) {
    const row = displayKeys.map((key) => {
      const value = (item as Record<string, unknown>)[key];
      return formatValue(value);
    });
    table.push(row);
  }

  console.log(table.toString());
}

/**
 * Print a single object as a vertical table
 */
function printObjectTable(obj: Record<string, unknown>): void {
  const table = new Table();

  for (const [key, value] of Object.entries(obj)) {
    table.push({
      [chalk.cyan(key)]: formatValue(value),
    });
  }

  console.log(table.toString());
}

/**
 * Format a value for display in a table
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return chalk.gray('-');
  }

  if (typeof value === 'boolean') {
    return value ? chalk.green('true') : chalk.red('false');
  }

  if (typeof value === 'number') {
    return chalk.yellow(String(value));
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return chalk.gray('[]');
    if (value.length <= 3 && value.every((v) => typeof v !== 'object')) {
      return value.join(', ');
    }
    return chalk.gray(`[${value.length} items]`);
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>);
    if (keys.length <= 2) {
      return JSON.stringify(value);
    }
    return chalk.gray(`{${keys.length} fields}`);
  }

  // Truncate long strings
  const str = String(value);
  if (str.length > 50) {
    return str.slice(0, 47) + '...';
  }

  return str;
}

/**
 * Convert data to YAML-like format
 */
function toYaml(data: unknown, indent = 0): string {
  const prefix = '  '.repeat(indent);

  if (data === null || data === undefined) {
    return `${prefix}null`;
  }

  if (typeof data === 'boolean' || typeof data === 'number') {
    return `${prefix}${data}`;
  }

  if (typeof data === 'string') {
    if (data.includes('\n')) {
      return `${prefix}|\n${data
        .split('\n')
        .map((line) => `${prefix}  ${line}`)
        .join('\n')}`;
    }
    return `${prefix}${data}`;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return `${prefix}[]`;
    return data.map((item) => `${prefix}- ${toYaml(item, indent + 1).trim()}`).join('\n');
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data as Record<string, unknown>);
    if (entries.length === 0) return `${prefix}{}`;
    return entries
      .map(([key, value]) => `${prefix}${key}: ${toYaml(value, indent + 1).trim()}`)
      .join('\n');
  }

  return `${prefix}${String(data)}`;
}

/**
 * Print an error message
 */
export function printError(message: string): void {
  console.error(chalk.red(`Error: ${message}`));
}

/**
 * Print a success message
 */
export function printSuccess(message: string): void {
  console.log(chalk.green(message));
}

/**
 * Print a warning message
 */
export function printWarning(message: string): void {
  console.log(chalk.yellow(`Warning: ${message}`));
}
