import { PlatformClient } from './platform-client';

/**
 * Legacy client for backwards compatibility
 * @deprecated Use PlatformClient or PartnerClient instead
 *
 * This client extends PlatformClient and provides the same functionality.
 * It is kept for backwards compatibility with existing code.
 */
export class Scope3AgenticClient extends PlatformClient {
  // No additional implementation needed - inherits everything from PlatformClient
}
