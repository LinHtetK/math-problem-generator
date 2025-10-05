import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

async function callAIGenerateProblem(): Promise<{
  problem_text: string;
  final_answer: number;
}> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("Missing AI credentials");

  const prompt = `
You are an assistant that returns a single Primary 5 level math word problem as JSON.
Return ONLY valid JSON with these fields:
{
  "problem_text": "A bakery sold 45 cupcakes...",
  "final_answer": 15
}
Do not add any explanations, code blocks, or commentary.
`;

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
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`AI error: ${text}`);
  }

  const raw = await resp.json();

  const textOutput = raw?.problem_text
    ? raw
    : raw?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error("AI returned no usable output");
  }

  let parsed;
  if (typeof textOutput === "string") {
    try {
      parsed = JSON.parse(textOutput);
    } catch (e) {
      console.error("Parse error:", textOutput);
      throw new Error("AI did not return valid JSON");
    }
  } else {
    parsed = textOutput;
  }

  if (!parsed.problem_text || typeof parsed.final_answer !== "number") {
    console.error("AI parsed output missing fields:", parsed);
    throw new Error("AI JSON missing required fields");
  }

  return parsed;
}

export async function POST() {
  try {
    const { problem_text, final_answer } = await callAIGenerateProblem();

    const { data, error } = await supabase
      .from("math_problem_sessions")
      .insert({ problem_text, correct_answer: final_answer })
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ session: data });
  } catch (err: any) {
    console.error("[Generate API Error]", err);
    return NextResponse.json(
      { error: err.message || "Internal Error" },
      { status: 500 }
    );
  }
}
