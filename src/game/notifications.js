/**
 * Tech Empire — Notification Center
 * Central notification manager with typed notifications,
 * milestones, and auto-generated alerts.
 */

const NOTIFICATION_TYPES = {
  info:      { color: '#58a6ff', icon: 'i',  label: 'Info' },
  success:   { color: '#3fb950', icon: '+',  label: 'Success' },
  warning:   { color: '#d29922', icon: '!',  label: 'Warning' },
  error:     { color: '#f85149', icon: 'x',  label: 'Error' },
  event:     { color: '#da7cff', icon: '*',  label: 'Event' },
  milestone: { color: '#f0c674', icon: '#',  label: 'Milestone' },
};

const MILESTONES = [
  { id: 'first_game',    check: (s) => s.games.length >= 1,                         title: 'First Game!',          message: 'You released your very first game. The journey begins!' },
  { id: 'first_hit',     check: (s) => s.games.some(g => g.reviewAvg >= 8),         title: 'First Hit!',           message: 'One of your games scored 8+ from critics. You\'re on the map!' },
  { id: 'first_perfect', check: (s) => s.games.some(g => g.reviewAvg >= 10),        title: 'Perfect 10!',          message: 'A perfect score! You\'ve achieved gaming greatness!' },
  { id: 'cash_1m',       check: (s) => s.cash >= 1000000,                           title: 'Millionaire!',         message: 'Your studio has $1M in the bank. Not bad for a garage startup!' },
  { id: 'cash_10m',      check: (s) => s.cash >= 10000000,                          title: 'Multimillionaire!',    message: '$10M in cash reserves. You\'re building an empire!' },
  { id: 'cash_100m',     check: (s) => s.cash >= 100000000,                         title: 'Hundred Millionaire!', message: '$100M! You\'re one of the biggest studios in the world.' },
  { id: 'games_10',      check: (s) => s.games.length >= 10,                        title: '10 Games Released!',   message: 'A decade of games. You\'re a veteran studio now.' },
  { id: 'games_50',      check: (s) => s.games.length >= 50,                        title: '50 Games Released!',   message: '50 titles in your catalog. That\'s a serious portfolio!' },
  { id: 'fans_100k',     check: (s) => s.fans >= 100000,                            title: '100K Fans!',           message: '100,000 fans! Your community is thriving.' },
  { id: 'fans_1m',       check: (s) => s.fans >= 1000000,                           title: '1 Million Fans!',      message: 'A million fans worldwide. You\'re a household name!' },
];

/**
 * NotificationManager — stores notifications, checks milestones,
 * auto-generates alerts for game events.
 */
class NotificationManager {
  constructor() {
    this.notifications = [];
    this.unreadCount = 0;
    this.achievedMilestones = {};  // milestoneId -> true
    this.listeners = [];
    this._nextId = 1;
    this.MAX_NOTIFICATIONS = 100;
  }

  /** Subscribe to notification changes */
  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  _emit() {
    this.listeners.forEach(fn => fn({
      notifications: [...this.notifications],
      unreadCount: this.unreadCount,
    }));
  }

  /**
   * Add a notification.
   * @param {string} type - info|success|warning|error|event|milestone
   * @param {string} title
   * @param {string} message
   * @param {object} state - current game state for timestamp
   */
  add(type, title, message, state) {
    const notification = {
      id: this._nextId++,
      type: type || 'info',
      title,
      message,
      time: state ? `Y${state.year} M${state.month} W${state.week}` : '',
      timestamp: Date.now(),
      read: false,
    };

    this.notifications.push(notification);
    this.unreadCount++;

    // Trim to max
    if (this.notifications.length > this.MAX_NOTIFICATIONS) {
      const removed = this.notifications.splice(0, this.notifications.length - this.MAX_NOTIFICATIONS);
      // Adjust unread count for any unread removed notifications
      const unreadRemoved = removed.filter(n => !n.read).length;
      this.unreadCount = Math.max(0, this.unreadCount - unreadRemoved);
    }

    this._emit();
    return notification;
  }

