/**
 * Tech Empire -- Studio Morale & Culture System
 * Tracks team morale and culture perks that affect game quality.
 */

const CULTURE_PERKS = [
  { id: 'remote_work',    name: 'Remote Work',     cost: 2000,  moraleBoost: 10, icon: '\uD83C\uDFE0', description: 'Flexible work from home policy' },
  { id: 'game_room',      name: 'Game Room',       cost: 5000,  moraleBoost: 8,  icon: '\uD83C\uDFAE', description: 'Break room with arcade machines' },
  { id: 'free_lunch',     name: 'Free Lunch',      cost: 3000,  moraleBoost: 7,  icon: '\uD83C\uDF55', description: 'Catered meals for the team' },
  { id: 'hackathons',     name: 'Hackathons',      cost: 1000,  moraleBoost: 12, icon: '\uD83D\uDCA1', description: 'Monthly creative hack days' },
  { id: 'stock_options',  name: 'Stock Options',   cost: 0,     moraleBoost: 15, icon: '\uD83D\uDCC8', description: 'Equity stake in the company' },
  { id: 'mentorship',     name: 'Mentorship',      cost: 500,   moraleBoost: 6,  icon: '\uD83C\uDF93', description: 'Senior dev mentorship program' },
  { id: 'wellness',       name: 'Wellness Program',cost: 2500,  moraleBoost: 9,  icon: '\uD83E\uDDD8', description: 'Gym membership & mental health' },
  { id: 'four_day_week',  name: '4-Day Week',      cost: 5000,  moraleBoost: 20, icon: '\uD83C\uDF1F', description: 'Work-life balance revolution' },
];

class MoraleSystem {
  constructor() {
    this.morale = 60;        // Starting morale
    this.activePerks = [];   // Array of perk IDs
    this.history = [];       // [{ week, morale, event }]
    this._baseMorale = 60;
  }

  /** Get current morale level (0-100) */
  getMorale() {
    return Math.round(Math.max(0, Math.min(100, this.morale)));
  }

  /** Get the quality multiplier based on current morale */
  getQualityMultiplier() {
    const m = this.getMorale();
    if (m >= 90) return 1.15;
    if (m >= 75) return 1.05;
    if (m >= 50) return 1.0;
    if (m >= 25) return 0.9;
    return 0.75;
  }

  /** Get morale descriptor with emoji */
  getMoraleStatus() {
    const m = this.getMorale();
    if (m >= 90) return { label: 'Ecstatic',    emoji: '\uD83E\uDD29', color: '#3fb950' };
    if (m >= 75) return { label: 'Happy',        emoji: '\uD83D\uDE04', color: '#56d364' };
    if (m >= 60) return { label: 'Content',      emoji: '\uD83D\uDE42', color: '#58a6ff' };
    if (m >= 45) return { label: 'Neutral',      emoji: '\uD83D\uDE10', color: '#d29922' };
    if (m >= 30) return { label: 'Unhappy',      emoji: '\uD83D\uDE1F', color: '#ff9800' };
    if (m >= 15) return { label: 'Frustrated',   emoji: '\uD83D\uDE20', color: '#f85149' };
    return                  { label: 'Mutinous',    emoji: '\uD83E\uDD2C', color: '#da3633' };
  }

  /**
   * Apply a morale event.
   * @param {'game_success'|'game_failure'|'crunch'|'hire'|'fire'|'pay_raise'|'custom'} type
   * @param {number} [customAmount] - Override amount for custom events
   * @param {number} totalWeek - Current game week for history tracking
   */
  applyEvent(type, totalWeek, customAmount) {
    const effects = {
      game_success:  15,
      game_failure:  -10,
      crunch:        -15,
      hire:          5,
      fire:          -10,
      pay_raise:     10,
    };

    const delta = customAmount !== undefined ? customAmount : (effects[type] || 0);
    this.morale = Math.max(0, Math.min(100, this.morale + delta));

    this.history.push({
      week: totalWeek,
      morale: this.getMorale(),
      event: type,
      delta,
    });

    // Keep last 50 history entries
    if (this.history.length > 50) {
      this.history = this.history.slice(-50);
    }
  }

  /**
   * Natural morale drift each month.
   * Morale drifts toward base + perk bonus.
   */
  monthlyTick(totalWeek) {
    const perkBonus = this._getPerkBonus();
    const target = Math.min(100, this._baseMorale + perkBonus);
    const diff = target - this.morale;
    // Drift 20% toward target each month
    this.morale += diff * 0.2;
    this.morale = Math.max(0, Math.min(100, this.morale));

    this.history.push({
      week: totalWeek,
      morale: this.getMorale(),
      event: 'drift',
      delta: Math.round(diff * 0.2),
    });

    if (this.history.length > 50) {
      this.history = this.history.slice(-50);
    }
  }

  /**
   * Purchase a culture perk.
   * Returns cost if successful, or -1 if already owned.
   */
  purchasePerk(perkId) {
    if (this.activePerks.includes(perkId)) return -1;
    const perk = CULTURE_PERKS.find(p => p.id === perkId);
    if (!perk) return -1;

    this.activePerks.push(perkId);
    // Immediate morale boost
    this.morale = Math.min(100, this.morale + perk.moraleBoost);
    return perk.cost;
  }

  /** Check if a perk is active */
  hasPerk(perkId) {
    return this.activePerks.includes(perkId);
  }

  /** Total morale bonus from active perks (for drift target) */
  _getPerkBonus() {
    return this.activePerks.reduce((sum, id) => {
      const perk = CULTURE_PERKS.find(p => p.id === id);
      return sum + (perk ? perk.moraleBoost * 0.5 : 0); // Half for ongoing effect
    }, 0);
  }

  /** Get available perks (not yet purchased) */
  getAvailablePerks() {
    return CULTURE_PERKS.filter(p => !this.activePerks.includes(p.id));
  }

  /** Get active perk details */
  getActivePerks() {
    return this.activePerks.map(id => CULTURE_PERKS.find(p => p.id === id)).filter(Boolean);
  }

  serialize() {
    return {
      morale: this.morale,
      activePerks: this.activePerks,
      history: this.history,
      _baseMorale: this._baseMorale,
    };
  }

  deserialize(data) {
    if (!data) return;
    this.morale = data.morale !== undefined ? data.morale : 60;
    this.activePerks = data.activePerks || [];
    this.history = data.history || [];
    this._baseMorale = data._baseMorale || 60;
  }

  reset() {
    this.morale = 60;
    this.activePerks = [];
    this.history = [];
    this._baseMorale = 60;
  }
}

// Global instance
const moraleSystem = new MoraleSystem();
