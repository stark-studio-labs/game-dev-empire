/**
 * Tech Empire — Core Game Engine
 * Tick-based simulation: 1 tick = 1 game week.
 */

class GameEngine {
  constructor() {
    this.state = null;
    this.tickInterval = null;
    this.speed = 0; // 0=paused, 1=1x, 2=2x, 4=4x, 8=8x
    this.listeners = [];
    this.TICK_MS = 5000; // base tick speed in ms (1x) — 1 year ≈ 4 min for deliberate pacing
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
    verticalManager.reset();
    storyteller.reset();
    personalitySystem.reset();
    techTimeline.reset();
    ipoSystem.reset();
    conferenceSystem.reset();
    victorySystem.reset();
    competitorSystem.reset();
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
      waitingForPhaseInput: false, // true when paused between phases waiting for slider input
      nextPhaseIndex: null,  // which phase (1 or 2) we're waiting to configure

      // Sales tracking
      sellingGame: null,
      salesWeeksLeft: 0,
      salesTotalWeeks: 0,
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

      // Loan system
      loan: null, // { principal, rate, quarterlyPayment, remaining }

      // Bankruptcy tracking
      negativeWeeks: 0, // consecutive weeks with cash < -100K

      // Conference system
      pendingConference: null,
      conferenceResult: null,

      // IPO / public company
      isPublic: false,
      stockPrice: 0,
      boardMeetingResult: null,
      activistThreat: null,

      // Win/lose state
      gameOver: false,
      gameOverReason: null,  // 'victory' | 'bankruptcy'
      victoryPath: null,     // which of the 5 victory paths was achieved

      // Victory tracking counters
      gamesHighScore: 0,     // games with reviewAvg >= 8.5
      moonshots: 0,          // AAA games with reviewAvg >= 9.5
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
        verticalManager.deserialize(this.state._verticals || null);
        storyteller.deserialize(this.state._storyteller || null);
        personalitySystem.deserialize(this.state._personalities || null);
        techTimeline.deserialize(this.state._timeline || null);
        ipoSystem.deserialize(this.state._ipo || null);
        conferenceSystem.deserialize(this.state._conferences || null);
        victorySystem.deserialize(this.state._victory || null);
        competitorSystem.deserialize(this.state._competitors || null);
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
      this.state._verticals = verticalManager.serialize();
      this.state._storyteller = storyteller.serialize();
      this.state._personalities = personalitySystem.serialize();
      this.state._timeline = techTimeline.serialize();
      this.state._ipo = ipoSystem.serialize();
      this.state._conferences = conferenceSystem.serialize();
      this.state._victory = victorySystem.serialize();
      this.state._competitors = competitorSystem.serialize();
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
    if (this.state.gameOver) return; // Stop ticking on win/lose
    if (this.state.waitingForPhaseInput) return; // Paused waiting for phase slider input
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
      // Vertical revenue tick
      this._verticalTick();
      // Competitor studios release games
      this._competitorTick();
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

    // Storyteller: update drama score each week
    storyteller.update(s);

    // Tech history timeline: fire year-based events
    const timelineEvents = techTimeline.checkYear(s);
    for (const tevt of timelineEvents) {
      const summary = techTimeline.applyEffect(tevt, s);
      const notifMsg = summary ? `${tevt.title}: ${summary}` : tevt.title;
      this._notify(`📰 ${notifMsg}`);
      notificationManager.add('info', tevt.title, tevt.desc, s);
    }

    // Conference system: check for annual conference this week
    if (!s.pendingEvent && !s.eventConsequence && !s.pendingConference) {
      const conf = conferenceSystem.checkWeek(s);
      if (conf) {
        s.pendingConference = conf;
        this.setSpeed(0);
      }
    }

    // IPO system tick
    if (ipoSystem.isPublic) {
      const ipoResult = ipoSystem.tick(s);
      if (ipoResult && ipoResult.type === 'board_meeting') {
        s.boardMeetingResult = ipoResult;
        if (!ipoResult.metGuidance) {
          this._notify(`⚠️ Q${ipoResult.quarter} guidance missed! Stock dropped.`);
        } else {
          this._notify(`✅ Q${ipoResult.quarter} guidance beat! Stock up.`);
        }
      } else if (ipoResult && ipoResult.type === 'activist_investor') {
        s.activistThreat = ipoResult.data;
        this._notify('🚨 Activist investor has taken a stake in your company!');
        this.setSpeed(0);
      }
      // Surface stock price in state for UI
      s.stockPrice = ipoSystem.stockPrice;
      s.isPublic = true;
    }

    // Personality tick: ambition events
    const personalityEvents = personalitySystem.tick(s);
    for (const pe of personalityEvents) {
      if (pe.type === 'promotion_demand') {
        this._notify(`${pe.staffName} is demanding a promotion or threatening to leave!`);
      }
    }

    // Event system tick — storyteller selects the appropriate event (only when no event pending)
    if (!s.pendingEvent && !s.eventConsequence && !s.pendingConference) {
      const event = eventSystem.checkEvents(s);
      if (event) {
        s.pendingEvent = event;
        this.setSpeed(0); // Pause for event
      } else if (s.week === 1) {
        // Storyteller: monthly evaluateAndPick for drama-driven events
        const storyEvent = storyteller.evaluateAndPick(s);
        if (storyEvent) {
          s.pendingEvent = storyEvent;
          this.setSpeed(0);
        }
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

    // Loan quarterly payment (every 12 weeks, aligned with tax)
    if (s.loan && s.totalWeeks % 12 === 0) {
      const payment = s.loan.quarterlyPayment;
      s.cash -= payment;
      s.loan.remaining -= (payment - s.loan.remaining * (s.loan.rate / 4));
      finance.record('loan_payment', -payment, 'Loan Payment', this._dateStr());
      if (s.loan.remaining <= 0) {
        this._notify('Loan fully repaid!');
        s.loan = null;
      }
    }

    // Bankruptcy check: cash < -$100K for 12+ consecutive weeks
    if (s.cash < -100000) {
      s.negativeWeeks++;
      if (s.negativeWeeks >= settingsSystem.getBankruptcyWeeks() && !s.gameOver) {
        s.gameOver = true;
        s.gameOverReason = 'bankruptcy';
        this.setSpeed(0);
        this._notify('BANKRUPTCY! Your studio has gone under.');
      }
    } else {
      s.negativeWeeks = 0;
    }

    // Moonshot project tick (weekly)
    const moonshotResult = victorySystem.tick(s);
    if (moonshotResult && moonshotResult.completed) {
      this._notify(`MOONSHOT COMPLETE: ${moonshotResult.name}!`);
      notificationManager.add('info', 'Moonshot Complete', `${moonshotResult.name} — a breakthrough that will reshape the industry.`, s);
    }

    // Victory conditions: 5 Civ-style paths (checked monthly on week 1)
    if (!s.gameOver && s.week === 1) {
      const winningPath = victorySystem.checkVictory(s);
      if (winningPath) {
        this._triggerVictory(winningPath.name, `${winningPath.icon} ${winningPath.name.toUpperCase()}! ${winningPath.description}`);
      }
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

    // Auto-save per settings frequency
    if (s.totalWeeks % settingsSystem.autosaveFreq === 0) {
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

    // Support both platformIds (array) and legacy platformId (string)
    const platformIds = config.platformIds || (config.platformId ? [config.platformId] : []);
    const numPlatforms = Math.max(1, platformIds.length);

    // License fee is paid per platform
    let licenseFee = 0;
    for (const pid of platformIds) {
      const plat = PLATFORMS.find(p => p.id === pid);
      if (plat) licenseFee += plat.licenseFee;
    }

    // Remaster cost override: 30% of base dev cost
    const devCost = config.isRemaster ? Math.round(sizeData.cost * 0.3) : sizeData.cost;
    const cost = licenseFee + devCost;
    if (s.cash < cost) {
      this._notify('Not enough cash to start development!');
      return false;
    }
    s.cash -= cost;
    if (licenseFee > 0) {
      finance.record('license', -licenseFee, config.title, this._dateStr());
    }
    if (devCost > 0) {
      finance.record('dev_cost', -devCost, config.title, this._dateStr());
    }

    // Dev time multiplier: each extra platform adds 50%; remasters take 50% of normal time
    const basePlatformMult = 1 + 0.5 * (numPlatforms - 1);
    const platformMultiplier = config.isRemaster ? basePlatformMult * 0.5 : basePlatformMult;

    s.currentGame = {
      title: config.title,
      topic: config.topic,
      genre: config.genre,
      audience: config.audience,
      platformId: platformIds[0] || config.platformId,
      platformIds,
      platformMultiplier,
      size: config.size,
      startWeek: s.totalWeeks,
      isRemaster: config.isRemaster || false,
      remasterBonus: config.remasterBonus || 0,
    };

    // Phase 1 sliders from wizard; phases 2 & 3 default to 33/33/33 until player sets them
    const phase1 = config.sliders || [33, 33, 33];
    s.devSliders = [
      phase1[0] || 33, phase1[1] || 33, phase1[2] || 33,
      33, 33, 33,  // Phase 2 defaults (set by PhaseSliderModal)
      33, 33, 33,  // Phase 3 defaults (set by PhaseSliderModal)
    ];
    s.devPhase = 0;
    s.devProgress = 0;
    s.devDesign = 0;
    s.devTech = 0;
    s.waitingForPhaseInput = false;
    s.nextPhaseIndex = null;

    this._notify(`Started developing "${config.title}"!`);
    this._emit();
    return true;
  }

  /** Process one development tick */
  _devTick() {
    const s = this.state;
    const phase = DEV_PHASES[s.devPhase];
    const sizeData = GAME_SIZES[s.currentGame.size];
    const platformMult = s.currentGame.platformMultiplier || 1;
    const weeksPerPhase = Math.ceil((sizeData.devWeeks / 3) * platformMult);

    // Team lead bonus: +10% productivity for all staff if any team lead is working
    const hasTeamLead = s.staff.some(m => m.isTeamLead && !trainingSystem.isTraining(m.id));
    const teamLeadBonus = hasTeamLead ? 1.1 : 1.0;

    // Each staff member generates points (modified by energy)
    s.staff.forEach(member => {
      // Skip staff in training -- they are unavailable
      if (trainingSystem.isTraining(member.id)) return;

      // Energy-based productivity multiplier
      const energyMult = energySystem.getProductivityMultiplier(member.id);
      if (energyMult <= 0) return; // On vacation or sick -- no contribution

      // Genre specialty: +20% quality if staff has 25+ specialty points in current genre
      const genreSpec = (member.genreSpecialties && s.currentGame.genre)
        ? (member.genreSpecialties[s.currentGame.genre] || 0) : 0;
      const specialtyMult = genreSpec >= 25 ? 1.2 : 1.0;

      for (let ai = 0; ai < 3; ai++) {
        const aspectIdx = s.devPhase * 3 + ai;
        const aspectName = phase.aspects[ai];
        const ratio = ASPECT_RATIOS[aspectName];
        const sliderPct = (s.devSliders[aspectIdx] || 33) / 100;

        const speedFactor = 0.8 + member.speed * 0.004;
        const designPts = member.design * sliderPct * ratio.design * speedFactor * (ratio.basePoints / 40) * energyMult * teamLeadBonus * specialtyMult;
        const techPts = member.tech * sliderPct * ratio.tech * speedFactor * (ratio.basePoints / 40) * energyMult * teamLeadBonus * specialtyMult;

        s.devDesign += designPts;
        s.devTech += techPts;
      }
    });

    // Progress within phase
    s.devProgress += (100 / weeksPerPhase);

    // Phase complete?
    if (s.devProgress >= 100) {
      if (s.devPhase < 2) {
        // Pause and wait for player to set next phase sliders (GDT-style)
        s.devProgress = 100; // clamp
        s.waitingForPhaseInput = true;
        s.nextPhaseIndex = s.devPhase + 1;
        this.setSpeed(0); // Pause the game
        this._notify(`Phase ${s.devPhase + 1} complete! Set focus for Phase ${s.devPhase + 2}.`);
      } else {
        // Development complete — release the game
        this._releaseGame();
      }
    }
  }

  /** Accept sliders for the next phase and resume development */
  submitPhaseSliders(phaseSliders) {
    const s = this.state;
    if (!s.waitingForPhaseInput || s.nextPhaseIndex === null) return;

    const phaseIdx = s.nextPhaseIndex;
    // Write the 3 slider values into the correct positions in devSliders
    for (let i = 0; i < 3; i++) {
      s.devSliders[phaseIdx * 3 + i] = phaseSliders[i];
    }

    // Advance to the next phase
    s.devPhase = phaseIdx;
    s.devProgress = 0;
    s.waitingForPhaseInput = false;
    s.nextPhaseIndex = null;

    this._notify(`Phase ${phaseIdx + 1} started for "${s.currentGame.title}"`);
    this._emit();
    this.setSpeed(1); // Resume
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
      title: game.title,
      totalWeeks: s.totalWeeks,
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

    // Compute revenue across all platforms (multi-platform support)
    const platformList = (game.platformIds && game.platformIds.length > 0) ? game.platformIds : [game.platformId];
    let totalRevRaw = 0;
    let totalUnitsRaw = 0;
    for (const pid of platformList) {
      const pr = Scoring.computeRevenue({
        reviewAvg: reviewResult.average,
        platformId: pid,
        fans: s.fans,
        size: game.size,
        totalWeek: s.totalWeeks,
        genre: game.genre,
      });
      totalRevRaw += pr.totalRevenue;
      totalUnitsRaw += pr.unitsSold;
    }

    // Apply difficulty revenue multiplier
    totalRevRaw = Math.round(totalRevRaw * settingsSystem.getRevenueMultiplier());

    // Apply competitor genre saturation penalty
    const saturationMult = competitorSystem.getGenreSaturationMultiplier(game.genre);
    if (saturationMult < 1.0) {
      totalRevRaw = Math.round(totalRevRaw * saturationMult);
    }

    // Apply remaster nostalgia bonus (remasterBonus 0-10 adds up to 10% revenue)
    if (game.isRemaster && game.remasterBonus > 0) {
      totalRevRaw = Math.round(totalRevRaw * (1 + game.remasterBonus / 100));
    }

    const revenueResult = { totalRevenue: totalRevRaw, unitsSold: totalUnitsRaw };

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

    // Track victory counters
    if (criticAvg >= 8.5) s.gamesHighScore = (s.gamesHighScore || 0) + 1;
    if (game.size === 'AAA' && criticAvg >= 9.5) s.moonshots = (s.moonshots || 0) + 1;

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
    s.salesTotalWeeks = s.salesWeeksLeft;
    s.salesRevenue = 0;
    s.salesTotalTarget = revenueResult.totalRevenue;

    // Clear dev state
    s.currentGame = null;
    s.devPhase = null;
    s.devProgress = 0;
    s.devDesign = 0;
    s.devTech = 0;
    s.devSliders = null;
    s.waitingForPhaseInput = false;
    s.nextPhaseIndex = null;

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
    const totalSalesWeeks = s.salesTotalWeeks || 10;
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

  /** Trigger a named victory path and stop the game */
  _triggerVictory(path, message) {
    const s = this.state;
    s.gameOver = true;
    s.gameOverReason = 'victory';
    s.victoryPath = path;
    this.setSpeed(0);
    this._notify(message);
  }

  /** Start a remaster of a previously released game on new platforms */
  startRemaster(originalGame, newPlatformIds) {
    const remasterInfo = franchiseTracker.getRemasterScore(originalGame.title, this.state.totalWeeks);
    return this.startGame({
      title: `${originalGame.title}: Remastered`,
      topic: originalGame.topic,
      genre: originalGame.genre,
      audience: originalGame.audience,
      platformIds: newPlatformIds,
      size: originalGame.size,
      sliders: Array(9).fill(33),
      isRemaster: true,
      remasterBonus: remasterInfo ? remasterInfo.score : 0,
    });
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
      const applicant = {
        id: `staff_${Date.now()}_${i}`,
        name: `${firstName} ${lastName}`,
        design: baseStat + Math.floor(Math.random() * 30 - 15),
        tech: baseStat + Math.floor(Math.random() * 30 - 15),
        speed: 30 + Math.floor(Math.random() * 30),
        research: 10 + Math.floor(Math.random() * 20),
        salary: Math.round((baseStat * 150 + 3000) / 100) * 100,
        isFounder: false,
        gamesWorked: 0,
      };
      personalitySystem.assignTraits(applicant);
      applicants.push(applicant);
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

  _verticalTick() {
    const s = this.state;
    if (verticalManager.getActiveCount() === 0) return;

    const activeVerticals = Object.keys(verticalManager.active);
    const synergyFlags = buildSynergyFlags(activeVerticals);
    const result = verticalManager.monthlyTick(s, synergyFlags);

    // Apply synergy cost savings
    const savings = getSynergySavings(activeVerticals);

    // Apply full integration revenue bonus
    const revenueMultiplier = getTotalBonus(activeVerticals, 'revenue');
    const adjustedRevenue = Math.round(result.netRevenue * revenueMultiplier) + savings;

    if (adjustedRevenue !== 0) {
      s.cash += adjustedRevenue;
      const label = adjustedRevenue >= 0 ? 'Vertical Revenue' : 'Vertical Costs';
      finance.record(adjustedRevenue >= 0 ? 'vertical_revenue' : 'vertical_cost', adjustedRevenue, label, this._dateStr());
      if (adjustedRevenue > 0) taxSystem.addRevenue(adjustedRevenue);
    }

    // Process vertical events
    for (const ev of result.events) {
      this._notify(ev.message);
    }
  }

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

    // Vertical empire tick
    this._verticalTick();

    // Bankruptcy check
    if (s.cash < 0) {
      this._notify('WARNING: You are running out of money!');
    }
  }

  /** Competitor studios release games on their schedules */
  _competitorTick() {
    const s = this.state;
    const releases = competitorSystem.monthlyTick(s.totalWeeks, s.year);
    for (const game of releases) {
      this._notify(`${game.studioName} released "${game.title}" (${game.genre}) — scored ${game.score}/10`);
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

  // ── Loan System ──────────────────────────────────────────────

  /**
   * Take out a loan. Max $500K, 8% annual rate, auto-deduct quarterly.
   * @param {number} amount - loan amount (max 500000)
   * @returns {boolean} success
   */
  takeLoan(amount) {
    const s = this.state;
    if (!s || s.loan) return false; // already have a loan
    amount = Math.min(Math.max(0, amount), 500000);
    if (amount <= 0) return false;

    const annualRate = 0.08;
    // Simple quarterly payment over 2 years (8 quarters)
    const quarters = 8;
    const quarterlyRate = annualRate / 4;
    const quarterlyPayment = Math.round(amount * (quarterlyRate * Math.pow(1 + quarterlyRate, quarters)) / (Math.pow(1 + quarterlyRate, quarters) - 1));

    s.loan = {
      principal: amount,
      rate: annualRate,
      quarterlyPayment,
      remaining: amount,
    };
    s.cash += amount;
    finance.record('loan', amount, 'Bank Loan', this._dateStr());
    this._notify(`Took out a $${this._formatNum(amount)} loan at 8% annual. Quarterly payment: $${this._formatNum(quarterlyPayment)}`);
    this._emit();
    this._save();
    return true;
  }

  /** Repay loan early */
  repayLoan() {
    const s = this.state;
    if (!s || !s.loan) return false;
    if (s.cash < s.loan.remaining) return false;
    s.cash -= s.loan.remaining;
    finance.record('loan_payment', -s.loan.remaining, 'Loan Early Repayment', this._dateStr());
    this._notify('Loan fully repaid early!');
    s.loan = null;
    this._emit();
    this._save();
    return true;
  }

  // ── Vertical Empire Actions ──────────────────────────────────

  unlockVertical(id) {
    if (!this.state) return false;
    const ok = verticalManager.unlock(id, this.state);
    if (ok) {
      this._notify(`${id.charAt(0).toUpperCase() + id.slice(1)} vertical unlocked!`);
      this._emit();
      this._save();
    }
    return ok;
  }

  softwareSetModel(model) {
    const ok = verticalManager.softwareSetModel(model);
    if (ok) { this._emit(); this._save(); }
    return ok;
  }

  softwareLaunchProduct(type) {
    if (!this.state) return false;
    const ok = verticalManager.softwareLaunchProduct(type, this.state);
    if (ok) { this._emit(); this._save(); }
    return ok;
  }

  streamingSetTier(tier) {
    const ok = verticalManager.streamingSetTier(tier);
    if (ok) { this._emit(); this._save(); }
    return ok;
  }

  streamingCommissionContent(amount) {
    if (!this.state) return false;
    const result = verticalManager.streamingCommissionContent(amount, this.state);
    if (result !== false) { this._emit(); this._save(); }
    return result;
  }

  streamingSetContentBudget(amount) {
    const ok = verticalManager.streamingSetContentBudget(amount);
    if (ok) { this._emit(); this._save(); }
    return ok;
  }

  cloudBuildDatacenter(regionId) {
    if (!this.state) return false;
    const ok = verticalManager.cloudBuildDatacenter(regionId, this.state);
    if (ok) { this._emit(); this._save(); }
    return ok;
  }

  cloudAddEnterpriseContract() {
    if (!this.state) return false;
    const ok = verticalManager.cloudAddEnterpriseContract(this.state);
    if (ok) { this._emit(); this._save(); }
    return ok;
  }

  aiSetTrainingBudget(amount) {
    const ok = verticalManager.aiSetTrainingBudget(amount);
    if (ok) { this._emit(); this._save(); }
    return ok;
  }

  aiToggleOpenSource() {
    const ok = verticalManager.aiToggleOpenSource();
    if (ok) { this._emit(); this._save(); }
    return ok;
  }

  // ── IPO Actions ──────────────────────────────────────────────

  goPublic() {
    const s = this.state;
    if (!s || !ipoSystem.isEligible(s)) return false;
    const result = ipoSystem.goPublic(s);
    if (result) {
      // ipoSystem.goPublic() already added cash — just record + update state surface
      s.isPublic = true;
      s.stockPrice = result.stockPrice;
      finance.record('ipo_revenue', result.ipoRevenue, 'IPO Proceeds', this._dateStr());
      this._notify(`IPO successful! Raised $${this._formatNum(result.ipoRevenue)} at $${result.stockPrice}/share.`);
      this._emit();
      this._save();
    }
    return result;
  }

  // ── Conference Actions ──────────────────────────────────────

  resolveConference(action) {
    const s = this.state;
    if (!s || !s.pendingConference) return null;
    const result = conferenceSystem.resolve(action, s.pendingConference, s);
    s.pendingConference = null;
    if (result.attended) {
      finance.record('conference', -result.cost, result.confName, this._dateStr());
      if (result.starRecruit) {
        personalitySystem.assignTraits(result.starRecruit);
      }
      for (const msg of result.outcomes) {
        this._notify(msg);
      }
    }
    s.conferenceResult = result;
    this._emit();
    this._save();
    this.setSpeed(1);
    return result;
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
