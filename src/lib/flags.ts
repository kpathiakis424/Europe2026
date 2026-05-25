// Map a country name to a flag emoji. Falls back to a generic pin.
const FLAGS: Record<string, string> = {
  Switzerland: "🇨🇭",
  "United Kingdom": "🇬🇧",
  England: "🇬🇧",
  France: "🇫🇷",
  Netherlands: "🇳🇱",
  Belgium: "🇧🇪",
  Germany: "🇩🇪",
  Italy: "🇮🇹",
  Spain: "🇪🇸",
  Portugal: "🇵🇹",
  Austria: "🇦🇹",
  Ireland: "🇮🇪",
  Luxembourg: "🇱🇺",
  "Czech Republic": "🇨🇿",
  Czechia: "🇨🇿",
};

export function flagFor(country: string): string {
  const key = country.trim();
  return FLAGS[key] ?? "📍";
}

export const KNOWN_COUNTRIES = Object.keys(FLAGS).filter(
  (c, i, arr) => arr.indexOf(c) === i
);
