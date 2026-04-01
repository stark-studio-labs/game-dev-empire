/**
 * Tech Empire -- Hardware Lab (Custom Console Builder)
 * Design and manufacture custom gaming consoles.
 * Unlocks at Large Office (level 3).
 */

const HARDWARE_COMPONENTS = {
  cpu: [
    { tier: 1, name: 'Basic CPU',        cost: 5000,   techLevel: 1, label: 'Basic' },
    { tier: 2, name: 'Advanced CPU',      cost: 15000,  techLevel: 2, label: 'Advanced' },
    { tier: 3, name: 'Cutting Edge CPU',  cost: 40000,  techLevel: 3, label: 'Cutting Edge' },
    { tier: 4, name: 'Quantum CPU',       cost: 100000, techLevel: 4, label: 'Quantum' },
  ],
  gpu: [
    { tier: 1, name: 'Integrated GPU',   cost: 3000,   techLevel: 1, label: 'Integrated' },
    { tier: 2, name: 'Dedicated GPU',    cost: 12000,  techLevel: 2, label: 'Dedicated' },
    { tier: 3, name: 'High-End GPU',     cost: 35000,  techLevel: 3, label: 'High-End' },
    { tier: 4, name: 'RTX Ultra GPU',    cost: 90000,  techLevel: 4, label: 'RTX Ultra' },
  ],
  ram: [
    { tier: 1, name: '2GB RAM',          cost: 1000,   techLevel: 1, label: '2GB' },
    { tier: 2, name: '8GB RAM',          cost: 4000,   techLevel: 2, label: '8GB' },
    { tier: 3, name: '32GB RAM',         cost: 12000,  techLevel: 3, label: '32GB' },
    { tier: 4, name: '128GB RAM',        cost: 30000,  techLevel: 4, label: '128GB' },
  ],
  storage: [
    { tier: 1, name: 'HDD',             cost: 800,    techLevel: 1, label: 'HDD' },
    { tier: 2, name: 'SSD',             cost: 3000,   techLevel: 2, label: 'SSD' },
    { tier: 3, name: 'NVMe',            cost: 8000,   techLevel: 3, label: 'NVMe' },
    { tier: 4, name: 'Crystal Storage',  cost: 25000,  techLevel: 4, label: 'Crystal' },
  ],
  controller: [
    { tier: 1, name: 'Traditional Controller', cost: 2000,  techLevel: 1, label: 'Traditional' },
    { tier: 2, name: 'Motion Controller',      cost: 8000,  techLevel: 2, label: 'Motion' },
    { tier: 3, name: 'Neural Controller',      cost: 25000, techLevel: 3, label: 'Neural' },
  ],
};

class HardwareSystem {
  constructor() {
    this.consoles = [];         // [{ id, name, components, techLevel, mfgCost, retailPrice, weekLaunched, unitsSold, revenue, active }]
    this.totalConsolesBuilt = 0;
  }

  /**
   * Design a new console.
   * @param {string} name
   * @param {{ cpu: number, gpu: number, ram: number, storage: number, controller: number }} componentTiers
   * @param {number} retailPrice
   * @param {number} totalWeeks
   * @returns {{ success: boolean, console?: object, error?: string }}
   */
  designConsole(name, componentTiers, retailPrice, totalWeeks) {
    if (!name || name.trim().length === 0) {
      return { success: false, error: 'Console needs a name' };
    }

    // Validate all components
    const components = {};
    let totalCost = 0;
    let totalTechLevel = 0;
    let componentCount = 0;

    for (const [type, tier] of Object.entries(componentTiers)) {
      const options = HARDWARE_COMPONENTS[type];
      if (!options) return { success: false, error: `Unknown component type: ${type}` };
      const comp = options.find(c => c.tier === tier);
      if (!comp) return { success: false, error: `Invalid tier for ${type}` };
      components[type] = { ...comp };
      totalCost += comp.cost;
      totalTechLevel += comp.techLevel;
      componentCount++;
    }

    const techLevel = Math.round((totalTechLevel / componentCount) * 10) / 10;

    const console = {
      id: `console_${Date.now()}_${this.totalConsolesBuilt}`,
      name: name.trim(),
      components,
      techLevel,
      mfgCost: totalCost,
      retailPrice,
      weekLaunched: totalWeeks,
      unitsSold: 0,
      revenue: 0,
      active: true,
      weeklyHistory: [],
    };

    this.consoles.push(console);
    this.totalConsolesBuilt++;

    return { success: true, console };
  }

