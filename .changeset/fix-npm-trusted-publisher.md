---
"scope3": patch
---

Fix npm Trusted Publisher authentication by removing conflicting NPM_TOKEN

The release workflow was failing because it had both OIDC Trusted Publishing configured (id-token: write) and the legacy NPM_TOKEN environment variable. This caused npm authentication to fail. Removed NPM_TOKEN to use only Trusted Publishing for secure, token-free npm publishing.
