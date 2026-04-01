/**
 * Tech Empire — Victory System (Civ-Style 5 Paths)
 * Checks all 5 victory conditions each month.
 * Each path: id, name, description, icon, checkCondition(state), getProgress(state) -> 0-100%
 */

// ── Moonshot Research Projects ───────────────────────────────────
// Three mega-projects: $100M each, 104 weeks (2 years) each.

const MOONSHOT_PROJECTS = [
  {
    id: 'moonshot_agi',
    name: 'AGI Research',
    description: 'Build an artificial general intelligence — a thinking machine that can learn anything.',
    cost: 100000000,
    durationWeeks: 104,
    icon: '🧠',
  },
  {
    id: 'moonshot_quantum_os',
    name: 'Quantum OS',
    description: 'Design an operating system that runs on quantum hardware — rewrite computing forever.',
    cost: 100000000,
    durationWeeks: 104,
    icon: '⚛',
  },
  {
    id: 'moonshot_neural',
    name: 'Neural Interface',
    description: 'A direct brain-computer link. Play games with your mind. The final input device.',
    cost: 100000000,
    durationWeeks: 104,
    icon: '🔮',
  },
];

// ── Victory Path Definitions ─────────────────────────────────────

const VICTORY_PATHS = [
  {
    id: 'brand_empire',
    name: 'Brand Empire',
    icon: '👑',
    description: '50 million fans and 10 industry awards. Your name IS gaming.',
    thresholds: { fans: 50000000, awardsWon: 10 },
    checkCondition(state, ctx) {
      return state.fans >= 50000000 && ctx.awardsWon >= 10;
    },
    getProgress(state, ctx) {
      const fanPct = Math.min(100, (state.fans / 50000000) * 100);
      const awardPct = Math.min(100, (ctx.awardsWon / 10) * 100);
      return (fanPct + awardPct) / 2;
    },
    getDetails(state, ctx) {
      return [
        { label: 'Fans', current: state.fans, target: 50000000, format: 'fans' },
        { label: 'Awards Won', current: ctx.awardsWon, target: 10, format: 'number' },
      ];
    },
  },
  {
    id: 'innovation_leader',
    name: 'Innovation Leader',
    icon: '🚀',
    description: 'Complete 3 moonshot projects. AGI, Quantum OS, Neural Interface — reshape humanity.',
    thresholds: { completedMoonshots: 3 },
    checkCondition(state, ctx) {
      return ctx.completedMoonshots >= 3;
    },
    getProgress(state, ctx) {
      // Each moonshot is 33.3%, in-progress moonshot adds partial
      const completedPct = (ctx.completedMoonshots / 3) * 100;
      const inProgressPct = ctx.moonshotProgressPct / 3;
      return Math.min(100, completedPct + inProgressPct);
    },
    getDetails(state, ctx) {
      return [
        { label: 'Moonshots Completed', current: ctx.completedMoonshots, target: 3, format: 'number' },
        { label: 'In Progress', current: ctx.activeMoonshotName || 'None', target: null, format: 'text' },
      ];
    },
  },
  {
    id: 'market_dominator',
    name: 'Market Dominator',
    icon: '🏛',
    description: '60% market share — or $2B total revenue if competitors aren\'t tracked.',
    thresholds: { marketShareOrRevenue: true },
    checkCondition(state, ctx) {
      // If competitor system tracks marketShare, use it; otherwise fallback to $2B revenue
      if (typeof ctx.marketShare === 'number' && ctx.marketShare > 0) {
        return ctx.marketShare >= 0.60;
      }
      return ctx.totalRevenue >= 2000000000;
    },
    getProgress(state, ctx) {
      if (typeof ctx.marketShare === 'number' && ctx.marketShare > 0) {
        return Math.min(100, (ctx.marketShare / 0.60) * 100);
      }
      return Math.min(100, (ctx.totalRevenue / 2000000000) * 100);
    },
    getDetails(state, ctx) {
      if (typeof ctx.marketShare === 'number' && ctx.marketShare > 0) {
        return [
          { label: 'Market Share', current: ctx.marketShare, target: 0.60, format: 'percent' },
        ];
      }
      return [
        { label: 'Total Revenue', current: ctx.totalRevenue, target: 2000000000, format: 'cash' },
      ];
    },
  },
  {
    id: 'financial_titan',
    name: 'Financial Titan',
    icon: '💎',
    description: '$1B company valuation and publicly traded. Wall Street bows to you.',
    thresholds: { companyValuation: 1000000000, isPublic: true },
    checkCondition(state, ctx) {
      return ctx.companyValuation >= 1000000000 && state.isPublic === true;
    },
    getProgress(state, ctx) {
      const valPct = Math.min(100, (ctx.companyValuation / 1000000000) * 100);
      const ipoPct = state.isPublic ? 100 : 0;
      return (valPct + ipoPct) / 2;
    },
    getDetails(state, ctx) {
      return [
        { label: 'Valuation', current: ctx.companyValuation, target: 1000000000, format: 'cash' },
        { label: 'IPO Status', current: state.isPublic ? 'Public' : 'Private', target: 'Public', format: 'text' },
      ];
    },
  },
  {
    id: 'industry_kingmaker',
    name: 'Industry Kingmaker',
    icon: '⚡',
    description: 'Control 3 tech standards and win 10 industry votes. You define the platform.',
    thresholds: { standardsControlled: 3, industryVotesWon: 10 },
    checkCondition(state, ctx) {
      return ctx.standardsControlled >= 3 && ctx.industryVotesWon >= 10;
    },
    getProgress(state, ctx) {
      const stdPct = Math.min(100, (ctx.standardsControlled / 3) * 100);
      const votePct = Math.min(100, (ctx.industryVotesWon / 10) * 100);
      return (stdPct + votePct) / 2;
    },
    getDetails(state, ctx) {
      return [
        { label: 'Standards Controlled', current: ctx.standardsControlled, target: 3, format: 'number' },
        { label: 'Industry Votes Won', current: ctx.industryVotesWon, target: 10, format: 'number' },
      ];
    },
  },
];

