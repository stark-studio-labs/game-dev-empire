/**
 * Tech Empire — Vertical Expansion System
 * Unlocks at $10M total revenue + Medium Office.
 * Four verticals: Software SaaS, Streaming, Cloud, AI.
 */

// ── Definitions ──────────────────────────────────────────────

const SOFTWARE_PRODUCTS = [
  { id: 'productivity', name: 'Productivity App', b2cArpu: 8,  b2bArpu: 80,  churn: 0.04, launchCost: 20000  },
  { id: 'dev_tool',    name: 'Developer Tool',   b2cArpu: 15, b2bArpu: 150, churn: 0.02, launchCost: 50000  },
  { id: 'creative',   name: 'Creative Suite',    b2cArpu: 12, b2bArpu: 120, churn: 0.03, launchCost: 40000  },
  { id: 'mobile',     name: 'Mobile App',        b2cArpu: 3,  b2bArpu: 30,  churn: 0.06, launchCost: 15000  },
];

const CLOUD_REGIONS = [
  { id: 'us_west',  name: 'US West',  buildCost: 500000,  monthlyCost: 20000, baseRevenue: 80000,  capacity: 1000 },
  { id: 'eu_west',  name: 'EU West',  buildCost: 800000,  monthlyCost: 30000, baseRevenue: 120000, capacity: 1500 },
  { id: 'asia_pac', name: 'Asia Pac', buildCost: 1000000, monthlyCost: 40000, baseRevenue: 160000, capacity: 2000 },
];

const VERTICAL_DEFS = {
  software: {
    id: 'software',
    name: 'Software Co.',
    tagline: 'SaaS products with monthly recurring revenue',
    color: '#58a6ff',
    icon: 'S',
    unlockCost: 500000,
    minLevel: 2,       // Medium Office
  },
  streaming: {
    id: 'streaming',
    name: 'StreamVault',
    tagline: 'Streaming service — subscribers + content strategy',
    color: '#f85149',
    icon: '▶',
    unlockCost: 2000000,
    minLevel: 2,
  },
  cloud: {
    id: 'cloud',
    name: 'NimbusTech Cloud',
    tagline: 'Data centers, compute capacity, enterprise SLAs',
    color: '#3fb950',
    icon: '☁',
    unlockCost: 5000000,
    minLevel: 3,       // Large Office
  },
  ai: {
    id: 'ai',
    name: 'DeepStudio AI',
    tagline: 'Train AI models and monetize with API access',
    color: '#da7cff',
    icon: '✦',
    unlockCost: 10000000,
    minLevel: 3,
  },
};

// ── VerticalManager ───────────────────────────────────────────

class VerticalManager {
  constructor() {
    this.active = {}; // id -> state
    this._nextProductId = 1;
  }

  reset() {
    this.active = {};
    this._nextProductId = 1;
  }

  // ── Unlock ──────────────────────────────────────────────────

  isActive(id) { return !!this.active[id]; }

  /** Returns list of vertical IDs that can currently be unlocked */
  getUnlockable(gameState, totalRevenue) {
    return Object.keys(VERTICAL_DEFS).filter(id => {
      const def = VERTICAL_DEFS[id];
      return !this.active[id]
        && totalRevenue >= def.unlockCost
        && gameState.level >= def.minLevel;
    });
  }

  /**
   * Unlock a vertical. Deducts unlock cost from game state cash.
   * Returns false if insufficient funds or already unlocked.
   */
  unlock(id, gameState) {
    const def = VERTICAL_DEFS[id];
    if (!def || this.active[id]) return false;
    if (gameState.cash < def.unlockCost) return false;
    gameState.cash -= def.unlockCost;

    if (id === 'software') {
      this.active.software = {
        products: [],
        model: 'b2c', // 'b2c' | 'b2b'
        totalMRR: 0,
        totalSubscribers: 0,
      };
    } else if (id === 'streaming') {
      this.active.streaming = {
        tier: 'ad',           // 'ad' | 'premium' | 'both'
        subscribers: 0,
        contentPieces: 0,
        contentMonthly: 10000, // monthly content budget
      };
    } else if (id === 'cloud') {
      this.active.cloud = {
        regions: [],           // built region IDs
        enterpriseContracts: 0,
        uptime: 99.9,
        outageCooldown: 0,     // months until next possible outage
      };
    } else if (id === 'ai') {
      this.active.ai = {
        trainingBudget: 0,     // monthly GPU spend
        cumulativeInvestment: 0,
        modelQuality: 0,       // 0-100
        apiCallsMonthly: 0,
        isOpen: false,
        safety: 80,            // 0-100; low triggers events
      };
    }
    return true;
  }

  // ── Software Actions ─────────────────────────────────────────

  softwareSetModel(model) {
    if (!this.active.software) return false;
    this.active.software.model = model;
    return true;
  }

