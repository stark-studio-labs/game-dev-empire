/**
 * Tech Empire -- Publisher Deals System
 * 8 publishers with personalities, advance/royalty structures, deal evaluation.
 */

const PUBLISHERS = [
  {
    id: 'megacorp',
    name: 'MegaCorp Games',
    tagline: 'Massive reach, massive cut',
    reputation: 95,
    advancePct: 0.40,       // 40% of expected revenue as advance
    royaltyCut: 0.45,       // Publisher takes 45%
    preferredGenres: ['Action', 'RPG'],
    minScore: 7.0,
    minCompanyRep: 30,
    color: '#f85149',
  },
  {
    id: 'indie_fuel',
    name: 'Indie Fuel',
    tagline: 'Low cut, indie-friendly',
    reputation: 60,
    advancePct: 0.10,
    royaltyCut: 0.15,
    preferredGenres: ['Adventure', 'Casual', 'RPG'],
    minScore: 4.0,
    minCompanyRep: 0,
    color: '#3fb950',
  },
  {
    id: 'galaxy_pub',
    name: 'Galaxy Publishing',
    tagline: 'Sci-fi & strategy specialists',
    reputation: 75,
    advancePct: 0.25,
    royaltyCut: 0.30,
    preferredGenres: ['Strategy', 'Simulation'],
    minScore: 6.0,
    minCompanyRep: 15,
    color: '#58a6ff',
  },
  {
    id: 'pixel_prime',
    name: 'Pixel Prime',
    tagline: 'Premium games, premium deals',
    reputation: 85,
    advancePct: 0.35,
    royaltyCut: 0.40,
    preferredGenres: ['RPG', 'Adventure', 'Action'],
    minScore: 8.0,
    minCompanyRep: 50,
    color: '#da7cff',
  },
  {
    id: 'casual_king',
    name: 'Casual Kingdom',
    tagline: 'Casual games, massive audience',
    reputation: 70,
    advancePct: 0.20,
    royaltyCut: 0.25,
    preferredGenres: ['Casual', 'Simulation'],
    minScore: 3.0,
    minCompanyRep: 5,
    color: '#d29922',
  },
  {
    id: 'neon_gate',
    name: 'Neon Gate Studios',
    tagline: 'Action-first publisher',
    reputation: 80,
    advancePct: 0.30,
    royaltyCut: 0.35,
    preferredGenres: ['Action', 'Strategy'],
    minScore: 6.5,
    minCompanyRep: 20,
    color: '#ff6b6b',
  },
  {
    id: 'aurora',
    name: 'Aurora Interactive',
    tagline: 'Story-driven excellence',
    reputation: 78,
    advancePct: 0.22,
    royaltyCut: 0.28,
    preferredGenres: ['Adventure', 'RPG'],
    minScore: 7.0,
    minCompanyRep: 25,
    color: '#79c0ff',
  },
  {
    id: 'titan_media',
    name: 'Titan Media Group',
    tagline: 'Global distribution powerhouse',
    reputation: 90,
    advancePct: 0.45,
    royaltyCut: 0.50,
    preferredGenres: ['Action', 'RPG', 'Strategy', 'Simulation'],
    minScore: 8.5,
    minCompanyRep: 60,
    color: '#ff9800',
  },
];

const PublisherSystem = {
  /**
   * Calculate company reputation from game history.
   * Based on: number of games, average score, total revenue.
   */
  getCompanyReputation(games) {
    if (!games || games.length === 0) return 0;
    const avgScore = games.reduce((s, g) => s + g.reviewAvg, 0) / games.length;
    const gameCountBonus = Math.min(30, games.length * 3);
    const scoreBonus = Math.max(0, (avgScore - 5) * 8);
    const totalRev = games.reduce((s, g) => s + g.totalRevenue, 0);
    const revBonus = Math.min(20, Math.log10(Math.max(totalRev, 1)) * 3);
    return Math.min(100, Math.round(gameCountBonus + scoreBonus + revBonus));
  },

  /**
   * Get available publisher deals for a game.
   * Returns publishers willing to work with you, with deal terms.
   */
  getAvailableDeals(games, genre, expectedRevenue) {
    const companyRep = this.getCompanyReputation(games);
    const avgScore = games.length > 0
      ? games.reduce((s, g) => s + g.reviewAvg, 0) / games.length
      : 0;

    return PUBLISHERS
      .filter(pub => {
        if (companyRep < pub.minCompanyRep) return false;
        if (avgScore < pub.minScore && games.length > 2) return false;
        return true;
      })
      .map(pub => {
        const genreMatch = pub.preferredGenres.includes(genre);
        const advance = Math.round(expectedRevenue * pub.advancePct * (genreMatch ? 1.15 : 0.85));
        const royaltyCut = genreMatch
          ? Math.max(0.10, pub.royaltyCut - 0.05)
          : pub.royaltyCut;

        return {
          ...pub,
          genreMatch,
          advance,
          effectiveRoyaltyCut: royaltyCut,
          playerRevShare: 1 - royaltyCut,
          estimatedPlayerRevenue: Math.round(expectedRevenue * (1 - royaltyCut)),
        };
      })
      .sort((a, b) => b.estimatedPlayerRevenue - a.estimatedPlayerRevenue);
  },

  /**
   * Check if self-publishing is available.
   * Requires fans > threshold.
   */
  canSelfPublish(fans) {
    return fans >= 10000;
  },

  /**
   * Apply a publisher deal to revenue.
   * Returns adjusted revenue after publisher cut.
   */
  applyDeal(deal, totalRevenue) {
    if (!deal) {
      // Self-published: keep all revenue
      return { playerRevenue: totalRevenue, publisherCut: 0, advance: 0 };
    }
    const publisherCut = Math.round(totalRevenue * deal.effectiveRoyaltyCut);
    const playerRevenue = totalRevenue - publisherCut;
    return {
      playerRevenue,
      publisherCut,
      advance: deal.advance,
    };
  },
};
