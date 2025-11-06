---
"@scope3/agentic-client": minor
---

Add OutcomeAgent implementation with get_proposals and accept_proposal MCP tools

BREAKING CHANGE: Removed SimpleMediaAgent in favor of OutcomeAgent
- Deleted simple-media-agent files and replaced with outcome-agent implementation
- New binary: `outcome-agent` (previously `simple-media-agent`)
- New script: `npm run start:outcome-agent` to run the outcome agent server
- Implemented get-proposals handler with product filtering and budget optimization
- Implemented accept-proposal handler with validation and default acceptance
- Added comprehensive test coverage (32 tests total)
