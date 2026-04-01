/**
 * Tech Empire — AI Competitor Studios
 * 6 rival studios with distinct personalities that release games,
 * compete for market share, and affect genre saturation.
 */

// ── Procedural Game Title Generation ─────────────────────────────

const TITLE_PREFIXES = {
  Action:     ['Strike', 'Fury', 'Blitz', 'Assault', 'Shadow', 'Iron', 'Bullet', 'Rage', 'Steel', 'Storm'],
  Adventure:  ['Lost', 'Hidden', 'Forgotten', 'Mystic', 'Golden', 'Wandering', 'Eternal', 'Fabled', 'Distant', 'Ancient'],
  RPG:        ['Dark', 'Elder', 'Dragon', 'Crystal', 'Crimson', 'Sacred', 'Fallen', 'Arcane', 'Mythic', 'Legendary'],
  Simulation: ['City', 'Mega', 'Ultra', 'Grand', 'Master', 'Pro', 'Elite', 'World', 'Total', 'Global'],
  Strategy:   ['Empire', 'Command', 'Conquest', 'Siege', 'Dominion', 'Alliance', 'War', 'Supreme', 'Tactical', 'Grand'],
  Casual:     ['Happy', 'Super', 'Pixel', 'Tiny', 'Lucky', 'Bouncy', 'Candy', 'Party', 'Fun', 'Crazy'],
};

const TITLE_SUFFIXES = {
  Action:     ['Force', 'Zone', 'Ops', 'Warfare', 'Protocol', 'Recon', 'Havoc', 'Rampage', 'Carnage', 'Thunder'],
  Adventure:  ['Journey', 'Quest', 'Odyssey', 'Expedition', 'Horizons', 'Passage', 'Legends', 'Tales', 'Chronicles', 'Saga'],
  RPG:        ['Realms', 'Souls', 'Fate', 'Destiny', 'Legacy', 'Dominion', 'Prophecy', 'Awakening', 'Ascension', 'Eclipse'],
  Simulation: ['Tycoon', 'Simulator', 'Manager', 'Builder', 'Planner', 'Architect', 'Express', 'Works', 'Kingdom', 'Station'],
  Strategy:   ['Tactics', 'Kingdoms', 'Fronts', 'Legions', 'Empires', 'Crusade', 'Bastions', 'Vanguard', 'Citadel', 'Throne'],
  Casual:     ['Blast', 'Rush', 'Pop', 'Dash', 'Drop', 'Match', 'Frenzy', 'Splash', 'World', 'Land'],
};

const TITLE_TOPICS = {
  Action:     ['Shadow', 'Warzone', 'Neon', 'Cyber', 'Black', 'Inferno', 'Phantom', 'Viper'],
  Adventure:  ['Temple', 'Island', 'Ocean', 'Forest', 'Sky', 'Mountain', 'Ruins', 'Cave'],
  RPG:        ['Sword', 'Shield', 'Crown', 'Ring', 'Scroll', 'Rune', 'Ember', 'Void'],
  Simulation: ['Farm', 'Space', 'Train', 'Airport', 'Hospital', 'Factory', 'Zoo', 'Resort'],
  Strategy:   ['Castle', 'Fortress', 'Battalion', 'Fleet', 'Dynasty', 'Republic', 'Territory', 'Border'],
  Casual:     ['Kitten', 'Bubble', 'Cookie', 'Rainbow', 'Garden', 'Puzzle', 'Star', 'Berry'],
};

