---
"@scope3/agentic-client": major
---

Add unified agents API and remove salesAgents

BREAKING CHANGE: Removed `salesAgents` resource. Use `agents` resource instead with type filtering.

- Add unified agents resource supporting both SALES and OUTCOME agent types
- Remove deprecated salesAgents resource
- Add JWT authentication support
- Update simple-media-agent to use new agents API
- Update documentation to use 'Agent' instead of 'Sales Agent'
- Add publishConfig for npm publishing
- Update schemas from merged outcomes-agent-registration branch

Migration guide:
- Replace `client.salesAgents.list()` with `client.agents.list({ type: 'SALES' })`
- Replace `client.salesAgents.get()` with `client.agents.get()`
- Replace `client.salesAgents.register()` with `client.agents.register({ type: 'SALES', ... })`
