"use client";

import { cn } from "@/lib/utils";

export default function QuestionNav({
    totalQuestions,
    currentQuestion,
    answers,
    timedOutQuestions = new Set(),
    onQuestionSelect,
}) {
    return (
        <div className="flex flex-wrap gap-2 justify-center py-3">
            {Array.from({ length: totalQuestions }, (_, index) => {
                const isAnswered = answers[index] !== null && answers[index] !== undefined;
                const isCurrent = index === currentQuestion;
                const isTimedOut = timedOutQuestions.has(index);

                return (
                    <button
                        key={index}
                        onClick={() => onQuestionSelect(index)}
                        className={cn(
                            "w-9 h-9 rounded-full text-sm font-medium transition-all duration-200 border-2",
                            isCurrent && !isTimedOut && "border-primary bg-primary text-primary-foreground scale-110 shadow-lg",
                            isCurrent && isTimedOut && "border-red-500 bg-red-500/20 text-red-500 scale-110 shadow-lg",
                            !isCurrent && isTimedOut && "border-red-500/50 bg-red-500/10 text-red-500/70",
                            !isCurrent && !isTimedOut && isAnswered && "border-green-500 bg-green-500/20 text-green-500",
                            !isCurrent && !isTimedOut && !isAnswered && "border-muted-foreground/30 bg-muted text-muted-foreground hover:border-muted-foreground/60"
                        )}
                        title={isTimedOut ? "Time expired" : isAnswered ? "Answered" : "Not answered"}
                    >
                        {index + 1}
                    </button>
                );
            })}
        </div>
    );
}
