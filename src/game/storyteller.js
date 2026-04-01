/**
 * Tech Empire — Adaptive Story Engine
 * Tracks "drama score" (0-100) and generates contextual events.
 * High drama (>70) → challenges. Low drama (<30) → opportunities. Mid (30-70) → catalysts.
 */

// ── Challenge Events (fire when drama > 70) ─────────────────────
const STORYTELLER_CHALLENGES = [
  {
    id: 'st_antitrust',
    title: 'Antitrust Investigation',
    text: 'Government regulators have launched an antitrust investigation into your studio. They claim your market dominance is stifling competition. Legal fees are mounting and the press is circling.',
    badge: 'Challenge',
    options: [
      { label: 'Cooperate fully and settle', description: 'Pay the fine and move on.', consequence: { adjustCash: -50000, adjustFans: -2000, message: 'You settled for $50K. The headlines fade but the sting remains.' } },
      { label: 'Fight it in court', description: 'Hire top lawyers and challenge the investigation.', consequence: { adjustCash: -30000, adjustFans: 5000, message: 'The court battle rallied your fanbase. $30K in legal fees but fans loved the defiance.' } },
    ],
  },
  {
    id: 'st_key_employee_leaves',
    title: 'Key Employee Defects',
    text: 'Your most talented developer just announced they\'re leaving to start their own studio. They\'re taking knowledge of your upcoming projects with them.',
    badge: 'Challenge',
    options: [
      { label: 'Offer a massive raise to stay', description: 'Double their salary.', consequence: { adjustCash: -20000, message: 'They stayed, but at a steep price. Other staff are eyeing renegotiation.' } },
      { label: 'Wish them well and move on', description: 'Let them go gracefully.', consequence: { adjustFans: -1000, adjustMorale: -5, message: 'They left. Morale dipped as the team lost a beloved colleague.' } },
    ],
  },
  {
    id: 'st_industry_recession',
    title: 'Industry Recession',
    text: 'Consumer spending on games has plummeted 40%. Studios everywhere are laying off staff. Investors are pulling out and the gaming press is writing obituaries.',
    badge: 'Challenge',
    options: [
      { label: 'Reduce costs aggressively', description: 'Slash spending to survive the downturn.', consequence: { adjustCash: 15000, adjustMorale: -10, message: 'Painful cuts, but the studio survives. Morale is in the gutter.' } },
      { label: 'Double down on a hit game', description: 'Bet everything on your next release.', consequence: { adjustCash: -25000, adjustFans: 8000, message: 'Risky, but the bold move kept fans engaged and attracted attention.' } },
    ],
  },
  {
    id: 'st_competitor_smash_hit',
    title: 'Rival Releases Mega-Hit',
    text: 'Your biggest competitor just launched the highest-rated game of the decade. The press is calling it a masterpiece. Your upcoming release looks pedestrian by comparison.',
    badge: 'Challenge',
    options: [
      { label: 'Delay and polish your game', description: 'Push back your release to add features.', consequence: { adjustCash: -15000, message: 'The delay cost $15K but your game will be stronger for it.' } },
      { label: 'Release on schedule', description: 'Ship on time and market what makes you unique.', consequence: { adjustFans: 3000, message: 'Your game found its audience. Not everyone wants the same thing.' } },
    ],
  },
  {
    id: 'st_data_breach',
    title: 'Data Breach Scandal',
    text: 'Hackers have breached your player database. Email addresses and usernames are being sold on the dark web. Players are furious.',
    badge: 'Challenge',
    options: [
      { label: 'Full transparency and compensation', description: 'Apologize publicly and compensate affected players.', consequence: { adjustCash: -25000, adjustFans: 2000, message: 'Transparency cost $25K but rebuilt trust. Players respected the honesty.' } },
      { label: 'Downplay and quietly patch', description: 'Fix the vulnerability and hope it blows over.', consequence: { adjustFans: -10000, message: 'The cover-up was worse than the crime. Fans discovered the truth.' } },
    ],
  },
  {
    id: 'st_talent_raid',
    title: 'Talent Raid',
    text: 'A mega-corp is offering your top three developers 3x their salary to jump ship. They\'ve been in talks for weeks.',
    badge: 'Challenge',
    options: [
      { label: 'Match the offers', description: 'Increase salaries across the board.', consequence: { adjustCash: -35000, message: 'Expensive, but you kept the team intact. Monthly costs will be higher.' } },
      { label: 'Let them go and recruit fresh', description: 'Accept the losses and hire replacements.', consequence: { adjustMorale: -8, message: 'The departures shook the team. New hires will need time to ramp up.' } },
    ],
  },
  {
    id: 'st_platform_ban',
    title: 'Platform Pulls Your Game',
    text: 'A major platform has removed your latest release citing "policy violations." The ban seems politically motivated.',
    badge: 'Challenge',
    options: [
      { label: 'Appeal and negotiate', description: 'Work through proper channels.', consequence: { adjustCash: -10000, adjustFans: 1000, message: 'After weeks of negotiation, your game is back. The controversy boosted sales.' } },
      { label: 'Go direct-to-consumer', description: 'Launch your own storefront.', consequence: { adjustCash: -20000, adjustFans: 5000, message: 'Building your own store cost $20K but earned a fiercely loyal direct audience.' } },
    ],
  },
  {
    id: 'st_crunch_expose',
    title: 'Crunch Culture Expose',
    text: 'A major publication just ran a devastating expose on working conditions at your studio. Former employees describe brutal crunch and burnout.',
    badge: 'Challenge',
    options: [
      { label: 'Implement work-life balance reforms', description: 'Cap hours and hire more staff.', consequence: { adjustCash: -20000, adjustMorale: 15, message: 'Costly reforms, but morale soared and the press praised your response.' } },
      { label: 'Issue a PR statement', description: 'Acknowledge concerns without major changes.', consequence: { adjustFans: -5000, adjustMorale: -5, message: 'The hollow response backfired. Fans and staff saw through it.' } },
    ],
  },
  {
    id: 'st_patent_troll',
    title: 'Patent Troll Lawsuit',
    text: 'A shell company is suing you for $500K, claiming your engine infringes on a vague software patent. The patent is dubious but litigation is expensive.',
    badge: 'Challenge',
    options: [
      { label: 'Settle out of court', description: 'Pay them off to end it.', consequence: { adjustCash: -40000, message: 'You paid $40K to settle. Cheaper than a trial, but it stings.' } },
      { label: 'Fight and set a precedent', description: 'Take them to court.', consequence: { adjustCash: -15000, adjustFans: 3000, message: 'You won! The ruling set a precedent and studios thanked you publicly.' } },
    ],
  },
  {
    id: 'st_review_bombing',
    title: 'Review Bombing Campaign',
    text: 'An organized group is review-bombing your latest game. Your rating tanked from 4.5 to 1.8 stars overnight.',
    badge: 'Challenge',
    options: [
      { label: 'Stand by the creative vision', description: 'Don\'t change the game. Address it publicly.', consequence: { adjustFans: 5000, message: 'Your principled stand earned new fans. The bombing backfired.' } },
      { label: 'Patch in compromises', description: 'Add options to defuse the controversy.', consequence: { adjustCash: -8000, adjustFans: -2000, message: 'The changes satisfied some but alienated others.' } },
    ],
  },
];

