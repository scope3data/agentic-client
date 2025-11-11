import { PlatformClient } from '../src';

async function main() {
  const client = new PlatformClient({
    apiKey: process.env.SCOPE3_API_KEY || 'your-api-key',
  });

  try {
    console.log('Listing brand agents...');
    const brandAgents = await client.brandAgents.list();
    console.log('Brand agents:', brandAgents);

    console.log('\nListing channels...');
    const channels = await client.channels.list();
    console.log('Channels:', channels);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
