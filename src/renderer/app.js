/**
 * Tech Empire — React App Entry Point
 */
const { useState, useEffect, useCallback, useRef } = React;

function App() {
  const [gameState, setGameState] = useState(null);
  const [screen, setScreen] = useState('title'); // title | game
  const [showWizard, setShowWizard] = useState(false);
  const [showStaff, setShowStaff] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showFinance, setShowFinance] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const [showMarket, setShowMarket] = useState(false);
  const [showMorale, setShowMorale] = useState(false);
  const [showMarketing, setShowMarketing] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [showHardware, setShowHardware] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showVerticals, setShowVerticals] = useState(false);
  const [showStoryteller, setShowStoryteller] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showConference, setShowConference] = useState(false);
  const [showIPO, setShowIPO] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [showCompetitors, setShowCompetitors] = useState(false);
  const [showEngineBuilder, setShowEngineBuilder] = useState(false);
  const [showRemaster, setShowRemaster] = useState(false);
  const [remasterGame, setRemasterGame] = useState(null);
  const [showPublisher, setShowPublisher] = useState(false);
  const [publisherGame, setPublisherGame] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [pendingEvent, setPendingEvent] = useState(null);
  const [eventConsequence, setEventConsequence] = useState(null);
  const [reviewGame, setReviewGame] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [devMode, setDevMode] = useState(settingsSystem.devMode);

  // Context menu state
  const [contextMenu, setContextMenu] = useState(null);

  // Micro-animation states
  const [screenShake, setScreenShake] = React.useState(false);
  const [fanMilestoneGlow, setFanMilestoneGlow] = React.useState(false);
  const [ipoBellRing, setIpoBellRing] = React.useState(false);

  // Track fan milestones for confetti + glow (10K, 100K, 1M)
  const fanMilestonesRef = useRef({ '10000': false, '100000': false, '1000000': false });
  // Track if IPO just happened
  const wasPublicRef = useRef(false);
  // Track market crash events
  const lastEventIdRef = useRef(null);
  // Prevent review from re-triggering after close (fixes infinite loop)
  const lastReviewedGameRef = useRef(null);

  // Track which features have been unlocked (to show toast only once)
  const unlockedFeaturesRef = useRef({
    research: false,
    hardware: false,
    verticals: false,
    marketing: false,
    training: false,
    morale: false,
    tier2: false,
    tier3: false,
    tier4: false,
    tier5: false,
  });

  // Check for newly unlocked features and show toast
  const checkFeatureUnlocks = useCallback((state) => {
    if (!state || devMode) return;
    const totalRev = typeof finance !== 'undefined' ? finance.totalRevenue() : 0;
    const checks = {
      research:  { condition: state.level >= 2, label: 'Research Lab' },
      hardware:  { condition: state.level >= 3, label: 'Hardware Lab' },
      verticals: { condition: state.level >= 2 && totalRev >= 10000000, label: 'Tech Verticals' },
      marketing: { condition: state.level >= 1, label: 'Marketing Campaigns' },
      training:  { condition: state.level >= 1, label: 'Staff Training' },
      morale:    { condition: state.staff.length >= 2, label: 'Studio Morale' },
    };

    for (const [key, { condition, label }] of Object.entries(checks)) {
      if (condition && !unlockedFeaturesRef.current[key]) {
        unlockedFeaturesRef.current[key] = true;
        showToast(`${label} unlocked!`, 'success', 5000);
      }
    }

    const tierChecks = {
      tier2: { condition: state.staff.length >= 2, label: 'New Topics Unlocked (Tier 2)' },
      tier3: { condition: state.level >= 1, label: 'New Topics Unlocked (Tier 3)' },
      tier4: { condition: state.level >= 2, label: 'New Topics Unlocked (Tier 4)' },
      tier5: { condition: state.games.length >= 5, label: 'New Topics Unlocked (Tier 5)' },
    };
    for (const [key, { condition, label }] of Object.entries(tierChecks)) {
      if (condition && !unlockedFeaturesRef.current[key]) {
        unlockedFeaturesRef.current[key] = true;
        showToast(label, 'success', 5000);
      }
    }
  }, [devMode]);

  useEffect(() => {
    const unsub = engine.subscribe((state) => {
      setGameState(state);

      // Check if a game was just released (games array grew + we're paused)
      if (state.games.length > 0 && engine.speed === 0) {
        const latest = state.games[state.games.length - 1];
        // Only show review for a genuinely NEW game we haven't already reviewed
        if (latest && !showReview && latest !== lastReviewedGameRef.current) {
          setReviewGame(latest);
          setShowReview(true);
          lastReviewedGameRef.current = latest;
        }
      }

      // Check for pending event
      if (state.pendingEvent && !pendingEvent) {
        setPendingEvent(state.pendingEvent);
      }
      // Check for event consequence
      if (state.eventConsequence && !eventConsequence) {
        setEventConsequence(state.eventConsequence);
      }

      // Check if waiting for phase input (GDT-style phase pause)
      if (state.waitingForPhaseInput && !showPhaseModal) {
        setShowPhaseModal(true);
      }

      // Check for pending conference
      if (state.pendingConference && !showConference) {
        setShowConference(true);
      }

      // Check feature unlocks for toast notifications
      checkFeatureUnlocks(state);

      // ── Fan milestone confetti + glow (10K, 100K, 1M) ──
      const fanThresholds = [10000, 100000, 1000000];
      for (const threshold of fanThresholds) {
        if (state.fans >= threshold && !fanMilestonesRef.current[String(threshold)]) {
          fanMilestonesRef.current[String(threshold)] = true;
          setFanMilestoneGlow(true);
          setTimeout(() => setFanMilestoneGlow(false), 6000);
        }
      }

      // ── IPO bell ring ──
      if (state.isPublic && !wasPublicRef.current) {
        wasPublicRef.current = true;
        setIpoBellRing(true);
        setTimeout(() => setIpoBellRing(false), 800);
      }

      // ── Market crash camera shake ──
      if (state.pendingEvent && state.pendingEvent.id === 'market_crash' && lastEventIdRef.current !== 'market_crash') {
        lastEventIdRef.current = state.pendingEvent.id;
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 600);
      } else if (!state.pendingEvent) {
        lastEventIdRef.current = null;
      }
    });

    return () => unsub();
  }, [reviewGame, showReview, pendingEvent, eventConsequence, showPhaseModal, showConference, checkFeatureUnlocks]);

  const handleNewGame = () => {
    engine.setSpeed(0);
    setShowWizard(true);
  };

  const handleStartDev = (config) => {
    if (engine.startGame(config)) {
      setShowWizard(false);
      engine.setSpeed(1);
    }
  };

  const handlePhaseSubmit = (phaseSliders) => {
    engine.submitPhaseSliders(phaseSliders);
    setShowPhaseModal(false);
  };

  const handleSpeedChange = useCallback((speed) => {
    engine.setSpeed(speed);
  }, []);

  const handleNewCompany = () => {
    const name = companyName.trim() || 'Indie Studio';
    engine.newGame(name, selectedAvatar);
    setScreen('game');
    if (typeof audioManager !== 'undefined') audioManager.playMusic();
    // Reset unlock tracking for new game
    unlockedFeaturesRef.current = {
      research: false, hardware: false, verticals: false, marketing: false, training: false, morale: false,
    };
    // Reset animation tracking for new game
    fanMilestonesRef.current = { '10000': false, '100000': false, '1000000': false };
    wasPublicRef.current = false;
    lastEventIdRef.current = null;
    // Start tutorial for first-time players
    if (typeof tutorialSystem !== 'undefined') tutorialSystem.checkFirstTime();
  };

  const handleLoadGame = () => {
    if (engine.load()) {
      setScreen('game');
      if (typeof audioManager !== 'undefined') audioManager.playMusic();
      // Initialize unlock tracking based on loaded state
      const s = engine.state;
      if (s) {
        const loadedTotalRev = typeof finance !== 'undefined' ? finance.totalRevenue() : 0;
        unlockedFeaturesRef.current = {
          research: s.level >= 2, hardware: s.level >= 3,
          verticals: s.level >= 2 && loadedTotalRev >= 10000000,
          marketing: s.level >= 1, training: s.level >= 1,
          morale: s.staff.length >= 2,
        };
      }
    }
  };

  const handleUpgrade = () => {
    engine.upgradeOffice();
  };

  const handleOfficeClick = (x, y) => {
    setContextMenu({ x, y });
  };

  const handleContextAction = (action) => {
    switch (action) {
      case 'newGame': handleNewGame(); break;
      case 'staff': setShowStaff(true); break;
      case 'finance': setShowFinance(true); break;
      case 'marketing': setShowMarketing(true); break;
      case 'research': setShowResearch(true); break;
      case 'training': setShowTraining(true); break;
      case 'market': setShowMarket(true); break;
      case 'settings': setShowSettings(true); break;
      default: break;
    }
  };

  const handleReviewClose = () => {
    setShowReview(false);
    // Generate and show research report before publisher panel
    if (reviewGame && typeof gameReportGenerator !== 'undefined') {
      const report = gameReportGenerator.generateReport(reviewGame, gameState.games.length);
      setReportData({ game: reviewGame, report });
      setShowReport(true);
    } else {
      // Fallback: skip report, go to publisher
      if (reviewGame) {
        setPublisherGame(reviewGame);
        setShowPublisher(true);
      }
      setReviewGame(null);
    }
  };

  const handleReportClose = () => {
    setShowReport(false);
    // Now show publisher panel
    if (reportData && reportData.game) {
      setPublisherGame(reportData.game);
      setShowPublisher(true);
    }
    setReportData(null);
    setReviewGame(null);
  };

  const handlePublisherDeal = (deal) => {
    engine.setPublisherDeal(deal);
    setShowPublisher(false);
    setPublisherGame(null);
    engine.setSpeed(1);
  };

  const handleSelfPublish = () => {
    engine.setPublisherDeal(null);
    setShowPublisher(false);
    setPublisherGame(null);
    engine.setSpeed(1);
  };

  const handlePublisherClose = () => {
    // Skip = self publish
    engine.setPublisherDeal(null);
    setShowPublisher(false);
    setPublisherGame(null);
    engine.setSpeed(1);
  };

  const handleEventChoice = (optionIndex) => {
    if (optionIndex === -1) {
      // Dismissing consequence
      setEventConsequence(null);
      engine.dismissEventConsequence();
      return;
    }
    // Resolve the event
    engine.resolveEvent(optionIndex);
    setPendingEvent(null);
    // Consequence will be picked up by the subscribe effect
    if (engine.state.eventConsequence) {
      setEventConsequence(engine.state.eventConsequence);
    }
  };

  const handleConferenceResolve = (action) => {
    engine.resolveConference(action);
    // Don't close panel — let user see the result; close manually
    if (action === 'skip') {
      setShowConference(false);
    }
  };

  const handleDevModeToggle = () => {
    const newVal = !devMode;
    setDevMode(newVal);
    settingsSystem.setDevMode(newVal);
    showToast(newVal ? 'Dev Mode ON — all features unlocked' : 'Dev Mode OFF', 'info', 3000);
  };

  // Dev auto-play: expose function for CDP/automated testing
  React.useEffect(() => {
    window._devAutoPlay = (name) => {
      const n = name || 'Stark Labs';
      engine.newGame(n);
      setScreen('game');
      unlockedFeaturesRef.current = {
        research: false, hardware: false, verticals: false, marketing: false, training: false, morale: false,
      };
      fanMilestonesRef.current = { '10000': false, '100000': false, '1000000': false };
      wasPublicRef.current = false;
      lastEventIdRef.current = null;
    };
    window._devLoadGame = () => {
      if (engine.load()) {
        setScreen('game');
      }
    };
    return () => { delete window._devAutoPlay; delete window._devLoadGame; };
  }, []);

  // Keyboard shortcuts help overlay
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Keyboard shortcuts — only active on game screen, ignored when typing in inputs
  React.useEffect(() => {
    const isTyping = () => {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
    };

    // Close any open panel
    const closeAllPanels = () => {
      setShowStaff(false); setShowFinance(false); setShowResearch(false);
      setShowMarket(false); setShowMorale(false); setShowMarketing(false);
      setShowTraining(false); setShowHardware(false); setShowHistory(false);
      setShowSettings(false); setShowVerticals(false); setShowStoryteller(false);
      setShowTimeline(false); setShowCompetitors(false); setShowEngineBuilder(false);
      setShowKeyboardHelp(false);
    };

    const anyPanelOpen = () =>
      showStaff || showFinance || showResearch || showMarket || showMorale ||
      showMarketing || showTraining || showHardware || showHistory || showSettings ||
      showVerticals || showStoryteller || showTimeline || showCompetitors || showEngineBuilder ||
      showKeyboardHelp || showWizard || showReview || showReport || showPhaseModal || showConference ||
      showIPO || showVictory || showRemaster || showPublisher || pendingEvent || eventConsequence;

    const handleKey = (e) => {
      if (isTyping()) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // Escape closes any panel (including blocking modals)
      if (e.key === 'Escape') {
        closeAllPanels();
        return;
      }

      // Ignore remaining shortcuts if a blocking modal is open
      if (screen !== 'game') return;
      if (showWizard || showReview || showReport || showPhaseModal || showConference ||
          showIPO || showVictory || showRemaster || showPublisher ||
          pendingEvent || eventConsequence) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          engine.setSpeed(engine.speed === 0 ? 1 : 0);
          break;
        case '1': engine.setSpeed(0); break;
        case '2': engine.setSpeed(1); break;
        case '3': engine.setSpeed(2); break;
        case '4': engine.setSpeed(4); break;
        case 's': case 'S': if (!anyPanelOpen()) setShowStaff(true); break;
        case 'f': case 'F': if (!anyPanelOpen()) setShowFinance(true); break;
        case 'r': case 'R': if (!anyPanelOpen()) setShowResearch(true); break;
        case 'm': case 'M': if (!anyPanelOpen()) setShowMarket(true); break;
        case 'h': case 'H': if (!anyPanelOpen()) setShowHistory(true); break;
        case 't': case 'T': if (!anyPanelOpen()) setShowTraining(true); break;
        case 'c': case 'C': if (!anyPanelOpen()) setShowMarketing(true); break;
        case 'v': case 'V': if (!anyPanelOpen()) setShowVerticals(true); break;
        case '?': setShowKeyboardHelp(true); break;
        default: break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [screen, showStaff, showFinance, showResearch, showMarket, showMorale,
      showMarketing, showTraining, showHardware, showHistory, showSettings,
      showVerticals, showStoryteller, showTimeline, showCompetitors, showEngineBuilder,
      showKeyboardHelp, showWizard, showReview, showPhaseModal, showConference, showIPO,
      showVictory, showRemaster, showPublisher, pendingEvent, eventConsequence]);

  // Title screen
  if (screen === 'title') {
    const hasSave = !!localStorage.getItem('techEmpire_save');

    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, #161b22 0%, #0d1117 70%)',
      }}>
        {/* Logo / Splash */}
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <img
            src="../../assets/brand/logo/splash-screen.jpg"
            alt="Tech Empire"
            style={{ maxWidth: '400px', width: '100%', borderRadius: '16px', marginBottom: '16px' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div style={{
            fontSize: '56px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #58a6ff 0%, #79c0ff 40%, #da7cff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-2px',
            marginBottom: '8px',
          }}>
            TECH EMPIRE
          </div>
          <div style={{
            fontSize: '14px',
            color: '#8b949e',
            letterSpacing: '4px',
            textTransform: 'uppercase',
          }}>
            Game Dev Tycoon
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            marginTop: '8px',
          }}>
            <img
              src="../../assets/brand/logo/logo.svg"
              alt=""
              style={{ width: '16px', height: '16px', opacity: 0.6 }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span style={{
              fontSize: '11px',
              color: '#30363d',
              letterSpacing: '2px',
            }}>
              by Stark Labs
            </span>
          </div>
        </div>

        {/* New Game */}
        <div className="glass-card" style={{ padding: '32px', width: '360px', marginBottom: '16px' }}>
          <AvatarSelect selected={selectedAvatar} onSelect={setSelectedAvatar} />
          <label style={{ fontSize: '13px', color: '#8b949e', display: 'block', marginBottom: '8px' }}>
            Company Name
          </label>
          <input
            type="text"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            placeholder="Enter company name..."
            onKeyDown={e => e.key === 'Enter' && handleNewCompany()}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#e6edf3', fontSize: '16px', outline: 'none',
              marginBottom: '16px',
            }}
            autoFocus
          />
          <button className="btn-accent" onClick={handleNewCompany} style={{ width: '100%', padding: '12px', fontSize: '15px' }}>
            New Game
          </button>
        </div>

        {/* Continue */}
        {hasSave && (
          <button className="btn-secondary" onClick={handleLoadGame} style={{ width: '360px', padding: '12px', fontSize: '15px' }}>
            Continue Saved Game
          </button>
        )}

        {/* Settings row */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          {/* Replay Tutorial */}
          {localStorage.getItem('techEmpire_tutorialComplete') && (
            <button
              className="btn-secondary"
              onClick={() => { localStorage.removeItem('techEmpire_tutorialComplete'); }}
              style={{ padding: '10px 16px', fontSize: '13px', opacity: 0.6 }}
            >
              Reset Tutorial
            </button>
          )}

          {/* Dev Mode toggle */}
          <button
            className={`btn-secondary ${devMode ? 'active' : ''}`}
            onClick={handleDevModeToggle}
            style={{
              padding: '10px 16px', fontSize: '13px',
              opacity: devMode ? 1 : 0.6,
              background: devMode ? 'rgba(218,124,255,0.15)' : undefined,
              borderColor: devMode ? 'rgba(218,124,255,0.4)' : undefined,
              color: devMode ? '#da7cff' : undefined,
            }}
          >
            Dev Mode {devMode ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Version */}
        <div style={{ position: 'fixed', bottom: '16px', fontSize: '11px', color: '#21262d' }}>
          v0.4.0
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <div className={screenShake ? 'animate-shake' : ''} style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar
        state={gameState}
        onSpeedChange={handleSpeedChange}
        onToggleFinance={() => setShowFinance(v => !v)}
        showFinance={showFinance}
        onToggleResearch={() => setShowResearch(v => !v)}
        showResearch={showResearch}
        onToggleMarket={() => setShowMarket(v => !v)}
        showMarket={showMarket}
        onToggleMorale={() => setShowMorale(v => !v)}
        showMorale={showMorale}
        onToggleMarketing={() => setShowMarketing(v => !v)}
        showMarketing={showMarketing}
        onToggleTraining={() => setShowTraining(v => !v)}
        showTraining={showTraining}
        onToggleHardware={() => setShowHardware(v => !v)}
        showHardware={showHardware}
        onToggleVerticals={() => setShowVerticals(v => !v)}
        showVerticals={showVerticals}
        onToggleStoryteller={() => setShowStoryteller(v => !v)}
        showStoryteller={showStoryteller}
        onToggleTimeline={() => setShowTimeline(v => !v)}
        showTimeline={showTimeline}
        onToggleConference={() => setShowConference(v => !v)}
        showConference={showConference}
        onToggleIPO={() => setShowIPO(v => !v)}
        showIPO={showIPO}
        onToggleVictory={() => setShowVictory(v => !v)}
        showVictory={showVictory}
        onToggleCompetitors={() => setShowCompetitors(v => !v)}
        showCompetitors={showCompetitors}
        onToggleEngineBuilder={() => setShowEngineBuilder(v => !v)}
        showEngineBuilder={showEngineBuilder}
        onToggleHistory={() => setShowHistory(v => !v)}
        showHistory={showHistory}
        onToggleSettings={() => setShowSettings(v => !v)}
        showSettings={showSettings}
        devMode={devMode}
      />

      <GameScreen
        state={gameState}
        onNewGame={handleNewGame}
        onStaff={() => setShowStaff(true)}
        onUpgrade={handleUpgrade}
        fanMilestoneGlow={fanMilestoneGlow}
        onOfficeClick={handleOfficeClick}
      />

      {showWizard && gameState && (
        <NewGameWizard
          state={gameState}
          onStart={handleStartDev}
          onCancel={() => setShowWizard(false)}
        />
      )}

      {showStaff && gameState && (
        <StaffPanel
          state={gameState}
          onClose={() => setShowStaff(false)}
        />
      )}

      {showReview && reviewGame && (
        <ReviewScreen
          game={reviewGame}
          onClose={handleReviewClose}
        />
      )}

      {showReport && reportData && (
        <GameReportPanel
          game={reportData.game}
          report={reportData.report}
          onClose={handleReportClose}
        />
      )}

      {showFinance && gameState && (
        <FinanceDashboard
          state={gameState}
          onClose={() => setShowFinance(false)}
        />
      )}

      {showResearch && gameState && (
        <ResearchPanel
          state={gameState}
          onClose={() => setShowResearch(false)}
        />
      )}

      {showMarket && gameState && (
        <MarketPanel
          state={gameState}
          onClose={() => setShowMarket(false)}
        />
      )}

      {showMorale && gameState && (
        <MoralePanel
          state={gameState}
          onClose={() => setShowMorale(false)}
        />
      )}

      {showMarketing && gameState && (
        <MarketingPanel
          state={gameState}
          onClose={() => setShowMarketing(false)}
        />
      )}

      {showTraining && gameState && (
        <TrainingPanel
          state={gameState}
          onClose={() => setShowTraining(false)}
        />
      )}

      {showHardware && gameState && (
        <HardwarePanel
          state={gameState}
          onClose={() => setShowHardware(false)}
        />
      )}

      {showVerticals && gameState && (
        <VerticalPanel
          state={gameState}
          onClose={() => setShowVerticals(false)}
        />
      )}

      {showStoryteller && gameState && (
        <StorytellerPanel
          state={gameState}
          onClose={() => setShowStoryteller(false)}
        />
      )}

      {showTimeline && gameState && (
        <TimelinePanel
          state={gameState}
          onClose={() => setShowTimeline(false)}
        />
      )}

      {showConference && gameState && (
        <ConferencePanel
          state={gameState}
          onClose={() => setShowConference(false)}
          pendingConference={gameState.pendingConference || null}
          onResolveConference={handleConferenceResolve}
        />
      )}

      {showIPO && gameState && (
        <IPOPanel
          state={gameState}
          onClose={() => setShowIPO(false)}
          bellRing={ipoBellRing}
        />
      )}

      {showVictory && gameState && (
        <VictoryTracker
          state={gameState}
          onClose={() => setShowVictory(false)}
        />
      )}

      {showCompetitors && gameState && (
        <CompetitorPanel
          state={gameState}
          onClose={() => setShowCompetitors(false)}
        />
      )}

      {showEngineBuilder && gameState && (
        <EngineBuilderPanel
          state={gameState}
          onClose={() => setShowEngineBuilder(false)}
        />
      )}

      {showPublisher && publisherGame && gameState && (
        <PublisherPanel
          state={gameState}
          game={publisherGame}
          onSelectDeal={handlePublisherDeal}
          onSelfPublish={handleSelfPublish}
          onClose={handlePublisherClose}
        />
      )}

      {showHistory && gameState && (
        <GameHistory
          state={gameState}
          onClose={() => setShowHistory(false)}
          onRemaster={(g) => { setRemasterGame(g); setShowHistory(false); setShowRemaster(true); }}
        />
      )}

      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}

      {showKeyboardHelp && (
        <KeyboardHelpModal onClose={() => setShowKeyboardHelp(false)} />
      )}

      {showRemaster && remasterGame && gameState && (
        <RemasterWizard
          state={gameState}
          game={remasterGame}
          onStart={() => { setShowRemaster(false); setRemasterGame(null); engine.setSpeed(1); }}
          onCancel={() => { setShowRemaster(false); setRemasterGame(null); }}
        />
      )}

      {/* Phase Slider Modal — GDT-style pause between phases */}
      {showPhaseModal && gameState && gameState.waitingForPhaseInput && (
        <PhaseSliderModal
          state={gameState}
          onSubmit={handlePhaseSubmit}
        />
      )}

      {(pendingEvent || eventConsequence) && (
        <EventModal
          event={pendingEvent}
          consequence={eventConsequence}
          onChoice={handleEventChoice}
        />
      )}

      <TutorialOverlay />

      {/* Office context menu */}
      {contextMenu && gameState && (
        <OfficeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          state={gameState}
          onAction={handleContextAction}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Global Toast notifications */}
      <ToastContainer />

      {/* Victory / Game Over Modal */}
      {gameState && gameState.gameOver && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{
            maxWidth: '520px', textAlign: 'center', padding: '40px',
          }}>
            {gameState.gameOverReason === 'victory' ? (() => {
              const vp = VICTORY_PATHS.find(p => p.name === gameState.victoryPath);
              const VICTORY_IMAGES = {
                'Brand Empire': '../../assets/victory/v1-brand-empire-a.jpg',
                'Innovation Leader': '../../assets/victory/v2-innovation-leader.jpg',
                'Market Dominator': '../../assets/victory/v3-market-dominator.jpg',
                'Financial Titan': '../../assets/victory/v4-financial-titan.jpg',
                'Industry Kingmaker': '../../assets/victory/v5-industry-kingmaker.jpg',
              };
              const victoryImage = VICTORY_IMAGES[gameState.victoryPath];
              const totalRev = typeof finance !== 'undefined' ? finance.totalRevenue() : 0;
              const formatBig = (n) => {
                if (n >= 1000000000) return '$' + (n / 1000000000).toFixed(2) + 'B';
                if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
                if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'K';
                return '$' + n.toLocaleString();
              };
              const formatFansNum = (n) => {
                if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
                if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
                return n.toLocaleString();
              };
              const playYears = gameState.year;
              const playMonths = gameState.month;
              const bestGame = gameState.games.length > 0
                ? gameState.games.reduce((best, g) => g.reviewAvg > best.reviewAvg ? g : best, gameState.games[0])
                : null;
              return (
                <>
                  {victoryImage && (
                    <div style={{
                      width: '100%', height: '160px', marginBottom: '16px', borderRadius: '10px',
                      overflow: 'hidden',
                    }}>
                      <img src={victoryImage} alt={gameState.victoryPath} style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                      }} />
                    </div>
                  )}
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>{vp ? vp.icon : '🏆'}</div>
                  {gameState.victoryPath && (
                    <div style={{
                      fontSize: '12px', color: '#58a6ff', textTransform: 'uppercase',
                      letterSpacing: '2px', marginBottom: '8px', fontWeight: 600,
                    }}>
                      {gameState.victoryPath}
                    </div>
                  )}
                  <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#3fb950', marginBottom: '8px' }}>
                    LEGENDARY STUDIO!
                  </h2>
                  <p style={{ fontSize: '14px', color: '#c9d1d9', marginBottom: '16px' }}>
                    {vp ? vp.description : 'You built a legendary gaming empire!'}
                  </p>

                  {/* Company Stats Summary */}
                  <div style={{
                    background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.06)', padding: '16px 20px',
                    marginBottom: '20px', textAlign: 'left',
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '10px', color: '#6e7681', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Playtime</div>
                        <div style={{ fontSize: '15px', color: '#e6edf3', fontWeight: 600 }}>Year {playYears}, Month {playMonths}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: '#6e7681', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Games Released</div>
                        <div style={{ fontSize: '15px', color: '#e6edf3', fontWeight: 600 }}>{gameState.games.length}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: '#6e7681', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Revenue</div>
                        <div style={{ fontSize: '15px', color: '#3fb950', fontWeight: 600 }}>{formatBig(totalRev)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: '#6e7681', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fans</div>
                        <div style={{ fontSize: '15px', color: '#58a6ff', fontWeight: 600 }}>{formatFansNum(gameState.fans)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: '#6e7681', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Staff</div>
                        <div style={{ fontSize: '15px', color: '#e6edf3', fontWeight: 600 }}>{gameState.staff.length}</div>
                      </div>
                      {bestGame && (
                        <div>
                          <div style={{ fontSize: '10px', color: '#6e7681', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Best Game</div>
                          <div style={{ fontSize: '13px', color: '#da7cff', fontWeight: 600 }}>{bestGame.title} ({bestGame.reviewAvg})</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '12px', color: '#8b949e', marginBottom: '20px' }}>
                    Your studio will be remembered forever in gaming history.
                  </p>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                      className="btn-accent"
                      onClick={() => {
                        // Continue Playing — enter sandbox mode
                        victorySystem.enterSandbox();
                        engine.state.gameOver = false;
                        engine.state.gameOverReason = null;
                        engine._emit();
                        engine._save();
                      }}
                      style={{ padding: '12px 28px', fontSize: '14px' }}
                    >
                      Continue Playing
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => { setScreen('title'); engine.destroy(); if (typeof audioManager !== 'undefined') audioManager.stopMusic(); }}
                      style={{ padding: '12px 28px', fontSize: '14px' }}
                    >
                      Return to Title
                    </button>
                  </div>
                </>
              );
            })() : (
              <>
                <div style={{
                  width: '100%', height: '140px', marginBottom: '16px', borderRadius: '10px',
                  overflow: 'hidden',
                }}>
                  <img src="../../assets/screens/game-over-bankruptcy.jpg" alt="Game Over" style={{
                    width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8,
                  }} />
                </div>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#128148;</div>
                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#f85149', marginBottom: '12px' }}>
                  BANKRUPT
                </h2>
                <p style={{ fontSize: '15px', color: '#c9d1d9', marginBottom: '8px' }}>
                  Your studio ran out of money for too long.
                </p>
                <p style={{ fontSize: '13px', color: '#8b949e', marginBottom: '24px' }}>
                  The dream is over... but you can always try again.
                </p>
                <button
                  className="btn-accent"
                  onClick={() => { setScreen('title'); engine.destroy(); if (typeof audioManager !== 'undefined') audioManager.stopMusic(); }}
                  style={{ padding: '12px 32px', fontSize: '15px' }}
                >
                  Return to Title
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
