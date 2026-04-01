/**
 * Tech Empire — Tech History Timeline
 * 30 events mapped to game years, renamed from real companies.
 * Each event affects the market: genre boosts, sentiment shifts, new opportunities.
 * Players who know real tech history can anticipate and plan strategically.
 */

const TECH_TIMELINE_EVENTS = [
  // ── Early Years (Y1-Y5) ────────────────────────────────────────
  {
    id: 'tl_pear_ii',
    year: 2,
    title: 'Pear Computer releases the Pear II',
    desc: 'The Pear II brings personal computing to the masses. For the first time, ordinary people can own a computer. A new era of digital entertainment begins.',
    effect: { marketMult: 1.10, fansBonus: 500 },
    color: '#58a6ff',
  },
  {
    id: 'tl_arcade_golden_age',
    year: 3,
    title: 'The Golden Age of Arcades',
    desc: 'Arcades are everywhere. Quarters flow like water. Pac-Ghost, Space Blasters, and Donkey Ken dominate the scene. Gaming enters mainstream culture.',
    effect: { marketMult: 1.15, fansBonus: 1000 },
    color: '#3fb950',
  },
  {
    id: 'tl_microware_winos',
    year: 4,
    title: 'Microware launches WinOS',
    desc: 'Microware ships WinOS, a graphical operating system for the masses. 90% of desktops will run it within a decade. PC gaming is about to explode.',
    effect: { marketMult: 1.18, fansBonus: 1000 },
    color: '#58a6ff',
  },
  {
    id: 'tl_console_crash',
    year: 5,
    title: 'The Great Console Crash',
    desc: 'Flooded with shovelware, the console market collapses. Retailers dump cartridges for pennies. Only quality titles survive the bloodbath.',
    effect: { marketMult: 0.70, duration: 8, cashBonus: 0 },
    color: '#f85149',
  },

  // ── Mid Years (Y6-Y10) ────────────────────────────────────────
  {
    id: 'tl_dotcom_begins',
    year: 6,
    title: 'The dot-com bubble begins',
    desc: 'Investors are throwing money at anything with ".com" in the name. Game studios are valued at insane multiples. Easy money is flowing.',
    effect: { cashBonus: 20000, marketMult: 1.12 },
    color: '#3fb950',
  },
  {
    id: 'tl_cd_rom_era',
    year: 7,
    title: 'CD-ROM revolution transforms gaming',
    desc: 'CD-ROMs hold 700x more data than floppies. Full voice acting, video cutscenes, and orchestral soundtracks are now possible.',
    effect: { marketMult: 1.20, fansBonus: 2000 },
    color: '#3fb950',
  },
  {
    id: 'tl_opod',
    year: 8,
    title: 'Pear launches the oPod',
    desc: '1,000 songs in your pocket. Pear\'s oPod validates digital distribution at scale. Players will soon expect digital game purchases.',
    effect: { marketMult: 1.12, fansBonus: 2000 },
    color: '#58a6ff',
  },
  {
    id: 'tl_dotcom_bust',
    year: 9,
    title: 'Dot-com bubble bursts!',
    desc: 'The bubble has burst. Trillions in market cap evaporated overnight. Investors are shell-shocked. Only businesses with real revenue survive.',
    effect: { marketMult: 0.78, cashBonus: -15000, duration: 10 },
    color: '#f85149',
  },
  {
    id: 'tl_visage',
    year: 10,
    title: 'Visage launches social network',
    desc: 'A college student launches Visage from a dorm room. Social networking goes mainstream. Your games can now spread virally through friend networks.',
    effect: { fansBonus: 5000, marketMult: 1.12 },
    color: '#58a6ff',
  },

  // ── Expansion (Y11-Y15) ───────────────────────────────────────
  {
    id: 'tl_digital_stores',
    year: 11,
    title: 'Digital storefronts transform distribution',
    desc: 'Digital game stores change PC distribution forever. 70% revenue share, no physical manufacturing. Indies finally have a real shot.',
    effect: { marketMult: 1.25, cashBonus: 10000 },
    color: '#3fb950',
  },
  {
    id: 'tl_ophone',
    year: 12,
    title: 'Pear launches oPhone',
    desc: 'A phone, a music player, and an internet device — in one. Mobile gaming is born. Casual players outnumber core gamers for the first time.',
    effect: { marketMult: 1.30, fansBonus: 10000 },
    color: '#58a6ff',
  },
  {
    id: 'tl_streambox',
    year: 13,
    title: 'StreamBox launches game streaming',
    desc: 'StreamBox lets anyone broadcast their gameplay to the world. Streamers become celebrities. A game being streamed can sell a million copies overnight.',
    effect: { fansBonus: 8000, marketMult: 1.15 },
    color: '#da7cff',
  },
  {
    id: 'tl_cloudforce',
    year: 14,
    title: 'CloudForce dominates enterprise cloud',
    desc: 'CloudForce makes cloud infrastructure accessible to everyone. Live-service games, automatic updates, and cloud saves become player expectations.',
    effect: { marketMult: 1.10, fansBonus: 2000 },
    color: '#58a6ff',
  },
  {
    id: 'tl_crowdfunding',
    year: 15,
    title: 'Crowdfunding empowers indie studios',
    desc: 'CrowdLaunch lets studios raise money directly from fans. Spiritual successors to beloved classics raise millions in days.',
    effect: { cashBonus: 25000, marketMult: 1.12, fansBonus: 8000 },
    color: '#3fb950',
  },

  // ── Modern Era (Y16-Y20) ──────────────────────────────────────
  {
    id: 'tl_rideshare',
    year: 16,
    title: 'Ride-sharing disrupts transportation',
    desc: 'Ride-sharing apps prove the gig economy works at scale. The tech industry is now reshaping every sector. Gaming is next.',
    effect: { marketMult: 1.08, fansBonus: 3000 },
    color: '#8b949e',
  },
  {
    id: 'tl_crypto_mania',
    year: 17,
    title: 'Crypto mania begins',
    desc: 'BitCurrency hits $20K. Everyone is talking blockchain. NFT games promise players can "own" their items. The hype is deafening.',
    effect: { cashBonus: 15000, marketMult: 1.10 },
    color: '#d29922',
  },
  {
    id: 'tl_netflex',
    year: 18,
    title: 'NetFlex has 100M subscribers',
    desc: 'NetFlex proves subscription models work at massive scale. Game publishers take notice. "Game Pass" style services are coming.',
    effect: { marketMult: 1.15, fansBonus: 5000 },
    color: '#58a6ff',
  },
  {
    id: 'tl_crypto_crash',
    year: 19,
    title: 'Crypto crashes',
    desc: 'BitCurrency drops 80%. NFT games collapse. Players who "invested" in virtual items lost everything. Trust in blockchain gaming evaporates.',
    effect: { marketMult: 0.88, cashBonus: -10000 },
    color: '#f85149',
  },
  {
    id: 'tl_pandemic',
    year: 20,
    title: 'Pandemic shuts down live events, gaming booms',
    desc: 'A global pandemic forces everyone indoors. Gaming becomes the primary entertainment for billions. Player counts and revenue skyrocket overnight.',
    effect: { marketMult: 1.35, fansBonus: 20000, cashBonus: 30000 },
    color: '#3fb950',
  },

  // ── Cutting Edge (Y21-Y25+) ───────────────────────────────────
  {
    id: 'tl_chip_shortage',
    year: 21,
    title: 'Chip shortage hits global supply chains',
    desc: 'Semiconductor shortages cause console and PC prices to spike. Hardware is scarce. Studios pivot to mobile and cloud to reach players.',
    effect: { marketMult: 0.90, fansBonus: -3000 },
    color: '#d29922',
  },
  {
    id: 'tl_chatbot',
    year: 22,
    title: 'OpenBrain launches ChatBot',
    desc: 'OpenBrain\'s ChatBot AI assistant stuns the world. AI can write dialogue, generate art, and compose music. Game development is about to be disrupted.',
    effect: { marketMult: 1.18, fansBonus: 5000 },
    color: '#da7cff',
  },
  {
    id: 'tl_ai_funding',
    year: 23,
    title: 'AI startup funding explodes',
    desc: 'Billions pour into AI companies. Studios integrating AI ship 3x faster. The industry splits between AI-augmented and human-crafted games.',
    effect: { marketMult: 1.15, fansBonus: 8000 },
    color: '#da7cff',
  },
  {
    id: 'tl_quantum',
    year: 24,
    title: 'Quantum computing breakthrough',
    desc: 'A quantum computer solves a problem in 4 minutes that would take a supercomputer 10,000 years. Procedural generation and AI are about to leap forward.',
    effect: { marketMult: 1.12, fansBonus: 5000 },
    color: '#da7cff',
  },
  {
    id: 'tl_neural_interface',
    year: 25,
    title: 'Neural interface first human trial',
    desc: 'A startup successfully implants a brain-computer interface in a human. Direct neural input for gaming is no longer science fiction. It\'s a prototype.',
    effect: { marketMult: 1.20, fansBonus: 10000 },
    color: '#da7cff',
  },
  // ── Fill-in Events ────────────────────────────────────────────
  {
    id: 'tl_internet_public',
    year: 1,
    title: 'The home computer revolution begins',
    desc: 'Affordable home computers hit store shelves. BASIC programming and simple games captivate early adopters. The foundation of the gaming industry is laid.',
    effect: { fansBonus: 200 },
    color: '#8b949e',
  },
  {
    id: 'tl_console_revival',
    year: 6,
    title: 'Console gaming revives with new hardware',
    desc: 'After the crash, a new generation of consoles restores faith in gaming. Better hardware, stricter quality control. The industry rebounds stronger.',
    effect: { marketMult: 1.15, fansBonus: 3000 },
    color: '#3fb950',
  },
  {
    id: 'tl_mmo_era',
    year: 11,
    title: 'Massively Multiplayer Online games take off',
    desc: 'Subscription-based MMOs create virtual worlds with millions of players. Monthly revenue changes how studios think about game monetization.',
    effect: { marketMult: 1.18, fansBonus: 5000 },
    color: '#3fb950',
  },
  {
    id: 'tl_mobile_explosion',
    year: 15,
    title: 'Mobile gaming surpasses console revenue',
    desc: 'For the first time, mobile game revenue exceeds console and PC combined. Free-to-play with in-app purchases is the dominant model.',
    effect: { marketMult: 1.20, fansBonus: 12000 },
    color: '#3fb950',
  },
  {
    id: 'tl_vr_consumer',
    year: 23,
    title: 'Affordable VR headset hits 50M units',
    desc: 'A $299 VR headset achieves mass adoption. Virtual reality gaming is finally viable. A new platform hungry for content emerges overnight.',
    effect: { marketMult: 1.15, fansBonus: 10000 },
    color: '#58a6ff',
  },
];

