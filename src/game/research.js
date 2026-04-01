/**
 * Tech Empire — Research / Tech Tree System
 * 33+ research items across 7 categories.
 * Requires R&D Lab (unlocked at Medium Office, level 2).
 */

const RESEARCH_CATEGORIES = ['AI', 'Networking', 'Graphics', 'Audio', 'UX', 'Monetization', 'Engine'];

const RESEARCH_ITEMS = [
  // ── AI (5 items) ──────────────────────────────────────────────
  { id: 'ai_pathfinding',      name: 'Advanced Pathfinding',     category: 'AI',           techLevel: 2,  cost: 15000,  durationWeeks: 4,  description: 'A* and navmesh algorithms for smarter NPC navigation.' },
  { id: 'ai_behavior_trees',   name: 'Behavior Trees',           category: 'AI',           techLevel: 4,  cost: 25000,  durationWeeks: 6,  description: 'Complex decision-making systems for believable AI.' },
  { id: 'ai_procedural_gen',   name: 'Procedural Generation',    category: 'AI',           techLevel: 6,  cost: 40000,  durationWeeks: 8,  description: 'Algorithmically generate worlds, dungeons, and quests.' },
  { id: 'ai_ml_npcs',          name: 'Machine Learning NPCs',    category: 'AI',           techLevel: 10, cost: 80000,  durationWeeks: 12, description: 'NPCs that learn from player behavior and adapt.' },
  { id: 'ai_llm_dialogue',     name: 'LLM-Powered Dialogue',     category: 'AI',           techLevel: 13, cost: 120000, durationWeeks: 14, description: 'AI-generated dynamic conversations with infinite branching.' },

  // ── Networking (5 items) ──────────────────────────────────────
  { id: 'net_basic_multi',     name: 'Basic Multiplayer',        category: 'Networking',   techLevel: 3,  cost: 20000,  durationWeeks: 6,  description: 'Peer-to-peer networking for small lobbies.' },
  { id: 'net_dedicated',       name: 'Dedicated Servers',        category: 'Networking',   techLevel: 5,  cost: 35000,  durationWeeks: 8,  description: 'Server infrastructure for stable online play.' },
  { id: 'net_mmo',             name: 'MMO Architecture',         category: 'Networking',   techLevel: 8,  cost: 60000,  durationWeeks: 10, description: 'Massively multiplayer infrastructure supporting thousands.' },
  { id: 'net_crossplay',       name: 'Cross-Platform Play',      category: 'Networking',   techLevel: 11, cost: 75000,  durationWeeks: 10, description: 'Unified matchmaking across all platforms.' },
  { id: 'net_cloud_gaming',    name: 'Cloud Gaming Support',     category: 'Networking',   techLevel: 14, cost: 100000, durationWeeks: 12, description: 'Stream your games to any device, anywhere.' },

  // ── Graphics (5 items) ────────────────────────────────────────
  { id: 'gfx_sprites',        name: '2D Sprite Engine',         category: 'Graphics',     techLevel: 1,  cost: 10000,  durationWeeks: 3,  description: 'Efficient sprite rendering with animation support.' },
  { id: 'gfx_3d_basic',       name: '3D Rendering',             category: 'Graphics',     techLevel: 3,  cost: 25000,  durationWeeks: 6,  description: 'Basic 3D engine with texturing and lighting.' },
  { id: 'gfx_shaders',        name: 'Shader Pipeline',          category: 'Graphics',     techLevel: 6,  cost: 45000,  durationWeeks: 8,  description: 'Programmable shader system for custom visual effects.' },
  { id: 'gfx_raytracing',     name: 'Ray Tracing',              category: 'Graphics',     techLevel: 11, cost: 90000,  durationWeeks: 12, description: 'Real-time ray traced reflections, shadows, and GI.' },
  { id: 'gfx_nanite',         name: 'Nanite Geometry',          category: 'Graphics',     techLevel: 14, cost: 130000, durationWeeks: 14, description: 'Virtualized geometry rendering billions of polygons.' },

  // ── Audio (4 items) ───────────────────────────────────────────
  { id: 'aud_basic',          name: 'Spatial Audio',            category: 'Audio',        techLevel: 2,  cost: 12000,  durationWeeks: 3,  description: '3D positional audio for immersive soundscapes.' },
  { id: 'aud_dynamic_music',  name: 'Dynamic Music System',    category: 'Audio',        techLevel: 5,  cost: 30000,  durationWeeks: 6,  description: 'Music that adapts to gameplay intensity in real-time.' },
  { id: 'aud_voice_synth',    name: 'Voice Synthesis',          category: 'Audio',        techLevel: 9,  cost: 55000,  durationWeeks: 8,  description: 'AI-generated voice acting for unlimited dialogue.' },
  { id: 'aud_ambisonics',     name: 'Ambisonics Engine',        category: 'Audio',        techLevel: 12, cost: 70000,  durationWeeks: 10, description: 'Full-sphere surround sound for VR and cinema audio.' },

  // ── UX (5 items) ──────────────────────────────────────────────
  { id: 'ux_tutorials',       name: 'Smart Tutorials',          category: 'UX',           techLevel: 2,  cost: 10000,  durationWeeks: 3,  description: 'Context-aware tutorials that adapt to player skill.' },
  { id: 'ux_accessibility',   name: 'Accessibility Suite',      category: 'UX',           techLevel: 4,  cost: 20000,  durationWeeks: 5,  description: 'Colorblind modes, subtitles, remappable controls.' },
  { id: 'ux_analytics',       name: 'Player Analytics',         category: 'UX',           techLevel: 6,  cost: 30000,  durationWeeks: 6,  description: 'Track player behavior to optimize game design.' },
  { id: 'ux_live_ops',        name: 'Live Ops Dashboard',       category: 'UX',           techLevel: 9,  cost: 50000,  durationWeeks: 8,  description: 'Real-time monitoring and content deployment tools.' },
  { id: 'ux_haptic_feedback',  name: 'Haptic Feedback Engine',   category: 'UX',           techLevel: 12, cost: 65000,  durationWeeks: 10, description: 'Advanced controller vibration patterns and triggers.' },

  // ── Monetization (4 items) ────────────────────────────────────
  { id: 'mon_dlc',            name: 'DLC Framework',            category: 'Monetization', techLevel: 4,  cost: 18000,  durationWeeks: 4,  description: 'Downloadable content packaging and distribution.' },
  { id: 'mon_mtx',            name: 'Microtransaction Engine',  category: 'Monetization', techLevel: 7,  cost: 35000,  durationWeeks: 6,  description: 'In-game store with virtual currency support.' },
  { id: 'mon_battle_pass',    name: 'Battle Pass System',       category: 'Monetization', techLevel: 10, cost: 50000,  durationWeeks: 8,  description: 'Seasonal progression tracks with premium tiers.' },
  { id: 'mon_nft',            name: 'Digital Ownership Layer',  category: 'Monetization', techLevel: 13, cost: 90000,  durationWeeks: 10, description: 'Player-owned digital assets and marketplace.' },

  // ── Engine (5 items) ──────────────────────────────────────────
  { id: 'eng_physics',        name: 'Physics Engine',           category: 'Engine',       techLevel: 2,  cost: 15000,  durationWeeks: 5,  description: 'Rigid body physics, collision detection, raycasting.' },
  { id: 'eng_scripting',      name: 'Scripting Language',       category: 'Engine',       techLevel: 4,  cost: 22000,  durationWeeks: 6,  description: 'Embedded scripting for rapid content creation.' },
  { id: 'eng_ecs',            name: 'Entity Component System',  category: 'Engine',       techLevel: 7,  cost: 40000,  durationWeeks: 8,  description: 'Data-oriented architecture for massive game worlds.' },
  { id: 'eng_hot_reload',     name: 'Hot Reload Pipeline',      category: 'Engine',       techLevel: 9,  cost: 55000,  durationWeeks: 8,  description: 'Live code changes without restarting the game.' },
  { id: 'eng_voxel',          name: 'Voxel Engine',             category: 'Engine',       techLevel: 12, cost: 85000,  durationWeeks: 12, description: 'Fully destructible voxel-based worlds.' },
];

