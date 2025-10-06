import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

async function callAIGenerateFeedback(
  problem_text: string,
  final_answer: number,
  user_answer: number
) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("Missing AI credentials");

  const prompt = `You are a friendly primary-school tutor. 
A student solved this problem: "${problem_text}". 
The correct answer is ${final_answer}. 
The student submitted: "${user_answer}". 
Write a short personalized feedback message (2-4 sentences) that:
1) praises their effort, 
2) says whether the answer is correct, 
3) gives one concise tip or next step. Return plain text only.`;

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`AI error: ${text}`);
  }

  const body = await resp.json();
  const textOutput = body.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return String(textOutput).trim();
}

export async function POST(req: Request) {
  try {
    const { session_id, user_answer } = await req.json();

    if (!session_id || user_answer == null) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { data: session, error: sessionErr } = await supabase
      .from("math_problem_sessions")
      .select("*")
      .eq("id", session_id)
      .single();

    if (sessionErr) throw sessionErr;

    const finalAnswer = Number(session.correct_answer);
    const submittedNumeric = Number(user_answer);
    const isCorrect =
      !Number.isNaN(submittedNumeric) && submittedNumeric === finalAnswer;

    const feedback = await callAIGenerateFeedback(
      session.problem_text,
      finalAnswer,
      user_answer
    );

    const { data: saved, error: saveErr } = await supabase
      .from("math_problem_submissions")
      .insert({
        session_id,
        user_answer,
        is_correct: isCorrect,
        feedback_text: feedback,
      })
      .select("*")
      .single();

    if (saveErr) throw saveErr;

    return NextResponse.json({ submission: saved });
  } catch (err: any) {
    console.error("[Submit API Error]", err);
    return NextResponse.json(
      { error: err.message || "Internal Error" },
      { status: 500 }
    );
  }
}
