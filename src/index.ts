// New auto-generated clients
export { PlatformClient } from './platform-client';
export { PartnerClient } from './partner-client';

// Legacy export for backwards compatibility (maps to PlatformClient)
export { Scope3AgenticClient } from './sdk';
export { Scope3AgenticClient as Scope3SDK } from './sdk';

// Standalone services
export { WebhookServer } from './webhook-server';

// Types
export type { ClientConfig, ToolResponse, Environment } from './types';
export type { WebhookEvent, WebhookHandler, WebhookServerConfig } from './webhook-server';
