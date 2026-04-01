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
    });

    return () => unsub();
  }, [reviewGame, showReview]);

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
    setReviewGame(null);
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

        {/* Version */}
        <div style={{ position: 'fixed', bottom: '16px', fontSize: '11px', color: '#21262d' }}>
          v0.1.0
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
    </div>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
