/**
 * Tech Empire — Tax System
 * Corporate taxes calculated quarterly (every 12 weeks).
 * R&D, marketing, and salary deductions reduce taxable income.
 */

class TaxSystem {
  constructor() {
    this.taxHistory = [];
    this.quarterCounter = 0; // weeks since last tax calculation
    this.currentQuarterRevenue = 0;
    this.currentQuarterResearch = 0;
    this.currentQuarterMarketing = 0;
    this.currentQuarterSalaries = 0;
    this._nextId = 1;
  }

  /**
   * Tax rates by office level name.
   */
  static TAX_RATES = {
    'Garage':        0.00,
    'Small Office':  0.15,
    'Medium Office': 0.25,
    'Large Office':  0.30,
  };

  /**
   * Deduction rates.
   */
  static DEDUCTIONS = {
    research:  0.50, // 50% of R&D spending is deductible
    marketing: 0.25, // 25% of marketing spending
    salaries:  1.00, // 100% of salaries
  };

  /**
   * Get tax rate for current office level.
   */
  getTaxRate(officeName) {
    return TaxSystem.TAX_RATES[officeName] || 0;
  }

  /**
   * Track revenue earned this quarter.
   */
  addRevenue(amount) {
    if (amount > 0) {
      this.currentQuarterRevenue += amount;
    }
  }

  /**
   * Track research spending this quarter.
   */
  addResearchSpending(amount) {
    this.currentQuarterResearch += Math.abs(amount);
  }

  /**
   * Track marketing spending this quarter.
   */
  addMarketingSpending(amount) {
    this.currentQuarterMarketing += Math.abs(amount);
  }

  /**
   * Track salary spending this quarter.
   */
  addSalarySpending(amount) {
    this.currentQuarterSalaries += Math.abs(amount);
  }

  /**
   * Called each tick. Returns tax bill if a quarter has elapsed, else null.
   * @param {object} state — engine state
   * @returns {object|null} — { taxBill, details } or null
   */
  tick(state) {
    this.quarterCounter++;

    if (this.quarterCounter < 12) return null;

    // Quarter elapsed — calculate taxes
    this.quarterCounter = 0;

    const officeName = OFFICE_LEVELS[state.level].name;
    const taxRate = this.getTaxRate(officeName);

    // Garage pays no taxes
    if (taxRate === 0) {
      this._resetQuarter();
      return null;
    }

    // Calculate deductions
    const researchDeduction = this.currentQuarterResearch * TaxSystem.DEDUCTIONS.research;
    const marketingDeduction = this.currentQuarterMarketing * TaxSystem.DEDUCTIONS.marketing;
    const salaryDeduction = this.currentQuarterSalaries * TaxSystem.DEDUCTIONS.salaries;
    const totalDeductions = researchDeduction + marketingDeduction + salaryDeduction;

    // Net taxable income
    const grossRevenue = this.currentQuarterRevenue;
    const taxableIncome = Math.max(0, grossRevenue - totalDeductions);
    const taxBill = Math.round(taxableIncome * taxRate);

    // Record in history
    const record = {
      id: this._nextId++,
      quarter: this.taxHistory.length + 1,
      year: state.year,
      month: state.month,
      officeName,
      taxRate,
      grossRevenue: Math.round(grossRevenue),
      deductions: {
        research: Math.round(researchDeduction),
        marketing: Math.round(marketingDeduction),
        salaries: Math.round(salaryDeduction),
        total: Math.round(totalDeductions),
      },
      taxableIncome: Math.round(taxableIncome),
      taxBill,
    };

    this.taxHistory.push(record);
    // Keep last 20 quarters
    if (this.taxHistory.length > 20) {
      this.taxHistory = this.taxHistory.slice(-20);
    }

    this._resetQuarter();

    if (taxBill > 0) {
      return record;
    }
    return null;
  }

  _resetQuarter() {
    this.currentQuarterRevenue = 0;
    this.currentQuarterResearch = 0;
    this.currentQuarterMarketing = 0;
    this.currentQuarterSalaries = 0;
  }

  /**
   * Get total taxes paid across all history.
   */
  totalTaxesPaid() {
    return this.taxHistory.reduce((sum, r) => sum + r.taxBill, 0);
  }

  /**
   * Get the most recent tax record.
   */
  lastTaxRecord() {
    return this.taxHistory.length > 0 ? this.taxHistory[this.taxHistory.length - 1] : null;
  }

  reset() {
    this.taxHistory = [];
    this.quarterCounter = 0;
    this.currentQuarterRevenue = 0;
    this.currentQuarterResearch = 0;
    this.currentQuarterMarketing = 0;
    this.currentQuarterSalaries = 0;
    this._nextId = 1;
  }

  serialize() {
    return {
      taxHistory: this.taxHistory,
      quarterCounter: this.quarterCounter,
      currentQuarterRevenue: this.currentQuarterRevenue,
      currentQuarterResearch: this.currentQuarterResearch,
      currentQuarterMarketing: this.currentQuarterMarketing,
      currentQuarterSalaries: this.currentQuarterSalaries,
      _nextId: this._nextId,
    };
  }

  deserialize(data) {
    if (!data) return;
    this.taxHistory = data.taxHistory || [];
    this.quarterCounter = data.quarterCounter || 0;
    this.currentQuarterRevenue = data.currentQuarterRevenue || 0;
    this.currentQuarterResearch = data.currentQuarterResearch || 0;
    this.currentQuarterMarketing = data.currentQuarterMarketing || 0;
    this.currentQuarterSalaries = data.currentQuarterSalaries || 0;
    this._nextId = data._nextId || 1;
  }
}

// Global instance
const taxSystem = new TaxSystem();
