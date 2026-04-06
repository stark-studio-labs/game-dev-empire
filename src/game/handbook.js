/**
 * Tech Empire — Game Design Handbook
 * Tracks player discoveries about game mechanics. Entries unlock through play.
 */
class HandbookSystem {
  constructor() { this.entries = {}; }
  reset() { this.entries = {}; }

  discoverFromGame(game, state) {
    if (!game || !game.breakdown) return;
    const genre = game.genre;
    const genreMastery = state.genreMastery || {};

    // Unlock genre guide after 2+ games in genre
    if ((genreMastery[genre] || 0) >= 2 && !this.entries['genre_' + genre]) {
      const genreIdx = (typeof GENRES !== 'undefined') ? GENRES.indexOf(genre) : -1;
      if (genreIdx >= 0 && typeof GENRE_IMPORTANCE !== 'undefined') {
        const imp = GENRE_IMPORTANCE[GENRES[genreIdx]];
        if (imp) {
          const aspects = (typeof DEV_PHASES !== 'undefined') ? DEV_PHASES.flatMap(p => p.aspects).filter(a => a) : [];
          const important = aspects.filter((_, i) => imp[i] >= 0.9);
          const restricted = aspects.filter((_, i) => imp[i] <= 0.1);
          this.entries['genre_' + genre] = {
            title: genre + ' Games',
            category: 'Genre Guides',
            text: genre + ' games emphasize ' + important.join(', ') + '. Minimize ' + restricted.join(', ') + '.',
            discoveredWeek: state.totalWeeks,
          };
        }
      }
    }

    // Unlock combo entry for high-scoring matches
    const comboKey = 'combo_' + game.topic + '_' + genre;
    if (game.reviewAvg >= 8 && !this.entries[comboKey]) {
      this.entries[comboKey] = {
        title: game.topic + ' + ' + genre,
        category: 'Winning Combos',
        text: 'Great match! ' + game.topic + ' works well with ' + genre + ' (scored ' + game.reviewAvg.toFixed(1) + ').',
        discoveredWeek: state.totalWeeks,
      };
    }

    // Unlock bad combo warning
    const badKey = 'bad_' + game.topic + '_' + genre;
    if (game.reviewAvg < 5 && !this.entries[badKey]) {
      this.entries[badKey] = {
        title: game.topic + ' + ' + genre + ' (Poor)',
        category: 'Lessons Learned',
        text: 'Poor match. ' + game.topic + ' and ' + genre + ' don\'t pair well (scored ' + game.reviewAvg.toFixed(1) + ').',
        discoveredWeek: state.totalWeeks,
      };
    }

    // Unlock D:T balance insight after 5 games
    if ((state.games || []).length >= 5 && !this.entries['dt_balance']) {
      this.entries['dt_balance'] = {
        title: 'Design vs Tech Balance',
        category: 'Pro Tips',
        text: 'Each genre has an ideal Design:Tech ratio. Action and Strategy favor Tech. Adventure and Casual favor Design. RPG and Simulation are balanced.',
        discoveredWeek: state.totalWeeks,
      };
    }
  }

  getEntries() { return Object.values(this.entries); }
  getByCategory(cat) { return this.getEntries().filter(e => e.category === cat); }
  getEntryCount() { return Object.keys(this.entries).length; }
  getCategories() { return [...new Set(this.getEntries().map(e => e.category))]; }

  serialize() { return { entries: { ...this.entries } }; }
  deserialize(data) { if (data) this.entries = data.entries || {}; }
}
const handbookSystem = new HandbookSystem();