// ── Timeline System ─────────────────────────────────────────────
class TechTimeline {
  constructor() {
    this.firedEvents = new Set();
  }

  /**
   * Check for timeline events to fire for the current year.
   * Returns array of events that just triggered.
   */
  checkTimelineEvents(currentYear) {
    const triggered = [];
    for (const evt of TECH_TIMELINE_EVENTS) {
      if (this.firedEvents.has(evt.id)) continue;
      if (currentYear >= evt.year) {
        triggered.push(evt);
        this.firedEvents.add(evt.id);
      }
    }
    return triggered;
  }

  /**
   * Apply a timeline event's effect to game state.
   * Returns a description string for notification.
   */
  applyEffect(evt, state) {
    const e = evt.effect;
    const parts = [];

    if (e.cashBonus && e.cashBonus > 0) {
      state.cash += e.cashBonus;
      parts.push(`+$${e.cashBonus.toLocaleString()}`);
    } else if (e.cashBonus && e.cashBonus < 0) {
      state.cash += e.cashBonus;
      parts.push(`-$${Math.abs(e.cashBonus).toLocaleString()}`);
    }

    if (e.fansBonus) {
      state.fans = Math.max(0, state.fans + e.fansBonus);
      if (e.fansBonus > 0) parts.push(`+${e.fansBonus.toLocaleString()} fans`);
      else parts.push(`${e.fansBonus.toLocaleString()} fans`);
    }

    if (e.marketMult && typeof marketSim !== 'undefined') {
      const currentSentiment = marketSim.sentiment || 1.0;
      const blended = currentSentiment * 0.4 + e.marketMult * 0.6;
      marketSim.sentiment = Math.max(0.3, Math.min(2.0, blended));
      parts.push(`Market ${e.marketMult >= 1 ? '+' : ''}${((e.marketMult - 1) * 100).toFixed(0)}%`);
    }

    return parts.join(', ');
  }

  /**
   * Get all timeline events sorted by year (for UI).
   */
  getFullTimeline() {
    return TECH_TIMELINE_EVENTS.slice().sort((a, b) => a.year - b.year);
  }

  /**
   * Get events that have already fired.
   */
  getFiredEvents() {
    return TECH_TIMELINE_EVENTS.filter(e => this.firedEvents.has(e.id));
  }

  serialize() {
    return { firedEvents: [...this.firedEvents] };
  }

  deserialize(data) {
    if (!data) return;
    this.firedEvents = new Set(data.firedEvents || []);
  }

  reset() {
    this.firedEvents = new Set();
  }
}

// Global instance
const techTimeline = new TechTimeline();
