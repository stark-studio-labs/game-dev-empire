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
  const [showRemaster, setShowRemaster] = useState(false);
  const [remasterGame, setRemasterGame] = useState(null);
  const [showPublisher, setShowPublisher] = useState(false);
  const [publisherGame, setPublisherGame] = useState(null);
  const [pendingEvent, setPendingEvent] = useState(null);
  const [eventConsequence, setEventConsequence] = useState(null);
  const [reviewGame, setReviewGame] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [devMode, setDevMode] = useState(settingsSystem.devMode);

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

  // Track which features have been unlocked (to show toast only once)
  const unlockedFeaturesRef = useRef({
    research: false,
    hardware: false,
    verticals: false,
    marketing: false,
    training: false,
    morale: false,
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
  }, [devMode]);

  useEffect(() => {
    const unsub = engine.subscribe((state) => {
      setGameState(state);

      // Check if a game was just released (games array grew + we're paused)
      if (state.games.length > 0 && engine.speed === 0) {
        const latest = state.games[state.games.length - 1];
        if (latest && latest !== reviewGame && !showReview) {
          // Only show review if this is a newly released game
          if (!reviewGame || latest.title !== reviewGame.title) {
            setReviewGame(latest);
            setShowReview(true);
          }
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
    engine.newGame(name);
    setScreen('game');
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

  const handleReviewClose = () => {
    setShowReview(false);
    // After closing review, show publisher panel for the just-released game
    if (reviewGame) {
      setPublisherGame(reviewGame);
      setShowPublisher(true);
    }
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
        {/* Logo */}
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
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
            fontSize: '11px',
            color: '#30363d',
            marginTop: '8px',
            letterSpacing: '2px',
          }}>
            by Stark Labs
          </div>
        </div>

        {/* New Game */}
        <div className="glass-card" style={{ padding: '32px', width: '360px', marginBottom: '16px' }}>
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

      {/* Global Toast notifications */}
      <ToastContainer />

      {/* Victory / Game Over Modal */}
      {gameState && gameState.gameOver && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{
            maxWidth: '480px', textAlign: 'center', padding: '40px',
          }}>
            {gameState.gameOverReason === 'victory' ? (
              <>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#127942;</div>
                {gameState.victoryPath && (
                  <div style={{
                    fontSize: '12px', color: '#58a6ff', textTransform: 'uppercase',
                    letterSpacing: '2px', marginBottom: '8px', fontWeight: 600,
                  }}>
                    {gameState.victoryPath}
                  </div>
                )}
                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#3fb950', marginBottom: '12px' }}>
                  LEGENDARY STUDIO!
                </h2>
                <p style={{ fontSize: '15px', color: '#c9d1d9', marginBottom: '8px' }}>
                  {gameState.victoryPath === 'Brand Empire' && '50M fans and 10 critically acclaimed games.'}
                  {gameState.victoryPath === 'Innovation Leader' && '3 moonshot AAA titles redefined the industry.'}
                  {gameState.victoryPath === 'Market Dominator' && '15 games spanning 5 genres — you own every market.'}
                  {gameState.victoryPath === 'Financial Titan' && '$1 billion in total revenue. A true empire.'}
                  {gameState.victoryPath === 'Industry Kingmaker' && 'Hardware dominance — you set the standard.'}
                  {!gameState.victoryPath && 'You built a legendary gaming empire!'}
                </p>
                <p style={{ fontSize: '13px', color: '#8b949e', marginBottom: '24px' }}>
                  Your studio will be remembered forever in gaming history.
                </p>
              </>
            ) : (
              <>
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
              </>
            )}
            <button
              className="btn-accent"
              onClick={() => { setScreen('title'); engine.destroy(); }}
              style={{ padding: '12px 32px', fontSize: '15px' }}
            >
              Return to Title
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
