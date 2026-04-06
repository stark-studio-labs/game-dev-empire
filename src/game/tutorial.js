/**
 * Tech Empire — Tutorial / Onboarding System
 * Step-by-step first-time player guide with spotlight overlay.
 */

const TUTORIAL_STEPS = [
  { id: 'welcome', message: 'Welcome to Tech Empire! You\'re about to build a game development studio from scratch. Let\'s make your first game together.', target: null, position: 'center' },
  { id: 'pick_avatar', message: 'First, choose an avatar that represents you as CEO.', target: null, position: 'center' },
  { id: 'name_studio', message: 'Name your studio. This is your brand — make it memorable!', target: 'input[type="text"]', position: 'bottom' },
  { id: 'start_game', message: 'Click "New Game" to start your first project. In the early days, you do everything yourself.', target: '.btn-accent', position: 'bottom' },
  { id: 'pick_title', message: 'Give your game a title. Something catchy!', target: 'input[type="text"]', position: 'bottom' },
  { id: 'pick_topic', message: 'Choose a topic for your game. Start with something familiar — you\'ll unlock more topics as you grow.', target: null, position: 'center' },
  { id: 'pick_genre', message: 'Now pick a genre. Some topics work better with certain genres — you\'ll discover the best combinations through experience.', target: null, position: 'center' },
  { id: 'pick_platform', message: 'Select a platform to release on. Each platform has different audiences and market conditions.', target: null, position: 'center' },
  { id: 'explain_sliders', message: 'These sliders control where your team focuses during development. Each game genre has different priorities — experiment to find what works!', target: null, position: 'center' },
  { id: 'watch_dev', message: 'Development is underway! Watch the Design and Tech bubbles appear as your team works. Use the speed controls to fast-forward.', target: null, position: 'bottom' },
  { id: 'phase_break', message: 'Between phases, you can adjust your focus. Try different allocations to see what produces the best results.', target: null, position: 'center' },
  { id: 'reviews', message: 'Your game is done! Four critics will review it. Early games usually score 4-7 — don\'t worry, you\'ll improve with experience.', target: null, position: 'center' },
  { id: 'game_report', message: 'This research report shows what worked and what didn\'t. Pay attention — these insights will help you make better games.', target: null, position: 'center' },
  { id: 'growing', message: 'Great start! As you ship more games, you\'ll unlock new topics, features, and business opportunities. Hire staff to grow your studio.', target: null, position: 'center' },
  { id: 'good_luck', message: 'You\'re on your own now! Press ? anytime for keyboard shortcuts. Good luck building your empire!', target: null, position: 'center' },
];

/**
 * TutorialSystem — manages tutorial state, step progression
 */
class TutorialSystem {
  constructor() {
    this.currentStep = 0;
    this.active = false;
    this.completed = false;
    this.listeners = [];
  }

  /** Subscribe to tutorial state changes */
  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  _emit() {
    this.listeners.forEach(fn => fn({
      active: this.active,
      currentStep: this.currentStep,
      totalSteps: TUTORIAL_STEPS.length,
      step: this.active ? TUTORIAL_STEPS[this.currentStep] : null,
      completed: this.completed,
    }));
  }

  /** Check if this is a first-time player and auto-start */
  checkFirstTime() {
    const done = localStorage.getItem('techEmpire_tutorialComplete');
    if (!done) {
      this.start();
      return true;
    }
    this.completed = true;
    return false;
  }

  /** Start the tutorial */
  start() {
    this.currentStep = 0;
    this.active = true;
    this.completed = false;
    this._emit();
  }

  /** Advance to next step */
  next() {
    if (!this.active) return;
    this.currentStep++;
    if (this.currentStep >= TUTORIAL_STEPS.length) {
      this.finish();
    } else {
      this._emit();
    }
  }

  /** Skip the tutorial entirely */
  skip(dontShowAgain) {
    this.active = false;
    if (dontShowAgain) {
      this.completed = true;
      localStorage.setItem('techEmpire_tutorialComplete', 'true');
    }
    this._emit();
  }

  /** Finish the tutorial (completed all steps) */
  finish() {
    this.active = false;
    this.completed = true;
    localStorage.setItem('techEmpire_tutorialComplete', 'true');
    this._emit();
  }

  /** Replay from settings */
  replay() {
    localStorage.removeItem('techEmpire_tutorialComplete');
    this.completed = false;
    this.start();
  }

  /** Get current step data */
  getCurrentStep() {
    if (!this.active || this.currentStep >= TUTORIAL_STEPS.length) return null;
    return TUTORIAL_STEPS[this.currentStep];
  }

  /** Get progress fraction */
  getProgress() {
    return {
      current: this.currentStep + 1,
      total: TUTORIAL_STEPS.length,
    };
  }

  /** Check if tutorial is currently active */
  isActive() { return this.active; }
}

// Global instance
const tutorialSystem = new TutorialSystem();
