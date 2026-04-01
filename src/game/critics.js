/**
 * Tech Empire — Critic Personalities
 * 8 named critics with distinct review biases and flavor text.
 */

const CRITICS = [
  {
    name: 'Rex Ironwood',
    avatar: '\u{1F3AE}', // gamepad
    title: 'The Purist',
    bio: 'Gameplay-focused veteran who hates microtransactions and gimmicks.',
    genrePreference: { Action: 1.15, RPG: 1.1, Strategy: 1.1, Adventure: 1.0, Simulation: 0.95, Casual: 0.85 },
    // Rex cares about gameplay and AI — penalizes graphics-heavy, low-gameplay games
    scoreModifier(baseScore, game) {
      let mod = 0;
      // Loves deep gameplay topics
      const deepTopics = ['Dungeon', 'Medieval', 'Cyberpunk', 'Military', 'Strategy'];
      if (deepTopics.includes(game.topic)) mod += 0.4;
      // Dislikes shallow casual topics
      const casualTopics = ['Virtual Pet', 'Fashion', 'Dance', 'Cooking'];
      if (casualTopics.includes(game.topic)) mod -= 0.3;
      // Genre preference
      const genreMod = this.genrePreference[game.genre] || 1.0;
      return baseScore * genreMod + mod;
    },
    quotes: {
      high: ['"A masterclass in game design. This is what gaming should be."', '"Pure gameplay perfection. No filler, no gimmicks."'],
      mid: ['"Decent enough, but the core loop needs tightening."', '"There\'s a good game in here somewhere, buried under fluff."'],
      low: ['"Where\'s the actual game? I expected more substance."', '"Style over substance. Again."'],
    },
  },
  {
    name: 'Luna Vox',
    avatar: '\u{2728}', // sparkles
    title: 'The Spectacle Seeker',
    bio: 'Graphics-obsessed reviewer who lives for visual splendor.',
    genrePreference: { Action: 1.15, Adventure: 1.1, RPG: 1.05, Simulation: 1.0, Strategy: 0.9, Casual: 0.95 },
    scoreModifier(baseScore, game) {
      let mod = 0;
      // Loves visually rich topics
      const prettyTopics = ['Sci-Fi', 'Fantasy', 'Space', 'Cyberpunk', 'Aliens', 'Superheroes'];
      if (prettyTopics.includes(game.topic)) mod += 0.5;
      // Dislikes text-heavy / abstract topics
      const boringTopics = ['Vocabulary', 'Business', 'Government', 'Law'];
      if (boringTopics.includes(game.topic)) mod -= 0.3;
      const genreMod = this.genrePreference[game.genre] || 1.0;
      return baseScore * genreMod + mod;
    },
    quotes: {
      high: ['"Visually STUNNING. Every frame belongs in a museum."', '"I gasped out loud. This is next-gen eye candy."'],
      mid: ['"Looks okay, but nothing that made my jaw drop."', '"Serviceable visuals. Won\'t win any beauty contests."'],
      low: ['"My eyes hurt. Did they even have an art team?"', '"Visually offensive. I need to cleanse my palette."'],
    },
  },
  {
    name: 'Professor Quill',
    avatar: '\u{1F4D6}', // book
    title: 'The Story Snob',
    bio: 'Forgives bad graphics for great writing. Will cry over good dialogue.',
    genrePreference: { Adventure: 1.2, RPG: 1.15, Strategy: 0.9, Action: 0.9, Simulation: 0.95, Casual: 0.8 },
    scoreModifier(baseScore, game) {
      let mod = 0;
      // Loves narrative-rich topics
      const storyTopics = ['Mystery', 'Romance', 'Detective', 'Spy', 'Time Travel', 'Horror', 'Pirate'];
      if (storyTopics.includes(game.topic)) mod += 0.5;
      // Dislikes thin narrative topics
      const thinTopics = ['Sports', 'Racing', 'Dance', 'Music', 'Cooking'];
      if (thinTopics.includes(game.topic)) mod -= 0.3;
      const genreMod = this.genrePreference[game.genre] || 1.0;
      return baseScore * genreMod + mod;
    },
    quotes: {
      high: ['"A narrative triumph. I wept. Twice."', '"This story will be studied in game writing classes for decades."'],
      mid: ['"The story has potential, but the execution is middling."', '"Readable, but hardly literature."'],
      low: ['"Did a random word generator write this script?"', '"The narrative is an insult to storytelling."'],
    },
  },
  {
    name: 'Zippy Chen',
    avatar: '\u{1F389}', // party popper
    title: 'The Casual Champion',
    bio: 'Loves accessibility, hates complexity. Games should be fun for everyone.',
    genrePreference: { Casual: 1.2, Simulation: 1.05, Adventure: 1.0, Action: 0.95, RPG: 0.85, Strategy: 0.85 },
    scoreModifier(baseScore, game) {
      let mod = 0;
      // Loves accessible topics
      const funTopics = ['Virtual Pet', 'Cooking', 'Music', 'Dance', 'Fashion', 'School', 'Comedy', 'Life'];
      if (funTopics.includes(game.topic)) mod += 0.5;
      // Dislikes intimidating topics
      const hardTopics = ['Military', 'Hacking', 'Government', 'Prison'];
      if (hardTopics.includes(game.topic)) mod -= 0.3;
      const genreMod = this.genrePreference[game.genre] || 1.0;
      return baseScore * genreMod + mod;
    },
    quotes: {
      high: ['"Fun for the whole family! Pick up and play perfection."', '"THIS is how you make a game everyone can enjoy."'],
      mid: ['"Not bad, but it could be more welcoming to newcomers."', '"My mom almost figured out the controls. Almost."'],
      low: ['"Needlessly complicated. Who is this even for?"', '"I rage-quit three times in the tutorial."'],
    },
  },
  {
    name: 'Blade Darkson',
    avatar: '\u{1F5E1}\u{FE0F}', // dagger
    title: 'The Contrarian',
    bio: 'Rates hyped games lower and champions hidden gems. Refuses to follow trends.',
    genrePreference: { RPG: 1.1, Strategy: 1.1, Adventure: 1.05, Simulation: 1.0, Action: 0.9, Casual: 0.9 },
    scoreModifier(baseScore, game) {
      let mod = 0;
      // Loves niche/unusual topics
      const nicheTopics = ['Cyberpunk', 'Post Apocalyptic', 'Werewolf', 'Vampire', 'Hacking', 'Archaeology'];
      if (nicheTopics.includes(game.topic)) mod += 0.5;
      // Penalizes "safe" mainstream topics
      const mainstreamTopics = ['Sports', 'Racing', 'Fantasy', 'Superheroes'];
      if (mainstreamTopics.includes(game.topic)) mod -= 0.3;
      // Contrarian twist: if the base score is very high, slight penalty (hype resistance)
      if (baseScore > 8.5) mod -= 0.4;
      if (baseScore < 5) mod += 0.3; // champion the underdog
      const genreMod = this.genrePreference[game.genre] || 1.0;
      return baseScore * genreMod + mod;
    },
    quotes: {
      high: ['"Against all odds, a genuine diamond. Don\'t believe the hype — believe ME."', '"While the masses chase blockbusters, this gem shines in the dark."'],
      mid: ['"Neither terrible nor transcendent. The most dangerous kind of mediocre."', '"Everyone will love it. And that\'s exactly the problem."'],
      low: ['"Corporate game-by-numbers. Zero soul, maximum market research."', '"They spent the budget on marketing instead of making a good game."'],
    },
  },
  {
    name: 'Neon Watts',
    avatar: '\u{1F4BB}', // laptop
    title: 'The Techie',
    bio: 'Framerate, resolution, load times. If the engine is bad, the game is bad.',
    genrePreference: { Action: 1.15, Simulation: 1.1, Strategy: 1.05, RPG: 1.0, Adventure: 0.95, Casual: 0.85 },
    scoreModifier(baseScore, game) {
      let mod = 0;
      // Loves tech-showcase topics
      const techTopics = ['Sci-Fi', 'Space', 'Hacking', 'Cyberpunk', 'Aliens', 'Racing'];
      if (techTopics.includes(game.topic)) mod += 0.4;
      // Dislikes topics that don't push tech
      const lowTechTopics = ['Vocabulary', 'Cooking', 'Fashion', 'Virtual Pet'];
      if (lowTechTopics.includes(game.topic)) mod -= 0.3;
      // Bigger games get bonus (more tech to appreciate)
      if (game.size === 'AAA') mod += 0.3;
      else if (game.size === 'Large') mod += 0.15;
      else if (game.size === 'Small') mod -= 0.15;
      const genreMod = this.genrePreference[game.genre] || 1.0;
      return baseScore * genreMod + mod;
    },
    quotes: {
      high: ['"Buttery 60fps, zero load times, gorgeous engine. Chef\'s kiss."', '"Technical brilliance. This engine should be studied."'],
      mid: ['"Runs fine. Nothing special under the hood though."', '"Acceptable performance, but I expected more optimization."'],
      low: ['"Frame drops, pop-in, crashes. Did they QA this at all?"', '"My toaster could render better graphics than this."'],
    },
  },
  {
    name: 'Grandpa Pixel',
    avatar: '\u{1F579}\u{FE0F}', // joystick
    title: 'The Nostalgia Critic',
    bio: 'Compares everything to the golden age. Loves retro vibes and classic design.',
    genrePreference: { RPG: 1.15, Adventure: 1.1, Action: 1.05, Strategy: 1.05, Simulation: 0.95, Casual: 0.9 },
    scoreModifier(baseScore, game) {
      let mod = 0;
      // Loves classic game topics
      const retroTopics = ['Fantasy', 'Dungeon', 'Space', 'Pirate', 'Medieval', 'Ninja', 'Wild West', 'Zombies'];
      if (retroTopics.includes(game.topic)) mod += 0.5;
      // Dislikes "modern" topics
      const modernTopics = ['Startups', 'Hacking', 'Fashion', 'Movies', 'Business'];
      if (modernTopics.includes(game.topic)) mod -= 0.3;
      // Small games get a nostalgia bonus
      if (game.size === 'Small') mod += 0.2;
      const genreMod = this.genrePreference[game.genre] || 1.0;
      return baseScore * genreMod + mod;
    },
    quotes: {
      high: ['"Reminds me of the golden age! They truly don\'t make them like this anymore."', '"Back in my day this would have been Game of the Year. Still is."'],
      mid: ['"Not bad for a modern game, but it\'s no classic."', '"Decent, but it lacks that old-school magic."'],
      low: ['"In the 80s, we\'d have returned this to the store."', '"The golden age weeps at what gaming has become."'],
    },
  },
  {
    name: 'Sparkle Stream',
    avatar: '\u{1F4F1}', // phone
    title: 'The Influencer',
    bio: 'Follows trends, viral potential matters. If it streams well, it scores well.',
    genrePreference: { Action: 1.1, Casual: 1.1, Adventure: 1.05, Simulation: 1.0, RPG: 0.95, Strategy: 0.9 },
    scoreModifier(baseScore, game) {
      let mod = 0;
      // Loves viral/streamable topics
      const viralTopics = ['Horror', 'Zombies', 'Comedy', 'Superheroes', 'Aliens', 'Survival Island'];
      if (viralTopics.includes(game.topic)) mod += 0.5;
      // Dislikes slow/boring-to-watch topics
      const boringTopics = ['Business', 'Government', 'Law', 'Transport', 'Vocabulary'];
      if (boringTopics.includes(game.topic)) mod -= 0.3;
      const genreMod = this.genrePreference[game.genre] || 1.0;
      return baseScore * genreMod + mod;
    },
    quotes: {
      high: ['"OMG this is SO streamable! My chat went absolutely wild!"', '"Content GOLD. Every session is a viral clip waiting to happen."'],
      mid: ['"It\'s fine? My chat was kinda mid about it tbh."', '"Watchable but not clip-worthy. Needs more chaos."'],
      low: ['"My viewers literally fell asleep. I lost 200 subs."', '"Zero stream appeal. I\'d rather watch paint dry on camera."'],
    },
  },
];

