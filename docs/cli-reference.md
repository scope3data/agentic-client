# CLI Reference

Command-line interface reference for the Scope3 SDK.

## Installation

```bash
npm install -g scope3
# or use with npx
npx scope3 --help
```

## Quick Start

```bash
# See all available commands
scope3 commands

# Configure your API key
scope3 config set apiKey your_api_key_here

# List advertisers (buyer persona, default)
scope3 advertisers list

# List partners (partner persona)
scope3 --persona partner partners list
```

## Configuration

### Setting Configuration Values

```bash
# Set API key
scope3 config set apiKey your_api_key_here

# Set default persona
scope3 config set persona buyer

# Set environment
scope3 config set environment staging

# View current config
scope3 config get

# View specific config value
scope3 config get apiKey
```

### Environment Variables

Configuration can also be provided via environment variables. Environment variables take precedence over config file values but are overridden by command-line flags.

```bash
export SCOPE3_API_KEY=your_api_key_here
export SCOPE3_ENVIRONMENT=staging
export SCOPE3_PERSONA=buyer
```

## Global Options

| Option | Description |
|---|---|
| `--api-key <key>` | API key (overrides config and environment variable) |
| `--persona <persona>` | Persona to use: `buyer`, `partner` (overrides config and environment variable) |
| `--environment <env>` | Target environment: `production`, `staging` |
| `--base-url <url>` | Custom API base URL |
| `--format <format>` | Output format: `table` (default), `json`, `yaml` |
| `--debug` | Enable debug logging |
| `-V, --cli-version` | Show version number |
| `-h, --help` | Show help information |

## Buyer Commands

The buyer persona is the default. The following commands are available without specifying `--persona`.

### Advertisers

```bash
# List all advertisers
scope3 advertisers list

# Get a specific advertiser
scope3 advertisers get <id>

# Create an advertiser
scope3 advertisers create --name "Acme Corp"

# Update an advertiser
scope3 advertisers update <id> --name "New Name"

# Delete an advertiser
scope3 advertisers delete <id>
```

### Campaigns

```bash
# List all campaigns
scope3 campaigns list

# Get a specific campaign
scope3 campaigns get <id>

# Create a discovery campaign
scope3 campaigns create-discovery \
  --advertiser-id <id> \
  --bundle-id <id> \
  --name "Q1 Campaign" \
  --start-date 2025-01-01 \
  --end-date 2025-03-31 \
  --budget 50000

# Create a performance campaign
scope3 campaigns create-performance \
  --advertiser-id <id> \
  --name "Performance Campaign" \
  --start-date 2025-01-01 \
  --end-date 2025-03-31 \
  --budget 50000 \
  --objective CONVERSIONS

# Execute a campaign (go live)
scope3 campaigns execute <id>

# Pause an active campaign
scope3 campaigns pause <id>
```

### Bundles

```bash
# Create a bundle for inventory discovery
scope3 bundles create \
  --advertiser-id <id> \
  --channels display,video \
  --countries US,CA

# Discover products for a bundle
scope3 bundles discover-products <bundle-id>

# Browse products without creating a bundle
scope3 bundles browse-products --advertiser-id <id> --channels display

# List products in a bundle
scope3 bundles products list <bundle-id>

# Add products to a bundle (JSON format)
scope3 bundles products add <bundle-id> \
  --products '[{"productId":"prod-1","salesAgentId":"sa-1","groupId":"g-1","groupName":"Group 1"}]'

# Remove products from a bundle
scope3 bundles products remove <bundle-id> --product-ids prod-1,prod-2
```

## Reporting Commands

```bash
# Get reporting metrics
scope3 reporting get --days 30 --view summary

# With filters
scope3 reporting get --advertiser-id <id> --campaign-id <id> --view timeseries
```

## Sales Agent Commands

```bash
# List sales agents
scope3 sales-agents list

# Register an account for a sales agent
scope3 sales-agents register-account <agent-id> --name "Account Name"
```

## Partner Commands

Partner commands require the `partner` persona.

```bash
# List partners
scope3 --persona partner partners list

# Create a partner
scope3 --persona partner partners create --name "My Org"

# Update a partner
scope3 --persona partner partners update <id> --name "New Name"

# Archive a partner
scope3 --persona partner partners archive <id>

# List agents
scope3 --persona partner agents list

# Get agent details
scope3 --persona partner agents get <id>

# Register an agent
scope3 --persona partner agents register --name "My Agent" --type SALES --partner-id <id>
```

## Output Formats

### Table (Default)

The default output format renders results as a formatted table:

```bash
scope3 advertisers list
```

```
┌────────┬─────────────┬────────┐
│ id     │ name        │ status │
├────────┼─────────────┼────────┤
│ 5661   │ Acme Corp   │ ACTIVE │
│ 5662   │ Widget Inc  │ ACTIVE │
└────────┴─────────────┴────────┘
```

### JSON

Use `--format json` for machine-readable JSON output:

```bash
scope3 advertisers list --format json
```

```json
{
  "data": [
    { "id": "5661", "name": "Acme Corp", "status": "ACTIVE" },
    { "id": "5662", "name": "Widget Inc", "status": "ACTIVE" }
  ],
  "meta": {
    "pagination": { "skip": 0, "take": 50, "total": 2, "hasMore": false }
  }
}
```

### YAML

Use `--format yaml` for YAML output:

```bash
scope3 advertisers list --format yaml
```

## All Commands Reference

Run `scope3 commands` to see all available commands:

```
advertisers
  list                      List all advertisers
  get <id>                  Get advertiser by ID
  create                    Create a new advertiser
  update <id>               Update an advertiser
  delete <id>               Delete an advertiser

bundles
  create                    Create a new media bundle
  discover-products <id>    Discover available products for a bundle
  browse-products           Browse products without creating a bundle
  products list <id>        List products in a bundle
  products add <id>         Add products to a bundle
  products remove <id>      Remove products from a bundle

campaigns
  list                      List all campaigns
  get <id>                  Get campaign by ID
  create-discovery          Create a discovery campaign
  create-performance        Create a performance campaign
  create-audience           Create an audience campaign
  update-discovery <id>     Update a discovery campaign
  update-performance <id>   Update a performance campaign
  execute <id>              Execute a campaign (go live)
  pause <id>                Pause an active campaign

reporting
  get                       Get reporting metrics

sales-agents
  list                      List sales agents
  register-account <id>     Register account for a sales agent

partners (--persona partner)
  list                      List partners
  create                    Create a partner
  update <id>               Update a partner
  archive <id>              Archive a partner

agents (--persona partner)
  list                      List agents
  get <id>                  Get agent by ID
  register                  Register an agent
  update <id>               Update an agent

config
  set <key> <value>         Set a configuration value
  get [key]                 Get configuration value(s)
  clear                     Clear all configuration
  path                      Show configuration file path
```
