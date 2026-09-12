// Theming data. Each "archetype" is a little building that grows through 4
// visual stages as its domain levels up. Same idea as before — emoji as
// sprites, zero asset pipeline — but the archetype is no longer something
// the player picks from a dropdown. It's inferred straight from what they
// name the domain, so "Reading" grows a library and "Coding" grows a
// workshop without the player ever touching a select box.
//
// Stage 0 = seed/signpost, 1 = sapling/foundation, 2 = basic structure,
// 3 = decorated structure + ambiance.

export const ARCHETYPES = {
  library: {
    label: "Library",
    icon: "📚",
    color: "#c9a15f",
    stages: ["📜", "📚", "🏛️", "🏛️✨"],
  },
  academy: {
    label: "Academy",
    icon: "🎓",
    color: "#5c86b0",
    stages: ["✏️", "📓", "🏫", "🏫🎓"],
  },
  workshop: {
    label: "Workshop",
    icon: "🛠️",
    color: "#a06a3d",
    stages: ["🔩", "🔧", "🏗️", "🏗️⚙️"],
  },
  dojo: {
    label: "Dojo",
    icon: "🥋",
    color: "#d97b6c",
    stages: ["🥋", "🛖", "🏯", "🏯🔥"],
  },
  shrine: {
    label: "Shrine",
    icon: "⛩️",
    color: "#8f9fd9",
    stages: ["🌸", "🪨", "⛩️", "⛩️🕯️"],
  },
  atelier: {
    label: "Atelier",
    icon: "🎨",
    color: "#b0699a",
    stages: ["🎨", "🖌️", "🎭", "🎭✨"],
  },
  kitchen: {
    label: "Kitchen",
    icon: "🍲",
    color: "#c98f3f",
    stages: ["🥕", "🍳", "🍲", "🍲🏡"],
  },
  farm: {
    label: "Farm",
    icon: "🌾",
    color: "#8fbf5c",
    stages: ["🌱", "🌿", "🚜", "🌻🏡"],
  },
};

export function getArchetype(key) {
  return ARCHETYPES[key] || ARCHETYPES.farm;
}

// Clamp a derived level (1, 2, 3, 4, 5, ...) down to an available stage index (0-3).
export function stageForLevel(level) {
  return Math.min(3, Math.max(0, level - 1));
}

// Flower-color style variants driven by the deterministic plotVariant() roll.
export const VARIANT_ACCENTS = ["#f2b6c6", "#f7dd72", "#a8d8b9"];

// ---------- Automatic archetype classification ----------
//
// Reads the domain name the player typed and matches it against a keyword
// table so related-but-distinct activities land on different buildings —
// e.g. reading grows a library, studying grows an academy, and coding grows
// a workshop, even though all three could loosely be called "study."
// Order matters: more specific/less ambiguous categories are checked first.
const KEYWORD_RULES = [
  {
    key: "workshop",
    keywords: ["code", "coding", "program", "dev", "developer", "engineer", "leetcode", "software", "debug", "build app", "hack"],
  },
  {
    key: "library",
    keywords: ["read", "book", "novel", "literat", "chapter", "fiction"],
  },
  {
    key: "academy",
    keywords: ["study", "studying", "exam", "school", "class", "lecture", "homework", "revis", "course", "learn"],
  },
  {
    key: "dojo",
    keywords: ["gym", "workout", "exercise", "fitness", "run", "jog", "yoga", "sport", "training", "lift", "cardio", "sparring"],
  },
  {
    key: "atelier",
    keywords: ["draw", "paint", "art", "design", "music", "sketch", "creativ", "sing", "photograph", "guitar", "piano"],
  },
  {
    key: "kitchen",
    keywords: ["cook", "baking", "bake", "recipe", "meal", "kitchen", "chef"],
  },
  {
    key: "shrine",
    keywords: ["meditat", "mindful", "pray", "journal", "gratitude", "breath", "reflect"],
  },
];

export function inferArchetypeFromName(name) {
  const lower = (name || "").toLowerCase();
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((k) => lower.includes(k))) return rule.key;
  }
  return "farm";
}
