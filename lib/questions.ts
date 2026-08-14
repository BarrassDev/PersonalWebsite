// Fallback bank of Listography-style topic cards, used when AI generation
// is unavailable (e.g. running locally without an AI Gateway key).
//
// Modeled on Listography: The Game (Lisa Nola), whose cards mix pop-culture
// categories, everyday-life categories, light general knowledge, and the
// occasional personal list from the Listography journals.
export const FALLBACK_QUESTIONS: string[] = [
  // Pop culture categories
  "List bands with one-word names",
  "List movie villains everyone loves",
  "List famous fictional detectives",
  "List songs everyone knows the chorus to",
  "List celebrity couples, past or present",
  "List one-hit wonders",
  "List famous movie quotes",
  "List TV shows that got cancelled too soon",
  "List cartoon characters with no last name",
  "List famous superheroes without capes",
  "List movies with numbers in the title",
  "List famous duos, real or fictional",
  "List boy bands or girl groups",
  "List video game characters everyone recognizes",
  "List actors who have played a president",
  // Everyday-life categories
  "List common pizza toppings",
  "List things you plug in",
  "List common potluck dishes",
  "List things people buy as souvenirs",
  "List G-rated swear words",
  "List things found in a junk drawer",
  "List excuses for being late",
  "List things people collect",
  "List foods that are better the next day",
  "List things you'd find at a garage sale",
  "List smells everyone recognizes instantly",
  "List things people lose constantly",
  // Light general knowledge
  "List Ivy League schools",
  "List famous dictators",
  "List constellations",
  "List major world religions",
  "List countries with red in their flag",
  "List famous inventors",
  "List capital cities in Europe",
  "List animals that hibernate",
  // Personal (journal-style)
  "List your dream jobs",
  "List bad things you did as a kid",
  "List your favorite restaurants",
  "List things you'd grab if your house was on fire",
  "List jobs you'd be terrible at",
  "List the celebrities you'd invite to a dinner party",
];

export function randomFallbackQuestion(exclude: string[] = []): string {
  const pool = FALLBACK_QUESTIONS.filter((q) => !exclude.includes(q));
  const source = pool.length > 0 ? pool : FALLBACK_QUESTIONS;
  return source[Math.floor(Math.random() * source.length)];
}
