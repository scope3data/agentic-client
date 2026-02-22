---
name: scope3-storefront
description: Create and manage advertising agents that process ad briefs via MCP and recommend products from your catalog. Use for agent setup, product template uploads, inventory and audience source configuration, evals, traces, policy synthesis, and HITL task management.
license: MIT
metadata:
  author: Scope3
  version: "2.0.0"
---

# Scope3 Storefront

The Scope3 storefront puts your ad inventory on the Scope3 marketplace as an AI agent. Buyers send ad briefs; your agent recommends products and creates media buys. You control what runs automatically and what needs human review.

All management is done via the `scope3 sf` CLI (alias: `scope3 storefront`).

## Authentication

```bash
scope3 login        # browser OAuth — opens a browser window, saves token
scope3 logout       # clear saved credentials
```

Once logged in, all `scope3 sf` commands use your saved session automatically.

## Quick Start

```bash
# 1. Create your agent
scope3 sf create \
  --platform-id my-podcast-network \
  --platform-name "My Podcast Network" \
  --publisher-domain mypodcasts.com

# 2. Upload your product catalog
scope3 sf upload my-podcast-network --file catalog.csv --type csv

# 3. Test recommendations with eval briefs
scope3 sf evals run my-podcast-network \
  --briefs '[{"brief":"Podcast sponsorship for a health brand, $10k budget, Q1"}]'

# 4. Your agent is now live — buyers connect at /{platformId}/mcp
```

## Product Templates

Templates are your sellable products. Upload them as CSV or JSON.

```bash
# Replace all templates (default)
scope3 sf upload my-podcast-network --file catalog.csv --type csv

# Append without replacing existing templates
scope3 sf upload my-podcast-network --file new-products.csv --type csv --append

# JSON format
scope3 sf upload my-podcast-network --file catalog.json --type json

# Review upload history
scope3 sf file-uploads my-podcast-network
```

CSV columns: `name`, `description`, `pricingModel`, `floorPrice` (plus optional `channels`, `targetingFields`).

## Inventory Sources

Inventory sources define where your supply comes from — ad servers, podcast networks, other agents. Each source has an execution model: `agent` (another MCP agent fulfills), `queue` (async), or `manual` (human fulfills).

```bash
scope3 sf inventory-sources set my-podcast-network --inventory-sources '[
  {
    "id": "gam-display",
    "name": "GAM Display Network",
    "channels": ["display", "video"],
    "execution": { "type": "agent", "agentUrl": "https://gam-agent.example.com" }
  },
  {
    "id": "podcast-catalog",
    "name": "Podcast Catalog",
    "channels": ["audio"],
    "execution": { "type": "manual" }
  }
]'

scope3 sf inventory-sources get my-podcast-network
```

## Audience Sources

Connect identity and targeting partners. Each audience source maps to the inventory sources it can activate on.

```bash
scope3 sf audience-sources set my-podcast-network --audience-sources '[
  {
    "id": "liveramp",
    "name": "LiveRamp Identity",
    "activatesOn": ["gam-display"],
    "execution": { "type": "agent", "agentUrl": "https://liveramp.example.com" }
  }
]'
```

## Account Sources

Connect your CRM so the agent can resolve advertiser accounts and detect returning buyers.

```bash
scope3 sf account-sources set my-podcast-network --account-sources '[
  {
    "id": "salesforce",
    "name": "Salesforce CRM",
    "execution": { "type": "agent", "agentUrl": "https://sf-agent.example.com" }
  }
]'
```

## Rate Cards

Layer pricing rules on top of your product templates. Rules match on channel and/or product ID.

```bash
scope3 sf rate-cards set my-podcast-network --rate-cards '[
  {
    "id": "standard-2026",
    "name": "2026 Standard Rates",
    "rules": [
      { "match": { "channel": "display" }, "pricing": { "type": "cpm", "amount": 12, "currency": "USD" } },
      { "match": { "channel": "audio" }, "pricing": { "type": "cpm", "amount": 20, "currency": "USD" } }
    ]
  }
]'

scope3 sf rate-cards get my-podcast-network
```

