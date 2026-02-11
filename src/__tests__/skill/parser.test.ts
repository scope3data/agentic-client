/**
 * Tests for skill.md parser
 */

import { parseSkillMd } from '../../skill/parser';

describe('parseSkillMd', () => {
  const sampleSkillMd = `\`\`\`yaml
name: scope3-agentic
version: 2.0.0
description: Scope3 Agentic API
api_base: https://api.agentic.scope3.com/api/v2
\`\`\`

## Overview

The API for programmatic advertising.

## Advertisers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /advertisers | List all advertisers |
| POST | /advertisers | Create a new advertiser |
| GET | /advertisers/{id} | Get advertiser by ID |

## MCP Tools

| Tool | Operations |
|------|------------|
| \`manage_advertiser\` | create, get, update, list, delete |

### Example

\`\`\`bash
curl https://api.example.com/advertisers
\`\`\`
`;

  describe('header parsing', () => {
    it('should parse name from yaml header', () => {
      const result = parseSkillMd(sampleSkillMd);
      expect(result.name).toBe('scope3-agentic');
    });

    it('should parse version from yaml header', () => {
      const result = parseSkillMd(sampleSkillMd);
      expect(result.version).toBe('2.0.0');
    });

    it('should parse description from yaml header', () => {
      const result = parseSkillMd(sampleSkillMd);
      expect(result.description).toBe('Scope3 Agentic API');
    });

    it('should parse api_base from yaml header', () => {
      const result = parseSkillMd(sampleSkillMd);
      expect(result.apiBase).toBe('https://api.agentic.scope3.com/api/v2');
    });
  });

  describe('command parsing', () => {
    it('should parse REST commands from tables', () => {
      const result = parseSkillMd(sampleSkillMd);
      const restCommands = result.commands.filter((c) => c.method);
      expect(restCommands.length).toBeGreaterThan(0);
    });

    it('should extract method from command', () => {
      const result = parseSkillMd(sampleSkillMd);
      const listCommand = result.commands.find(
        (c) => c.path === '/advertisers' && c.method === 'GET'
      );
      expect(listCommand).toBeDefined();
      expect(listCommand?.description).toBe('List all advertisers');
    });

    it('should parse MCP tools', () => {
      const result = parseSkillMd(sampleSkillMd);
      const mcpCommands = result.commands.filter((c) => c.mcpTool);
      expect(mcpCommands.length).toBeGreaterThan(0);
    });

    it('should extract parameters from endpoint path', () => {
      const result = parseSkillMd(sampleSkillMd);
      const getCommand = result.commands.find((c) => c.path === '/advertisers/{id}');
      expect(getCommand).toBeDefined();
      expect(getCommand?.parameters).toContainEqual(
        expect.objectContaining({ name: 'id', required: true })
      );
    });
  });

  describe('example parsing', () => {
    it('should parse code examples', () => {
      const result = parseSkillMd(sampleSkillMd);
      expect(result.examples.length).toBeGreaterThan(0);
    });

    it('should extract language from code block', () => {
      const result = parseSkillMd(sampleSkillMd);
      const bashExample = result.examples.find((e) => e.language === 'bash');
      expect(bashExample).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty content', () => {
      const result = parseSkillMd('');
      expect(result.name).toBe('');
      expect(result.commands).toEqual([]);
    });

    it('should handle content without yaml header', () => {
      const result = parseSkillMd('# Just a heading\n\nSome text');
      expect(result.name).toBe('');
    });

    it('should handle content without tables', () => {
      const result = parseSkillMd('```yaml\nname: test\n```\n\nNo tables here');
      expect(result.name).toBe('test');
      expect(result.commands).toEqual([]);
    });
  });
});
