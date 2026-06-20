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

const ProposalResponseSchema = z.object({
  title: z.string(),
  content: z.string(),
});

export const generateProposal = async (
  businessName: string,
  category: string,
  address: string,
  phone?: string,
  websiteUrl?: string,
  aiAnalysis?: string,
  rawOsmTags?: Record<string, unknown>
): Promise<{ title: string; content: string } | null> => {
  try {
    const prompt = `You are a professional AI consultant at a software development agency called "ClientPilot AI" (representing Acme Software Agency). Write a detailed, personalized web/digital services proposal for the following business:
    
Business Details:
- Name: ${businessName}
- Category: ${category}
- Address: ${address}
${phone ? `- Phone: ${phone}` : ''}
${websiteUrl ? `- Website: ${websiteUrl}` : '- Website: None detected (Major digital presence gap!)'}
${aiAnalysis ? `- Analysis: ${aiAnalysis}` : ''}
${rawOsmTags ? `- Raw details: ${JSON.stringify(rawOsmTags)}` : ''}

Create a customized proposal. Do NOT use a generic, static template. If the business is a restaurant, focus on online menus, reservation systems, and Google Maps Optimization. If it's a salon or clinic, focus on online appointment booking systems. If it's retail, focus on e-commerce. If it has no website, focus on building their first modern web presence. If it has an outdated site, focus on modern mobile-first redesign.

Output MUST be a JSON object with two fields:
- "title": A compelling, specific proposal title (e.g. "Digital Transformation Proposal for Al Madina Bakery").
- "content": The proposal content written in clean, professional markdown format, including sections like:
  - Executive Summary
  - Digital Presence Review (identifying gaps)
  - Tailored Solution Proposal (specific features like booking, WhatsApp, menu, etc.)
  - Scope of Work & Milestones
  - About Our Agency (Acme Software Agency)
  - Call to Action / Next Steps

Return the result as a JSON object matching this schema: {"title": "...", "content": "..."}`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
      systemInstruction: 'You are a professional business consultant and sales copywriter. Output JSON only: {"title": "...", "content": "..."}'
    });

    const response = await model.generateContent(prompt);
    const content = response.response.text();
    if (!content) return null;

    const parsed = JSON.parse(content);
    return ProposalResponseSchema.parse(parsed);
  } catch (error) {
    console.error('Gemini Proposal Generation Error:', error);
    return null;
  }
};