/**
 * Select N random critics from the pool (default 4).
 */
function selectCritics(count) {
  count = count || 4;
  const shuffled = [...CRITICS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, CRITICS.length));
}

/**
 * Generate critic reviews for a game.
 * @param {number} baseScore — the base review score (1-10)
 * @param {object} game — the completed game object
 * @param {Array} critics — array of critic objects (from selectCritics)
 * @returns {Array} — [{critic, score, quote}]
 */
function generateCriticReviews(baseScore, game, critics) {
  return critics.map(critic => {
    // Apply the critic's score modifier
    let modifiedScore = critic.scoreModifier(baseScore, game);
    // Clamp to 1-10 range and round to nearest 0.5
    modifiedScore = Math.round(Math.min(10, Math.max(1, modifiedScore)) * 2) / 2;

    // Pick a quote based on score tier
    let quotePool;
    if (modifiedScore >= 7.5) quotePool = critic.quotes.high;
    else if (modifiedScore >= 4.5) quotePool = critic.quotes.mid;
    else quotePool = critic.quotes.low;
    const quote = quotePool[Math.floor(Math.random() * quotePool.length)];

    return {
      critic: {
        name: critic.name,
        avatar: critic.avatar,
        title: critic.title,
      },
      score: modifiedScore,
      quote,
    };
  });
}
