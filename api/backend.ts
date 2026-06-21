import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { app } = await import('../backend/src/app');
    return app(req, res);
  } catch (error: any) {
    console.error('Serverless Function Initialization Error:', error);
    res.status(500).json({ error: String(error), stack: error?.stack });
  }
}
