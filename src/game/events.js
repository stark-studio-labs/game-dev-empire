/**
 * Tech Empire — Event System
 * Random events with branching choices and consequences.
 * Fires during gameplay ticks based on trigger conditions.
 */

const GAME_EVENTS = [
  // ── Market & Economy ──────────────────────────────────────────
  {
    id: 'market_crash',
    title: 'Market Crash',
    text: 'The gaming industry is in freefall. Consumer spending has dropped sharply as a major economic recession hits. Studios are closing left and right. Your investors are nervous and your cash reserves are at risk.',
    triggerCondition: (s) => s.year >= 3 && s.cash > 50000,
    cooldownWeeks: 200,
    options: [
      {
        label: 'Slash prices and push volume',
        description: 'Cut game prices to maintain sales during the downturn.',
        consequence: { adjustCash: -15000, adjustHype: 10, adjustFans: 2000, message: 'Price cuts hurt margins but kept fans buying. Lost $15K but gained loyalty.' },
      },
      {
        label: 'Hunker down and conserve cash',
        description: 'Freeze all non-essential spending until the storm passes.',
        consequence: { adjustCash: 5000, adjustHype: -15, adjustFans: -500, message: 'You weathered the storm with minimal losses, but your brand took a hit.' },
      },
      {
        label: 'Acquire a struggling competitor',
        description: 'Use your reserves to buy a failing studio at a discount.',
        consequence: { adjustCash: -40000, adjustHype: 20, adjustFans: 8000, message: 'Bold move! The acquisition brought talented staff and a cult following.' },
      },
    ],
  },
  {
    id: 'viral_bug',
    title: 'Viral Bug Goes Viral',
    text: 'A hilarious physics glitch in your latest release has gone viral on social media. Characters are ragdolling through walls and flying into orbit. Millions are watching clips and the internet is having a field day.',
    triggerCondition: (s) => s.games.length >= 1,
    cooldownWeeks: 150,
    options: [
      {
        label: 'Lean into it and make it a feature',
        description: 'Embrace the meme. Add a "chaos mode" toggle in the next patch.',
        consequence: { adjustCash: 5000, adjustHype: 25, adjustFans: 15000, message: 'The internet loves you for it. Chaos Mode became your most beloved feature.' },
      },
      {
        label: 'Rush out a hotfix immediately',
        description: 'Patch the bug ASAP to maintain professional reputation.',
        consequence: { adjustCash: -3000, adjustHype: -5, adjustFans: 1000, message: 'Bug fixed. The memes died down but so did the free publicity.' },
      },
    ],
  },
  {
    id: 'streamer_plays',
    title: 'Mega Streamer Plays Your Game',
    text: 'StreamKing99, one of the biggest streamers in the world with 40 million followers, just picked up your latest game on a whim and is livestreaming it RIGHT NOW. Chat is going wild. Your servers are getting hammered.',
    triggerCondition: (s) => s.games.length >= 2 && s.fans > 1000,
    cooldownWeeks: 180,
    options: [
      {
        label: 'Send them a special in-game gift',
        description: 'Reach out and offer an exclusive item or shoutout in the game.',
        consequence: { adjustCash: -2000, adjustHype: 30, adjustFans: 25000, message: 'StreamKing loved it and did THREE more streams. Your game is trending globally!' },
      },
      {
        label: 'Just watch and enjoy the moment',
        description: 'Let the organic buzz happen naturally.',
        consequence: { adjustCash: 0, adjustHype: 15, adjustFans: 10000, message: 'The stream brought a wave of new players. Nice organic growth!' },
      },
      {
        label: 'Offer a sponsorship deal',
        description: 'Negotiate a paid partnership for continued coverage.',
        consequence: { adjustCash: -20000, adjustHype: 35, adjustFans: 35000, message: 'Expensive but worth it. StreamKing became your brand ambassador.' },
      },
    ],
  },
  {
    id: 'ai_revolution',
    title: 'The AI Revolution',
    text: 'A breakthrough in AI-generated content is shaking the industry. Procedural generation tools can now create entire game worlds, dialogue trees, and soundtracks automatically. Some studios are replacing entire teams.',
    triggerCondition: (s) => s.year >= 8,
    cooldownWeeks: 250,
    options: [
      {
        label: 'Invest heavily in AI tools',
        description: 'Allocate R&D budget to integrate AI into your pipeline.',
        consequence: { adjustCash: -30000, adjustHype: 10, adjustFans: 5000, message: 'AI tools are supercharging your production. Development speed increased dramatically.' },
      },
      {
        label: 'Market your games as "handcrafted"',
        description: 'Double down on human-made quality as a brand differentiator.',
        consequence: { adjustCash: 0, adjustHype: 20, adjustFans: 12000, message: '"Made by humans, for humans" resonated with players tired of soulless AI content.' },
      },
      {
        label: 'Wait and see how it plays out',
        description: 'Let others be the guinea pigs. Adopt once the tech matures.',
        consequence: { adjustCash: 0, adjustHype: -5, adjustFans: 0, message: 'You fell behind early adopters but avoided the worst AI mistakes.' },
      },
    ],
  },
  {
    id: 'crunch_time',
    title: 'Crunch Time Crisis',
    text: 'Your team is exhausted. A major deadline is approaching and your lead developer just told you the game needs at least two more months of polish. Team morale is at rock bottom. Something has to give.',
    triggerCondition: (s) => s.staff.length >= 2 && s.currentGame !== null,
    cooldownWeeks: 120,
    options: [
      {
        label: 'Push through with mandatory overtime',
        description: 'The deadline is sacred. Everyone works weekends until launch.',
        consequence: { adjustCash: 0, adjustHype: 5, adjustFans: -3000, message: 'Game shipped on time but two team members quit from burnout.' },
      },
      {
        label: 'Delay the game and give the team rest',
        description: 'A delayed game is eventually good. A bad game is bad forever.',
        consequence: { adjustCash: -10000, adjustHype: -10, adjustFans: 5000, message: 'The delay cost money but the team came back energized. Quality went up.' },
      },
      {
        label: 'Cut features to hit the deadline',
        description: 'Ship a leaner version now, patch in the rest later.',
        consequence: { adjustCash: 2000, adjustHype: -15, adjustFans: -2000, message: 'Players noticed the missing features. "Feels incomplete" became the top review.' },
      },
    ],
  },
  {
    id: 'data_breach',
    title: 'Data Breach!',
    text: 'BREAKING: Hackers have breached your player database. Email addresses, usernames, and hashed passwords of thousands of players are circulating on dark web forums. The press is calling. Players are furious.',
    triggerCondition: (s) => s.fans > 10000 && s.year >= 5,
    cooldownWeeks: 300,
    options: [
      {
        label: 'Full transparency and free compensation',
        description: 'Issue a public statement, offer free games/DLC, and hire a security firm.',
        consequence: { adjustCash: -25000, adjustHype: -10, adjustFans: -2000, message: 'Expensive but your honest response earned respect. Trust slowly rebuilding.' },
      },
      {
        label: 'Minimize and deflect',
        description: 'Downplay the breach scope and quietly patch the vulnerability.',
        consequence: { adjustCash: -5000, adjustHype: -30, adjustFans: -15000, message: 'The coverup was worse than the crime. Journalists exposed the full extent.' },
      },
    ],
  },
  {
    id: 'indie_award',
    title: 'Indie Game Award Nomination!',
    text: 'Incredible news! Your latest game has been nominated for the prestigious Golden Pixel Award for Best Indie Game. The ceremony is next month and the whole industry will be watching.',
    triggerCondition: (s) => s.games.length >= 3 && s.games[s.games.length - 1] && s.games[s.games.length - 1].reviewAvg >= 7,
    cooldownWeeks: 200,
    options: [
      {
        label: 'Go all-out on the acceptance speech prep',
        description: 'Hire a PR team and prepare a killer presentation.',
        consequence: { adjustCash: -8000, adjustHype: 25, adjustFans: 15000, message: 'You won! Your speech went viral and downloads spiked 300%!' },
      },
      {
        label: 'Stay humble and let the work speak',
        description: 'Show up, be genuine, and thank your team.',
        consequence: { adjustCash: 0, adjustHype: 15, adjustFans: 8000, message: 'The nomination alone boosted your credibility enormously.' },
      },
    ],
  },
  {
    id: 'goty_nomination',
    title: 'Game of the Year Nomination!',
    text: 'Your latest masterpiece has been nominated for GAME OF THE YEAR at The Game Awards. You\'re up against the biggest AAA studios in the world. The gaming community is rallying behind you.',
    triggerCondition: (s) => s.games.length >= 5 && s.games[s.games.length - 1] && s.games[s.games.length - 1].reviewAvg >= 9,
    cooldownWeeks: 400,
    options: [
      {
        label: 'Launch a massive fan campaign',
        description: 'Rally your community to vote. Social media blitz.',
        consequence: { adjustCash: -15000, adjustHype: 40, adjustFans: 50000, message: 'THE CROWD GOES WILD! You won Game of the Year! Your studio is legendary!' },
      },
      {
        label: 'Focus on your next game instead',
        description: 'Awards are nice but shipping great games matters more.',
        consequence: { adjustCash: 0, adjustHype: 20, adjustFans: 20000, message: 'You didn\'t win but the nomination put you on the map permanently.' },
      },
    ],
  },
  {
    id: 'review_bombing',
    title: 'Review Bombing Attack',
    text: 'An angry mob of internet trolls has coordinated a review bombing campaign against your latest game. Thousands of fake negative reviews are flooding every platform. Your rating is plummeting.',
    triggerCondition: (s) => s.games.length >= 2 && s.fans > 5000,
    cooldownWeeks: 200,
    options: [
      {
        label: 'Fight back publicly',
        description: 'Call out the fake reviews and rally your real fans.',
        consequence: { adjustCash: 0, adjustHype: 10, adjustFans: 8000, message: 'Your fans rallied and counter-reviewed. The Streisand effect worked in your favor!' },
      },
      {
        label: 'Report to platforms and wait it out',
        description: 'File reports with review platforms and let them handle it.',
        consequence: { adjustCash: 0, adjustHype: -10, adjustFans: -3000, message: 'Platforms eventually removed the fake reviews but the damage lingered.' },
      },
      {
        label: 'Release a free content update',
        description: 'Drown out negativity with goodwill and new content.',
        consequence: { adjustCash: -12000, adjustHype: 15, adjustFans: 10000, message: 'The free update won hearts. "Best developer response ever" trended online.' },
      },
    ],
  },
  {
    id: 'subscription_revolution',
    title: 'Subscription Model Revolution',
    text: 'A major platform just launched a "Game Pass" style service offering unlimited games for $10/month. Traditional game sales are declining. Every studio is debating whether to join or resist.',
    triggerCondition: (s) => s.year >= 12,
    cooldownWeeks: 300,
    options: [
      {
        label: 'Join the subscription service',
        description: 'Put your catalog on the service for guaranteed upfront payments.',
        consequence: { adjustCash: 35000, adjustHype: 5, adjustFans: 20000, message: 'Guaranteed revenue and massive exposure. Your back catalog found a whole new audience.' },
      },
      {
        label: 'Stay independent and premium',
        description: 'Your games are worth full price. Don\'t devalue them.',
        consequence: { adjustCash: 0, adjustHype: 10, adjustFans: -5000, message: 'Premium positioning maintained but you missed the casual audience wave.' },
      },
      {
        label: 'Launch your own subscription service',
        description: 'Build a direct-to-consumer subscription platform.',
        consequence: { adjustCash: -50000, adjustHype: 20, adjustFans: 30000, message: 'Expensive gamble but you now own the relationship with your players.' },
      },
    ],
  },
  // ── Industry & Culture ────────────────────────────────────────
  {
    id: 'engine_licensing',
    title: 'Engine Licensing Opportunity',
    text: 'A smaller studio has approached you, impressed by your game\'s technical quality. They want to license your game engine for their own projects. This could be a steady revenue stream.',
    triggerCondition: (s) => s.games.length >= 4 && s.year >= 6,
    cooldownWeeks: 250,
    options: [
      {
        label: 'License the engine exclusively',
        description: 'Grant exclusive rights for a large upfront fee.',
        consequence: { adjustCash: 50000, adjustHype: 5, adjustFans: 0, message: 'Nice payday! The licensing deal brings in steady revenue.' },
      },
      {
        label: 'Open-source it for community goodwill',
        description: 'Release the engine for free and build developer community.',
        consequence: { adjustCash: 0, adjustHype: 25, adjustFans: 15000, message: 'Developers love you. The open-source community is contributing improvements back!' },
      },
      {
        label: 'Decline and keep the competitive advantage',
        description: 'Your tech is your moat. Don\'t give it away.',
        consequence: { adjustCash: 0, adjustHype: 0, adjustFans: 0, message: 'You kept your technical edge. Smart? Maybe. Boring? Definitely.' },
      },
    ],
  },
  {
    id: 'talent_poaching',
    title: 'Talent Poaching',
    text: 'A mega-corp is aggressively recruiting your best developers. They\'re offering double salaries, stock options, and corner offices. Your team lead just got a call.',
    triggerCondition: (s) => s.staff.length >= 3,
    cooldownWeeks: 150,
    options: [
      {
        label: 'Match the offers with raises',
        description: 'Give everyone a significant pay bump to retain them.',
        consequence: { adjustCash: -20000, adjustHype: 0, adjustFans: 0, message: 'Team stays intact but your payroll just got significantly heavier.' },
      },
      {
        label: 'Offer equity and creative freedom instead',
        description: 'Can\'t match the money but you can offer ownership and autonomy.',
        consequence: { adjustCash: 0, adjustHype: 5, adjustFans: 2000, message: 'Most stayed for the culture. One left but the team grew closer.' },
      },
    ],
  },
  {
    id: 'gaming_convention',
    title: 'Major Gaming Convention',
    text: 'The annual GameExpo is coming up -- the biggest gaming convention of the year. Every major studio will be there. This is your chance to make a splash on the world stage.',
    triggerCondition: (s) => s.year >= 2 && s.games.length >= 1,
    cooldownWeeks: 100,
    options: [
      {
        label: 'Go big with a flashy booth',
        description: 'Rent a massive booth, hire cosplayers, livestream everything.',
        consequence: { adjustCash: -18000, adjustHype: 30, adjustFans: 12000, message: 'Your booth was the talk of the convention! Lines wrapped around the hall.' },
      },
      {
        label: 'Attend modestly and network',
        description: 'Small booth, focus on meeting press and industry contacts.',
        consequence: { adjustCash: -3000, adjustHype: 10, adjustFans: 3000, message: 'Made great connections and got featured in several press roundups.' },
      },
      {
        label: 'Skip it and shadow-drop a trailer online',
        description: 'While everyone\'s at the expo, drop a surprise announcement.',
        consequence: { adjustCash: -1000, adjustHype: 20, adjustFans: 8000, message: 'The surprise drop stole headlines from the convention floor!' },
      },
    ],
  },
  {
    id: 'government_regulation',
    title: 'New Gaming Regulations',
    text: 'The government is introducing new regulations on loot boxes, microtransactions, and age ratings. Compliance will require significant changes to your upcoming releases.',
    triggerCondition: (s) => s.year >= 10,
    cooldownWeeks: 300,
    options: [
      {
        label: 'Comply early and lead the industry',
        description: 'Be the first studio to fully comply and publicize it.',
        consequence: { adjustCash: -10000, adjustHype: 15, adjustFans: 10000, message: 'Players praised your ethical stance. "Finally a studio that cares!" went viral.' },
      },
      {
        label: 'Lobby against the regulations',
        description: 'Join the industry coalition fighting the new rules.',
        consequence: { adjustCash: -5000, adjustHype: -20, adjustFans: -8000, message: 'Bad look. The public doesn\'t sympathize with studios fighting consumer protections.' },
      },
    ],
  },
  {
    id: 'modding_community',
    title: 'Modding Community Explosion',
    text: 'Players have started modding your latest game and the results are incredible. One mod adds an entire new campaign. Another overhauls the graphics. Your game is experiencing a second life.',
    triggerCondition: (s) => s.games.length >= 3 && s.fans > 8000,
    cooldownWeeks: 200,
    options: [
      {
        label: 'Release official mod tools',
        description: 'Invest in a modding SDK and Steam Workshop integration.',
        consequence: { adjustCash: -15000, adjustHype: 20, adjustFans: 20000, message: 'The modding scene exploded! Your game is now a platform, not just a product.' },
      },
      {
        label: 'Hire the best modders',
        description: 'Recruit the top modders to work on your next game.',
        consequence: { adjustCash: -8000, adjustHype: 10, adjustFans: 5000, message: 'Three talented modders joined the team. Community was bittersweet but understood.' },
      },
      {
        label: 'Send cease and desist letters',
        description: 'Protect your IP. Mods could contain unauthorized content.',
        consequence: { adjustCash: 0, adjustHype: -25, adjustFans: -15000, message: 'DISASTER. The gaming community turned on you. #BoycottYourStudio trended for days.' },
      },
    ],
  },
  {
    id: 'esports_opportunity',
    title: 'Esports Tournament Invitation',
    text: 'A major esports organization wants to feature your competitive multiplayer game in their next tournament series. Prize pool: $500K. Viewership expected: 10 million+.',
    triggerCondition: (s) => s.games.length >= 4 && s.fans > 20000 && s.year >= 8,
    cooldownWeeks: 250,
    options: [
      {
        label: 'Sponsor the tournament',
        description: 'Put up half the prize pool and get top billing.',
        consequence: { adjustCash: -35000, adjustHype: 35, adjustFans: 40000, message: 'The tournament was a smash hit! Your game is now an esports staple.' },
      },
      {
        label: 'Participate but don\'t sponsor',
        description: 'Let them feature your game without financial commitment.',
        consequence: { adjustCash: 0, adjustHype: 15, adjustFans: 12000, message: 'Good exposure at zero cost. Not the headline act but still benefited.' },
      },
    ],
  },

  // ── Employee Drama ─────────────────────────────────────────────
  {
    id: 'dev_poached',
    title: 'Talent Poaching Attempt',
    text: 'A rival studio has been quietly approaching your best developer with a lucrative offer: double their salary and a lead role on a high-profile project. They came to you first out of loyalty — but they\'re clearly tempted.',
    triggerCondition: (s) => s.staff.length >= 3 && s.year >= 2,
    cooldownWeeks: 100,
    options: [
      {
        label: 'Match the offer with a raise',
        description: 'Show them they\'re valued. Cost: significant, but retention is worth it.',
        consequence: { adjustCash: -8000, adjustMorale: 5, message: 'They stayed! Word spread that you reward loyalty. Team morale got a boost.' },
      },
      {
        label: 'Let them go, hire fresh talent',
        description: 'Sometimes change is healthy. Wish them well and start recruiting.',
        consequence: { adjustCash: -3000, adjustMorale: -10, message: 'They left. The team feels uneasy. Recruiting costs are adding up.' },
      },
      {
        label: 'Counter with equity and flex time',
        description: 'Offer something money can\'t fully buy — ownership and autonomy.',
        consequence: { adjustCash: 0, adjustMorale: 8, adjustFans: 0, message: 'They\'re staying! The equity offer created a new level of commitment across the whole team.' },
      },
    ],
  },
  {
    id: 'raise_demand',
    title: 'Raise Demand',
    text: 'Your most experienced developer just requested a formal meeting. They\'ve been tracking market rates and feel they\'re significantly underpaid for their contribution. They\'re calm, professional — and clearly serious.',
    triggerCondition: (s) => s.staff.length >= 2 && s.fans > 2000,
    cooldownWeeks: 80,
    options: [
      {
        label: 'Grant the full raise',
        description: 'Acknowledge their worth and pay accordingly.',
        consequence: { adjustCash: -12000, adjustMorale: 12, message: 'Loyalty rewarded. The entire team noticed and morale jumped across the board.' },
      },
      {
        label: 'Negotiate to a 20% bump',
        description: 'Meet in the middle. It\'s fair and affordable.',
        consequence: { adjustCash: -6000, adjustMorale: 3, message: 'They accepted the partial raise. Not thrilled, but they\'re staying.' },
      },
      {
        label: 'Decline — budget is tight',
        description: 'Be honest about the financial reality.',
        consequence: { adjustCash: 0, adjustMorale: -15, message: 'They\'re visibly unhappy. Word got out. The team is quietly looking at job boards.' },
      },
    ],
  },
  {
    id: 'creative_fight',
    title: 'Creative Disagreement',
    text: 'Two of your senior developers have reached an impasse on the current game\'s design direction. The tech lead wants a systems-driven experience. The lead designer wants a narrative-focused one. Both are digging in. Development is grinding to a halt.',
    triggerCondition: (s) => s.staff.length >= 3 && s.currentGame !== null,
    cooldownWeeks: 90,
    options: [
      {
        label: 'Side with the tech lead\'s vision',
        description: 'Systems depth will resonate with hardcore players.',
        consequence: { adjustCash: 0, adjustMorale: -5, message: 'Direction set. The designer is quiet but the game is moving forward.' },
      },
      {
        label: 'Side with the designer\'s vision',
        description: 'Story-driven games reach broader audiences.',
        consequence: { adjustCash: 0, adjustMorale: -5, message: 'Direction set. The tech lead is grumbling but respects the call.' },
      },
      {
        label: 'Hold a team vote and commit to the result',
        description: 'Let the whole studio decide. Democracy takes time but builds buy-in.',
        consequence: { adjustCash: 0, adjustMorale: 10, message: 'The vote happened. Everyone accepts the result because they were part of the process.' },
      },
    ],
  },
  {
    id: 'side_project_viral',
    title: 'Side Project Goes Viral',
    text: 'One of your developers built a tiny two-hour game in their spare time "just for fun" and posted it online. It now has 200K downloads in 48 hours, glowing reviews, and multiple gaming journalists are asking about your studio.',
    triggerCondition: (s) => s.staff.length >= 2 && s.year >= 2,
    cooldownWeeks: 180,
    options: [
      {
        label: 'Celebrate and give them a cash bonus',
        description: 'Reward initiative. This is exactly the kind of passion you want.',
        consequence: { adjustCash: -3000, adjustMorale: 15, adjustFans: 2000, message: 'Bonus given. The developer is energized and the team is inspired.' },
      },
      {
        label: 'Recruit it into the official pipeline',
        description: 'Turn the viral hit into a full product under the studio banner.',
        consequence: { adjustCash: 0, adjustMorale: 10, adjustFans: 8000, message: 'The community loves that you\'re expanding it. Significant fan and attention boost.' },
      },
      {
        label: 'Ask them to focus on studio projects',
        description: 'Side projects divide attention. Gently redirect their energy.',
        consequence: { adjustCash: 0, adjustMorale: -8, message: 'They nodded but looked deflated. The viral moment passed without follow-through.' },
      },
    ],
  },
  {
    id: 'burnout_leave',
    title: 'Burnout Leave Request',
    text: 'Your most senior developer sent you a private message: they\'re burnt out and need two weeks of mental health leave. They\'ve been running on empty for months. They apologize for the timing and promise to make it up, but they\'re not really asking — they\'re telling you.',
    triggerCondition: (s) => s.staff.length >= 2 && s.morale < 50,
    cooldownWeeks: 100,
    options: [
      {
        label: 'Fully support them — paid leave, no questions',
        description: 'Their wellbeing comes first. Cover their work, no exceptions.',
        consequence: { adjustCash: -5000, adjustMorale: 12, message: 'They came back refreshed and grateful. The team noticed how you handled it.' },
      },
      {
        label: 'Approve leave, redistribute the work',
        description: 'The project continues, the team absorbs the workload.',
        consequence: { adjustCash: 0, adjustMorale: -5, message: 'Leave approved, but the extra workload is straining the rest of the team.' },
      },
      {
        label: 'Deny it — the deadline can\'t slip',
        description: 'You need everyone on deck right now.',
        consequence: { adjustCash: 0, adjustMorale: -20, message: 'They showed up, but barely. Three others started job searching the same day.' },
      },
    ],
  },
  {
    id: 'new_skill_learned',
    title: 'Developer Leveled Up',
    text: 'One of your team members has been quietly learning a new game engine in their evenings and weekends. They just completed an advanced certification — entirely self-funded — and they\'re excited to apply it. They\'re asking for a chance to use it on the next project.',
    triggerCondition: (s) => s.staff.length >= 2 && s.year >= 1,
    cooldownWeeks: 120,
    options: [
      {
        label: 'Sponsor their next certification and promote them',
        description: 'Invest in their growth. It pays dividends.',
        consequence: { adjustCash: -2000, adjustMorale: 10, message: 'They\'re thriving. Word spread that your studio invests in people.' },
      },
      {
        label: 'Acknowledge it publicly and give them a new responsibility',
        description: 'Recognition costs nothing and means everything.',
        consequence: { adjustCash: 0, adjustMorale: 7, message: 'A quick shoutout in the team meeting went a long way. Morale is up.' },
      },
      {
        label: 'Note it for the next performance review',
        description: 'It\'s good but you\'ll address it through the formal process.',
        consequence: { adjustCash: 0, adjustMorale: -3, message: 'The bureaucratic response was deflating. They still appreciated the note — barely.' },
      },
    ],
  },
  {
    id: 'team_celebration',
    title: 'Team Wants to Celebrate',
    text: 'The reviews are in and your latest game hit a new quality high for the studio. The team is electric — people are hugging in the hallway, someone put a party hat on the office monitor. They\'re looking at you waiting for the signal.',
    triggerCondition: (s) => s.games.length >= 2 && s.games[s.games.length - 1] && s.games[s.games.length - 1].reviewAvg >= 7.5,
    cooldownWeeks: 100,
    options: [
      {
        label: 'Throw a full studio party — your treat',
        description: 'Go big. This moment deserves it.',
        consequence: { adjustCash: -5000, adjustMorale: 22, adjustFans: 1000, message: 'Epic party. Photos circulated online. The team is fully recharged.' },
      },
      {
        label: 'Team dinner on the company',
        description: 'Meaningful, personal, within budget.',
        consequence: { adjustCash: -1500, adjustMorale: 13, message: 'Great dinner. Real conversations happened. Team cohesion strengthened.' },
      },
      {
        label: 'Post a heartfelt thank-you to the team',
        description: 'Words matter. A sincere message costs nothing.',
        consequence: { adjustCash: 0, adjustMorale: 6, message: 'The message was well-received. Small gesture, real impact.' },
      },
    ],
  },
  {
    id: 'office_prank',
    title: 'Prank War Escalation',
    text: 'It started small: someone wrapped a coworker\'s keyboard in foil. Then a desk was rearranged into the hallway. Now someone has replaced every desktop wallpaper with a photo of the office manager\'s dog wearing a tuxedo. It\'s funny — but it\'s getting out of hand.',
    triggerCondition: (s) => s.staff.length >= 3 && s.morale >= 50,
    cooldownWeeks: 150,
    options: [
      {
        label: 'Embrace the chaos — it\'s good culture',
        description: 'Laughter is a productivity tool. Let it play out.',
        consequence: { adjustCash: 0, adjustMorale: 10, message: 'The prank war peaked gloriously and faded. Team bonding: maximized.' },
      },
      {
        label: 'Set clear limits but join in the fun',
        description: 'Have one good laugh then redirect the energy.',
        consequence: { adjustCash: 0, adjustMorale: 5, message: 'You pulled off the final prank yourself. Perfect leadership moment.' },
      },
      {
        label: 'Send a professional environment memo',
        description: 'Keep focus. This is a workplace.',
        consequence: { adjustCash: 0, adjustMorale: -5, message: 'The memo was mocked quietly for a week. The energy drained from the room.' },
      },
    ],
  },
];

