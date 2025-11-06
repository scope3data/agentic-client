# Scope3 CLI Tool

A comprehensive command-line interface for interacting with all Scope3 Agentic API resources.

## Installation

### Local Development

```bash
npm install
npm run build
node dist/cli.js --help
```

### From NPM (after publishing)

```bash
npm install -g @scope3/agentic-client
scope3 --help
```

### Using npx (after publishing)

```bash
npx @scope3/agentic-client --help
```

## Configuration

The CLI supports three methods for authentication (in order of precedence):

1. **Command-line flag**: `--api-key your_key`
2. **Environment variable**: `SCOPE3_API_KEY=your_key`
3. **Config file**: `~/.scope3/config.json`

### Setting up configuration

```bash
# Set API key in config file
scope3 config set apiKey your_api_key_here

# Set base URL (optional, defaults to production)
scope3 config set baseUrl https://api.agentic.staging.scope3.com

# View current configuration
scope3 config get

# View specific config value
scope3 config get apiKey

# Clear all configuration
scope3 config clear
```

### Environment Variables

```bash
export SCOPE3_API_KEY=your_api_key_here
export SCOPE3_BASE_URL=https://api.agentic.scope3.com  # optional
```

## Global Options

Available for all commands:

- `--api-key <key>`: API key for authentication
- `--base-url <url>`: Base URL for API (default: production)
- `--format <format>`: Output format: `json` or `table` (default: `table`)

## Output Formats

### Table Format (Default)

Human-readable table output:

```bash
scope3 campaigns list
```

### JSON Format

Machine-readable JSON output:

```bash
scope3 campaigns list --format json
```

## Available Resources

The CLI provides access to all 12 Scope3 API resources with 80+ operations:

1. **agents** - Manage agent registration and configuration
2. **assets** - Upload and manage brand assets
3. **brand-agents** - Create and manage brand agents
4. **brand-standards** - Define brand safety standards
5. **brand-stories** - AI-powered audience story definitions
6. **campaigns** - Create and manage advertising campaigns
7. **channels** - List available advertising channels
8. **creatives** - Manage campaign creatives and ad assets
9. **tactics** - Manage campaign tactics and channel strategies
10. **media-buys** - Create and manage media buys
11. **notifications** - Manage system notifications
12. **products** - Discover and manage media products

## Usage Examples

### Agents

```bash
# List all agents
scope3 agents list

# Filter agents by type
scope3 agents list --type SALES

# Get specific agent
scope3 agents get --agentId abc123

# Register a new agent
scope3 agents register \
  --type SALES \
  --name "My Sales Agent" \
  --endpointUrl https://my-agent.com/mcp \
  --protocol MCP

# Update agent
scope3 agents update \
  --agentId abc123 \
  --name "Updated Name"

# Unregister agent
scope3 agents unregister --agentId abc123
```

### Assets

```bash
# List assets
scope3 assets list --brandAgentId brand123

# Upload assets (JSON format required)
scope3 assets upload \
  --brandAgentId brand123 \
  --assets '[{"name":"logo.png","contentType":"image/png","data":"base64data","assetType":"logo"}]'
```

### Brand Agents

```bash
# List all brand agents
scope3 brand-agents list

# Create brand agent
scope3 brand-agents create \
  --name "Acme Corp" \
  --description "Brand agent for Acme Corporation"

# Get brand agent
scope3 brand-agents get --brandAgentId brand123

# Update brand agent
scope3 brand-agents update \
  --brandAgentId brand123 \
  --name "Acme Corporation"

# Delete brand agent
scope3 brand-agents delete --brandAgentId brand123
```

### Brand Standards

```bash
# List brand standards
scope3 brand-standards list

# Create brand standards
scope3 brand-standards create \
  --brandAgentId brand123 \
  --prompt "Safety guidelines for our brand" \
  --name "Brand Safety Rules"

# Delete brand standards
scope3 brand-standards delete --brandStandardId std123
```

### Brand Stories

```bash
# List brand stories
scope3 brand-stories list --brandAgentId brand123

# Create brand story
scope3 brand-stories create \
  --brandAgentId brand123 \
  --name "Spring Campaign Story" \
  --prompt "Target young professionals interested in sustainable fashion"

# Update brand story
scope3 brand-stories update \
  --brandStoryId story123 \
  --prompt "Updated audience targeting"

# Delete brand story
scope3 brand-stories delete --brandStoryId story123
```

### Campaigns

