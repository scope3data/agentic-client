import { Scope3Client } from '../src';

async function main() {
  const client = new Scope3Client({
    apiKey: process.env.SCOPE3_API_KEY || 'your-api-key',
    persona: 'buyer',
  });

  try {
    console.log('Listing advertisers...');
    const advertisers = await client.advertisers.list();
    console.log('Advertisers:', advertisers);

    console.log('\nDiscovering signals...');
    const signals = await client.signals.discover();
    console.log('Signals:', signals);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
