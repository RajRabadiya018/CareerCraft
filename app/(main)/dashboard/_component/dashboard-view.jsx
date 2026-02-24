"use client";

import { refreshIndustryInsights } from "@/actions/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { differenceInDays, format, formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  BarChart3,
  Brain,
  BriefcaseIcon,
  Building2,
  CheckCircle2,
  Clock,
  LineChart,
  RefreshCw,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import JobMarket from "./job-market";
import LearningResources from "./learning-resources";

const DashboardView = ({ insights, userSkills = [], userIndustry }) => {
  const [currentInsights, setCurrentInsights] = useState(insights);
  const [refreshing, setRefreshing] = useState(false);

  // Transform salary data for the chart
  const salaryData = currentInsights.salaryRanges.map((range) => ({
    name: range.role,
    min: range.min / 1000,
    max: range.max / 1000,
    median: range.median / 1000,
  }));

  // Build radar chart data for skills
  const radarData = (() => {
    const recommended = currentInsights.recommendedSkills || [];
    const userSkillsLower = userSkills.map((s) => s.toLowerCase());
    return recommended.slice(0, 8).map((skill) => ({
      skill: skill.length > 15 ? skill.slice(0, 13) + "…" : skill,
      fullSkill: skill,
      yours: userSkillsLower.includes(skill.toLowerCase()) ? 100 : 0,
      recommended: 100,
    }));
  })();

  // Staleness calculation
  const lastUpdated = new Date(currentInsights.lastUpdated);
  const daysSinceUpdate = differenceInDays(new Date(), lastUpdated);
  const getStalenessInfo = () => {
    if (daysSinceUpdate < 7) return { label: "Fresh", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle2 };
    if (daysSinceUpdate < 30) return { label: "Aging", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock };
    return { label: "Stale", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: AlertTriangle };
  };
  const staleness = getStalenessInfo();
  const StalenessIcon = staleness.icon;

  const getDemandLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case "high": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getDemandPercentage = (level) => {
    switch (level.toLowerCase()) {
      case "high": return 90;
      case "medium": return 55;
      case "low": return 25;
      default: return 50;
    }
  };

  const getMarketOutlookInfo = (outlook) => {
    switch (outlook.toLowerCase()) {
      case "positive": return { icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" };
      case "neutral": return { icon: LineChart, color: "text-yellow-400", bg: "bg-yellow-500/10" };
      case "negative": return { icon: TrendingDown, color: "text-red-400", bg: "bg-red-500/10" };
      default: return { icon: LineChart, color: "text-gray-400", bg: "bg-gray-500/10" };
    }
  };

  const outlookInfo = getMarketOutlookInfo(currentInsights.marketOutlook);
  const OutlookIcon = outlookInfo.icon;

  const lastUpdatedDate = format(lastUpdated, "dd MMM yyyy");
  const nextUpdateDistance = formatDistanceToNow(
    new Date(currentInsights.nextUpdate),
    { addSuffix: true }
  );

  // Format industry name for display
  const formatIndustryName = (name) => {
    if (!name) return "Your Industry";
    const parts = name.split("-");
    return parts.length > 1 ? parts.slice(1).join(" ") : name;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const freshData = await refreshIndustryInsights();
      setCurrentInsights(freshData);
      toast.success("Industry insights refreshed successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to refresh insights");
    } finally {
      setRefreshing(false);
    }
  };



  return (
    <div className="space-y-6">
      {/* ═══ Hero Status Bar ═══ */}
      <div className="rounded-xl border bg-card p-4 md:p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left: Industry name + staleness */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">
                {formatIndustryName(userIndustry)}
              </h2>
              <Badge variant="outline" className={`${staleness.color} text-xs`}>
                <StalenessIcon className="h-3 w-3 mr-1" />
                {staleness.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdatedDate} · Next update {nextUpdateDistance}
            </p>
          </div>
          {/* Right: Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh Insights"}
          </Button>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {/* Market Outlook */}
          <div className={`rounded-lg p-3 ${outlookInfo.bg} border border-transparent`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground font-medium">Market Outlook</span>
              <OutlookIcon className={`h-4 w-4 ${outlookInfo.color}`} />
            </div>
            <p className={`text-xl font-bold ${outlookInfo.color}`}>
              {currentInsights.marketOutlook}
            </p>
          </div>

          {/* Growth Rate */}
          <div className="rounded-lg p-3 bg-blue-500/10 border border-transparent">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground font-medium">Growth Rate</span>
              <BarChart3 className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-xl font-bold text-blue-400">
              {currentInsights.growthRate.toFixed(1)}%
            </p>
            <Progress value={Math.min(currentInsights.growthRate, 100)} className="mt-1 h-1.5" />
          </div>

          {/* Demand Level */}
          <div className="rounded-lg p-3 bg-muted/50 border border-transparent">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground font-medium">Demand</span>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xl font-bold">{currentInsights.demandLevel}</p>
            <div className="relative mt-1">
              <div className="h-1.5 w-full rounded-full bg-muted" />
              <div
                className={`absolute top-0 left-0 h-1.5 rounded-full transition-all ${getDemandLevelColor(currentInsights.demandLevel)}`}
                style={{ width: `${getDemandPercentage(currentInsights.demandLevel)}%` }}
              />
            </div>
          </div>

          {/* Avg Salary */}
          <div className="rounded-lg p-3 bg-purple-500/10 border border-transparent">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground font-medium">Avg. Salary</span>
              <BriefcaseIcon className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-xl font-bold text-purple-400">
              ${Math.round(
                currentInsights.salaryRanges?.reduce((s, r) => s + r.median, 0) /
                (currentInsights.salaryRanges?.length || 1) / 1000
              )}K
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Median across {currentInsights.salaryRanges?.length || 0} roles
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Top Skills Bar ═══ */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-4 w-4 text-primary" />
            Top In-Demand Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {currentInsights.topSkills.map((skill) => {
              const userHas = userSkills.some(
                (s) => s.toLowerCase() === skill.toLowerCase()
              );
              return (
                <Badge
                  key={skill}
                  variant={userHas ? "default" : "secondary"}
                  className={userHas ? "bg-green-500/20 text-green-400 border border-green-500/30" : ""}
                >
                  {userHas && "✓ "}{skill}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ═══ Salary Ranges Chart ═══ */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Ranges by Role</CardTitle>
          <CardDescription>
            Displaying minimum, median, and maximum salaries (in thousands)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-2 shadow-md">
                          <p className="font-medium">{label}</p>
                          {payload.map((item) => (
                            <p key={item.name} className="text-sm">
                              {item.name}: ${item.value}K
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="min" fill="#94a3b8" name="Min Salary (K)" />
                <Bar dataKey="median" fill="#64748b" name="Median Salary (K)" />
                <Bar dataKey="max" fill="#475569" name="Max Salary (K)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ═══ Job Market ═══ */}
      <JobMarket jobMarket={currentInsights.jobMarket} />

      {/* ═══ Skills Radar + Trends ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Radar Chart */}
        {radarData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Skills Coverage</CardTitle>
              <CardDescription>
                Your skills vs industry recommended
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                    <PolarRadiusAxis tick={false} domain={[0, 100]} />
                    <Radar
                      name="Recommended"
                      dataKey="recommended"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.15}
                    />
                    <Radar
                      name="Your Skills"
                      dataKey="yours"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.3}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0]?.payload;
                          return (
                            <div className="bg-background border rounded-lg p-2 shadow-md">
                              <p className="font-medium text-sm">{data?.fullSkill}</p>
                              <p className="text-xs text-green-500">
                                {data?.yours > 0 ? "✓ You have this skill" : "✗ Gap — consider learning"}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-indigo-500/40" />
                  <span className="text-muted-foreground">Recommended</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500/40" />
                  <span className="text-muted-foreground">Your Skills</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Industry Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Key Industry Trends</CardTitle>
            <CardDescription>
              Current trends shaping the industry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {currentInsights.keyTrends.map((trend, index) => (
                <li key={index} className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 mt-1 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{index + 1}</span>
                  </div>
                  <span className="text-sm leading-relaxed">{trend}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* ═══ Learning Resources ═══ */}
      <LearningResources resources={currentInsights.learningResources} />

      {/* ═══ Top Companies ═══ */}
      {currentInsights.topCompanies?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Top Companies in Your Industry
            </CardTitle>
            <CardDescription>Leading companies hiring in this space</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentInsights.topCompanies.map((company, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{company.name}</p>
                      <Badge variant="outline" className="text-[10px] mt-0.5">
                        {company.industry}
                      </Badge>
                    </div>
                  </div>
                  {company.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {company.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══ Recommended Skills ═══ */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Skills to Develop</CardTitle>
          <CardDescription>
            Skills you should consider learning — green indicates you already have them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {currentInsights.recommendedSkills.map((skill) => {
              const userHasSkill = userSkills.some(
                (s) => s.toLowerCase() === skill.toLowerCase()
              );
              return (
                <Badge
                  key={skill}
                  variant={userHasSkill ? "default" : "outline"}
                  className={userHasSkill
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "hover:bg-muted/80"
                  }
                >
                  {userHasSkill && "✓ "}
                  {skill}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardView;
