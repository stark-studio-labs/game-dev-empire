/**
 * Tech Empire — DLC / Expansion System
 * Release DLC for existing games to extend revenue.
 */
class DLCSystem {
  constructor() { this.dlcHistory = {}; }
  reset() { this.dlcHistory = {}; }

  canCreateDLC(game) {
    const existing = this.dlcHistory[game.title] || [];
    return existing.length < 2; // max 2 DLCs per game
  }

  getDLCCost(game) {
    const sizeCosts = { Small: 15000, Medium: 30000, Large: 50000, AAA: 80000 };
    return Math.round((sizeCosts[game.size] || 20000) * 0.3);
  }

  getDLCDevWeeks(game) {
    const sizeWeeks = { Small: 6, Medium: 10, Large: 16, AAA: 24 };
    return Math.ceil((sizeWeeks[game.size] || 8) * 0.4);
  }

  startDLC(game, dlcName, state) {
    const cost = this.getDLCCost(game);
    if (state.cash < cost) return { success: false, reason: 'Insufficient funds' };
    state.cash -= cost;
    if (typeof finance !== 'undefined') {
      finance.record('dev_cost', -cost, dlcName + ' (DLC Dev)', '');
    }
    state.activeDLC = {
      baseGame: game.title,
      dlcName: dlcName,
      devWeeksLeft: this.getDLCDevWeeks(game),
      totalWeeks: this.getDLCDevWeeks(game),
      baseRevenue: game.totalRevenue || 0,
      baseScore: game.reviewAvg || 5,
    };
    return { success: true, cost: cost, weeks: state.activeDLC.totalWeeks };
  }

  tickDLC(state) {
    if (!state.activeDLC) return null;
    state.activeDLC.devWeeksLeft--;
    if (state.activeDLC.devWeeksLeft <= 0) {
      return this.completeDLC(state);
    }
    return null;
  }

  completeDLC(state) {
    const dlc = state.activeDLC;
    if (!dlc) return null;
    // DLC revenue: 30-50% of base game revenue
    const revenueMultiplier = 0.3 + Math.random() * 0.2;
    const dlcRevenue = Math.round(dlc.baseRevenue * revenueMultiplier);
    const dlcScore = Math.max(1, Math.min(10, dlc.baseScore + (Math.random() - 0.5) * 2));
    state.cash += dlcRevenue;

    if (!this.dlcHistory[dlc.baseGame]) this.dlcHistory[dlc.baseGame] = [];
    this.dlcHistory[dlc.baseGame].push({
      name: dlc.dlcName,
      revenue: dlcRevenue,
      score: Math.round(dlcScore * 10) / 10,
    });

    const result = { baseGame: dlc.baseGame, dlcName: dlc.dlcName, revenue: dlcRevenue, score: dlcScore };
    state.activeDLC = null;
    return result;
  }

  getDLCsForGame(gameTitle) { return this.dlcHistory[gameTitle] || []; }
  serialize() { return { dlcHistory: this.dlcHistory }; }
  deserialize(data) { if (data) this.dlcHistory = data.dlcHistory || {}; }
}
const dlcSystem = new DLCSystem();
