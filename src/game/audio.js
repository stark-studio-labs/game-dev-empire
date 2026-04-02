/**
 * Tech Empire — Audio Manager
 * Simple audio system for SFX and background music.
 * Respects settingsSystem.soundEnabled toggle.
 */

const audioManager = {
  _music: null,
  _sfxCache: {},
  _musicVolume: 0.3,
  _sfxVolume: 0.5,
  _musicFiles: [
    '../../assets/audio/music/ambient-office-loop-1.wav',
    '../../assets/audio/music/ambient-office-loop-2.wav',
    '../../assets/audio/music/ambient-office-loop-3.wav',
  ],

  /** Play a one-shot sound effect by name (maps to assets/audio/sfx/{name}.wav) */
  playSFX(name) {
    if (typeof settingsSystem !== 'undefined' && !settingsSystem.soundEnabled) return;
    try {
      const path = `../../assets/audio/sfx/${name}.wav`;
      // Reuse cached Audio elements for rapid replay
      if (!this._sfxCache[name]) {
        this._sfxCache[name] = new Audio(path);
      }
      const sfx = this._sfxCache[name].cloneNode();
      sfx.volume = this._sfxVolume;
      sfx.play().catch(() => {});
    } catch (e) { /* ignore audio errors */ }
  },

  /** Start background music — picks a random ambient loop and loops it */
  playMusic() {
    if (typeof settingsSystem !== 'undefined' && !settingsSystem.soundEnabled) return;
    this.stopMusic();
    try {
      const idx = Math.floor(Math.random() * this._musicFiles.length);
      this._music = new Audio(this._musicFiles[idx]);
      this._music.volume = this._musicVolume;
      this._music.loop = true;
      this._music.play().catch(() => {});
    } catch (e) { /* ignore audio errors */ }
  },

  /** Stop background music */
  stopMusic() {
    if (this._music) {
      try {
        this._music.pause();
        this._music.currentTime = 0;
      } catch (e) { /* ignore */ }
      this._music = null;
    }
  },

  /** Set music volume (0.0 - 1.0) */
  setMusicVolume(v) {
    this._musicVolume = Math.max(0, Math.min(1, v));
    if (this._music) {
      this._music.volume = this._musicVolume;
    }
  },

  /** Set SFX volume (0.0 - 1.0) */
  setSFXVolume(v) {
    this._sfxVolume = Math.max(0, Math.min(1, v));
  },

  /** Get current volumes */
  getMusicVolume() { return this._musicVolume; },
  getSFXVolume() { return this._sfxVolume; },
};
