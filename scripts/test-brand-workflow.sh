#!/bin/bash

# Scope3 SDK v2 - Brand Workflow Test
# Tests the brand persona flow: list, create, update, delete brands
#
# Usage:
#   export SCOPE3_API_KEY=your_brand_api_key
#   ./scripts/test-brand-workflow.sh
#   ./scripts/test-brand-workflow.sh --staging

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CLI="node dist/cli/index.js --persona brand --format json"
CREATED_BRAND_ID=""
STEP=0

if [[ "${1:-}" == "--staging" ]]; then
    CLI="$CLI --environment staging"
    echo -e "${YELLOW}Using STAGING environment${NC}"
fi

step()    { STEP=$((STEP + 1)); echo -e "\n${BLUE}[$STEP]${NC} $1"; }
pass()    { echo -e "  ${GREEN}PASS${NC} $1"; }
fail()    { echo -e "  ${RED}FAIL${NC} $1"; }
warn()    { echo -e "  ${YELLOW}SKIP${NC} $1"; }
extract() { node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(eval('d.$1'));" 2>/dev/null; }

cleanup() {
    echo -e "\n${BLUE}Cleanup${NC}"
    if [ -n "$CREATED_BRAND_ID" ]; then
        $CLI brands delete "$CREATED_BRAND_ID" > /dev/null 2>&1 && \
            pass "Deleted brand $CREATED_BRAND_ID" || \
            warn "Could not delete brand $CREATED_BRAND_ID"
    fi
}
trap cleanup EXIT

if [ -z "${SCOPE3_API_KEY:-}" ]; then
    echo -e "${RED}Error: SCOPE3_API_KEY not set${NC}"
    echo "  export SCOPE3_API_KEY=your_api_key"
    exit 1
fi

echo ""
echo "=========================================="
echo "  BRAND WORKFLOW TEST (SDK v2)"
echo "=========================================="

# ── 1. List brands ──────────────────────────────────────────────────
step "List brands"
RESULT=$($CLI brands list --take 5 2>&1) && {
    pass "Listed brands"
    info=$(echo "$RESULT" | extract 'data.length')
    echo "  $info brand(s) returned"
} || {
    fail "Could not list brands"
    echo "$RESULT"
    exit 1
}

# ── 2. Create brand with manifest URL ───────────────────────────────
step "Create brand (manifest URL)"
RESULT=$($CLI brands create --manifest-url "https://example.com/brand-manifest.json" 2>&1) && {
    CREATED_BRAND_ID=$(echo "$RESULT" | extract 'data.id')
    pass "Created brand: $CREATED_BRAND_ID"
} || {
    fail "Could not create brand"
    echo "$RESULT"
    exit 1
}

# ── 3. Get brand ────────────────────────────────────────────────────
step "Get brand by ID"
RESULT=$($CLI brands get "$CREATED_BRAND_ID" 2>&1) && {
    pass "Got brand details"
} || {
    fail "Could not get brand $CREATED_BRAND_ID"
}

# ── 4. Update brand ─────────────────────────────────────────────────
step "Update brand (new manifest URL)"
RESULT=$($CLI brands update "$CREATED_BRAND_ID" --manifest-url "https://example.com/updated-manifest.json" 2>&1) && {
    pass "Updated brand"
} || {
    fail "Could not update brand"
}

# ── 5. Create brand with inline JSON ────────────────────────────────
step "Create brand (inline manifest JSON)"
MANIFEST='{"name":"Test Brand","description":"Automated test brand","industry":"Technology"}'
RESULT=$($CLI brands create --manifest-json "$MANIFEST" 2>&1) && {
    INLINE_BRAND_ID=$(echo "$RESULT" | extract 'data.id')
    pass "Created brand with inline JSON: $INLINE_BRAND_ID"
    # Clean up inline brand
    $CLI brands delete "$INLINE_BRAND_ID" > /dev/null 2>&1 && \
        pass "Cleaned up inline brand" || true
} || {
    warn "Could not create brand with inline JSON"
}

# ── Summary ─────────────────────────────────────────────────────────
echo ""
echo "=========================================="
echo "  BRAND WORKFLOW SUMMARY"
echo "=========================================="
echo ""
echo "  Brand: ${CREATED_BRAND_ID:-none}"
echo ""
echo -e "${GREEN}Brand workflow test complete.${NC}"
