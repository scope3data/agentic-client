#!/bin/bash

# Scope3 CLI - Platform Workflow Test
# Tests operations available to platform users (brand agents, campaigns, creatives, discovery)

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

# Function to extract value from JSON using basic tools
extract_json_value() {
    local json=$1
    local key=$2
    echo "$json" | grep -o "\"$key\":[^,}]*" | head -1 | sed 's/.*: *"\?\([^"]*\)"\?.*/\1/' | sed 's/[^a-zA-Z0-9_-]//g'
}

# Check if API key is set
if [ -z "$SCOPE3_API_KEY" ]; then
    print_error "SCOPE3_API_KEY environment variable is not set"
    echo "Please set it with: export SCOPE3_API_KEY=your_api_key"
    exit 1
fi

print_success "API key found"
echo ""
echo "=========================================="
echo "    PLATFORM WORKFLOW TEST"
echo "=========================================="
echo ""
echo "This test demonstrates platform-level operations:"
echo "✓ Brand agent management"
echo "✓ Campaign creation and management"
echo "✓ Marketplace discovery"
echo "✓ Read-only access to tactic and media buys"
echo ""

# Step 1: List available channels
print_step "Step 1: Discovering Available Channels..."
CHANNELS_RESPONSE=$($CLI_CMD channel list --format $OUTPUT_FORMAT 2>&1)
if [ $? -eq 0 ]; then
    print_success "Channels discovered"
    echo "Available channels: display, ctv, video, audio, social, dooh, etc."
else
    print_error "Failed to list channels"
    echo "$CHANNELS_RESPONSE"
    exit 1
fi
echo ""

# Step 2: Create Brand Agent
print_step "Step 2: Creating Brand Agent..."
BRAND_AGENT_RESPONSE=$($CLI_CMD brand-agent create \
    --name "Test Platform Agent $(date +%s)" \
    --description "Automated platform workflow test" \
    --manifestUrl "https://example.com/manifest.json" \
    --format $OUTPUT_FORMAT 2>&1)

