---
name: scope3-storefront
description: Create and manage advertising agents that process ad briefs via MCP and recommend products from your catalog. Use for agent setup, product template uploads, inventory/audience/account/resale config, billing, testing, evals, traces, policy synthesis, and HITL task management.
license: MIT
metadata:
  author: Scope3
  version: "2.0.0"
---

# Scope3 Storefront

The Scope3 storefront puts your ad inventory on the Scope3 marketplace as an AI agent. Buyers send ad briefs; your agent recommends products and creates media buys. You control what runs automatically and what needs human review.

All management is done via the `scope3 sf` CLI (alias: `scope3 storefront`).

For JSON flags, you can pass inline JSON or `@path/to/file.json`.

## Authentication

```bash
scope3 login        # browser OAuth — opens a browser window, saves token
scope3 logout       # clear saved credentials
```

Once logged in, all `scope3 sf` commands use your saved session automatically.

## Quick Start

```bash
# 1. Create your storefront
scope3 sf storefronts create \
  --platform-id my-podcast-network \
  --platform-name "My Podcast Network" \
  --publisher-domain mypodcasts.com

# 2. Select it as default (optional if you only have one storefront)
scope3 sf storefronts use my-podcast-network

# 3. Upload your product catalog
scope3 sf catalog upload my-podcast-network --file catalog.csv --type csv

# 4. Test recommendations with eval briefs
scope3 sf testing evals run my-podcast-network \
  --briefs '[{"brief":"Podcast sponsorship for a health brand, $10k budget, Q1"}]'

# 5. Your storefront is now live — buyers connect at /{platformId}/mcp

# 6. Run diagnostics
scope3 sf diagnostics doctor my-podcast-network
```

## Internal Agents

Use `sf agents list` as the canonical view of internal agents for your storefront, including both hosted agents and externally connected agents.

```bash
# List hosted + connected external agents
scope3 sf agents list my-podcast-network

# Create hosted internal agent (currently supported: sales)
scope3 sf agents create my-podcast-network --hosting hosted --agent-type sales

# Include underlying source payloads for debugging
scope3 sf agents list my-podcast-network --raw

# Create/connect an external agent (example: signals agent on inventory source)
scope3 sf agents create my-podcast-network \
  --source inventory \
  --id signals-agent \
  --name "Signals Agent" \
  --agent-url https://signals.example.com/mcp \
  --agent-type signals \
  --channels display,video

# Disconnect an external agent connection
scope3 sf agents disconnect my-podcast-network --source inventory --id signals-agent
```

## Product Templates

Templates are your sellable products. Upload them as CSV or JSON.

```bash
# Replace all templates (default)
scope3 sf catalog upload my-podcast-network --file catalog.csv --type csv

# Append without replacing existing templates
scope3 sf catalog upload my-podcast-network --file new-products.csv --type csv --append

# JSON format
scope3 sf catalog upload my-podcast-network --file catalog.json --type json

# Review upload history
scope3 sf catalog file-uploads my-podcast-network
```

CSV columns: `name`, `description`, `pricingModel`, `floorPrice` (plus optional `channels`, `targetingFields`).

## Inventory Sources

Inventory sources define where your supply comes from — ad servers, podcast networks, other agents. Each source has an execution model: `agent` (another MCP agent fulfills), `storefront` (another storefront by ID), `queue` (async), or `manual` (human fulfills).

```bash
scope3 sf agents inventory-sources set my-podcast-network --inventory-sources '[
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

scope3 sf agents inventory-sources get my-podcast-network
```

## Audience Sources

Connect identity and targeting partners. Each audience source maps to the inventory sources it can activate on. Execution supports `agent` or `static`.

```bash
scope3 sf agents audience-sources set my-podcast-network --audience-sources '[
  {
    "id": "liveramp",
    "name": "LiveRamp Identity",
    "activatesOn": ["gam-display"],
    "execution": { "type": "agent", "agentUrl": "https://liveramp.example.com" }
  }
]'
```

