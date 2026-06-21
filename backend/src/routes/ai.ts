/**
 * /api/ai — AI diagnostics routes
 *
 * GET /api/ai/test   — Standalone Gemini connectivity test (no auth required)
 * GET /api/ai/config — Returns AI configuration status (auth required in app.ts)
 */

import { Router } from 'express';
import { testAiConnection } from '../services/openai';

const router = Router();

// GET /api/ai/test
// Sends a lightweight test prompt to Gemini and reports results.
// Does NOT require authentication — useful for curl/Postman testing.
router.get('/test', async (_req, res) => {
  const startMs = Date.now();
  console.log('[AI:TestEndpoint] Starting Gemini connectivity test...');

  const apiKey = process.env.GEMINI_API_KEY;

  // Config sanity check before hitting the API
  const configStatus = {
    key_present: !!apiKey,
    key_format_valid: apiKey ? apiKey.startsWith('AIza') : false,
    key_preview: apiKey ? `${apiKey.slice(0, 8)}...` : null,
    model: 'gemini-2.5-flash',
  };

  if (!configStatus.key_present) {
    return res.status(503).json({
      success: false,
      error: 'GEMINI_API_KEY is not set in server environment variables.',
      config: configStatus,
      latencyMs: Date.now() - startMs,
    });
  }

  if (!configStatus.key_format_valid) {
    return res.status(503).json({
      success: false,
      error: `GEMINI_API_KEY format is invalid. Expected format: AIzaSy... — got: ${configStatus.key_preview}. Please regenerate your key at https://aistudio.google.com/app/apikey`,
      config: configStatus,
      latencyMs: Date.now() - startMs,
    });
  }

  const result = await testAiConnection();

  const totalMs = Date.now() - startMs;

  if (result.success) {
    console.log(`[AI:TestEndpoint] ✅ Gemini is reachable (${totalMs}ms)`);
    return res.status(200).json({
      success: true,
      message: result.data.message,
      model: result.model,
      latencyMs: result.latencyMs,
      totalMs,
      config: configStatus,
    });
  } else {
    console.error(`[AI:TestEndpoint] ❌ Gemini test failed (${totalMs}ms): ${result.error}`);
    return res.status(503).json({
      success: false,
      error: result.error,
      model: result.model,
      latencyMs: result.latencyMs,
      totalMs,
      config: configStatus,
    });
  }
});

export default router;
