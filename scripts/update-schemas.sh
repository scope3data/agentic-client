#!/bin/bash
set -e

# Base URL for the OpenAPI specs
BASE_URL="https://raw.githubusercontent.com/scope3data/agentic-api/main/mintlify"

# Set up curl with authentication if GITHUB_TOKEN is available
if [ -n "$GITHUB_TOKEN" ]; then
  AUTH_HEADER=(-H "Authorization: token $GITHUB_TOKEN")
else
  AUTH_HEADER=()
fi

echo "Downloading OpenAPI schemas..."

# Download outcome-agent-openapi.yaml
echo "Fetching outcome-agent-openapi.yaml..."
curl -f "${AUTH_HEADER[@]}" -o outcome-agent-openapi.yaml "$BASE_URL/outcome-agent-openapi.yaml"

# Download partner-api.yaml
echo "Fetching partner-api.yaml..."
curl -f "${AUTH_HEADER[@]}" -o partner-api.yaml "$BASE_URL/partner-api.yaml"

# Download platform-api.yaml
echo "Fetching platform-api.yaml..."
curl -f "${AUTH_HEADER[@]}" -o platform-api.yaml "$BASE_URL/platform-api.yaml"

echo "Generating TypeScript types and SDK..."

# Generate types
npm run generate-outcome-agent-types
npm run generate-partner-api-types
npm run generate-platform-api-types

# Generate SDK from types
npm run generate-sdk

echo "✅ Schemas updated, types generated, and SDK regenerated successfully!"