// ── Opportunity Events (fire when drama < 30) ───────────────────
const STORYTELLER_OPPORTUNITIES = [
  {
    id: 'st_mentor_investor',
    title: 'Legendary Investor Calls',
    text: 'A legendary game industry investor has been watching your trajectory. They want to meet and discuss a potential partnership.',
    badge: 'Opportunity',
    options: [
      { label: 'Accept the meeting', description: 'Hear them out.', consequence: { adjustCash: 75000, adjustFans: 5000, message: 'They invested $75K and brought industry connections money can\'t buy.' } },
      { label: 'Stay independent', description: 'Politely decline.', consequence: { adjustFans: 2000, message: 'Your independence impressed the industry. Respect earned.' } },
    ],
  },
  {
    id: 'st_viral_moment',
    title: 'Lucky Viral Moment',
    text: 'A celebrity just posted a photo playing your game on a private jet. The post has 10 million likes. Your download servers are melting.',
    badge: 'Opportunity',
    options: [
      { label: 'Capitalize immediately', description: 'Launch a flash sale and social blitz.', consequence: { adjustCash: 30000, adjustFans: 20000, message: 'The flash sale earned $30K and 20K new fans overnight!' } },
      { label: 'Play it cool', description: 'Let the organic buzz build.', consequence: { adjustFans: 12000, message: 'The buzz grew naturally. 12K new fans with zero marketing spend.' } },
    ],
  },
  {
    id: 'st_talent_joins',
    title: 'Industry Legend Wants to Join',
    text: 'A renowned game designer who created some of the biggest hits of the decade just reached out. They\'re tired of corporate gaming and want to join you.',
    badge: 'Opportunity',
    options: [
      { label: 'Hire them immediately', description: 'Their salary is high but their talent is worth it.', consequence: { adjustCash: -15000, adjustFans: 8000, message: 'Their reputation alone brought 8K new fans. Talent is priceless.' } },
      { label: 'Offer a consulting role', description: 'Part-time advisory, lower cost.', consequence: { adjustCash: -5000, adjustFans: 3000, message: 'Their occasional input elevates your whole team.' } },
    ],
  },
  {
    id: 'st_partnership_offer',
    title: 'Dream Partnership Offer',
    text: 'A major entertainment company wants to license their IP for you to make into a game. They\'ll handle marketing.',
    badge: 'Opportunity',
    options: [
      { label: 'Accept the deal', description: 'Take the IP and run with it.', consequence: { adjustCash: 20000, adjustFans: 10000, message: '$20K upfront and access to their massive fanbase.' } },
      { label: 'Counter with revenue share', description: 'Propose a more favorable split.', consequence: { adjustCash: 10000, adjustFans: 15000, message: 'They agreed to rev-share! Less upfront but long-term upside is enormous.' } },
    ],
  },
  {
    id: 'st_award_nomination',
    title: 'Game Award Nomination',
    text: 'Your latest release has been nominated for Game of the Year at the biggest industry awards. The ceremony is next month.',
    badge: 'Opportunity',
    options: [
      { label: 'Campaign hard for the win', description: 'Spend on ads and engagement.', consequence: { adjustCash: -10000, adjustFans: 15000, message: 'You won! The trophy sits in your lobby and 15K new fans discovered you.' } },
      { label: 'Let the game speak for itself', description: 'The nomination alone is the reward.', consequence: { adjustFans: 8000, message: 'You didn\'t win, but the spotlight brought 8K new fans.' } },
    ],
  },
  {
    id: 'st_tax_incentive',
    title: 'Government Tax Incentive',
    text: 'Your city just announced a massive tax incentive program for game studios. Commit to keeping your HQ local for 5 years to qualify.',
    badge: 'Opportunity',
    options: [
      { label: 'Sign the commitment', description: 'Lock in the 5-year tax break.', consequence: { adjustCash: 40000, message: 'The tax break saved you $40K. The team loves staying put.' } },
      { label: 'Keep options open', description: 'Flexibility has value too.', consequence: { message: 'You stayed flexible. Sometimes the best deal is the one you don\'t take.' } },
    ],
  },
  {
    id: 'st_merch_goldmine',
    title: 'Merchandising Goldmine',
    text: 'A top merchandise company wants to create products based on your most popular game. Plushies, t-shirts, figurines.',
    badge: 'Opportunity',
    options: [
      { label: 'Full product line', description: 'Go all-in on merchandise.', consequence: { adjustCash: 35000, adjustFans: 5000, message: 'The merch line is a hit! $35K in licensing and your characters are everywhere.' } },
      { label: 'Limited collector\'s edition', description: 'Keep it exclusive and premium.', consequence: { adjustCash: 15000, adjustFans: 8000, message: 'Limited runs sold out instantly. Exclusivity drove more demand.' } },
    ],
  },
  {
    id: 'st_documentary',
    title: 'Documentary Crew Calls',
    text: 'A streaming service wants to produce a behind-the-scenes documentary about your studio. They\'ll cover all production costs.',
    badge: 'Opportunity',
    options: [
      { label: 'Open the doors', description: 'Give them full access.', consequence: { adjustFans: 20000, adjustMorale: 5, message: 'The documentary was a hit! 20K new fans and the team loved it.' } },
      { label: 'Controlled access only', description: 'Film on your terms.', consequence: { adjustFans: 10000, message: 'A polished doc that showed your best side. 10K new fans.' } },
    ],
  },
  {
    id: 'st_university_collab',
    title: 'University Research Partnership',
    text: 'A prestigious university game design program wants to partner. They\'ll send their best students as interns and co-publish research.',
    badge: 'Opportunity',
    options: [
      { label: 'Full partnership', description: 'Accept interns and collaborate.', consequence: { adjustCash: -5000, adjustFans: 3000, message: 'The interns brought fresh ideas and the research put you on the academic map.' } },
      { label: 'Guest lecture only', description: 'Share knowledge without commitment.', consequence: { adjustFans: 2000, message: 'Your talks inspired the next generation. Some became lifelong fans.' } },
    ],
  },
  {
    id: 'st_innovation_grant',
    title: 'Innovation Grant Awarded',
    text: 'Your studio has been selected for a prestigious innovation grant recognizing contributions to game technology.',
    badge: 'Opportunity',
    options: [
      { label: 'Invest in R&D', description: 'Fund experimental projects.', consequence: { adjustCash: 50000, adjustFans: 5000, message: 'The $50K grant funded a breakthrough prototype. Industry press covered it heavily.' } },
      { label: 'Fund the team', description: 'Bonuses and equipment.', consequence: { adjustCash: 50000, adjustMorale: 10, message: '$50K in the bank and a team that feels valued. Morale is sky-high.' } },
    ],
  },
];

