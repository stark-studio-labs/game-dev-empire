/**
 * Tech Empire — IPO & Board of Directors System (US-008)
 * Go public at $50M+ revenue & 5+ years. Manage quarterly guidance, board votes,
 * activist investors, and stock price.
 */

class IPOSystem {
  constructor() {
    this.isPublic = false;
    this.stockPrice = 0;
    this.stockPriceHistory = [];   // [{ week, price }]
    this.sharesOutstanding = 10000000; // 10M shares
    this.playerShares = 5100000;    // 51% founder stake
    this.quarterlyGuidance = null;  // { revenue: N, fans: N, quarter: N }
    this.lastQuarterRevenue = 0;
    this.missedGuidanceCount = 0;
    this.boardApprovalRating = 75;  // 0-100
    this.pendingBoardVote = null;
    this.activistInvestor = null;
    this.stockOptions = {};         // staffId -> shares
    this.ipoRevenue = 0;
  }

  /** Check if IPO is eligible */
  isEligible(state) {
    if (this.isPublic) return false;
    const totalRev = typeof finance !== 'undefined' ? finance.totalRevenue() : 0;
    return totalRev >= 50000000 && state.year >= 5;
  }

  /** Execute the IPO */
  goPublic(state) {
    if (!this.isEligible(state)) return false;

    const totalRev = typeof finance !== 'undefined' ? finance.totalRevenue() : 0;
    // IPO price based on revenue multiple (typically 8-15x annual revenue)
    const annualRevEst = totalRev / Math.max(1, state.year);
    this.stockPrice = Math.round(annualRevEst * 10 / this.sharesOutstanding * 100) / 100;
    this.stockPrice = Math.max(5, Math.min(200, this.stockPrice));

    // IPO raises 20% float at current price
    const floatShares = this.sharesOutstanding * 0.2;
    this.ipoRevenue = Math.round(floatShares * this.stockPrice);
    state.cash += this.ipoRevenue;

    this.isPublic = true;
    this.lastQuarterRevenue = totalRev;
    this._setNextGuidance(state);
    this.stockPriceHistory.push({ week: state.totalWeeks, price: this.stockPrice });

    return { ipoRevenue: this.ipoRevenue, stockPrice: this.stockPrice };
  }

  /** Weekly tick — update stock price, check quarterly board meeting */
  tick(state) {
    if (!this.isPublic) return null;

    // Update stock price every 4 weeks based on company performance
    if (state.totalWeeks % 4 === 0) {
      this._updateStockPrice(state);
    }

    // Quarterly board meeting (every 12 weeks)
    if (state.totalWeeks % 12 === 0 && this.isPublic) {
      return this._quarterlyReview(state);
    }

    // Random activist investor event (rare)
    if (Math.random() < 0.002 && !this.activistInvestor && this.boardApprovalRating < 50) {
      this.activistInvestor = this._generateActivistThreat(state);
      return { type: 'activist_investor', data: this.activistInvestor };
    }

    return null;
  }

  _updateStockPrice(state) {
    // Factors: fan growth, revenue, market sentiment, morale
    let priceMult = 1.0;

    // Fan growth positive signal
    const recentFanGrowth = state.fans / Math.max(1, state.totalWeeks / 4);
    if (recentFanGrowth > 1000) priceMult += 0.02;

    // Recent games quality
    if (state.games.length > 0) {
      const lastGame = state.games[state.games.length - 1];
      if (lastGame && lastGame.reviewAvg >= 8.5) priceMult += 0.03;
      else if (lastGame && lastGame.reviewAvg < 6.0) priceMult -= 0.04;
    }

    // Cash position
    if (state.cash < 0) priceMult -= 0.05;
    else if (state.cash > 5000000) priceMult += 0.02;

    // Market sentiment
    if (typeof marketSim !== 'undefined') {
      priceMult += (marketSim.sentiment - 1.0) * 0.05;
    }

    // Board approval
    priceMult += (this.boardApprovalRating - 50) * 0.001;

    // Apply with dampening (stocks move slowly)
    this.stockPrice = Math.max(0.01, Math.round(this.stockPrice * priceMult * 100) / 100);
    this.stockPriceHistory.push({ week: state.totalWeeks, price: this.stockPrice });

    // Keep last 52 weeks
    if (this.stockPriceHistory.length > 52) {
      this.stockPriceHistory = this.stockPriceHistory.slice(-52);
    }
  }

