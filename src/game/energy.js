/**
 * Tech Empire -- Staff Energy & Fatigue System
 * Each staff member has energy (0-100) that drains during development
 * and recovers during idle time. Low energy reduces productivity.
 */

class EnergySystem {
  constructor() {
    // energy stored per staff id: { [staffId]: { energy, onVacation, vacationWeeksLeft } }
    this.staffEnergy = {};
    this.sickStaff = {}; // { [staffId]: weeksLeft }
  }

  /** Ensure a staff member has an energy record */
  _ensure(staffId) {
    if (!this.staffEnergy[staffId]) {
      this.staffEnergy[staffId] = {
        energy: 100,
        onVacation: false,
        vacationWeeksLeft: 0,
      };
    }
    return this.staffEnergy[staffId];
  }

  /** Get energy for a staff member (0-100) */
  getEnergy(staffId) {
    return Math.round(this._ensure(staffId).energy);
  }

  /** Check if staff member is on vacation */
  isOnVacation(staffId) {
    return this._ensure(staffId).onVacation;
  }

  /** Check if staff member is sick */
  isSick(staffId) {
    return (this.sickStaff[staffId] || 0) > 0;
  }

  /** Get productivity multiplier based on energy */
  getProductivityMultiplier(staffId) {
    const record = this._ensure(staffId);
    if (record.onVacation) return 0;
    if (this.isSick(staffId)) return 0;
    // Gradual curve: 0.5 at energy=0, 1.0 at energy=100
    return 0.5 + (record.energy / 100) * 0.5;
  }

  /** Get the energy status color */
  getEnergyColor(energy) {
    if (energy >= 60) return '#3fb950'; // green
    if (energy >= 30) return '#d29922'; // yellow
    return '#f85149'; // red
  }

  /** Get energy status label */
  getEnergyStatus(staffId) {
    const energy = this.getEnergy(staffId);
    if (this.isOnVacation(staffId)) return { label: 'On Vacation', color: '#58a6ff' };
    if (this.isSick(staffId)) return { label: 'Sick', color: '#f85149' };
    if (energy >= 80) return { label: 'Energized', color: '#3fb950' };
    if (energy >= 60) return { label: 'Good', color: '#56d364' };
    if (energy >= 30) return { label: 'Tired', color: '#d29922' };
    if (energy > 0) return { label: 'Exhausted', color: '#f85149' };
    return { label: 'Burned Out', color: '#da3633' };
  }

  /**
   * Weekly tick -- called once per game week.
   * @param {Array} staff - array of staff member objects
   * @param {boolean} isDeveloping - true if a game is currently in development
   * @param {boolean} isCrunching - reserved for future crunch mechanic
   */
  weeklyTick(staff, isDeveloping, isCrunching) {
    const events = []; // Return events for engine notifications

    for (const member of staff) {
      const record = this._ensure(member.id);

      // Process vacation countdown
      if (record.onVacation) {
        record.vacationWeeksLeft--;
        if (record.vacationWeeksLeft <= 0) {
          record.onVacation = false;
          record.energy = 100; // Fully restored
          events.push({ type: 'vacation_return', staffId: member.id, name: member.name });
        }
        continue;
      }

      // Process sick leave countdown
      if (this.sickStaff[member.id] && this.sickStaff[member.id] > 0) {
        this.sickStaff[member.id]--;
        if (this.sickStaff[member.id] <= 0) {
          delete this.sickStaff[member.id];
          record.energy = 20; // Comes back with some energy
          events.push({ type: 'sick_return', staffId: member.id, name: member.name });
        }
        continue;
      }

      // Energy drain / recovery
      if (isDeveloping) {
        const drain = isCrunching ? 4 : 2;
        record.energy = Math.max(0, record.energy - drain);

        // Zero energy = calls in sick
        if (record.energy <= 0) {
          this.sickStaff[member.id] = 1; // 1 week sick leave
          events.push({ type: 'sick', staffId: member.id, name: member.name });
        }
      } else {
        // Idle recovery
        record.energy = Math.min(100, record.energy + 5);
      }
    }

    return events;
  }

  /**
   * Send a staff member on vacation.
   * @param {string} staffId
   * @returns {boolean} true if vacation started
   */
  sendOnVacation(staffId) {
    const record = this._ensure(staffId);
    if (record.onVacation) return false;
    if (this.isSick(staffId)) return false;

    record.onVacation = true;
    record.vacationWeeksLeft = 1;
    return true;
  }

  /** Get drain rate description for tooltip */
  getDrainInfo(staffId, isDeveloping, isCrunching) {
    if (this.isOnVacation(staffId)) return 'Recovering on vacation';
    if (this.isSick(staffId)) return 'Out sick - returns next week';
    if (isDeveloping) {
      const rate = isCrunching ? 4 : 2;
      return `-${rate}/week (developing${isCrunching ? ', crunch' : ''})`;
    }
    return '+5/week (idle recovery)';
  }

  /** Remove staff member from tracking */
  removeStaff(staffId) {
    delete this.staffEnergy[staffId];
    delete this.sickStaff[staffId];
  }

  serialize() {
    return {
      staffEnergy: this.staffEnergy,
      sickStaff: this.sickStaff,
    };
  }

  deserialize(data) {
    if (!data) return;
    this.staffEnergy = data.staffEnergy || {};
    this.sickStaff = data.sickStaff || {};
  }

  reset() {
    this.staffEnergy = {};
    this.sickStaff = {};
  }
}

// Global instance
const energySystem = new EnergySystem();
