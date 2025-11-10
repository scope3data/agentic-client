---
"scope3": major
---

Generate SDK from OpenAPI specifications

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
