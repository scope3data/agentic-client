---
'scope3': major
---

Sync SDK with current OpenAPI specification. Removes stale storefront-only and deprecated resources (agents, billing/storefront, inventory-sources, notifications, readiness, bundles, signals, sales-agents, conversion-events, creative-sets). Adds all missing buyer endpoints (discovery, accounts, planning-briefs, moderation, storefronts, audit-logs, notification-preferences). Replaces typed campaign creation methods with generic create/update/delete. Fixes schema generation regex escaping bug.
