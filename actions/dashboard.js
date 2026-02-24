"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const generateAIInsights = async (industry) => {
  const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"],
            "learningResources": [
              { "name": "string", "type": "Course" | "Certification" | "Book" | "Platform", "url": "string (real working URL)", "description": "string (1 sentence)" }
            ],
            "topCompanies": [
              { "name": "string", "industry": "string (specific sector)", "description": "string (1 sentence about why they're notable)" }
            ],
            "jobMarket": {
              "openPositions": "string (estimated range like '50,000-100,000')",
              "remotePercentage": number,
              "topLocations": ["city1", "city2", "city3", "city4", "city5"],
              "averageExperience": "string (e.g. '3-5 years')"
            }
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
          Include at least 5 learning resources with real URLs.
          Include at least 5 top companies.
          Include at least 5 top locations for job market.
        `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

  return JSON.parse(cleanedText);
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Step 1: Quick DB lookup (connection closes immediately)
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { industry: true },
  });

  if (!user) throw new Error("User not found");

  // Step 2: Check if insights already exist
  const existingInsight = await db.industryInsight.findUnique({
    where: { industry: user.industry },
  });

  if (existingInsight) return existingInsight;

  // Step 3: Generate from AI (slow — runs outside any DB transaction)
  const insights = await generateAIInsights(user.industry);

  // Step 4: Save to DB (separate, fast operation)
  const industryInsight = await db.industryInsight.create({
    data: {
      industry: user.industry,
      ...insights,
      nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return industryInsight;
}

export async function refreshIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");
  if (!user.industry) throw new Error("No industry set");

  // Generate fresh insights from AI
  const insights = await generateAIInsights(user.industry);

  let industryInsight;

  if (user.industryInsight) {
    // Update existing
    industryInsight = await db.industryInsight.update({
      where: { industry: user.industry },
      data: {
        ...insights,
        lastUpdated: new Date(),
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  } else {
    // Create new
    industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  revalidatePath("/dashboard");
  return industryInsight;
}
