/**
 * Tech Empire — Contract Work System
 * Accept publisher contracts for guaranteed cash + RP.
 */
class ContractSystem {
  constructor() {
    this.available = [];
    this.activeContract = null;
    this.lastRefresh = -999;
  }

  reset() { this.available = []; this.activeContract = null; this.lastRefresh = -999; }

  refreshContracts(state) {
    if (state.totalWeeks - this.lastRefresh < 4) return; // refresh every 4 weeks
    this.lastRefresh = state.totalWeeks;
    this.available = [];
    const count = 3 + Math.floor(Math.random() * 3); // 3-5 contracts
    for (let i = 0; i < count; i++) {
      this.available.push(this._generate(state));
    }
  }

  _generate(state) {
    const publishers = ['MegaPublish', 'IndieForge', 'GameVault', 'PixelPress', 'StarReach'];
    const avTopics = (typeof TOPICS !== 'undefined') ? TOPICS.filter(t => t.tier <= Math.min(state.level + 2, 4)) : [];
    const topic = avTopics.length > 0 ? avTopics[Math.floor(Math.random() * avTopics.length)].name : 'Fantasy';
    const genre = (typeof GENRES !== 'undefined') ? GENRES[Math.floor(Math.random() * GENRES.length)] : 'Action';
    const platforms = state.availablePlatforms || [];
    const platform = platforms.length > 0 ? platforms[Math.floor(Math.random() * platforms.length)] : { id: 'pc', name: 'PC' };
    const payment = 15000 + (state.level || 0) * 10000 + Math.floor(Math.random() * 15000);
    const rpReward = 5 + Math.floor(Math.random() * 8);
    const deadline = 10 + Math.floor(Math.random() * 10); // 10-20 weeks

    return {
      id: Date.now() + Math.random(),
      publisher: publishers[Math.floor(Math.random() * publishers.length)],
      topic, genre,
      platformId: platform.id, platformName: platform.name,
      payment, rpReward, deadline,
      minScore: 4,
    };
  }

  acceptContract(contractId) {
    if (this.activeContract) return false;
    const contract = this.available.find(c => c.id === contractId);
    if (!contract) return false;
    this.activeContract = { ...contract, acceptedWeek: 0 }; // caller sets acceptedWeek
    this.available = this.available.filter(c => c.id !== contractId);
    return true;
  }

  completeContract(game, state) {
    if (!this.activeContract) return null;
    const c = this.activeContract;
    const matches = game.topic === c.topic && game.genre === c.genre;
    const goodScore = game.reviewAvg >= c.minScore;

    let result;
    if (matches && goodScore) {
      state.cash += c.payment;
      state.researchPoints = (state.researchPoints || 0) + c.rpReward;
      result = { success: true, payment: c.payment, rpReward: c.rpReward };
    } else {
      result = { success: false, reason: !matches ? 'Wrong topic/genre' : 'Score too low' };
    }
    this.activeContract = null;
    return result;
  }

  getActiveContract() { return this.activeContract; }
  getAvailable() { return this.available; }

  serialize() { return { available: this.available, activeContract: this.activeContract, lastRefresh: this.lastRefresh }; }
  deserialize(data) { if (data) { this.available = data.available || []; this.activeContract = data.activeContract || null; this.lastRefresh = data.lastRefresh || -999; } }
}

const contractSystem = new ContractSystem();
