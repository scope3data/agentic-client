# @scope3/agentic-client

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