/**
 * ResearchSystem — manages R&D progress, completed items, and bonuses
 */
class ResearchSystem {
  constructor() {
    this.completed = {};        // researchId -> true
    this.currentResearch = null; // { id, weeksLeft }
    this.researchPoints = 0;    // accumulated from staff
  }

  /** Check if R&D lab is available (Medium Office = level 2) */
  isLabUnlocked(officeLevel) {
    return officeLevel >= 2;
  }

  /** Get all research items with their current status */
  getItems(officeLevel) {
    // Calculate effective tech level from completed research
    const maxCompletedTech = this._getMaxTechLevel();

    return RESEARCH_ITEMS.map(item => ({
      ...item,
      completed: !!this.completed[item.id],
      inProgress: this.currentResearch && this.currentResearch.id === item.id,
      weeksLeft: this.currentResearch && this.currentResearch.id === item.id
        ? this.currentResearch.weeksLeft : 0,
      // Unlocked if tech level requirement met (can research items up to maxCompletedTech + 3)
      unlocked: item.techLevel <= maxCompletedTech + 3 && this.isLabUnlocked(officeLevel),
    }));
  }

  /** Get items grouped by category */
  getByCategory(officeLevel) {
    const items = this.getItems(officeLevel);
    const grouped = {};
    RESEARCH_CATEGORIES.forEach(cat => { grouped[cat] = []; });
    items.forEach(item => {
      grouped[item.category].push(item);
    });
    return grouped;
  }

