"use client";

import { generateQuiz, saveQuizResult } from "@/actions/interview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useFetch from "@/hooks/use-fetch";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  Lock,
  Timer,
  Users,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BarLoader } from "react-spinners";
import { toast } from "sonner";
import QuestionNav from "./question-nav";
import QuizResult from "./quiz-result";
import QuizTimer from "./quiz-timer";

const CATEGORIES = [
  { value: "Technical", label: "Technical", icon: Brain, description: "Coding, tools & technology concepts" },
  { value: "Behavioral", label: "Behavioral", icon: Users, description: "Teamwork, leadership & soft skills" },
  { value: "Situational", label: "Situational", icon: Lightbulb, description: "Workplace scenarios & decision-making" },
];

const DIFFICULTIES = [
  { value: "easy", label: "Easy", color: "bg-green-500/20 text-green-500 border-green-500/30" },
  { value: "medium", label: "Medium", color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" },
  { value: "hard", label: "Hard", color: "bg-red-500/20 text-red-500 border-red-500/30" },
];

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Technical");
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [quizCategory, setQuizCategory] = useState("Technical");
  const [quizDifficulty, setQuizDifficulty] = useState("medium");
  const [timedOutQuestions, setTimedOutQuestions] = useState(new Set());
  const isSubmittingRef = useRef(false);

  const {
    loading: generatingQuiz,
    fn: generateQuizFn,
    data: quizData,
  } = useFetch(generateQuiz);

  const {
    loading: savingResult,
    fn: saveQuizResultFn,
    data: resultData,
    setData: setResultData,
  } = useFetch(saveQuizResult);

  useEffect(() => {
    if (quizData) {
      setAnswers(new Array(quizData.length).fill(null));
      setQuizStartTime(Date.now());
      setTimedOutQuestions(new Set());
      isSubmittingRef.current = false;
    }
  }, [quizData]);

  const handleAnswer = (answer) => {
    // Don't allow answering timed-out questions
    if (timedOutQuestions.has(currentQuestion)) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowHint(false);
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowHint(false);
    }
  };

  const handleQuestionSelect = (index) => {
    setCurrentQuestion(index);
    setShowHint(false);
  };

  const handleTimeout = useCallback(() => {
    if (!quizData || isSubmittingRef.current) return;

    // Mark current question as timed out
    setTimedOutQuestions((prev) => {
      const updated = new Set(prev);
      updated.add(currentQuestion);
      return updated;
    });

    toast.warning("Time's up! Moving to next question.");

    // Find the next non-timed-out question
    let nextQ = -1;
    for (let i = currentQuestion + 1; i < quizData.length; i++) {
      nextQ = i;
      break;
    }

    if (nextQ !== -1) {
      setCurrentQuestion(nextQ);
      setShowHint(false);
    }
    // If no more questions, user can click Finish Quiz
  }, [currentQuestion, quizData]);

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === quizData[index].correctAnswer) {
        correct++;
      }
    });
    return (correct / quizData.length) * 100;
  };

  const finishQuiz = async () => {
    if (isSubmittingRef.current || savingResult) return;
    isSubmittingRef.current = true;

    const score = calculateScore();
    const timeSpent = quizStartTime
      ? Math.round((Date.now() - quizStartTime) / 1000)
      : null;
    try {
      await saveQuizResultFn(quizData, answers, score, {
        category: quizCategory,
        difficulty: quizDifficulty,
        timeSpent,
      });
      toast.success("Quiz completed!");
    } catch (error) {
      isSubmittingRef.current = false;
      toast.error(error.message || "Failed to save quiz results");
    }
  };

  const startNewQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowHint(false);
    setQuizStartTime(null);
    setTimedOutQuestions(new Set());
    isSubmittingRef.current = false;
    setQuizCategory(selectedCategory);
    setQuizDifficulty(selectedDifficulty);
    generateQuizFn({ category: selectedCategory, difficulty: selectedDifficulty });
    setResultData(null);
  };

  const answeredCount = answers.filter((a) => a !== null).length;
  const skippedCount = quizData ? quizData.length - answeredCount : 0;
  const isCurrentTimedOut = timedOutQuestions.has(currentQuestion);

  if (generatingQuiz) {
    return (
      <Card className="mx-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 animate-pulse text-primary" />
            Generating Your Quiz...
          </CardTitle>
          <CardDescription>
            Creating {selectedDifficulty} {selectedCategory.toLowerCase()} questions tailored to your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BarLoader className="mt-4" width={"100%"} color="gray" />
        </CardContent>
      </Card>
    );
  }

  // Show results if quiz is completed
  if (resultData) {
    return (
      <div className="mx-2">
        <QuizResult
          result={resultData}
          onStartNew={startNewQuiz}
          category={quizCategory}
        />
      </div>
    );
  }

  // Quiz start screen with configuration
  if (!quizData) {
    return (
      <Card className="mx-2">
        <CardHeader>
          <CardTitle>Ready to test your knowledge?</CardTitle>
          <CardDescription>
            Configure your quiz settings below and start when ready
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Quiz Category</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${isSelected
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-muted-foreground/30"
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="font-medium">{cat.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Difficulty Level</Label>
            <div className="flex gap-3">
              {DIFFICULTIES.map((diff) => {
                const isSelected = selectedDifficulty === diff.value;
                return (
                  <button
                    key={diff.value}
                    onClick={() => setSelectedDifficulty(diff.value)}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${isSelected
                        ? `${diff.color} border-current`
                        : "border-muted text-muted-foreground hover:border-muted-foreground/30"
                      }`}
                  >
                    {diff.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timer Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Timed Mode</p>
                <p className="text-xs text-muted-foreground">60 seconds per question</p>
              </div>
            </div>
            <Button
              variant={timerEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setTimerEnabled(!timerEnabled)}
            >
              {timerEnabled ? "On" : "Off"}
            </Button>
          </div>

          {/* Quiz Info */}
          <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
            <p>
              This quiz contains <strong>10 questions</strong> specific to your
              industry and skills. You can navigate between questions and submit
              anytime. Unanswered or skipped questions will be marked as incorrect.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={startNewQuiz} className="w-full" size="lg">
            <Zap className="mr-2 h-4 w-4" />
            Start {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)} {selectedCategory} Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const question = quizData[currentQuestion];

  return (
    <div className="mx-2 space-y-3">
      {/* Quiz Header with badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="secondary">{quizCategory}</Badge>
        <Badge className={DIFFICULTIES.find((d) => d.value === quizDifficulty)?.color}>
          {quizDifficulty.charAt(0).toUpperCase() + quizDifficulty.slice(1)}
        </Badge>
        <span className="text-sm text-muted-foreground ml-auto">
          {answeredCount}/{quizData.length} answered
          {skippedCount > 0 && ` · ${skippedCount} skipped`}
        </span>
      </div>

      {/* Timer — only for non-timed-out questions */}
      {timerEnabled && !isCurrentTimedOut && (
        <QuizTimer
          duration={60}
          onTimeout={handleTimeout}
          isActive={!isCurrentTimedOut && !savingResult}
          questionIndex={currentQuestion}
        />
      )}

      {/* Question Navigation Strip */}
      <QuestionNav
        totalQuestions={quizData.length}
        currentQuestion={currentQuestion}
        answers={answers}
        timedOutQuestions={timedOutQuestions}
        onQuestionSelect={handleQuestionSelect}
      />

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Question {currentQuestion + 1} of {quizData.length}</span>
            {isCurrentTimedOut && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Time Expired
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg font-medium">{question.question}</p>

          {isCurrentTimedOut ? (
            /* Timed-out question — locked, show message */
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
              <Lock className="h-5 w-5 mx-auto mb-2 text-red-500" />
              <p className="text-sm text-red-400">
                This question&apos;s time expired. It will be marked as unanswered.
              </p>
            </div>
          ) : (
            /* Active question — show options */
            <RadioGroup
              onValueChange={handleAnswer}
              value={answers[currentQuestion]}
              className="space-y-2"
            >
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {/* Hint — does NOT reveal the correct answer */}
          {showHint && !isCurrentTimedOut && (
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="font-medium flex items-center gap-1 text-blue-400">
                <HelpCircle className="h-4 w-4" />
                Hint:
              </p>
              <p className="text-muted-foreground mt-1">
                {question.hint || "Think carefully about the core concept being tested and eliminate options that don't fit."}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
          <div className="flex gap-2">
            <Button
              onClick={handlePrevious}
              variant="outline"
              disabled={currentQuestion === 0}
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            {!showHint && !isCurrentTimedOut && (
              <Button
                onClick={() => setShowHint(true)}
                variant="outline"
                disabled={!answers[currentQuestion]}
                size="sm"
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                Show Hint
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {currentQuestion < quizData.length - 1 && (
              <Button onClick={handleNext} size="sm" variant="outline">
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            <Button
              onClick={finishQuiz}
              disabled={savingResult || isSubmittingRef.current}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              {savingResult ? (
                <BarLoader width={60} height={3} color="white" />
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Finish Quiz
                  {skippedCount > 0 && ` (${skippedCount} skipped)`}
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
