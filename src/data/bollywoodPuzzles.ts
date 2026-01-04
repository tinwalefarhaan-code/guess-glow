export interface BollywoodPuzzle {
  answer: string;
  hint1: string;
  hint2: string;
  hint3: string;
}

export const bollywoodPuzzles: BollywoodPuzzle[] = [
  { answer: "Andhadhun", hint1: "A dark story where nothing is what it seems", hint2: "Music plays a dangerous role", hint3: "Starts with A, 8 letters" },
  { answer: "Barfi", hint1: "Love is expressed without words", hint2: "Set in the hills", hint3: "5 letters, starts with B" },
  { answer: "Kahaani", hint1: "A woman searches for truth", hint2: "City plays a strong role", hint3: "7 letters, starts with K" },
  { answer: "Drishyam", hint1: "A perfect crime may not be perfect", hint2: "Family is the motive", hint3: "8 letters, starts with D" },
  { answer: "Lagaan", hint1: "A game decides fate", hint2: "Set in colonial India", hint3: "6 letters, starts with L" },
  { answer: "Tumbbad", hint1: "Greed has consequences", hint2: "Mythology meets horror", hint3: "7 letters, starts with T" },
  { answer: "Queen", hint1: "A journey of self-discovery", hint2: "Starts alone, ends strong", hint3: "5 letters, starts with Q" },
  { answer: "Swades", hint1: "Coming back to roots", hint2: "Science meets village life", hint3: "6 letters, starts with S" },
  { answer: "Haider", hint1: "Shakespeare in Kashmir", hint2: "Revenge is central", hint3: "6 letters, starts with H" },
  { answer: "Rang De Basanti", hint1: "Youth and revolution", hint2: "Past inspires present", hint3: "13 letters, starts with R" },
  { answer: "Article 15", hint1: "Based on harsh reality", hint2: "Law and justice", hint3: "9 letters incl number" },
  { answer: "Udaan", hint1: "Freedom from control", hint2: "Father-son conflict", hint3: "5 letters, starts with U" },
  { answer: "PK", hint1: "An outsider questions society", hint2: "Belief vs logic", hint3: "2 letters" },
  { answer: "Raazi", hint1: "Love for nation above all", hint2: "Spy drama", hint3: "5 letters, starts with R" },
  { answer: "Talvar", hint1: "Truth has many versions", hint2: "Inspired by real case", hint3: "6 letters, starts with T" },
  { answer: "October", hint1: "Silence speaks louder", hint2: "Hospital setting", hint3: "7 letters" },
  { answer: "Newton", hint1: "One man, one vote", hint2: "Election backdrop", hint3: "7 letters" },
  { answer: "Bulbbul", hint1: "Folklore and feminism", hint2: "Red color symbolism", hint3: "7 letters" },
  { answer: "Badlapur", hint1: "Revenge changes people", hint2: "Time matters", hint3: "8 letters" },
  { answer: "Masaan", hint1: "Life, death and society", hint2: "Small town struggles", hint3: "6 letters" },
  { answer: "Piku", hint1: "Unusual father-daughter bond", hint2: "Road journey", hint3: "4 letters" },
  { answer: "Lootera", hint1: "Love and betrayal", hint2: "Inspired by literature", hint3: "7 letters" },
  { answer: "Airlift", hint1: "Rescue mission", hint2: "Based on true events", hint3: "7 letters" },
  { answer: "Pink", hint1: "Consent matters", hint2: "Courtroom drama", hint3: "4 letters" },
  { answer: "Dangal", hint1: "Wrestling dreams", hint2: "Father's ambition", hint3: "6 letters" },
  { answer: "Bhool Bhulaiyaa", hint1: "Mind vs myth", hint2: "Psychological angle", hint3: "14 letters" },
  { answer: "Rockstar", hint1: "Pain fuels art", hint2: "Music-driven", hint3: "9 letters" },
  { answer: "Tamasha", hint1: "Two identities", hint2: "Story within story", hint3: "7 letters" },
  { answer: "Jab We Met", hint1: "A chance meeting", hint2: "Train journey", hint3: "8 letters" },
  { answer: "Dil Se", hint1: "Love amid chaos", hint2: "Political backdrop", hint3: "5 letters" }
];

// Helper to get a random unused puzzle
export const getRandomPuzzle = (usedAnswers: Set<string>): BollywoodPuzzle | null => {
  const available = bollywoodPuzzles.filter(p => !usedAnswers.has(p.answer.toLowerCase()));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
};
