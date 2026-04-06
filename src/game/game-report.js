/**
 * Tech Empire — Post-Game Research Report Generator
 * Provides progressive insight based on games shipped.
 */

const VAGUE_TEMPLATES = [
  'Players seemed to {verb} the {aspect} elements.',
  'The {aspect} work {quality} for this type of game.',
  '{aspect} appears to {verb2} in {genre} games.',
];

const MODERATE_TEMPLATES = [
  '{genre} games tend to score higher with strong {goodAspects}.',
  'Your Design:Tech balance was {dtVerdict} for this genre.',
  'Consider focusing more on {suggestions} next time.',
];

class GameReportGenerator {
  generateReport(game, gamesShipped) {
    const detail = gamesShipped <= 3 ? 'vague' : gamesShipped <= 8 ? 'moderate' : 'detailed';
    const insights = [];
    const breakdown = game.breakdown || {};
    const aspectRatings = breakdown.aspectRatings || [];

    if (detail === 'vague') {
      // Pick 2-3 aspects and give vague feedback
      const goodAspects = aspectRatings.filter(a => a.rating === 'good');
      const badAspects = aspectRatings.filter(a => a.rating === 'bad');
      if (goodAspects.length > 0) {
        insights.push('Players seemed to enjoy the ' + goodAspects[0].name + ' elements.');
      }
      if (badAspects.length > 0) {
        insights.push('The ' + badAspects[0].name + ' work felt lacking for this type of game.');
      }
      insights.push('Keep experimenting with different approaches!');
    } else if (detail === 'moderate') {
      // Show genre-specific advice
      const goodNames = aspectRatings.filter(a => a.rating === 'good').map(a => a.name);
      const badNames = aspectRatings.filter(a => a.rating === 'bad').map(a => a.name);
      if (goodNames.length > 0) {
        insights.push(game.genre + ' games score higher with strong ' + goodNames.slice(0, 3).join(', ') + '.');
      }
      if (badNames.length > 0) {
        insights.push('Consider improving ' + badNames.slice(0, 2).join(' and ') + ' next time.');
      }
      const dtBalance = breakdown.dtBalance || 0;
      insights.push('Your Design:Tech balance was ' + (dtBalance > 0.1 ? 'well-suited' : dtBalance < -0.1 ? 'slightly off' : 'neutral') + ' for ' + game.genre + '.');
    } else {
      // Detailed: show aspect ratings + percentages
      insights.push('Genre: ' + game.genre + ' — detailed aspect analysis available.');
      const goodNames = aspectRatings.filter(a => a.rating === 'good').map(a => a.name);
      const badNames = aspectRatings.filter(a => a.rating === 'bad').map(a => a.name);
      if (goodNames.length > 0) insights.push('Strong areas: ' + goodNames.join(', '));
      if (badNames.length > 0) insights.push('Weak areas: ' + badNames.join(', '));
    }

    // Genre mastery insight — unlocks after 3+ games in the same genre
    const genreMastery = (typeof engine !== 'undefined' && engine.state) ? (engine.state.genreMastery || {}) : {};
    const genreCount = genreMastery[game.genre] || 0;
    if (genreCount >= 3 && detail !== 'vague') {
      const genreIdx = (typeof GENRES !== 'undefined') ? GENRES.indexOf(game.genre) : -1;
      if (genreIdx >= 0 && typeof GENRE_IMPORTANCE !== 'undefined') {
        const imp = GENRE_IMPORTANCE[GENRES[genreIdx]];
        if (imp) {
          const aspects = (typeof DEV_PHASES !== 'undefined') ? DEV_PHASES.flatMap(p => p.aspects).filter(a => a) : [];
          const important = aspects.filter((_, i) => imp[i] >= 0.9);
          const restricted = aspects.filter((_, i) => imp[i] <= 0.1);
          let masteryMsg = 'Genre Mastery (' + game.genre + '): Focus on ' + important.join(', ') + '.';
          if (restricted.length > 0) masteryMsg += ' Minimize ' + restricted.join(', ') + '.';
          insights.push(masteryMsg);
        }
      }
    }

    return { insights, detail, aspectRatings: detail === 'detailed' ? aspectRatings : null };
  }
}

const gameReportGenerator = new GameReportGenerator();
