"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // Parse skills from comma-separated string to array
    // const skillsArray = data.skills?.split(",").map((skill) => skill.trim()) || [];
    const skillsArray =
      typeof data.skills === "string"
        ? data.skills.split(",").map((s) => s.trim())
        : Array.isArray(data.skills)
          ? data.skills.map((s) => s.trim())
          : [];
    // Check if industry insight exists outside the transaction
    let industryInsight = await db.industryInsight.findUnique({
      where: { industry: data.industry },
    });

    // Generate AI insights outside the transaction to avoid timeout
    if (!industryInsight) {
      const insights = await generateAIInsights(data.industry);

      industryInsight = await db.industryInsight.create({
        data: {
          industry: data.industry,
          ...insights,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // Now update the user (fast DB-only transaction)
    const result = await db.user.update({
      where: { id: user.id },
      data: {
        industry: data.industry,
        experience: parseInt(data.experience) || 0,
        bio: data.bio,
        skills: skillsArray,
      },
    });

    revalidatePath("/");
    return { success: true, user: result };
  } catch (error) {
    console.error("Error updating user and industry:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        industry: true,
      },
    });

    return {
      isOnboarded: !!user?.industry,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}