// ── Catalyst Events (fire when drama 30-70) ─────────────────────
const STORYTELLER_CATALYSTS = [
  {
    id: 'st_new_tech',
    title: 'Breakthrough Technology',
    text: 'A new rendering technology has been demonstrated that could revolutionize graphics. Early adopters will have a massive advantage — but the SDK is unproven.',
    badge: 'Catalyst',
    options: [
      { label: 'Be an early adopter', description: 'Invest in the new tech immediately.', consequence: { adjustCash: -20000, adjustFans: 10000, message: 'The gamble paid off! Your next game looks generations ahead.' } },
      { label: 'Wait for it to mature', description: 'Let others work out the bugs.', consequence: { adjustFans: 2000, message: 'Smart patience. You\'ll adopt it stable, at half the cost.' } },
    ],
  },
  {
    id: 'st_industry_shift',
    title: 'Industry Paradigm Shift',
    text: 'Players are migrating to a new type of gaming experience. The old formulas are losing their appeal. Adapt or die.',
    badge: 'Catalyst',
    options: [
      { label: 'Pivot to the new paradigm', description: 'Retool your next project.', consequence: { adjustCash: -15000, adjustFans: 12000, message: 'Bold pivot! You\'re riding the wave instead of fighting it.' } },
      { label: 'Double down on what you know', description: 'Stay the course.', consequence: { adjustFans: 5000, message: 'Your loyal fans appreciated the consistency. Niche but profitable.' } },
    ],
  },
  {
    id: 'st_competitor_stumbles',
    title: 'Competitor Stumbles',
    text: 'Your biggest rival just released a disaster. Reviews are toxic, refunds flooding in, stock tanking. Their loss is your gain.',
    badge: 'Catalyst',
    options: [
      { label: 'Aggressively market your game', description: 'Strike while the iron is hot.', consequence: { adjustCash: -10000, adjustFans: 15000, message: 'Perfect timing. Disillusioned fans flocked to your studio.' } },
      { label: 'Recruit their departing talent', description: 'Their best people are job-hunting.', consequence: { adjustCash: -12000, message: 'You snagged two brilliant developers. Your next game benefits enormously.' } },
    ],
  },
  {
    id: 'st_regulation_change',
    title: 'New Industry Regulations',
    text: 'The government just passed new regulations on loot boxes and microtransactions. Studios that relied on those streams are scrambling.',
    badge: 'Catalyst',
    options: [
      { label: 'Champion fair gaming', description: 'Position your studio as consumer-friendly.', consequence: { adjustFans: 10000, message: 'Players rewarded your stance. 10K new fans who trust your studio.' } },
      { label: 'Find compliant alternatives', description: 'Explore battle passes and cosmetics.', consequence: { adjustCash: 15000, adjustFans: 3000, message: 'The new model generates $15K extra and players don\'t mind.' } },
    ],
  },
  {
    id: 'st_streaming_platform',
    title: 'Streaming Platform Launches',
    text: 'A major tech company launched a cloud gaming platform and is aggressively seeking content. Generous deals for early studios.',
    badge: 'Catalyst',
    options: [
      { label: 'Sign an exclusive deal', description: 'Big upfront payment, platform lock-in.', consequence: { adjustCash: 40000, adjustFans: -3000, message: '$40K upfront, but some fans are angry about exclusivity.' } },
      { label: 'Multi-platform release', description: 'Launch everywhere simultaneously.', consequence: { adjustFans: 8000, message: 'Players loved the accessibility. 8K new fans across all platforms.' } },
    ],
  },
  {
    id: 'st_vr_mainstream',
    title: 'VR Headset Goes Mainstream',
    text: 'An affordable VR headset just hit 50 million units sold. The VR gaming market is suddenly viable.',
    badge: 'Catalyst',
    options: [
      { label: 'Build a VR game', description: 'Dedicate a team to a VR-native title.', consequence: { adjustCash: -25000, adjustFans: 15000, message: 'Your VR game became a showcase title. 15K fans from a new audience.' } },
      { label: 'VR mode for existing games', description: 'Add VR support as a feature.', consequence: { adjustCash: -8000, adjustFans: 5000, message: 'Pragmatic approach. Existing fans loved the VR option.' } },
    ],
  },
  {
    id: 'st_modding_explosion',
    title: 'Modding Community Explodes',
    text: 'The modding community around your latest game has exploded. Thousands of mods, millions of downloads. Some mods are better than your DLC plans.',
    badge: 'Catalyst',
    options: [
      { label: 'Embrace and support modders', description: 'Release official modding tools.', consequence: { adjustCash: 10000, adjustFans: 20000, message: 'Mod tools turned your game into a platform. 20K new fans.' } },
      { label: 'Hire the best modders', description: 'Bring top creators onto your team.', consequence: { adjustCash: -15000, adjustFans: 8000, message: 'Smart acquisition. These modders know your game better than anyone.' } },
    ],
  },
  {
    id: 'st_esports_interest',
    title: 'Esports League Interest',
    text: 'A major esports org wants to build a competitive league around your multiplayer game. Prize pools, tournaments, streaming deals.',
    badge: 'Catalyst',
    options: [
      { label: 'Go all-in on esports', description: 'Fund a prize pool and balance team.', consequence: { adjustCash: -30000, adjustFans: 25000, message: 'The esports league launched to massive viewership. 25K new fans.' } },
      { label: 'License it hands-off', description: 'Let them run it, take a fee.', consequence: { adjustCash: 20000, adjustFans: 10000, message: 'Easy money. $20K licensing and 10K fans with minimal effort.' } },
    ],
  },
  {
    id: 'st_ai_dev_tools',
    title: 'AI Development Tools',
    text: 'Powerful AI tools for game development just dropped. They promise to cut dev time in half — but critics call the output generic and soulless.',
    badge: 'Catalyst',
    options: [
      { label: 'Integrate AI into your pipeline', description: 'AI for assets, humans for design.', consequence: { adjustCash: 10000, adjustFans: 5000, message: 'AI sped up production without sacrificing quality. Hybrid approach worked.' } },
      { label: 'Stay fully human-crafted', description: 'Market as 100% human-made.', consequence: { adjustFans: 12000, message: '"Handcrafted" became your brand identity. Fans loved the authenticity.' } },
    ],
  },
  {
    id: 'st_subscription_wars',
    title: 'Subscription Service Wars',
    text: 'Three competing game subscription services are fighting for content. Each offering lucrative deals. The subscription model could change everything.',
    badge: 'Catalyst',
    options: [
      { label: 'Pick the highest bidder', description: 'Take the best deal.', consequence: { adjustCash: 35000, adjustFans: 5000, message: '$35K upfront and guaranteed exposure to millions of subscribers.' } },
      { label: 'Launch your own subscription', description: 'Build your own.', consequence: { adjustCash: -20000, adjustFans: 15000, message: 'Expensive to build, but your direct subscription has 15K members.' } },
    ],
  },
];