  /** Mark a single notification as read */
  markRead(id) {
    const n = this.notifications.find(n => n.id === id);
    if (n && !n.read) {
      n.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this._emit();
    }
  }

  /** Mark all notifications as read */
  markAllRead() {
    this.notifications.forEach(n => { n.read = true; });
    this.unreadCount = 0;
    this._emit();
  }

  /** Clear all notifications */
  clearAll() {
    this.notifications = [];
    this.unreadCount = 0;
    this._emit();
  }

  /** Get notifications (newest first) */
  getAll() {
    return [...this.notifications].reverse();
  }

  // ── Auto-generation hooks ──────────────────────────────────────

  /** Called when a game is released */
  onGameRelease(game, state) {
    const scoreColor = game.reviewAvg >= 9 ? 'success' : game.reviewAvg >= 7 ? 'info' : game.reviewAvg >= 5 ? 'warning' : 'error';
    this.add(scoreColor, 'Game Released!',
      `"${game.title}" scored ${game.reviewAvg.toFixed(1)}/10 — Expected revenue: $${this._formatNum(game.totalRevenue)}`,
      state
    );
  }

  /** Called when review scores come in */
  onReviewScores(game, state) {
    if (game.reviewAvg >= 9) {
      this.add('success', 'Critical Acclaim!',
        `"${game.title}" is a hit! Critics are raving with a ${game.reviewAvg.toFixed(1)} average.`,
        state
      );
    } else if (game.reviewAvg < 4) {
      this.add('error', 'Poor Reviews',
        `"${game.title}" bombed with critics. ${game.reviewAvg.toFixed(1)} average score.`,
        state
      );
    }
  }

  /** Called when staff is hired */
  onStaffHired(staffName, state) {
    this.add('success', 'New Hire!', `${staffName} has joined the team.`, state);
  }

  /** Called when staff is fired */
  onStaffFired(staffName, state) {
    this.add('warning', 'Staff Departure', `${staffName} has left the company.`, state);
  }

  /** Called when office is upgraded */
  onOfficeUpgrade(officeName, state) {
    this.add('success', 'Office Upgraded!', `Welcome to your new ${officeName}!`, state);
  }

  /** Called when research completes */
  onResearchComplete(researchName, state) {
    this.add('success', 'Research Complete!', `${researchName} is now available.`, state);
  }

  /** Called when a market shift occurs */
  onMarketShift(label, state) {
    this.add('event', 'Market Shift', `The market is now ${label}.`, state);
  }

  /** Called when tax/rent is due */
  onExpenseDue(amount, description, state) {
    if (amount > 10000) {
      this.add('warning', 'Major Expense', `${description}: -$${this._formatNum(amount)}`, state);
    }
  }

  /**
   * Check all milestones against current state.
   * Called each tick or on significant events.
   */
  checkMilestones(state) {
    for (const milestone of MILESTONES) {
      if (!this.achievedMilestones[milestone.id]) {
        try {
          if (milestone.check(state)) {
            this.achievedMilestones[milestone.id] = true;
            this.add('milestone', milestone.title, milestone.message, state);
          }
        } catch (e) {
          // Ignore check errors
        }
      }
    }
  }

  // ── Serialization ──────────────────────────────────────────────

  serialize() {
    return {
      notifications: this.notifications,
      unreadCount: this.unreadCount,
      achievedMilestones: { ...this.achievedMilestones },
      _nextId: this._nextId,
    };
  }

  deserialize(data) {
    if (!data) return;
    this.notifications = data.notifications || [];
    this.unreadCount = data.unreadCount || 0;
    this.achievedMilestones = data.achievedMilestones || {};
    this._nextId = data._nextId || 1;
  }

  reset() {
    this.notifications = [];
    this.unreadCount = 0;
    this.achievedMilestones = {};
    this._nextId = 1;
    this._emit();
  }

  _formatNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return n.toString();
  }
}

// Global instance
const notificationManager = new NotificationManager();
