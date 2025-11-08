# scope3

Command-line interface for the Scope3 Agentic API.

This is a thin wrapper around [@scope3/agentic-client](https://www.npmjs.com/package/@scope3/agentic-client) that provides a shorter package name for easier CLI usage.

## Installation

```bash
# Global installation
npm install -g scope3

# Or use directly with npx
npx scope3 --help
```

## Usage

```bash
# Configure your API key
scope3 config set apiKey YOUR_API_KEY

# List available commands
scope3 list-tools

# Use dynamic commands
scope3 brand-agent list
scope3 campaign create --name "My Campaign"

# Output formats
scope3 media-product list --format json
scope3 media-product list --format list
scope3 media-product list --format table  # default

# Environment switching
scope3 --environment staging brand-agent list

# Debug mode
scope3 --debug campaign get --campaignId 123
```

## Documentation

For full documentation, see [@scope3/agentic-client](https://www.npmjs.com/package/@scope3/agentic-client)

## License

MIT