// ── Storyteller System ──────────────────────────────────────────
class StorytellerSystem {
  constructor() {
    this.dramaScore = 50; // 0-100, starts neutral
    this.cooldowns = {};  // eventId -> earliest week it can fire
    this.history = [];
    this._lastCash = 70000;
  }

  /**
   * Update drama score based on company trajectory.
   * +10 when things go well, -10 when bad.
   */
  updateDrama(state) {
    const cashDelta = state.cash - this._lastCash;
    this._lastCash = state.cash;

    // Cash trending up → things going well → raise drama (success breeds challenge)
    if (cashDelta > 10000) this.dramaScore = Math.min(100, this.dramaScore + 10);
    else if (cashDelta > 0) this.dramaScore = Math.min(100, this.dramaScore + 3);

    // Cash trending down → things going badly → lower drama (struggle breeds opportunity)
    if (cashDelta < -10000) this.dramaScore = Math.max(0, this.dramaScore - 10);
    else if (cashDelta < 0) this.dramaScore = Math.max(0, this.dramaScore - 3);

    // Fan growth pushes drama up
    if (state.fans > 10000) this.dramaScore = Math.min(100, this.dramaScore + 2);

    // Slow drift toward center
    this.dramaScore += (50 - this.dramaScore) * 0.02;

    // Clamp
    this.dramaScore = Math.max(0, Math.min(100, this.dramaScore));
  }

