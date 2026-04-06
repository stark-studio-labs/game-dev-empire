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
  { name: 'Polish', aspects: [] },
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
 * Topics — 85 curated topics across 3 unlock tiers (per PROGRESSION.md).
 * tier 1: 30 starter topics (Garage era, available from Y1)
 * tier 2: 26 topics (unlock at Small Office)
 * tier 3: 29 topics (unlock via Research at Medium Office+)
 *
 * genreW: [Action, Adventure, RPG, Sim, Strategy, Casual]
 * audienceW: [Young, Everyone, Mature]
 * Values: 1.0 = Great, 0.9 = Good, 0.8 = Okay, 0.7 = Bad, 0.6 = Terrible
 *
 * Tier 3 extras:
 *   researchCategory — maps to a RESEARCH_CATEGORIES entry (actual research system)
 *   researchCount    — # of completed items in that category required
 *   unlockRequirement — display string shown in UI when locked
 */
const TOPICS = [
  // ── Tier 1: Starter (10 topics, available from Y1) ───────────────────────
  { name: 'Fantasy',          tier: 1, genreW: [0.8, 1.0, 1.0, 0.7, 0.9, 0.7], audienceW: [0.9, 1.0, 0.9] },
  { name: 'Sci-Fi',           tier: 1, genreW: [1.0, 0.9, 1.0, 0.8, 1.0, 0.6], audienceW: [0.8, 1.0, 1.0] },
  { name: 'Sports',           tier: 1, genreW: [1.0, 0.6, 0.6, 1.0, 0.6, 1.0], audienceW: [1.0, 1.0, 0.8] },
  { name: 'Racing',           tier: 1, genreW: [1.0, 0.6, 0.6, 1.0, 0.6, 1.0], audienceW: [1.0, 1.0, 0.8] },
  { name: 'Comedy',           tier: 1, genreW: [0.7, 1.0, 0.8, 0.7, 0.6, 1.0], audienceW: [0.9, 1.0, 0.9] },
  { name: 'Medieval',         tier: 1, genreW: [1.0, 1.0, 1.0, 0.7, 1.0, 0.6], audienceW: [0.8, 1.0, 1.0] },
  { name: 'Zombies',          tier: 1, genreW: [1.0, 1.0, 0.8, 0.6, 0.8, 0.7], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Space',            tier: 1, genreW: [1.0, 0.8, 0.8, 1.0, 1.0, 0.6], audienceW: [0.8, 1.0, 1.0] },
  { name: 'Superheroes',      tier: 1, genreW: [1.0, 0.9, 0.9, 0.6, 0.6, 0.7], audienceW: [1.0, 1.0, 0.8] },
  { name: 'Mystery',          tier: 1, genreW: [0.7, 1.0, 1.0, 0.6, 0.7, 0.6], audienceW: [0.8, 1.0, 1.0] },

  // ── Tier 2: First Hire (8 topics, unlock when first staff hired) ──────────
  { name: 'Horror',           tier: 2, unlockRequirement: 'Hire First Staff', genreW: [1.0, 1.0, 0.7, 0.6, 0.6, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Wild West',        tier: 2, unlockRequirement: 'Hire First Staff', genreW: [1.0, 1.0, 0.9, 0.6, 0.7, 0.6], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Pirate',           tier: 2, unlockRequirement: 'Hire First Staff', genreW: [0.8, 1.0, 0.8, 0.7, 0.7, 0.7], audienceW: [0.9, 1.0, 0.8] },
  { name: 'Ninja',            tier: 2, unlockRequirement: 'Hire First Staff', genreW: [1.0, 0.8, 0.8, 0.6, 0.6, 0.7], audienceW: [0.9, 1.0, 0.8] },
  { name: 'Detective',        tier: 2, unlockRequirement: 'Hire First Staff', genreW: [0.7, 1.0, 1.0, 0.6, 0.7, 0.6], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Music',            tier: 2, unlockRequirement: 'Hire First Staff', genreW: [0.6, 0.6, 0.6, 1.0, 0.6, 1.0], audienceW: [1.0, 1.0, 0.7] },
  { name: 'School',           tier: 2, unlockRequirement: 'Hire First Staff', genreW: [0.7, 0.8, 1.0, 1.0, 0.6, 0.8], audienceW: [1.0, 1.0, 0.6] },
  { name: 'Virtual Pet',      tier: 2, unlockRequirement: 'Hire First Staff', genreW: [0.6, 0.6, 0.6, 1.0, 0.6, 1.0], audienceW: [1.0, 0.8, 0.6] },

  // ── Tier 3: Small Office (12 topics, unlock at Small Office) ─────────────
  { name: 'Spy',              tier: 3, unlockRequirement: 'Small Office', genreW: [1.0, 1.0, 0.7, 0.6, 0.7, 0.6], audienceW: [0.8, 1.0, 1.0] },
  { name: 'History',          tier: 3, unlockRequirement: 'Small Office', genreW: [0.7, 0.8, 0.8, 1.0, 1.0, 0.6], audienceW: [0.6, 0.9, 1.0] },
  { name: 'Business',         tier: 3, unlockRequirement: 'Small Office', genreW: [0.6, 0.6, 0.6, 1.0, 1.0, 0.7], audienceW: [0.6, 0.8, 1.0] },
  { name: 'City',             tier: 3, unlockRequirement: 'Small Office', genreW: [0.6, 0.7, 0.6, 1.0, 1.0, 0.7], audienceW: [0.8, 1.0, 1.0] },
  { name: 'Life',             tier: 3, unlockRequirement: 'Small Office', genreW: [0.6, 1.0, 0.7, 1.0, 0.6, 0.9], audienceW: [0.9, 1.0, 0.8] },
  { name: 'Romance',          tier: 3, unlockRequirement: 'Small Office', genreW: [0.6, 1.0, 0.8, 0.7, 0.6, 0.7], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Cooking',          tier: 3, unlockRequirement: 'Small Office', genreW: [0.6, 0.6, 0.6, 1.0, 0.6, 1.0], audienceW: [1.0, 1.0, 0.7] },
  { name: 'Dance',            tier: 3, unlockRequirement: 'Small Office', genreW: [0.7, 0.6, 0.6, 1.0, 0.6, 1.0], audienceW: [1.0, 1.0, 0.6] },
  { name: 'Hospital',         tier: 3, unlockRequirement: 'Small Office', genreW: [0.6, 0.6, 0.6, 1.0, 0.7, 0.7], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Prison',           tier: 3, unlockRequirement: 'Small Office', genreW: [0.7, 0.7, 0.7, 1.0, 1.0, 0.6], audienceW: [0.6, 0.7, 1.0] },
  { name: 'Theme Park',       tier: 3, unlockRequirement: 'Small Office', genreW: [0.6, 0.7, 0.6, 1.0, 0.8, 1.0], audienceW: [1.0, 1.0, 0.7] },
  { name: 'Aliens',           tier: 3, unlockRequirement: 'Small Office', genreW: [1.0, 0.8, 1.0, 0.7, 1.0, 0.6], audienceW: [0.7, 1.0, 1.0] },

  // ── Tier 4: Medium Office (10 topics, unlock at Medium Office) ───────────
  { name: 'Cyberpunk',        tier: 4, unlockRequirement: 'Medium Office', genreW: [1.0, 0.8, 1.0, 0.7, 0.7, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Time Travel',      tier: 4, unlockRequirement: 'Medium Office', genreW: [0.8, 1.0, 1.0, 0.6, 0.7, 0.6], audienceW: [0.9, 1.0, 0.9] },
  { name: 'Martial Arts',     tier: 4, unlockRequirement: 'Medium Office', genreW: [1.0, 0.7, 0.8, 1.0, 0.6, 1.0], audienceW: [0.9, 1.0, 0.9] },
  { name: 'Hacking',          tier: 4, unlockRequirement: 'Medium Office', genreW: [0.7, 0.7, 0.7, 1.0, 1.0, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Game Dev',         tier: 4, unlockRequirement: 'Medium Office', genreW: [0.6, 0.6, 0.6, 1.0, 0.7, 0.8], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Startups',         tier: 4, unlockRequirement: 'Medium Office', genreW: [0.6, 0.6, 0.6, 1.0, 0.8, 0.7], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Movies',           tier: 4, unlockRequirement: 'Medium Office', genreW: [0.6, 0.7, 0.6, 1.0, 0.6, 1.0], audienceW: [0.9, 1.0, 0.8] },
  { name: 'Fashion',          tier: 4, unlockRequirement: 'Medium Office', genreW: [0.6, 0.6, 0.6, 1.0, 0.6, 1.0], audienceW: [1.0, 1.0, 0.6] },
  { name: 'Law',              tier: 4, unlockRequirement: 'Medium Office', genreW: [0.6, 1.0, 0.7, 1.0, 0.7, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Sandbox',          tier: 4, unlockRequirement: 'Medium Office', genreW: [0.7, 0.8, 0.7, 1.0, 0.8, 1.0], audienceW: [1.0, 1.0, 0.8] },

  // ── Tier 5: Scale-Up (16 topics, unlock after 5+ games shipped) ──────────
  { name: 'Vampire',          tier: 5, unlockRequirement: '5+ Games Shipped', genreW: [0.8, 0.9, 1.0, 0.6, 0.6, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Werewolf',         tier: 5, unlockRequirement: '5+ Games Shipped', genreW: [0.8, 0.8, 1.0, 0.6, 0.6, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Post Apocalyptic', tier: 5, unlockRequirement: '5+ Games Shipped', genreW: [1.0, 0.9, 1.0, 0.7, 0.8, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Evolution',        tier: 5, unlockRequirement: '5+ Games Shipped', genreW: [0.6, 0.7, 0.7, 1.0, 1.0, 0.7], audienceW: [0.8, 1.0, 0.9] },
  { name: 'Farming',          tier: 5, unlockRequirement: '5+ Games Shipped', genreW: [0.6, 0.7, 0.7, 1.0, 0.7, 1.0], audienceW: [0.9, 1.0, 0.7] },
  { name: 'Fishing',          tier: 5, unlockRequirement: '5+ Games Shipped', genreW: [0.6, 0.7, 0.6, 1.0, 0.6, 1.0], audienceW: [0.8, 1.0, 0.8] },
  { name: 'Tower Defense',    tier: 5, unlockRequirement: '5+ Games Shipped', genreW: [0.7, 0.6, 0.6, 0.7, 1.0, 0.9], audienceW: [0.9, 1.0, 0.8] },
  { name: 'City Builder',     tier: 5, unlockRequirement: '5+ Games Shipped', genreW: [0.6, 0.7, 0.6, 1.0, 1.0, 0.8], audienceW: [0.8, 1.0, 0.9] },
  { name: 'Zoo',              tier: 5, unlockRequirement: '5+ Games Shipped', genreW: [0.6, 0.7, 0.6, 1.0, 0.8, 1.0], audienceW: [1.0, 1.0, 0.6] },
  { name: 'Transport',        tier: 5, unlockRequirement: '5+ Games Shipped', genreW: [0.6, 0.6, 0.6, 1.0, 1.0, 0.7], audienceW: [0.8, 1.0, 1.0] },
  { name: 'Magic Academy',    tier: 5, unlockRequirement: '5+ Games Shipped', genreW: [0.7, 0.9, 1.0, 0.8, 0.7, 0.8], audienceW: [1.0, 1.0, 0.7] },
  { name: 'Hunting',          tier: 5, unlockRequirement: '5+ Games Shipped', genreW: [1.0, 0.7, 0.6, 1.0, 0.7, 0.7], audienceW: [0.8, 1.0, 1.0] },
  { name: 'UFO',              tier: 5, unlockRequirement: '5+ Games Shipped', genreW: [0.7, 0.8, 0.7, 0.7, 1.0, 0.6], audienceW: [0.8, 1.0, 1.0] },
  { name: 'Archaeology',      tier: 5, unlockRequirement: '5+ Games Shipped', genreW: [0.7, 1.0, 0.9, 0.7, 0.7, 0.6], audienceW: [0.8, 1.0, 0.9] },
  { name: 'Surgery',          tier: 5, unlockRequirement: '5+ Games Shipped', genreW: [0.6, 0.6, 0.6, 1.0, 0.6, 0.7], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Government',       tier: 5, unlockRequirement: '5+ Games Shipped', genreW: [0.6, 0.6, 0.6, 1.0, 1.0, 0.6], audienceW: [0.6, 0.7, 1.0] },

  // ── Tier 6: Large Office + Research (29 topics, unlock via Research at Large Office+) ──
  // unlockRequirement display string matches researchCategory + researchCount (kept in sync)
  { name: 'Space Opera',      tier: 6, unlockRequirement: 'Engine Research Lv2',    researchCategory: 'Engine',  researchCount: 2, genreW: [0.9, 1.0, 1.0, 0.7, 0.8, 0.6], audienceW: [0.8, 1.0, 1.0] },
  { name: 'Robot Uprising',   tier: 6, unlockRequirement: 'AI Research Lv2',        researchCategory: 'AI',      researchCount: 2, genreW: [1.0, 0.9, 0.8, 0.7, 0.9, 0.6], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Terraform',        tier: 6, unlockRequirement: 'Engine Research Lv3',    researchCategory: 'Engine',  researchCount: 3, genreW: [0.6, 0.7, 0.7, 1.0, 1.0, 0.7], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Multiverse',       tier: 6, unlockRequirement: 'Engine Research Lv4',    researchCategory: 'Engine',  researchCount: 4, genreW: [0.8, 1.0, 1.0, 0.6, 0.7, 0.6], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Biotech',          tier: 6, unlockRequirement: 'AI Research Lv2',        researchCategory: 'AI',      researchCount: 2, genreW: [0.7, 0.8, 0.8, 1.0, 0.9, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Nanobots',         tier: 6, unlockRequirement: 'AI Research Lv3',        researchCategory: 'AI',      researchCount: 3, genreW: [0.8, 0.7, 0.7, 1.0, 0.9, 0.6], audienceW: [0.6, 0.9, 1.0] },
  { name: 'Colony Management',tier: 6, unlockRequirement: 'Engine Research Lv2',    researchCategory: 'Engine',  researchCount: 2, genreW: [0.6, 0.7, 0.7, 1.0, 1.0, 0.7], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Dungeon Crawler',  tier: 6, unlockRequirement: 'UX Research Lv1',        researchCategory: 'UX',      researchCount: 1, genreW: [1.0, 0.9, 1.0, 0.6, 0.8, 0.6], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Survival Horror',  tier: 6, unlockRequirement: 'Graphics Research Lv2',  researchCategory: 'Graphics',researchCount: 2, genreW: [1.0, 1.0, 0.8, 0.6, 0.7, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Psychological',    tier: 6, unlockRequirement: 'UX Research Lv3',        researchCategory: 'UX',      researchCount: 3, genreW: [0.7, 1.0, 0.8, 0.6, 0.6, 0.6], audienceW: [0.5, 0.7, 1.0] },
  { name: 'Cosmic Horror',    tier: 6, unlockRequirement: 'Graphics Research Lv3',  researchCategory: 'Graphics',researchCount: 3, genreW: [0.8, 1.0, 0.9, 0.6, 0.7, 0.6], audienceW: [0.5, 0.7, 1.0] },
  { name: 'Spaceship Building',tier: 6, unlockRequirement: 'Engine Research Lv2',   researchCategory: 'Engine',  researchCount: 2, genreW: [0.6, 0.7, 0.7, 1.0, 0.9, 0.7], audienceW: [0.8, 1.0, 0.9] },
  { name: 'Formula Racing',   tier: 6, unlockRequirement: 'Engine Research Lv2',    researchCategory: 'Engine',  researchCount: 2, genreW: [1.0, 0.6, 0.6, 1.0, 0.7, 0.8], audienceW: [0.9, 1.0, 0.9] },
  { name: 'Olympics',         tier: 6, unlockRequirement: 'Engine Research Lv3',    researchCategory: 'Engine',  researchCount: 3, genreW: [1.0, 0.7, 0.6, 1.0, 0.7, 0.9], audienceW: [1.0, 1.0, 0.8] },
  { name: 'Robotics',         tier: 6, unlockRequirement: 'AI Research Lv1',        researchCategory: 'AI',      researchCount: 1, genreW: [0.8, 0.7, 0.7, 1.0, 0.9, 0.7], audienceW: [0.8, 1.0, 0.9] },
  { name: 'DNA',              tier: 6, unlockRequirement: 'AI Research Lv1',        researchCategory: 'AI',      researchCount: 1, genreW: [0.6, 0.7, 0.7, 1.0, 0.9, 0.6], audienceW: [0.6, 0.9, 1.0] },
  { name: 'Space Program',    tier: 6, unlockRequirement: 'Engine Research Lv2',    researchCategory: 'Engine',  researchCount: 2, genreW: [0.7, 0.8, 0.7, 1.0, 1.0, 0.6], audienceW: [0.8, 1.0, 1.0] },
  { name: 'Chemistry',        tier: 6, unlockRequirement: 'AI Research Lv2',        researchCategory: 'AI',      researchCount: 2, genreW: [0.6, 0.7, 0.6, 1.0, 0.8, 0.7], audienceW: [0.7, 0.9, 1.0] },
  { name: 'Astronomy',        tier: 6, unlockRequirement: 'AI Research Lv1',        researchCategory: 'AI',      researchCount: 1, genreW: [0.6, 0.8, 0.7, 1.0, 0.9, 0.7], audienceW: [0.8, 1.0, 0.9] },
  { name: 'Construction',     tier: 6, unlockRequirement: 'Engine Research Lv1',    researchCategory: 'Engine',  researchCount: 1, genreW: [0.6, 0.6, 0.6, 1.0, 0.8, 0.7], audienceW: [0.7, 1.0, 0.9] },
  { name: 'Mining',           tier: 6, unlockRequirement: 'Engine Research Lv1',    researchCategory: 'Engine',  researchCount: 1, genreW: [0.7, 0.7, 0.6, 1.0, 0.9, 0.7], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Train',            tier: 6, unlockRequirement: 'Engine Research Lv1',    researchCategory: 'Engine',  researchCount: 1, genreW: [0.6, 0.7, 0.6, 1.0, 0.8, 0.8], audienceW: [0.8, 1.0, 0.8] },
  { name: 'Submarine',        tier: 6, unlockRequirement: 'Engine Research Lv2',    researchCategory: 'Engine',  researchCount: 2, genreW: [0.8, 0.8, 0.7, 1.0, 0.9, 0.6], audienceW: [0.7, 1.0, 1.0] },
  { name: 'Dream World',      tier: 6, unlockRequirement: 'UX Research Lv2',        researchCategory: 'UX',      researchCount: 2, genreW: [0.7, 1.0, 0.9, 0.7, 0.6, 0.7], audienceW: [0.9, 1.0, 0.9] },
  { name: 'Time Loop',        tier: 6, unlockRequirement: 'Engine Research Lv3',    researchCategory: 'Engine',  researchCount: 3, genreW: [0.8, 1.0, 0.9, 0.6, 0.7, 0.6], audienceW: [0.8, 1.0, 1.0] },
  { name: 'Conspiracy',       tier: 6, unlockRequirement: 'UX Research Lv1',        researchCategory: 'UX',      researchCount: 1, genreW: [0.7, 1.0, 0.8, 0.6, 0.7, 0.6], audienceW: [0.6, 0.9, 1.0] },
  { name: 'Dimension Hopping',tier: 6, unlockRequirement: 'Engine Research Lv4',    researchCategory: 'Engine',  researchCount: 4, genreW: [0.8, 1.0, 1.0, 0.6, 0.7, 0.6], audienceW: [0.8, 1.0, 0.9] },
  { name: 'Simulation Theory',tier: 6, unlockRequirement: 'AI Research Lv4',        researchCategory: 'AI',      researchCount: 4, genreW: [0.6, 0.8, 0.8, 1.0, 0.9, 0.6], audienceW: [0.6, 0.8, 1.0] },
  { name: 'Aquarium',         tier: 6, unlockRequirement: 'UX Research Lv1',        researchCategory: 'UX',      researchCount: 1, genreW: [0.6, 0.7, 0.6, 1.0, 0.7, 1.0], audienceW: [1.0, 1.0, 0.6] },
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

// Platform company → SVG icon mapping (used across wizard, game history, details)
const PLATFORM_ICONS = {
  'Ninvento':   '../../assets/platforms/nintendo.svg',
  'Vonny':      '../../assets/platforms/playstation.svg',
  'Micronoft':  '../../assets/platforms/xbox.svg',
  'Vena':       '../../assets/platforms/platform-console.svg',
  'Govodore':   '../../assets/platforms/platform-console.svg',
  'Grapple':    '../../assets/platforms/ios.svg',
  'Various':    '../../assets/platforms/platform-pc.svg',
};

// Helper: get platform icon path by platform id (looks up company from PLATFORMS)
function getPlatformIcon(platformId) {
  const p = (typeof PLATFORMS !== 'undefined') ? PLATFORMS.find(pl => pl.id === platformId) : null;
  return p && PLATFORM_ICONS[p.company] ? PLATFORM_ICONS[p.company] : null;
}

// Staff roles — assigned based on dominant stat profile
// Each role has a stat it favours (highest stat → role) and a display name
const STAFF_ROLES = [
  { id: 'game-designer',      name: 'Game Designer',      stat: 'design',   weight: { design: 1.0, tech: 0.3 } },
  { id: 'artist',             name: 'Artist',             stat: 'design',   weight: { design: 0.9, speed: 0.4 } },
  { id: 'ux-designer',        name: 'UX Designer',        stat: 'design',   weight: { design: 0.8, tech: 0.5 } },
  { id: 'writer',             name: 'Writer',             stat: 'design',   weight: { design: 0.7, research: 0.6 } },
  { id: 'engineer',           name: 'Engineer',           stat: 'tech',     weight: { tech: 1.0, speed: 0.3 } },
  { id: 'tech-director',      name: 'Tech Director',      stat: 'tech',     weight: { tech: 0.9, research: 0.5 } },
  { id: 'devops',             name: 'DevOps',             stat: 'tech',     weight: { tech: 0.8, speed: 0.6 } },
  { id: 'sound-engineer',     name: 'Sound Engineer',     stat: 'tech',     weight: { tech: 0.6, design: 0.7 } },
  { id: 'qa-tester',          name: 'QA Tester',          stat: 'speed',    weight: { speed: 1.0, tech: 0.4 } },
  { id: 'producer',           name: 'Producer',           stat: 'speed',    weight: { speed: 0.8, design: 0.3, tech: 0.3 } },
  { id: 'data-analyst',       name: 'Data Analyst',       stat: 'research', weight: { research: 1.0, tech: 0.5 } },
  { id: 'marketing',          name: 'Marketing',          stat: 'research', weight: { research: 0.7, speed: 0.5 } },
  { id: 'community-manager',  name: 'Community Manager',  stat: 'research', weight: { research: 0.6, design: 0.4 } },
  { id: 'hr',                 name: 'HR',                 stat: 'speed',    weight: { speed: 0.6, research: 0.5 } },
  { id: 'localization',       name: 'Localization',       stat: 'research', weight: { research: 0.5, design: 0.5 } },
];

// Map role IDs to SVG icon paths (relative to src/renderer/components/)
const ROLE_ICONS = {
  'artist':             '../../assets/staff/roles/artist.svg',
  'community-manager':  '../../assets/staff/roles/community-manager.svg',
  'data-analyst':       '../../assets/staff/roles/data-analyst.svg',
  'devops':             '../../assets/staff/roles/devops.svg',
  'engineer':           '../../assets/staff/roles/engineer.svg',
  'game-designer':      '../../assets/staff/roles/game-designer.svg',
  'hr':                 '../../assets/staff/roles/hr.svg',
  'localization':       '../../assets/staff/roles/localization.svg',
  'marketing':          '../../assets/staff/roles/marketing.svg',
  'producer':           '../../assets/staff/roles/producer.svg',
  'qa-tester':          '../../assets/staff/roles/qa-tester.svg',
  'sound-engineer':     '../../assets/staff/roles/sound-engineer.svg',
  'tech-director':      '../../assets/staff/roles/tech-director.svg',
  'ux-designer':        '../../assets/staff/roles/ux-designer.svg',
  'writer':             '../../assets/staff/roles/writer.svg',
};

// Assign a role to a staff member based on their stats
function assignStaffRole(member) {
  let bestRole = STAFF_ROLES[0];
  let bestScore = -1;
  for (const role of STAFF_ROLES) {
    let score = 0;
    for (const [stat, w] of Object.entries(role.weight)) {
      score += (member[stat] || 0) * w;
    }
    // Add small randomness so not every high-design person is the same role
    score += Math.random() * 5;
    if (score > bestScore) {
      bestScore = score;
      bestRole = role;
    }
  }
  return bestRole.id;
}

// Get display name for a role ID
function getRoleName(roleId) {
  const role = STAFF_ROLES.find(r => r.id === roleId);
  return role ? role.name : 'Developer';
}

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