  /**
   * Launch a new software product.
   * type: one of SOFTWARE_PRODUCTS[].id
   * Returns false if can't afford or already have 4 products.
   */
  softwareLaunchProduct(type, gameState) {
    const sw = this.active.software;
    if (!sw) return false;
    const def = SOFTWARE_PRODUCTS.find(p => p.id === type);
    if (!def) return false;
    if (sw.products.length >= 4) return false;
    if (gameState.cash < def.launchCost) return false;

    gameState.cash -= def.launchCost;
    const arpu = sw.model === 'b2b' ? def.b2bArpu : def.b2cArpu;
    const initialSubs = sw.model === 'b2b' ? 10 : 100;

    sw.products.push({
      id: this._nextProductId++,
      type,
      name: def.name,
      arpu,
      subscribers: initialSubs,
      churn: def.churn,
      age: 0, // months old
    });
    return true;
  }

  // ── Streaming Actions ─────────────────────────────────────────

  streamingSetTier(tier) {
    if (!this.active.streaming) return false;
    this.active.streaming.tier = tier;
    return true;
  }

  streamingCommissionContent(amount, gameState) {
    const st = this.active.streaming;
    if (!st || gameState.cash < amount) return false;
    gameState.cash -= amount;
    // Each $100K of content adds 1 content piece
    const newPieces = Math.floor(amount / 100000);
    st.contentPieces += newPieces;
    return newPieces;
  }

  streamingSetContentBudget(amount) {
    if (!this.active.streaming) return false;
    this.active.streaming.contentMonthly = Math.max(0, amount);
    return true;
  }

  // ── Cloud Actions ─────────────────────────────────────────────

  cloudBuildDatacenter(regionId, gameState) {
    const cl = this.active.cloud;
    if (!cl) return false;
    const region = CLOUD_REGIONS.find(r => r.id === regionId);
    if (!region || cl.regions.includes(regionId)) return false;
    if (gameState.cash < region.buildCost) return false;
    gameState.cash -= region.buildCost;
    cl.regions.push(regionId);
    return true;
  }

  cloudAddEnterpriseContract(gameState) {
    const cl = this.active.cloud;
    if (!cl || cl.regions.length === 0) return false;
    if (cl.enterpriseContracts >= cl.regions.length * 3) return false; // cap
    if (gameState.cash < 10000) return false; // signing cost
    gameState.cash -= 10000;
    cl.enterpriseContracts++;
    return true;
  }

  // ── AI Actions ───────────────────────────────────────────────

  aiSetTrainingBudget(amount) {
    if (!this.active.ai) return false;
    this.active.ai.trainingBudget = Math.max(0, amount);
    return true;
  }

  aiToggleOpenSource() {
    if (!this.active.ai) return false;
    this.active.ai.isOpen = !this.active.ai.isOpen;
    return true;
  }

  // ── Monthly Tick ─────────────────────────────────────────────

  /**
   * Process all active verticals each month.
   * Returns { netRevenue, events[] }
   * events: [{ type, message, cash? }]
   */
  monthlyTick(gameState, synergies) {
    const results = { netRevenue: 0, events: [] };
    if (!Object.keys(this.active).length) return results;

    // Software
    if (this.active.software) {
      const r = this._softwareTick(gameState, synergies);
      results.netRevenue += r.net;
      results.events.push(...r.events);
    }

    // Streaming
    if (this.active.streaming) {
      const r = this._streamingTick(gameState, synergies);
      results.netRevenue += r.net;
      results.events.push(...r.events);
    }

    // Cloud
    if (this.active.cloud) {
      const r = this._cloudTick(gameState, synergies);
      results.netRevenue += r.net;
      results.events.push(...r.events);
    }

    // AI
    if (this.active.ai) {
      const r = this._aiTick(gameState, synergies);
      results.netRevenue += r.net;
      results.events.push(...r.events);
    }

    return results;
  }

  _softwareTick(gameState, synergies) {
    const sw = this.active.software;
    const events = [];
    let revenue = 0;

    for (const p of sw.products) {
      // Churn
      const lost = Math.ceil(p.subscribers * p.churn);
      // Growth: 8% organic + fan-driven acquisition
      const gained = Math.ceil(p.subscribers * 0.08) + Math.floor(gameState.fans / 50000);
      p.subscribers = Math.max(0, p.subscribers - lost + gained);
      p.age++;

      // AI synergy: products get 10% ARPU boost if AI active
      const arpuMult = synergies.aiActive ? 1.1 : 1.0;
      revenue += Math.round(p.subscribers * p.arpu * arpuMult);
    }

    // Update cached totals
    sw.totalSubscribers = sw.products.reduce((s, p) => s + p.subscribers, 0);
    sw.totalMRR = revenue;

    const baseCost = 5000 + sw.products.length * 2000;
    return { net: revenue - baseCost, events };
  }

