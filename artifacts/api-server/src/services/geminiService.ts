// Gemini AI service for generating career explanations
// Uses user's own GEMINI_API_KEY

import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

export interface CareerAIExplanation {
  explanation: string;
  roadmap: string;
  skills: string;
  encouragement: string;
}

const FALLBACK: CareerAIExplanation = {
  explanation:
    "This is a rewarding career that offers many opportunities for growth and impact in Nigeria and beyond. It combines academic knowledge with practical skills to solve real-world problems.",
  roadmap:
    "1. Complete secondary school with strong grades in relevant subjects.\n2. Pass JAMB and gain admission to a Nigerian university.\n3. Complete your undergraduate degree (4-5 years).\n4. Pursue professional certifications and internships.\n5. Build experience and advance in your chosen specialty.",
  skills:
    "Strong academic foundation, critical thinking, communication skills, dedication, and a passion for continuous learning.",
  encouragement:
    "You have what it takes to succeed! Many great Nigerian professionals started right where you are today. Stay focused, work hard, and never stop believing in your potential. Nigeria needs talented people like you!",
};

export async function generateCareerExplanation(
  careerName: string,
  studentName: string
): Promise<CareerAIExplanation> {
  const ai = getClient();

  if (!ai) {
    return FALLBACK;
  }

  const prompt = `You are a friendly and encouraging career guidance counselor for Nigerian secondary school students. 
  
A student named ${studentName} has been recommended the career path: "${careerName}".

Please provide the following in a warm, simple, and encouraging tone that a Nigerian secondary school student (aged 14-18) can easily understand:

1. EXPLANATION: A simple 2-3 sentence explanation of what this career involves and why it is valuable in Nigeria.
2. ROADMAP: A step-by-step career roadmap with 5-6 clear steps from secondary school to becoming a professional in this field in Nigeria.
3. SKILLS: List 4-5 key skills this student needs to develop for this career.
4. ENCOURAGEMENT: A short, personal, and motivating message for ${studentName} specifically about pursuing this career in Nigeria.

Format your response as JSON with keys: explanation, roadmap, skills, encouragement.
Keep language simple — avoid technical jargon. Make it feel personal and Nigerian.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    const text = response.text ?? "";
    const parsed = JSON.parse(text);

    return {
      explanation: parsed.explanation || FALLBACK.explanation,
      roadmap: parsed.roadmap || FALLBACK.roadmap,
      skills: parsed.skills || FALLBACK.skills,
      encouragement: parsed.encouragement || FALLBACK.encouragement,
    };
  } catch {
    return FALLBACK;
  }
}
