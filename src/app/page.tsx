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
      const resp = await fetch("/api/math-problem", { method: "POST" });
      const data = await resp.json();

      if (!resp.ok) throw new Error(data.error || "Failed to generate problem");
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
      const resp = await fetch("/api/math-problem/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session.id,
          user_answer: userAnswer,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to submit answer");

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
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-blue-300 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">
          🧠 Math Problem Generator
        </h1>

        <button
          onClick={generateProblem}
          disabled={loadingProblem}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg mb-4 transition disabled:opacity-50"
        >
          {loadingProblem ? "Generating..." : "Generate New Problem"}
        </button>

        {session && (
          <div className="mb-4">
            <p className="text-gray-800 text-lg font-medium mb-2">
              📌 Problem:
            </p>
            <p className="bg-gray-100 p-3 rounded-lg text-gray-700 whitespace-pre-line">
              {session.problem_text}
            </p>
          </div>
        )}

        {session && (
          <div className="mb-4">
            <label className="block mb-1 text-gray-700 font-medium">
              ✏️ Your Answer:
            </label>
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-black"
              placeholder="Enter your answer"
            />
          </div>
        )}

        {session && (
          <div className="text-center mb-4">
            <button
              onClick={submitAnswer}
              disabled={loadingSubmit}
              className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {loadingSubmit ? "Submitting..." : "Submit Answer"}
            </button>
          </div>
        )}

        {feedback && (
          <div
            className={`p-3 rounded-lg text-sm whitespace-pre-line ${
              isCorrect
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            <p>{feedback}</p>
          </div>
        )}

        {error && (
          <div className="p-3 mt-3 bg-red-100 text-red-800 rounded-lg text-sm">
            ❌ {error}
          </div>
        )}
      </div>
    </main>
  );
}
