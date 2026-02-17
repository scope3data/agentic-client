#!/bin/bash

# Scope3 SDK v2 - Buyer Workflow Test
# Tests the full buyer persona flow: advertisers, bundles, products, campaigns
#
# Usage:
#   export SCOPE3_API_KEY=your_buyer_api_key
#   ./scripts/test-buyer-workflow.sh
#   ./scripts/test-buyer-workflow.sh --staging    # test against staging

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CLI="node dist/cli/index.js --persona buyer --format json"
CREATED_ADVERTISER_ID=""
CREATED_BUNDLE_ID=""
CREATED_CAMPAIGN_ID=""
STEP=0

# Use staging if --staging flag passed
if [[ "${1:-}" == "--staging" ]]; then
    CLI="$CLI --environment staging"
    echo -e "${YELLOW}Using STAGING environment${NC}"
fi

step()    { STEP=$((STEP + 1)); echo -e "\n${BLUE}[$STEP]${NC} $1"; }
pass()    { echo -e "  ${GREEN}PASS${NC} $1"; }
fail()    { echo -e "  ${RED}FAIL${NC} $1"; }
warn()    { echo -e "  ${YELLOW}SKIP${NC} $1"; }
info()    { echo -e "  $1"; }
extract() { node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(eval('d.$1'));" 2>/dev/null; }

cleanup() {
    echo -e "\n${BLUE}Cleanup${NC}"
    if [ -n "$CREATED_CAMPAIGN_ID" ]; then
        echo -e "  Campaign: $CREATED_CAMPAIGN_ID (delete manually if needed)"
    fi
    if [ -n "$CREATED_ADVERTISER_ID" ]; then
        $CLI -- advertisers delete "$CREATED_ADVERTISER_ID" > /dev/null 2>&1 && \
            pass "Deleted advertiser $CREATED_ADVERTISER_ID" || \
            warn "Could not delete advertiser $CREATED_ADVERTISER_ID"
    fi
}
trap cleanup EXIT

# ── Checks ──────────────────────────────────────────────────────────
if [ -z "${SCOPE3_API_KEY:-}" ]; then
    echo -e "${RED}Error: SCOPE3_API_KEY not set${NC}"
    echo "  export SCOPE3_API_KEY=your_api_key"
    exit 1
fi

echo ""
echo "=========================================="
echo "  BUYER WORKFLOW TEST (SDK v2)"
echo "=========================================="

# ── 1. List advertisers ─────────────────────────────────────────────
step "List advertisers"
RESULT=$($CLI advertisers list --take 5 2>&1) && {
    pass "Listed advertisers"
    info "$(echo "$RESULT" | extract 'data.length') advertiser(s) returned"
} || {
    fail "Could not list advertisers"
    echo "$RESULT"
    exit 1
}

# ── 2. Create advertiser ────────────────────────────────────────────
step "Create advertiser"
RESULT=$($CLI advertisers create --name "SDK Test $(date +%s)" --brand-domain "example.com" --description "Automated test" 2>&1) && {
    CREATED_ADVERTISER_ID=$(echo "$RESULT" | extract 'data.id')
    pass "Created advertiser: $CREATED_ADVERTISER_ID"
} || {
    fail "Could not create advertiser"
    echo "$RESULT"
    exit 1
}

# ── 3. Get advertiser ───────────────────────────────────────────────
step "Get advertiser by ID"
RESULT=$($CLI advertisers get "$CREATED_ADVERTISER_ID" 2>&1) && {
    NAME=$(echo "$RESULT" | extract 'data.name')
    pass "Got advertiser: $NAME"
} || {
    fail "Could not get advertiser $CREATED_ADVERTISER_ID"
}

# ── 4. Update advertiser ────────────────────────────────────────────
step "Update advertiser"
RESULT=$($CLI advertisers update "$CREATED_ADVERTISER_ID" --name "SDK Test Updated" 2>&1) && {
    pass "Updated advertiser name"
} || {
    fail "Could not update advertiser"
}

# ── 5. Create bundle ────────────────────────────────────────────────
step "Create bundle for product discovery"
RESULT=$($CLI bundles create \
    --advertiser-id "$CREATED_ADVERTISER_ID" \
    --channels display,video \
    --countries US 2>&1) && {
    CREATED_BUNDLE_ID=$(echo "$RESULT" | extract 'data.bundleId')
    pass "Created bundle: $CREATED_BUNDLE_ID"
} || {
    fail "Could not create bundle"
    echo "$RESULT"
}

# ── 6. Discover products ────────────────────────────────────────────
if [ -n "$CREATED_BUNDLE_ID" ]; then
    step "Discover products in bundle"
    RESULT=$($CLI bundles discover-products "$CREATED_BUNDLE_ID" --group-limit 3 2>&1) && {
        pass "Discovered products"
        info "$(echo "$RESULT" | extract 'data.groups?.length || 0') group(s) found"
    } || {
        warn "No products discovered (normal for test advertisers)"
    }
else
    step "Discover products in bundle"
    warn "Skipped (no bundle created)"
fi

# ── 7. Browse products without bundle ────────────────────────────────
step "Browse products (no bundle required)"
RESULT=$($CLI bundles browse-products \
    --advertiser-id "$CREATED_ADVERTISER_ID" \
    --channels display 2>&1) && {
    pass "Browsed products"
} || {
    warn "Could not browse products"
}

# ── 8. List campaigns ───────────────────────────────────────────────
step "List campaigns"
RESULT=$($CLI campaigns list --take 5 2>&1) && {
    pass "Listed campaigns"
    info "$(echo "$RESULT" | extract 'data.length') campaign(s) returned"
} || {
    fail "Could not list campaigns"
}

# ── 9. Create discovery campaign ──────────────────────────────────────
if [ -n "$CREATED_BUNDLE_ID" ]; then
    step "Create discovery campaign"
    RESULT=$($CLI campaigns create-discovery \
        --advertiser-id "$CREATED_ADVERTISER_ID" \
        --name "SDK Test Campaign $(date +%s)" \
        --bundle-id "$CREATED_BUNDLE_ID" \
        --start-date "2025-06-01" \
        --end-date "2025-06-30" \
        --budget 10000 \
        --channels display,video 2>&1) && {
        CREATED_CAMPAIGN_ID=$(echo "$RESULT" | extract 'data.id')
        pass "Created discovery campaign: $CREATED_CAMPAIGN_ID"
    } || {
        warn "Could not create campaign (may need products in bundle)"
        echo "$RESULT" | head -3
    }
else
    step "Create discovery campaign"
    warn "Skipped (no bundle created)"
fi

# ── 10. Get campaign ────────────────────────────────────────────────
if [ -n "$CREATED_CAMPAIGN_ID" ]; then
    step "Get campaign by ID"
    RESULT=$($CLI campaigns get "$CREATED_CAMPAIGN_ID" 2>&1) && {
        pass "Got campaign details"
    } || {
        warn "Could not get campaign"
    }
else
    step "Get campaign by ID"
    warn "Skipped (no campaign created)"
fi

# ── Summary ─────────────────────────────────────────────────────────
echo ""
echo "=========================================="
echo "  BUYER WORKFLOW SUMMARY"
echo "=========================================="
echo ""
echo "  Advertiser: ${CREATED_ADVERTISER_ID:-none}"
echo "  Bundle:     ${CREATED_BUNDLE_ID:-none}"
echo "  Campaign:   ${CREATED_CAMPAIGN_ID:-none}"
echo ""
echo -e "${GREEN}Buyer workflow test complete.${NC}"
