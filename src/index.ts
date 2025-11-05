export { Scope3AgenticClient } from './sdk';
// Legacy export for backwards compatibility
export { Scope3AgenticClient as Scope3SDK } from './sdk';
export { WebhookServer } from './webhook-server';
export { SimpleMediaAgent } from './simple-media-agent';
export type { ClientConfig, ToolResponse, Environment } from './types';
export type { WebhookEvent, WebhookHandler, WebhookServerConfig } from './webhook-server';

export * from './resources/agents';
export * from './resources/assets';
export * from './resources/brand-agents';
export * from './resources/brand-standards';
export * from './resources/brand-stories';
export * from './resources/campaigns';
export * from './resources/channels';
export * from './resources/creatives';
export * from './resources/tactics';
export * from './resources/media-buys';
export * from './resources/notifications';
export * from './resources/products';
