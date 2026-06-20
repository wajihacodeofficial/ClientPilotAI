import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('[Warning] Missing GEMINI_API_KEY in environment variables. Gemini operations will fail.');
}

const genAI = new GoogleGenerativeAI(apiKey || 'placeholder-gemini-key');

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

Score the lead based on their likely need for our services. Businesses without websites or with a clear need for digital presence should score higher. Provide a detailed structured JSON response.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
      systemInstruction: 'You are a lead scoring AI. Output JSON only matching the schema: {"overall_score": 0-100, "digital_presence_gap": 0-10, "category_fit": 0-10, "review_activity": 0-10, "market_density": 0-10, "competitor_presence": 0-10, "ai_reasoning": "..."}'
    });

    const response = await model.generateContent(prompt);
    const content = response.response.text();
    if (!content) return null;

    const parsed = JSON.parse(content);
    return ScoreSchema.parse(parsed);
  } catch (error) {
    console.error('Gemini Scoring Error:', error);
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

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
      systemInstruction: 'You are an expert sales copywriter. Output JSON only: {"subject": "...", "body": "..."}'
    });

    const response = await model.generateContent(prompt);
    const content = response.response.text();
    if (!content) return null;

    return JSON.parse(content) as { subject: string; body: string };
  } catch (error) {
    console.error('Gemini Outreach Generation Error:', error);
    return null;
  }
};
