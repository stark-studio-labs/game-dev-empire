/**
 * Tech Empire — Game Data
 * Topic/Genre compatibility, platform lifecycle, audience weightings.
 * Based on GDT reverse-engineering analysis.
 */

const GENRES = ['Action', 'Adventure', 'RPG', 'Simulation', 'Strategy', 'Casual'];

const AUDIENCES = ['Young', 'Everyone', 'Mature'];

const GAME_SIZES = {
  Small:  { staff: 1, devWeeks: 5,  divisor: 1.0,  cost: 0 },
  Medium: { staff: 2, devWeeks: 10, divisor: 2.5,  cost: 20000 },
  Large:  { staff: 4, devWeeks: 20, divisor: 5.0,  cost: 80000 },
  AAA:    { staff: 6, devWeeks: 32, divisor: 10.0, cost: 250000 },
};

const OFFICE_LEVELS = [
  { name: 'Garage',        maxStaff: 1, unlockCash: 0,         unlockYear: 1,  sizes: ['Small'] },
  { name: 'Small Office',  maxStaff: 5, unlockCash: 1000000,   unlockYear: 4,  sizes: ['Small', 'Medium'] },
  { name: 'Medium Office', maxStaff: 5, unlockCash: 5000000,   unlockYear: 6, sizes: ['Small', 'Medium', 'Large'] },
  { name: 'Large Office',  maxStaff: 8, unlockCash: 16000000,  unlockYear: 13, sizes: ['Small', 'Medium', 'Large', 'AAA'] },
];

// Development phases: 3 phases, 3 aspects each
const DEV_PHASES = [
  { name: 'Phase 1', aspects: ['Engine', 'Gameplay', 'Story/Quests'] },
  { name: 'Phase 2', aspects: ['Dialogues', 'Level Design', 'AI'] },
  { name: 'Phase 3', aspects: ['World Design', 'Graphics', 'Sound'] },
];

// Design/Tech ratio for each aspect (from GDT source)
const ASPECT_RATIOS = {
  'Engine':       { design: 0.20, tech: 0.80, basePoints: 20 },
  'Gameplay':     { design: 0.60, tech: 0.40, basePoints: 40 },
  'Story/Quests': { design: 0.90, tech: 0.10, basePoints: 40 },
  'Dialogues':    { design: 0.90, tech: 0.10, basePoints: 10 },
  'Level Design': { design: 0.40, tech: 0.60, basePoints: 30 },
  'AI':           { design: 0.20, tech: 0.80, basePoints: 60 },
  'World Design': { design: 0.70, tech: 0.30, basePoints: 70 },
  'Graphics':     { design: 0.20, tech: 0.80, basePoints: 20 },
  'Sound':        { design: 0.60, tech: 0.40, basePoints: 10 },
};

/**
 * Genre slider importance.
 * 1.0 = important (needs 40%+), 0.0 = restricted (must be <=20%), 0.5 = neutral
 * Order: Engine, Gameplay, Story, Dialogues, LevelDesign, AI, WorldDesign, Graphics, Sound
 */
const GENRE_IMPORTANCE = {
  Action:     [1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0],
  Adventure:  [0.0, 0.5, 1.0, 1.0, 0.5, 0.0, 1.0, 1.0, 0.5],
  RPG:        [0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.5],
  Simulation: [1.0, 1.0, 0.5, 0.0, 1.0, 1.0, 0.5, 1.0, 1.0],
  Strategy:   [1.0, 1.0, 0.5, 0.5, 1.0, 1.0, 1.0, 0.5, 1.0],
  Casual:     [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0],
};

// Design:Tech ideal ratio by genre
const GENRE_DT_RATIO = {
  Action:     0.67,
  Adventure:  1.50,
  RPG:        1.50,
  Simulation: 0.67,
  Strategy:   0.67,
  Casual:     1.50,
};

/**
 * Topics — 52 topics with genre weightings [Action, Adventure, RPG, Sim, Strategy, Casual]
 * and audience weightings [Young, Everyone, Mature]
 * Values: 1.0 = Great, 0.9 = Good, 0.8 = Okay, 0.7 = Bad, 0.6 = Terrible
 */
