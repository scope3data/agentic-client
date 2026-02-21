---
"scope3": minor
---

Add `storefront` persona for the Scope3 Agentic Storefront API (`/api/v1`). Storefront requests route to `/api/v1/{path}` (no persona segment in the URL), and `getSkill()` fetches from `/api/v1/skill.md`. A bundled fallback skill is included for offline use.

Also ships a `skills/` directory in the npm package following the Agent Skills open standard (agentskills.io). Each skill lives in its own subdirectory (`skills/scope3-buyer/SKILL.md`, `skills/scope3-partner/SKILL.md`, `skills/scope3-storefront/SKILL.md`) with standard YAML frontmatter. The `package.json` `agents` field lists all three skills for tool discovery.
