/**
 * Tech Empire -- Marketing Campaign System
 * Run marketing campaigns before game release to build hype
 * and boost first-week sales.
 */

const CAMPAIGN_TYPES = [
  {
    id: 'social_media',
    name: 'Social Media',
    cost: 1000,
    hype: 5,
    duration: 2,
    icon: '\uD83D\uDCF1',
    description: 'Organic social media push across all platforms',
    random: false,
  },
  {
    id: 'viral_marketing',
    name: 'Viral Marketing',
    cost: 2000,
    hype: 8,       // minimum
    hypeMax: 25,   // maximum (random range)
    duration: 3,
    icon: '\uD83D\uDD25',
    description: 'Risky viral campaign -- could blow up or fizzle',
    random: true,
  },
  {
    id: 'print_ads',
    name: 'Print Ads',
    cost: 3000,
    hype: 8,
    duration: 3,
    icon: '\uD83D\uDCF0',
    description: 'Magazine and newspaper advertising',
    random: false,
  },
  {
    id: 'influencer',
    name: 'Influencer',
    cost: 5000,
    hype: 15,
    duration: 2,
    icon: '\uD83C\uDF1F',
    description: 'Partner with top gaming influencers',
    random: false,
  },
  {
    id: 'game_convention',
    name: 'Game Convention',
    cost: 10000,
    hype: 20,
    duration: 4,
    icon: '\uD83C\uDFAE',
    description: 'Show your game at a major convention (+fans bonus)',
    random: false,
    fanBonus: 2000,
  },
  {
    id: 'tv_commercial',
    name: 'TV Commercial',
    cost: 20000,
    hype: 30,
    duration: 3,
    icon: '\uD83D\uDCFA',
    description: 'Prime-time television advertisement',
    random: false,
  },
];

class MarketingSystem {
  constructor() {
    this.activeCampaigns = [];   // [{ campaignId, weeksLeft, totalWeeks, hypeGenerated, gameTitle }]
    this.totalHype = 0;          // Accumulated hype for current/next game
    this.campaignHistory = [];   // [{ campaignId, gameTitle, hypeGenerated, cost, week }]
    this.fanBonusPending = 0;    // Fans to add on game release
  }

  /** Get available campaign types */
  getCampaignTypes() {
    return CAMPAIGN_TYPES;
  }

  /** Get active campaigns */
  getActiveCampaigns() {
    return this.activeCampaigns;
  }

  /** Get current total hype */
  getHype() {
    return Math.round(this.totalHype);
  }

  /**
   * Get the sales multiplier based on accumulated hype.
   * 0 hype = 1.0x, 100 hype = 2.0x, 200+ hype = 3.0x (capped)
   */
  getSalesMultiplier() {
    if (this.totalHype <= 0) return 1.0;
    // Logarithmic scaling: diminishing returns on hype
    const mult = 1.0 + Math.min(2.0, this.totalHype / 100);
    return Math.round(mult * 100) / 100;
  }

  /**
   * Launch a marketing campaign.
   * @param {string} campaignId - The campaign type ID
   * @param {string} gameTitle - Title of the game being marketed
   * @returns {{ success: boolean, cost: number, message: string }}
   */
  launchCampaign(campaignId, gameTitle) {
    const type = CAMPAIGN_TYPES.find(c => c.id === campaignId);
    if (!type) return { success: false, cost: 0, message: 'Unknown campaign type' };

    // Check if already running this type
    const alreadyRunning = this.activeCampaigns.some(c => c.campaignId === campaignId);
    if (alreadyRunning) {
      return { success: false, cost: 0, message: `${type.name} campaign already running` };
    }

    // Calculate actual hype (randomized for viral)
    let hypeGenerated;
    if (type.random) {
      hypeGenerated = type.hype + Math.floor(Math.random() * (type.hypeMax - type.hype + 1));
    } else {
      hypeGenerated = type.hype;
    }

    this.activeCampaigns.push({
      campaignId: type.id,
      name: type.name,
      icon: type.icon,
      weeksLeft: type.duration,
      totalWeeks: type.duration,
      hypeGenerated,
      gameTitle,
      cost: type.cost,
    });

    // Fan bonus for convention
    if (type.fanBonus) {
      this.fanBonusPending += type.fanBonus;
    }

    return { success: true, cost: type.cost, message: `Launched ${type.name} campaign!` };
  }

  /**
   * Weekly tick -- advance all active campaigns.
   * @returns {Array} events (completed campaigns)
   */
  weeklyTick() {
    const events = [];

    for (let i = this.activeCampaigns.length - 1; i >= 0; i--) {
      const campaign = this.activeCampaigns[i];
      campaign.weeksLeft--;

      if (campaign.weeksLeft <= 0) {
        // Campaign complete -- add hype
        this.totalHype += campaign.hypeGenerated;

        this.campaignHistory.push({
          campaignId: campaign.campaignId,
          name: campaign.name,
          gameTitle: campaign.gameTitle,
          hypeGenerated: campaign.hypeGenerated,
          cost: campaign.cost,
        });

        // Keep last 20 history entries
        if (this.campaignHistory.length > 20) {
          this.campaignHistory = this.campaignHistory.slice(-20);
        }

        events.push({
          type: 'campaign_complete',
          name: campaign.name,
          hype: campaign.hypeGenerated,
        });

        this.activeCampaigns.splice(i, 1);
      }
    }

    return events;
  }

  /**
   * Called when a game is released -- returns the fan bonus and resets hype.
   * @returns {{ salesMultiplier: number, fanBonus: number, totalHype: number }}
   */
  onGameRelease() {
    const result = {
      salesMultiplier: this.getSalesMultiplier(),
      fanBonus: this.fanBonusPending,
      totalHype: this.getHype(),
    };

    // Reset hype for next game
    this.totalHype = 0;
    this.fanBonusPending = 0;

    return result;
  }

  /** Cancel all active campaigns (e.g. when game releases) */
  clearActiveCampaigns() {
    // Complete any remaining campaigns immediately
    for (const campaign of this.activeCampaigns) {
      this.totalHype += campaign.hypeGenerated;
    }
    this.activeCampaigns = [];
  }

  serialize() {
    return {
      activeCampaigns: this.activeCampaigns,
      totalHype: this.totalHype,
      campaignHistory: this.campaignHistory,
      fanBonusPending: this.fanBonusPending,
    };
  }

  deserialize(data) {
    if (!data) return;
    this.activeCampaigns = data.activeCampaigns || [];
    this.totalHype = data.totalHype || 0;
    this.campaignHistory = data.campaignHistory || [];
    this.fanBonusPending = data.fanBonusPending || 0;
  }

  reset() {
    this.activeCampaigns = [];
    this.totalHype = 0;
    this.campaignHistory = [];
    this.fanBonusPending = 0;
  }
}

// Global instance
const marketingSystem = new MarketingSystem();
