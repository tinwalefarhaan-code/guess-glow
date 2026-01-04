export interface AnimalPuzzle {
  answer: string;
  hint1: string;
  hint2: string;
  hint3: string;
}

export const animalPuzzles: AnimalPuzzle[] = [
  { answer: "Dolphin", hint1: "Very intelligent creature", hint2: "Lives in groups", hint3: "7 letters, starts with D" },
  { answer: "Hyena", hint1: "Known for strange laugh", hint2: "Scavenger", hint3: "5 letters" },
  { answer: "Leopard", hint1: "Fast and silent hunter", hint2: "Spotted body", hint3: "7 letters" },
  { answer: "Orangutan", hint1: "Human-like intelligence", hint2: "Lives in trees", hint3: "9 letters" },
  { answer: "Pangolin", hint1: "Covered in scales", hint2: "Eats ants", hint3: "8 letters" },
  { answer: "Manatee", hint1: "Gentle giant", hint2: "Aquatic mammal", hint3: "7 letters" },
  { answer: "Caracal", hint1: "Wild cat with long ears", hint2: "Jumps high", hint3: "7 letters" },
  { answer: "Narwhal", hint1: "Unicorn of the sea", hint2: "Long tooth", hint3: "7 letters" },
  { answer: "Tapir", hint1: "Odd-looking mammal", hint2: "Short trunk", hint3: "5 letters" },
  { answer: "Aardvark", hint1: "Nocturnal animal", hint2: "Digs burrows", hint3: "8 letters" },
  { answer: "Ibex", hint1: "Mountain goat", hint2: "Curved horns", hint3: "4 letters" },
  { answer: "Okapi", hint1: "Looks like zebra", hint2: "Forest animal", hint3: "5 letters" },
  { answer: "Civet", hint1: "Nocturnal mammal", hint2: "Coffee connection", hint3: "5 letters" },
  { answer: "Stoat", hint1: "Changes fur color", hint2: "Small predator", hint3: "5 letters" },
  { answer: "Wolverine", hint1: "Very aggressive", hint2: "Strong for its size", hint3: "9 letters" },
  { answer: "Gaur", hint1: "Largest wild cattle", hint2: "Found in India", hint3: "4 letters" },
  { answer: "Markhor", hint1: "National animal of Pakistan", hint2: "Twisted horns", hint3: "7 letters" },
  { answer: "Saola", hint1: "Rarely seen", hint2: "Asian unicorn", hint3: "5 letters" },
  { answer: "Binturong", hint1: "Smells like popcorn", hint2: "Tree-dweller", hint3: "9 letters" },
  { answer: "Fossa", hint1: "Top predator in Madagascar", hint2: "Cat-like", hint3: "5 letters" },
  { answer: "Kudu", hint1: "Spiral horns", hint2: "African antelope", hint3: "4 letters" },
  { answer: "Loris", hint1: "Big eyes", hint2: "Slow movement", hint3: "5 letters" },
  { answer: "Musk Deer", hint1: "Produces valuable scent", hint2: "Lives in mountains", hint3: "8 letters" },
  { answer: "Quokka", hint1: "Always looks happy", hint2: "Marsupial", hint3: "6 letters" },
  { answer: "Ratel", hint1: "Fearless animal", hint2: "Also called honey badger", hint3: "5 letters" },
  { answer: "Serval", hint1: "Tall-eared cat", hint2: "African", hint3: "6 letters" },
  { answer: "Uakari", hint1: "Red face monkey", hint2: "Amazon rainforest", hint3: "6 letters" },
  { answer: "Vicuña", hint1: "Relative of llama", hint2: "Fine wool", hint3: "6 letters" },
  { answer: "Zorilla", hint1: "Striped animal", hint2: "Strong smell", hint3: "7 letters" },
  { answer: "Yapok", hint1: "Aquatic marsupial", hint2: "Webbed feet", hint3: "5 letters" }
];

export const getRandomAnimalPuzzle = (usedAnswers: Set<string>): AnimalPuzzle | null => {
  const available = animalPuzzles.filter(p => !usedAnswers.has(p.answer.toLowerCase()));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
};
