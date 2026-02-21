---
"scope3": minor
---

Add `publisher` persona for the Scope3 Agentic Storefront API (`/api/v1`). Publisher requests route to `/api/v1/{path}` (no persona segment in the URL), and `getSkill()` fetches from `/api/v1/skill.md`. A bundled fallback skill is included for offline use.

Also ships a `skills/` directory in the npm package containing `buyer.md`, `partner.md`, and `publisher.md` — plain markdown files that can be loaded directly by Claude Code, coworker, or any tool that supports skill plugins.
