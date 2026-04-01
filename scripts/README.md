# Scope3 SDK v2 - Test Scripts

Manual workflow tests for the Scope3 SDK. Each script exercises real API calls against production or staging.

## Setup

```bash
npm run build                          # build the SDK + CLI first
export SCOPE3_API_KEY=your_api_key     # get from agentic.scope3.com -> Manage API Keys
```

## Scripts

| Script | Persona | What it tests |
|--------|---------|---------------|
| `test-buyer-workflow.sh` | buyer | Advertisers, bundles, product discovery, campaigns |
| `test-storefront-workflow.sh` | storefront | Health check, config, skill.md |
| `test-sdk-workflow.ts` | both | Full TypeScript SDK test (not CLI) |

## Usage

```bash
# CLI workflow tests (bash)
./scripts/test-buyer-workflow.sh
./scripts/test-storefront-workflow.sh

# Use staging
./scripts/test-buyer-workflow.sh --staging

# TypeScript SDK test (all personas)
npx ts-node scripts/test-sdk-workflow.ts
npx ts-node scripts/test-sdk-workflow.ts --staging

# Or via npm scripts
npm run test:buyer
npm run test:storefront
npm run test:sdk
npm run test:all                       # runs both
```

## Cleanup

The buyer script auto-cleans test resources on exit. If a script is interrupted, check your dashboard for leftover test advertisers.