  _streamingTick(gameState, synergies) {
    const st = this.active.streaming;
    const events = [];

    // Subscriber growth: content library drives sign-ups
    const potentialGrowth = st.contentPieces * 300 + Math.floor(gameState.fans / 10000);
    const gameSynergyBoost = synergies.gamesActive ? 1.15 : 1.0;
    const churnRate = st.tier === 'premium' ? 0.02 : 0.03;
    const lost = Math.ceil(st.subscribers * churnRate);
    const gained = Math.ceil(potentialGrowth * gameSynergyBoost);
    st.subscribers = Math.max(0, st.subscribers - lost + gained);

    // Add monthly content budget as new pieces (every $100K = 1 piece)
    const newPieces = Math.floor(st.contentMonthly / 100000);
    st.contentPieces += newPieces;

    // Revenue by tier
    const arpu = st.tier === 'premium' ? 10 : st.tier === 'both' ? 6 : 2;
    const revenue = Math.round(st.subscribers * arpu);
    const cost = st.contentMonthly + 20000;

    return { net: revenue - cost, events };
  }

  _cloudTick(gameState, synergies) {
    const cl = this.active.cloud;
    const events = [];
    let revenue = 0;
    let cost = 10000; // base infra cost

    for (const regionId of cl.regions) {
      const def = CLOUD_REGIONS.find(r => r.id === regionId);
      if (!def) continue;
      // AI synergy: better utilization with AI optimization
      const utilMult = synergies.aiActive ? 1.15 : 1.0;
      revenue += Math.round(def.baseRevenue * utilMult);
      cost += def.monthlyCost;
    }

    // Enterprise contracts
    revenue += cl.enterpriseContracts * 50000;

    // Random outage event (2% chance if no cooldown)
    if (cl.outageCooldown <= 0 && Math.random() < 0.02 && cl.regions.length > 0) {
      const penalty = cl.enterpriseContracts * 25000;
      revenue -= penalty;
      cl.outageCooldown = 3; // no outage for 3 months
      if (penalty > 0) {
        events.push({ type: 'cloud_outage', message: `Cloud outage! SLA penalties: -$${Math.round(penalty / 1000)}K` });
      }
    } else if (cl.outageCooldown > 0) {
      cl.outageCooldown--;
    }

    return { net: revenue - cost, events };
  }

  _aiTick(gameState, synergies) {
    const ai = this.active.ai;
    const events = [];

    // Compute actual training cost (cloud synergy = 20% discount)
    const computeDiscount = synergies.cloudActive ? 0.8 : 1.0;
    const effectiveTrainingCost = Math.round(ai.trainingBudget * computeDiscount);
    const baseCost = 30000 + effectiveTrainingCost;

    // Model quality grows with sustained training investment
    if (ai.trainingBudget > 0) {
      ai.cumulativeInvestment += ai.trainingBudget;
      // Quality = log scale, caps at 100
      const newQuality = Math.min(100, Math.log10(ai.cumulativeInvestment / 10000 + 1) * 40);
      ai.modelQuality = Math.round(Math.max(ai.modelQuality, newQuality));
    }

    // API calls grow with quality
    const targetCalls = Math.round(Math.pow(ai.modelQuality, 1.5) * 500);
    ai.apiCallsMonthly = Math.round(ai.apiCallsMonthly * 0.7 + targetCalls * 0.3); // smooth

    // Revenue: closed model charges per API call
    const revenue = ai.isOpen ? 0 : Math.round(ai.apiCallsMonthly * 0.001);

    // Safety drift
    if (ai.trainingBudget > 200000 && !ai.isOpen) {
      ai.safety = Math.max(20, ai.safety - 1); // aggressive training erodes safety
    } else {
      ai.safety = Math.min(100, ai.safety + 0.5);
    }

    // Safety event
    if (ai.safety < 40 && Math.random() < 0.15) {
      events.push({ type: 'ai_safety', message: 'AI safety concerns go viral — PR crisis!' });
      ai.safety += 10; // forced improvement
    }

    return { net: revenue - baseCost, events };
  }

  // ── Serialization ─────────────────────────────────────────────

  serialize() {
    return { active: JSON.parse(JSON.stringify(this.active)), _nextProductId: this._nextProductId };
  }

  deserialize(data) {
    if (!data) return;
    this.active = data.active || {};
    this._nextProductId = data._nextProductId || 1;
  }

  // ── Getters ───────────────────────────────────────────────────

  getActiveCount() { return Object.keys(this.active).length; }

  /** Monthly net from all verticals (for display) */
  getMonthlySummary() {
    const result = {};
    if (this.active.software) {
      result.software = { mrr: this.active.software.totalMRR || 0, subscribers: this.active.software.totalSubscribers || 0 };
    }
    if (this.active.streaming) {
      const arpu = this.active.streaming.tier === 'premium' ? 10 : this.active.streaming.tier === 'both' ? 6 : 2;
      result.streaming = { subscribers: this.active.streaming.subscribers, arpu };
    }
    if (this.active.cloud) {
      result.cloud = { regions: this.active.cloud.regions.length, contracts: this.active.cloud.enterpriseContracts };
    }
    if (this.active.ai) {
      result.ai = { quality: this.active.ai.modelQuality, apiCalls: this.active.ai.apiCallsMonthly, isOpen: this.active.ai.isOpen };
    }
    return result;
  }
}

// Global instance
const verticalManager = new VerticalManager();