```bash
# List campaigns
scope3 campaigns list

# Filter campaigns by status
scope3 campaigns list --status ACTIVE --brandAgentId brand123

# Create campaign
scope3 campaigns create \
  --prompt "Q1 2024 Spring Campaign targeting millennials" \
  --name "Spring 2024" \
  --budget '{"amount":100000,"currency":"USD","dailyCap":5000,"pacing":"even"}'

# Update campaign
scope3 campaigns update \
  --campaignId camp123 \
  --status PAUSED

# Delete campaign
scope3 campaigns delete --campaignId camp123

# Get campaign summary
scope3 campaigns get-summary --campaignId camp123

# List campaign tactics
scope3 campaigns list-tactics --campaignId camp123

# Validate campaign brief
scope3 campaigns validate-brief \
  --brief "Launch new product targeting Gen Z on social media"
```

### Channels

```bash
# List all available channels
scope3 channels list
```

### Creatives

```bash
# List creatives
scope3 creatives list --campaignId camp123

# Create creative
scope3 creatives create \
  --brandAgentId 123 \
  --name "Banner Ad 728x90" \
  --content '{"assetIds":["asset1","asset2"]}'

# Get creative
scope3 creatives get --creativeId 456

# Update creative
scope3 creatives update \
  --creativeId 456 \
  --name "Updated Banner"

# Delete creative
scope3 creatives delete --creativeId 456

# Assign creative to campaign
scope3 creatives assign \
  --creativeId 456 \
  --campaignId 789

# Sync with sales agents
scope3 creatives sync-sales-agents --creativeId 456
```

### Tactics

```bash
# List tactics
scope3 tactics list --campaignId camp123

# Create tactic
scope3 tactics create \
  --name "Social Media Push" \
  --campaignId camp123 \
  --channelCodes SOCIAL,DISPLAY-WEB

# Get tactic
scope3 tactics get --tacticId tactic123

# Update tactic
scope3 tactics update \
  --tacticId tactic123 \
  --name "Updated Tactic Name"

# Delete tactic
scope3 tactics delete --tacticId tactic123

# Link tactic to campaign
scope3 tactics link-campaign \
  --tacticId tactic123 \
  --campaignId camp456

# Unlink tactic from campaign
scope3 tactics unlink-campaign \
  --tacticId tactic123 \
  --campaignId camp456
```

### Media Buys

```bash
# List media buys
scope3 media-buys list --tacticId tactic123

# Create media buy
scope3 media-buys create \
  --tacticId tactic123 \
  --name "Q1 Display Buy" \
  --products '[{"mediaProductId":"prod1","salesAgentId":"agent1"}]' \
  --budget '{"amount":50000,"currency":"USD"}'

# Get media buy
scope3 media-buys get --mediaBuyId buy123

# Update media buy
scope3 media-buys update \
  --mediaBuyId buy123 \
  --budget '{"amount":60000}'

# Delete media buy
scope3 media-buys delete --mediaBuyId buy123

# Execute media buy
scope3 media-buys execute --mediaBuyId buy123
```

### Notifications

```bash
# List all notifications
scope3 notifications list

# List unread notifications
scope3 notifications list --unreadOnly true --limit 10

# Mark notification as read
scope3 notifications mark-read --notificationId notif123

# Mark notification as acknowledged
scope3 notifications mark-acknowledged --notificationId notif123

# Mark all notifications as read
scope3 notifications mark-all-read
```

### Products

```bash
# List all media products
scope3 products list

# List products from specific sales agent
scope3 products list --salesAgentId agent123

# Discover available products
scope3 products discover

# Sync products from sales agent
scope3 products sync --salesAgentId agent123
```

## Advanced Usage

### Working with JSON Fields

Some fields require JSON input. You can provide them inline or from a file:

```bash
# Inline JSON
scope3 campaigns create \
  --prompt "Test campaign" \
  --budget '{"amount":100000,"currency":"USD","pacing":"even"}'

# From a file (using shell command substitution)
scope3 campaigns create \
  --prompt "Test campaign" \
  --budget "$(cat budget.json)"
```

### Working with Arrays

Array fields accept comma-separated values:

```bash
# Array of channel codes
scope3 tactics create \
  --name "Multi-channel tactic" \
  --campaignId camp123 \
  --channelCodes SOCIAL,DISPLAY-WEB,CTV-BVOD

# Array of segment IDs
scope3 campaigns create \
  --prompt "Targeted campaign" \
  --segmentIds seg1,seg2,seg3
```