const TOPICS = [
  { name: 'Fantasy',         genreW: [0.8, 1.0, 1.0, 0.7, 0.9, 0.7], audienceW: [0.9, 1.0, 0.9] },
  { name: 'Sci-Fi',          genreW: [1.0, 0.9, 1.0, 0.8, 1.0, 0.6], audienceW: [0.8, 1.0, 1.0] },
  { name: 'Military',        genreW: [1.0, 0.7, 0.7, 1.0, 1.0, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Horror',          genreW: [1.0, 1.0, 0.7, 0.6, 0.6, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Sports',          genreW: [1.0, 0.6, 0.6, 1.0, 0.6, 1.0], audienceW: [1.0, 1.0, 0.8] },
  { name: 'Racing',          genreW: [1.0, 0.6, 0.6, 1.0, 0.6, 1.0], audienceW: [1.0, 1.0, 0.8] },
  { name: 'Comedy',          genreW: [0.7, 1.0, 0.8, 0.7, 0.6, 1.0], audienceW: [0.9, 1.0, 0.9] },
  { name: 'Business',        genreW: [0.6, 0.6, 0.6, 1.0, 1.0, 0.7], audienceW: [0.6, 0.8, 1.0] },
  { name: 'School',          genreW: [0.7, 0.8, 1.0, 1.0, 0.6, 0.8], audienceW: [1.0, 1.0, 0.6] },
  { name: 'Dungeon',         genreW: [1.0, 0.8, 1.0, 0.6, 1.0, 0.6], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Medieval',        genreW: [1.0, 1.0, 1.0, 0.7, 1.0, 0.6], audienceW: [0.8, 1.0, 1.0] },
  { name: 'Pirate',          genreW: [0.8, 1.0, 0.8, 0.7, 0.7, 0.7], audienceW: [0.9, 1.0, 0.8] },
  { name: 'Detective',       genreW: [0.7, 1.0, 1.0, 0.6, 0.7, 0.6], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Zombies',         genreW: [1.0, 1.0, 0.8, 0.6, 0.8, 0.7], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Virtual Pet',     genreW: [0.6, 0.6, 0.6, 1.0, 0.6, 1.0], audienceW: [1.0, 0.8, 0.6] },
  { name: 'Aliens',          genreW: [1.0, 0.8, 1.0, 0.7, 1.0, 0.6], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Space',           genreW: [1.0, 0.8, 0.8, 1.0, 1.0, 0.6], audienceW: [0.8, 1.0, 1.0] },
  { name: 'Life',            genreW: [0.6, 1.0, 0.7, 1.0, 0.6, 0.9], audienceW: [0.9, 1.0, 0.8] },
  { name: 'Music',           genreW: [0.6, 0.6, 0.6, 1.0, 0.6, 1.0], audienceW: [1.0, 1.0, 0.7] },
  { name: 'Dance',           genreW: [0.7, 0.6, 0.6, 1.0, 0.6, 1.0], audienceW: [1.0, 1.0, 0.6] },
  { name: 'Fashion',         genreW: [0.6, 0.6, 0.6, 1.0, 0.6, 1.0], audienceW: [1.0, 1.0, 0.6] },
  { name: 'Hacking',         genreW: [0.7, 0.7, 0.7, 1.0, 1.0, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'City',            genreW: [0.6, 0.7, 0.6, 1.0, 1.0, 0.7], audienceW: [0.8, 1.0, 1.0] },
  { name: 'Government',      genreW: [0.6, 0.6, 0.6, 1.0, 1.0, 0.6], audienceW: [0.6, 0.7, 1.0] },
  { name: 'Surgery',         genreW: [0.6, 0.6, 0.6, 1.0, 0.6, 0.7], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Martial Arts',    genreW: [1.0, 0.7, 0.8, 1.0, 0.6, 1.0], audienceW: [0.9, 1.0, 0.9] },
  { name: 'Ninja',           genreW: [1.0, 0.8, 0.8, 0.6, 0.6, 0.7], audienceW: [0.9, 1.0, 0.8] },
  { name: 'Superheroes',     genreW: [1.0, 0.9, 0.9, 0.6, 0.6, 0.7], audienceW: [1.0, 1.0, 0.8] },
  { name: 'Werewolf',        genreW: [0.8, 0.8, 1.0, 0.6, 0.6, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Vampire',         genreW: [0.8, 0.9, 1.0, 0.6, 0.6, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Wild West',       genreW: [1.0, 1.0, 0.9, 0.6, 0.7, 0.6], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Cyberpunk',       genreW: [1.0, 0.8, 1.0, 0.7, 0.7, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Post Apocalyptic',genreW: [1.0, 0.9, 1.0, 0.7, 0.8, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Game Dev',        genreW: [0.6, 0.6, 0.6, 1.0, 0.7, 0.8], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Startups',        genreW: [0.6, 0.6, 0.6, 1.0, 0.8, 0.7], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Transport',       genreW: [0.6, 0.6, 0.6, 1.0, 1.0, 0.7], audienceW: [0.8, 1.0, 1.0] },
  { name: 'History',         genreW: [0.7, 0.8, 0.8, 1.0, 1.0, 0.6], audienceW: [0.6, 0.9, 1.0] },
  { name: 'Evolution',       genreW: [0.6, 0.7, 0.7, 1.0, 1.0, 0.7], audienceW: [0.8, 1.0, 0.9] },
  { name: 'Mystery',         genreW: [0.7, 1.0, 1.0, 0.6, 0.7, 0.6], audienceW: [0.8, 1.0, 1.0] },
  { name: 'Romance',         genreW: [0.6, 1.0, 0.8, 0.7, 0.6, 0.7], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Spy',             genreW: [1.0, 1.0, 0.7, 0.6, 0.7, 0.6], audienceW: [0.8, 1.0, 1.0] },
  { name: 'Time Travel',     genreW: [0.8, 1.0, 1.0, 0.6, 0.7, 0.6], audienceW: [0.9, 1.0, 0.9] },
  { name: 'Hunting',         genreW: [1.0, 0.7, 0.6, 1.0, 0.7, 0.7], audienceW: [0.8, 1.0, 1.0] },
  { name: 'Vocabulary',      genreW: [0.6, 0.6, 0.6, 1.0, 1.0, 1.0], audienceW: [0.8, 1.0, 0.6] },
  { name: 'Movies',          genreW: [0.6, 0.7, 0.6, 1.0, 0.6, 1.0], audienceW: [0.9, 1.0, 0.8] },
  { name: 'Prison',          genreW: [0.7, 0.7, 0.7, 1.0, 1.0, 0.6], audienceW: [0.6, 0.7, 1.0] },
  { name: 'Hospital',        genreW: [0.6, 0.6, 0.6, 1.0, 0.7, 0.7], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Law',             genreW: [0.6, 1.0, 0.7, 1.0, 0.7, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'UFO',             genreW: [0.7, 0.8, 0.7, 0.7, 1.0, 0.6], audienceW: [0.8, 1.0, 1.0] },
  { name: 'Airplane',        genreW: [1.0, 0.6, 0.6, 1.0, 1.0, 0.7], audienceW: [0.8, 1.0, 0.9] },
  { name: 'Cooking',         genreW: [0.6, 0.6, 0.6, 1.0, 0.6, 1.0], audienceW: [1.0, 1.0, 0.7] },
  { name: 'Archaeology',     genreW: [0.7, 1.0, 0.9, 0.7, 0.7, 0.6], audienceW: [0.8, 1.0, 0.9] },

  // ── Sci-Fi (15 more) ─────────────────────────────────────────
  { name: 'Alien Invasion',  genreW: [1.0, 0.8, 0.7, 0.7, 1.0, 0.6], audienceW: [0.8, 1.0, 1.0] },
  { name: 'Space Opera',     genreW: [0.9, 1.0, 1.0, 0.7, 0.8, 0.6], audienceW: [0.8, 1.0, 1.0] },
  { name: 'Multiverse',      genreW: [0.8, 1.0, 1.0, 0.6, 0.7, 0.6], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Biotech',         genreW: [0.7, 0.8, 0.8, 1.0, 0.9, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Robot Uprising',  genreW: [1.0, 0.9, 0.8, 0.7, 0.9, 0.6], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Starship',        genreW: [1.0, 0.9, 0.7, 1.0, 0.9, 0.6], audienceW: [0.8, 1.0, 0.9] },
  { name: 'Wormhole',        genreW: [0.8, 1.0, 0.9, 0.7, 0.8, 0.6], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Terraform',       genreW: [0.6, 0.7, 0.7, 1.0, 1.0, 0.7], audienceW: [0.7, 1.0, 1.0] },
  { name: 'First Contact',   genreW: [0.7, 1.0, 0.9, 0.7, 0.8, 0.6], audienceW: [0.8, 1.0, 1.0] },
  { name: 'Galactic War',    genreW: [1.0, 0.8, 0.8, 0.7, 1.0, 0.6], audienceW: [0.7, 0.9, 1.0] },
  { name: 'Nanobots',        genreW: [0.8, 0.7, 0.7, 1.0, 0.9, 0.6], audienceW: [0.6, 0.9, 1.0] },
  { name: 'Solar System',    genreW: [0.7, 0.8, 0.7, 1.0, 1.0, 0.7], audienceW: [0.9, 1.0, 0.8] },
  { name: 'Space Station',   genreW: [0.7, 0.8, 0.7, 1.0, 0.9, 0.6], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Meteor',          genreW: [1.0, 0.8, 0.6, 0.7, 0.8, 0.6], audienceW: [0.8, 1.0, 0.9] },
  { name: 'Black Hole',      genreW: [0.8, 0.9, 0.8, 0.8, 0.9, 0.6], audienceW: [0.7, 1.0, 1.0] },

  // ── Fantasy (10 more) ────────────────────────────────────────
  { name: 'Dungeon Crawler', genreW: [1.0, 0.9, 1.0, 0.6, 0.8, 0.6], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Elf Kingdom',     genreW: [0.7, 1.0, 1.0, 0.7, 0.8, 0.7], audienceW: [0.9, 1.0, 0.8] },
  { name: 'Orc Wars',        genreW: [1.0, 0.8, 0.9, 0.6, 1.0, 0.6], audienceW: [0.7, 0.9, 1.0] },
  { name: 'Magic Academy',   genreW: [0.7, 0.9, 1.0, 0.8, 0.7, 0.8], audienceW: [1.0, 1.0, 0.7] },
  { name: 'Crystal Quest',   genreW: [0.9, 1.0, 0.9, 0.6, 0.7, 0.7], audienceW: [0.9, 1.0, 0.8] },
  { name: 'Enchanted Forest',genreW: [0.7, 1.0, 0.9, 0.7, 0.6, 0.8], audienceW: [1.0, 1.0, 0.7] },
  { name: 'Mythical Beasts', genreW: [0.9, 0.9, 1.0, 0.6, 0.7, 0.7], audienceW: [0.8, 1.0, 0.9] },
  { name: 'Sorcery',         genreW: [0.8, 0.9, 1.0, 0.6, 0.8, 0.6], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Elemental Power', genreW: [1.0, 0.8, 1.0, 0.6, 0.8, 0.7], audienceW: [0.9, 1.0, 0.8] },
  { name: 'Dark Lord',       genreW: [1.0, 0.9, 1.0, 0.6, 0.9, 0.6], audienceW: [0.6, 0.9, 1.0] },

  // ── Modern (15 more) ─────────────────────────────────────────
  { name: 'Taxi Driver',     genreW: [0.7, 0.7, 0.6, 1.0, 0.6, 0.8], audienceW: [0.8, 1.0, 0.9] },
  { name: 'Firefighter',     genreW: [0.8, 0.7, 0.6, 1.0, 0.7, 0.7], audienceW: [0.9, 1.0, 0.8] },
  { name: 'Construction',    genreW: [0.6, 0.6, 0.6, 1.0, 0.8, 0.7], audienceW: [0.7, 1.0, 0.9] },
  { name: 'Mining',          genreW: [0.7, 0.7, 0.6, 1.0, 0.9, 0.7], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Trucking',        genreW: [0.6, 0.6, 0.6, 1.0, 0.7, 0.8], audienceW: [0.7, 1.0, 0.9] },
  { name: 'Farming',         genreW: [0.6, 0.7, 0.7, 1.0, 0.7, 1.0], audienceW: [0.9, 1.0, 0.7] },
  { name: 'Fishing',         genreW: [0.6, 0.7, 0.6, 1.0, 0.6, 1.0], audienceW: [0.8, 1.0, 0.8] },
  { name: 'Bakery',          genreW: [0.6, 0.6, 0.6, 1.0, 0.6, 1.0], audienceW: [1.0, 1.0, 0.6] },
  { name: 'Coffee Shop',     genreW: [0.6, 0.6, 0.6, 1.0, 0.7, 1.0], audienceW: [0.9, 1.0, 0.7] },
  { name: 'Car Mechanic',    genreW: [0.6, 0.6, 0.6, 1.0, 0.7, 0.8], audienceW: [0.7, 1.0, 0.9] },
  { name: 'Barber',          genreW: [0.6, 0.6, 0.6, 1.0, 0.6, 0.9], audienceW: [0.8, 1.0, 0.7] },
  { name: 'Lawyer',          genreW: [0.6, 0.8, 0.7, 1.0, 0.8, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Teacher',         genreW: [0.6, 0.7, 0.7, 1.0, 0.7, 0.8], audienceW: [0.9, 1.0, 0.7] },
  { name: 'Doctor',          genreW: [0.6, 0.7, 0.7, 1.0, 0.7, 0.7], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Plumber',         genreW: [0.7, 0.6, 0.6, 1.0, 0.6, 0.9], audienceW: [0.9, 1.0, 0.7] },

  // ── Horror (8 more) ──────────────────────────────────────────
  { name: 'Alien Horror',    genreW: [1.0, 1.0, 0.7, 0.6, 0.6, 0.6], audienceW: [0.6, 0.7, 1.0] },
  { name: 'Psychological',   genreW: [0.7, 1.0, 0.8, 0.6, 0.6, 0.6], audienceW: [0.5, 0.7, 1.0] },
  { name: 'Survival Horror', genreW: [1.0, 1.0, 0.8, 0.6, 0.7, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Found Footage',   genreW: [0.6, 1.0, 0.7, 0.6, 0.6, 0.6], audienceW: [0.5, 0.8, 1.0] },
  { name: 'Cosmic Horror',   genreW: [0.8, 1.0, 0.9, 0.6, 0.7, 0.6], audienceW: [0.5, 0.7, 1.0] },
  { name: 'Plague',          genreW: [0.7, 0.8, 0.7, 0.9, 1.0, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Dark Forest',     genreW: [0.9, 1.0, 0.8, 0.6, 0.6, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Asylum',          genreW: [0.8, 1.0, 0.7, 0.6, 0.6, 0.6], audienceW: [0.5, 0.7, 1.0] },

  // ── Sports (8 more) ──────────────────────────────────────────
  { name: 'Formula Racing',  genreW: [1.0, 0.6, 0.6, 1.0, 0.7, 0.8], audienceW: [0.9, 1.0, 0.9] },
  { name: 'Basketball',      genreW: [1.0, 0.6, 0.6, 1.0, 0.7, 0.9], audienceW: [1.0, 1.0, 0.8] },
  { name: 'American Football',genreW:[1.0, 0.6, 0.6, 1.0, 0.8, 0.8], audienceW: [0.9, 1.0, 0.9] },
  { name: 'Cricket',         genreW: [0.8, 0.6, 0.6, 1.0, 0.8, 0.8], audienceW: [0.8, 1.0, 0.8] },
  { name: 'Rugby',           genreW: [1.0, 0.6, 0.6, 1.0, 0.7, 0.8], audienceW: [0.9, 1.0, 0.9] },
  { name: 'Volleyball',      genreW: [0.8, 0.6, 0.6, 1.0, 0.6, 0.9], audienceW: [1.0, 1.0, 0.7] },
  { name: 'Swimming',        genreW: [0.7, 0.6, 0.6, 1.0, 0.6, 0.9], audienceW: [1.0, 1.0, 0.7] },
  { name: 'Olympics',        genreW: [1.0, 0.7, 0.6, 1.0, 0.7, 0.9], audienceW: [1.0, 1.0, 0.8] },

  // ── Casual (10 more) ─────────────────────────────────────────
  { name: 'Bubble Pop',      genreW: [0.6, 0.6, 0.6, 0.7, 0.6, 1.0], audienceW: [1.0, 1.0, 0.6] },
  { name: 'Match-3',         genreW: [0.6, 0.6, 0.6, 0.7, 0.7, 1.0], audienceW: [1.0, 1.0, 0.6] },
  { name: 'Idle Clicker',    genreW: [0.6, 0.6, 0.6, 0.8, 0.7, 1.0], audienceW: [0.9, 1.0, 0.7] },
  { name: 'Tower Defense',   genreW: [0.7, 0.6, 0.6, 0.7, 1.0, 0.9], audienceW: [0.9, 1.0, 0.8] },
  { name: 'Word Game',       genreW: [0.6, 0.6, 0.6, 0.8, 0.8, 1.0], audienceW: [0.8, 1.0, 0.7] },
  { name: 'Coloring',        genreW: [0.6, 0.6, 0.6, 0.7, 0.6, 1.0], audienceW: [1.0, 0.9, 0.5] },
  { name: 'Dress Up',        genreW: [0.6, 0.6, 0.6, 0.8, 0.6, 1.0], audienceW: [1.0, 0.9, 0.5] },
  { name: 'Home Design',     genreW: [0.6, 0.6, 0.6, 1.0, 0.7, 1.0], audienceW: [0.8, 1.0, 0.7] },
  { name: 'City Builder',    genreW: [0.6, 0.7, 0.6, 1.0, 1.0, 0.8], audienceW: [0.8, 1.0, 0.9] },
  { name: 'Sandbox',         genreW: [0.7, 0.8, 0.7, 1.0, 0.8, 1.0], audienceW: [1.0, 1.0, 0.8] },

  // ── Science (8 more) ─────────────────────────────────────────
  { name: 'DNA',             genreW: [0.6, 0.7, 0.7, 1.0, 0.9, 0.6], audienceW: [0.6, 0.9, 1.0] },
  { name: 'Robotics',        genreW: [0.8, 0.7, 0.7, 1.0, 0.9, 0.7], audienceW: [0.8, 1.0, 0.9] },
  { name: 'Space Program',   genreW: [0.7, 0.8, 0.7, 1.0, 1.0, 0.6], audienceW: [0.8, 1.0, 1.0] },
  { name: 'Weather',         genreW: [0.6, 0.7, 0.6, 1.0, 0.8, 0.7], audienceW: [0.7, 1.0, 0.8] },
  { name: 'Marine Biology',  genreW: [0.6, 0.8, 0.7, 1.0, 0.7, 0.8], audienceW: [0.9, 1.0, 0.7] },
  { name: 'Geology',         genreW: [0.6, 0.7, 0.6, 1.0, 0.8, 0.7], audienceW: [0.7, 1.0, 0.8] },
  { name: 'Astronomy',       genreW: [0.6, 0.8, 0.7, 1.0, 0.9, 0.7], audienceW: [0.8, 1.0, 0.9] },
  { name: 'Chemistry',       genreW: [0.6, 0.7, 0.6, 1.0, 0.8, 0.7], audienceW: [0.7, 0.9, 1.0] },

  // ── Military (6 more) ────────────────────────────────────────
  { name: 'Tank Commander',  genreW: [1.0, 0.7, 0.6, 1.0, 1.0, 0.6], audienceW: [0.7, 0.9, 1.0] },
  { name: 'Naval Warfare',   genreW: [1.0, 0.7, 0.7, 1.0, 1.0, 0.6], audienceW: [0.6, 0.9, 1.0] },
  { name: 'Air Combat',      genreW: [1.0, 0.7, 0.6, 1.0, 0.9, 0.6], audienceW: [0.8, 1.0, 1.0] },
  { name: 'Special Forces',  genreW: [1.0, 0.8, 0.7, 0.7, 0.8, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Sniper',          genreW: [1.0, 0.7, 0.6, 0.8, 0.7, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Siege',           genreW: [0.9, 0.7, 0.7, 0.8, 1.0, 0.6], audienceW: [0.7, 0.9, 1.0] },

  // ── Music (5 more) ───────────────────────────────────────────
  { name: 'DJ',              genreW: [0.6, 0.6, 0.6, 1.0, 0.6, 1.0], audienceW: [1.0, 1.0, 0.8] },
  { name: 'Orchestra',       genreW: [0.6, 0.7, 0.6, 1.0, 0.6, 0.8], audienceW: [0.7, 1.0, 0.9] },
  { name: 'Rock Band',       genreW: [0.7, 0.7, 0.6, 1.0, 0.6, 1.0], audienceW: [1.0, 1.0, 0.8] },
  { name: 'Rap',             genreW: [0.6, 0.6, 0.6, 1.0, 0.6, 1.0], audienceW: [1.0, 1.0, 0.8] },
  { name: 'Opera',           genreW: [0.6, 0.7, 0.7, 1.0, 0.6, 0.7], audienceW: [0.6, 0.9, 1.0] },

  // ── Misc (15 more) ───────────────────────────────────────────
  { name: 'Time Loop',       genreW: [0.8, 1.0, 0.9, 0.6, 0.7, 0.6], audienceW: [0.8, 1.0, 1.0] },
  { name: 'Dimension Hopping',genreW:[0.8, 1.0, 1.0, 0.6, 0.7, 0.6], audienceW: [0.8, 1.0, 0.9] },
  { name: 'Dream World',     genreW: [0.7, 1.0, 0.9, 0.7, 0.6, 0.7], audienceW: [0.9, 1.0, 0.9] },
  { name: 'Simulation Theory',genreW:[0.6, 0.8, 0.8, 1.0, 0.9, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Conspiracy',      genreW: [0.7, 1.0, 0.8, 0.6, 0.7, 0.6], audienceW: [0.6, 0.9, 1.0] },
  { name: 'Urban Legend',     genreW: [0.8, 1.0, 0.8, 0.6, 0.6, 0.6], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Underground',     genreW: [0.8, 0.8, 0.7, 0.7, 0.7, 0.6], audienceW: [0.6, 0.9, 1.0] },
  { name: 'Survival Island', genreW: [0.9, 1.0, 0.8, 0.8, 0.8, 0.7], audienceW: [0.8, 1.0, 1.0] },
  { name: 'Train',           genreW: [0.6, 0.7, 0.6, 1.0, 0.8, 0.8], audienceW: [0.8, 1.0, 0.8] },
  { name: 'Submarine',       genreW: [0.8, 0.8, 0.7, 1.0, 0.9, 0.6], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Spaceship Building',genreW:[0.6, 0.7, 0.7, 1.0, 0.9, 0.7], audienceW: [0.8, 1.0, 0.9] },
  { name: 'Colony Management',genreW:[0.6, 0.7, 0.7, 1.0, 1.0, 0.7], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Zoo',             genreW: [0.6, 0.7, 0.6, 1.0, 0.8, 1.0], audienceW: [1.0, 1.0, 0.6] },
  { name: 'Aquarium',        genreW: [0.6, 0.7, 0.6, 1.0, 0.7, 1.0], audienceW: [1.0, 1.0, 0.6] },
  { name: 'Theme Park',      genreW: [0.6, 0.7, 0.6, 1.0, 0.8, 1.0], audienceW: [1.0, 1.0, 0.7] },
];

/**
 * Platforms — parody names with lifecycle dates, market share, costs, genre/audience weightings.
 * Dates in format Y/M/W (Year/Month/Week).
 */
const PLATFORMS = [
  {
    id: 'govodore',     name: 'Govodore 64',    company: 'Govodore',
    published: '1/1/1', retireDate: '4/6/1',
    licenseFee: 0,      devCost: 2000,      techLevel: 1,
    unitsSold: 12,
    genreW: [0.8, 0.9, 0.8, 0.7, 0.8, 0.9],
    audienceW: [0.9, 1.0, 0.7],
    marketCurve: [[1,1, 0.05], [2,1, 0.15], [3,1, 0.08], [4,6, 0.01]],
  },
  {
    id: 'pc',           name: 'PC',              company: 'Various',
    published: '1/1/1', retireDate: '99/1/1',
    licenseFee: 0,      devCost: 5000,      techLevel: 2,
    unitsSold: 300,
    genreW: [0.9, 1.0, 1.0, 1.0, 1.0, 0.8],
    audienceW: [0.7, 1.0, 1.0],
    marketCurve: [[1,1, 0.05], [5,1, 0.12], [10,1, 0.20], [15,1, 0.30], [20,1, 0.35], [25,1, 0.30], [30,1, 0.25]],
  },
  {
    id: 'tes',          name: 'TES',             company: 'Ninvento',
    published: '1/5/1', retireDate: '6/6/1',
    licenseFee: 5000,   devCost: 8000,      techLevel: 1,
    unitsSold: 62,
    genreW: [1.0, 0.9, 0.9, 0.7, 0.8, 0.9],
    audienceW: [1.0, 1.0, 0.7],
    marketCurve: [[1,5, 0.02], [2,6, 0.20], [4,1, 0.30], [5,6, 0.15], [6,6, 0.02]],
  },
  {
    id: 'master_v',     name: 'Master V',        company: 'Vena',
    published: '2/1/1', retireDate: '7/1/1',
    licenseFee: 5000,   devCost: 8000,      techLevel: 1,
    unitsSold: 13,
    genreW: [1.0, 0.8, 0.8, 0.7, 0.7, 0.8],
    audienceW: [1.0, 0.9, 0.8],
    marketCurve: [[2,1, 0.01], [3,1, 0.08], [5,1, 0.10], [6,1, 0.05], [7,1, 0.01]],
  },
  {
    id: 'super_tes',    name: 'Super TES',       company: 'Ninvento',
    published: '4/1/1', retireDate: '10/1/1',
    licenseFee: 10000,  devCost: 15000,     techLevel: 3,
    unitsSold: 49,
    genreW: [1.0, 1.0, 1.0, 0.8, 0.9, 0.9],
    audienceW: [1.0, 1.0, 0.8],
    marketCurve: [[4,1, 0.02], [5,6, 0.20], [7,1, 0.25], [8,6, 0.15], [10,1, 0.02]],
  },
  {
    id: 'gameling',     name: 'Gameling',        company: 'Ninvento',
    published: '3/6/1', retireDate: '9/1/1',
    licenseFee: 5000,   devCost: 6000,      techLevel: 1,
    unitsSold: 118,
    genreW: [0.8, 0.9, 0.9, 0.7, 0.8, 1.0],
    audienceW: [1.0, 0.9, 0.6],
    marketCurve: [[3,6, 0.02], [5,1, 0.15], [7,1, 0.20], [8,1, 0.10], [9,1, 0.02]],
  },
  {
    id: 'mega_drive',   name: 'Mega Drive',      company: 'Vena',
    published: '4/6/1', retireDate: '10/6/1',
    licenseFee: 10000,  devCost: 15000,     techLevel: 3,
    unitsSold: 30,
    genreW: [1.0, 0.8, 0.8, 0.7, 0.8, 0.8],
    audienceW: [1.0, 1.0, 0.9],
    marketCurve: [[4,6, 0.01], [6,1, 0.12], [8,1, 0.15], [9,6, 0.08], [10,6, 0.01]],
  },
  {
    id: 'playsystem',   name: 'PlaySystem',      company: 'Vonny',
    published: '7/6/1', retireDate: '14/1/1',
    licenseFee: 25000,  devCost: 25000,     techLevel: 5,
    unitsSold: 102,
    genreW: [1.0, 1.0, 1.0, 0.8, 0.9, 0.7],
    audienceW: [0.9, 1.0, 1.0],
    marketCurve: [[7,6, 0.01], [9,1, 0.15], [11,1, 0.25], [12,6, 0.20], [14,1, 0.02]],
  },
  {
    id: 'nuu64',        name: 'Nuu 64',          company: 'Ninvento',
    published: '8/1/1', retireDate: '13/1/1',
    licenseFee: 20000,  devCost: 20000,     techLevel: 5,
    unitsSold: 33,
    genreW: [1.0, 0.9, 0.8, 0.7, 0.8, 0.9],
    audienceW: [1.0, 1.0, 0.7],
    marketCurve: [[8,1, 0.01], [9,6, 0.12], [11,1, 0.15], [12,1, 0.08], [13,1, 0.02]],
  },
  {
    id: 'dreamvast',    name: 'DreamVast',       company: 'Vena',
    published: '10/6/1',retireDate: '14/6/1',
    licenseFee: 15000,  devCost: 20000,     techLevel: 5,
    unitsSold: 10,
    genreW: [1.0, 0.9, 0.9, 0.8, 0.9, 0.8],
    audienceW: [0.9, 1.0, 0.9],
    marketCurve: [[10,6, 0.01], [11,6, 0.08], [12,6, 0.05], [13,6, 0.02], [14,6, 0.01]],
  },
  {
    id: 'playsystem2',  name: 'PlaySystem 2',    company: 'Vonny',
    published: '12/1/1',retireDate: '19/1/1',
    licenseFee: 35000,  devCost: 40000,     techLevel: 7,
    unitsSold: 155,
    genreW: [1.0, 1.0, 1.0, 0.9, 0.9, 0.8],
    audienceW: [0.9, 1.0, 1.0],
    marketCurve: [[12,1, 0.01], [13,6, 0.15], [15,1, 0.30], [17,1, 0.25], [18,6, 0.10], [19,1, 0.02]],
  },
  {
    id: 'game_sphere',  name: 'Game Sphere',     company: 'Ninvento',
    published: '12/6/1',retireDate: '18/1/1',
    licenseFee: 30000,  devCost: 35000,     techLevel: 7,
    unitsSold: 22,
    genreW: [1.0, 1.0, 1.0, 0.8, 0.8, 0.9],
    audienceW: [1.0, 1.0, 0.8],
    marketCurve: [[12,6, 0.01], [14,1, 0.10], [15,6, 0.12], [17,1, 0.06], [18,1, 0.01]],
  },
  {
    id: 'mbox',         name: 'mBox',            company: 'Micronoft',
    published: '12/6/1',retireDate: '18/6/1',
    licenseFee: 35000,  devCost: 40000,     techLevel: 7,
    unitsSold: 24,
    genreW: [1.0, 0.9, 0.9, 0.8, 0.9, 0.7],
    audienceW: [0.8, 1.0, 1.0],
    marketCurve: [[12,6, 0.01], [14,1, 0.10], [16,1, 0.15], [17,6, 0.08], [18,6, 0.01]],
  },
  {
    id: 'gs',           name: 'GS',              company: 'Ninvento',
    published: '16/1/1',retireDate: '23/1/1',
    licenseFee: 15000,  devCost: 15000,     techLevel: 6,
    unitsSold: 154,
    genreW: [0.8, 0.9, 0.9, 0.8, 0.8, 1.0],
    audienceW: [1.0, 0.9, 0.6],
    marketCurve: [[16,1, 0.01], [17,6, 0.12], [19,1, 0.20], [21,1, 0.15], [22,6, 0.05], [23,1, 0.01]],
  },
  {
    id: 'grphone',      name: 'grPhone',         company: 'Grapple',
    published: '17/6/1',retireDate: '99/1/1',
    licenseFee: 5000,   devCost: 10000,     techLevel: 6,
    unitsSold: 500,
    genreW: [0.7, 0.7, 0.6, 0.8, 0.7, 1.0],
    audienceW: [1.0, 1.0, 0.6],
    marketCurve: [[17,6, 0.01], [19,1, 0.10], [21,1, 0.25], [24,1, 0.35], [28,1, 0.30]],
  },
  {
    id: 'playsystem3',  name: 'PlaySystem 3',    company: 'Vonny',
    published: '17/1/1',retireDate: '24/1/1',
    licenseFee: 50000,  devCost: 60000,     techLevel: 9,
    unitsSold: 87,
    genreW: [1.0, 1.0, 1.0, 0.8, 0.9, 0.7],
    audienceW: [0.8, 1.0, 1.0],
    marketCurve: [[17,1, 0.01], [18,6, 0.10], [20,1, 0.20], [22,1, 0.22], [23,6, 0.10], [24,1, 0.02]],
  },
  {
    id: 'mbox_next',    name: 'mBox Next',       company: 'Micronoft',
    published: '16/6/1',retireDate: '24/1/1',
    licenseFee: 50000,  devCost: 60000,     techLevel: 9,
    unitsSold: 84,
    genreW: [1.0, 0.9, 0.9, 0.8, 0.9, 0.7],
    audienceW: [0.8, 1.0, 1.0],
    marketCurve: [[16,6, 0.01], [18,1, 0.12], [20,1, 0.22], [22,1, 0.20], [23,6, 0.08], [24,1, 0.02]],
  },
  {
    id: 'wuu',          name: 'Wuu',             company: 'Ninvento',
    published: '17/6/1',retireDate: '23/6/1',
    licenseFee: 20000,  devCost: 25000,     techLevel: 7,
    unitsSold: 101,
    genreW: [0.8, 0.9, 0.8, 0.9, 0.7, 1.0],
    audienceW: [1.0, 1.0, 0.7],
    marketCurve: [[17,6, 0.01], [18,6, 0.12], [20,1, 0.18], [21,6, 0.12], [23,1, 0.04], [23,6, 0.01]],
  },
  {
    id: 'playsystem4',  name: 'PlaySystem 4',    company: 'Vonny',
    published: '23/1/1',retireDate: '32/1/1',
    licenseFee: 60000,  devCost: 80000,     techLevel: 11,
    unitsSold: 120,
    genreW: [1.0, 1.0, 1.0, 0.9, 0.9, 0.7],
    audienceW: [0.8, 1.0, 1.0],
    marketCurve: [[23,1, 0.01], [24,6, 0.10], [26,1, 0.22], [28,1, 0.28], [30,1, 0.20], [32,1, 0.05]],
  },
  {
    id: 'mbox_one',     name: 'mBox One',        company: 'Micronoft',
    published: '23/6/1',retireDate: '32/1/1',
    licenseFee: 60000,  devCost: 80000,     techLevel: 11,
    unitsSold: 50,
    genreW: [1.0, 0.9, 0.9, 0.8, 0.9, 0.7],
    audienceW: [0.8, 1.0, 1.0],
    marketCurve: [[23,6, 0.01], [25,1, 0.08], [27,1, 0.18], [29,1, 0.15], [31,1, 0.08], [32,1, 0.02]],
  },
  {
    id: 'nuu_console',  name: 'Nuu',             company: 'Ninvento',
    published: '23/1/1',retireDate: '30/1/1',
    licenseFee: 25000,  devCost: 30000,     techLevel: 8,
    unitsSold: 14,
    genreW: [0.8, 0.9, 0.8, 0.9, 0.7, 1.0],
    audienceW: [1.0, 1.0, 0.7],
    marketCurve: [[23,1, 0.01], [24,6, 0.06], [26,1, 0.08], [28,1, 0.04], [30,1, 0.01]],
  },
];

// Staff name pools
const STAFF_FIRST_NAMES = [
  'Alex', 'Jordan', 'Morgan', 'Casey', 'Taylor', 'Riley', 'Quinn', 'Avery',
  'Cameron', 'Drew', 'Reese', 'Sage', 'Blake', 'Harper', 'Rowan', 'Emery',
  'Skyler', 'Finley', 'Dakota', 'Hayden', 'Jamie', 'Kendall', 'Logan', 'Parker',
  'Peyton', 'River', 'Robin', 'Sawyer', 'Sidney', 'Spencer',
];

const STAFF_LAST_NAMES = [
  'Chen', 'Kim', 'Park', 'Nakamura', 'Singh', 'Patel', 'Williams', 'Johnson',
  'Garcia', 'Martinez', 'Rodriguez', 'Lee', 'Brown', 'Davis', 'Miller', 'Wilson',
  'Moore', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Clark', 'Lewis',
  'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright',
];

// Helper: parse date string "Y/M/W" to total weeks
function dateToWeek(dateStr) {
  const parts = dateStr.split('/').map(Number);
  return (parts[0] - 1) * 48 + (parts[1] - 1) * 4 + (parts[2] - 1);
}

// Helper: get market share for a platform at a given total week
function getPlatformMarketShare(platform, totalWeek) {
  const curve = platform.marketCurve;
  if (!curve || curve.length === 0) return 0;

  // Convert curve points to total weeks
  const points = curve.map(p => ({
    week: (p[0] - 1) * 48 + ((p[1] || 1) - 1) * 4,
    share: p[2],
  }));

  if (totalWeek <= points[0].week) return points[0].share;
  if (totalWeek >= points[points.length - 1].week) return points[points.length - 1].share;

  // Linear interpolation
  for (let i = 0; i < points.length - 1; i++) {
    if (totalWeek >= points[i].week && totalWeek < points[i + 1].week) {
      const t = (totalWeek - points[i].week) / (points[i + 1].week - points[i].week);
      return points[i].share + t * (points[i + 1].share - points[i].share);
    }
  }
  return 0;
}

// Helper: check if platform is available at a given date
function isPlatformAvailable(platform, totalWeek) {
  const pubWeek = dateToWeek(platform.published);
  const retWeek = dateToWeek(platform.retireDate);
  return totalWeek >= pubWeek && totalWeek < retWeek;
}
