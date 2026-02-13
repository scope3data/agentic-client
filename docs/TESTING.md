# Testing the Scope3 SDK

## Unit Tests

Run the test suite:

```bash
npm test
```

This runs 225 unit tests covering:
- Client initialization
- REST and MCP adapters
- All resource classes
- CLI utilities and formatting
- Webhook server

## Manual CLI Testing

Build and test the CLI:

```bash
npm run build
export SCOPE3_API_KEY=your_api_key

# Test buyer persona (default)
./dist/cli/index.js advertisers list
./dist/cli/index.js campaigns list
./dist/cli/index.js bundles create --advertiser-id <id> --channels display

# Test brand persona
./dist/cli/index.js --persona brand brands list

# Test config
./dist/cli/index.js config set apiKey your_key
./dist/cli/index.js config set environment staging
./dist/cli/index.js config get
```

## Workflow Test Scripts

Comprehensive workflow tests against real APIs:

```bash
# Setup
npm run build
export SCOPE3_API_KEY=your_api_key

# CLI workflow tests
npm run test:buyer     # Buyer persona: advertisers, bundles, campaigns
npm run test:brand     # Brand persona: CRUD with manifests
npm run test:partner   # Partner persona: health check

# TypeScript SDK test
npm run test:sdk

# Run all
npm run test:all
```

### Using Staging

```bash
# Via environment
export SCOPE3_ENVIRONMENT=staging
./scripts/test-buyer-workflow.sh

# Or via CLI flag
./scripts/test-buyer-workflow.sh --staging
```

## What the Tests Verify

### Buyer Workflow (`test-buyer-workflow.sh`)
- Advertiser CRUD
- Bundle creation and product discovery
- Campaign creation and lifecycle
- Brand linking

### Brand Workflow (`test-brand-workflow.sh`)
- Brand creation with manifest URL
- Brand creation with inline JSON manifest
- Brand update and delete

### Partner Workflow (`test-partner-workflow.sh`)
- Health check endpoint
- Config management
- Skill.md fetching

### SDK Workflow (`test-sdk-workflow.ts`)
- All three personas programmatically
- Error handling
- Response parsing

## Cleanup

The test scripts auto-clean resources on exit. If interrupted, check your dashboard for leftover test advertisers/brands.