Pricing types: `cpm`, `flat`, `custom`.

## Capabilities

Control which operations run automatically vs. require human approval vs. are disabled.

```bash
scope3 sf capabilities get my-podcast-network

scope3 sf capabilities set my-podcast-network --capabilities '{
  "get_products": { "mode": "automated" },
  "create_media_buy": { "mode": "human" }
}'
```

Modes: `automated` (runs without review), `human` (creates a HITL task for approval), `disabled` (rejects the request).

## HITL Tasks

When a capability is set to `"human"` mode, incoming requests queue as tasks for review.

```bash
# See what needs review
scope3 sf tasks list my-podcast-network --status pending

# Claim a task to work on it (prevents others from claiming)
scope3 sf tasks claim my-podcast-network <taskId>

# Get full task context
scope3 sf tasks get my-podcast-network <taskId>

# Approve
scope3 sf tasks complete my-podcast-network <taskId> \
  --result '{"approved":true}'

# Reject with a correction (automatically creates a correction trace)
scope3 sf tasks complete my-podcast-network <taskId> \
  --result '{"approved":false}' \
  --correction '{"original":{"budget":50000},"corrected":{"budget":10000},"reason":"Exceeds category cap"}'
```

### Task notifications

Get alerted when tasks arrive:

```bash
scope3 sf notifications my-podcast-network --channels '[
  {"type":"slack","destination":"https://hooks.slack.com/services/..."},
  {"type":"email","destination":"ops@mynetwork.com"}
]'
```

Channel types: `webhook`, `slack`, `email`.

## Evals

Test your agent's recommendations before going live or after catalog changes.

```bash
# Run a set of briefs through the agent
scope3 sf evals run my-podcast-network \
  --briefs '[
    {"brief":"Podcast sponsorship for health brand, $10k, Q1"},
    {"brief":"Display ads targeting B2B decision-makers in finance"}
  ]'

# Get results by evalId (returned by the run command)
scope3 sf evals get <evalId>

# Compare two runs — useful before/after a catalog or policy change
scope3 sf evals compare --eval-a <evalId1> --eval-b <evalId2>
```

## Traces and Policy

Traces record how decisions were made. Accumulate enough traces and synthesize them into a policy that guides future recommendations automatically.

```bash
# Review recent decision traces
scope3 sf traces list my-podcast-network
scope3 sf traces list my-podcast-network --capability get_products --limit 50

# Add a policy rule manually
scope3 sf traces add my-podcast-network \
  --trace-type policy \
  --capability get_products \
  --decision '{"rule":"Always recommend audio formats for brand awareness briefs"}' \
  --reasoning "Audio drives higher brand recall in our network"

# Synthesize all traces into an applied policy
scope3 sf synthesize-policy my-podcast-network

# Preview without applying
scope3 sf synthesize-policy my-podcast-network --dry-run
```

Trace types: `recommendation`, `correction`, `outcome`, `policy`, `exception`.

## LLM Provider

Bring your own LLM for product recommendations instead of the Scope3 default.

```bash
scope3 sf llm-provider set my-podcast-network \
  --provider openai \
  --model-id gpt-4o \
  --api-key sk-...

scope3 sf llm-provider get my-podcast-network
```

Providers: `openai`, `anthropic`, `gemini`.

## Inbound Filters

Block certain brief categories before they reach your agent.

```bash
scope3 sf inbound-filters set my-podcast-network --filters '[
  {"type":"category_block","config":{"categories":["gambling","tobacco"]}}
]'

scope3 sf inbound-filters get my-podcast-network
```

## Agent Management

```bash
scope3 sf list                                         # all your agents
scope3 sf get my-podcast-network                       # full agent details
scope3 sf update my-podcast-network --platform-name "New Name"
scope3 sf update my-podcast-network --disabled         # pause
scope3 sf update my-podcast-network --enabled          # resume
scope3 sf delete my-podcast-network                    # remove permanently
scope3 sf audit my-podcast-network                     # config change history
```

## Output Formats

```bash
scope3 sf list --format json    # raw JSON
scope3 sf list --format yaml    # YAML
scope3 sf list                  # default: table
```
