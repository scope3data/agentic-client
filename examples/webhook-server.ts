import { WebhookServer } from '../src';

async function main() {
  const webhookServer = new WebhookServer({
    port: 3000,
    path: '/webhooks',
    secret: process.env.WEBHOOK_SECRET,
  });

  webhookServer.on('campaign.created', async (event) => {
    console.log('Campaign created:', event);
  });

  webhookServer.on('campaign.updated', async (event) => {
    console.log('Campaign updated:', event);
  });

  webhookServer.on('media_buy.executed', async (event) => {
    console.log('Media buy executed:', event);
  });

  webhookServer.on('*', async (event) => {
    console.log('Received webhook:', event.type);
  });

  await webhookServer.start();
  console.log(`Webhook server running at ${webhookServer.getUrl()}`);
  console.log('Press Ctrl+C to stop');

  process.on('SIGINT', async () => {
    console.log('\nShutting down webhook server...');
    await webhookServer.stop();
    process.exit(0);
  });
}

main();
