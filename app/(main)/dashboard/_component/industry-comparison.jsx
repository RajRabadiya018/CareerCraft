"use client";

import { getComparisonInsights } from "@/actions/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { industries } from "@/data/industries";
import {
    ArrowLeftRight,
    TrendingDown,
    TrendingUp
} from "lucide-react";
import { useState } from "react";
import { BarLoader } from "react-spinners";
import { toast } from "sonner";

export default function IndustryComparison({ currentInsights, currentIndustry }) {
    const [comparisonData, setComparisonData] = useState(null);
    const [selectedIndustry, setSelectedIndustry] = useState("");
    const [loading, setLoading] = useState(false);

    // Build flat list of all industries (parent-sub combined)
    const allIndustries = [];
    industries.forEach((ind) => {
        ind.subIndustries.forEach((sub) => {
            const value = `${ind.name}-${sub}`;
            if (value !== currentIndustry) {
                allIndustries.push({ value, label: `${ind.name} — ${sub}` });
            }
        });
    });

    const handleCompare = async () => {
        if (!selectedIndustry) {
            toast.error("Please select an industry to compare");
            return;
        }

        setLoading(true);
        try {
            const data = await getComparisonInsights(selectedIndustry);
            setComparisonData(data);
        } catch (error) {
            toast.error(error.message || "Failed to load comparison data");
        } finally {
            setLoading(false);
        }
    };

    const getGrowthIndicator = (rate) => {
        if (rate > 10) return { icon: TrendingUp, color: "text-green-500" };
        if (rate > 5) return { icon: TrendingUp, color: "text-yellow-500" };
        return { icon: TrendingDown, color: "text-red-500" };
    };

    const getDemandColor = (level) => {
        switch (level?.toLowerCase()) {
            case "high": return "bg-green-500/20 text-green-500";
            case "medium": return "bg-yellow-500/20 text-yellow-500";
            case "low": return "bg-red-500/20 text-red-500";
            default: return "bg-gray-500/20 text-gray-500";
        }
    };

    const formatIndustryName = (name) => {
        if (!name) return "Unknown";
        const parts = name.split("-");
        return parts.length > 1 ? parts.slice(1).join(" ") : name;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ArrowLeftRight className="h-5 w-5" />
                    Industry Comparison
                </CardTitle>
                <CardDescription>
                    Compare your industry with another to find opportunities
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Selector */}
                <div className="flex gap-3">
                    <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select an industry to compare..." />
                        </SelectTrigger>
                        <SelectContent>
                            {allIndustries.map((ind) => (
                                <SelectItem key={ind.value} value={ind.value}>
                                    {ind.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleCompare} disabled={loading || !selectedIndustry}>
                        {loading ? "Comparing..." : "Compare"}
                    </Button>
                </div>

                {loading && <BarLoader width="100%" color="gray" />}

                {/* Comparison Table */}
                {comparisonData && !loading && (
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="text-left p-3 text-sm font-medium">Metric</th>
                                    <th className="text-center p-3 text-sm font-medium">
                                        {formatIndustryName(currentIndustry)}
                                    </th>
                                    <th className="text-center p-3 text-sm font-medium">
                                        {formatIndustryName(comparisonData.industry)}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Growth Rate */}
                                <tr className="border-b">
                                    <td className="p-3 text-sm">Growth Rate</td>
                                    <td className="p-3 text-center">
                                        <span className="font-bold">{currentInsights.growthRate?.toFixed(1)}%</span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className="font-bold">{comparisonData.growthRate?.toFixed(1)}%</span>
                                    </td>
                                </tr>

                                {/* Market Outlook */}
                                <tr className="border-b">
                                    <td className="p-3 text-sm">Market Outlook</td>
                                    <td className="p-3 text-center">
                                        <Badge variant="secondary">{currentInsights.marketOutlook}</Badge>
                                    </td>
                                    <td className="p-3 text-center">
                                        <Badge variant="secondary">{comparisonData.marketOutlook}</Badge>
                                    </td>
                                </tr>

                                {/* Demand Level */}
                                <tr className="border-b">
                                    <td className="p-3 text-sm">Demand Level</td>
                                    <td className="p-3 text-center">
                                        <Badge className={getDemandColor(currentInsights.demandLevel)}>
                                            {currentInsights.demandLevel}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-center">
                                        <Badge className={getDemandColor(comparisonData.demandLevel)}>
                                            {comparisonData.demandLevel}
                                        </Badge>
                                    </td>
                                </tr>

                                {/* Median Salary (avg of all roles) */}
                                <tr className="border-b">
                                    <td className="p-3 text-sm">Avg Median Salary</td>
                                    <td className="p-3 text-center">
                                        <span className="font-bold">
                                            ${Math.round(
                                                currentInsights.salaryRanges?.reduce((s, r) => s + r.median, 0) /
                                                (currentInsights.salaryRanges?.length || 1) / 1000
                                            )}K
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className="font-bold">
                                            ${Math.round(
                                                comparisonData.salaryRanges?.reduce((s, r) => s + r.median, 0) /
                                                (comparisonData.salaryRanges?.length || 1) / 1000
                                            )}K
                                        </span>
                                    </td>
                                </tr>

                                {/* Top Skills */}
                                <tr>
                                    <td className="p-3 text-sm align-top">Top Skills</td>
                                    <td className="p-3">
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {currentInsights.topSkills?.slice(0, 4).map((s, i) => (
                                                <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {comparisonData.topSkills?.slice(0, 4).map((s, i) => (
                                                <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