  /**
   * Evaluate company state and potentially return a storyteller event.
   * 30% chance per month. Returns event object (same format as events.js) or null.
   */
  evaluateAndPick(companyState) {
    // 30% chance per month
    if (Math.random() > 0.30) return null;

    // Select pool based on drama score
    let pool;
    if (this.dramaScore > 70) {
      pool = STORYTELLER_CHALLENGES;
    } else if (this.dramaScore < 30) {
      pool = STORYTELLER_OPPORTUNITIES;
    } else {
      pool = STORYTELLER_CATALYSTS;
    }

    // Filter by cooldown
    const eligible = pool.filter(evt => {
      if (this.cooldowns[evt.id] && companyState.totalWeeks < this.cooldowns[evt.id]) return false;
      return true;
    });

    if (eligible.length === 0) return null;

    // Pick randomly
    const chosen = eligible[Math.floor(Math.random() * eligible.length)];

    // Set cooldown (once every ~50 weeks per specific event)
    this.cooldowns[chosen.id] = companyState.totalWeeks + 50;

    // Log
    this.history.push({ eventId: chosen.id, week: companyState.totalWeeks, drama: this.dramaScore });
    if (this.history.length > 30) this.history = this.history.slice(-30);

    // Return in same format as GAME_EVENTS
    return {
      ...chosen,
      triggerCondition: () => true,
      cooldownWeeks: 50,
    };
  }

