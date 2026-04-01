/**
 * Tech Empire — Scoring System
 * Implements GDT's review + revenue formulas faithfully.
 */

const Scoring = {
  /**
   * Compute Design/Tech balance modifier.
   * Range: [-0.4, +0.4]
   */
  designTechBalance(design, tech, genre) {
    const idealRatio = GENRE_DT_RATIO[genre] || 1.0;
    // Delta = (Design * idealTechToDesign - Tech) / max(Design, Tech)
    const denom = Math.max(design, tech, 1);
    const delta = (design * (1 / idealRatio) - tech) / denom;
    // Map delta to modifier: 0 = perfect = +0.4, |1| = worst = -0.4
    const absDelta = Math.min(Math.abs(delta), 1);
    return 0.4 - 0.8 * absDelta;
  },

  /**
   * Compute time management modifier based on slider allocations.
   * sliders: array of 9 values (0-100) for each aspect in order.
   * genre: string genre name.
   * Range: [-0.4, +0.4]
   */
  timeManagement(sliders, genre) {
    const importance = GENRE_IMPORTANCE[genre];
    if (!importance) return 0;

    let score = 0;
    let checks = 0;

    for (let i = 0; i < 9; i++) {
      const imp = importance[i];
      const pct = sliders[i]; // 0-100

      if (imp >= 0.9) {
        // Important — should be >= 40%
        checks++;
        if (pct >= 40) score += 1;
        else if (pct < 20) score -= 1;
      } else if (imp <= 0.1) {
        // Restricted — should be <= 20%
        checks++;
        if (pct <= 20) score += 1;
        else if (pct > 40) score -= 1;
      }
    }

    if (checks === 0) return 0;
    const normalized = score / checks; // -1 to 1
    return normalized * 0.4;
  },

  /**
   * Topic-genre compatibility modifier.
   * Range: [0.6, 1.0]
   */
  topicGenreMod(topic, genre) {
    const topicData = TOPICS.find(t => t.name === topic);
    if (!topicData) return 0.8;
    const genreIdx = GENRES.indexOf(genre);
    if (genreIdx < 0) return 0.8;
    return topicData.genreW[genreIdx];
  },

  /**
   * Topic-audience modifier.
   * Range: [0.6, 1.0]
   */
  topicAudienceMod(topic, audience) {
    const topicData = TOPICS.find(t => t.name === topic);
    if (!topicData) return 0.8;
    const audIdx = AUDIENCES.indexOf(audience);
    if (audIdx < 0) return 0.8;
    return topicData.audienceW[audIdx];
  },

  /**
   * Platform-genre compatibility modifier.
   * Range: [0.6, 1.0]
   */
  platformGenreMod(platformId, genre) {
    const plat = PLATFORMS.find(p => p.id === platformId);
    if (!plat) return 0.8;
    const genreIdx = GENRES.indexOf(genre);
    if (genreIdx < 0) return 0.8;
    return plat.genreW[genreIdx];
  },

  /**
   * Bug ratio.
   * Based on dev time vs. ideal. Faster dev = more bugs.
   * Range: [0.5, 1.0]
   */
  bugRatio(actualWeeks, idealWeeks, staffCount) {
    const ratio = actualWeeks / Math.max(idealWeeks, 1);
    // More staff without enough time = more bugs
    const staffPenalty = Math.max(0, (staffCount - 2) * 0.02);
    const base = Math.min(1.0, ratio * 0.8 + 0.2);
    return Math.max(0.5, base - staffPenalty);
  },

  /**
   * Compute the full game score.
   */
  computeGameScore({ design, tech, genre, topic, audience, platformId, size, sliders, devWeeks, staffCount }) {
    const sizeData = GAME_SIZES[size] || GAME_SIZES.Small;
    const divisor = sizeData.divisor;

    const rawPoints = (design + tech) / divisor;
    const dtBalance = this.designTechBalance(design, tech, genre);
    const timeMgmt = this.timeManagement(sliders, genre);
    const topicGenre = this.topicGenreMod(topic, genre);
    const topicAud = this.topicAudienceMod(topic, audience);
    const platGenre = this.platformGenreMod(platformId, genre);
    const bugs = this.bugRatio(devWeeks, sizeData.devWeeks, staffCount);

    // Research bonus from completed tech tree items
    const researchBonus = 1 + (typeof researchSystem !== 'undefined' ? researchSystem.getScoreBonus() : 0);

    const modifiers = 1 + dtBalance + timeMgmt;
    const gameScore = rawPoints * modifiers * topicGenre * topicAud * platGenre * bugs * researchBonus;

    return {
      gameScore: Math.max(0, gameScore),
      breakdown: { rawPoints, dtBalance, timeMgmt, topicGenre, topicAud, platGenre, bugs },
    };
  },

  /**
   * Convert game score to review scores (4 reviewers, 1-10 each).
   * Uses GDT's relative scoring: compared to personal best.
   */
  computeReviewScores(gameScore, topScore, topScoreDelta, currentYear) {
    // Target Game Score
    let tgs;
    if (topScore <= 0) {
      tgs = 20;
    } else {
      const yearMod = 1 + (currentYear - 1) * 0.02;
      tgs = topScore + topScoreDelta * yearMod;
    }

    let baseScore;
    if (gameScore >= tgs) {
      baseScore = 9.5;
    } else {
      baseScore = Math.max(1, 9.5 * (gameScore / tgs));
    }

    // Generate 4 reviewer scores with slight randomization
    const reviews = [];
    for (let i = 0; i < 4; i++) {
      const variance = (Math.random() - 0.5) * 1.5;
      const score = Math.round(Math.min(10, Math.max(1, baseScore + variance)) * 2) / 2;
      reviews.push(score);
    }

    const avg = reviews.reduce((a, b) => a + b, 0) / 4;

    return { reviews, average: Math.round(avg * 10) / 10, tgs };
  },

  /**
   * Compute revenue from a released game.
   */
  computeRevenue({ reviewAvg, platformId, fans, size, totalWeek, genre }) {
    const plat = PLATFORMS.find(p => p.id === platformId);
    const marketShare = plat ? getPlatformMarketShare(plat, totalWeek) : 0.1;

    // Review score multiplier (exponential)
    let reviewMult;
    if (reviewAvg < 3)      reviewMult = 0.05;
    else if (reviewAvg < 5) reviewMult = 0.15;
    else if (reviewAvg < 7) reviewMult = 0.4;
    else if (reviewAvg < 8) reviewMult = 0.7;
    else if (reviewAvg < 9) reviewMult = 1.0;
    else                    reviewMult = 2.0;

    // Size multiplier
    const sizeMults = { Small: 1, Medium: 3, Large: 8, AAA: 20 };
    const sizeMult = sizeMults[size] || 1;

    // Fan multiplier
    const fanMult = 1 + Math.log10(Math.max(fans, 1)) * 0.3;

    // Market sentiment and genre trending bonus
    const marketMult = typeof marketSim !== 'undefined' ? marketSim.getSalesMultiplier() : 1.0;
    const genreBonus = typeof marketSim !== 'undefined' && genre
      ? marketSim.getGenreBonus(genre) : 1.0;

    // Base revenue
    const baseRevenue = 50000;
    const totalRevenue = baseRevenue * reviewMult * sizeMult * fanMult * (marketShare * 10) * marketMult * genreBonus;

    // Units sold (at $40-60 per unit average)
    const avgPrice = 40 + sizeMult * 3;
    const unitsSold = Math.round(totalRevenue / avgPrice);

    return {
      totalRevenue: Math.round(totalRevenue),
      unitsSold,
      weeklyRevenue: [], // Filled by engine over sales period
    };
  },

  /**
   * Compute fans gained from a game release.
   */
  fansGained(reviewAvg, currentFans) {
    if (reviewAvg >= 9) return Math.round(50000 + currentFans * 0.15);
    if (reviewAvg >= 8) return Math.round(20000 + currentFans * 0.08);
    if (reviewAvg >= 7) return Math.round(5000 + currentFans * 0.03);
    if (reviewAvg >= 5) return Math.round(1000);
    return 0;
  },
};
