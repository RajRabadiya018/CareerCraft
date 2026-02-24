import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { inngest } from "./client";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights" },
  { cron: "0 0 * * 0" },
  async ({ event, step }) => {
    const industries = await step.run("Fetch industries", async () => {
      return await db.industryInsight.findMany({
        select: { industry: true },
      });
    });

    for (const { industry } of industries) {
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
        `;

      const res = await step.ai.wrap(
        "gemini",
        async (p) => {
          return await model.generateContent(p);
        },
        prompt
      );

      const text = res.response.candidates[0].content.parts[0].text || "";
      const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

      const insights = JSON.parse(cleanedText);

      await step.run(`Update ${industry} insights`, async () => {
        await db.industryInsight.update({
          where: { industry },
          data: {
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      });
    }
  }
);
