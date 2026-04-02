/**
 * SettingsPanel — Difficulty, autosave frequency, sound toggle, default speed, tutorial reset.
 * Reads/writes to settingsSystem (localStorage, independent of save file).
 */
function SettingsPanel({ onClose }) {
  const [difficulty, setDifficulty] = React.useState(settingsSystem.difficulty);
  const [autosaveFreq, setAutosaveFreq] = React.useState(settingsSystem.autosaveFreq);
  const [soundEnabled, setSoundEnabled] = React.useState(settingsSystem.soundEnabled);
  const [musicVolume, setMusicVolume] = React.useState(typeof audioManager !== 'undefined' ? audioManager.getMusicVolume() : 0.3);
  const [sfxVolume, setSfxVolume] = React.useState(typeof audioManager !== 'undefined' ? audioManager.getSFXVolume() : 0.5);
  const [defaultSpeed, setDefaultSpeed] = React.useState(settingsSystem.defaultSpeed);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const handleSave = () => {
    settingsSystem.setDifficulty(difficulty);
    settingsSystem.setAutosaveFreq(autosaveFreq);
    settingsSystem.setSoundEnabled(soundEnabled);
    if (typeof audioManager !== 'undefined') {
      audioManager.setMusicVolume(musicVolume);
      audioManager.setSFXVolume(sfxVolume);
    }
    settingsSystem.setDefaultSpeed(defaultSpeed);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleResetTutorial = () => {
    localStorage.removeItem('techEmpire_tutorialComplete');
    if (typeof tutorialSystem !== 'undefined') {
      tutorialSystem.step = 0;
      tutorialSystem.completed = false;
    }
    onClose();
  };

  const difficultyOptions = [
    { value: 'Casual',   label: 'Casual',   desc: 'x1.5 revenue, no bankruptcy', color: '#3fb950' },
    { value: 'Standard', label: 'Standard', desc: 'x1.0 revenue, 12-week buffer', color: '#58a6ff' },
    { value: 'Hardcore', label: 'Hardcore', desc: 'x0.7 revenue, 6-week buffer',  color: '#f85149' },
  ];

  const autosaveOptions = [
    { value: 2, label: 'Every 2 weeks' },
    { value: 4, label: 'Every 4 weeks' },
    { value: 8, label: 'Every 8 weeks' },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '440px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e6edf3', margin: 0 }}>Settings</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '20px', cursor: 'pointer', padding: '4px 8px', lineHeight: 1 }}
          >
            x
          </button>
        </div>

        {/* Difficulty */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', color: '#8b949e', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Difficulty
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {difficultyOptions.map(opt => (
              <div
                key={opt.value}
                className={`selection-item ${difficulty === opt.value ? 'selected' : ''}`}
                onClick={() => setDifficulty(opt.value)}
                style={{ flex: 1, padding: '12px', border: difficulty === opt.value ? `1px solid ${opt.color}` : '1px solid rgba(255,255,255,0.08)' }}
              >
                <div style={{ fontWeight: 600, fontSize: '13px', color: difficulty === opt.value ? opt.color : '#e6edf3' }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: '10px', color: '#8b949e', marginTop: '4px' }}>{opt.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Autosave frequency */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', color: '#8b949e', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Autosave Frequency
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {autosaveOptions.map(opt => (
              <div
                key={opt.value}
                className={`selection-item ${autosaveFreq === opt.value ? 'selected' : ''}`}
                onClick={() => setAutosaveFreq(opt.value)}
                style={{ flex: 1, padding: '10px', textAlign: 'center' }}
              >
                <div style={{ fontSize: '12px', fontWeight: 500 }}>{opt.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Default speed */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', color: '#8b949e', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Default Speed
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 4].map(spd => (
              <div
                key={spd}
                className={`selection-item ${defaultSpeed === spd ? 'selected' : ''}`}
                onClick={() => setDefaultSpeed(spd)}
                style={{ flex: 1, padding: '10px', textAlign: 'center' }}
              >
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{spd}x</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sound toggle */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '13px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Sound
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
            <div
              onClick={() => setSoundEnabled(v => !v)}
              style={{
                width: '44px', height: '24px', borderRadius: '12px',
                background: soundEnabled ? 'rgba(63,185,80,0.4)' : 'rgba(255,255,255,0.1)',
                border: `1px solid ${soundEnabled ? '#3fb950' : 'rgba(255,255,255,0.15)'}`,
                cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
              }}
            >
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%',
                background: soundEnabled ? '#3fb950' : '#484f58',
                position: 'absolute', top: '2px',
                left: soundEnabled ? '22px' : '2px',
                transition: 'left 0.2s',
              }} />
            </div>
            <span style={{ fontSize: '13px', color: '#c9d1d9' }}>{soundEnabled ? 'On' : 'Off'}</span>
          </div>

          {/* Volume sliders */}
          {soundEnabled && (
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: '#8b949e' }}>Music Volume</span>
                  <span style={{ color: '#c9d1d9' }}>{Math.round(musicVolume * 100)}%</span>
                </div>
                <input
                  type="range" min="0" max="100"
                  value={Math.round(musicVolume * 100)}
                  onChange={e => {
                    const v = parseInt(e.target.value) / 100;
                    setMusicVolume(v);
                    if (typeof audioManager !== 'undefined') audioManager.setMusicVolume(v);
                  }}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: '#8b949e' }}>SFX Volume</span>
                  <span style={{ color: '#c9d1d9' }}>{Math.round(sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range" min="0" max="100"
                  value={Math.round(sfxVolume * 100)}
                  onChange={e => {
                    const v = parseInt(e.target.value) / 100;
                    setSfxVolume(v);
                    if (typeof audioManager !== 'undefined') audioManager.setSFXVolume(v);
                  }}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-secondary"
            onClick={handleResetTutorial}
            style={{ fontSize: '12px', color: '#8b949e' }}
          >
            Reset Tutorial
          </button>
          <button
            className="btn-secondary"
            onClick={onClose}
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            className="btn-accent"
            onClick={handleSave}
            style={{ flex: 1 }}
          >
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
