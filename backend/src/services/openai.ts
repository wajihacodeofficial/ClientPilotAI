/**
 * AI Service — Gemini 2.5 Flash
 *
 * All functions return a typed Result<T> instead of T | null so callers
 * can surface specific error messages rather than swallowing failures.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// ─── Constants ────────────────────────────────────────────────────────────────

const GEMINI_MODEL = 'gemini-2.5-flash';

// ─── API Key validation ────────────────────────────────────────────────────────

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('[AI] ❌ CRITICAL: GEMINI_API_KEY is not set. All AI operations will fail.');
} else if (!apiKey.startsWith('AIza')) {
  console.warn(
    `[AI] ⚠️  WARNING: GEMINI_API_KEY does not match expected format (AIzaSy...). ` +
    `Current value starts with "${apiKey.slice(0, 6)}...". Requests may fail with 401.`
  );
} else {
  console.log(`[AI] ✅ GEMINI_API_KEY loaded (starts with ${apiKey.slice(0, 8)}...). Model: ${GEMINI_MODEL}`);
}

const genAI = new GoogleGenerativeAI(apiKey ?? '');

// ─── Result type ──────────────────────────────────────────────────────────────

export type AIResult<T> =
  | { success: true; data: T; latencyMs: number; model: string }
  | { success: false; error: string; latencyMs: number; model: string };

// ─── Schemas ──────────────────────────────────────────────────────────────────

const ScoreSchema = z.object({
  overall_score: z.number().min(0).max(100),
  digital_presence_gap: z.number().min(0).max(10),
  category_fit: z.number().min(0).max(10),
  review_activity: z.number().min(0).max(10),
  market_density: z.number().min(0).max(10),
  competitor_presence: z.number().min(0).max(10),
  ai_reasoning: z.string(),
});

export type ScoreOutput = z.infer<typeof ScoreSchema>;

const OutreachResponseSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
  follow_up: z.string(),
  whatsapp_body: z.string(),
});

export interface OutreachOutput {
  subject: string;
  body: string;
  follow_up: string;
  whatsapp_body: string;
}

const ProposalResponseSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

// ─── Shared helper ────────────────────────────────────────────────────────────

async function callGemini<T>(
  label: string,
  systemInstruction: string,
  userPrompt: string,
  schema: z.ZodSchema<T>
): Promise<AIResult<T>> {
  const startMs = Date.now();

  if (!apiKey) {
    return {
      success: false,
      error: 'GEMINI_API_KEY is not configured on this server.',
      latencyMs: 0,
      model: GEMINI_MODEL,
    };
  }

  console.log(`[AI:${label}] → Sending request to Gemini (model: ${GEMINI_MODEL})`);

  try {
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: { responseMimeType: 'application/json' },
      systemInstruction,
    });

    const response = await model.generateContent(userPrompt);
    const latencyMs = Date.now() - startMs;

    const rawText = response.response.text();

    if (!rawText || rawText.trim() === '') {
      console.error(`[AI:${label}] ❌ Empty response from Gemini (${latencyMs}ms)`);
      return {
        success: false,
        error: 'Gemini returned an empty response.',
        latencyMs,
        model: GEMINI_MODEL,
      };
    }

    console.log(`[AI:${label}] ← Response received (${latencyMs}ms, ${rawText.length} chars). Parsing...`);

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch (jsonErr) {
      console.error(`[AI:${label}] ❌ JSON parse failed. Raw (first 200 chars): ${rawText.slice(0, 200)}`);
      return {
        success: false,
        error: `Failed to parse AI response as JSON: ${jsonErr instanceof Error ? jsonErr.message : String(jsonErr)}`,
        latencyMs,
        model: GEMINI_MODEL,
      };
    }

    const validated = schema.safeParse(parsed);
    if (!validated.success) {
      const issues = validated.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      console.error(`[AI:${label}] ❌ Schema validation failed: ${issues}`);
      return {
        success: false,
        error: `AI response failed schema validation: ${issues}`,
        latencyMs,
        model: GEMINI_MODEL,
      };
    }

    console.log(`[AI:${label}] ✅ Success (${latencyMs}ms)`);
    return { success: true, data: validated.data, latencyMs, model: GEMINI_MODEL };

  } catch (err: unknown) {
    const latencyMs = Date.now() - startMs;
    const message = err instanceof Error ? err.message : String(err);

    // Surface specific API errors (auth, quota, network)
    let userFacingError = `Gemini API error: ${message}`;
    if (message.includes('API_KEY_INVALID') || message.includes('401')) {
      userFacingError = 'Gemini API key is invalid or expired. Check GEMINI_API_KEY in your server environment.';
    } else if (message.includes('QUOTA_EXCEEDED') || message.includes('429')) {
      userFacingError = 'Gemini API quota exceeded. Please check your Google AI Studio billing.';
    } else if (message.includes('ENOTFOUND') || message.includes('ECONNREFUSED')) {
      userFacingError = 'Cannot reach Gemini API — check server network/DNS.';
    }

    console.error(`[AI:${label}] ❌ Request failed (${latencyMs}ms): ${message}`);
    return { success: false, error: userFacingError, latencyMs, model: GEMINI_MODEL };
  }
}

// ─── Public API functions ──────────────────────────────────────────────────────

export const scoreLead = async (
  businessName: string,
  category: string,
  address: string,
  hasWebsite: boolean
): Promise<ScoreOutput | null> => {
  const result = await callGemini(
    'ScoreLead',
    'You are a lead scoring AI. Output JSON only matching the schema: {"overall_score": 0-100, "digital_presence_gap": 0-10, "category_fit": 0-10, "review_activity": 0-10, "market_density": 0-10, "competitor_presence": 0-10, "ai_reasoning": "..."}',
    `You are an expert AI lead scoring system for a software development agency. Evaluate this business as a potential client for web development, digital transformation, or automation services.

Business Name: ${businessName}
Category: ${category}
Address: ${address}
Has Website: ${hasWebsite ? 'Yes' : 'No'}

Score the lead based on their likely need for our services. Businesses without websites or with a clear need for digital presence should score higher. Provide a detailed structured JSON response.`,
    ScoreSchema
  );

  if (!result.success) {
    console.error(`[AI:ScoreLead] Failed for "${businessName}": ${result.error}`);
    return null;
  }
  return result.data;
};

export const generateOutreach = async (
  businessName: string,
  category: string,
  scoreReasoning: string
): Promise<OutreachOutput | null> => {
  const result = await callGemini(
    'Outreach',
    'You are an expert sales copywriter. Output JSON only: {"subject": "...", "body": "...", "follow_up": "...", "whatsapp_body": "..."}',
    `Write a personalized, professional, and concise cold outreach package to this business owner offering our software/web development services.
    
Business Name: ${businessName}
Category: ${category}
Why they are a good lead: ${scoreReasoning}

The outreach should be friendly, not overly salesy, and highlight the specific value we could bring based on the reasoning provided.

For this business, generate:
1. An email subject line (subject).
2. A professional email message body (body).
3. A short follow-up email (follow_up).
4. A quick WhatsApp message variant — short, casual, action-oriented (whatsapp_body).

Return JSON: {"subject": "...", "body": "...", "follow_up": "...", "whatsapp_body": "..."}`,
    OutreachResponseSchema
  );

  if (!result.success) {
    console.error(`[AI:Outreach] Failed for "${businessName}": ${result.error}`);
    return null;
  }
  return result.data;
};

export const generateProposal = async (
  businessName: string,
  category: string,
  address: string,
  phone?: string,
  websiteUrl?: string,
  aiAnalysis?: string,
  rawOsmTags?: Record<string, unknown>
): Promise<{ title: string; content: string } | null> => {
  const result = await callGemini(
    'Proposal',
    'You are a professional business consultant and sales copywriter. Output JSON only: {"title": "...", "content": "..."}',
    `You are a professional AI consultant at a software development agency called "ClientPilot AI". Write a detailed, personalized web/digital services proposal for the following business:
    
Business Details:
- Name: ${businessName}
- Category: ${category}
- Address: ${address}
${phone ? `- Phone: ${phone}` : ''}
${websiteUrl ? `- Website: ${websiteUrl}` : '- Website: None detected (Major digital presence gap!)'}
${aiAnalysis ? `- AI Analysis: ${aiAnalysis}` : ''}
${rawOsmTags && Object.keys(rawOsmTags).length > 0 ? `- Additional data: ${JSON.stringify(rawOsmTags)}` : ''}

Create a CUSTOMIZED proposal — do NOT use a generic template. Tailor the solution to the business type:
- Restaurant/cafe → online menus, reservation systems, Google Maps optimization
- Salon/clinic → online appointment booking
- Retail → e-commerce, inventory management
- No website → focus on building first modern web presence
- Outdated site → mobile-first redesign

Output a JSON object with:
- "title": A compelling, specific proposal title (e.g. "Digital Transformation Proposal for Al Madina Bakery")
- "content": The proposal in clean markdown format with EXACTLY these sections:
  # Executive Summary
  # Current Opportunity & Pain Points
  # Recommended Digital Solution
  # Proposed Services & Deliverables
  # Expected Outcomes & Benefits
  # Next Steps

Return JSON: {"title": "...", "content": "..."}`,
    ProposalResponseSchema
  );

  if (!result.success) {
    console.error(`[AI:Proposal] Failed for "${businessName}": ${result.error}`);
    return null;
  }
  return result.data;
};

/**
 * Quick connectivity test — used by /api/ai/test endpoint.
 * Sends a minimal prompt and returns the raw result with diagnostics.
 */
export const testAiConnection = async (): Promise<AIResult<{ message: string }>> => {
  return callGemini(
    'ConnectivityTest',
    'You are a helpful assistant. Always respond with valid JSON.',
    'Generate a 2-sentence friendly business greeting for a software agency called ClientPilot AI. Return JSON: {"message": "..."}',
    z.object({ message: z.string().min(1) })
  );
};
