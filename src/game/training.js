/**
 * Tech Empire -- Staff Training System
 * 8 training courses that improve staff skills over time.
 * Requires Small Office (level 1+).
 */

const TRAINING_COURSES = [
  {
    id: 'design_bootcamp',
    name: 'Design Bootcamp',
    cost: 2000,
    durationWeeks: 4,
    statBoosts: { design: 15 },
    description: 'Intensive UI/UX and game design fundamentals',
    icon: '\uD83C\uDFA8',
  },
  {
    id: 'code_academy',
    name: 'Code Academy',
    cost: 2000,
    durationWeeks: 4,
    statBoosts: { tech: 15 },
    description: 'Advanced programming techniques and engine optimization',
    icon: '\uD83D\uDCBB',
  },
  {
    id: 'speed_workshop',
    name: 'Speed Workshop',
    cost: 1000,
    durationWeeks: 2,
    statBoosts: { speed: 10 },
    description: 'Agile methodology and rapid prototyping',
    icon: '\u26A1',
  },
  {
    id: 'research_methods',
    name: 'Research Methods',
    cost: 3000,
    durationWeeks: 6,
    statBoosts: { research: 20 },
    description: 'Data analysis and experimental design for game R&D',
    icon: '\uD83D\uDD2C',
  },
  {
    id: 'leadership_seminar',
    name: 'Leadership Seminar',
    cost: 5000,
    durationWeeks: 3,
    statBoosts: {},
    special: 'team_lead',
    description: 'Unlocks team lead bonus — boosts entire team productivity',
    icon: '\uD83D\uDC51',
  },
  {
    id: 'genre_mastery',
    name: 'Genre Mastery',
    cost: 4000,
    durationWeeks: 5,
    statBoosts: {},
    special: 'genre_specialty',
    description: 'Deep expertise in a chosen genre (+25 specialty)',
    icon: '\uD83C\uDFAF',
    requiresGenreChoice: true,
  },
  {
    id: 'conference',
    name: 'Conference Attendance',
    cost: 8000,
    durationWeeks: 1,
    statBoosts: { design: 5, tech: 5, speed: 5, research: 5 },
    special: 'networking',
    description: 'Industry conference — +5 all stats + networking event',
    icon: '\uD83C\uDF10',
  },
  {
    id: 'specialization',
    name: 'Specialization',
    cost: 10000,
    durationWeeks: 8,
    statBoosts: {},
    special: 'specialize',
    description: 'Extreme focus: +40 to one stat, -10 to all others',
    icon: '\uD83D\uDD25',
    requiresStatChoice: true,
  },
];

class TrainingSystem {
  constructor() {
    this.activeTraining = []; // [{ staffId, courseId, startWeek, endWeek, genreChoice?, statChoice? }]
    this.completedTraining = []; // history
  }

  /**
   * Enroll a staff member in a course.
   * @returns {{ success: boolean, error?: string }}
   */
  enroll(staffId, courseId, totalWeeks, options = {}) {
    const course = TRAINING_COURSES.find(c => c.id === courseId);
    if (!course) return { success: false, error: 'Unknown course' };

    // Check not already training
    if (this.isTraining(staffId)) {
      return { success: false, error: 'Staff member is already in training' };
    }

    const entry = {
      staffId,
      courseId,
      startWeek: totalWeeks,
      endWeek: totalWeeks + course.durationWeeks,
    };

    if (course.requiresGenreChoice) {
      if (!options.genreChoice) return { success: false, error: 'Genre choice required' };
      entry.genreChoice = options.genreChoice;
    }
    if (course.requiresStatChoice) {
      if (!options.statChoice) return { success: false, error: 'Stat choice required' };
      entry.statChoice = options.statChoice;
    }

    this.activeTraining.push(entry);
    return { success: true };
  }

  /** Check if a staff member is currently in training */
  isTraining(staffId) {
    return this.activeTraining.some(t => t.staffId === staffId);
  }

