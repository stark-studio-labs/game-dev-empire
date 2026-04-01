/**
 * Tech Empire — Core Game Engine
 * Tick-based simulation: 1 tick = 1 game week.
 */

class GameEngine {
  constructor() {
    this.state = null;
    this.tickInterval = null;
    this.speed = 0; // 0=paused, 1=1x, 2=2x, 4=4x
    this.listeners = [];
    this.TICK_MS = 800; // base tick speed in ms (1x)
  }

  /** Date string helper for finance records */
  _dateStr() {
    const s = this.state;
    return `Y${s.year} M${s.month} W${s.week}`;
  }

  /** Create a new game state */
  newGame(companyName) {
    finance.reset();
    franchiseTracker.reset();
    moraleSystem.reset();
    eventSystem.reset();
    researchSystem.reset();
    marketSim.reset();
    energySystem.reset();
    marketingSystem.reset();
    trainingSystem.reset();
    hardwareSystem.reset();
    taxSystem.reset();
    notificationManager.reset();
    this.state = {
      companyName: companyName || 'Indie Studio',
      cash: 70000,
      fans: 0,
      level: 0, // index into OFFICE_LEVELS
      week: 1,
      month: 1,
      year: 1,
      totalWeeks: 0,

      // Staff
      staff: [
        this._createFounder(),
      ],

      // Game history
      games: [],
      currentGame: null,

      // Scoring history (GDT top-score tracking)
      topScore: 0,
      topScoreDelta: 0,

      // Genre usage tracking (for frequency penalty)
      genreUsage: {},

      // Notifications queue
      notifications: [],

      // Game phase (null if not developing)
      devPhase: null,       // 0, 1, 2 or null
      devProgress: 0,       // 0-100 within current phase
      devDesign: 0,
      devTech: 0,
      devSliders: null,     // 9 values set by the wizard

      // Sales tracking
      sellingGame: null,
      salesWeeksLeft: 0,
      salesRevenue: 0,
      salesTotalTarget: 0,

      // Available platforms cache
      availablePlatforms: [],

      // Office upgrade offered
      upgradeAvailable: false,

      // Pending event for UI
      pendingEvent: null,
      eventConsequence: null,

      // Publisher deal for current/last game
      activeDeal: null,

      // Morale (value cached in state for UI; system of record is moraleSystem)
      morale: moraleSystem.getMorale(),
    };

    this._updateAvailablePlatforms();
    this._emit();
    this._save();
  }

  /** Load from localStorage */
  load() {
    try {
      const saved = localStorage.getItem('techEmpire_save');
      if (saved) {
        this.state = JSON.parse(saved);
        finance.deserialize(this.state._finance || null);
        franchiseTracker.deserialize(this.state._franchise || null);
        moraleSystem.deserialize(this.state._morale || null);
        eventSystem.deserialize(this.state._events || null);
        researchSystem.deserialize(this.state._research || null);
        marketSim.deserialize(this.state._market || null);
        energySystem.deserialize(this.state._energy || null);
        marketingSystem.deserialize(this.state._marketing || null);
        trainingSystem.deserialize(this.state._training || null);
        hardwareSystem.deserialize(this.state._hardware || null);
        notificationManager.deserialize(this.state._notifications || null);
        taxSystem.deserialize(this.state._taxes || null);
        this._updateAvailablePlatforms();
        this._emit();
        return true;
      }
    } catch (e) {
      console.error('Failed to load save:', e);
    }
    return false;
  }

