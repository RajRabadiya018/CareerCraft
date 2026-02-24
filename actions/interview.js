"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generateQuiz({ category = "Technical", difficulty = "medium" } = {}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true,
      skills: true,
    },
  });

  if (!user) throw new Error("User not found");

  const difficultyDescriptions = {
    easy: "beginner-friendly and foundational, testing basic concepts and definitions",
    medium: "intermediate-level, testing practical application and understanding",
    hard: "advanced and challenging, testing deep expertise, edge cases, and complex scenarios",
  };

  const categoryDescriptions = {
    Technical: "technical knowledge, coding concepts, tools, and technologies",
    Behavioral: "behavioral situations, teamwork, leadership, conflict resolution, and soft skills using the STAR method format",
    Situational: "hypothetical workplace scenarios, decision-making, problem-solving, and professional judgment",
  };

  const prompt = `
    Generate 10 ${difficulty} difficulty ${category.toLowerCase()} interview questions for a ${user.industry
    } professional${user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
    }.
    
    The questions should be ${difficultyDescriptions[difficulty] || difficultyDescriptions.medium}.
    Focus on ${categoryDescriptions[category] || categoryDescriptions.Technical}.
    
    Each question should be multiple choice with 4 options.
    
    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "hint": "A brief conceptual clue that helps the user think about the question without revealing which option is correct. Do NOT mention any option letter or the correct answer.",
          "explanation": "string - full explanation of why the correct answer is right, shown after quiz completion"
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const quiz = JSON.parse(cleanedText);

    return quiz.questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz questions");
  }
}

export async function saveQuizResult(questions, answers, score, { category = "Technical", difficulty = "medium", timeSpent = null } = {}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  // Get wrong answers
  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  // Only generate improvement tips if there are wrong answers
  let improvementTip = null;
  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer || 'Skipped'}"`
      )
      .join("\n\n");

    const improvementPrompt = `
      The user got the following ${user.industry} ${category.toLowerCase()} interview questions wrong (difficulty: ${difficulty}):

      ${wrongQuestionsText}

      Based on these mistakes, provide a concise, specific improvement tip.
      Focus on the knowledge gaps revealed by these wrong answers.
      Keep the response under 2 sentences and make it encouraging.
      Don't explicitly mention the mistakes, instead focus on what to learn/practice.
    `;

    try {
      const tipResult = await model.generateContent(improvementPrompt);

      improvementTip = tipResult.response.text().trim();
      console.log(improvementTip);
    } catch (error) {
      console.error("Error generating improvement tip:", error);
      // Continue without improvement tip if generation fails
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category,
        difficulty,
        timeSpent,
        improvementTip,
      },
    });

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const assessments = await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}

// =========== Bookmark Actions ===========

export async function bookmarkQuestion(questionData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // Check if already bookmarked (by matching question text)
    const existingBookmarks = user.bookmarkedQuestions || [];
    const alreadyBookmarked = existingBookmarks.some(
      (bq) => bq.question === questionData.question
    );

    if (alreadyBookmarked) {
      return { success: true, message: "Already bookmarked" };
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        bookmarkedQuestions: {
          push: {
            question: questionData.question,
            answer: questionData.answer,
            explanation: questionData.explanation,
            category: questionData.category || "Technical",
            bookmarkedAt: new Date().toISOString(),
          },
        },
      },
    });

    return { success: true, bookmarkedQuestions: updatedUser.bookmarkedQuestions };
  } catch (error) {
    console.error("Error bookmarking question:", error);
    throw new Error("Failed to bookmark question");
  }
}

export async function removeBookmark(questionText) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const updatedBookmarks = (user.bookmarkedQuestions || []).filter(
      (bq) => bq.question !== questionText
    );

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        bookmarkedQuestions: updatedBookmarks,
      },
    });

    return { success: true, bookmarkedQuestions: updatedUser.bookmarkedQuestions };
  } catch (error) {
    console.error("Error removing bookmark:", error);
    throw new Error("Failed to remove bookmark");
  }
}

export async function getBookmarkedQuestions() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      bookmarkedQuestions: true,
    },
  });

  if (!user) throw new Error("User not found");

  return user.bookmarkedQuestions || [];
}
