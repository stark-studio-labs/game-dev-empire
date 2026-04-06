/**
 * Tech Empire — Game of the Year Awards
 * Annual ceremony with categories, nominees, and fan/prestige rewards.
 */
const AWARD_CATEGORIES = [
  { id: 'goty', name: 'Game of the Year', icon: '🏆' },
  { id: 'best_action', name: 'Best Action Game', genre: 'Action', icon: '⚔️' },
  { id: 'best_rpg', name: 'Best RPG', genre: 'RPG', icon: '🛡️' },
  { id: 'best_sim', name: 'Best Simulation', genre: 'Simulation', icon: '🏗️' },
  { id: 'most_innovative', name: 'Most Innovative', icon: '💡' },
];

class AwardSystem {
  constructor() { this.history = []; this.prestige = 0; }
  reset() { this.history = []; this.prestige = 0; }

  checkYearEnd(state) {
    // Get all games released this year (player games)
    const yearGames = state.games.filter(g => g.releaseYear === state.year);
    if (yearGames.length === 0) return null;

    const ceremony = { year: state.year, categories: [] };

    for (const cat of AWARD_CATEGORIES) {
      let candidates = yearGames;
      if (cat.genre) candidates = candidates.filter(g => g.genre === cat.genre);
      if (candidates.length === 0) continue;

      // Sort by score, pick top 3 nominees
      const sorted = candidates.sort((a, b) => b.reviewAvg - a.reviewAvg);
      const nominees = sorted.slice(0, 3).map(g => ({ title: g.title, score: g.reviewAvg, isPlayer: true }));

      // Add a competitor nominee for drama
      const compScore = 5 + Math.random() * 4.5;
      const compNames = ['Shadow Protocol', 'Neon Drift', 'Iron Legacy', 'Pixel Dreams', 'Cosmic Run'];
      nominees.push({ title: compNames[Math.floor(Math.random() * compNames.length)], score: compScore, isPlayer: false });
      nominees.sort((a, b) => b.score - a.score);

      const winner = nominees[0];
      ceremony.categories.push({
        ...cat,
        nominees: nominees.slice(0, 3),
        winner: winner,
        playerWon: winner.isPlayer,
      });

      if (winner.isPlayer) {
        state.fans = Math.round(state.fans * 1.25); // +25% fans
        this.prestige++;
      }
    }

    this.history.push(ceremony);
    return ceremony;
  }

  getPrestigeBonus() { return 1 + this.prestige * 0.02; }
  getHistory() { return this.history; }
  serialize() { return { history: this.history, prestige: this.prestige }; }
  deserialize(data) { if (data) { this.history = data.history || []; this.prestige = data.prestige || 0; } }
}
const awardSystem = new AwardSystem();
