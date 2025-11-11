import { PlatformClient } from '../src';

async function main() {
  const client = new PlatformClient({
    apiKey: process.env.SCOPE3_API_KEY || 'your-api-key',
  });

  try {
    console.log('Creating campaign...');
    const campaign = await client.campaigns.create({
      prompt: 'Create a video campaign targeting tech enthusiasts with $50k budget',
      name: 'Tech Enthusiasts Video Campaign',
      budget: {
        amount: 5000000,
        currency: 'USD',
        pacing: 'even',
      },
      status: 'ACTIVE',
    });

    console.log('Campaign created:', campaign);

    if (campaign.success && campaign.data) {
      const campaignId = campaign.data.id;

      console.log('\nGetting campaign summary...');
      const summary = await client.campaigns.getSummary({ campaignId });
      console.log('Campaign summary:', summary);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
