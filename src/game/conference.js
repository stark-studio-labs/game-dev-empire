/**
 * Tech Empire — Industry Conferences (US-010)
 * 3 annual conferences: G3, GamesCon, Indie Showcase.
 * Attend to announce games, recruit star talent, win awards, and spy on competitors.
 */

const CONFERENCES = [
  {
    id: 'g3',
    name: 'G3 — Global Games Gathering',
    shortName: 'G3',
    month: 5,     // fires in month 5 (May)
    week: 2,      // second week of the month
    desc: 'The biggest gaming convention in the world. Publishers, press, and 200,000 fans descend on the convention center. Where blockbusters are born.',
    icon: '🎮',
    baseAttendCost: 20000,
    maxAttendCost: 80000,
    bonuses: {
      hypeBonusBase: 30,
      fansBase: 25000,
      recruitChance: 0.6,    // chance to find a star recruit
      awardChance: 0.25,     // chance to win an award if last game scored 8+
      spyBonus: 15,          // hype from spy intel
    },
    awards: ['Best Action Game', 'Best RPG', 'Best Indie', 'Most Anticipated', 'Best Trailer'],
    prestige: 'high',
    minYear: 3,  // event doesn't start until year 3
  },
  {
    id: 'gamescon',
    name: 'GamesCon Europe',
    shortName: 'GamesCon',
    month: 8,
    week: 1,
    desc: 'Europe\'s premier gaming exhibition. Publisher deals, media coverage, and a massive cosplay community. Fan energy is unlike anything else.',
    icon: '🌍',
    baseAttendCost: 12000,
    maxAttendCost: 50000,
    bonuses: {
      hypeBonusBase: 20,
      fansBase: 15000,
      recruitChance: 0.5,
      awardChance: 0.20,
      spyBonus: 10,
    },
    awards: ['Fan Favorite', 'Best Multiplayer', 'Best Narrative', 'Best Visual Design'],
    prestige: 'medium',
    minYear: 2,
  },
  {
    id: 'indie_showcase',
    name: 'Indie Spotlight Showcase',
    shortName: 'Indie Spotlight',
    month: 11,
    week: 3,
    desc: 'The indie community\'s annual celebration. Lower cost, higher soul. Critics who matter are here looking for the next Spelunky or Braid.',
    icon: '🌟',
    baseAttendCost: 5000,
    maxAttendCost: 15000,
    bonuses: {
      hypeBonusBase: 15,
      fansBase: 8000,
      recruitChance: 0.4,
      awardChance: 0.35,  // easier to win as indie
      spyBonus: 5,
    },
    awards: ['Best Debut', 'Critics\' Choice', 'Community Award', 'Best Soundtrack', 'Grand Prix'],
    prestige: 'indie',
    minYear: 1,
  },
];

class ConferenceSystem {
  constructor() {
    this.attendedHistory = [];   // [{ confId, year, outcomes }]
    this.pendingConference = null; // conference waiting for player decision
    this.conferenceResult = null;  // last result for display
    this.skippedIds = new Set();   // confId+year keys for skipped events
  }

  /**
   * Check if a conference fires this week. Returns conference or null.
   */
  checkWeek(state) {
    for (const conf of CONFERENCES) {
      if (state.year < conf.minYear) continue;

      const key = `${conf.id}_${state.year}`;
      if (this.skippedIds.has(key)) continue;
      if (this.attendedHistory.some(h => h.confId === conf.id && h.year === state.year)) continue;

      // Fire in the specified month and week
      if (state.month === conf.month && state.week === conf.week) {
        this.pendingConference = { ...conf, year: state.year };
        return this.pendingConference;
      }
    }
    return null;
  }

  /** Calculate attendance cost based on company size */
  getAttendCost(conf, state) {
    const levelMult = [1, 1.5, 2.5, 4][state.level] || 1;
    return Math.min(conf.maxAttendCost, Math.round(conf.baseAttendCost * levelMult));
  }

