/**
 * Tech Empire — React App Entry Point
 */
const { useState, useEffect, useCallback } = React;

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
  const [showPublisher, setShowPublisher] = useState(false);
  const [publisherGame, setPublisherGame] = useState(null);
  const [pendingEvent, setPendingEvent] = useState(null);
  const [eventConsequence, setEventConsequence] = useState(null);
  const [reviewGame, setReviewGame] = useState(null);
  const [companyName, setCompanyName] = useState('');

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
    });

    return () => unsub();
  }, [reviewGame, showReview, pendingEvent, eventConsequence]);

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

  const handleSpeedChange = useCallback((speed) => {
    engine.setSpeed(speed);
  }, []);

  const handleNewCompany = () => {
    const name = companyName.trim() || 'Indie Studio';
    engine.newGame(name);
    setScreen('game');
    // Start tutorial for first-time players
    if (typeof tutorialSystem !== 'undefined') tutorialSystem.checkFirstTime();
  };

  const handleLoadGame = () => {
    if (engine.load()) {
      setScreen('game');
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

        {/* Replay Tutorial */}
        {localStorage.getItem('techEmpire_tutorialComplete') && (
          <button
            className="btn-secondary"
            onClick={() => { localStorage.removeItem('techEmpire_tutorialComplete'); }}
            style={{ width: '360px', padding: '10px', fontSize: '13px', marginTop: '8px', opacity: 0.6 }}
          >
            Reset Tutorial
          </button>
        )}

        {/* Version */}
        <div style={{ position: 'fixed', bottom: '16px', fontSize: '11px', color: '#21262d' }}>
          v0.3.0
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
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
        onToggleHistory={() => setShowHistory(v => !v)}
        showHistory={showHistory}
      />

      <GameScreen
        state={gameState}
        onNewGame={handleNewGame}
        onStaff={() => setShowStaff(true)}
        onUpgrade={handleUpgrade}
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

      {/* Victory / Game Over Modal */}
      {gameState && gameState.gameOver && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{
            maxWidth: '480px', textAlign: 'center', padding: '40px',
          }}>
            {gameState.gameOverReason === 'victory' ? (
              <>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#127942;</div>
                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#3fb950', marginBottom: '12px' }}>
                  LEGENDARY STUDIO!
                </h2>
                <p style={{ fontSize: '15px', color: '#c9d1d9', marginBottom: '8px' }}>
                  You reached $500M total revenue and 10M fans.
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
                  Your studio ran out of money for 12 consecutive weeks.
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
