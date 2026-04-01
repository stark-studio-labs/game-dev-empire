/**
 * Tech Empire — Finance Tracker
 * Records every transaction and cash snapshot for the Finance Dashboard.
 */

class FinanceTracker {
  constructor() {
    this.transactions = [];
    this.cashHistory = [];
    this._nextId = 1;
  }

  /**
   * Record a transaction.
   * @param {'revenue'|'salary'|'office_rent'|'license'|'dev_cost'} category
   * @param {number} amount  Positive = inflow, negative = outflow
   * @param {string} description
   * @param {string} dateStr  e.g. "Y1 M3 W2"
   */
  record(category, amount, description, dateStr) {
    this.transactions.push({
      id: this._nextId++,
      date: dateStr,
      category,
      amount,
      description,
    });
  }

  /** Save a weekly cash snapshot (called each tick). */
  snapshotCash(totalWeeks, cash) {
    this.cashHistory.push({ week: totalWeeks, cash });
    // Keep last 52 weeks (one game-year of history)
    if (this.cashHistory.length > 52) {
      this.cashHistory = this.cashHistory.slice(-52);
    }
  }

  /** Returns [{ title, total }] sorted by revenue descending. */
  revenueByGame() {
    const map = {};
    for (const t of this.transactions) {
      if (t.category === 'revenue') {
        map[t.description] = (map[t.description] || 0) + t.amount;
      }
    }
    return Object.entries(map)
      .map(([title, total]) => ({ title, total }))
      .sort((a, b) => b.total - a.total);
  }

  /** Returns totals per expense category (absolute values). */
  expensesByCategory() {
    const cats = { salary: 0, office_rent: 0, license: 0, dev_cost: 0, marketing: 0, tax: 0, research: 0, training: 0, perk: 0, loan_payment: 0 };
    for (const t of this.transactions) {
      if (cats.hasOwnProperty(t.category)) {
        cats[t.category] += Math.abs(t.amount);
      }
    }
    return cats;
  }

  /** Total revenue earned across all games. */
  totalRevenue() {
    return this.transactions
      .filter(t => t.category === 'revenue')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /** Total expenses (all non-revenue). */
  totalExpenses() {
    return this.transactions
      .filter(t => t.category !== 'revenue')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  reset() {
    this.transactions = [];
    this.cashHistory = [];
    this._nextId = 1;
  }

  serialize() {
    return {
      transactions: this.transactions,
      cashHistory: this.cashHistory,
      _nextId: this._nextId,
    };
  }

  deserialize(data) {
    if (!data) return;
    this.transactions = data.transactions || [];
    this.cashHistory = data.cashHistory || [];
    this._nextId = data._nextId || 1;
  }
}

// Global instance — available to engine.js and FinanceDashboard.js
const finance = new FinanceTracker();