## Account Sources

Connect your CRM so the agent can resolve advertiser accounts and detect returning buyers. Execution supports `agent` or `static`.

```bash
scope3 sf agents account-sources set my-podcast-network --account-sources '[
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
scope3 sf agents rate-cards set my-podcast-network --rate-cards '[
  {
    "id": "standard-2026",
    "name": "2026 Standard Rates",
    "rules": [
      { "match": { "channel": "display" }, "pricing": { "type": "cpm", "amount": 12, "currency": "USD" } },
      { "match": { "channel": "audio" }, "pricing": { "type": "cpm", "amount": 20, "currency": "USD" } }
    ]
  }
]'

scope3 sf agents rate-cards get my-podcast-network
```

Pricing types: `cpm`, `flat`, `custom`.

## Proposal Templates

Proposal templates package one or more products into reusable offers with default pricing.

```bash
scope3 sf agents proposal-templates set my-podcast-network --proposal-templates '[
  {
    "id": "starter-pack",
    "name": "Starter Package",
    "description": "Entry-level package for first-time advertisers",
    "lineItems": [{ "templateId": "homepage-banner" }],
    "price": { "amount": 2500, "currency": "USD", "model": "flat_total" }
  }
]'

scope3 sf agents proposal-templates get my-podcast-network
```

## Capabilities

Control which operations run automatically vs. require human approval vs. are disabled.

```bash
scope3 sf agents capabilities get my-podcast-network

scope3 sf agents capabilities set my-podcast-network --capabilities '{
  "get_products": { "mode": "automated" },
  "create_media_buy": { "mode": "human" }
}'
```

Modes: `automated` (runs without review), `human` (creates a HITL task for approval), `disabled` (rejects the request).

## HITL Tasks

When a capability is set to `"human"` mode, incoming requests queue as tasks for review.

```bash
# See what needs review
scope3 sf agents tasks list my-podcast-network --status pending

# Claim a task to work on it (prevents others from claiming)
scope3 sf agents tasks claim <taskId> my-podcast-network

# Get full task context
scope3 sf agents tasks get <taskId> my-podcast-network

# Approve
scope3 sf agents tasks complete <taskId> my-podcast-network \
  --result '{"approved":true}'

# Reject with a correction (automatically creates a correction trace)
scope3 sf agents tasks complete <taskId> my-podcast-network \
  --result '{"approved":false}' \
  --correction '{"original":{"budget":50000},"corrected":{"budget":10000},"reason":"Exceeds category cap"}'
```

### Task notifications

Get alerted when tasks arrive:

```bash
scope3 sf agents notifications my-podcast-network --channels '[
  {"type":"slack","destination":"https://hooks.slack.com/services/..."},
  {"type":"email","destination":"ops@mynetwork.com"}
]'
```

Channel types: `webhook`, `slack`, `email`.

## Evals

Test your agent's recommendations before going live or after catalog changes.

```bash
# Run a set of briefs through the agent
scope3 sf testing evals run my-podcast-network \
  --briefs '[
    {"brief":"Podcast sponsorship for health brand, $10k, Q1"},
    {"brief":"Display ads targeting B2B decision-makers in finance"}
  ]'

# Get results by evalId (returned by the run command)
scope3 sf testing evals get <evalId>

# Compare two runs — useful before/after a catalog or policy change
scope3 sf testing evals compare --eval-a <evalId1> --eval-b <evalId2>
```

## Traces and Policy

Traces record how decisions were made. Accumulate enough traces and synthesize them into a policy that guides future recommendations automatically.