// ── Standards & Votes Logic ──────────────────────────────────────
// Standards are earned via: hardware consoles (1 each), verticals at maturity (1 each), research milestones.
// Industry votes are earned via: conference awards (1 each), high-scoring games (reviewAvg >= 9.0), IPO board approval.

function _countStandards(state) {
  let count = 0;

  // Each active console = 1 standard (you set the hardware platform)
  if (typeof hardwareSystem !== 'undefined') {
    count += hardwareSystem.consoles.filter(c => c.active).length;
  }

  // Each active vertical = 1 standard (you define that tech stack)
  if (typeof verticalManager !== 'undefined') {
    count += verticalManager.getActiveCount();
  }

  // Completed all 7 research categories = 1 bonus standard
  if (typeof researchSystem !== 'undefined' && researchSystem.completedCount() >= 20) {
    count += 1;
  }

  return count;
}

function _countIndustryVotes(state) {
  let votes = 0;

  // Conference awards
  if (typeof conferenceSystem !== 'undefined') {
    votes += conferenceSystem.attendedHistory.filter(h => h.awardWon).length;
  }

  // Games with reviewAvg >= 9.0 (critical acclaim = industry vote of confidence)
  votes += state.games.filter(g => g.reviewAvg >= 9.0).length;

  // IPO board approval above 80 = 1 vote
  if (typeof ipoSystem !== 'undefined' && ipoSystem.isPublic && ipoSystem.boardApprovalRating >= 80) {
    votes += 1;
  }

  return votes;
}


// ── Victory System Class ─────────────────────────────────────────

class VictorySystem {
  constructor() {
    // Moonshot projects state
    this.moonshotCompleted = {};    // moonshotId -> true
    this.activeMoonshot = null;     // { id, name, weeksLeft, totalWeeks } or null
    this.completedMoonshotCount = 0;
    this.sandboxMode = false;       // true after a victory has been achieved and player chose to continue
  }

  /** Get all moonshot project definitions with their status */
  getMoonshotProjects() {
    return MOONSHOT_PROJECTS.map(p => ({
      ...p,
      completed: !!this.moonshotCompleted[p.id],
      inProgress: this.activeMoonshot && this.activeMoonshot.id === p.id,
      weeksLeft: this.activeMoonshot && this.activeMoonshot.id === p.id
        ? this.activeMoonshot.weeksLeft : 0,
    }));
  }

  /** Start a moonshot project */
  startMoonshot(projectId, state) {
    if (this.activeMoonshot) return { success: false, message: 'Already running a moonshot project!' };
    if (this.moonshotCompleted[projectId]) return { success: false, message: 'Already completed!' };

    const project = MOONSHOT_PROJECTS.find(p => p.id === projectId);
    if (!project) return { success: false, message: 'Unknown moonshot project.' };
    if (state.cash < project.cost) return { success: false, message: `Need $${(project.cost / 1000000).toFixed(0)}M to fund this moonshot!` };

    state.cash -= project.cost;
    if (typeof finance !== 'undefined') {
      finance.record('research', -project.cost, 'Moonshot: ' + project.name,
        typeof engine !== 'undefined' ? engine._dateStr() : '');
    }

    this.activeMoonshot = {
      id: project.id,
      name: project.name,
      weeksLeft: project.durationWeeks,
      totalWeeks: project.durationWeeks,
    };

    return { success: true, message: `Launched moonshot: ${project.name}!` };
  }

