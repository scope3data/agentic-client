import { acceptProposal } from '../accept-proposal';
import type { AcceptProposalRequest, CampaignContext } from '../types';
import { Scope3AgenticClient } from '../../sdk';

describe('acceptProposal', () => {
  let mockScope3: Scope3AgenticClient;

  beforeEach(() => {
    mockScope3 = new Scope3AgenticClient({
      apiKey: 'test-api-key',
    });
  });

  describe('successful acceptance', () => {
    it('should accept valid proposal assignments', async () => {
      const campaignContext: CampaignContext = {
        budget: 50000,
        budgetCurrency: 'USD',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-03-31T23:59:59Z',
        channel: 'display',
        countries: ['US', 'CA'],
      };

      const request: AcceptProposalRequest = {
        tacticId: 'tactic-123',
        proposalId: 'prop-456',
        campaignContext,
        brandAgentId: 'brand-789',
        seatId: 'seat-012',
      };

      const result = await acceptProposal(mockScope3, request);

      expect(result.acknowledged).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should accept proposals with creatives', async () => {
      const campaignContext: CampaignContext = {
        budget: 50000,
        budgetCurrency: 'USD',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-03-31T23:59:59Z',
        channel: 'video',
        creatives: [
          {
            creativeId: 'creative-001',
            assetUrl: 'https://example.com/video.mp4',
            format: 'video/mp4',
            dimensions: {
              width: 1920,
              height: 1080,
            },
          },
        ],
      };

      const request: AcceptProposalRequest = {
        tacticId: 'tactic-123',
        campaignContext,
        brandAgentId: 'brand-789',
        seatId: 'seat-012',
      };

      const result = await acceptProposal(mockScope3, request);

      expect(result.acknowledged).toBe(true);
    });

    it('should accept proposals with brand standards', async () => {
      const campaignContext: CampaignContext = {
        budget: 50000,
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-03-31T23:59:59Z',
        channel: 'display',
        brandStandards: [
          {
            type: 'viewability',
            value: 0.7,
          },
          {
            type: 'brand_safety',
            value: 'strict',
          },
        ],
      };

      const request: AcceptProposalRequest = {
        tacticId: 'tactic-123',
        campaignContext,
        brandAgentId: 'brand-789',
        seatId: 'seat-012',
      };

      const result = await acceptProposal(mockScope3, request);

      expect(result.acknowledged).toBe(true);
    });

    it('should accept proposals with custom fields', async () => {
      const campaignContext: CampaignContext = {
        budget: 50000,
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-03-31T23:59:59Z',
        channel: 'audio',
      };

      const request: AcceptProposalRequest = {
        tacticId: 'tactic-123',
        campaignContext,
        brandAgentId: 'brand-789',
        seatId: 'seat-012',
        customFields: {
          targetAudience: 'millennials',
          preferredDayparts: ['morning', 'evening'],
          customTargeting: {
            interests: ['sports', 'technology'],
          },
        },
      };

      const result = await acceptProposal(mockScope3, request);

      expect(result.acknowledged).toBe(true);
    });

    it('should accept proposals with additional_info', async () => {
      const campaignContext: CampaignContext = {
        budget: 50000,
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-03-31T23:59:59Z',
        channel: 'connected_tv',
      };

      const request: AcceptProposalRequest = {
        tacticId: 'tactic-123',
        proposalId: 'prop-456',
        campaignContext,
        brandAgentId: 'brand-789',
        seatId: 'seat-012',
        additional_info: {
          products: [
            {
              product_ref: 'prod-001',
              sales_agent_url: 'https://sales-agent.example.com',
              pricing_option_id: 'pricing-001',
            },
          ],
        },
      };

      const result = await acceptProposal(mockScope3, request);

      expect(result.acknowledged).toBe(true);
    });

    it('should accept proposals for all channel types', async () => {
      const channels: Array<'display' | 'video' | 'native' | 'audio' | 'connected_tv'> = [
        'display',
        'video',
        'native',
        'audio',
        'connected_tv',
      ];

      for (const channel of channels) {
        const campaignContext: CampaignContext = {
          budget: 25000,
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-12-31T23:59:59Z',
          channel,
        };

        const request: AcceptProposalRequest = {
          tacticId: `tactic-${channel}`,
          campaignContext,
          brandAgentId: 'brand-789',
          seatId: 'seat-012',
        };

        const result = await acceptProposal(mockScope3, request);

        expect(result.acknowledged).toBe(true);
      }
    });
  });

  describe('validation and rejection', () => {
    it('should reject when tacticId is missing', async () => {
      const campaignContext: CampaignContext = {
        budget: 50000,
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-03-31T23:59:59Z',
        channel: 'display',
      };

      const request: AcceptProposalRequest = {
        tacticId: '', // Empty tacticId
        campaignContext,
        brandAgentId: 'brand-789',
        seatId: 'seat-012',
      };

      const result = await acceptProposal(mockScope3, request);

      expect(result.acknowledged).toBe(false);
      expect(result.reason).toBeDefined();
      expect(result.reason).toContain('Missing required fields');
    });

    it('should reject when budget is zero', async () => {
      const campaignContext: CampaignContext = {
        budget: 0, // Invalid budget
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-03-31T23:59:59Z',
        channel: 'display',
      };

      const request: AcceptProposalRequest = {
        tacticId: 'tactic-123',
        campaignContext,
        brandAgentId: 'brand-789',
        seatId: 'seat-012',
      };

      const result = await acceptProposal(mockScope3, request);

      expect(result.acknowledged).toBe(false);
      expect(result.reason).toBeDefined();
      expect(result.reason).toContain('Budget must be greater than 0');
    });

    it('should reject when budget is negative', async () => {
      const campaignContext: CampaignContext = {
        budget: -1000, // Negative budget
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-03-31T23:59:59Z',
        channel: 'video',
      };

      const request: AcceptProposalRequest = {
        tacticId: 'tactic-123',
        campaignContext,
        brandAgentId: 'brand-789',
        seatId: 'seat-012',
      };

      const result = await acceptProposal(mockScope3, request);

      expect(result.acknowledged).toBe(false);
      expect(result.reason).toBeDefined();
      expect(result.reason).toContain('Budget must be greater than 0');
    });
  });

  describe('optional fields', () => {
    it('should accept proposals without proposalId', async () => {
      const campaignContext: CampaignContext = {
        budget: 50000,
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-03-31T23:59:59Z',
        channel: 'display',
      };

      const request: AcceptProposalRequest = {
        tacticId: 'tactic-123',
        // proposalId is optional
        campaignContext,
        brandAgentId: 'brand-789',
        seatId: 'seat-012',
      };

      const result = await acceptProposal(mockScope3, request);

      expect(result.acknowledged).toBe(true);
    });

    it('should accept proposals without budgetCurrency (defaults to USD)', async () => {
      const campaignContext: CampaignContext = {
        budget: 50000,
        // budgetCurrency is optional
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-03-31T23:59:59Z',
        channel: 'display',
      };

      const request: AcceptProposalRequest = {
        tacticId: 'tactic-123',
        campaignContext,
        brandAgentId: 'brand-789',
        seatId: 'seat-012',
      };

      const result = await acceptProposal(mockScope3, request);

      expect(result.acknowledged).toBe(true);
    });

    it('should accept proposals without countries', async () => {
      const campaignContext: CampaignContext = {
        budget: 50000,
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-03-31T23:59:59Z',
        channel: 'native',
        // countries is optional
      };

      const request: AcceptProposalRequest = {
        tacticId: 'tactic-123',
        campaignContext,
        brandAgentId: 'brand-789',
        seatId: 'seat-012',
      };

      const result = await acceptProposal(mockScope3, request);

      expect(result.acknowledged).toBe(true);
    });

    it('should accept proposals without creatives', async () => {
      const campaignContext: CampaignContext = {
        budget: 50000,
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-03-31T23:59:59Z',
        channel: 'display',
        // creatives is optional
      };

      const request: AcceptProposalRequest = {
        tacticId: 'tactic-123',
        campaignContext,
        brandAgentId: 'brand-789',
        seatId: 'seat-012',
      };

      const result = await acceptProposal(mockScope3, request);

      expect(result.acknowledged).toBe(true);
    });

    it('should accept proposals without brand standards', async () => {
      const campaignContext: CampaignContext = {
        budget: 50000,
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-03-31T23:59:59Z',
        channel: 'video',
        // brandStandards is optional
      };

      const request: AcceptProposalRequest = {
        tacticId: 'tactic-123',
        campaignContext,
        brandAgentId: 'brand-789',
        seatId: 'seat-012',
      };

      const result = await acceptProposal(mockScope3, request);

      expect(result.acknowledged).toBe(true);
    });
  });

  describe('various budget scenarios', () => {
    it('should accept small budgets', async () => {
      const campaignContext: CampaignContext = {
        budget: 100, // Small budget
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
        channel: 'display',
      };

      const request: AcceptProposalRequest = {
        tacticId: 'tactic-123',
        campaignContext,
        brandAgentId: 'brand-789',
        seatId: 'seat-012',
      };

      const result = await acceptProposal(mockScope3, request);

      expect(result.acknowledged).toBe(true);
    });

    it('should accept large budgets', async () => {
      const campaignContext: CampaignContext = {
        budget: 10000000, // Large budget
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
        channel: 'video',
      };

      const request: AcceptProposalRequest = {
        tacticId: 'tactic-123',
        campaignContext,
        brandAgentId: 'brand-789',
        seatId: 'seat-012',
      };

      const result = await acceptProposal(mockScope3, request);

      expect(result.acknowledged).toBe(true);
    });

    it('should accept decimal budgets', async () => {
      const campaignContext: CampaignContext = {
        budget: 1234.56, // Decimal budget
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
        channel: 'native',
      };

      const request: AcceptProposalRequest = {
        tacticId: 'tactic-123',
        campaignContext,
        brandAgentId: 'brand-789',
        seatId: 'seat-012',
      };

      const result = await acceptProposal(mockScope3, request);

      expect(result.acknowledged).toBe(true);
    });
  });
});
