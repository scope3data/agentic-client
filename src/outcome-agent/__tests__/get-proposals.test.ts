import { getProposals } from '../get-proposals';
import type { GetProposalsRequest, Product } from '../types';
import { Scope3AgenticClient } from '../../sdk';

describe('getProposals', () => {
  let mockScope3: Scope3AgenticClient;

  beforeEach(() => {
    mockScope3 = new Scope3AgenticClient({
      apiKey: 'test-api-key',
    });
  });

  describe('when no products are provided', () => {
    it('should return empty proposals array', async () => {
      const request: GetProposalsRequest = {
        campaignId: 'camp-123',
        seatId: 'seat-456',
      };

      const result = await getProposals(mockScope3, request);

      expect(result.proposals).toEqual([]);
    });

    it('should return empty proposals when products array is empty', async () => {
      const request: GetProposalsRequest = {
        campaignId: 'camp-123',
        seatId: 'seat-456',
        products: [],
      };

      const result = await getProposals(mockScope3, request);

      expect(result.proposals).toEqual([]);
    });
  });

  describe('when products are provided', () => {
    const mockProducts: Product[] = [
      {
        sales_agent_url: 'https://sales-agent-1.example.com',
        product_ref: 'prod-display-001',
        pricing_option_id: 'pricing-001',
        floor_price: 2.5,
        floor_price_currency: 'USD',
        name: 'Premium Display Ads',
        targeting: {
          channels: ['display'],
          countries: ['US', 'CA'],
        },
      },
      {
        sales_agent_url: 'https://sales-agent-2.example.com',
        product_ref: 'prod-video-001',
        pricing_option_id: 'pricing-002',
        floor_price: 5.0,
        floor_price_currency: 'USD',
        name: 'Video Ads',
        targeting: {
          channels: ['video'],
          countries: ['US', 'GB'],
        },
      },
    ];

    it('should generate proposals for eligible products', async () => {
      const request: GetProposalsRequest = {
        campaignId: 'camp-123',
        seatId: 'seat-456',
        products: mockProducts,
        budgetRange: {
          min: 10000,
          max: 50000,
          currency: 'USD',
        },
      };

      const result = await getProposals(mockScope3, request);

      expect(result.proposals.length).toBeGreaterThan(0);
    });

    it('should include correct proposal structure', async () => {
      const request: GetProposalsRequest = {
        campaignId: 'camp-123',
        seatId: 'seat-456',
        products: mockProducts,
        budgetRange: {
          min: 10000,
          max: 50000,
          currency: 'USD',
        },
      };

      const result = await getProposals(mockScope3, request);
      const proposal = result.proposals[0];

      expect(proposal).toHaveProperty('proposalId');
      expect(proposal).toHaveProperty('execution');
      expect(proposal).toHaveProperty('budgetCapacity');
      expect(proposal).toHaveProperty('pricing');
      expect(proposal).toHaveProperty('sku');
      expect(proposal).toHaveProperty('additional_info');
    });

    it('should use revshare pricing method with 15% rate', async () => {
      const request: GetProposalsRequest = {
        campaignId: 'camp-123',
        seatId: 'seat-456',
        products: mockProducts,
        budgetRange: {
          max: 50000,
          currency: 'USD',
        },
      };

      const result = await getProposals(mockScope3, request);
      const proposal = result.proposals[0];

      expect(proposal.pricing.method).toBe('revshare');
      expect(proposal.pricing.rate).toBe(0.15);
      expect(proposal.pricing.currency).toBe('USD');
    });

    it('should group products by channel', async () => {
      const request: GetProposalsRequest = {
        campaignId: 'camp-123',
        seatId: 'seat-456',
        products: mockProducts,
        budgetRange: {
          max: 50000,
        },
      };

      const result = await getProposals(mockScope3, request);

      // Should have proposals for display and video channels
      expect(result.proposals.length).toBe(2);

      const channelsInProposals = result.proposals.map((p) => p.additional_info?.channel);
      expect(channelsInProposals).toContain('display');
      expect(channelsInProposals).toContain('video');
    });

    it('should include product references in additional_info', async () => {
      const request: GetProposalsRequest = {
        campaignId: 'camp-123',
        seatId: 'seat-456',
        products: [mockProducts[0]],
        budgetRange: {
          max: 50000,
        },
      };

      const result = await getProposals(mockScope3, request);
      const proposal = result.proposals[0];

      expect(proposal.additional_info).toHaveProperty('products');
      expect(Array.isArray(proposal.additional_info?.products)).toBe(true);
      expect(proposal.additional_info?.products).toHaveLength(1);

      const products = proposal.additional_info?.products as Array<{
        product_ref: string;
        sales_agent_url: string;
        pricing_option_id: string;
      }>;

      expect(products[0]).toEqual({
        product_ref: 'prod-display-001',
        sales_agent_url: 'https://sales-agent-1.example.com',
        pricing_option_id: 'pricing-001',
      });
    });
  });

  describe('product filtering', () => {
    it('should filter products by channels', async () => {
      const products: Product[] = [
        {
          sales_agent_url: 'https://sales-agent-1.example.com',
          product_ref: 'prod-display-001',
          pricing_option_id: 'pricing-001',
          targeting: {
            channels: ['display'],
          },
        },
        {
          sales_agent_url: 'https://sales-agent-2.example.com',
          product_ref: 'prod-video-001',
          pricing_option_id: 'pricing-002',
          targeting: {
            channels: ['video'],
          },
        },
      ];

      const request: GetProposalsRequest = {
        campaignId: 'camp-123',
        seatId: 'seat-456',
        products,
        channels: ['display'],
        budgetRange: {
          max: 50000,
        },
      };

      const result = await getProposals(mockScope3, request);

      // Should only have display channel proposal
      expect(result.proposals.length).toBe(1);
      expect(result.proposals[0].additional_info?.channel).toBe('display');
    });

    it('should filter products by countries', async () => {
      const products: Product[] = [
        {
          sales_agent_url: 'https://sales-agent-1.example.com',
          product_ref: 'prod-us-001',
          pricing_option_id: 'pricing-001',
          targeting: {
            channels: ['display'],
            countries: ['US'],
          },
        },
        {
          sales_agent_url: 'https://sales-agent-2.example.com',
          product_ref: 'prod-uk-001',
          pricing_option_id: 'pricing-002',
          targeting: {
            channels: ['display'],
            countries: ['GB'],
          },
        },
      ];

      const request: GetProposalsRequest = {
        campaignId: 'camp-123',
        seatId: 'seat-456',
        products,
        countries: ['US'],
        budgetRange: {
          max: 50000,
        },
      };

      const result = await getProposals(mockScope3, request);

      // Should only have US product
      expect(result.proposals.length).toBe(1);
      expect(result.proposals[0].additional_info?.productCount).toBe(1);
    });

    it('should filter out products with floor prices > 10% of max budget', async () => {
      const products: Product[] = [
        {
          sales_agent_url: 'https://sales-agent-1.example.com',
          product_ref: 'prod-cheap-001',
          pricing_option_id: 'pricing-001',
          floor_price: 100, // Within budget
          targeting: {
            channels: ['display'],
          },
        },
        {
          sales_agent_url: 'https://sales-agent-2.example.com',
          product_ref: 'prod-expensive-001',
          pricing_option_id: 'pricing-002',
          floor_price: 10000, // 100% of budget - too high
          targeting: {
            channels: ['display'],
          },
        },
      ];

      const request: GetProposalsRequest = {
        campaignId: 'camp-123',
        seatId: 'seat-456',
        products,
        budgetRange: {
          max: 10000,
        },
      };

      const result = await getProposals(mockScope3, request);

      // Should only have the cheap product
      expect(result.proposals[0].additional_info?.productCount).toBe(1);
    });

    it('should return empty proposals when no products match filters', async () => {
      const products: Product[] = [
        {
          sales_agent_url: 'https://sales-agent-1.example.com',
          product_ref: 'prod-video-001',
          pricing_option_id: 'pricing-001',
          targeting: {
            channels: ['video'],
          },
        },
      ];

      const request: GetProposalsRequest = {
        campaignId: 'camp-123',
        seatId: 'seat-456',
        products,
        channels: ['display'], // Requesting display, but only video available
        budgetRange: {
          max: 50000,
        },
      };

      const result = await getProposals(mockScope3, request);

      expect(result.proposals).toEqual([]);
    });
  });

  describe('budget capacity calculation', () => {
    it('should use budget range max as capacity when provided', async () => {
      const products: Product[] = [
        {
          sales_agent_url: 'https://sales-agent-1.example.com',
          product_ref: 'prod-001',
          pricing_option_id: 'pricing-001',
          floor_price: 2.5,
          targeting: {
            channels: ['display'],
          },
        },
      ];

      const request: GetProposalsRequest = {
        campaignId: 'camp-123',
        seatId: 'seat-456',
        products,
        budgetRange: {
          min: 10000,
          max: 75000,
          currency: 'USD',
        },
      };

      const result = await getProposals(mockScope3, request);

      expect(result.proposals[0].budgetCapacity).toBe(75000);
    });

    it('should estimate capacity from floor prices when no budget range', async () => {
      const products: Product[] = [
        {
          sales_agent_url: 'https://sales-agent-1.example.com',
          product_ref: 'prod-001',
          pricing_option_id: 'pricing-001',
          floor_price: 100,
          targeting: {
            channels: ['display'],
          },
        },
      ];

      const request: GetProposalsRequest = {
        campaignId: 'camp-123',
        seatId: 'seat-456',
        products,
      };

      const result = await getProposals(mockScope3, request);

      // Capacity should be 100x floor price = 10000
      expect(result.proposals[0].budgetCapacity).toBe(10000);
    });
  });

  describe('proposal ID generation', () => {
    it('should generate unique proposal IDs', async () => {
      const products: Product[] = [
        {
          sales_agent_url: 'https://sales-agent-1.example.com',
          product_ref: 'prod-display-001',
          pricing_option_id: 'pricing-001',
          targeting: { channels: ['display'] },
        },
        {
          sales_agent_url: 'https://sales-agent-2.example.com',
          product_ref: 'prod-video-001',
          pricing_option_id: 'pricing-002',
          targeting: { channels: ['video'] },
        },
      ];

      const request: GetProposalsRequest = {
        campaignId: 'camp-123',
        seatId: 'seat-456',
        products,
        budgetRange: { max: 50000 },
      };

      const result = await getProposals(mockScope3, request);

      const proposalIds = result.proposals.map((p) => p.proposalId);
      const uniqueIds = new Set(proposalIds);

      expect(proposalIds.length).toBe(uniqueIds.size);
    });

    it('should include campaign ID in proposal ID', async () => {
      const products: Product[] = [
        {
          sales_agent_url: 'https://sales-agent-1.example.com',
          product_ref: 'prod-001',
          pricing_option_id: 'pricing-001',
          targeting: { channels: ['display'] },
        },
      ];

      const request: GetProposalsRequest = {
        campaignId: 'camp-123',
        seatId: 'seat-456',
        products,
        budgetRange: { max: 50000 },
      };

      const result = await getProposals(mockScope3, request);

      expect(result.proposals[0].proposalId).toContain('camp-123');
    });
  });
});
