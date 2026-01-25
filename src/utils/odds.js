// ============================================
// QUAKEBET ODDS CALCULATION
// Based on USGS Historical Earthquake Data
// ============================================

// Base probabilities from USGS data
export const BASE_ODDS = {
  magnitude: {
    'over5_global': { prob: 0.967, name: 'M5.0+ Globally', timeframe: 'week', description: 'At least one magnitude 5.0 or greater earthquake anywhere in the world' },
    'over6_global': { prob: 0.902, name: 'M6.0+ Globally', timeframe: 'week', description: 'At least one magnitude 6.0 or greater earthquake anywhere in the world' },
    'over7_global': { prob: 0.265, name: 'M7.0+ Globally', timeframe: 'week', description: 'At least one magnitude 7.0 or greater earthquake anywhere in the world' },
    'over8_global': { prob: 0.019, name: 'M8.0+ Globally', timeframe: 'week', description: 'At least one magnitude 8.0 or greater earthquake anywhere in the world' },
  },
  region: {
    'california': { prob: 0.323, name: 'M5.0+ California', timeframe: 'week', description: 'Magnitude 5.0+ earthquake in California region' },
    'japan': { prob: 0.615, name: 'M5.0+ Japan', timeframe: 'week', description: 'Magnitude 5.0+ earthquake in Japan region' },
    'alaska': { prob: 0.858, name: 'M5.0+ Alaska', timeframe: 'week', description: 'Magnitude 5.0+ earthquake in Alaska region' },
    'indonesia': { prob: 0.712, name: 'M5.0+ Indonesia', timeframe: 'week', description: 'Magnitude 5.0+ earthquake in Indonesia region' },
    'chile': { prob: 0.445, name: 'M5.0+ Chile', timeframe: 'week', description: 'Magnitude 5.0+ earthquake in Chile region' },
    'philippines': { prob: 0.523, name: 'M5.0+ Philippines', timeframe: 'week', description: 'Magnitude 5.0+ earthquake in Philippines region' },
  },
  count: {
    'over10_m4': { prob: 0.85, name: 'Over 10 M4.0+ quakes', timeframe: 'day', description: 'More than 10 magnitude 4.0+ earthquakes globally in 24 hours' },
    'over20_m4': { prob: 0.45, name: 'Over 20 M4.0+ quakes', timeframe: 'day', description: 'More than 20 magnitude 4.0+ earthquakes globally in 24 hours' },
    'over50_m3': { prob: 0.72, name: 'Over 50 M3.0+ quakes', timeframe: 'day', description: 'More than 50 magnitude 3.0+ earthquakes globally in 24 hours' },
    'over100_m25': { prob: 0.68, name: 'Over 100 M2.5+ quakes', timeframe: 'day', description: 'More than 100 magnitude 2.5+ earthquakes globally in 24 hours' },
  }
};

// Platform configuration
export const CONFIG = {
  HOUSE_EDGE: 0.05, // 5% house edge
  DEATH_FORFEIT_WEEKLY_PROB: 0.35, // ~35% chance of fatal quake per week
  MAX_ODDS_ADJUSTMENT: 0.20, // Maximum 20% odds shift from betting imbalance
  MIN_POOL_FOR_ADJUSTMENT: 100, // Minimum pool size before odds adjust
  FORFEIT_RELIEF_PERCENT: 0.50, // 50% of forfeits go to humanitarian relief
  FORFEIT_TREASURY_PERCENT: 0.50, // 50% of forfeits go to platform treasury
};

/**
 * Calculate initial house odds from probability
 * @param {number} prob - Base probability (0-1)
 * @param {boolean} forYes - Whether calculating YES or NO odds
 * @returns {number} Decimal odds (e.g., 2.5 means bet 1 to win 2.5)
 */
export const calcOdds = (prob, forYes = true) => {
  const fairOdds = forYes ? 1 / prob : 1 / (1 - prob);
  return Math.round(fairOdds * (1 - CONFIG.HOUSE_EDGE) * 100) / 100;
};

/**
 * Dynamically adjust odds based on betting pool imbalance
 * This is the "sports betting" style adjustment that balances the book
 * @param {number} baseOdds - Starting odds
 * @param {number} thisPool - Amount bet on this side
 * @param {number} otherPool - Amount bet on opposite side
 * @returns {number} Adjusted odds
 */
export const adjustOdds = (baseOdds, thisPool, otherPool) => {
  const total = thisPool + otherPool;
  if (total < CONFIG.MIN_POOL_FOR_ADJUSTMENT) return baseOdds;
  
  const thisRatio = thisPool / total;
  const imbalance = thisRatio - 0.5; // -0.5 to +0.5
  
  // If more money on this side, reduce odds (less attractive)
  // If less money on this side, increase odds (more attractive)
  const adjustment = 1 - (imbalance * CONFIG.MAX_ODDS_ADJUSTMENT * 2);
  
  return Math.round(Math.max(1.01, baseOdds * adjustment) * 100) / 100;
};

/**
 * Calculate implied probability from odds
 * @param {number} odds - Decimal odds
 * @returns {number} Implied probability as percentage (0-100)
 */
export const impliedProbability = (odds) => {
  return Math.round((1 / odds) * 100);
};

/**
 * Calculate potential payout
 * @param {number} amount - Bet amount
 * @param {number} odds - Decimal odds
 * @returns {number} Total return (including stake)
 */
export const calcPayout = (amount, odds) => {
  return Math.round(amount * odds);
};

/**
 * Calculate profit (payout minus stake)
 * @param {number} amount - Bet amount
 * @param {number} odds - Decimal odds
 * @returns {number} Pure profit
 */
export const calcProfit = (amount, odds) => {
  return calcPayout(amount, odds) - amount;
};

/**
 * Generate all markets with initial state
 * @returns {Array} Array of market objects
 */
export const generateMarkets = () => {
  const markets = [];
  let id = 0;
  
  Object.entries(BASE_ODDS).forEach(([category, bets]) => {
    Object.entries(bets).forEach(([key, data]) => {
      markets.push({
        id: id++,
        category,
        key,
        name: data.name,
        description: data.description,
        timeframe: data.timeframe === 'week' ? 'This Week' : 'Today',
        timeframeDays: data.timeframe === 'week' ? 7 : 1,
        baseProbability: data.prob,
        baseYesOdds: calcOdds(data.prob, true),
        baseNoOdds: calcOdds(data.prob, false),
        yesPool: 0,
        noPool: 0,
        totalBets: 0,
        createdAt: new Date(),
        endsAt: data.timeframe === 'week' 
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'OPEN', // OPEN, CLOSED, RESOLVED, FORFEITED
        outcome: null, // true, false, or null
      });
    });
  });
  
  return markets;
};

export default {
  BASE_ODDS,
  CONFIG,
  calcOdds,
  adjustOdds,
  impliedProbability,
  calcPayout,
  calcProfit,
  generateMarkets,
};
