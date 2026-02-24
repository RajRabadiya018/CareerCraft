import { getIndustryInsights } from "@/actions/dashboard";
import { getUserOnboardingStatus } from "@/actions/user";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardView from "./_component/dashboard-view";

export default async function DashboardPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const insights = await getIndustryInsights();

  // Get user skills & industry for the radar chart and comparison
  const { userId } = await auth();
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { skills: true, industry: true },
  });

  return (
    <div className="container mx-auto">
      <DashboardView
        insights={insights}
        userSkills={user?.skills || []}
        userIndustry={user?.industry || ""}
      />
    </div>
  );
}
