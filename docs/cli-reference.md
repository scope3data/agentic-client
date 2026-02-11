# CLI Reference

Command-line interface reference for the Scope3 SDK.

## Installation

```bash
npm install -g scope3
# or use with npx
npx scope3 --help
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
scope3 config show
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
| `--version` | Show version number |
| `--help` | Show help information |

## Buyer Commands

The buyer persona is the default. The following commands are available without specifying `--persona`.

### Advertisers

```bash
# List all advertisers
scope3 advertisers list

# Get a specific advertiser
scope3 advertisers get --id <id>

# Create an advertiser
scope3 advertisers create --name "Acme Corp"

# Update an advertiser
scope3 advertisers update --id <id> --name "New Name"

# Delete an advertiser
scope3 advertisers delete --id <id>
```

### Campaigns

```bash
# List all campaigns
scope3 campaigns list

# Get a specific campaign
scope3 campaigns get --id <id>

# Create a bundle campaign
scope3 campaigns create-bundle --advertiserId <id> --bundleId <id> --name "Campaign" ...

# Create a performance campaign
scope3 campaigns create-performance --advertiserId <id> --name "Perf Campaign" ...

# Execute a campaign
scope3 campaigns execute --id <id>

# Pause a campaign
scope3 campaigns pause --id <id>
```

### Bundles

```bash
# Create a bundle
scope3 bundles create --advertiserId <id> --channels display,video

# Discover products for a bundle
scope3 bundles discover-products --bundleId <id>

# List products in a bundle
scope3 bundles list-products --bundleId <id>

# Add products to a bundle
scope3 bundles add-products --bundleId <id> --products '[...]'
```

### Brands

```bash
# List brands (buyer context)
scope3 brands list
```

## Brand Commands

Brand commands require the `brand` persona. Use the `--persona brand` flag or set the persona in your configuration.

```bash
# List all brands
scope3 --persona brand brands list

# Get a specific brand
scope3 --persona brand brands get --id <id>

# Create a brand with a manifest URL
scope3 --persona brand brands create --manifestUrl "https://..."

# Delete a brand
scope3 --persona brand brands delete --id <id>
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
ID          Name          Status
----------  ------------  --------
adv-001     Acme Corp     active
adv-002     Widget Inc    active
adv-003     FooBar Ltd    paused
```

### JSON

Use `--format json` for machine-readable JSON output:

```bash
scope3 advertisers list --format json
```

```json
{
  "data": [
    { "id": "adv-001", "name": "Acme Corp", "status": "active" },
    { "id": "adv-002", "name": "Widget Inc", "status": "active" },
    { "id": "adv-003", "name": "FooBar Ltd", "status": "paused" }
  ]
}
```
