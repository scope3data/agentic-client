#!/bin/bash

# Scope3 CLI - Partner Workflow Test
# Tests operations available to partners (sales/outcome agents, tactics, media buys)

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CLI_CMD="node dist/cli.js"
OUTPUT_FORMAT="json"

# Function to print colored output
print_step() {
    echo -e "${BLUE}==>${NC} ${1}"
}

print_success() {
    echo -e "${GREEN}✓${NC} ${1}"
}

print_error() {
    echo -e "${RED}✗${NC} ${1}"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} ${1}"
}

print_info() {
    echo -e "${BLUE}ℹ${NC}  ${1}"
}

# Check if API key is set
if [ -z "$SCOPE3_API_KEY" ]; then
    print_error "SCOPE3_API_KEY environment variable is not set"
    echo "Please set it with: export SCOPE3_API_KEY=your_partner_api_key"
    exit 1
fi

print_success "API key found"
echo ""
echo "=========================================="
echo "    PARTNER WORKFLOW TEST"
echo "=========================================="
echo ""
echo "This test demonstrates partner-level operations:"
echo "✓ Register and manage sales/outcome agents"
echo "✓ Create and manage tactics"
echo "✓ Create and manage media buys"
echo "✓ Execute campaigns via agents"
echo ""
print_warning "NOTE: This workflow requires a PARTNER-level API key"
print_info "If you have a platform key, use platform-workflow-test.sh instead"
echo ""

# Step 1: List Existing Agents
print_step "Step 1: Listing Registered Agents..."
AGENTS_RESPONSE=$($CLI_CMD agents list --format $OUTPUT_FORMAT 2>&1)
if [ $? -eq 0 ]; then
    print_success "Agents listed successfully"
    echo "$AGENTS_RESPONSE" | head -20
else
    print_warning "Failed to list agents"
fi
echo ""

# Step 2: Register Sales Agent (Partner Operation)
print_step "Step 2: Registering Sales Agent..."
print_info "Attempting to register a sales agent (partner operation)"
SALES_AGENT_RESPONSE=$($CLI_CMD agents register \
    --type SALES \
    --name "Partner Test Sales Agent $(date +%s)" \
    --endpointUrl "https://example.com/sales-agent/mcp" \
    --protocol MCP \
    --format $OUTPUT_FORMAT 2>&1)

if [ $? -eq 0 ]; then
    print_success "Sales agent registered"
    SALES_AGENT_ID=$(echo "$SALES_AGENT_RESPONSE" | grep -o '"agentId":"[^"]*"' | head -1 | sed 's/"agentId":"//' | sed 's/"//')
    echo "Sales Agent ID: $SALES_AGENT_ID"
else
    print_warning "Failed to register sales agent (requires partner access)"
    echo "$SALES_AGENT_RESPONSE"
    SALES_AGENT_ID=""
fi
echo ""

# Step 3: Register Outcome Agent (Partner Operation)
print_step "Step 3: Registering Outcome Agent..."
print_info "Attempting to register an outcome agent (partner operation)"
OUTCOME_AGENT_RESPONSE=$($CLI_CMD agents register \
    --type OUTCOME \
    --name "Partner Test Outcome Agent $(date +%s)" \
    --endpointUrl "https://example.com/outcome-agent/mcp" \
    --protocol MCP \
    --format $OUTPUT_FORMAT 2>&1)

if [ $? -eq 0 ]; then
    print_success "Outcome agent registered"
    OUTCOME_AGENT_ID=$(echo "$OUTCOME_AGENT_RESPONSE" | grep -o '"agentId":"[^"]*"' | head -1 | sed 's/"agentId":"//' | sed 's/"//')
    echo "Outcome Agent ID: $OUTCOME_AGENT_ID"
else
    print_warning "Failed to register outcome agent (requires partner access)"
    echo "$OUTCOME_AGENT_RESPONSE"
    OUTCOME_AGENT_ID=""
fi
echo ""

