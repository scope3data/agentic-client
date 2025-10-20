import express from 'express';
import type { Request, Response } from 'express';

/**
 * Example: Simple Media Agent Implementation
 *
 * This demonstrates a basic media agent that implements the Media Agent Protocol.
 * In production, you would add your optimization logic, data analysis, etc.
 */

const app = express();
app.use(express.json());

// POST /get-proposed-tactics
app.post('/get-proposed-tactics', (req: Request, res: Response) => {
  const { budgetRange } = req.body;

  // In production, analyze the campaign and propose tactics
  const proposedTactics = [
    {
      tacticId: 'premium-display-tactic',
      execution: 'Target premium display inventory with 85% viewability',
      budgetCapacity: budgetRange?.max ? budgetRange.max * 0.5 : 50000,
      pricing: {
        method: 'revshare',
        rate: 0.15,
        currency: 'USD',
      },
      sku: 'premium-display',
      customFieldsRequired: [
        {
          fieldName: 'targetVCPM',
          fieldType: 'number',
          description: 'Target viewable CPM in USD',
        },
      ],
    },
  ];

  res.json({ proposedTactics });
});

// POST /manage-tactic
app.post('/manage-tactic', (req: Request, res: Response) => {
  const { tacticId, tacticContext, customFields } = req.body;

  console.log(`Managing tactic ${tacticId}`, { tacticContext, customFields });

  // In production, set up targeting, create media buys, etc.

  res.json({
    acknowledged: true,
  });
});

// POST /tactic-context-updated
app.post('/tactic-context-updated', (req: Request, res: Response) => {
  const { tacticId, patch } = req.body;

  console.log(`Tactic ${tacticId} updated:`, patch);

  // In production, adjust media buys based on changes

  res.json({ acknowledged: true });
});

// POST /tactic-creatives-updated
app.post('/tactic-creatives-updated', (req: Request, res: Response) => {
  const { tacticId, patch } = req.body;

  console.log(`Creatives for tactic ${tacticId} updated:`, patch);

  // In production, update media buys with new creatives

  res.json({ acknowledged: true });
});

// POST /tactic-feedback
app.post('/tactic-feedback', (req: Request, res: Response) => {
  const { tacticId, deliveryIndex, performanceIndex } = req.body;

  console.log(`Feedback for tactic ${tacticId}:`, {
    deliveryIndex,
    performanceIndex,
  });

  // In production, optimize based on feedback

  res.json({ acknowledged: true });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Simple media agent listening on port ${PORT}`);
});
