/**
 * Tech Empire — Settings System
 * Difficulty, autosave frequency, sound toggle, default speed.
 * Persisted to localStorage independently of the save file.
 */
class SettingsSystem {
  constructor() {
    this.difficulty = 'Standard'; // 'Casual' | 'Standard' | 'Hardcore'
    this.autosaveFreq = 4;        // weeks: 2, 4, or 8
    this.soundEnabled = true;
    this.defaultSpeed = 1;        // 1, 2, 4
    this._load();
  }

  _load() {
    try {
      const saved = localStorage.getItem('techEmpire_settings');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.difficulty)               this.difficulty    = d.difficulty;
        if (d.autosaveFreq)             this.autosaveFreq  = d.autosaveFreq;
        if (d.soundEnabled !== undefined) this.soundEnabled = d.soundEnabled;
        if (d.defaultSpeed)             this.defaultSpeed  = d.defaultSpeed;
      }
    } catch (e) { /* ignore */ }
  }

  _save() {
    localStorage.setItem('techEmpire_settings', JSON.stringify({
      difficulty:   this.difficulty,
      autosaveFreq: this.autosaveFreq,
      soundEnabled: this.soundEnabled,
      defaultSpeed: this.defaultSpeed,
    }));
  }

  setDifficulty(d)   { this.difficulty   = d; this._save(); }
  setAutosaveFreq(f) { this.autosaveFreq = f; this._save(); }
  setSoundEnabled(v) { this.soundEnabled = v; this._save(); }
  setDefaultSpeed(s) { this.defaultSpeed = s; this._save(); }

  /** Revenue multiplier applied to every game release. */
  getRevenueMultiplier() {
    return { Casual: 1.5, Standard: 1.0, Hardcore: 0.7 }[this.difficulty] || 1.0;
  }

  /** Consecutive negative weeks before bankruptcy (Infinity = disabled). */
  getBankruptcyWeeks() {
    if (this.difficulty === 'Casual')   return Infinity;
    if (this.difficulty === 'Hardcore') return 6;
    return 12;
  }
}

// Global instance — loaded at startup
const settingsSystem = new SettingsSystem();
