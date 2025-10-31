#!/usr/bin/env ts-node
/**
 * Manual test script for Simple Media Agent
 *
 * This tests the media agent by calling its tools directly (not via MCP)
 *
 * Usage:
 *   SCOPE3_API_KEY=your_key npx ts-node test-media-agent.ts
 */

import { Scope3AgenticClient } from './src/sdk';
import { getProposedTactics } from './src/simple-media-agent/get-proposed-tactics';
import { manageTactic } from './src/simple-media-agent/manage-tactic';

async function testMediaAgent() {
  const apiKey = process.env.SCOPE3_API_KEY;

  if (!apiKey) {
    console.error('Error: SCOPE3_API_KEY environment variable is required');
    process.exit(1);
  }

  const scope3 = new Scope3AgenticClient({
    apiKey,
    baseUrl: 'https://api.agentic.scope3.com',
  });

  console.log('🧪 Testing Simple Media Agent\n');

  // Test 1: Get Proposed Tactics
  console.log('📋 Test 1: get_proposed_tactics');
  console.log('------------------------------------');
  try {
    const proposals = await getProposedTactics(scope3, {
      campaignId: 'test-campaign-123',
      budgetRange: {
        min: 10000,
        max: 50000,
        currency: 'USD',
      },
      seatId: 'test-seat-123',
    });

    console.log('✅ Success!');
    console.log('Proposed Tactics:', JSON.stringify(proposals, null, 2));
    console.log('');

    // Test 2: Manage Tactic
    if (proposals.proposedTactics.length > 0) {
      console.log('📋 Test 2: manage_tactic');
      console.log('------------------------------------');

      const tacticAllocations = new Map();

      try {
        const result = await manageTactic(
          scope3,
          100, // minDailyBudget
          40, // overallocationPercent
          tacticAllocations,
          {
            tacticId: proposals.proposedTactics[0].tacticId,
            tacticContext: {
              budget: 25000, // budget is a number, not an object
            },
            brandAgentId: 'test-brand-agent-123',
            seatId: 'test-seat-123',
          }
        );

        console.log('✅ Success!');
        console.log('Result:', JSON.stringify(result, null, 2));

        if (result.acknowledged) {
          console.log('');
          console.log('📊 Summary:');
          console.log(`- Tactic acknowledged: ${result.acknowledged}`);
          console.log(`- Original budget: $25,000`);
          console.log(`- Overallocation: 40%`);
          console.log(`- Expected total allocated: $35,000`);
        } else {
          console.log(`- Reason: ${result.reason}`);
        }
      } catch (error) {
        console.error('❌ Error:', error);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
    await scope3.disconnect();
    process.exit(1);
  }

  await scope3.disconnect();
}

testMediaAgent()
  .then(() => {
    console.log('\n✅ All tests completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
