---
"scope3": major
---

BREAKING CHANGE: Remove legacy Scope3AgenticClient

The legacy `Scope3AgenticClient` class has been completely removed. Users must now explicitly choose between:

- `PlatformClient` - for brand advertisers/buyers managing campaigns and creatives
- `PartnerClient` - for DSPs/publishers/partners managing media buys and products

**Migration Guide:**

```typescript
// Before:
import { Scope3AgenticClient } from 'scope3';
const client = new Scope3AgenticClient({ apiKey: '...' });

// After (for brand advertisers):
import { PlatformClient } from 'scope3';
const client = new PlatformClient({ apiKey: '...' });

// After (for media partners):
import { PartnerClient } from 'scope3';
const client = new PartnerClient({ apiKey: '...' });
```

Both clients have the same configuration options and provide access to the appropriate API resources for their use case.
