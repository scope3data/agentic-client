---
"@scope3/agentic-client": patch
---

Fix changeset check workflow to exempt release PRs

Release PRs created by changesets/action are now properly exempted from the changeset requirement check, preventing false failures in CI.
