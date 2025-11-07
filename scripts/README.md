# Scope3 CLI Workflow Scripts

This directory contains end-to-end workflow test scripts for the Scope3 CLI tool.

## 🎯 Platform vs Partner Access

Scope3 has two levels of API access:

- **Platform API** - Create/manage brand agents, campaigns, creatives; read-only access to tactics and media buys
- **Partner API** - Full access to create/manage tactics, media buys, and execute campaigns

**Use the appropriate workflow for your access level!**

## Available Scripts

### `platform-workflow-test.sh` - Platform Workflow Test

**For platform users with platform-level API keys**

Demonstrates complete platform workflow:
- ✅ Create and manage brand agents
- ✅ Create and manage campaigns
- ✅ Discover marketplace agents and products
- ✅ View tactics and media buys (read-only)
- ✅ Manage notifications

**Usage:**

```bash
# Set your platform API key
export SCOPE3_API_KEY=your_platform_api_key

# Run the platform workflow test
./scripts/platform-workflow-test.sh
```

**Expected output:**
```
==========================================
    PLATFORM WORKFLOW TEST
==========================================

✓ Channels discovered (12 channels)
✓ Brand agent created (ID: 3167)
✓ Campaign created (ID: campaign_xxx)
✓ Marketplace agents discovered
✓ Tactics viewed (read-only)
✓ Media buys viewed (read-only)

✅ Platform workflow test successful!
```

### `partner-workflow-test.sh` - Partner Workflow Test

**For partners with partner-level API keys**

Demonstrates complete partner workflow:
- ✅ Register and manage sales/outcome agents
- ✅ Create and manage tactics
- ✅ Create and manage media buys
- ✅ Execute campaigns
- ✅ Sync products

**Usage:**

```bash
# Set your partner API key
export SCOPE3_API_KEY=your_partner_api_key

# Run the partner workflow test
./scripts/partner-workflow-test.sh
```

**Note:** If you have a platform key and try to run this, it will show warnings explaining that partner operations require elevated permissions.

## Quick Start

### If you're a Platform User (Most Common)

```bash
export SCOPE3_API_KEY=your_key
./scripts/platform-workflow-test.sh
```

### If you're a Partner

```bash
export SCOPE3_API_KEY=your_partner_key
./scripts/partner-workflow-test.sh
```

### If you're unsure

Run the platform workflow first. If you get permission errors on tactics/media buys **creation** (viewing is OK), you have platform access.

## What Each Workflow Tests

| Operation | Platform | Partner |
|-----------|----------|---------|
| List Channels | ✅ | ✅ |
| Create Brand Agents | ✅ | ✅ |
| Create Campaigns | ✅ | ✅ |
| Register Agents | ❌ | ✅ |
| Create Tactics | ❌ | ✅ |
| Create Media Buys | ❌ | ✅ |
| View Tactics | ✅ (read-only) | ✅ |
| View Media Buys | ✅ (read-only) | ✅ |
| Discover Marketplace | ✅ | ✅ |

## See Also

- **CLI Documentation**: See `../CLI.md` for complete CLI reference
- **Workflow Guide**: See `../WORKFLOW_GUIDE.md` for detailed explanation of platform vs partner roles
- **Status Report**: See `../CLI_STATUS.md` for current status of all operations