/**
 * EventSystem — manages event firing, cooldowns, and state
 */
class EventSystem {
  constructor() {
    this.cooldowns = {};      // eventId -> earliest week it can fire again
    this.pendingEvent = null;  // current event waiting for player choice
    this.eventHistory = [];    // log of past events
  }

  /**
   * Check if any events should fire this tick.
   * Called from engine.tick(). Returns an event object or null.
   */
  checkEvents(state) {
    // Don't fire events if one is already pending
    if (this.pendingEvent) return null;

    // Only check events every 4 weeks (monthly) with random chance
    if (state.totalWeeks % 4 !== 0) return null;

    // Base chance: 15% per month, increasing slightly with game age
    const baseChance = 0.15 + Math.min(state.year * 0.005, 0.1);
    if (Math.random() > baseChance) return null;

    // Collect eligible events
    const eligible = GAME_EVENTS.filter(evt => {
      // Check cooldown
      if (this.cooldowns[evt.id] && state.totalWeeks < this.cooldowns[evt.id]) return false;
      // Check trigger condition
      try {
        return evt.triggerCondition(state);
      } catch (e) {
        return false;
      }
    });

    if (eligible.length === 0) return null;

    // Storyteller selects narrative-appropriate event when available
    const chosen = (typeof storyteller !== 'undefined' && typeof storyteller.selectEvent === 'function')
      ? storyteller.selectEvent(eligible)
      : eligible[Math.floor(Math.random() * eligible.length)];

    // Set cooldown
    this.cooldowns[chosen.id] = state.totalWeeks + chosen.cooldownWeeks;

    // Set as pending
    this.pendingEvent = { ...chosen };
    return this.pendingEvent;
  }

