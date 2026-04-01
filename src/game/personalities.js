/**
 * Tech Empire — Staff Personality System
 * 10 traits that affect productivity, quality, speed, and team chemistry.
 * Assigned on hire (2-3 random traits per staff member).
 */

const PERSONALITY_TRAITS = {
  perfectionist: {
    id: 'perfectionist',
    label: 'Perfectionist',
    icon: '🎯',
    desc: 'Meticulous work. +15% quality, -10% speed.',
    qualityMod: 0.15,
    speedMod: -0.10,
    color: '#da7cff',
  },
  speed_demon: {
    id: 'speed_demon',
    label: 'Speed Demon',
    icon: '⚡',
    desc: 'Ships fast. +20% speed, -10% quality.',
    qualityMod: -0.10,
    speedMod: 0.20,
    color: '#ffa657',
  },
  creative_rebel: {
    id: 'creative_rebel',
    label: 'Creative Rebel',
    icon: '🔥',
    desc: 'Brilliant ideas. +20% design, -5% teamwork.',
    designMod: 0.20,
    chemistryMod: -5,
    color: '#f85149',
  },
  team_player: {
    id: 'team_player',
    label: 'Team Player',
    icon: '🤝',
    desc: 'Lifts everyone. +10% team chemistry.',
    chemistryMod: 10,
    color: '#3fb950',
  },
  lone_wolf: {
    id: 'lone_wolf',
    label: 'Lone Wolf',
    icon: '🐺',
    desc: 'Strong alone. +10% tech, -10% team chemistry.',
    techMod: 0.10,
    chemistryMod: -10,
    color: '#8b949e',
  },
  ambitious: {
    id: 'ambitious',
    label: 'Ambitious',
    icon: '📈',
    desc: 'High performer. +10% all stats.',
    allMod: 0.10,
    color: '#58a6ff',
  },
  loyal: {
    id: 'loyal',
    label: 'Loyal',
    icon: '🛡️',
    desc: 'Committed to the studio. +5% morale.',
    moraleMod: 5,
    color: '#79c0ff',
  },
  gossip: {
    id: 'gossip',
    label: 'Gossip',
    icon: '💬',
    desc: 'Spreads news. Amplifies wins and losses. -5% chemistry.',
    chemistryMod: -5,
    color: '#d29922',
  },
  mentor: {
    id: 'mentor',
    label: 'Mentor',
    icon: '🎓',
    desc: 'Accelerates team learning. +15% with ambitious staff.',
    chemistryMod: 5,
    color: '#56d364',
  },
  procrastinator: {
    id: 'procrastinator',
    label: 'Procrastinator',
    icon: '😴',
    desc: 'Slow starter. -15% speed, +5% quality (when they finally ship).',
    qualityMod: 0.05,
    speedMod: -0.15,
    color: '#6e7681',
  },
};

// Trait pair chemistry interactions
const TRAIT_CHEMISTRY = {
  // Conflicts (negative chemistry)
  'team_player+lone_wolf': -10,
  'perfectionist+speed_demon': -8,
  'creative_rebel+procrastinator': -5,
  'ambitious+procrastinator': -8,
  // Synergies (positive chemistry)
  'mentor+ambitious': 15,
  'team_player+mentor': 10,
  'team_player+loyal': 8,
  'perfectionist+mentor': 10,
  'creative_rebel+ambitious': 8,
  'loyal+team_player': 8,
};

class PersonalitySystem {
  constructor() {}

  /**
   * Assign 2-3 random traits to a staff member on hire.
   * Modifies staff object in place and returns it.
   */
  assignTraits(staff) {
    const keys = Object.keys(PERSONALITY_TRAITS);
    // Shuffle using Fisher-Yates
    const shuffled = [...keys];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const count = Math.random() < 0.4 ? 3 : 2;
    staff.traits = shuffled.slice(0, count);
    return staff;
  }

  /**
   * Get productivity modifier for a staff member based on traits.
   * Returns { quality, speed, design, tech } as multipliers (1.0 = no change).
   */
  getProductivityModifier(staff) {
    const mod = { quality: 1.0, speed: 1.0, design: 1.0, tech: 1.0 };
    if (!staff.traits) return mod;

    for (const traitId of staff.traits) {
      const t = PERSONALITY_TRAITS[traitId];
      if (!t) continue;
      if (t.qualityMod) mod.quality += t.qualityMod;
      if (t.speedMod) mod.speed += t.speedMod;
      if (t.designMod) mod.design += t.designMod;
      if (t.techMod) mod.tech += t.techMod;
      if (t.allMod) {
        mod.quality += t.allMod;
        mod.speed += t.allMod;
        mod.design += t.allMod;
        mod.tech += t.allMod;
      }
    }
    return mod;
  }

  /**
   * Get chemistry bonus/penalty between two staff members.
   * Returns a number (positive = bonus, negative = penalty).
   */
  getChemistry(staff1, staff2) {
    if (!staff1.traits || !staff2.traits) return 0;

    let score = 0;
    for (const t1 of staff1.traits) {
      for (const t2 of staff2.traits) {
        // Check both orderings
        const key1 = `${t1}+${t2}`;
        const key2 = `${t2}+${t1}`;
        if (TRAIT_CHEMISTRY[key1]) score += TRAIT_CHEMISTRY[key1];
        else if (TRAIT_CHEMISTRY[key2]) score += TRAIT_CHEMISTRY[key2];
      }
    }
    return score;
  }

  /**
   * Get average pairwise chemistry bonus for a team.
   * Returns a number (can be positive or negative).
   */
  getTeamChemistry(staffArray) {
    if (!staffArray || staffArray.length < 2) return 0;

    let total = 0;
    let pairs = 0;
    for (let i = 0; i < staffArray.length; i++) {
      for (let j = i + 1; j < staffArray.length; j++) {
        total += this.getChemistry(staffArray[i], staffArray[j]);
        pairs++;
      }
    }
    return pairs > 0 ? Math.round(total / pairs) : 0;
  }

  /**
   * Get trait display data for UI.
   */
  getTraitData(traitId) {
    return PERSONALITY_TRAITS[traitId] || null;
  }

  getAllTraits() {
    return PERSONALITY_TRAITS;
  }

  /**
   * Weekly tick: check for promotion demands from ambitious staff.
   * Returns array of events: [{ type: 'promotion_demand', staffName, staffId }]
   */
  tick(state) {
    const events = [];
    if (!state || !state.staff) return events;
    // Only fire on week 1 of each month
    if (state.week !== 1) return events;

    for (const member of state.staff) {
      if (!member.traits || member.isFounder) continue;
      if (member.traits.includes('ambitious')) {
        const avgStat = (member.design + member.tech + member.speed + member.research) / 4;
        const expectedSalary = Math.round(avgStat * 50);
        if (member.salary < expectedSalary * 0.7 && Math.random() < 0.10) {
          events.push({ type: 'promotion_demand', staffName: member.name, staffId: member.id });
        }
      }
    }
    return events;
  }

  serialize() {
    return {};
  }

  deserialize(data) {
    // Stateless system — traits live on staff objects
  }

  reset() {
    // Stateless system — nothing to reset
  }
}

// Global instance
const personalitySystem = new PersonalitySystem();
