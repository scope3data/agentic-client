# Scope3 CLI Workflow Guide

## Understanding Platform vs Partner Access

Scope3's Agentic API has two distinct access levels, each with different capabilities:

### 👥 Platform Access (Your Current Level)

**What you CAN do:**
- ✅ Create and manage **Brand Agents**
- ✅ Create and manage **Campaigns**
- ✅ Upload and manage **Creative Assets**
- ✅ Discover **Marketplace Agents** (sales/outcome agents)
- ✅ Discover **Media Products** from sales agents
- ✅ **View** tactics and media buys (read-only)
- ✅ Manage **Notifications**

**What you CANNOT do:**
- ❌ Create tactics (read-only access)
- ❌ Create media buys (read-only access)
- ❌ Register sales/outcome agents
- ❌ Execute campaigns directly

**Why?** Platforms define *what* they want to advertise, but partner agents determine *how* and *where* to execute it.

### 🤝 Partner Access

**Additional capabilities:**
- ✅ Register and manage **Sales/Outcome Agents**
- ✅ Create and manage **Tactics**
- ✅ Create and manage **Media Buys**
- ✅ **Execute** campaigns
- ✅ Sync **Products** from sales agents

## Workflow Examples

### Platform Workflow

```bash
# 1. Set your platform API key
export SCOPE3_API_KEY=your_platform_key

# 2. Create a brand agent
node dist/cli.js brand-agents create \
  --name "My Brand" \
  --description "Brand for athletic footwear"

# 3. Create a campaign
node dist/cli.js campaigns create \
  --prompt "Q1 campaign targeting fitness enthusiasts aged 25-40" \
  --brandAgentId 123 \
  --name "Q1 Fitness Campaign"

# 4. Discover available marketplace agents
node dist/cli.js agents list

# 5. Discover media products
node dist/cli.js products discover

# 6. View tactics created by partners (read-only)
node dist/cli.js tactics list

# 7. View media buys (read-only)
node dist/cli.js media-buys list
```

**Run complete platform workflow test:**
```bash
./scripts/platform-workflow-test.sh
```

### Partner Workflow

```bash
# 1. Set your partner API key
export SCOPE3_API_KEY=your_partner_key

# 2. Register a sales agent
node dist/cli.js agents register \
  --type SALES \
  --name "My Sales Agent" \
  --endpointUrl https://my-agent.com/mcp \
  --protocol MCP

# 3. Get campaign from platform
node dist/cli.js campaigns list

# 4. Create tactic for campaign
node dist/cli.js tactics create \
  --name "Video Tactic" \
  --campaignId campaign_xxx \
  --channelCodes video,social

# 5. Create media buy
node dist/cli.js media-buys create \
  --tacticId tactic_xxx \
  --name "Video Buy" \
  --products '[{"mediaProductId":"prod1","salesAgentId":"agent1"}]' \
  --budget '{"amount":50000,"currency":"USD"}'

# 6. Execute media buy
node dist/cli.js media-buys execute --mediaBuyId buy_xxx
```

**Run complete partner workflow test:**
```bash
./scripts/partner-workflow-test.sh
```

## How Platform and Partner Work Together

### The Complete Flow

1. **Platform** creates a brand agent and campaign
   ```
   "I want to run a Q1 campaign for running shoes"
   ```

2. **Platform** discovers marketplace agents and products
   ```
   "What sales agents and inventory are available?"
   ```

3. **Partner** (sales/outcome agents) create tactics
   ```
   "I'll target video and social channels with these specific placements"
   ```

4. **Partner** creates and executes media buys
   ```
   "I'm purchasing inventory X, Y, Z for this campaign"
   ```

5. **Platform** monitors results
   ```
   "View campaign summary, tactics performance, media buy metrics"
   ```

## Quick Start for Your Role

### If you're a Platform (Most Common)

```bash
# Use the platform workflow test
export SCOPE3_API_KEY=your_key
./scripts/platform-workflow-test.sh

# This will:
# ✅ Create brand agent
# ✅ Create campaign
# ✅ Discover marketplace
# ✅ View read-only tactics/media buys
```

### If you're a Partner

```bash
# Use the partner workflow test
export SCOPE3_API_KEY=your_partner_key
./scripts/partner-workflow-test.sh

# This will:
# ✅ Register agents
# ✅ Create tactics
# ✅ Create media buys
# ✅ Execute campaigns
```

### If you're unsure

Run the platform workflow first. If you get permission errors on tactics/media buys **creation** (viewing is OK), you have platform access.

## Common Questions

### Q: Why can't I create tactics?

**A:** You have a platform-level API key. Tactics are created by partner agents. You can:
- View existing tactics (read-only)
- Work with partners who will create tactics for your campaigns
- Upgrade to partner access if you need to create tactics

### Q: How do I execute my campaign?

**A:** As a platform, you don't execute campaigns directly. The flow is:
1. You create the campaign
2. Partner agents (sales/outcome agents) create tactics and media buys
3. Partners execute the media buys
4. You monitor results via campaign summaries

### Q: Can I see my campaign's performance?

**A:** Yes! Use:
```bash
node dist/cli.js campaigns get-summary --campaignId your_campaign_id
node dist/cli.js tactics list --campaignId your_campaign_id
node dist/cli.js media-buys list --campaignId your_campaign_id
```

### Q: How do I find partners to work with?

**A:** Discover marketplace agents:
```bash
node dist/cli.js agents list --type SALES
node dist/cli.js products discover
```

## Testing Your Access Level

Run this command to see what you can access:

```bash
# Test platform operations
node dist/cli.js brand-agents list    # Should work
node dist/cli.js campaigns list       # Should work

# Test partner operations
node dist/cli.js tactics create --name "Test" --campaignId xxx
# If this fails with permission error -> you're a platform
# If this works -> you're a partner
```

## Getting Help

- **CLI Help**: `node dist/cli.js --help`
- **Resource Help**: `node dist/cli.js campaigns --help`
- **Operation Help**: `node dist/cli.js campaigns create --help`
- **Documentation**: See `CLI.md` and `CLI_STATUS.md`
- **Examples**: Check `examples/` directory

## Summary

| Feature | Platform | Partner |
|---------|-------|---------|
| Create Brand Agents | ✅ | ✅ |
| Create Campaigns | ✅ | ✅ |
| View Tactics | ✅ (read-only) | ✅ (full access) |
| Create Tactics | ❌ | ✅ |
| View Media Buys | ✅ (read-only) | ✅ (full access) |
| Create Media Buys | ❌ | ✅ |
| Register Agents | ❌ | ✅ |
| Execute Campaigns | ❌ | ✅ |

**Your role determines your workflow - use the appropriate test script!**
