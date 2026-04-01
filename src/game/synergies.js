/**
 * Tech Empire — Cross-Vertical Synergy System
 * When multiple verticals are active, they create compounding bonuses.
 */

// ── Synergy Definitions ────────────────────────────────────────

const SYNERGY_DEFS = [
  {
    id: 'games_cloud',
    name: 'Self-Hosted Servers',
    description: 'Games + Cloud = free hosting (save $5K/mo server costs)',
    requires: ['cloud'],           // cloud must be active; games are always the base
    category: 'cost_reduction',
    effect: { monthlySavings: 5000 },
    icon: '🖥️',
  },
  {
    id: 'games_ai',
    name: 'AI-Powered NPCs',
    description: 'Games + AI = smarter NPCs (game quality +15%)',
    requires: ['ai'],
    category: 'game_quality',
    effect: { qualityBonus: 0.15 },
    icon: '🤖',
  },
  {
    id: 'games_streaming',
    name: 'Exclusive Launch Deals',
    description: 'Games + Streaming = exclusive day-one streaming (subscriber boost +20%)',
    requires: ['streaming'],
    category: 'subscriber_boost',
    effect: { subscriberBoost: 0.20 },
    icon: '🎬',
  },
  {
    id: 'software_cloud',
    name: 'Hosted SaaS Infrastructure',
    description: 'Software + Cloud = hosted infra (margin +10%)',
    requires: ['software', 'cloud'],
    category: 'margin_boost',
    effect: { marginBoost: 0.10 },
    icon: '⚙️',
  },
  {
    id: 'cloud_ai',
    name: 'In-House GPU Clusters',
    description: 'Cloud + AI = cheaper model training (AI costs -30%)',
    requires: ['cloud', 'ai'],
    category: 'cost_reduction',
    effect: { aiCostReduction: 0.30 },
    icon: '🧠',
  },
  {
    id: 'streaming_ai',
    name: 'AI Recommendation Engine',
    description: 'Streaming + AI = personalized content recs (subscriber retention +15%)',
    requires: ['streaming', 'ai'],
    category: 'subscriber_retention',
    effect: { retentionBoost: 0.15 },
    icon: '🎯',
  },
];

const FULL_INTEGRATION_THRESHOLD = 4;
const FULL_INTEGRATION_BONUS = 0.25; // +25% all revenue

// ── Public API ─────────────────────────────────────────────────

/**
 * Returns a list of currently active synergy definitions.
 * @param {string[]} activeVerticals - IDs of active verticals (e.g. ['software', 'cloud'])
 * @returns {object[]} Array of synergy definition objects that are active
 */
function getSynergies(activeVerticals) {
  if (!activeVerticals || activeVerticals.length < 1) return [];

  return SYNERGY_DEFS.filter(syn => {
    return syn.requires.every(req => activeVerticals.includes(req));
  });
}

/**
 * Returns total multiplier for a given bonus category.
 * Includes full-integration bonus (+25% all revenue) when 4+ verticals active.
 *
 * @param {string[]} activeVerticals - IDs of active verticals
 * @param {string} category - one of: 'game_quality', 'cost_reduction', 'subscriber_boost',
 *                            'margin_boost', 'subscriber_retention', 'revenue'
 * @returns {number} Multiplier (1.0 = no bonus, 1.25 = +25%, etc.)
 */
function getTotalBonus(activeVerticals, category) {
  if (!activeVerticals || activeVerticals.length < 1) return 1.0;

  const activeSynergies = getSynergies(activeVerticals);
  let bonus = 0;

  for (const syn of activeSynergies) {
    if (syn.category === category) {
      // Sum all matching effect values
      const eff = syn.effect;
      if (eff.qualityBonus) bonus += eff.qualityBonus;
      if (eff.subscriberBoost) bonus += eff.subscriberBoost;
      if (eff.marginBoost) bonus += eff.marginBoost;
      if (eff.retentionBoost) bonus += eff.retentionBoost;
      if (eff.aiCostReduction) bonus += eff.aiCostReduction;
    }
  }

  // Full integration bonus: +25% all revenue when 4+ verticals active
  if (category === 'revenue' && activeVerticals.length >= FULL_INTEGRATION_THRESHOLD) {
    bonus += FULL_INTEGRATION_BONUS;
  }

  return 1.0 + bonus;
}

/**
 * Returns monthly cost savings from active synergies.
 * @param {string[]} activeVerticals
 * @returns {number} Total monthly dollar savings
 */
function getSynergySavings(activeVerticals) {
  if (!activeVerticals || activeVerticals.length < 1) return 0;

  const activeSynergies = getSynergies(activeVerticals);
  let savings = 0;

  for (const syn of activeSynergies) {
    if (syn.effect.monthlySavings) {
      savings += syn.effect.monthlySavings;
    }
  }

  return savings;
}

/**
 * Returns true if full integration bonus is active (4+ verticals).
 * @param {string[]} activeVerticals
 * @returns {boolean}
 */
function hasFullIntegration(activeVerticals) {
  return activeVerticals && activeVerticals.length >= FULL_INTEGRATION_THRESHOLD;
}

/**
 * Build the synergies flags object that verticalManager.monthlyTick() expects.
 * @param {string[]} activeVerticals
 * @returns {object}
 */
function buildSynergyFlags(activeVerticals) {
  return {
    gamesActive: true, // games are always the core business
    cloudActive: activeVerticals.includes('cloud'),
    aiActive: activeVerticals.includes('ai'),
    streamingActive: activeVerticals.includes('streaming'),
    softwareActive: activeVerticals.includes('software'),
  };
}
