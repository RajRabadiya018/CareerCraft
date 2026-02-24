"use client";

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import QuizResult from "./quiz-result";

const DIFFICULTY_COLORS = {
  easy: "bg-green-500/20 text-green-500",
  medium: "bg-yellow-500/20 text-yellow-500",
  hard: "bg-red-500/20 text-red-500",
};

export default function QuizList({ assessments }) {
  const router = useRouter();
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const formatTime = (seconds) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="gradient-title text-3xl md:text-4xl">
                Recent Quizzes
              </CardTitle>
              <CardDescription>
                Review your past quiz performance
              </CardDescription>
            </div>
            <Button onClick={() => router.push("/interview/mock")}>
              Start New Quiz
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessments?.map((assessment, i) => (
              <Card
                key={assessment.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedQuiz(assessment)}
              >
                <CardHeader>
                  <CardTitle className="gradient-title text-2xl">
                    Quiz {i + 1}
                  </CardTitle>
                  <CardDescription className="flex flex-col sm:flex-row sm:justify-between gap-2 w-full">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>Score: {assessment.quizScore.toFixed(1)}%</span>
                      <Badge variant="secondary">{assessment.category || "Technical"}</Badge>
                      {assessment.difficulty && (
                        <Badge className={DIFFICULTY_COLORS[assessment.difficulty] || DIFFICULTY_COLORS.medium}>
                          {assessment.difficulty.charAt(0).toUpperCase() + assessment.difficulty.slice(1)}
                        </Badge>
                      )}
                      {assessment.timeSpent && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(assessment.timeSpent)}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm">
                      {format(
                        new Date(assessment.createdAt),
                        "MMMM dd, yyyy HH:mm"
                      )}
                    </div>
                  </CardDescription>
                </CardHeader>
                {assessment.improvementTip && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {assessment.improvementTip}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <QuizResult
            result={selectedQuiz}
            hideStartNew
            onStartNew={() => router.push("/interview/mock")}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
