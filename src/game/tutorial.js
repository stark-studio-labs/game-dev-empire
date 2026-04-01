/**
 * Tech Empire — Tutorial / Onboarding System
 * Step-by-step first-time player guide with spotlight overlay.
 */

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    message: "Welcome to Tech Empire! You're starting in a garage with $70K and a dream. Let's make your first game.",
    target: null,
    position: 'center',
  },
  {
    id: 'new_game',
    message: "Click 'Create New Game' to start developing your first title.",
    target: '.btn-accent',
    position: 'bottom',
  },
  {
    id: 'topic',
    message: "Pick a topic -- this affects what audience your game appeals to. Some topics work better with certain genres.",
    target: '.selection-grid',
    position: 'right',
  },
  {
    id: 'genre',
    message: "Choose a genre -- some genre + topic combos are golden. RPG + Fantasy? Chef's kiss. Casual + Military? Not so much.",
    target: '.selection-grid',
    position: 'right',
  },
  {
    id: 'sliders',
    message: "Set your development focus -- balance Design and Tech for your genre. Action games need more Tech; Adventure games need more Design.",
    target: null,
    position: 'center',
  },
  {
    id: 'dev_phases',
    message: "Watch your game develop through 3 phases. Use the speed controls to speed up or pause anytime.",
    target: '.speed-btn',
    position: 'bottom',
  },
  {
    id: 'reviews',
    message: "Review scores are in! Higher scores = more sales = more fans. Aim for 7+ to build momentum.",
    target: null,
    position: 'center',
  },
  {
    id: 'grow',
    message: "Use your profits to hire staff, research new tech, and grow your studio. Check the top bar icons for Market, Research, Morale, and Finance panels.",
    target: null,
    position: 'center',
  },
  {
    id: 'good_luck',
    message: "Good luck, CEO! Build your tech empire. Remember: great games need the right topic + genre combo, balanced sliders, and a talented team.",
    target: null,
    position: 'center',
  },
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
}

// Global instance
const tutorialSystem = new TutorialSystem();
