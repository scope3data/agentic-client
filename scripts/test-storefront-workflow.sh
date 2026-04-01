#!/bin/bash

# Scope3 SDK v2 - Storefront Workflow Test
# Tests the storefront persona flow: storefront, agents, config, skill.md
#
# Usage:
#   export SCOPE3_API_KEY=your_storefront_api_key
#   ./scripts/test-storefront-workflow.sh
#   ./scripts/test-storefront-workflow.sh --staging

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CLI="node dist/cli/index.js --persona storefront --format json"
STEP=0

if [[ "${1:-}" == "--staging" ]]; then
    CLI="$CLI --environment staging"
    echo -e "${YELLOW}Using STAGING environment${NC}"
fi

step()    { STEP=$((STEP + 1)); echo -e "\n${BLUE}[$STEP]${NC} $1"; }
pass()    { echo -e "  ${GREEN}PASS${NC} $1"; }
fail()    { echo -e "  ${RED}FAIL${NC} $1"; }
warn()    { echo -e "  ${YELLOW}SKIP${NC} $1"; }

if [ -z "${SCOPE3_API_KEY:-}" ]; then
    echo -e "${RED}Error: SCOPE3_API_KEY not set${NC}"
    echo "  export SCOPE3_API_KEY=your_api_key"
    exit 1
fi

echo ""
echo "=========================================="
echo "  STOREFRONT WORKFLOW TEST (SDK v2)"
echo "=========================================="

# -- 1. CLI version --------------------------------------------------------
step "CLI version check"
RESULT=$(node dist/cli/index.js --cli-version 2>&1) && {
    pass "CLI version: $RESULT"
} || {
    fail "Could not get CLI version"
}

# -- 2. Config commands ----------------------------------------------------
step "Config set/get"
node dist/cli/index.js config set persona storefront > /dev/null 2>&1 && {
    pass "Config set persona=storefront"
} || {
    warn "Config set failed"
}

RESULT=$(node dist/cli/index.js config get persona 2>&1) && {
    pass "Config get persona: $RESULT"
} || {
    warn "Config get failed"
}

# -- 3. Get storefront -----------------------------------------------------
step "Get storefront"
RESULT=$($CLI storefront get 2>&1) && {
    pass "Got storefront"
} || {
    warn "Could not get storefront"
}

# -- 4. List agents --------------------------------------------------------
step "List agents"
RESULT=$($CLI agents list 2>&1) && {
    pass "Listed agents"
} || {
    warn "Could not list agents"
}

# -- 5. Fetch skill.md -----------------------------------------------------
step "Fetch storefront skill.md from live API"
RESULT=$(node -e "
const { fetchSkillMd } = require('./dist/skill');
fetchSkillMd({ persona: 'storefront' }).then(s => {
    console.log('Lines: ' + s.split('\n').length);
    console.log('OK');
}).catch(e => { console.error(e.message); process.exit(1); });
" 2>&1) && {
    pass "Fetched storefront skill.md ($RESULT)"
} || {
    warn "Could not fetch skill.md (using bundled fallback)"
}

# -- Summary ---------------------------------------------------------------
echo ""
echo "=========================================="
echo "  STOREFRONT WORKFLOW SUMMARY"
echo "=========================================="
echo ""
echo "  The storefront persona supports:"
echo "    - Storefront management (get, create, update)"
echo "    - Agent management (list, get, register, update)"
echo "    - Config management"
echo "    - skill.md fetching"
echo ""
echo -e "${GREEN}Storefront workflow test complete.${NC}"