  /** Get training info for a staff member (or null) */
  getTrainingInfo(staffId) {
    return this.activeTraining.find(t => t.staffId === staffId) || null;
  }

  /** Get progress (0-100) for a training entry */
  getProgress(entry, totalWeeks) {
    const duration = entry.endWeek - entry.startWeek;
    const elapsed = totalWeeks - entry.startWeek;
    return Math.min(100, Math.round((elapsed / duration) * 100));
  }

  /**
   * Tick — check for completed training and apply boosts.
   * @returns {Array<{ staffId, courseId, courseName }>} completed this tick
   */
  tick(state) {
    const completed = [];
    const stillActive = [];

    for (const entry of this.activeTraining) {
      if (state.totalWeeks >= entry.endWeek) {
        // Training complete — apply boosts
        const course = TRAINING_COURSES.find(c => c.id === entry.courseId);
        const staff = state.staff.find(s => s.id === entry.staffId);
        if (course && staff) {
          this._applyBoosts(staff, course, entry);
          completed.push({ staffId: entry.staffId, courseId: entry.courseId, courseName: course.name });
          this.completedTraining.push({
            staffId: entry.staffId,
            staffName: staff.name,
            courseId: entry.courseId,
            courseName: course.name,
            completedWeek: state.totalWeeks,
          });
        }
      } else {
        stillActive.push(entry);
      }
    }

    this.activeTraining = stillActive;
    return completed;
  }

  /** Apply stat boosts from a completed course */
  _applyBoosts(staff, course, entry) {
    // Standard stat boosts
    for (const [stat, amount] of Object.entries(course.statBoosts)) {
      if (staff[stat] !== undefined) {
        staff[stat] += amount;
      }
    }

    // Special effects
    if (course.special === 'team_lead') {
      staff.isTeamLead = true;
    }

    if (course.special === 'genre_specialty') {
      if (!staff.genreSpecialties) staff.genreSpecialties = {};
      staff.genreSpecialties[entry.genreChoice] = (staff.genreSpecialties[entry.genreChoice] || 0) + 25;
    }

    if (course.special === 'networking') {
      staff.hasNetworked = true;
    }

    if (course.special === 'specialize') {
      const chosenStat = entry.statChoice;
      const allStats = ['design', 'tech', 'speed', 'research'];
      for (const stat of allStats) {
        if (stat === chosenStat) {
          staff[stat] += 40;
        } else {
          staff[stat] = Math.max(1, staff[stat] - 10);
        }
      }
    }
  }

  /** Get all training courses */
  getCourses() {
    return TRAINING_COURSES;
  }

  /** Get active training entries */
  getActiveTraining() {
    return this.activeTraining;
  }

  /** Get completed training history */
  getHistory() {
    return this.completedTraining;
  }

  /** Project stats after training completes */
  projectStats(staff, courseId, options = {}) {
    const course = TRAINING_COURSES.find(c => c.id === courseId);
    if (!course) return null;

    const projected = {
      design: staff.design,
      tech: staff.tech,
      speed: staff.speed,
      research: staff.research,
    };

    for (const [stat, amount] of Object.entries(course.statBoosts)) {
      if (projected[stat] !== undefined) {
        projected[stat] += amount;
      }
    }

    if (course.special === 'specialize' && options.statChoice) {
      const allStats = ['design', 'tech', 'speed', 'research'];
      for (const stat of allStats) {
        if (stat === options.statChoice) {
          projected[stat] += 40;
        } else {
          projected[stat] = Math.max(1, projected[stat] - 10);
        }
      }
    }

    return projected;
  }

  serialize() {
    return {
      activeTraining: this.activeTraining,
      completedTraining: this.completedTraining,
    };
  }

  deserialize(data) {
    if (!data) return;
    this.activeTraining = data.activeTraining || [];
    this.completedTraining = data.completedTraining || [];
  }

  reset() {
    this.activeTraining = [];
    this.completedTraining = [];
  }
}

// Global instance
const trainingSystem = new TrainingSystem();
