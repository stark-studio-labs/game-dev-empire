/**
 * Tech Empire -- Franchise & Sequel System
 * Tracks released game IPs, computes sequel/remaster modifiers.
 */

class FranchiseTracker {
  constructor() {
    this.franchises = {}; // { title: [{ entry, score, revenue, releaseWeek }] }
  }

  /**
   * Register a released game into the franchise database.
   * Call this after every game release in engine._releaseGame().
   */
  registerGame(title, topic, genre, score, revenue, releaseWeek) {
    const key = this._normalizeTitle(title);
    if (!this.franchises[key]) {
      this.franchises[key] = [];
    }
    this.franchises[key].push({
      title,
      topic,
      genre,
      score,
      revenue,
      releaseWeek,
      entry: this.franchises[key].length + 1,
    });
  }

  /**
   * Check if a title has been used before (case-insensitive, trimmed).
   * Returns franchise info or null.
   */
  getFranchiseInfo(title) {
    const key = this._normalizeTitle(title);
    const entries = this.franchises[key];
    if (!entries || entries.length === 0) return null;
    return {
      title: entries[0].title,
      entryCount: entries.length,
      avgScore: entries.reduce((s, e) => s + e.score, 0) / entries.length,
      totalRevenue: entries.reduce((s, e) => s + e.revenue, 0),
      lastReleaseWeek: entries[entries.length - 1].releaseWeek,
      entries,
    };
  }

  /**
   * Get the sequel multiplier for a title.
   * Returns { multiplier, breakdown } or null if not a sequel.
   */
  getSequelModifier(title, currentWeek) {
    const info = this.getFranchiseInfo(title);
    if (!info) return null;

    const nextEntry = info.entryCount + 1;

    // Entry count modifier: 2nd=1.15, 3rd=1.05, 4th=0.95, 5th+=0.75
    let entryMod;
    if (nextEntry === 2) entryMod = 1.15;
    else if (nextEntry === 3) entryMod = 1.05;
    else if (nextEntry === 4) entryMod = 0.95;
    else entryMod = 0.75;

    // Time gap modifier (weeks since last release)
    const weeksSinceLast = currentWeek - info.lastReleaseWeek;
    const yearsSinceLast = weeksSinceLast / 48; // 48 game-weeks per year
    let gapMod;
    if (yearsSinceLast < 1.5) gapMod = -0.15;      // Annual = fatigue
    else if (yearsSinceLast < 2.5) gapMod = 0;      // 2yr = neutral
    else gapMod = 0.05;                              // 3yr+ = anticipation

    // Brand strength based on average review score
    let brandMod;
    if (info.avgScore >= 9.0) brandMod = 0.15;
    else if (info.avgScore >= 8.0) brandMod = 0.10;
    else if (info.avgScore >= 7.0) brandMod = 0.05;
    else if (info.avgScore >= 5.0) brandMod = 0;
    else brandMod = -0.10;

    // Franchise fatigue: increases when entries are rapid
    const avgGap = weeksSinceLast / Math.max(info.entryCount, 1);
    const fatigueMod = avgGap < 30 ? -0.10 : avgGap < 50 ? -0.05 : 0;

    const multiplier = Math.max(0.5, entryMod + gapMod + brandMod + fatigueMod);

    return {
      multiplier,
      nextEntry,
      breakdown: { entryMod, gapMod, brandMod, fatigueMod },
      info,
    };
  }

  /**
   * Get remaster opportunity score for a title.
   * Optimal window: 5-15 years after original release.
   * Returns { score (0-1), yearsAgo } or null.
   */
  getRemasterScore(title, currentWeek) {
    const info = this.getFranchiseInfo(title);
    if (!info) return null;

    const firstRelease = info.entries[0];
    const weeksSince = currentWeek - firstRelease.releaseWeek;
    const yearsSince = weeksSince / 48;

    let score;
    if (yearsSince < 3) score = 0.1;              // Too soon
    else if (yearsSince < 5) score = 0.4;          // Early
    else if (yearsSince <= 15) score = 0.9;        // Sweet spot
    else if (yearsSince <= 20) score = 0.6;        // Late but viable
    else score = 0.3;                               // Very old

    // Boost for beloved originals
    if (firstRelease.score >= 8.0) score = Math.min(1.0, score + 0.1);

    return {
      score: Math.round(score * 100) / 100,
      yearsAgo: Math.round(yearsSince * 10) / 10,
      originalScore: firstRelease.score,
    };
  }

  /** Normalize title for matching: lowercase, trim, collapse spaces */
  _normalizeTitle(title) {
    return (title || '').toLowerCase().trim().replace(/\s+/g, ' ')
      .replace(/\s*[:\-]\s*(the\s+)?(sequel|remaster|remastered|redux|2|3|4|5|ii|iii|iv|v)\s*$/i, '');
  }

  /** Get all franchise names for autocomplete/display */
  getAllFranchises() {
    return Object.keys(this.franchises).map(key => {
      const entries = this.franchises[key];
      return {
        key,
        displayTitle: entries[0].title,
        entryCount: entries.length,
        avgScore: entries.reduce((s, e) => s + e.score, 0) / entries.length,
      };
    });
  }

  serialize() {
    return { franchises: this.franchises };
  }

  deserialize(data) {
    if (!data) return;
    this.franchises = data.franchises || {};
  }

  reset() {
    this.franchises = {};
  }
}

// Global instance
const franchiseTracker = new FranchiseTracker();
