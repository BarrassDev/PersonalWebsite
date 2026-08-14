// Fallback bank of Listography-style prompts, used when AI generation
// is unavailable (e.g. running locally without an AI Gateway key).
export const FALLBACK_QUESTIONS: string[] = [
  "List your favorite movies of all time",
  "List the celebrities you'd invite to a dinner party",
  "List songs you know all the words to",
  "List things you'd grab if your house was on fire",
  "List places you want to visit before you die",
  "List your guilty pleasures",
  "List the best concerts you've ever been to",
  "List foods you could eat every day for the rest of your life",
  "List jobs you'd be terrible at",
  "List your childhood heroes",
  "List things that instantly put you in a good mood",
  "List the worst fashion choices you've ever made",
  "List TV shows you've binge-watched",
  "List things you pretend to understand but don't",
  "List names you would never name your child",
  "List your biggest pet peeves",
  "List things you'd do if you won the lottery",
  "List animals you'd want as an exotic pet",
  "List the best smells in the world",
  "List things you always procrastinate on",
  "List fictional characters you'd want as a best friend",
  "List things you'd tell your teenage self",
  "List apps you can't live without",
  "List the most useless talents you have",
  "List words that make you cringe",
  "List things you've never done that most people have",
  "List your favorite childhood snacks",
  "List excuses you've used to get out of plans",
  "List superpowers you'd actually want",
  "List things that were cool ten years ago",
];

export function randomFallbackQuestion(exclude: string[] = []): string {
  const pool = FALLBACK_QUESTIONS.filter((q) => !exclude.includes(q));
  const source = pool.length > 0 ? pool : FALLBACK_QUESTIONS;
  return source[Math.floor(Math.random() * source.length)];
}