  /** Called each game tick (weekly) to advance moonshot */
  tick(state) {
    if (!this.activeMoonshot) return null;

    // Speed bonus from staff research stat (same as normal research)
    const researchPower = state.staff.reduce((sum, m) => sum + (m.research || 0), 0);
    const speedBonus = Math.max(1, researchPower / 100); // moonshots are slower to accelerate

    this.activeMoonshot.weeksLeft -= speedBonus;

    if (this.activeMoonshot.weeksLeft <= 0) {
      const completedId = this.activeMoonshot.id;
      const completedName = this.activeMoonshot.name;
      this.moonshotCompleted[completedId] = true;
      this.completedMoonshotCount++;
      this.activeMoonshot = null;
      return { completed: true, id: completedId, name: completedName };
    }

    return null;
  }

  /** Cancel active moonshot (no refund) */
  cancelMoonshot() {
    if (!this.activeMoonshot) return false;
    this.activeMoonshot = null;
    return true;
  }

  /** Build a context object with all computed metrics for victory checks */
  _buildContext(state) {
    const totalRevenue = typeof finance !== 'undefined' ? finance.totalRevenue() : 0;
    const companyValuation = typeof ipoSystem !== 'undefined' && ipoSystem.isPublic
      ? ipoSystem.getMarketCap()
      : totalRevenue * 3; // private company rough valuation = 3x revenue

    // Conference awards count
    const awardsWon = typeof conferenceSystem !== 'undefined'
      ? conferenceSystem.attendedHistory.filter(h => h.awardWon).length : 0;

    // Moonshot progress
    const moonshotProgressPct = this.activeMoonshot
      ? ((this.activeMoonshot.totalWeeks - this.activeMoonshot.weeksLeft) / this.activeMoonshot.totalWeeks) * 100
      : 0;
    const activeMoonshotName = this.activeMoonshot ? this.activeMoonshot.name : null;

    // Market share from competitor system (returns % 0-100, convert to 0-1 decimal)
    let marketShare = 0;
    if (typeof competitorSystem !== 'undefined' && competitorSystem.getMarketShare) {
      // Calculate player's recent revenue (last 52 weeks) for market share
      const playerRecentRev = totalRevenue; // simplified; competitor system normalizes internally
      const shares = competitorSystem.getMarketShare(playerRecentRev);
      marketShare = (shares.player || 0) / 100; // convert from % to decimal
    }

    return {
      totalRevenue,
      companyValuation,
      awardsWon,
      completedMoonshots: this.completedMoonshotCount,
      moonshotProgressPct,
      activeMoonshotName,
      marketShare,
      standardsControlled: _countStandards(state),
      industryVotesWon: _countIndustryVotes(state),
    };
  }

  /** Check all 5 victory conditions. Returns the winning path or null. */
  checkVictory(state) {
    if (this.sandboxMode) return null;

    const ctx = this._buildContext(state);
    for (const path of VICTORY_PATHS) {
      if (path.checkCondition(state, ctx)) {
        return path;
      }
    }
    return null;
  }

  /** Get progress for all 5 victory paths (for the tracker UI) */
  getAllProgress(state) {
    const ctx = this._buildContext(state);
    return VICTORY_PATHS.map(path => ({
      id: path.id,
      name: path.name,
      icon: path.icon,
      description: path.description,
      progress: Math.round(path.getProgress(state, ctx) * 10) / 10,
      details: path.getDetails(state, ctx),
      isComplete: path.checkCondition(state, ctx),
    }));
  }

  /** Enter sandbox mode (continue playing after victory) */
  enterSandbox() {
    this.sandboxMode = true;
  }

  serialize() {
    return {
      moonshotCompleted: { ...this.moonshotCompleted },
      activeMoonshot: this.activeMoonshot ? { ...this.activeMoonshot } : null,
      completedMoonshotCount: this.completedMoonshotCount,
      sandboxMode: this.sandboxMode,
    };
  }

  deserialize(data) {
    if (!data) return;
    this.moonshotCompleted = data.moonshotCompleted || {};
    this.activeMoonshot = data.activeMoonshot || null;
    this.completedMoonshotCount = data.completedMoonshotCount || 0;
    this.sandboxMode = data.sandboxMode || false;
  }

  reset() {
    this.moonshotCompleted = {};
    this.activeMoonshot = null;
    this.completedMoonshotCount = 0;
    this.sandboxMode = false;
  }
}

// Global instance
const victorySystem = new VictorySystem();