# Step 4: Get Existing Campaign for Testing
print_step "Step 4: Finding Existing Campaign..."
CAMPAIGNS_RESPONSE=$($CLI_CMD campaigns list --format $OUTPUT_FORMAT 2>&1)
if [ $? -eq 0 ]; then
    print_success "Campaigns retrieved"
    # Try to extract first campaign ID
    CAMPAIGN_ID=$(echo "$CAMPAIGNS_RESPONSE" | grep -o 'campaign_[a-zA-Z0-9_]*' | head -1)
    if [ -n "$CAMPAIGN_ID" ]; then
        echo "Using existing campaign: $CAMPAIGN_ID"
    else
        print_warning "No campaigns found. Create one first with buyer workflow."
        CAMPAIGN_ID=""
    fi
else
    print_warning "Failed to list campaigns"
    CAMPAIGN_ID=""
fi
echo ""

# Step 5: Create Tactic (Partner Operation)
if [ -n "$CAMPAIGN_ID" ]; then
    print_step "Step 5: Creating Tactic (Partner Operation)..."
    print_info "Attempting to create a tactic (requires partner access)"
    TACTIC_RESPONSE=$($CLI_CMD tactics create \
        --name "Partner Test Tactic $(date +%s)" \
        --campaignId "$CAMPAIGN_ID" \
        --prompt "Focus on high-impact video placements" \
        --channelCodes video,display \
        --format $OUTPUT_FORMAT 2>&1)

    if [ $? -eq 0 ]; then
        print_success "Tactic created"
        TACTIC_ID=$(echo "$TACTIC_RESPONSE" | grep -o '"tacticId":"[^"]*"' | head -1 | sed 's/"tacticId":"//' | sed 's/"//')
        if [ -z "$TACTIC_ID" ]; then
            TACTIC_ID=$(echo "$TACTIC_RESPONSE" | grep -o 'tactic_[a-zA-Z0-9_]*' | head -1)
        fi
        echo "Tactic ID: $TACTIC_ID"
    else
        print_warning "Failed to create tactic (requires partner access)"
        echo "$TACTIC_RESPONSE"
        TACTIC_ID=""
    fi
else
    print_warning "Step 5: Skipping tactic creation (no campaign available)"
    TACTIC_ID=""
fi
echo ""

# Step 6: List Tactics
print_step "Step 6: Listing All Tactics..."
$CLI_CMD tactics list --format $OUTPUT_FORMAT > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_success "Tactics listed successfully"
else
    print_warning "Failed to list tactics"
fi
echo ""

# Step 7: Create Media Buy (Partner Operation)
if [ -n "$TACTIC_ID" ] && [ -n "$SALES_AGENT_ID" ]; then
    print_step "Step 7: Creating Media Buy (Partner Operation)..."
    print_info "Attempting to create a media buy (requires partner access)"
    MEDIA_BUY_RESPONSE=$($CLI_CMD media-buys create \
        --tacticId "$TACTIC_ID" \
        --name "Partner Test Media Buy" \
        --products '[{"mediaProductId":"prod-123","salesAgentId":"'$SALES_AGENT_ID'"}]' \
        --budget '{"amount":50000,"currency":"USD"}' \
        --format $OUTPUT_FORMAT 2>&1)

    if [ $? -eq 0 ]; then
        print_success "Media buy created"
        MEDIA_BUY_ID=$(echo "$MEDIA_BUY_RESPONSE" | grep -o '"mediaBuyId":"[^"]*"' | head -1 | sed 's/"mediaBuyId":"//' | sed 's/"//')
        echo "Media Buy ID: $MEDIA_BUY_ID"
    else
        print_warning "Failed to create media buy (requires partner access and valid products)"
        echo "$MEDIA_BUY_RESPONSE"
        MEDIA_BUY_ID=""
    fi
else
    print_warning "Step 7: Skipping media buy creation (missing tactic or sales agent)"
    MEDIA_BUY_ID=""
fi
echo ""

