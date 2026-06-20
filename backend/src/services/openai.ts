import OpenAI from 'openai';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  console.warn('[Warning] Missing OPENAI_API_KEY in environment variables. AI operations will fail.');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-openai-key',
});

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

export const scoreLead = async (
  businessName: string,
  category: string,
  address: string,
  hasWebsite: boolean
): Promise<ScoreOutput | null> => {
  try {
    const prompt = `You are an expert AI lead scoring system for a software development agency. Evaluate this business as a potential client for web development, digital transformation, or automation services.

Business Name: ${businessName}
Category: ${category}
Address: ${address}
Has Website: ${hasWebsite ? 'Yes' : 'No'}

Score the lead based on their likely need for our services. Businesses without websites or with a clear need for digital presence should score higher. Provide a detailed structured JSON response.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-5.5',
      messages: [
        { role: 'system', content: 'You are a lead scoring AI. Output JSON only matching the schema: {"overall_score": 0-100, "digital_presence_gap": 0-10, "category_fit": 0-10, "review_activity": 0-10, "market_density": 0-10, "competitor_presence": 0-10, "ai_reasoning": "..."}' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return ScoreSchema.parse(parsed);
  } catch (error) {
    console.error('OpenAI Scoring Error:', error);
    return null;
  }
};

export const generateOutreach = async (
  businessName: string,
  category: string,
  scoreReasoning: string
): Promise<{ subject: string; body: string } | null> => {
  try {
    const prompt = `Write a personalized, professional, and concise cold outreach email to this business owner offering our software/web development services.

Business Name: ${businessName}
Category: ${category}
Why they are a good lead: ${scoreReasoning}

The email should be friendly, not overly salesy, and highlight the specific value we could bring based on the reasoning provided. Return the result as a JSON object with 'subject' and 'body' fields.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-5.5',
      messages: [
        { role: 'system', content: 'You are an expert sales copywriter. Output JSON only: {"subject": "...", "body": "..."}' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) return null;
    
    return JSON.parse(content) as { subject: string; body: string };
  } catch (error) {
    console.error('OpenAI Outreach Generation Error:', error);
    return null;
  }
};
