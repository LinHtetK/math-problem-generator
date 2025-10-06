"use client";

import { useState } from "react";

type Session = {
  id: string;
  problem_text: string;
  correct_answer: number;
};

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loadingProblem, setLoadingProblem] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateProblem = async () => {
    setError(null);
    setFeedback(null);
    setIsCorrect(null);
    setUserAnswer("");
    setLoadingProblem(true);

    try {
      const res = await fetch("/api/math-problem", { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to generate problem");
      setSession(data.session);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoadingProblem(false);
    }
  };

  const submitAnswer = async () => {
    if (!session || userAnswer.trim() === "") return;
    setLoadingSubmit(true);
    setError(null);

    try {
      const res = await fetch("/api/math-problem/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session.id,
          user_answer: userAnswer,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit answer");

      setFeedback(data.submission.feedback_text);
      setIsCorrect(data.submission.is_correct);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-blue-300 px-4 py-8 sm:py-12 md:py-16">
      <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 transition-all duration-300">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-blue-700 mb-8">
          🧠 Math Problem Generator
        </h1>

        {/* Generate button */}
        <button
          onClick={generateProblem}
          disabled={loadingProblem}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg mb-6 transition-all duration-200 disabled:opacity-50 text-base sm:text-lg"
        >
          {loadingProblem ? "Generating..." : "Generate New Problem"}
        </button>

        {/* Problem display */}
        {session && (
          <div className="mb-6">
            <p className="text-gray-800 text-lg font-semibold mb-2">
              📌 Problem:
            </p>
            <p className="bg-gray-100 p-4 sm:p-5 rounded-lg text-gray-700 whitespace-pre-line text-sm sm:text-base">
              {session.problem_text}
            </p>
          </div>
        )}

        {/* Answer input */}
        {session && (
          <div className="mb-6">
            <label className="block mb-2 text-gray-700 font-medium text-base sm:text-lg">
              ✏️ Your Answer:
            </label>
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 text-base sm:text-lg"
              placeholder="Enter your answer"
            />
          </div>
        )}

        {/* Submit button */}
        {session && (
          <div className="text-center mb-6">
            <button
              onClick={submitAnswer}
              disabled={loadingSubmit}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 transition-all duration-200 text-base sm:text-lg"
            >
              {loadingSubmit ? "Submitting..." : "Submit Answer"}
            </button>
          </div>
        )}

        {/* Feedback message */}
        {feedback && (
          <div
            className={`p-4 rounded-lg text-sm sm:text-base whitespace-pre-line text-center font-medium ${
              isCorrect
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            <p>{feedback}</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 mt-4 bg-red-100 text-red-800 rounded-lg text-sm sm:text-base text-center font-medium">
            ❌ {error}
          </div>
        )}
      </div>
    </main>
  );
}
