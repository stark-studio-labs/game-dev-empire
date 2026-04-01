/**
 * Tech Empire — Market Simulation
 * Boom/bust cycles, trending genres, sentiment drift.
 * Market sentiment affects game sales multiplier.
 */

const MARKET_LABELS = [
  { min: 0.0,  max: 0.65, label: 'Recession',  color: '#f85149', emoji: '' },
  { min: 0.65, max: 0.85, label: 'Downturn',   color: '#d29922', emoji: '' },
  { min: 0.85, max: 1.15, label: 'Stable',      color: '#8b949e', emoji: '' },
  { min: 1.15, max: 1.35, label: 'Growth',      color: '#58a6ff', emoji: '' },
  { min: 1.35, max: 2.0,  label: 'Boom',        color: '#3fb950', emoji: '' },
];

class MarketSimulation {
  constructor() {
    this.sentiment = 1.0;      // 0.5 (recession) to 1.5 (boom)
    this.trendingGenres = [];   // 2 genres currently trending
    this.history = [];          // sentiment history for chart
    this.cyclePhase = 0;        // internal phase counter
    this.lastGenreRotation = 0; // week of last genre rotation
  }

  /** Initialize market state */
  init() {
    this.sentiment = 0.9 + Math.random() * 0.2; // start near stable
    this._rotateTrendingGenres();
    this.history = [{ week: 0, sentiment: this.sentiment }];
  }

  /**
   * Advance market by one week.
   * Called from engine.tick().
   */
  tick(totalWeeks) {
    // Sentiment drift: random walk with mean reversion
    const meanReversion = (1.0 - this.sentiment) * 0.008; // pull toward 1.0
    const randomShock = (Math.random() - 0.5) * 0.03;     // small random noise

    // Boom/bust cycle: sinusoidal component (period ~250-400 weeks = 5-8 years)
    const cyclePeriod = 300 + Math.sin(totalWeeks * 0.001) * 80;
    const cycleComponent = Math.sin((totalWeeks / cyclePeriod) * Math.PI * 2) * 0.008;

    this.sentiment += meanReversion + randomShock + cycleComponent;

    // Clamp to valid range
    this.sentiment = Math.max(0.5, Math.min(1.5, this.sentiment));

    // Record history every 4 weeks (monthly)
    if (totalWeeks % 4 === 0) {
      this.history.push({ week: totalWeeks, sentiment: this.sentiment });
      // Keep last 3 years of history (36 months)
      if (this.history.length > 36) {
        this.history = this.history.slice(-36);
      }
    }

    // Rotate trending genres yearly (every 48 weeks)
    if (totalWeeks - this.lastGenreRotation >= 48) {
      this._rotateTrendingGenres();
      this.lastGenreRotation = totalWeeks;
    }
  }

  /** Get current market label and color */
  getLabel() {
    for (const band of MARKET_LABELS) {
      if (this.sentiment >= band.min && this.sentiment < band.max) {
        return band;
      }
    }
    return MARKET_LABELS[2]; // default Stable
  }

  /** Get sales multiplier based on sentiment */
  getSalesMultiplier() {
    // Sentiment directly scales sales: 0.5x in deep recession, 1.5x in peak boom
    return this.sentiment;
  }

  /** Check if a genre is currently trending */
  isGenreTrending(genre) {
    return this.trendingGenres.includes(genre);
  }

  /** Get trending genre bonus (1.15x if trending, 1.0 otherwise) */
  getGenreBonus(genre) {
    return this.isGenreTrending(genre) ? 1.15 : 1.0;
  }

  /** Rotate which genres are trending */
  _rotateTrendingGenres() {
    const available = [...GENRES];
    this.trendingGenres = [];
    for (let i = 0; i < 2; i++) {
      const idx = Math.floor(Math.random() * available.length);
      this.trendingGenres.push(available[idx]);
      available.splice(idx, 1);
    }
  }

  serialize() {
    return {
      sentiment: this.sentiment,
      trendingGenres: [...this.trendingGenres],
      history: [...this.history],
      cyclePhase: this.cyclePhase,
      lastGenreRotation: this.lastGenreRotation,
    };
  }

  deserialize(data) {
    if (!data) return;
    this.sentiment = data.sentiment || 1.0;
    this.trendingGenres = data.trendingGenres || [];
    this.history = data.history || [];
    this.cyclePhase = data.cyclePhase || 0;
    this.lastGenreRotation = data.lastGenreRotation || 0;
    if (this.trendingGenres.length === 0) this._rotateTrendingGenres();
  }

  reset() {
    this.sentiment = 1.0;
    this.trendingGenres = [];
    this.history = [];
    this.cyclePhase = 0;
    this.lastGenreRotation = 0;
    this.init();
  }
}

// Global instance
const marketSim = new MarketSimulation();
