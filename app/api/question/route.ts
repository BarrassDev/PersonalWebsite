import { createGateway } from "@ai-sdk/gateway";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { isSimilar, randomFallbackQuestion } from "@/lib/questions";

export const maxDuration = 30;

// Model is resolved through the Vercel AI Gateway, authenticated with the
// AI_KEY env var (falling back to the SDK's default AI_GATEWAY_API_KEY,
// then Vercel OIDC when deployed).
const gateway = createGateway({
  apiKey: process.env.AI_KEY ?? process.env.AI_GATEWAY_API_KEY,
});

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
  "cars and transport",
  "weather and seasons",
  "parties and celebrations",
  "superstitions and luck",
  "toys and games",
  "art and design",
  "science and space",
  "crime and mystery",
  "health and the body",
  "language and words",
  "cities and neighborhoods",
  "family life",
  "hobbies and collections",
  "advertising and brands",
  "the 1980s",
  "the 1990s",
  "the 2000s",
  "mornings and routines",
  "night time",
  "growing up",
];

const ANGLES = [
  "give it a nostalgic twist",
  "make it slightly absurd",
  "make it something everyone secretly has an opinion on",
  "make it something a kid could win at",
  "make it oddly specific",
  "make it about names or titles",
  "make it about places",
  "make it about firsts or lasts",
  "make it about the worst of something, not the best",
  "make it playful and a little mischievous",
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(request: Request) {
  let recent: string[] = [];
  try {
    const body = await request.json();
    if (Array.isArray(body?.recent)) {
      recent = body.recent.filter((q: unknown) => typeof q === "string").slice(-60);
    }
  } catch {
    // No/invalid body — proceed with no exclusions.
  }

  try {
    // Generate, checking against recent questions with fuzzy matching —
    // near-duplicates ("...knows the chorus to" vs "...knows the words to")
    // count as repeats. Retry with fresh random seeds before falling back.
    const avoid = [...recent];
    for (let attempt = 0; attempt < 2; attempt++) {
      const seed = `Write one new Listography card. Make it ${pick(FLAVORS)}, loosely inspired by the theme "${pick(THEMES)}" (a creative angle on it, not just the theme restated), and ${pick(ANGLES)}.`;
      const { text } = await generateText({
        model: gateway(MODEL),
        system: SYSTEM_PROMPT,
        prompt:
          avoid.length > 0
            ? `${seed}\n\nDo not repeat or closely paraphrase any of these already-used cards:\n${avoid
                .map((q) => `- ${q}`)
                .join("\n")}`
            : seed,
      });

      const question = text.trim().replace(/^["']|["']$/g, "");
      if (question.length > 0 && !avoid.some((q) => isSimilar(q, question))) {
        return NextResponse.json({ question, source: "ai" });
      }
      if (question.length > 0) {
        avoid.push(question);
      }
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
