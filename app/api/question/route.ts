import { generateText } from "ai";
import { NextResponse } from "next/server";
import { randomFallbackQuestion } from "@/lib/questions";

export const maxDuration = 30;

// Model is resolved through the Vercel AI Gateway. On Vercel, authentication
// is automatic (OIDC); locally, set AI_GATEWAY_API_KEY in .env.local.
const MODEL = process.env.AI_GATEWAY_MODEL ?? "anthropic/claude-opus-4.5";

const SYSTEM_PROMPT = `You write prompts for the party game Listography.

A Listography prompt asks players to write a quick personal list. It should be:
- Short (one sentence, under 12 words), starting with "List"
- Personal and opinion-based, so every player's list is different
- Fun, nostalgic, funny, or revealing — never trivia with a right answer
- Answerable by anyone in 30 seconds

Examples of the style:
- "List your favorite movies of all time"
- "List things you'd grab if your house was on fire"
- "List jobs you'd be terrible at"
- "List the celebrities you'd invite to a dinner party"

Respond with ONLY the prompt text. No quotes, no numbering, no explanation.`;

export async function POST(request: Request) {
  let recent: string[] = [];
  try {
    const body = await request.json();
    if (Array.isArray(body?.recent)) {
      recent = body.recent.filter((q: unknown) => typeof q === "string").slice(-20);
    }
  } catch {
    // No/invalid body — proceed with no exclusions.
  }

  try {
    const { text } = await generateText({
      model: MODEL,
      system: SYSTEM_PROMPT,
      prompt:
        recent.length > 0
          ? `Write one new Listography prompt. Avoid anything similar to these already-used prompts:\n${recent
              .map((q) => `- ${q}`)
              .join("\n")}`
          : "Write one new Listography prompt.",
    });

    const question = text.trim().replace(/^["']|["']$/g, "");
    if (question.length > 0) {
      return NextResponse.json({ question, source: "ai" });
    }
    return NextResponse.json({
      question: randomFallbackQuestion(recent),
      source: "fallback",
    });
  } catch {
    // AI Gateway unavailable (no key locally, model unavailable, etc.) —
    // serve from the built-in question bank so the game still works.
    return NextResponse.json({
      question: randomFallbackQuestion(recent),
      source: "fallback",
    });
  }
}
