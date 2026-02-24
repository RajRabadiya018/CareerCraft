"use client";

import { bookmarkQuestion } from "@/actions/interview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bookmark, BookmarkCheck, CheckCircle2, Clock, Trophy, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function QuizResult({
  result,
  hideStartNew = false,
  onStartNew,
  category = "Technical",
}) {
  const [bookmarkedSet, setBookmarkedSet] = useState(new Set());
  const [bookmarking, setBookmarking] = useState(null);

  if (!result) return null;

  const handleBookmark = async (question, index) => {
    setBookmarking(index);
    try {
      await bookmarkQuestion({
        question: question.question,
        answer: question.answer,
        explanation: question.explanation,
        category: result.category || category,
      });
      setBookmarkedSet((prev) => new Set([...prev, index]));
      toast.success("Question bookmarked for review!");
    } catch (error) {
      toast.error(error.message || "Failed to bookmark question");
    } finally {
      setBookmarking(null);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="mx-auto">
      <h1 className="flex items-center gap-2 text-3xl gradient-title">
        <Trophy className="h-6 w-6 text-yellow-500" />
        Quiz Results
      </h1>

      <CardContent className="space-y-6">
        {/* Score Overview */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">{result.quizScore.toFixed(1)}%</h3>
          <Progress value={result.quizScore} className="w-full" />
        </div>

        {/* Quiz Meta Info */}
        <div className="flex flex-wrap gap-2 justify-center">
          {result.category && (
            <Badge variant="secondary">{result.category}</Badge>
          )}
          {result.difficulty && (
            <Badge
              className={
                result.difficulty === "easy"
                  ? "bg-green-500/20 text-green-500"
                  : result.difficulty === "hard"
                    ? "bg-red-500/20 text-red-500"
                    : "bg-yellow-500/20 text-yellow-500"
              }
            >
              {result.difficulty.charAt(0).toUpperCase() + result.difficulty.slice(1)}
            </Badge>
          )}
          {result.timeSpent && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(result.timeSpent)}
            </Badge>
          )}
        </div>

        {/* Improvement Tip */}
        {result.improvementTip && (
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-medium">Improvement Tip:</p>
            <p className="text-muted-foreground">{result.improvementTip}</p>
          </div>
        )}

        {/* Questions Review */}
        <div className="space-y-4">
          <h3 className="font-medium">Question Review</h3>
          {result.questions.map((q, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium flex-1">{q.question}</p>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleBookmark(q, index)}
                    disabled={bookmarkedSet.has(index) || bookmarking === index}
                    title={bookmarkedSet.has(index) ? "Bookmarked" : "Bookmark this question"}
                  >
                    {bookmarkedSet.has(index) ? (
                      <BookmarkCheck className="h-4 w-4 text-primary" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                  {q.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Your answer: {q.userAnswer || "(No answer)"}</p>
                {!q.isCorrect && <p>Correct answer: {q.answer}</p>}
              </div>
              <div className="text-sm bg-muted p-2 rounded">
                <p className="font-medium">Explanation:</p>
                <p>{q.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {!hideStartNew && (
        <CardFooter>
          <Button onClick={onStartNew} className="w-full">
            Start New Quiz
          </Button>
        </CardFooter>
      )}
    </div>
  );
}