  /** Start researching an item */
  startResearch(itemId, state) {
    if (this.currentResearch) return { success: false, message: 'Already researching something!' };
    if (this.completed[itemId]) return { success: false, message: 'Already completed!' };
    if (!this.isLabUnlocked(state.level)) return { success: false, message: 'Need R&D Lab (Medium Office)!' };

    const item = RESEARCH_ITEMS.find(r => r.id === itemId);
    if (!item) return { success: false, message: 'Unknown research item.' };

    const maxTech = this._getMaxTechLevel();
    if (item.techLevel > maxTech + 3) return { success: false, message: 'Tech level too high! Complete earlier research first.' };

    if (state.cash < item.cost) return { success: false, message: 'Not enough cash!' };

    // Deduct cost
    state.cash -= item.cost;

    this.currentResearch = {
      id: item.id,
      name: item.name,
      weeksLeft: item.durationWeeks,
      totalWeeks: item.durationWeeks,
    };

    return { success: true, message: `Started researching ${item.name}!` };
  }

  /** Called each game tick to advance research */
  tick(state) {
    if (!this.currentResearch) return null;

    // Research speed bonus from staff research stat
    const researchPower = state.staff.reduce((sum, m) => sum + (m.research || 0), 0);
    const speedBonus = Math.max(1, researchPower / 50);

    this.currentResearch.weeksLeft -= speedBonus;

    if (this.currentResearch.weeksLeft <= 0) {
      const completedId = this.currentResearch.id;
      const completedName = this.currentResearch.name;
      this.completed[completedId] = true;
      this.currentResearch = null;
      return { completed: true, id: completedId, name: completedName };
    }

    return null;
  }

  /** Cancel current research (no refund) */
  cancelResearch() {
    if (!this.currentResearch) return false;
    this.currentResearch = null;
    return true;
  }

  /** Get the score bonus from completed research */
  getScoreBonus() {
    const count = Object.keys(this.completed).length;
    // Each completed research adds a cumulative bonus
    // First 5: +2% each, next 10: +1.5% each, rest: +1% each
    let bonus = 0;
    if (count <= 5) {
      bonus = count * 0.02;
    } else if (count <= 15) {
      bonus = 5 * 0.02 + (count - 5) * 0.015;
    } else {
      bonus = 5 * 0.02 + 10 * 0.015 + (count - 15) * 0.01;
    }
    return bonus;
  }

  /** Get the highest completed tech level */
  _getMaxTechLevel() {
    let max = 0;
    for (const id of Object.keys(this.completed)) {
      const item = RESEARCH_ITEMS.find(r => r.id === id);
      if (item && item.techLevel > max) max = item.techLevel;
    }
    return max;
  }

  /** Count completed items */
  completedCount() {
    return Object.keys(this.completed).length;
  }

  serialize() {
    return {
      completed: { ...this.completed },
      currentResearch: this.currentResearch ? { ...this.currentResearch } : null,
    };
  }

  deserialize(data) {
    if (!data) return;
    this.completed = data.completed || {};
    this.currentResearch = data.currentResearch || null;
  }

  reset() {
    this.completed = {};
    this.currentResearch = null;
    this.researchPoints = 0;
  }
}

// Global instance
const researchSystem = new ResearchSystem();