  /** Alias: called by engine.tick() weekly */
  update(state) {
    this.updateDrama(state);
  }

  /** No-op: kept for backward compat with engine.newGame() */
  injectEvents() {}

  /**
   * Called by eventSystem.checkEvents() to bias event selection.
   * Given eligible events, prefer ones matching current drama mode.
   */
  selectEvent(eligible) {
    if (!eligible || eligible.length === 0) return null;
    // No bias from storyteller's own events — just pick randomly among eligible base events
    return eligible[Math.floor(Math.random() * eligible.length)];
  }

  /** Current drama mode label for UI */
  getDramaLabel() {
    if (this.dramaScore > 70) return { label: 'High Drama', color: '#f85149' };
    if (this.dramaScore < 30) return { label: 'Calm', color: '#3fb950' };
    return { label: 'Steady', color: '#58a6ff' };
  }

  serialize() {
    return {
      dramaScore: this.dramaScore,
      cooldowns: { ...this.cooldowns },
      history: [...this.history],
      _lastCash: this._lastCash,
    };
  }

  deserialize(data) {
    if (!data) return;
    this.dramaScore = data.dramaScore ?? 50;
    this.cooldowns = data.cooldowns || {};
    this.history = data.history || [];
    this._lastCash = data._lastCash || 70000;
  }

  reset() {
    this.dramaScore = 50;
    this.cooldowns = {};
    this.history = [];
    this._lastCash = 70000;
  }
}

// Global instance
const storytellerSystem = new StorytellerSystem();
