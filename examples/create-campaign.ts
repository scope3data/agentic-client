import { Scope3Client } from '../src';

async function main() {
  const client = new Scope3Client({
    apiKey: process.env.SCOPE3_API_KEY || 'your-api-key',
    persona: 'buyer',
  });

  try {
    // Step 1: Create a bundle for inventory discovery
    console.log('Creating bundle...');
    const bundle = await client.bundles.create({
      advertiserId: 'adv-123',
      channels: ['display', 'video'],
      countries: ['US'],
      brief: 'Tech enthusiasts campaign',
      budget: 50000,
    });
    console.log('Bundle created:', bundle);

    const bundleId = bundle.data.bundleId;

    // Step 2: Discover available products
    console.log('\nDiscovering products...');
    const products = await client.bundles.discoverProducts(bundleId);
    console.log(`Found ${products.data.summary.totalProducts} products`);

    // Step 3: Add products to bundle
    if (products.data.productGroups.length > 0) {
      const firstGroup = products.data.productGroups[0];
      const firstProduct = firstGroup.products[0];

      console.log('\nAdding product to bundle...');
      await client.bundles.products(bundleId).add({
        products: [
          {
            productId: firstProduct.productId,
            salesAgentId: firstProduct.salesAgentId,
            groupId: firstGroup.groupId,
            groupName: firstGroup.groupName,
          },
        ],
      });
    }

    // Step 4: Create campaign from bundle
    console.log('\nCreating campaign...');
    const campaign = await client.campaigns.createBundle({
      advertiserId: 'adv-123',
      bundleId,
      name: 'Tech Enthusiasts Video Campaign',
      flightDates: {
        startDate: '2025-02-01',
        endDate: '2025-03-31',
      },
      budget: {
        total: 50000,
        currency: 'USD',
        pacing: 'EVEN',
      },
    });
    console.log('Campaign created:', campaign);

    // Step 5: Execute campaign
    console.log('\nExecuting campaign...');
    const executedCampaign = await client.campaigns.execute(campaign.data.id);
    console.log('Campaign executed:', executedCampaign);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
