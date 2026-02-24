import { getAssessments, getBookmarkedQuestions } from "@/actions/interview";
import BookmarkedQuestions from "./_components/bookmarked-questions";
import CategoryBreakdown from "./_components/category-breakdown";
import PerformanceChart from "./_components/performace-chart";
import QuizList from "./_components/quiz-list";
import StatsCards from "./_components/stats-cards";

export default async function InterviewPrepPage() {
  const assessments = await getAssessments();
  const bookmarkedQuestions = await getBookmarkedQuestions();

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title">
          Interview Preparation
        </h1>
      </div>
      <div className="space-y-6">
        <StatsCards assessments={assessments} />
        <PerformanceChart assessments={assessments} />
        <CategoryBreakdown assessments={assessments} />
        <BookmarkedQuestions bookmarkedQuestions={bookmarkedQuestions} />
        <QuizList assessments={assessments} />
      </div>
    </div>
  );
}