function generateGameTitle(genre) {
  const prefixes = TITLE_PREFIXES[genre] || TITLE_PREFIXES.Action;
  const suffixes = TITLE_SUFFIXES[genre] || TITLE_SUFFIXES.Action;
  const topics = TITLE_TOPICS[genre] || TITLE_TOPICS.Action;

  const pattern = Math.floor(Math.random() * 4);
  switch (pattern) {
    case 0: // "Prefix Suffix" — e.g. "Dark Souls"
      return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    case 1: // "Prefix Topic" — e.g. "Shadow Temple"
      return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${topics[Math.floor(Math.random() * topics.length)]}`;
    case 2: // "Topic Suffix" — e.g. "Dragon Realms"
      return `${topics[Math.floor(Math.random() * topics.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    case 3: // "The Prefix Topic" — e.g. "The Lost Island"
      return `The ${prefixes[Math.floor(Math.random() * prefixes.length)]} ${topics[Math.floor(Math.random() * topics.length)]}`;
    default:
      return `${prefixes[0]} ${suffixes[0]}`;
  }
}

// ── Competitor Studio Definitions ────────────────────────────────

const COMPETITOR_STUDIOS = [
  {
    id: 'megacorp',
    name: 'MegaCorp Games',
    style: 'aaa_behemoth',
    description: 'AAA behemoth with massive budgets but glacial innovation.',
    preferredGenres: ['Action', 'Adventure', 'RPG'],
    preferredTopics: ['Sci-Fi', 'Fantasy', 'Zombies', 'Space', 'Superheroes', 'Medieval'],
    cashRange: [8000000, 25000000],
    qualityRange: [5.5, 8.5],
    releaseFrequency: 2,  // games per year
    marketPresence: 1.4,  // revenue multiplier (brand power)
    riskTolerance: 0.2,   // low — sticks to safe bets
    sequelBias: 0.6,      // 60% chance to make sequel of their best game
    color: '#f85149',
  },
  {
    id: 'pixelforge',
    name: 'Pixel Forge',
    style: 'indie_darling',
    description: 'Small but mighty indie studio with a dedicated cult following.',
    preferredGenres: ['Adventure', 'RPG', 'Casual'],
    preferredTopics: ['Fantasy', 'Mystery', 'Life', 'Romance', 'Comedy', 'School'],
    cashRange: [200000, 1500000],
    qualityRange: [6.0, 9.5],
    releaseFrequency: 3,  // games per year
    marketPresence: 0.6,
    riskTolerance: 0.7,   // high — takes creative risks
    sequelBias: 0.15,
    color: '#da7cff',
  },
  {
    id: 'nexus',
    name: 'Nexus Interactive',
    style: 'balanced_rival',
    description: 'Your main rival — well-rounded mid-tier studio.',
    preferredGenres: ['Action', 'RPG', 'Strategy', 'Adventure'],
    preferredTopics: ['Sci-Fi', 'Fantasy', 'Medieval', 'Cyberpunk', 'Horror', 'Spy'],
    cashRange: [2000000, 10000000],
    qualityRange: [5.0, 9.0],
    releaseFrequency: 3,
    marketPresence: 1.0,
    riskTolerance: 0.4,
    sequelBias: 0.35,
    color: '#58a6ff',
  },
  {
    id: 'cashgrab',
    name: 'CashGrab Studios',
    style: 'sequel_factory',
    description: 'Churns out sequels and remakes. High revenue, declining quality.',
    preferredGenres: ['Action', 'Casual', 'Simulation'],
    preferredTopics: ['Sports', 'Racing', 'Zombies', 'Superheroes', 'Dance', 'Music'],
    cashRange: [3000000, 12000000],
    qualityRange: [3.5, 7.0],
    releaseFrequency: 4,  // churns them out
    marketPresence: 1.2,
    riskTolerance: 0.1,   // plays it ultra-safe
    sequelBias: 0.8,      // almost always sequels
    color: '#d29922',
  },
  {
    id: 'visionary',
    name: 'Visionary Arts',
    style: 'innovation_focused',
    description: 'Pushes boundaries — sometimes brilliantly, sometimes disastrously.',
    preferredGenres: ['RPG', 'Simulation', 'Strategy', 'Adventure'],
    preferredTopics: ['Cyberpunk', 'Space Opera', 'Time Travel', 'Multiverse', 'Biotech', 'Hacking'],
    cashRange: [1500000, 8000000],
    qualityRange: [3.0, 10.0],  // widest range — feast or famine
    releaseFrequency: 2,
    marketPresence: 0.9,
    riskTolerance: 0.9,   // maximum risk-taking
    sequelBias: 0.1,      // almost never makes sequels
    color: '#3fb950',
  },
  {
    id: 'easternstar',
    name: 'Eastern Star',
    style: 'regional_specialist',
    description: 'RPG and strategy powerhouse, dominant in Asian markets.',
    preferredGenres: ['RPG', 'Strategy', 'Simulation'],
    preferredTopics: ['Fantasy', 'Medieval', 'Ninja', 'Martial Arts', 'Space', 'Dragon Taming'],
    cashRange: [2000000, 9000000],
    qualityRange: [6.0, 9.5],
    releaseFrequency: 2,
    marketPresence: 0.85,
    riskTolerance: 0.3,
    sequelBias: 0.4,
    color: '#79c0ff',
  },
];

// ── Competitor System ────────────────────────────────────────────

class CompetitorSystem {
  constructor() {
    this.studios = [];
    this.allGames = [];         // all competitor games ever released
    this.yearlyRevenue = {};    // { studioId: totalRev }
    this.lastReleaseWeek = {};  // { studioId: lastWeek }
    this.genreSaturation = {};  // { genre: count in last 48 weeks }
  }

  init() {
    this.studios = COMPETITOR_STUDIOS.map(def => ({
      ...def,
      games: [],
      totalRevenue: 0,
      recentRevenue: 0,   // revenue in last 48 weeks (for market share)
      bestGame: null,
      sequelCounter: {},   // { title: count }
    }));
    this.allGames = [];
    this.yearlyRevenue = {};
    this.lastReleaseWeek = {};
    this.genreSaturation = {};
  }

  /**
   * Monthly tick — competitors may release games.
   * Called from engine.tick() when month changes.
   */
  monthlyTick(totalWeeks, currentYear) {
    const releases = [];

    for (const studio of this.studios) {
      // Check if this studio should release this month
      const weeksSinceLastRelease = totalWeeks - (this.lastReleaseWeek[studio.id] || 0);
      const releaseInterval = Math.floor(48 / studio.releaseFrequency); // weeks between releases
      const jitter = Math.floor(Math.random() * 8) - 4; // +/- 4 weeks randomness

      if (weeksSinceLastRelease >= releaseInterval + jitter) {
        const game = this._generateGame(studio, totalWeeks, currentYear);
        if (game) {
          studio.games.push(game);
          this.allGames.push(game);
          studio.totalRevenue += game.revenue;
          this.lastReleaseWeek[studio.id] = totalWeeks;

          // Update genre saturation
          this.genreSaturation[game.genre] = (this.genreSaturation[game.genre] || 0) + 1;

          // Track best game
          if (!studio.bestGame || game.score > studio.bestGame.score) {
            studio.bestGame = game;
          }

          releases.push(game);
        }
      }
    }

    // Decay genre saturation over time (every 48 weeks)
    if (totalWeeks % 48 === 0) {
      for (const genre in this.genreSaturation) {
        this.genreSaturation[genre] = Math.max(0, Math.floor(this.genreSaturation[genre] * 0.6));
      }
    }

    // Update recent revenue (rolling 48-week window)
    this._updateRecentRevenue(totalWeeks);

    return releases;
  }

  /** Generate a competitor game based on studio personality */
  _generateGame(studio, totalWeeks, currentYear) {
    // Pick genre based on studio preferences + trending awareness
    const genre = this._pickGenre(studio);
    const topic = this._pickTopic(studio, genre);

    // Quality is random within the studio's range, shaped by risk tolerance
    const [minQ, maxQ] = studio.qualityRange;
    let score;
    if (studio.riskTolerance > 0.5) {
      // High risk: bimodal distribution — tends toward extremes
      const roll = Math.random();
      if (roll < 0.3) {
        score = minQ + Math.random() * (maxQ - minQ) * 0.3; // flop
      } else if (roll > 0.7) {
        score = maxQ - Math.random() * (maxQ - minQ) * 0.2; // hit
      } else {
        score = minQ + Math.random() * (maxQ - minQ); // normal
      }
    } else {
      // Low risk: normal-ish distribution centered in their range
      const center = (minQ + maxQ) / 2;
      const spread = (maxQ - minQ) / 2;
      score = center + (Math.random() - 0.5) * spread * 1.5;
    }
    score = Math.max(1, Math.min(10, Math.round(score * 2) / 2));

    // Revenue based on score and studio market presence
    const baseRevenue = this._calculateRevenue(score, studio, currentYear);

    // Determine game title (sequel check)
    let title;
    let isSequel = false;
    if (studio.bestGame && Math.random() < studio.sequelBias) {
      const baseTitle = studio.bestGame.title.replace(/\s+[IVXLCDM]+$/, '').replace(/\s+\d+$/, '');
      const seqNum = (studio.sequelCounter[baseTitle] || 1) + 1;
      studio.sequelCounter[baseTitle] = seqNum;
      title = seqNum <= 3 ? `${baseTitle} ${seqNum}` : `${baseTitle}: ${this._sequelSubtitle(genre)}`;
      isSequel = true;

      // Sequels have diminishing quality (CashGrab penalty is harsher)
      const seqPenalty = studio.style === 'sequel_factory' ? seqNum * 0.3 : seqNum * 0.15;
      score = Math.max(1, score - seqPenalty);
    } else {
      title = generateGameTitle(genre);
    }

    // Pick a platform
    const availablePlatforms = typeof PLATFORMS !== 'undefined'
      ? PLATFORMS.filter(p => isPlatformAvailable(p, totalWeeks))
      : [];
    const platform = availablePlatforms.length > 0
      ? availablePlatforms[Math.floor(Math.random() * availablePlatforms.length)]
      : { name: 'PC', id: 'pc' };

    // Pick game size based on studio budget
    const avgCash = (studio.cashRange[0] + studio.cashRange[1]) / 2;
    let size;
    if (avgCash > 15000000) size = 'AAA';
    else if (avgCash > 5000000) size = Math.random() > 0.4 ? 'Large' : 'AAA';
    else if (avgCash > 1500000) size = Math.random() > 0.5 ? 'Medium' : 'Large';
    else size = Math.random() > 0.4 ? 'Small' : 'Medium';

    return {
      title,
      studioId: studio.id,
      studioName: studio.name,
      genre,
      topic,
      platform: platform.name,
      platformId: platform.id,
      size,
      score: Math.round(score * 10) / 10,
      revenue: Math.round(baseRevenue),
      releaseWeek: totalWeeks,
      releaseYear: currentYear,
      isSequel,
    };
  }

  /** Pick genre based on studio preferences + market awareness */
  _pickGenre(studio) {
    const weights = [];
    const trending = typeof marketSim !== 'undefined' ? marketSim.trendingGenres : [];

    for (const genre of studio.preferredGenres) {
      let weight = 3; // base weight for preferred genres
      if (trending.includes(genre)) weight += 2; // chase trends
      // Penalize oversaturated genres (smart studios avoid)
      const saturation = this.genreSaturation[genre] || 0;
      if (saturation > 3 && studio.riskTolerance < 0.5) weight -= 1;
      weights.push({ genre, weight: Math.max(1, weight) });
    }

    // Small chance to pick a non-preferred genre
    if (Math.random() < studio.riskTolerance * 0.3) {
      const allGenres = typeof GENRES !== 'undefined' ? GENRES : ['Action', 'Adventure', 'RPG', 'Simulation', 'Strategy', 'Casual'];
      const nonPref = allGenres.filter(g => !studio.preferredGenres.includes(g));
      if (nonPref.length > 0) {
        weights.push({ genre: nonPref[Math.floor(Math.random() * nonPref.length)], weight: 1 });
      }
    }

    return this._weightedPick(weights);
  }

  /** Pick topic based on studio preferences */
  _pickTopic(studio, genre) {
    // Prefer studio's preferred topics, but occasionally pick random
    if (Math.random() < 0.7 && studio.preferredTopics.length > 0) {
      return studio.preferredTopics[Math.floor(Math.random() * studio.preferredTopics.length)];
    }
    // Random from available topics
    const available = typeof TOPICS !== 'undefined' ? TOPICS.filter(t => t.tier <= 2) : [];
    if (available.length > 0) {
      return available[Math.floor(Math.random() * available.length)].name;
    }
    return studio.preferredTopics[0] || 'Fantasy';
  }

  /** Calculate revenue from score and studio power */
  _calculateRevenue(score, studio, currentYear) {
    const [minCash, maxCash] = studio.cashRange;
    const budgetScale = (minCash + maxCash) / 2;

    // Score-to-revenue multiplier (similar curve to player's Scoring.computeRevenue)
    let scoreMult;
    if (score < 3)      scoreMult = 0.05;
    else if (score < 5) scoreMult = 0.15;
    else if (score < 7) scoreMult = 0.5;
    else if (score < 8) scoreMult = 0.75;
    else if (score < 8.5) scoreMult = 1.0;
    else if (score < 9) scoreMult = 1.4;
    else if (score < 9.5) scoreMult = 1.8;
    else                scoreMult = 2.2;

    // Market sentiment factor
    const sentiment = typeof marketSim !== 'undefined' ? marketSim.getSalesMultiplier() : 1.0;

    // Year scaling — industry grows over time
    const yearScale = 1 + (currentYear - 1) * 0.05;

    const baseRevenue = budgetScale * scoreMult * studio.marketPresence * sentiment * yearScale;

    // Add randomness (+/- 20%)
    return baseRevenue * (0.8 + Math.random() * 0.4);
  }

  /** Sequel subtitle generation */
  _sequelSubtitle(genre) {
    const subtitles = {
      Action:     ['Reckoning', 'Retribution', 'Origins', 'Revelations', 'Vendetta', 'Uprising'],
      Adventure:  ['New Dawn', 'Lost Chapter', 'Rebirth', 'Echoes', 'Uncharted Path', 'Beyond'],
      RPG:        ['Reborn', 'Awakening', 'Shadowlands', 'Eternal', 'Genesis', 'Ascendance'],
      Simulation: ['Deluxe', 'Ultimate', 'Next Gen', 'Evolution', 'Platinum', 'Complete'],
      Strategy:   ['Total War', 'Dark Ages', 'New World', 'Imperial', 'Sovereign', 'Aftermath'],
      Casual:     ['Turbo', 'Remix', 'Plus', 'Deluxe', 'Party Edition', 'Super'],
    };
    const options = subtitles[genre] || subtitles.Action;
    return options[Math.floor(Math.random() * options.length)];
  }

  /** Weighted random pick */
  _weightedPick(items) {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const item of items) {
      roll -= item.weight;
      if (roll <= 0) return item.genre;
    }
    return items[items.length - 1].genre;
  }

  /** Update recent revenue for market share (rolling 48-week window) */
  _updateRecentRevenue(totalWeeks) {
    const cutoff = totalWeeks - 48;
    for (const studio of this.studios) {
      studio.recentRevenue = studio.games
        .filter(g => g.releaseWeek >= cutoff)
        .reduce((sum, g) => sum + g.revenue, 0);
    }
  }

  /**
   * Get genre saturation penalty for player's game.
   * Returns multiplier 0.7-1.0 (lower = more saturated).
   */
  getGenreSaturationMultiplier(genre) {
    const saturation = this.genreSaturation[genre] || 0;
    if (saturation <= 1) return 1.0;
    if (saturation <= 3) return 0.95;
    if (saturation <= 5) return 0.85;
    return 0.7;
  }

  /**
   * Calculate market share for all studios + player.
   * Returns { player: %, studioId: %, ... }
   */
  getMarketShare(playerRecentRevenue) {
    const shares = {};
    let total = Math.max(1, playerRecentRevenue || 0);

    for (const studio of this.studios) {
      total += studio.recentRevenue;
    }

    shares.player = ((playerRecentRevenue || 0) / total) * 100;
    for (const studio of this.studios) {
      shares[studio.id] = (studio.recentRevenue / total) * 100;
    }

    return shares;
  }

  /**
   * Get industry leaderboard sorted by recent revenue.
   * Includes player studio.
   */
  getLeaderboard(playerName, playerRecentRevenue) {
    const entries = this.studios.map(s => ({
      name: s.name,
      id: s.id,
      revenue: s.recentRevenue,
      color: s.color,
      isPlayer: false,
    }));

    entries.push({
      name: playerName || 'Your Studio',
      id: 'player',
      revenue: playerRecentRevenue || 0,
      color: '#e6edf3',
      isPlayer: true,
    });

    entries.sort((a, b) => b.revenue - a.revenue);

    // Assign ranks
    entries.forEach((e, i) => { e.rank = i + 1; });
    return entries;
  }

  /**
   * Get rivalry level with each studio (based on revenue proximity).
   * Returns 'friendly' | 'neutral' | 'rival' | 'nemesis'
   */
  getRivalryLevel(studioId, playerRecentRevenue) {
    const studio = this.studios.find(s => s.id === studioId);
    if (!studio) return 'neutral';

    const ratio = playerRecentRevenue > 0
      ? studio.recentRevenue / playerRecentRevenue
      : 0;

    if (ratio > 2) return 'nemesis';
    if (ratio > 0.5 && ratio < 2) return 'rival';
    if (ratio > 0.1) return 'neutral';
    return 'friendly';
  }

  /**
   * Get recent competitor releases (last 48 weeks).
   */
  getRecentReleases(totalWeeks, count) {
    const cutoff = totalWeeks - 48;
    const recent = this.allGames
      .filter(g => g.releaseWeek >= cutoff)
      .sort((a, b) => b.releaseWeek - a.releaseWeek);
    return count ? recent.slice(0, count) : recent;
  }

  // ── Serialization ────────────────────────────────────────────

  serialize() {
    return {
      studios: this.studios.map(s => ({
        id: s.id,
        games: s.games,
        totalRevenue: s.totalRevenue,
        recentRevenue: s.recentRevenue,
        bestGame: s.bestGame,
        sequelCounter: s.sequelCounter,
      })),
      allGames: this.allGames,
      lastReleaseWeek: { ...this.lastReleaseWeek },
      genreSaturation: { ...this.genreSaturation },
    };
  }

  deserialize(data) {
    if (!data) return;

    // Restore studios from definitions + saved state
    this.studios = COMPETITOR_STUDIOS.map(def => {
      const saved = data.studios ? data.studios.find(s => s.id === def.id) : null;
      return {
        ...def,
        games: saved ? saved.games : [],
        totalRevenue: saved ? saved.totalRevenue : 0,
        recentRevenue: saved ? saved.recentRevenue : 0,
        bestGame: saved ? saved.bestGame : null,
        sequelCounter: saved ? saved.sequelCounter : {},
      };
    });

    this.allGames = data.allGames || [];
    this.lastReleaseWeek = data.lastReleaseWeek || {};
    this.genreSaturation = data.genreSaturation || {};
  }

  reset() {
    this.studios = [];
    this.allGames = [];
    this.yearlyRevenue = {};
    this.lastReleaseWeek = {};
    this.genreSaturation = {};
    this.init();
  }
}

// Global instance
const competitorSystem = new CompetitorSystem();
