/**
 * Types for skill.md parsing and representation
 */

import type { ApiVersion, Persona } from '../types';

/**
 * Parsed skill.md structure
 */
export interface ParsedSkill {
  /** Skill name (e.g., 'scope3-agentic-buyer') */
  name: string;
  /** Skill version (e.g., '2.0.0') */
  version: string;
  /** Skill description */
  description: string;
  /** API base URL */
  apiBase: string;
  /** Persona this skill belongs to */
  persona?: Persona;
  /** Available commands */
  commands: SkillCommand[];
  /** Usage examples */
  examples: SkillExample[];
}

/**
 * A command available in the skill
 */
export interface SkillCommand {
  /** Command name (e.g., 'advertisers list') */
  name: string;
  /** HTTP method for REST */
  method?: string;
  /** Endpoint path */
  path?: string;
  /** MCP tool name */
  mcpTool?: string;
  /** Command description */
  description: string;
  /** Command parameters */
  parameters: SkillParameter[];
}

/**
 * A parameter for a command
 */
export interface SkillParameter {
  /** Parameter name */
  name: string;
  /** Parameter type (string, number, boolean, object, array) */
  type: string;
  /** Whether the parameter is required */
  required: boolean;
  /** Parameter description */
  description: string;
  /** Default value if any */
  defaultValue?: string;
}

/**
 * A usage example
 */
export interface SkillExample {
  /** Example title/description */
  title: string;
  /** Code language (bash, typescript, json) */
  language: string;
  /** Example code */
  code: string;
}

/**
 * Options for fetching skill.md
 */
export interface FetchSkillOptions {
  /** API version to fetch */
  version?: ApiVersion;
  /** Persona to fetch skill.md for */
  persona?: Persona;
  /** Base URL to fetch from */
  baseUrl?: string;
  /** Fetch timeout in ms */
  timeout?: number;
}