```bash
# Review recent decision traces
scope3 sf agents traces list my-podcast-network
scope3 sf agents traces list my-podcast-network --capability get_products --limit 50

# Add a policy rule manually
scope3 sf agents traces add my-podcast-network \
  --trace-type policy \
  --capability get_products \
  --decision '{"rule":"Always recommend audio formats for brand awareness briefs"}' \
  --reasoning "Audio drives higher brand recall in our network"

# Synthesize all traces into an applied policy
scope3 sf agents synthesize-policy my-podcast-network

# Preview without applying
scope3 sf agents synthesize-policy my-podcast-network --dry-run
```

Trace types: `recommendation`, `correction`, `outcome`, `policy`, `exception`.

## LLM Provider

Bring your own LLM for product recommendations instead of the Scope3 default.

```bash
scope3 sf agents llm-provider set my-podcast-network \
  --provider openai \
  --model-id gpt-4o \
  --api-key sk-...

scope3 sf agents llm-provider get my-podcast-network
```

Providers: `openai`, `anthropic`, `gemini`.

## Inbound Filters

Block certain brief categories before they reach your agent.

```bash
scope3 sf agents inbound-filters set my-podcast-network --filters '[
  {"type":"category_block","config":{"categories":["gambling","tobacco"]}}
]'

scope3 sf agents inbound-filters get my-podcast-network
```

## Diagnostics

Use diagnostics to quickly check if your storefront is configured and operating correctly.

```bash
scope3 sf diagnostics readiness my-podcast-network   # setup checklist + blockers
scope3 sf diagnostics coverage my-podcast-network    # capability coverage by source
scope3 sf diagnostics health my-podcast-network      # operational stats
scope3 sf diagnostics doctor my-podcast-network      # combined readiness/coverage/health/billing
```

## Billing (Stripe Connect)

Provision and manage Stripe Connect for seller payouts.

```bash
scope3 sf billing connect my-podcast-network         # create Stripe Express account
scope3 sf billing onboard my-podcast-network         # refresh onboarding URL
scope3 sf billing get my-podcast-network             # billing config
scope3 sf billing status my-podcast-network          # charges/payouts status + balance
scope3 sf billing transactions my-podcast-network --limit 25
scope3 sf billing payouts my-podcast-network --limit 25
```

## Resale Program

Control whether other storefronts can resell your inventory and under what access policy.

```bash
scope3 sf resale-program get my-podcast-network

scope3 sf resale-program set my-podcast-network --resale-program '{
  "enabled": true,
  "accessPolicy": "approval_required",
  "defaultTier": "wholesale"
}'
```

## Hosted Sales Agent

Provision a Scope3-hosted sales agent tenant and retrieve MCP/A2A endpoint details.

```bash
scope3 sf hosted-sales-agent provision my-podcast-network
scope3 sf hosted-sales-agent get my-podcast-network
```

## Testing and Sessions

```bash
# Provision/fetch sandbox account
scope3 sf testing sandbox my-podcast-network --advertiser-name "Sandbox Advertiser"

# Run test buyer suite
scope3 sf testing test my-podcast-network --max-briefs 10 --scenarios '["baseline"]'

# Inspect historical test runs
scope3 sf testing test-runs list my-podcast-network --limit 20
scope3 sf testing test-runs get <testRunId>

# Retrieve tool-call session thread
scope3 sf testing sessions --session-id <sessionId> --storefront-id my-podcast-network
```

## Storefront Management

```bash
scope3 sf storefronts list                                         # all your storefronts
scope3 sf storefronts get my-podcast-network                       # full storefront details
scope3 sf storefronts update my-podcast-network --platform-name "New Name"
scope3 sf storefronts update my-podcast-network --disabled         # pause
scope3 sf storefronts update my-podcast-network --enabled          # resume
scope3 sf storefronts delete my-podcast-network                    # remove permanently
scope3 sf diagnostics audit my-podcast-network                     # config change history
```

## Output Formats

```bash
scope3 sf storefronts list --format json    # raw JSON
scope3 sf storefronts list --format yaml    # YAML
scope3 sf storefronts list                  # default: table
```
