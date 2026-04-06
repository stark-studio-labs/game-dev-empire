/**
 * NewGameWizard — Step-by-step game creation:
 * 1. Topic → 2. Genre → 3. Platform + Audience + Size → 4. Slider allocation → 5. Confirm
 */
function NewGameWizard({ state, onStart, onCancel, devMode }) {
  const [step, setStep] = React.useState(0);
  const [title, setTitle] = React.useState('');
  const [topic, setTopic] = React.useState(null);
  const [genre, setGenre] = React.useState(null);
  const [audience, setAudience] = React.useState('Everyone');
  const [platformIds, setPlatformIds] = React.useState([]);
  const [size, setSize] = React.useState('Small');
  const [selectedEngine, setSelectedEngine] = React.useState(null);

  const isTutorial = typeof tutorialSystem !== 'undefined' && tutorialSystem.isActive && tutorialSystem.isActive();
  const tutorialTopics = ['Fantasy', 'Sci-Fi', 'Sports'];

  const canMultiPlatform = (state.level || 0) >= 3 || devMode;
  const togglePlatform = (id) => {
    setPlatformIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (!canMultiPlatform && prev.length >= 1) return [id]; // single-select before Large Office
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };
  // Phase 1 sliders only — phases 2 & 3 are set during development via PhaseSliderModal
  const [sliders, setSliders] = React.useState([33, 33, 33]);

  const availableSizes = engine.getAvailableSizes();
  const availablePlatforms = state.availablePlatforms || [];

  // Topic unlock logic — 6 tiers keyed to progression milestones
  const isTopicUnlocked = (t) => {
    if (devMode) return true;
    // Check if manually unlocked via RP
    if (state.unlockedTopics && state.unlockedTopics.includes(t.name)) return true;
    if (t.tier === 1) return true;
    if (t.tier === 2) return state.staff.length >= 2;
    if (t.tier === 3) return (state.level || 0) >= 1;
    if (t.tier === 4) return (state.level || 0) >= 2;
    if (t.tier === 5) return state.games.length >= 5;
    if (t.tier === 6) {
      if ((state.level || 0) < 3) return false;
      if (!t.researchCategory) return true;
      const completedInCat = Object.keys(
        (typeof researchSystem !== 'undefined' && researchSystem.completed) ? researchSystem.completed : {}
      ).filter(id => {
        const item = RESEARCH_ITEMS.find(r => r.id === id);
        return item && item.category === t.researchCategory;
      }).length;
      return completedInCat >= (t.researchCount || 1);
    }
    return true;
  };

  const unlockedTopics = isTutorial
    ? TOPICS.filter(t => tutorialTopics.includes(t.name))
    : TOPICS.filter(t => isTopicUnlocked(t));
  const totalTopics = TOPICS.length;

  // Gate: show compatibility only after 5 games shipped + Market Research completed
  const showCompat = devMode || (state.games.length >= 5 &&
    typeof researchSystem !== 'undefined' && researchSystem.completed && researchSystem.completed['ux_market_research']);

  // Gate: audience selection unlocks in Year 3
  const audienceUnlocked = (state.year || 1) >= 3 || devMode;

  // Compatibility indicator
  const getCompat = (val) => {
    if (val >= 1.0) return { label: '+++', color: '#3fb950' };
    if (val >= 0.9) return { label: '++', color: '#56d364' };
    if (val >= 0.8) return { label: '+', color: '#8b949e' };
    if (val >= 0.7) return { label: '-', color: '#d29922' };
    return { label: '--', color: '#f85149' };
  };

  const updateSlider = (aspectIdx, value) => {
    const newSliders = [...sliders];
    const otherIndices = [0, 1, 2].filter(i => i !== aspectIdx);
    const oldVal = newSliders[aspectIdx];
    const diff = value - oldVal;
    const othersSum = otherIndices.reduce((s, i) => s + newSliders[i], 0);

    newSliders[aspectIdx] = value;

    if (othersSum > 0) {
      otherIndices.forEach(i => {
        newSliders[i] = Math.max(5, Math.round(newSliders[i] - diff * (newSliders[i] / othersSum)));
      });
    } else {
      otherIndices.forEach(i => {
        newSliders[i] = Math.round((100 - value) / 2);
      });
    }

    // Normalize to 100
    const sum = newSliders[0] + newSliders[1] + newSliders[2];
    if (sum > 0 && sum !== 100) {
      const factor = 100 / sum;
      for (let i = 0; i < 3; i++) {
        newSliders[i] = Math.max(5, Math.round(newSliders[i] * factor));
      }
    }

    setSliders(newSliders);
  };

  const handleConfirm = () => {
    const config = {
      title: title || `${topic} ${genre}`,
      topic,
      genre,
      audience,
      platformIds,
      size,
      sliders, // Only Phase 1 (3 values) — engine fills defaults for phases 2 & 3
      engineId: selectedEngine,
    };
    onStart(config);
  };

  const renderStepIndicator = () => (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
      {['Title', 'Topic', 'Genre', 'Platform', 'Sliders'].map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 600,
            background: i === step ? 'rgba(88,166,255,0.2)' : i < step ? 'rgba(63,185,80,0.2)' : 'rgba(255,255,255,0.05)',
            color: i === step ? '#58a6ff' : i < step ? '#3fb950' : '#484f58',
            border: `1px solid ${i === step ? '#58a6ff' : i < step ? '#3fb950' : 'rgba(255,255,255,0.08)'}`,
          }}>
            {i < step ? '\u2713' : i + 1}
          </div>
          <span style={{ fontSize: '12px', color: i === step ? '#e6edf3' : '#484f58' }}>{label}</span>
          {i < 4 && <span style={{ color: '#30363d', margin: '0 2px' }}>\u2014</span>}
        </div>
      ))}
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: step === 4 ? '700px' : '550px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e6edf3', marginBottom: '8px' }}>
          New Game
        </h2>
        {renderStepIndicator()}

        {/* Step 0: Title */}
        {step === 0 && (() => {
          const franchiseInfo = title.trim() ? franchiseTracker.getFranchiseInfo(title) : null;
          const sequelMod = title.trim() ? franchiseTracker.getSequelModifier(title, state.totalWeeks) : null;
          return (
          <div>
            <label style={{ fontSize: '13px', color: '#8b949e', display: 'block', marginBottom: '8px' }}>
              Game Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter a game title..."
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#e6edf3', fontSize: '15px', outline: 'none',
              }}
              autoFocus
            />
            {/* Sequel badge */}
            {franchiseInfo && sequelMod && (
              <div className="glass-card" style={{ padding: '12px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '11px', padding: '3px 8px', borderRadius: '4px',
                    background: 'rgba(218,124,255,0.15)', color: '#da7cff', fontWeight: 600,
                  }}>
                    SEQUEL
                  </span>
                  <span style={{ fontSize: '13px', color: '#e6edf3', fontWeight: 500 }}>
                    Entry #{sequelMod.nextEntry} in the {franchiseInfo.title} franchise
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#8b949e' }}>Modifier: </span>
                    <span style={{
                      fontWeight: 600,
                      color: sequelMod.multiplier >= 1.0 ? '#3fb950' : '#f85149',
                    }}>
                      x{sequelMod.multiplier.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#8b949e' }}>Brand: </span>
                    <span style={{ color: '#58a6ff' }}>{franchiseInfo.avgScore.toFixed(1)} avg</span>
                  </div>
                  <div>
                    <span style={{ color: '#8b949e' }}>Games: </span>
                    <span style={{ color: '#e6edf3' }}>{franchiseInfo.entryCount}</span>
                  </div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn-secondary" onClick={onCancel}>Cancel</button>
              <button className="btn-accent" onClick={() => setStep(1)}>Next</button>
            </div>
          </div>
          );
        })()}

        {/* Step 1: Topic */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', color: '#8b949e' }}>Choose Topic</label>
              <span style={{ fontSize: '11px', color: '#484f58' }}>
                Showing {unlockedTopics.length} of {totalTopics} topics
              </span>
            </div>
            <div className="selection-grid" style={{ maxHeight: '400px', overflowY: 'auto', padding: '2px' }}>
              {TOPICS.map(t => {
                const unlocked = isTopicUnlocked(t);
                return (
                  <div
                    key={t.name}
                    className={`selection-item ${topic === t.name ? 'selected' : ''}`}
                    onClick={() => unlocked && setTopic(t.name)}
                    style={{
                      opacity: unlocked ? 1 : 0.45,
                      cursor: unlocked ? 'pointer' : 'not-allowed',
                      position: 'relative',
                    }}
                    title={unlocked ? t.name : `Unlock: ${t.unlockRequirement}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{t.name}</span>
                      {!unlocked && (t.tier === 5 || t.tier === 6) && (state.researchPoints || 0) >= (t.rpCost || 10) && (
                        <button
                          className="btn-secondary"
                          style={{ fontSize: '10px', padding: '2px 6px', marginLeft: '4px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!engine.state || !engine.state.unlockedTopics) return;
                            if (engine.state.unlockedTopics.includes(t.name)) return; // prevent dupes
                            if ((engine.state.researchPoints || 0) < (t.rpCost || 10)) return;
                            engine.state.researchPoints -= (t.rpCost || 10);
                            engine.state.unlockedTopics.push(t.name);
                            engine._emit(); engine._save();
                          }}
                        >
                          Unlock ({t.rpCost || 10} RP)
                        </button>
                      )}
                    </div>
                    {!unlocked && (
                      <div style={{ fontSize: '10px', color: '#6e7681', marginTop: '2px', lineHeight: 1.2 }}>
                        {t.unlockRequirement}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button className="btn-secondary" onClick={() => setStep(0)}>Back</button>
              <button className="btn-accent" onClick={() => setStep(2)} disabled={!topic}>Next</button>
            </div>
          </div>
        )}

        {/* Step 2: Genre */}
        {step === 2 && (
          <div>
            <label style={{ fontSize: '13px', color: '#8b949e', display: 'block', marginBottom: '12px' }}>
              Choose Genre
              {topic && <span style={{ color: '#58a6ff' }}> (for {topic})</span>}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {GENRES.map(g => {
                const topicData = TOPICS.find(t => t.name === topic);
                const genreIdx = GENRES.indexOf(g);
                const compat = topicData ? getCompat(topicData.genreW[genreIdx]) : null;
                return (
                  <div
                    key={g}
                    className={`selection-item ${genre === g ? 'selected' : ''}`}
                    onClick={() => setGenre(g)}
                    style={{ padding: '14px', position: 'relative' }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{g}</div>
                    {showCompat && compat ? (
                      <div style={{ fontSize: '12px', color: compat.color, marginTop: '4px' }}>
                        {compat.label}
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#484f58' }}>???</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button className="btn-accent" onClick={() => setStep(3)} disabled={!genre}>Next</button>
            </div>
          </div>
        )}

        {/* Step 3: Platform + Audience + Size */}
        {step === 3 && (
          <div>
            {/* Audience */}
            <label style={{ fontSize: '13px', color: '#8b949e', display: 'block', marginBottom: '8px' }}>
              Target Audience
            </label>
            {audienceUnlocked ? (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {AUDIENCES.map(a => {
                  const topicData = TOPICS.find(t => t.name === topic);
                  const audIdx = AUDIENCES.indexOf(a);
                  const compat = topicData ? getCompat(topicData.audienceW[audIdx]) : null;
                  return (
                    <div
                      key={a}
                      className={`selection-item ${audience === a ? 'selected' : ''}`}
                      onClick={() => setAudience(a)}
                      style={{ flex: 1, padding: '12px' }}
                    >
                      <div style={{ fontWeight: 600 }}>{a}</div>
                      {showCompat && compat ? (
                        <div style={{ fontSize: '12px', color: compat.color }}>{compat.label}</div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#484f58' }}>???</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: '#8b949e', padding: '8px 0' }}>
                Audience targeting unlocks in Year 3. Default: Everyone.
              </div>
            )}

            {/* Game Size */}
            <label style={{ fontSize: '13px', color: '#8b949e', display: 'block', marginBottom: '8px' }}>
              Game Size
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {availableSizes.map(s => (
                <div
                  key={s}
                  className={`selection-item ${size === s ? 'selected' : ''}`}
                  onClick={() => setSize(s)}
                  style={{ flex: 1, padding: '12px' }}
                >
                  <div style={{ fontWeight: 600 }}>{s}</div>
                  <div style={{ fontSize: '11px', color: '#8b949e' }}>
                    {GAME_SIZES[s].devWeeks}w / ${(GAME_SIZES[s].cost / 1000).toFixed(0)}K
                  </div>
                </div>
              ))}
            </div>

            {/* Platform (multi-select, max 3) */}
            <label style={{ fontSize: '13px', color: '#8b949e', display: 'block', marginBottom: '4px' }}>
              Platforms <span style={{ color: '#484f58' }}>{canMultiPlatform ? '(select 1–3)' : '(select 1)'}</span>
            </label>
            {!canMultiPlatform && (
              <div style={{ fontSize: '11px', color: '#484f58', marginTop: '4px', marginBottom: '4px' }}>
                Multi-platform release unlocks at Large Office
              </div>
            )}
            {platformIds.length > 1 && (
              <div style={{ fontSize: '11px', color: '#d29922', marginBottom: '8px' }}>
                +{Math.round(50 * (platformIds.length - 1))}% dev time for {platformIds.length} platforms
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {availablePlatforms.map(p => {
                const genreIdx = GENRES.indexOf(genre);
                const compat = genreIdx >= 0 ? getCompat(p.genreW[genreIdx]) : null;
                const selected = platformIds.includes(p.id);
                const disabled = !selected && platformIds.length >= 3;
                return (
                  <div
                    key={p.id}
                    className={`selection-item ${selected ? 'selected' : ''}`}
                    onClick={() => !disabled && togglePlatform(p.id)}
                    style={{ padding: '10px', textAlign: 'left', opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {PLATFORM_ICONS[p.company] && (
                        <img src={PLATFORM_ICONS[p.company]} alt={p.company} style={{
                          width: '16px', height: '16px', opacity: 0.7,
                        }} />
                      )}
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{p.name}</div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#8b949e' }}>{p.company}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      {showCompat && compat ? (
                        <span style={{ fontSize: '11px', color: compat.color }}>{compat.label}</span>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#484f58' }}>???</span>
                      )}
                      <span style={{ fontSize: '11px', color: '#8b949e' }}>${(p.licenseFee/1000).toFixed(0)}K</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Engine Selection (if engines exist) */}
            {typeof engineBuilderSystem !== 'undefined' && engineBuilderSystem.getEngines().length > 0 && (
              <div style={{ marginBottom: '16px', marginTop: '16px' }}>
                <label style={{ fontSize: '13px', color: '#8b949e', display: 'block', marginBottom: '8px' }}>
                  Game Engine (Optional)
                </label>
                <select
                  value={selectedEngine || ''}
                  onChange={e => setSelectedEngine(e.target.value ? parseInt(e.target.value) : null)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#e6edf3', fontSize: '14px', outline: 'none',
                  }}
                >
                  <option value="">No Custom Engine</option>
                  {engineBuilderSystem.getEngines().map(eng => (
                    <option key={eng.id} value={eng.id}>
                      {eng.name} (Tech Lv{eng.techLevel}, +{Math.round((engineBuilderSystem.getEngineBonus(eng.id) - 1) * 100)}% quality)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
              <button className="btn-accent" onClick={() => setStep(4)} disabled={platformIds.length === 0}>Next</button>
            </div>
          </div>
        )}

        {/* Step 4: Phase 1 Slider Allocation (Phases 2 & 3 set during development) */}
        {step === 4 && (() => {
          const phase = DEV_PHASES[0];
          const importance = GENRE_IMPORTANCE[genre] || [0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5];

          const ASPECT_DESCRIPTIONS = {
            'Engine':       'Core tech foundation — physics, rendering pipeline, netcode',
            'Gameplay':     'Mechanics, controls, game feel — what makes it fun to play',
            'Story/Quests': 'Narrative, missions, quest design — player motivation & progression',
          };

          return (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', color: '#8b949e', display: 'block', marginBottom: '4px' }}>
                  Phase 1 — Foundation
                </label>
                <div style={{ fontSize: '12px', color: '#58a6ff', marginBottom: '4px' }}>
                  Allocate your team's focus. Total must equal 100%.
                </div>
                <div style={{ fontSize: '11px', color: '#484f58' }}>
                  Phases 2 & 3 will be configured during development.
                </div>
              </div>

              <div className="glass-card" style={{ padding: '16px', marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3', marginBottom: '4px' }}>
                  {phase.name} — Foundation
                </div>
                <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '14px' }}>
                  This phase builds the core engine, gameplay mechanics, and narrative framework.
                </div>
                {phase.aspects.map((aspect, ai) => {
                  const imp = importance[ai];
                  const impLabel = imp >= 0.9 ? 'Important' : imp <= 0.1 ? 'Restricted' : '';
                  const impColor = imp >= 0.9 ? '#3fb950' : imp <= 0.1 ? '#f85149' : '';
                  return (
                    <div key={ai} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <span style={{ fontSize: '13px', color: '#c9d1d9', fontWeight: 500 }}>{aspect}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {impLabel && (
                            <span style={{ fontSize: '11px', color: impColor, fontWeight: 500 }}>{impLabel}</span>
                          )}
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#58a6ff', minWidth: '32px', textAlign: 'right' }}>
                            {sliders[ai]}%
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: '#6e7681', marginBottom: '6px' }}>
                        {ASPECT_DESCRIPTIONS[aspect] || ''}
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="80"
                        value={sliders[ai]}
                        onChange={e => updateSlider(ai, parseInt(e.target.value))}
                      />
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                <button className="btn-secondary" onClick={() => setStep(3)}>Back</button>
                <button className="btn-accent" onClick={handleConfirm}>
                  Start Development
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
