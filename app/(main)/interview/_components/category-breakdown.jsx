"use client";

import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

const CATEGORY_COLORS = {
    Technical: "#6366f1",
    Behavioral: "#f59e0b",
    Situational: "#10b981",
};

export default function CategoryBreakdown({ assessments }) {
    const [categoryData, setCategoryData] = useState([]);
    const [strongest, setStrongest] = useState(null);
    const [weakest, setWeakest] = useState(null);
    const [improvementPct, setImprovementPct] = useState(null);

    useEffect(() => {
        if (!assessments?.length) return;

        // Group by category
        const categoryMap = {};
        assessments.forEach((a) => {
            const cat = a.category || "Technical";
            if (!categoryMap[cat]) {
                categoryMap[cat] = { scores: [], count: 0 };
            }
            categoryMap[cat].scores.push(a.quizScore);
            categoryMap[cat].count++;
        });

        // Build chart data
        const data = Object.entries(categoryMap).map(([name, info]) => ({
            name,
            value: info.count,
            avgScore: (
                info.scores.reduce((a, b) => a + b, 0) / info.scores.length
            ).toFixed(1),
        }));

        setCategoryData(data);

        // Find strongest & weakest
        if (data.length > 0) {
            const sorted = [...data].sort(
                (a, b) => parseFloat(b.avgScore) - parseFloat(a.avgScore)
            );
            setStrongest(sorted[0]);
            if (sorted.length > 1) {
                setWeakest(sorted[sorted.length - 1]);
            }
        }

        // Calculate improvement % (first quiz vs latest quiz)
        if (assessments.length >= 2) {
            const firstScore = assessments[0].quizScore;
            const latestScore = assessments[assessments.length - 1].quizScore;
            const pct = ((latestScore - firstScore) / Math.max(firstScore, 1)) * 100;
            setImprovementPct(pct.toFixed(1));
        }
    }, [assessments]);

    if (!assessments?.length) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Distribution Pie Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="gradient-title text-3xl md:text-4xl">
                        Category Distribution
                    </CardTitle>
                    <CardDescription>
                        Quiz attempts by category
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={CATEGORY_COLORS[entry.name] || COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload?.length) {
                                            return (
                                                <div className="bg-background border rounded-lg p-2 shadow-md">
                                                    <p className="font-medium">{payload[0].payload.name}</p>
                                                    <p className="text-sm">Quizzes: {payload[0].value}</p>
                                                    <p className="text-sm">Avg Score: {payload[0].payload.avgScore}%</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Strongest / Weakest / Improvement */}
            <Card>
                <CardHeader>
                    <CardTitle className="gradient-title text-3xl md:text-4xl">
                        Performance Insights
                    </CardTitle>
                    <CardDescription>
                        Your strengths and areas for improvement
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {strongest && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                            <div>
                                <p className="text-sm text-muted-foreground">Strongest Category</p>
                                <p className="text-lg font-bold text-green-500">{strongest.name}</p>
                            </div>
                            <Badge variant="secondary" className="bg-green-500/20 text-green-500">
                                {strongest.avgScore}% avg
                            </Badge>
                        </div>
                    )}

                    {weakest && weakest.name !== strongest?.name && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <div>
                                <p className="text-sm text-muted-foreground">Needs Improvement</p>
                                <p className="text-lg font-bold text-red-500">{weakest.name}</p>
                            </div>
                            <Badge variant="secondary" className="bg-red-500/20 text-red-500">
                                {weakest.avgScore}% avg
                            </Badge>
                        </div>
                    )}

                    {improvementPct !== null && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted border">
                            <div>
                                <p className="text-sm text-muted-foreground">Overall Improvement</p>
                                <p className="text-lg font-bold flex items-center gap-1">
                                    {parseFloat(improvementPct) > 0 ? (
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                    ) : parseFloat(improvementPct) < 0 ? (
                                        <TrendingDown className="h-4 w-4 text-red-500" />
                                    ) : (
                                        <Minus className="h-4 w-4 text-yellow-500" />
                                    )}
                                    {improvementPct > 0 ? "+" : ""}
                                    {improvementPct}%
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground">First vs Latest Quiz</p>
                        </div>
                    )}

                    {/* Category-wise scores list */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Scores by Category</p>
                        {categoryData.map((cat) => (
                            <div
                                key={cat.name}
                                className="flex items-center justify-between text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: CATEGORY_COLORS[cat.name] || "#6366f1" }}
                                    />
                                    <span>{cat.name}</span>
                                </div>
                                <span className="font-medium">{cat.avgScore}% ({cat.value} quizzes)</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
