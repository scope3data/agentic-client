# @scope3/agentic-client

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