  /**
   * Weekly sales tick for all active consoles.
   * Market share driven by price/performance ratio.
   * @returns {number} total revenue this tick
   */
  tick(totalWeeks) {
    let totalRevenue = 0;

    for (const console of this.consoles) {
      if (!console.active) continue;

      // Consoles have a lifecycle — sales decline after ~2 years (104 weeks)
      const age = totalWeeks - console.weekLaunched;
      if (age > 208) {
        console.active = false;
        continue;
      }

      // Price/performance ratio (higher = better value for consumers)
      const pricePerformance = (console.techLevel * 25) / Math.max(1, console.retailPrice / 10000);

      // Sales curve: ramp up, peak, decline
      let salesMultiplier;
      if (age < 12) {
        // Launch phase — ramping up
        salesMultiplier = 0.3 + (age / 12) * 0.7;
      } else if (age < 52) {
        // Peak phase
        salesMultiplier = 1.0;
      } else if (age < 104) {
        // Mature phase
        salesMultiplier = 0.7 + (1 - (age - 52) / 52) * 0.3;
      } else {
        // Decline phase
        salesMultiplier = Math.max(0.05, 0.7 * (1 - (age - 104) / 104));
      }

      // Base weekly units: depends on tech level and pricing attractiveness
      const baseUnits = Math.round(pricePerformance * 50 * salesMultiplier);
      const units = Math.max(0, baseUnits + Math.floor(Math.random() * 10 - 5));

      // Profit per unit
      const profitPerUnit = Math.max(0, console.retailPrice - (console.mfgCost * 0.3));
      const weekRevenue = units * profitPerUnit;

      console.unitsSold += units;
      console.revenue += weekRevenue;
      totalRevenue += weekRevenue;

      console.weeklyHistory.push({ week: totalWeeks, units, revenue: weekRevenue });
      // Keep last 52 weeks of history
      if (console.weeklyHistory.length > 52) {
        console.weeklyHistory = console.weeklyHistory.slice(-52);
      }
    }

    return totalRevenue;
  }

  /** Get all consoles (active and retired) */
  getConsoles() {
    return this.consoles;
  }

  /** Get active consoles only */
  getActiveConsoles() {
    return this.consoles.filter(c => c.active);
  }

  /** Discontinue a console */
  discontinue(consoleId) {
    const console = this.consoles.find(c => c.id === consoleId);
    if (console) {
      console.active = false;
      return true;
    }
    return false;
  }

  /** Calculate manufacturing cost for a set of component tiers */
  calculateCost(componentTiers) {
    let total = 0;
    for (const [type, tier] of Object.entries(componentTiers)) {
      const options = HARDWARE_COMPONENTS[type];
      if (!options) continue;
      const comp = options.find(c => c.tier === tier);
      if (comp) total += comp.cost;
    }
    return total;
  }

  /** Calculate tech level for a set of component tiers */
  calculateTechLevel(componentTiers) {
    let totalTech = 0;
    let count = 0;
    for (const [type, tier] of Object.entries(componentTiers)) {
      const options = HARDWARE_COMPONENTS[type];
      if (!options) continue;
      const comp = options.find(c => c.tier === tier);
      if (comp) {
        totalTech += comp.techLevel;
        count++;
      }
    }
    return count > 0 ? Math.round((totalTech / count) * 10) / 10 : 0;
  }

  /** Total revenue from all consoles */
  totalRevenue() {
    return this.consoles.reduce((sum, c) => sum + c.revenue, 0);
  }

  /** Total units sold across all consoles */
  totalUnitsSold() {
    return this.consoles.reduce((sum, c) => sum + c.unitsSold, 0);
  }

  serialize() {
    return {
      consoles: this.consoles,
      totalConsolesBuilt: this.totalConsolesBuilt,
    };
  }

  deserialize(data) {
    if (!data) return;
    this.consoles = data.consoles || [];
    this.totalConsolesBuilt = data.totalConsolesBuilt || 0;
  }

  reset() {
    this.consoles = [];
    this.totalConsolesBuilt = 0;
  }
}

// Global instance
const hardwareSystem = new HardwareSystem();