### Piping and Scripting

The JSON output format is perfect for scripting:

```bash
# Extract campaign IDs
scope3 campaigns list --format json | jq -r '.data[].id'

# Count active campaigns
scope3 campaigns list --status ACTIVE --format json | jq '.data | length'

# Create multiple brand agents from a list
cat brands.txt | while read brand; do
  scope3 brand-agents create --name "$brand"
done
```

## Data Types

### Numeric Fields

These fields are automatically parsed as numbers:
- `limit`, `offset`, `take`, `skip`
- `threshold`, `outcomeScoreWindowDays`
- `brandAgentId`, `organizationId`, `creativeId`, `campaignId`

### Boolean Fields

These fields accept `true` or `false`:
- `hardDelete`, `includeArchived`
- `tacticSeedDataCoop`, `isArchived`
- `unreadOnly`

### JSON Fields

These fields require JSON object strings:
- `budget` - Budget configuration object
- `scoringWeights` - Scoring weights object
- `content` - Creative content object
- `products` - Array of product objects
- `assets` - Array of asset objects
- `where`, `orderBy` - Filter/sort objects

### Array Fields

These fields accept comma-separated values:
- `channelCodes`, `countryCodes`
- `segmentIds`, `dealIds`, `creativeIds`
- `countries`, `channels`, `languages`, `brands`
- `advertiserDomains`

## Debugging

Enable debug mode for verbose error output:

```bash
DEBUG=1 scope3 campaigns list
```

## Error Handling

The CLI provides clear error messages:

```bash
# Missing required parameters
$ scope3 campaigns create
Error: Missing required parameters: prompt

# Invalid JSON
$ scope3 campaigns create --prompt "test" --budget 'invalid'
Error: Invalid JSON: invalid

# API errors
$ scope3 campaigns get --campaignId invalid
Error: Campaign not found
```

## Tips and Tricks

1. **Autocomplete**: Use `--help` on any command or subcommand to see available options
2. **Config File**: Store your API key in the config file to avoid typing it every time
3. **JSON Output**: Use `--format json` with `jq` for powerful data manipulation
4. **Environment**: Use `SCOPE3_BASE_URL` to easily switch between staging and production
5. **Batch Operations**: Combine with shell scripting for bulk operations

## Complete Command Reference

### Agents
- `list` - List all agents with optional filters
- `get` - Get details of a specific agent
- `register` - Register a new agent
- `update` - Update agent configuration
- `unregister` - Unregister an agent

### Assets
- `upload` - Upload multiple assets
- `list` - List assets

### Brand Agents
- `list` - List all brand agents
- `create` - Create a new brand agent
- `get` - Get specific brand agent
- `update` - Update brand agent
- `delete` - Delete a brand agent

### Brand Standards
- `list` - List brand standards
- `create` - Create brand standards
- `delete` - Delete brand standards

### Brand Stories
- `list` - List brand stories
- `create` - Create a brand story
- `update` - Update a brand story
- `delete` - Delete a brand story

### Campaigns
- `list` - List campaigns
- `create` - Create a new campaign
- `update` - Update campaign
- `delete` - Delete campaign
- `get-summary` - Get campaign summary
- `list-tactics` - List tactics for a campaign
- `validate-brief` - Validate campaign brief

### Channels
- `list` - Get all available channels

### Creatives
- `list` - List creatives
- `create` - Create a creative
- `get` - Get creative details
- `update` - Update creative
- `delete` - Delete creative
- `assign` - Assign creative to campaign
- `sync-sales-agents` - Sync creative with sales agents

### Tactics
- `list` - List tactics
- `create` - Create a tactic
- `get` - Get tactic details
- `update` - Update tactic
- `delete` - Delete tactic
- `link-campaign` - Link tactic to campaign
- `unlink-campaign` - Unlink tactic from campaign

### Media Buys
- `list` - List media buys
- `create` - Create a media buy
- `get` - Get media buy details
- `update` - Update media buy
- `delete` - Delete media buy
- `execute` - Execute/activate media buy

### Notifications
- `list` - List notifications
- `mark-read` - Mark notification as read
- `mark-acknowledged` - Mark notification as acknowledged
- `mark-all-read` - Mark all notifications as read

### Products
- `list` - List media products
- `discover` - Discover available media products
- `sync` - Sync products from a sales agent

## Support

For issues or questions:
- GitHub: https://github.com/scope3data/agentic-client/issues
- Documentation: https://docs.scope3.com

## License

MIT
