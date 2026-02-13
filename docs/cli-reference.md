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

# List brands (brand persona)
scope3 --persona brand brands list
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
| `--persona <persona>` | Persona to use: `buyer`, `brand`, `partner` (overrides config and environment variable) |
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

# Create a bundle campaign
scope3 campaigns create-bundle \
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

### Brands (Buyer Context)

```bash
# List brands available to the buyer
scope3 brands list

# Link a brand to an advertiser
scope3 brands link --advertiser-id <id> --brand-id <brand-id>

# Get the brand linked to an advertiser
scope3 brands get-linked --advertiser-id <id>

# Unlink a brand from an advertiser
scope3 brands unlink --advertiser-id <id>
```

## Brand Commands

Brand commands require the `brand` persona. Use the `--persona brand` flag or set the persona in your configuration.

```bash
# List all brands
scope3 --persona brand brands list

# Get a specific brand
scope3 --persona brand brands get <id>

# Create a brand with a manifest URL
scope3 --persona brand brands create --manifest-url "https://example.com/brand-manifest.json"

# Update a brand
scope3 --persona brand brands update <id> --manifest-url "https://example.com/updated-manifest.json"

# Delete a brand
scope3 --persona brand brands delete <id>
```

## Partner Commands

Partner commands require the `partner` persona.

```bash
# Check API health
scope3 --persona partner health
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

brands
  list                      List brands
  get <id>                  Get brand by ID (brand persona)
  create                    Create a new brand (brand persona)
  update <id>               Update a brand (brand persona)
  delete <id>               Delete a brand (brand persona)
  link                      Link brand to advertiser (buyer persona)
  unlink                    Unlink brand from advertiser (buyer persona)
  get-linked                Get linked brand (buyer persona)

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
  create-bundle             Create a bundle campaign
  create-performance        Create a performance campaign
  create-audience           Create an audience campaign
  update-bundle <id>        Update a bundle campaign
  update-performance <id>   Update a performance campaign
  execute <id>              Execute a campaign (go live)
  pause <id>                Pause an active campaign

config
  set <key> <value>         Set a configuration value
  get [key]                 Get configuration value(s)
  clear                     Clear all configuration
  path                      Show configuration file path
```
