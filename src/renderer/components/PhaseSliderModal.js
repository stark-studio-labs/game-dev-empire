/**
 * PhaseSliderModal — Shown between development phases (GDT-style).
 * Player adjusts the 3 aspect sliders for the upcoming phase, then resumes.
 */
function PhaseSliderModal({ state, onSubmit }) {
  const phaseIdx = state.nextPhaseIndex;
  const phase = DEV_PHASES[phaseIdx];
  const [sliders, setSliders] = React.useState([33, 33, 33]);

  if (!phase) return null;

  const genre = state.currentGame ? state.currentGame.genre : null;
  const importance = genre ? (GENRE_IMPORTANCE[genre] || [0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5]) : [];

  const PHASE_CONTEXT = {
    1: {
      subtitle: 'Content & Detail',
      description: 'This phase focuses on dialogue writing, level construction, and AI behavior. Detail work that brings the world to life.',
    },
    2: {
      subtitle: 'Polish & Presentation',
      description: 'This phase covers the game world, visual fidelity, and audio design. The final layer of polish before release.',
    },
  };

  const ASPECT_DESCRIPTIONS = {
    'Dialogues':    'Writing quality, character voice, branching conversations',
    'Level Design': 'Map layout, encounter pacing, environmental storytelling',
    'AI':           'Enemy behavior, NPC intelligence, pathfinding, difficulty scaling',
    'World Design': 'Open world scope, explorable areas, environmental detail',
    'Graphics':     'Visual fidelity, art style, particle effects, animation quality',
    'Sound':        'Music, sound effects, ambient audio, voice acting',
  };

  const ctx = PHASE_CONTEXT[phaseIdx] || { subtitle: '', description: '' };

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

  const handleSubmit = () => {
    onSubmit(sliders);
  };

  // Progress visualization: how far along development is
  const overallProgress = ((phaseIdx) / 3 * 100).toFixed(0);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '550px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
            background: 'rgba(88,166,255,0.15)', border: '1px solid rgba(88,166,255,0.3)',
            fontSize: '11px', fontWeight: 600, color: '#58a6ff',
            textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px',
          }}>
            Phase {phaseIdx} Complete
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e6edf3', marginBottom: '4px' }}>
            {phase.name} — {ctx.subtitle}
          </h2>
          <div style={{ fontSize: '13px', color: '#8b949e' }}>
            {state.currentGame ? `"${state.currentGame.title}"` : 'Your game'}
          </div>
        </div>

        {/* Overall progress bar */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>
            <span>Development Progress</span>
            <span>{overallProgress}%</span>
          </div>
          <div className="progress-bar" style={{ height: '6px' }}>
            <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>

        {/* Phase context */}
        <div style={{
          padding: '12px 16px', borderRadius: '8px',
          background: 'rgba(88,166,255,0.06)', border: '1px solid rgba(88,166,255,0.12)',
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '12px', color: '#58a6ff', fontWeight: 500, marginBottom: '4px' }}>
            Allocate your team's focus. Total must equal 100%.
          </div>
          <div style={{ fontSize: '12px', color: '#8b949e' }}>
            {ctx.description}
          </div>
        </div>

        {/* Sliders */}
        <div className="glass-card" style={{ padding: '16px', marginBottom: '20px' }}>
          {phase.aspects.map((aspect, ai) => {
            const globalIdx = phaseIdx * 3 + ai;
            const imp = importance[globalIdx];
            const showHints = state.games && state.games.length >= 3;
            const impLabel = showHints ? (imp >= 0.9 ? 'Important' : imp <= 0.1 ? 'Restricted' : '') : '';
            const impColor = showHints ? (imp >= 0.9 ? '#3fb950' : imp <= 0.1 ? '#f85149' : '') : '';
            return (
              <div key={ai} style={{ marginBottom: ai < 2 ? '14px' : '0' }}>
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

        {/* Submit */}
        <div style={{ textAlign: 'center' }}>
          <button className="btn-accent" onClick={handleSubmit} style={{ padding: '12px 32px', fontSize: '15px' }}>
            Continue Development
          </button>
        </div>
      </div>
    </div>
  );
}