  /**
   * Player chooses to attend or skip.
   * action: 'attend_announce' | 'attend_recruit' | 'attend_spy' | 'skip'
   * Returns result object.
   */
  resolve(action, conf, state) {
    const key = `${conf.id}_${state.year}`;

    if (action === 'skip') {
      this.skippedIds.add(key);
      this.pendingConference = null;
      return { attended: false, reason: 'skipped' };
    }

    const cost = this.getAttendCost(conf, state);
    if (state.cash < cost) {
      this.skippedIds.add(key);
      this.pendingConference = null;
      return { attended: false, reason: 'no_cash', cost };
    }

    // Deduct cost
    state.cash -= cost;

    const bonuses = conf.bonuses;
    const levelBonus = [1.0, 1.2, 1.5, 2.0][state.level] || 1.0;
    const outcomes = [];

    // Base hype and fans from attendance
    let hypeGain = Math.round(bonuses.hypeBonusBase * levelBonus);
    let fansGain = Math.round(bonuses.fansBase * levelBonus);

    // Action-specific bonus
    let starRecruit = null;
    let awardWon = null;
    let spyIntel = null;

    if (action === 'attend_announce') {
      // Announce a game: bigger hype/fan spike
      hypeGain = Math.round(hypeGain * 1.8);
      fansGain = Math.round(fansGain * 1.6);
      outcomes.push('Major game announcement generated massive buzz!');

      // Award chance (if recent game was good)
      if (state.games.length > 0) {
        const lastGame = state.games[state.games.length - 1];
        if (lastGame && lastGame.reviewAvg >= 7.5 && Math.random() < bonuses.awardChance) {
          const awardList = conf.awards;
          awardWon = awardList[Math.floor(Math.random() * awardList.length)];
          fansGain = Math.round(fansGain * 1.4);
          outcomes.push(`Won "${awardWon}"! Downloads surged.`);
        }
      }

    } else if (action === 'attend_recruit') {
      // Focus on recruitment: find a talented new hire candidate
      hypeGain = Math.round(hypeGain * 0.7);
      outcomes.push('Networked with top talent from across the industry.');

      if (Math.random() < bonuses.recruitChance) {
        starRecruit = this._generateStarRecruit(state);
        outcomes.push(`Met ${starRecruit.name} — a star developer looking for their next project!`);
      }

    } else if (action === 'attend_spy') {
      // Intelligence gathering on competitors
      hypeGain = Math.round(hypeGain * 0.8);
      const spyHype = bonuses.spyBonus;
      spyIntel = this._generateSpyIntel(state);
      outcomes.push(`Gathered intel on ${spyIntel.competitor}'s upcoming project: "${spyIntel.project}"`);
      outcomes.push(`Genre intelligence applied. Market reading improved by ${spyHype} points.`);
      hypeGain += spyHype;
    }

    // Apply results to state
    state.fans = Math.max(0, state.fans + fansGain);
    if (typeof moraleSystem !== 'undefined') {
      moraleSystem.applyEvent('custom', state.totalWeeks, 8);
      state.morale = moraleSystem.getMorale();
    }

    const result = {
      attended: true,
      confName: conf.name,
      action,
      cost,
      hypeGain,
      fansGain,
      awardWon,
      starRecruit,
      spyIntel,
      outcomes,
    };

    this.attendedHistory.push({
      confId: conf.id,
      year: conf.year || state.year,
      action,
      fansGain,
      awardWon,
    });

    this.conferenceResult = result;
    this.pendingConference = null;
    return result;
  }

  _generateStarRecruit(state) {
    const STAR_NAMES = [
      'Kai Chen', 'Priya Nair', 'Marcus Webb', 'Anya Kowalski',
      'Zoe Nakamura', 'Elias Ferreira', 'Nadia Osei', 'Remy Beaumont',
    ];
    const specialties = ['AI Systems', 'Visual Art', 'Game Design', 'Sound Engineering', 'Narrative Design'];
    const level = state.level;
    const baseStat = 55 + level * 12 + Math.floor(Math.random() * 25);
    return {
      id: `recruit_${Date.now()}`,
      name: STAR_NAMES[Math.floor(Math.random() * STAR_NAMES.length)],
      specialty: specialties[Math.floor(Math.random() * specialties.length)],
      design: baseStat + Math.floor(Math.random() * 20),
      tech: baseStat + Math.floor(Math.random() * 20),
      speed: 40 + Math.floor(Math.random() * 30),
      research: 25 + Math.floor(Math.random() * 30),
      salary: Math.round((baseStat * 200 + 5000) / 500) * 500,
      isFounder: false,
      gamesWorked: 0,
      isConferenceHire: true,
    };
  }

  _generateSpyIntel(state) {
    const competitors = ['Pixel Forge', 'Midnight Studios', 'Iron Wolf Games', 'Cascade Interactive', 'Nova Soft'];
    const genres = ['Action', 'RPG', 'Strategy', 'Simulation', 'Casual', 'Adventure'];
    const sizes = ['small', 'medium', 'large', 'AAA'];
    return {
      competitor: competitors[Math.floor(Math.random() * competitors.length)],
      project: `Project ${['Titan', 'Nova', 'Phoenix', 'Apex', 'Zenith', 'Eclipse'][Math.floor(Math.random() * 6)]}`,
      genre: genres[Math.floor(Math.random() * genres.length)],
      releaseIn: `${3 + Math.floor(Math.random() * 6)} months`,
    };
  }

  getConferencesThisYear(state) {
    return CONFERENCES.filter(c => state.year >= c.minYear);
  }

  getHistory() {
    return this.attendedHistory;
  }

  serialize() {
    return {
      attendedHistory: [...this.attendedHistory],
      skippedIds: [...this.skippedIds],
    };
  }

  deserialize(data) {
    if (!data) return;
    this.attendedHistory = data.attendedHistory || [];
    this.skippedIds = new Set(data.skippedIds || []);
    this.pendingConference = null;
    this.conferenceResult = null;
  }

  reset() {
    this.attendedHistory = [];
    this.skippedIds = new Set();
    this.pendingConference = null;
    this.conferenceResult = null;
  }
}

const conferenceSystem = new ConferenceSystem();
