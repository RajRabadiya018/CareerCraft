"use client";

import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Award, BookOpen, Globe, Library } from "lucide-react";

const TYPE_ICONS = {
    Course: BookOpen,
    Certification: Award,
    Book: Library,
    Platform: Globe,
};

const TYPE_COLORS = {
    Course: "bg-blue-500/20 text-blue-400",
    Certification: "bg-green-500/20 text-green-400",
    Book: "bg-purple-500/20 text-purple-400",
    Platform: "bg-orange-500/20 text-orange-400",
};

export default function LearningResources({ resources }) {
    if (!resources?.length) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Learning Resources</CardTitle>
                <CardDescription>
                    Recommended courses, certifications, and learning platforms
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {resources.map((resource, index) => {
                        const Icon = TYPE_ICONS[resource.type] || BookOpen;
                        return (
                            <a
                                key={index}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block border rounded-lg p-4 hover:bg-muted/50 transition-colors group"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-muted">
                                        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                            {resource.name}
                                        </p>
                                        <Badge
                                            variant="secondary"
                                            className={`mt-1 text-xs ${TYPE_COLORS[resource.type] || ""}`}
                                        >
                                            {resource.type}
                                        </Badge>
                                        {resource.description && (
                                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                                {resource.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
