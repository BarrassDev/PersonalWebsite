import { generateText } from "ai";
import { NextResponse } from "next/server";
import { randomFallbackQuestion } from "@/lib/questions";

export const maxDuration = 30;

// Model is resolved through the Vercel AI Gateway. On Vercel, authentication
// is automatic (OIDC); locally, set AI_GATEWAY_API_KEY in .env.local.
const MODEL = process.env.AI_GATEWAY_MODEL ?? "anthropic/claude-opus-4.5";

const SYSTEM_PROMPT = `You write topic cards for Listography: The Game (by Lisa Nola).

A Listography card names a category, and players race to list things that fit it.
Scoring compares lists between players, so most topics should be shared-knowledge
categories where different players' answers CAN match — not pure personal opinion.

Rotate between the real game's flavors (lean toward the first two):
1. Pop culture categories — e.g. "List bands with one-word names",
   "List movie villains everyone loves", "List famous fictional detectives",
   "List songs everyone knows the chorus to", "List celebrity couples, past or present"
2. Everyday-life categories — e.g. "List common pizza toppings",
   "List things you plug in", "List common potluck dishes",
   "List things people buy as souvenirs", "List G-rated swear words"
3. Light general knowledge — e.g. "List Ivy League schools",
   "List famous dictators", "List constellations", "List major world religions"
4. Occasionally, a personal list in the Listography journal style —
   e.g. "List your dream jobs", "List bad things you did as a kid"

Rules for the card:
- One sentence, under 12 words, starting with "List"
- Answerable by an average person in 30 seconds, no niche expertise required
- Fun, quirky, or nostalgic — a category people will argue and laugh about
- Never a question with a single right answer

Respond with ONLY the card text. No quotes, no numbering, no explanation.
Never repeat the example topics from these instructions verbatim.`;

// Random seeds injected per request so repeated calls don't converge on
// the same handful of classic topics.
const FLAVORS = [
  "a pop culture category",
  "a pop culture category",
  "an everyday-life category",
  "an everyday-life category",
  "a light general knowledge category",
  "a personal journal-style list",
];

const THEMES = [
  "music",
  "movies",
  "TV shows",
  "food and drink",
  "school days",
  "travel and holidays",
  "sports",
  "the internet and technology",
  "fashion",
  "animals",
  "history",
  "childhood nostalgia",
  "celebrities and fame",
  "books and stories",
  "video games",
  "around the house",
  "work and jobs",
  "nature and the outdoors",
  "romance and dating",
  "money and shopping",
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(request: Request) {
  let recent: string[] = [];
  try {
    const body = await request.json();
    if (Array.isArray(body?.recent)) {
      recent = body.recent.filter((q: unknown) => typeof q === "string").slice(-40);
    }
  } catch {
    // No/invalid body — proceed with no exclusions.
  }

  try {
    const seed = `Write one new Listography card. Make it ${pick(FLAVORS)}, loosely inspired by the theme "${pick(THEMES)}" (a creative angle on it, not just the theme restated).`;
    const { text } = await generateText({
      model: MODEL,
      system: SYSTEM_PROMPT,
      prompt:
        recent.length > 0
          ? `${seed}\n\nDo not repeat or closely paraphrase any of these already-used cards:\n${recent
              .map((q) => `- ${q}`)
              .join("\n")}`
          : seed,
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
