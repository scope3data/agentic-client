# @scope3/agentic-client

## 2.0.0

### Major Changes

- [#27](https://github.com/scope3data/agentic-client/pull/27) [`3ccaa7d`](https://github.com/scope3data/agentic-client/commit/3ccaa7d6799ff84034188851adb357ad3bb022ca) Thanks [@nastassiafulconis](https://github.com/nastassiafulconis)! - Generate SDK from OpenAPI specifications

  Major refactor to automatically generate TypeScript SDK from OpenAPI specs:

  **New Features:**
  - Separate `PlatformClient` and `PartnerClient` for different user types
  - Full code generation from OpenAPI YAML files (platform-api, partner-api, outcome-agent)
  - Automated schema updates from agentic-api repository with GitHub Actions
  - Custom SDK generator script that creates MCP-compatible resource classes

  **Breaking Changes:**
  - Removed manual resource files (now auto-generated)
  - Removed SimpleMediaAgent (not in use)
  - `Scope3AgenticClient` now extends `PlatformClient` (backwards compatible)

  **Infrastructure:**
  - Added `scripts/generate-sdk.ts` for SDK generation
  - Added `scripts/update-schemas.sh` for automated OpenAPI spec updates
  - GitHub workflow for daily automated type updates and PR creation
  - Updated build process to use generated types

  **Testing:**
  - All 84 tests passing
  - Verified with real API calls to production environment
  - Both PlatformClient and PartnerClient confirmed working

- [#27](https://github.com/scope3data/agentic-client/pull/27) [`3ccaa7d`](https://github.com/scope3data/agentic-client/commit/3ccaa7d6799ff84034188851adb357ad3bb022ca) Thanks [@nastassiafulconis](https://github.com/nastassiafulconis)! - BREAKING CHANGE: Remove legacy Scope3AgenticClient

  The legacy `Scope3AgenticClient` class has been completely removed. Users must now explicitly choose between:
  - `PlatformClient` - for brand advertisers/buyers managing campaigns and creatives
  - `PartnerClient` - for DSPs/publishers/partners managing media buys and products

  **Migration Guide:**

  ```typescript
  // Before:
  import { Scope3AgenticClient } from 'scope3';
  const client = new Scope3AgenticClient({ apiKey: '...' });

  // After (for brand advertisers):
  import { PlatformClient } from 'scope3';
  const client = new PlatformClient({ apiKey: '...' });

  // After (for media partners):
  import { PartnerClient } from 'scope3';
  const client = new PartnerClient({ apiKey: '...' });
  ```

  Both clients have the same configuration options and provide access to the appropriate API resources for their use case.

### Patch Changes

- [#25](https://github.com/scope3data/agentic-client/pull/25) [`976ca4a`](https://github.com/scope3data/agentic-client/commit/976ca4a16161fd037aa6c547fd8d36cd065b7630) Thanks [@nastassiafulconis](https://github.com/nastassiafulconis)! - Fix npm Trusted Publisher authentication by removing conflicting NPM_TOKEN

  The release workflow was failing because it had both OIDC Trusted Publishing configured (id-token: write) and the legacy NPM_TOKEN environment variable. This caused npm authentication to fail. Removed NPM_TOKEN to use only Trusted Publishing for secure, token-free npm publishing.

## 1.1.0

### Minor Changes

- [#18](https://github.com/scope3data/agentic-client/pull/18) [`c9e0c5b`](https://github.com/scope3data/agentic-client/commit/c9e0c5bffb22c870a7ba9a3970d721d7b03a3d16) Thanks [@nastassiafulconis](https://github.com/nastassiafulconis)! - Add dynamic CLI tool for Scope3 Agentic API with automatic command generation

  The CLI now dynamically discovers available API operations from the MCP server, ensuring commands are always up-to-date with the latest API capabilities:
  - **Zero maintenance**: Commands auto-generate from MCP server's tool list
  - **Always in sync**: CLI automatically reflects API changes without code updates
  - **80+ commands**: Covers all resources (agents, campaigns, creatives, tactics, media buys, etc.)
  - **Smart caching**: 24-hour tool cache with fallback for offline use
  - **Type-safe parameters**: Automatic validation and parsing from server schemas
  - **Multiple output formats**: JSON and formatted table views
  - **Persistent configuration**: Save API keys and base URLs locally

  Usage:

  ```bash
  # Configure once
  scope3 config set apiKey YOUR_KEY

  # Commands are dynamically discovered
  scope3 list-tools  # See all available operations
  scope3 brand-agent list
  scope3 campaign create --prompt "..." --brandAgentId 123
  scope3 media-buy execute --mediaBuyId "buy_123"
  ```

  Benefits over static CLI:
  - API adds new endpoint → CLI instantly supports it (after cache refresh)
  - API changes parameter → CLI automatically updates validation
  - No manual maintenance of command definitions required

## 1.0.4

### Patch Changes

- [#16](https://github.com/scope3data/agentic-client/pull/16) [`f901817`](https://github.com/scope3data/agentic-client/commit/f90181750d7248ee40c1350d76931fe59f7e87c5) Thanks [@nastassiafulconis](https://github.com/nastassiafulconis)! - Remove .npmrc file as we now use trusted publisher for npm publishing

## 1.0.3

### Patch Changes

- [#12](https://github.com/scope3data/agentic-client/pull/12) [`ef1a5e0`](https://github.com/scope3data/agentic-client/commit/ef1a5e08d6311b9bb7e1cdf4e8c7d9b10dcdcb75) Thanks [@nastassiafulconis](https://github.com/nastassiafulconis)! - Fix npm authentication in release workflow by manually configuring .npmrc file

## 1.0.2

### Patch Changes

- [#10](https://github.com/scope3data/agentic-client/pull/10) [`e92b6d9`](https://github.com/scope3data/agentic-client/commit/e92b6d9fd097e15444aefa68ef406a2908ef2bb5) Thanks [@nastassiafulconis](https://github.com/nastassiafulconis)! - Fix npm authentication in release workflow by manually configuring .npmrc file

## 1.0.1

### Patch Changes

- [#8](https://github.com/scope3data/agentic-client/pull/8) [`1fe1262`](https://github.com/scope3data/agentic-client/commit/1fe1262a41090672fbab9267ab5d60a21c4b4b7e) Thanks [@nastassiafulconis](https://github.com/nastassiafulconis)! - Update OpenAPI auto-update workflow to create PRs and fetch from agentic-api repo. Configure release workflow for npm Trusted Publishing with OIDC.

## 1.0.0

### Major Changes

- [#6](https://github.com/scope3data/agentic-client/pull/6) [`186144c`](https://github.com/scope3data/agentic-client/commit/186144cf4c3cc2647d852f320ed1ce4cda0311c7) Thanks [@nastassiafulconis](https://github.com/nastassiafulconis)! - Add unified agents API and remove salesAgents

  BREAKING CHANGE: Removed `salesAgents` resource. Use `agents` resource instead with type filtering.
  - Add unified agents resource supporting both SALES and OUTCOME agent types
  - Remove deprecated salesAgents resource
  - Add JWT authentication support
  - Update simple-media-agent to use new agents API
  - Update documentation to use 'Agent' instead of 'Sales Agent'
  - Add publishConfig for npm publishing
  - Update schemas from merged outcomes-agent-registration branch

  Migration guide:
  - Replace `client.salesAgents.list()` with `client.agents.list({ type: 'SALES' })`
  - Replace `client.salesAgents.get()` with `client.agents.get()`
  - Replace `client.salesAgents.register()` with `client.agents.register({ type: 'SALES', ... })`

## 0.2.0

### Minor Changes

- [#1](https://github.com/scope3data/agentic-client/pull/1) [`5feeb69`](https://github.com/scope3data/agentic-client/commit/5feeb694f904e51249804a2f460650d6a6377b21) Thanks [@bokelley](https://github.com/bokelley)! - Initial release of Scope3 Agentic Client
  - Full TypeScript client for Scope3 Agentic API using MCP protocol
  - Complete API coverage for all 12 resource modules (Assets, Brand Agents, Campaigns, Creatives, etc.)
  - Official MCP SDK integration with HTTP streaming transport
  - Comprehensive type safety with auto-generated types from OpenAPI spec
  - Optional webhook server for AdCP events
  - Pre-commit hooks and CI validation
  - Automated versioning and NPM publishing with Changesets

### Patch Changes

- [#5](https://github.com/scope3data/agentic-client/pull/5) [`afb58ee`](https://github.com/scope3data/agentic-client/commit/afb58eea821ea96c5dd2ef0ff119eca895b24d9a) Thanks [@nastassiafulconis](https://github.com/nastassiafulconis)! - Fix changeset check workflow to exempt release PRs

  Release PRs created by changesets/action are now properly exempted from the changeset requirement check, preventing false failures in CI.