  /** Save to localStorage */
  _save() {
    try {
      this.state._finance = finance.serialize();
      this.state._franchise = franchiseTracker.serialize();
      this.state._morale = moraleSystem.serialize();
      this.state._events = eventSystem.serialize();
      this.state._research = researchSystem.serialize();
      this.state._market = marketSim.serialize();
      this.state._energy = energySystem.serialize();
      this.state._marketing = marketingSystem.serialize();
      this.state._training = trainingSystem.serialize();
      this.state._hardware = hardwareSystem.serialize();
      this.state._notifications = notificationManager.serialize();
      this.state._taxes = taxSystem.serialize();
      localStorage.setItem('techEmpire_save', JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save:', e);
    }
  }

  /** Subscribe to state changes */
  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  _emit() {
    this.listeners.forEach(fn => fn({ ...this.state }));
  }

  /** Set game speed */
  setSpeed(speed) {
    this.speed = speed;
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    if (speed > 0) {
      const ms = this.TICK_MS / speed;
      this.tickInterval = setInterval(() => this.tick(), ms);
    }
    this._emit();
  }

  /** Advance one game week */
  tick() {
    if (!this.state) return;
    const s = this.state;

    // Advance date
    s.week++;
    s.totalWeeks++;
    if (s.week > 4) {
      s.week = 1;
      s.month++;
      if (s.month > 12) {
        s.month = 1;
        s.year++;
      }
      // Monthly costs
      this._monthlyExpenses();
    }

    // Development tick
    if (s.currentGame && s.devPhase !== null) {
      this._devTick();
    }

    // Sales tick
    if (s.sellingGame && s.salesWeeksLeft > 0) {
      this._salesTick();
    }

    // Energy system tick
    const isDeveloping = !!(s.currentGame && s.devPhase !== null);
    const energyEvents = energySystem.weeklyTick(s.staff, isDeveloping, false);
    for (const ev of energyEvents) {
      if (ev.type === 'sick') {
        this._notify(`${ev.name} called in sick from exhaustion!`);
      } else if (ev.type === 'sick_return') {
        this._notify(`${ev.name} is back from sick leave.`);
      } else if (ev.type === 'vacation_return') {
        this._notify(`${ev.name} returned from vacation (fully rested)!`);
      }
    }

    // Marketing system tick
    const marketingEvents = marketingSystem.weeklyTick();
    for (const ev of marketingEvents) {
      if (ev.type === 'campaign_complete') {
        this._notify(`${ev.name} campaign complete! +${ev.hype} hype`);
      }
    }

    // Training tick
    const trainingCompleted = trainingSystem.tick(s);
    for (const tc of trainingCompleted) {
      const trainedStaff = s.staff.find(m => m.id === tc.staffId);
      this._notify(`${trainedStaff ? trainedStaff.name : 'Staff'} completed ${tc.courseName}!`);
    }

    // Hardware sales tick (only if player has consoles)
    if (s.level >= 3) {
      const hwRevenue = hardwareSystem.tick(s.totalWeeks);
      if (hwRevenue > 0) {
        s.cash += hwRevenue;
        finance.record('hardware_revenue', hwRevenue, 'Console Sales', this._dateStr());
      }
    }

    // Research tick
    const researchResult = researchSystem.tick(s);
    if (researchResult && researchResult.completed) {
      this._notify(`Research complete: ${researchResult.name}!`);
      notificationManager.onResearchComplete(researchResult.name, s);
    }

    // Market simulation tick
    marketSim.tick(s.totalWeeks);

    // Event system tick (only when no event is pending)
    if (!s.pendingEvent && !s.eventConsequence) {
      const event = eventSystem.checkEvents(s);
      if (event) {
        s.pendingEvent = event;
        this.setSpeed(0); // Pause for event
      }
    }

    // Tax system tick (quarterly)
    const taxResult = taxSystem.tick(s);
    if (taxResult) {
      s.cash -= taxResult.taxBill;
      finance.record('tax', -taxResult.taxBill, `Q${taxResult.quarter} Corporate Tax`, this._dateStr());
      this._notify(`Q${taxResult.quarter} taxes due: $${this._formatNum(taxResult.taxBill)} (${(taxResult.taxRate * 100).toFixed(0)}% rate)`);
      notificationManager.onExpenseDue(taxResult.taxBill, `Q${taxResult.quarter} Corporate Tax`, s);
    }

    // Notification center: periodic milestone check (every 4 weeks)
    if (s.totalWeeks % 4 === 0) {
      notificationManager.checkMilestones(s);
    }

    // Weekly cash snapshot
    finance.snapshotCash(s.totalWeeks, s.cash);

    // Check office upgrade
    this._checkUpgrade();

    // Update available platforms
    if (s.totalWeeks % 4 === 0) {
      this._updateAvailablePlatforms();
    }

    this._emit();

    // Auto-save every 12 weeks (3 months)
    if (s.totalWeeks % 12 === 0) {
      this._save();
    }
  }

  // ── Development ──────────────────────────────────────────────

  /**
   * Start developing a new game.
   * config: { title, topic, genre, audience, platformId, size, sliders }
   * sliders: array of 9 values (0-100) for each aspect
   */
  startGame(config) {
    const s = this.state;
    const sizeData = GAME_SIZES[config.size];

    // Pay platform license + dev cost
    const plat = PLATFORMS.find(p => p.id === config.platformId);
    const licenseFee = plat ? plat.licenseFee : 0;
    const cost = licenseFee + sizeData.cost;
    if (s.cash < cost) {
      this._notify('Not enough cash to start development!');
      return false;
    }
    s.cash -= cost;
    if (licenseFee > 0) {
      finance.record('license', -licenseFee, config.title, this._dateStr());
    }
    if (sizeData.cost > 0) {
      finance.record('dev_cost', -sizeData.cost, config.title, this._dateStr());
    }

    s.currentGame = {
      title: config.title,
      topic: config.topic,
      genre: config.genre,
      audience: config.audience,
      platformId: config.platformId,
      size: config.size,
      startWeek: s.totalWeeks,
    };

    s.devSliders = config.sliders;
    s.devPhase = 0;
    s.devProgress = 0;
    s.devDesign = 0;
    s.devTech = 0;

    this._notify(`Started developing "${config.title}"!`);
    this._emit();
    return true;
  }

  /** Process one development tick */
  _devTick() {
    const s = this.state;
    const phase = DEV_PHASES[s.devPhase];
    const sizeData = GAME_SIZES[s.currentGame.size];
    const weeksPerPhase = Math.ceil(sizeData.devWeeks / 3);

    // Each staff member generates points (modified by energy)
    s.staff.forEach(member => {
      // Skip staff in training -- they are unavailable
      if (trainingSystem.isTraining(member.id)) return;

      // Energy-based productivity multiplier
      const energyMult = energySystem.getProductivityMultiplier(member.id);
      if (energyMult <= 0) return; // On vacation or sick -- no contribution

      for (let ai = 0; ai < 3; ai++) {
        const aspectIdx = s.devPhase * 3 + ai;
        const aspectName = phase.aspects[ai];
        const ratio = ASPECT_RATIOS[aspectName];
        const sliderPct = (s.devSliders[aspectIdx] || 33) / 100;

        const speedFactor = 0.8 + member.speed * 0.004;
        const designPts = member.design * sliderPct * ratio.design * speedFactor * (ratio.basePoints / 40) * energyMult;
        const techPts = member.tech * sliderPct * ratio.tech * speedFactor * (ratio.basePoints / 40) * energyMult;

        s.devDesign += designPts;
        s.devTech += techPts;
      }
    });

    // Progress within phase
    s.devProgress += (100 / weeksPerPhase);

    // Phase complete?
    if (s.devProgress >= 100) {
      if (s.devPhase < 2) {
        s.devPhase++;
        s.devProgress = 0;
        this._notify(`Phase ${s.devPhase + 1} started for "${s.currentGame.title}"`);
      } else {
        // Development complete — release the game
        this._releaseGame();
      }
    }
  }

  /** Release a completed game */
  _releaseGame() {
    const s = this.state;
    const game = s.currentGame;
    const devWeeks = s.totalWeeks - game.startWeek;

    // Compute score
    const scoreResult = Scoring.computeGameScore({
      design: s.devDesign,
      tech: s.devTech,
      genre: game.genre,
      topic: game.topic,
      audience: game.audience,
      platformId: game.platformId,
      size: game.size,
      sliders: s.devSliders,
      devWeeks,
      staffCount: s.staff.length,
    });

    // Compute reviews (relative to personal best)
    const reviewResult = Scoring.computeReviewScores(
      scoreResult.gameScore,
      s.topScore,
      s.topScoreDelta,
      s.year
    );

    // Update top score if new personal best
    if (scoreResult.gameScore > s.topScore) {
      s.topScoreDelta = scoreResult.gameScore - s.topScore;
      s.topScore = scoreResult.gameScore;
    }

    // Compute revenue
    const revenueResult = Scoring.computeRevenue({
      reviewAvg: reviewResult.average,
      platformId: game.platformId,
      fans: s.fans,
      size: game.size,
      totalWeek: s.totalWeeks,
      genre: game.genre,
    });

    // Marketing hype bonus (applied to revenue before fans)
    const marketingResult = marketingSystem.onGameRelease();
    revenueResult.totalRevenue = Math.round(revenueResult.totalRevenue * marketingResult.salesMultiplier);
    if (marketingResult.totalHype > 0) {
      this._notify(`Marketing hype (${marketingResult.totalHype}) boosted sales by ${marketingResult.salesMultiplier.toFixed(2)}x!`);
    }

    // Fans gained (includes marketing fan bonus)
    const newFans = Scoring.fansGained(reviewResult.average, s.fans) + marketingResult.fanBonus;
    s.fans += newFans;

    // Track genre usage
    s.genreUsage[game.genre] = (s.genreUsage[game.genre] || 0) + 1;

    // Generate critic personality reviews (4 random critics)
    const selectedCritics = selectCritics(4);
    const criticReviews = generateCriticReviews(reviewResult.average, { ...game, size: game.size }, selectedCritics);
    // Override generic reviews with critic scores
    const criticScores = criticReviews.map(cr => cr.score);
    const criticAvg = Math.round((criticScores.reduce((a, b) => a + b, 0) / criticScores.length) * 10) / 10;

    // Build completed game record
    const completedGame = {
      ...game,
      devWeeks,
      designPoints: Math.round(s.devDesign),
      techPoints: Math.round(s.devTech),
      gameScore: Math.round(scoreResult.gameScore * 10) / 10,
      reviews: criticScores,
      reviewAvg: criticAvg,
      criticReviews,
      totalRevenue: revenueResult.totalRevenue,
      unitsSold: revenueResult.unitsSold,
      fansGained: newFans,
      releaseYear: s.year,
      releaseMonth: s.month,
    };

    s.games.push(completedGame);

    // Notification center: game release + review scores + milestone check
    notificationManager.onGameRelease(completedGame, s);
    notificationManager.onReviewScores(completedGame, s);
    notificationManager.checkMilestones(s);

    // Register with franchise tracker
    franchiseTracker.registerGame(
      completedGame.title, completedGame.topic, completedGame.genre,
      completedGame.reviewAvg, completedGame.totalRevenue, s.totalWeeks
    );

    // Morale impact from game release
    if (completedGame.reviewAvg >= 7) {
      moraleSystem.applyEvent('game_success', s.totalWeeks);
    } else if (completedGame.reviewAvg < 5) {
      moraleSystem.applyEvent('game_failure', s.totalWeeks);
    }
    s.morale = moraleSystem.getMorale();

    // Apply publisher deal if active
    if (s.activeDeal) {
      const dealResult = PublisherSystem.applyDeal(s.activeDeal, completedGame.totalRevenue);
      completedGame.publisherDeal = {
        publisherName: s.activeDeal.name,
        advance: dealResult.advance,
        publisherCut: dealResult.publisherCut,
        playerRevenue: dealResult.playerRevenue,
      };
      // Adjust sales target to player's share only
      completedGame.totalRevenue = dealResult.playerRevenue;
    }

    // Start sales period
    s.sellingGame = completedGame;
    s.salesWeeksLeft = 8 + Math.floor(Math.random() * 4);
    s.salesRevenue = 0;
    s.salesTotalTarget = revenueResult.totalRevenue;

    // Clear dev state
    s.currentGame = null;
    s.devPhase = null;
    s.devProgress = 0;
    s.devDesign = 0;
    s.devTech = 0;
    s.devSliders = null;

    // Pause for review
    this.setSpeed(0);

    // Train staff slightly from experience
    s.staff.forEach(member => {
      member.design += Math.random() * 3 + 1;
      member.tech += Math.random() * 3 + 1;
      member.speed += Math.random() * 0.5;
      member.gamesWorked++;
    });

    this._emit();
    this._save();
  }

  // ── Sales ────────────────────────────────────────────────────

  _salesTick() {
    const s = this.state;
    s.salesWeeksLeft--;

    // Revenue follows a curve: peak early, taper off
    const totalSalesWeeks = 8 + 4;
    const weekNum = totalSalesWeeks - s.salesWeeksLeft;
    const curve = Math.exp(-0.3 * (weekNum - 1)); // exponential decay
    const weekRevenue = Math.round(s.salesTotalTarget * curve * 0.25);

    s.salesRevenue += weekRevenue;
    s.cash += weekRevenue;
    if (weekRevenue > 0) {
      finance.record('revenue', weekRevenue, s.sellingGame.title, this._dateStr());
      taxSystem.addRevenue(weekRevenue);
    }

    if (s.salesWeeksLeft <= 0) {
      // Final sales — ensure we hit target
      const remaining = Math.max(0, s.salesTotalTarget - s.salesRevenue);
      s.cash += remaining;
      s.salesRevenue += remaining;
      if (remaining > 0) {
        finance.record('revenue', remaining, s.sellingGame.title, this._dateStr());
        taxSystem.addRevenue(remaining);
      }

      this._notify(`"${s.sellingGame.title}" finished selling: $${this._formatNum(s.salesRevenue)} total revenue!`);
      s.sellingGame = null;
      s.salesRevenue = 0;
      s.salesTotalTarget = 0;
      s.activeDeal = null;
    }
  }

  // ── Events ───────────────────────────────────────────────────

  resolveEvent(optionIndex) {
    const s = this.state;
    if (!s.pendingEvent) return;

    const consequence = eventSystem.resolveEvent(optionIndex, s);
    s.pendingEvent = null;
    if (consequence) {
      s.eventConsequence = consequence;
      this._notify(consequence.message);
    }
    this._emit();
    this._save();
  }

  dismissEventConsequence() {
    if (!this.state) return;
    this.state.eventConsequence = null;
    this._emit();
  }

  // ── Publisher Deals ──────────────────────────────────────────

  setPublisherDeal(deal) {
    const s = this.state;
    s.activeDeal = deal;
    if (deal && deal.advance > 0) {
      s.cash += deal.advance;
      finance.record('advance', deal.advance, `${deal.name} advance`, this._dateStr());
      this._notify(`Signed with ${deal.name}! Advance: $${this._formatNum(deal.advance)}`);
    }
    this._emit();
    this._save();
  }

  // ── Staff ────────────────────────────────────────────────────

  _createFounder() {
    return {
      id: 'founder',
      name: 'You',
      design: 30 + Math.floor(Math.random() * 20),
      tech: 30 + Math.floor(Math.random() * 20),
      speed: 40 + Math.floor(Math.random() * 15),
      research: 20 + Math.floor(Math.random() * 10),
      salary: 0,
      isFounder: true,
      gamesWorked: 0,
    };
  }

  generateApplicants(count = 3) {
    const applicants = [];
    const level = this.state.level;
    for (let i = 0; i < count; i++) {
      const firstName = STAFF_FIRST_NAMES[Math.floor(Math.random() * STAFF_FIRST_NAMES.length)];
      const lastName = STAFF_LAST_NAMES[Math.floor(Math.random() * STAFF_LAST_NAMES.length)];
      const baseStat = 15 + level * 12 + Math.floor(Math.random() * 25);
      applicants.push({
        id: `staff_${Date.now()}_${i}`,
        name: `${firstName} ${lastName}`,
        design: baseStat + Math.floor(Math.random() * 30 - 15),
        tech: baseStat + Math.floor(Math.random() * 30 - 15),
        speed: 30 + Math.floor(Math.random() * 30),
        research: 10 + Math.floor(Math.random() * 20),
        salary: Math.round((baseStat * 150 + 3000) / 100) * 100,
        isFounder: false,
        gamesWorked: 0,
      });
    }
    return applicants;
  }

  hireStaff(applicant) {
    const s = this.state;
    const office = OFFICE_LEVELS[s.level];
    if (s.staff.length >= office.maxStaff) {
      this._notify('Office is full! Upgrade to hire more staff.');
      return false;
    }
    s.staff.push({ ...applicant });
    moraleSystem.applyEvent('hire', s.totalWeeks);
    s.morale = moraleSystem.getMorale();
    this._notify(`Hired ${applicant.name}!`);
    notificationManager.onStaffHired(applicant.name, s);
    this._emit();
    this._save();
    return true;
  }

  fireStaff(staffId) {
    const s = this.state;
    const idx = s.staff.findIndex(m => m.id === staffId);
    if (idx < 0 || s.staff[idx].isFounder) return false;
    const name = s.staff[idx].name;
    s.staff.splice(idx, 1);
    energySystem.removeStaff(staffId);
    moraleSystem.applyEvent('fire', s.totalWeeks);
    s.morale = moraleSystem.getMorale();
    this._notify(`${name} has left the company.`);
    notificationManager.onStaffFired(name, s);
    this._emit();
    this._save();
    return true;
  }

  sendStaffOnVacation(staffId) {
    const s = this.state;
    const member = s.staff.find(m => m.id === staffId);
    if (!member) return false;

    if (energySystem.sendOnVacation(staffId)) {
      this._notify(`${member.name} is going on vacation!`);
      this._emit();
      this._save();
      return true;
    }
    return false;
  }

  // ── Office Upgrade ───────────────────────────────────────────

  _checkUpgrade() {
    const s = this.state;
    if (s.level >= OFFICE_LEVELS.length - 1) return;
    const next = OFFICE_LEVELS[s.level + 1];
    if (s.cash >= next.unlockCash && s.year >= next.unlockYear) {
      s.upgradeAvailable = true;
    }
  }

  upgradeOffice() {
    const s = this.state;
    if (s.level >= OFFICE_LEVELS.length - 1) return false;
    const next = OFFICE_LEVELS[s.level + 1];
    if (s.cash < next.unlockCash || s.year < next.unlockYear) return false;

    s.level++;
    s.upgradeAvailable = false;
    this._notify(`Upgraded to ${OFFICE_LEVELS[s.level].name}!`);
    notificationManager.onOfficeUpgrade(OFFICE_LEVELS[s.level].name, s);
    this._emit();
    this._save();
    return true;
  }

  // ── Utilities ────────────────────────────────────────────────

  _monthlyExpenses() {
    const s = this.state;
    const officeRent = [0, 5000, 12000, 25000][s.level] || 0;
    const salaries = s.staff.reduce((sum, m) => sum + (m.salary || 0), 0);
    const total = officeRent + salaries;
    s.cash -= total;
    if (officeRent > 0) {
      finance.record('office_rent', -officeRent, 'Office Rent', this._dateStr());
    }
    if (salaries > 0) {
      finance.record('salary', -salaries, 'Staff Salaries', this._dateStr());
      taxSystem.addSalarySpending(salaries);
    }

    // Morale monthly drift
    moraleSystem.monthlyTick(s.totalWeeks);
    s.morale = moraleSystem.getMorale();

    // Bankruptcy check
    if (s.cash < 0) {
      this._notify('WARNING: You are running out of money!');
    }
  }

  _updateAvailablePlatforms() {
    if (!this.state) return;
    this.state.availablePlatforms = PLATFORMS.filter(p =>
      isPlatformAvailable(p, this.state.totalWeeks)
    );
  }

  _notify(msg) {
    if (!this.state) return;
    this.state.notifications.push({
      id: Date.now(),
      message: msg,
      time: `Y${this.state.year} M${this.state.month} W${this.state.week}`,
    });
    // Keep last 20
    if (this.state.notifications.length > 20) {
      this.state.notifications = this.state.notifications.slice(-20);
    }
  }

  clearNotification(id) {
    if (!this.state) return;
    this.state.notifications = this.state.notifications.filter(n => n.id !== id);
    this._emit();
  }

  _formatNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return n.toString();
  }

  /** Get available game sizes for current office */
  getAvailableSizes() {
    if (!this.state) return [];
    return OFFICE_LEVELS[this.state.level].sizes;
  }

  /** Force save */
  save() {
    this._save();
  }

  /** Get the date string */
  getDateString() {
    if (!this.state) return '';
    return `Year ${this.state.year}, Month ${this.state.month}, Week ${this.state.week}`;
  }

  /** Cleanup on destroy */
  destroy() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    this.listeners = [];
  }
}

// Global engine instance
const engine = new GameEngine();
