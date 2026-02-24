"use client";

import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Briefcase, Clock, MapPin, Monitor } from "lucide-react";

export default function JobMarket({ jobMarket }) {
    if (!jobMarket) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Job Market Overview</CardTitle>
                <CardDescription>Current hiring landscape and opportunities</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Open Positions */}
                    <div className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Briefcase className="h-4 w-4" />
                            <span>Open Positions</span>
                        </div>
                        <p className="text-xl font-bold">{jobMarket.openPositions || "N/A"}</p>
                    </div>

                    {/* Remote % */}
                    <div className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Monitor className="h-4 w-4" />
                            <span>Remote Friendly</span>
                        </div>
                        <p className="text-xl font-bold">
                            {jobMarket.remotePercentage != null ? `${jobMarket.remotePercentage}%` : "N/A"}
                        </p>
                    </div>

                    {/* Avg Experience */}
                    <div className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Avg. Experience</span>
                        </div>
                        <p className="text-xl font-bold">{jobMarket.averageExperience || "N/A"}</p>
                    </div>

                    {/* Top Locations */}
                    <div className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>Top Locations</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {jobMarket.topLocations?.map((loc, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                    {loc}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