  /**
   * Player makes a choice on the pending event.
   * Returns the consequence object.
   */
  resolveEvent(optionIndex, state) {
    if (!this.pendingEvent) return null;

    const option = this.pendingEvent.options[optionIndex];
    if (!option) return null;

    const consequence = option.consequence;

    // Apply consequences
    if (consequence.adjustCash) state.cash += consequence.adjustCash;
    if (consequence.adjustFans) state.fans = Math.max(0, state.fans + consequence.adjustFans);
    if (consequence.adjustMorale && typeof moraleSystem !== 'undefined') {
      moraleSystem.applyEvent('custom', state.totalWeeks, consequence.adjustMorale);
      state.morale = moraleSystem.getMorale();
    }

    // Log to history
    this.eventHistory.push({
      eventId: this.pendingEvent.id,
      title: this.pendingEvent.title,
      choiceLabel: option.label,
      consequence: consequence.message,
      week: state.totalWeeks,
      year: state.year,
    });

    // Keep last 20 events in history
    if (this.eventHistory.length > 20) {
      this.eventHistory = this.eventHistory.slice(-20);
    }

    const result = { ...consequence, eventTitle: this.pendingEvent.title };
    this.pendingEvent = null;

    return result;
  }

  /** Clear the pending event without resolving */
  dismissEvent() {
    this.pendingEvent = null;
  }

  serialize() {
    return {
      cooldowns: { ...this.cooldowns },
      eventHistory: [...this.eventHistory],
    };
  }

  deserialize(data) {
    if (!data) return;
    this.cooldowns = data.cooldowns || {};
    this.eventHistory = data.eventHistory || [];
    this.pendingEvent = null;
  }

  reset() {
    this.cooldowns = {};
    this.pendingEvent = null;
    this.eventHistory = [];
  }
}

// Global instance
const eventSystem = new EventSystem();