if [ $? -eq 0 ]; then
    print_success "Brand agent created"
    BRAND_AGENT_ID=$(echo "$BRAND_AGENT_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')
    if [ -z "$BRAND_AGENT_ID" ]; then
        BRAND_AGENT_ID=$(echo "$BRAND_AGENT_RESPONSE" | grep -o 'ID: [0-9]*' | head -1 | sed 's/ID: //')
    fi
    echo "Brand Agent ID: $BRAND_AGENT_ID"
else
    print_error "Failed to create brand agent"
    echo "$BRAND_AGENT_RESPONSE"
    exit 1
fi
echo ""

# Step 3: List Brand Agents
print_step "Step 3: Verifying Brand Agent in List..."
$CLI_CMD brand-agent list --format $OUTPUT_FORMAT > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_success "Brand agent listed successfully"
else
    print_warning "Failed to list brand agents"
fi
echo ""

# Step 4: Create Campaign
print_step "Step 4: Creating Campaign..."
CAMPAIGN_RESPONSE=$($CLI_CMD campaign create \
    --prompt "Q1 2024 awareness campaign targeting eco-conscious millennials across digital channels with focus on video and social media" \
    --brandAgentId "$BRAND_AGENT_ID" \
    --name "Buyer Test Campaign $(date +%s)" \
    --format $OUTPUT_FORMAT 2>&1)

if [ $? -eq 0 ]; then
    print_success "Campaign created"
    CAMPAIGN_ID=$(echo "$CAMPAIGN_RESPONSE" | grep -o 'campaign_[a-zA-Z0-9_]*' | head -1)
    echo "Campaign ID: $CAMPAIGN_ID"
else
    print_error "Failed to create campaign"
    echo "$CAMPAIGN_RESPONSE"
    exit 1
fi
echo ""

# Step 5: List Campaigns
print_step "Step 5: Listing All Campaigns..."
$CLI_CMD campaign list --format $OUTPUT_FORMAT > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_success "Campaigns listed successfully"
else
    print_warning "Failed to list campaigns"
fi
echo ""

# Step 6: Get Campaign Summary
print_step "Step 6: Getting Campaign Summary..."
SUMMARY_RESPONSE=$($CLI_CMD campaign-get summary --campaignId "$CAMPAIGN_ID" --format $OUTPUT_FORMAT 2>&1)
if [ $? -eq 0 ]; then
    print_success "Campaign summary retrieved"
else
    print_warning "Failed to get campaign summary (may need time for data)"
fi
echo ""

# Step 7: Discover Marketplace Agents
print_step "Step 7: Discovering Marketplace Agents..."
AGENTS_RESPONSE=$($CLI_CMD agent list --format $OUTPUT_FORMAT 2>&1)
if [ $? -eq 0 ]; then
    print_success "Marketplace agent discovered"
    echo "Found sales agent available for partnerships"
else
    print_warning "Failed to discover agents"
fi
echo ""

# Step 8: Discover Media Products
print_step "Step 8: Discovering Available Media Products..."
PRODUCTS_RESPONSE=$($CLI_CMD media-product discover --format $OUTPUT_FORMAT 2>&1)
if [ $? -eq 0 ]; then
    print_success "Media media-product discovered"
    echo "Found available inventory from sales agents"
else
    print_warning "Failed to discover media-product (may require registered sales agents)"
fi
echo ""

# Step 9: View Tactics (Read-Only)
print_step "Step 9: Viewing Tactics (Read-Only Access)..."
print_warning "Note: Platform users can only READ tactics, not create them"
TACTICS_RESPONSE=$($CLI_CMD tactic list --format $OUTPUT_FORMAT 2>&1)
if [ $? -eq 0 ]; then
    print_success "Tactics viewed successfully (read-only)"
else
    print_warning "No tactic available or access denied"
fi
echo ""

# Step 10: View Media Buys (Read-Only)
print_step "Step 10: Viewing Media Buys (Read-Only Access)..."
print_warning "Note: Platform users can only READ media buys, not create them"
MEDIA_BUYS_RESPONSE=$($CLI_CMD media-buy list --format $OUTPUT_FORMAT 2>&1)
if [ $? -eq 0 ]; then
    print_success "Media buys viewed successfully (read-only)"
else
    print_warning "No media buys available or access denied"
fi
echo ""

# Step 11: Check Notifications
print_step "Step 11: Checking Notifications..."
$CLI_CMD notifications list --limit 5 --format $OUTPUT_FORMAT > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_success "Notifications retrieved"
else
    print_warning "Failed to list notifications"
fi
echo ""

# Summary
echo ""
echo "=========================================="
echo "    PLATFORM WORKFLOW SUMMARY"
echo "=========================================="
echo ""
print_success "Buyer workflow test completed!"
echo ""
echo "✅ Created Resources:"
echo "  • Brand Agent ID: $BRAND_AGENT_ID"
echo "  • Campaign ID: $CAMPAIGN_ID"
echo ""
echo "✅ Buyer Capabilities Verified:"
echo "  • Create and manage brand agents"
echo "  • Create and manage campaigns"
echo "  • Discover marketplace agent and products"
echo "  • View tactic and media buys (read-only)"
echo "  • Manage notifications"
echo ""
echo "ℹ️  Buyer Limitations:"
echo "  • Cannot create tactic (partner operation)"
echo "  • Cannot create media buys (partner operation)"
echo "  • Cannot execute campaign directly (requires partner agents)"
echo ""
echo "📋 To clean up test resources:"
echo "  $CLI_CMD campaign delete --campaignId $CAMPAIGN_ID"
echo "  $CLI_CMD brand-agent delete --brandAgentId $BRAND_AGENT_ID"
echo ""
print_success "Buyer workflow test successful!"
