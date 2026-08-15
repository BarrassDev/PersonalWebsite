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
  // --- Expansion pack ---
  // Pop culture
  "List famous wizards or witches",
  "List reality TV shows everyone has heard of",
  "List songs played at every wedding",
  "List famous robots or AIs from movies",
  "List Disney villains",
  "List sitcom families",
  "List famous catchphrases from TV",
  "List musicians who go by one name",
  "List movies everyone quotes but few have seen",
  "List famous superhero sidekicks",
  "List bands named after places",
  "List actors known for playing bad guys",
  "List famous movie cars",
  "List TV shows with theme songs everyone knows",
  "List celebrities famous for being famous",
  "List iconic movie dances",
  "List famous fictional schools",
  "List cartoon duos",
  "List songs about heartbreak",
  "List horror movie monsters",
  "List movies with twist endings",
  "List child stars who grew up famous",
  "List famous fictional bars or pubs",
  "List musicians with colors in their name",
  "List famous TV doctors",
  "List game shows everyone knows",
  "List movies based on true stories",
  "List famous animated sidekicks",
  "List songs everyone sings badly at karaoke",
  "List famous fictional spies",
  "List romcoms everyone has seen",
  "List movie franchises with more than three films",
  "List celebrities who switched careers",
  "List Christmas movies everyone argues about",
  "List famous redheads, real or fictional",
  "List famous talking animals",
  "List songs with a place in the title",
  "List famous fictional presidents",
  "List actors who have played James Bond",
  "List famous mustaches, real or fictional",
  "List celebrity chefs",
  "List famous comedy double acts",
  "List songs from the 2000s everyone knows",
  "List iconic album covers",
  "List famous fictional pirates",
  "List TV shows that everyone's parents watch",
  "List famous movie soundtracks",
  "List celebrities you'd trust to babysit",
  "List superheroes' alter egos",
  "List famous monsters kids love",
  "List famous dance crazes",
  "List movies that made everyone cry",
  "List famous fictional teachers",
  "List famous internet memes",
  "List famous video game villains",
  // Everyday life
  "List things found in a glovebox",
  "List things people say on the phone",
  "List breakfast foods",
  "List things in a first aid kit",
  "List things found in a hotel room",
  "List things people do while waiting in line",
  "List common ice cream flavors",
  "List things you find at the beach",
  "List house rules parents make",
  "List things people forget when packing",
  "List excuses for missing the gym",
  "List things found in a school backpack",
  "List condiments everyone has in the fridge",
  "List things people do on a rainy day",
  "List common street names",
  "List things found in grandma's house",
  "List things people argue about on road trips",
  "List classic dog names",
  "List things you shout at the TV during sports",
  "List gas station snacks",
  "List toys every kid begged for",
  "List chores everyone hates",
  "List things found in a purse or handbag",
  "List famous pizza chains",
  "List things people say to their pets",
  "List sounds that wake you up at night",
  "List things at every birthday party",
  "List passwords people shouldn't use",
  "List things found in an office drawer",
  "List foods you eat with your hands",
  "List things people bring camping",
  "List small talk topics",
  "List things that always break at the worst time",
  "List drinks you order at a coffee shop",
  "List things found in a toolbox",
  "List vegetables kids refuse to eat",
  "List things people do at red lights",
  "List things sold at school bake sales",
  "List things you find under a couch",
  "List common wedding traditions",
  "List apps on everyone's phone",
  "List things people hoard",
  "List smells of the holiday season",
  "List noises that annoy everyone",
  "List things everyone buys at IKEA",
  // Light general knowledge
  "List countries in South America",
  "List Olympic sports",
  "List famous painters",
  "List planets in the solar system",
  "List languages spoken by millions",
  "List famous rivers",
  "List US states starting with M",
  "List famous ancient civilizations",
  "List chemical elements everyone knows",
  "List famous composers",
  "List capital cities in Asia",
  "List famous explorers",
  "List breeds of dog",
  "List famous bridges",
  "List currencies of the world",
  "List famous scientists",
  "List island nations",
  "List famous queens or kings",
  "List mountain ranges",
  "List famous world leaders of the 20th century",
  "List sports played with a ball",
  "List famous museums",
  "List zodiac signs",
  "List Greek gods and goddesses",
  "List famous deserts",
  // Personal (journal-style)
  "List songs you'd sing at karaoke",
  "List things you wanted to be when you grew up",
  "List your comfort foods",
  "List habits you wish you could break",
  "List places you've fallen asleep",
  "List things you'd do with an extra hour every day",
  "List your irrational fears",
  "List things you've lost and never found",
  "List people you'd call with one phone call",
  "List things you do when nobody's watching",
  "List your favorite words to say out loud",
  "List gifts you've pretended to like",
  "List things you'd put in a time capsule",
  "List rules you'd make if you ran the world",
  "List things that make you feel old",
  "List skills you'd learn if you had time",
  "List your most-used emojis",
  "List foods you refuse to try",
  "List things you'd tell your younger self",
  "List your guilty pleasure TV shows",
  "List things you always put off",
  "List the best gifts you've ever received",
  "List things you'd buy first if you won the lottery",
  "List your favorite smells",
  "List white lies everyone tells",
];

// Words too common in "List ..." prompts to signal similarity.
const STOPWORDS = new Set([
  "list", "the", "a", "an", "of", "in", "on", "at", "to", "with", "and",
  "or", "for", "about", "that", "you", "your", "youd", "youve", "every",
  "everyone", "things", "people", "famous", "common", "most", "best",
]);

function tokens(q: string): Set<string> {
  return new Set(
    q
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 0 && !STOPWORDS.has(w)),
  );
}

// Fuzzy match so "List songs everyone knows the chorus to" counts as a
// repeat of "List songs everyone knows the words to".
export function isSimilar(a: string, b: string): boolean {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.size === 0 || tb.size === 0) return a.trim().toLowerCase() === b.trim().toLowerCase();
  let overlap = 0;
  for (const w of ta) {
    if (tb.has(w)) overlap++;
  }
  return overlap / Math.min(ta.size, tb.size) >= 0.6;
}

export function randomFallbackQuestion(exclude: string[] = []): string {
  const pool = FALLBACK_QUESTIONS.filter(
    (q) => !exclude.some((e) => isSimilar(e, q)),
  );
  const source = pool.length > 0 ? pool : FALLBACK_QUESTIONS;
  return source[Math.floor(Math.random() * source.length)];
}
