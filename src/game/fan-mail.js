/**
 * Tech Empire — Fan Mail System
 * Generates flavor text from "players" after each game release.
 */
const FAN_MAIL_TEMPLATES = {
  high: [
    { user: 'xXGameLordXx', text: "I've played {title} for 200 hours and I still can't stop!" },
    { user: 'CasualSam', text: "Best {genre} game I've ever played. 10/10 would recommend!" },
    { user: 'ReviewerJane', text: "{title} is a masterpiece. {topic} has never been done this well." },
    { user: 'SpeedRunner42', text: "Already speedrunning {title}. Current WR is 3:42:16." },
    { user: 'NightOwlGamer', text: "Called in sick to finish {title}. No regrets." },
    { user: 'PixelPerfect', text: "The {genre} mechanics in {title} are *chef's kiss*" },
    { user: 'StreamQueen', text: "Streamed {title} for 12 hours straight. Chat went wild." },
  ],
  mid: [
    { user: 'Average_Andy', text: "{title} is... fine. Not bad, not great. Just fine." },
    { user: 'PatientGamer', text: "I'll wait for a sale on {title}. Decent but not a must-buy." },
    { user: 'CriticalCarl', text: "The {topic} theme in {title} had potential but fell flat." },
    { user: 'BudgetBob', text: "Got {title} in a bundle. Worth it for the price." },
    { user: 'NostalgiaFan', text: "Reminds me of older {genre} games. Not quite as good though." },
  ],
  low: [
    { user: 'AngryGamer99', text: "I want a refund for {title}. What were they thinking?" },
    { user: 'TrustNoHype', text: "Don't believe the marketing. {title} is a mess." },
    { user: 'QA_Dropout', text: "Did anyone even playtest {title}? So many bugs." },
    { user: 'RefundKing', text: "Returned {title} after 20 minutes. Life is too short." },
    { user: 'HonestReviewer', text: "The {genre} genre deserves better than {title}." },
  ],
};

class FanMailSystem {
  generateMail(game) {
    const score = game.reviewAvg || 5;
    const pool = score >= 8 ? FAN_MAIL_TEMPLATES.high : score >= 5 ? FAN_MAIL_TEMPLATES.mid : FAN_MAIL_TEMPLATES.low;
    const count = 3 + Math.floor(Math.random() * 3); // 3-5 quotes
    const shuffled = pool.slice().sort(() => Math.random() - 0.5).slice(0, count);
    return shuffled.map(tmpl => ({
      user: tmpl.user,
      text: tmpl.text
        .replace(/\{title\}/g, game.title)
        .replace(/\{genre\}/g, game.genre)
        .replace(/\{topic\}/g, game.topic),
    }));
  }
}

const fanMailSystem = new FanMailSystem();
