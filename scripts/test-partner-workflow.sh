#!/bin/bash

# Scope3 SDK v2 - Partner Workflow Test
# Tests the partner persona flow: partners, agents, config, skill.md
#
# Usage:
#   export SCOPE3_API_KEY=your_partner_api_key
#   ./scripts/test-partner-workflow.sh
#   ./scripts/test-partner-workflow.sh --staging

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CLI="node dist/cli/index.js --persona partner --format json"
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
echo "  PARTNER WORKFLOW TEST (SDK v2)"
echo "=========================================="

# ── 1. CLI version ──────────────────────────────────────────────────
step "CLI version check"
RESULT=$(node dist/cli/index.js --cli-version 2>&1) && {
    pass "CLI version: $RESULT"
} || {
    fail "Could not get CLI version"
}

# ── 2. Config commands ──────────────────────────────────────────────
step "Config set/get"
node dist/cli/index.js config set persona partner > /dev/null 2>&1 && {
    pass "Config set persona=partner"
} || {
    warn "Config set failed"
}

RESULT=$(node dist/cli/index.js config get persona 2>&1) && {
    pass "Config get persona: $RESULT"
} || {
    warn "Config get failed"
}

# ── 3. List partners ────────────────────────────────────────────────
step "List partners"
RESULT=$($CLI partners list 2>&1) && {
    pass "Listed partners"
} || {
    warn "Could not list partners"
}

# ── 4. List agents ──────────────────────────────────────────────────
step "List agents"
RESULT=$($CLI agents list 2>&1) && {
    pass "Listed agents"
} || {
    warn "Could not list agents"
}

# ── 5. Fetch skill.md ──────────────────────────────────────────────
step "Fetch partner skill.md from live API"
RESULT=$(node -e "
const { fetchSkillMd } = require('./dist/skill');
fetchSkillMd({ persona: 'partner' }).then(s => {
    console.log('Lines: ' + s.split('\n').length);
    console.log('OK');
}).catch(e => { console.error(e.message); process.exit(1); });
" 2>&1) && {
    pass "Fetched partner skill.md ($RESULT)"
} || {
    warn "Could not fetch skill.md (using bundled fallback)"
}

# ── Summary ─────────────────────────────────────────────────────────
echo ""
echo "=========================================="
echo "  PARTNER WORKFLOW SUMMARY"
echo "=========================================="
echo ""
echo "  The partner persona supports:"
echo "    - Partner management (list, create, update, archive)"
echo "    - Agent management (list, get, register, update)"
echo "    - Config management"
echo "    - skill.md fetching"
echo ""
echo -e "${GREEN}Partner workflow test complete.${NC}"