  _quarterlyReview(state) {
    if (!this.quarterlyGuidance) {
      this._setNextGuidance(state);
      return null;
    }

    const currentRev = typeof finance !== 'undefined' ? finance.totalRevenue() : 0;
    const revGrowth = currentRev - this.lastQuarterRevenue;
    const metRevGuidance = revGrowth >= this.quarterlyGuidance.revenue;
    const metFanGuidance = state.fans >= this.quarterlyGuidance.fans;
    const metGuidance = metRevGuidance && metFanGuidance;

    if (!metGuidance) {
      this.missedGuidanceCount++;
      const dropPct = 0.10 + Math.min(0.20, this.missedGuidanceCount * 0.05);
      this.stockPrice = Math.max(0.01, Math.round(this.stockPrice * (1 - dropPct) * 100) / 100);
      this.boardApprovalRating = Math.max(0, this.boardApprovalRating - 15);
    } else {
      this.missedGuidanceCount = 0;
      const gainPct = 0.05 + Math.random() * 0.08;
      this.stockPrice = Math.round(this.stockPrice * (1 + gainPct) * 100) / 100;
      this.boardApprovalRating = Math.min(100, this.boardApprovalRating + 8);
    }

    this.lastQuarterRevenue = currentRev;
    const result = {
      type: 'board_meeting',
      quarter: this.quarterlyGuidance.quarter,
      metGuidance,
      metRevGuidance,
      metFanGuidance,
      guidanceRev: this.quarterlyGuidance.revenue,
      guidanceFans: this.quarterlyGuidance.fans,
      actualRev: revGrowth,
      actualFans: state.fans,
      stockPrice: this.stockPrice,
      stockDelta: metGuidance ? '+' : '-',
      boardApproval: this.boardApprovalRating,
    };

    this._setNextGuidance(state);
    return result;
  }

  _setNextGuidance(state) {
    const currentRev = typeof finance !== 'undefined' ? finance.totalRevenue() : 0;
    const quarterNum = Math.floor(state.totalWeeks / 12) + 1;
    // Guidance is realistic but challenging (8-15% revenue growth, fan growth)
    this.quarterlyGuidance = {
      quarter: quarterNum,
      revenue: Math.round(currentRev * 0.10),  // 10% revenue growth expected
      fans: Math.round(state.fans * 1.08),      // 8% fan growth expected
    };
  }

  _generateActivistThreat(state) {
    return {
      name: 'Corvus Capital Partners',
      stake: '8.3%',
      demands: [
        'Sell or merge with a larger studio',
        'Cut costs by 20% and return cash to shareholders',
        'Replace the CEO (that\'s you)',
      ],
    };
  }

  resolveActivist(action, state) {
    if (!this.activistInvestor) return;
    if (action === 'buyout') {
      // Buy them out at premium
      state.cash -= Math.round(this.stockPrice * this.sharesOutstanding * 0.083 * 1.2);
      this.boardApprovalRating = Math.min(100, this.boardApprovalRating + 20);
    } else if (action === 'negotiate') {
      // Promise operational improvements
      this.boardApprovalRating = Math.min(100, this.boardApprovalRating + 10);
    } else {
      // Fight them publicly — PR battle
      this.stockPrice = Math.max(0.01, this.stockPrice * 0.92);
      this.boardApprovalRating = Math.max(0, this.boardApprovalRating - 5);
    }
    this.activistInvestor = null;
  }

  /** Grant stock options to a staff member */
  grantStockOptions(staffId, shares) {
    this.stockOptions[staffId] = (this.stockOptions[staffId] || 0) + shares;
  }

  getMarketCap() {
    return Math.round(this.stockPrice * this.sharesOutstanding);
  }

  getPlayerEquityValue() {
    return Math.round(this.stockPrice * this.playerShares);
  }

  /** Alias used by IPOPanel */
  getPlayerValue() {
    return this.getPlayerEquityValue();
  }

  serialize() {
    return {
      isPublic: this.isPublic,
      stockPrice: this.stockPrice,
      stockPriceHistory: this.stockPriceHistory.slice(-52),
      sharesOutstanding: this.sharesOutstanding,
      playerShares: this.playerShares,
      quarterlyGuidance: this.quarterlyGuidance,
      lastQuarterRevenue: this.lastQuarterRevenue,
      missedGuidanceCount: this.missedGuidanceCount,
      boardApprovalRating: this.boardApprovalRating,
      ipoRevenue: this.ipoRevenue,
      stockOptions: { ...this.stockOptions },
    };
  }

  deserialize(data) {
    if (!data) return;
    this.isPublic = data.isPublic || false;
    this.stockPrice = data.stockPrice || 0;
    this.stockPriceHistory = data.stockPriceHistory || [];
    this.sharesOutstanding = data.sharesOutstanding || 10000000;
    this.playerShares = data.playerShares || 5100000;
    this.quarterlyGuidance = data.quarterlyGuidance || null;
    this.lastQuarterRevenue = data.lastQuarterRevenue || 0;
    this.missedGuidanceCount = data.missedGuidanceCount || 0;
    this.boardApprovalRating = data.boardApprovalRating || 75;
    this.ipoRevenue = data.ipoRevenue || 0;
    this.stockOptions = data.stockOptions || {};
  }

  reset() {
    this.isPublic = false;
    this.stockPrice = 0;
    this.stockPriceHistory = [];
    this.sharesOutstanding = 10000000;
    this.playerShares = 5100000;
    this.quarterlyGuidance = null;
    this.lastQuarterRevenue = 0;
    this.missedGuidanceCount = 0;
    this.boardApprovalRating = 75;
    this.activistInvestor = null;
    this.stockOptions = {};
    this.ipoRevenue = 0;
  }
}

const ipoSystem = new IPOSystem();