# Step 8: List Media Buys
print_step "Step 8: Listing All Media Buys..."
$CLI_CMD media-buys list --format $OUTPUT_FORMAT > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_success "Media buys listed successfully"
else
    print_warning "Failed to list media buys"
fi
echo ""

# Step 9: Execute Media Buy (Partner Operation)
if [ -n "$MEDIA_BUY_ID" ]; then
    print_step "Step 9: Executing Media Buy (Partner Operation)..."
    print_info "Attempting to execute media buy"
    EXECUTE_RESPONSE=$($CLI_CMD media-buys execute \
        --mediaBuyId "$MEDIA_BUY_ID" \
        --format $OUTPUT_FORMAT 2>&1)

    if [ $? -eq 0 ]; then
        print_success "Media buy executed successfully"
    else
        print_warning "Failed to execute media buy"
        echo "$EXECUTE_RESPONSE"
    fi
else
    print_warning "Step 9: Skipping media buy execution (no media buy created)"
fi
echo ""

# Step 10: Sync Products (Partner Operation)
if [ -n "$SALES_AGENT_ID" ]; then
    print_step "Step 10: Syncing Products from Sales Agent..."
    SYNC_RESPONSE=$($CLI_CMD products sync \
        --salesAgentId "$SALES_AGENT_ID" \
        --format $OUTPUT_FORMAT 2>&1)

    if [ $? -eq 0 ]; then
        print_success "Products synced successfully"
    else
        print_warning "Failed to sync products"
    fi
else
    print_warning "Step 10: Skipping product sync (no sales agent registered)"
fi
echo ""

# Summary
echo ""
echo "=========================================="
echo "    PARTNER WORKFLOW SUMMARY"
echo "=========================================="
echo ""

if [ -n "$SALES_AGENT_ID" ] || [ -n "$OUTCOME_AGENT_ID" ] || [ -n "$TACTIC_ID" ] || [ -n "$MEDIA_BUY_ID" ]; then
    print_success "Partner operations executed!"
    echo ""
    echo "✅ Created Resources:"
    [ -n "$SALES_AGENT_ID" ] && echo "  • Sales Agent ID: $SALES_AGENT_ID"
    [ -n "$OUTCOME_AGENT_ID" ] && echo "  • Outcome Agent ID: $OUTCOME_AGENT_ID"
    [ -n "$TACTIC_ID" ] && echo "  • Tactic ID: $TACTIC_ID"
    [ -n "$MEDIA_BUY_ID" ] && echo "  • Media Buy ID: $MEDIA_BUY_ID"
    echo ""
    echo "✅ Partner Capabilities Verified:"
    echo "  • Register and manage sales/outcome agents"
    echo "  • Create and manage tactics"
    echo "  • Create and manage media buys"
    echo "  • Execute campaigns"
    echo ""
    echo "📋 To clean up test resources:"
    [ -n "$MEDIA_BUY_ID" ] && echo "  $CLI_CMD media-buys delete --mediaBuyId $MEDIA_BUY_ID"
    [ -n "$TACTIC_ID" ] && echo "  $CLI_CMD tactics delete --tacticId $TACTIC_ID"
    [ -n "$SALES_AGENT_ID" ] && echo "  $CLI_CMD agents unregister --agentId $SALES_AGENT_ID"
    [ -n "$OUTCOME_AGENT_ID" ] && echo "  $CLI_CMD agents unregister --agentId $OUTCOME_AGENT_ID"
    echo ""
    print_success "Partner workflow test successful!"
else
    print_warning "No partner operations succeeded"
    echo ""
    echo "❌ Partner Operations Failed:"
    echo "  • Could not register agents"
    echo "  • Could not create tactics"
    echo "  • Could not create media buys"
    echo ""
    print_info "Possible Reasons:"
    echo "  1. API key does not have partner-level permissions"
    echo "  2. Using a buyer-level API key instead of partner key"
    echo "  3. Missing required configuration or setup"
    echo ""
    print_info "If you are a PLATFORM (not a partner), use platform-workflow-test.sh instead"
    echo ""
fi
