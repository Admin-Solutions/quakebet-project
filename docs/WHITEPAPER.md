# 🌋 QUAKE BET
## Seismic Prediction Market
### Technical Whitepaper v1.0

*A Humanitarian-First Approach to Natural Event Prediction Markets*

**January 2026**

---

## Executive Summary

QuakeBet is a blockchain-based prediction market that allows users to wager on seismic activity using real-time data from the United States Geological Survey (USGS). Unlike traditional prediction markets, QuakeBet introduces a **Death Forfeit Mechanic**: if any earthquake during an active betting period results in human casualties, all active bets are forfeited.

This creates a unique market dynamic where participants are never incentivized to root for catastrophic outcomes.

This whitepaper details our betting models, odds calculation methodology, technical architecture, and the ethical framework that distinguishes QuakeBet from existing prediction platforms.

---

## The Problem with Existing Markets

Existing prediction markets like Kalshi and Polymarket have faced significant criticism for allowing bets on humanitarian crises. Markets have been created for:

- Mass starvation in Gaza
- Nuclear war scenarios
- Natural disaster casualties
- Political violence

This creates **perverse incentives** where users may profit from human suffering.

**QuakeBet solves this by making catastrophic outcomes universally negative for all participants.**

---

## Market Opportunity

### Seismic Activity Statistics

According to USGS data, global seismic activity provides consistent, verifiable, and unpredictable events ideal for prediction markets:

| Metric | Annual Average |
|--------|----------------|
| Detectable earthquakes globally | 500,000 |
| Earthquakes felt by humans | 100,000 |
| Earthquakes causing damage | ~100 |
| Major earthquakes (M7.0-7.9) | 15-18 |
| Great earthquakes (M8.0+) | 1 |
| Earthquakes with fatalities | 15-25 |

*Source: USGS Earthquake Hazards Program*

### Why Earthquakes?

- **Verifiable**: USGS is an authoritative, tamper-proof data source
- **Frequent**: ~55 detected earthquakes per day globally
- **Unpredictable**: No insider knowledge possible (even USGS cannot predict earthquakes)
- **Dramatic**: Genuine public interest in seismic events

---

## Betting Models: House vs. Pool vs. P2P

QuakeBet can operate under three distinct betting models. **We recommend a hybrid approach.**

### Model 1: House Model (Like Craps/Roulette)

In this model, the platform acts as the counterparty to all bets, similar to a casino.

#### How It Works

1. Platform calculates fair odds based on historical USGS data
2. House edge (2-5%) is built into the odds
3. Users bet against the house, not each other
4. Platform pays winners from its treasury

#### Pros
- Simple UX — users just pick outcomes and bet
- Instant liquidity — no need to wait for counterparties
- Predictable odds based on actuarial data

#### Cons
- Platform assumes variance risk
- Requires significant treasury reserves
- Regulatory scrutiny (gambling classification)

---

### Model 2: Parimutuel Pool (Like Horse Racing)

All bets are pooled together, and winners split the pot proportionally.

#### How It Works

1. Users bet on outcomes (e.g., "M5.0+ in California this week")
2. All bets go into a shared pool
3. Platform takes a fixed percentage (5-15% "rake")
4. Remaining pool is distributed to winners based on their bet size
5. Odds are determined by betting patterns, not the house

#### Odds Calculation

```
Your Payout = (Your Bet / Total Bet on Winning Outcome) × (Total Pool - Rake)
```

**Example:** $10,000 total pool. $3,000 bet on "Yes" (M5.0+ quake), $7,000 on "No". 10% rake.

If M5.0+ occurs: Yes bettors split $9,000.
If you bet $300, you get ($300/$3,000) × $9,000 = **$900** (3x return)

#### Pros
- Zero platform risk — house always profits via rake
- Self-balancing odds reflect crowd wisdom
- Easier regulatory path (not classified as casino gambling)

#### Cons
- Final odds unknown until betting closes
- Can be gamed by late large bets
- Requires critical mass of participants

---

### Model 3: Peer-to-Peer / AMM (Like Polymarket)

Users trade binary outcome tokens against each other or an automated market maker.

#### How It Works

1. Each prediction has YES and NO tokens
2. Tokens trade between $0.01 and $0.99 based on implied probability
3. Winning tokens redeem for $1.00; losing tokens worth $0
4. AMM provides constant liquidity via bonding curve
5. Platform earns via trading fees (0.5-2%)

#### Pros
- Real-time price discovery
- Users can exit positions before resolution
- Sophisticated traders can arbitrage inefficiencies

#### Cons
- Complex UX for casual users
- Requires liquidity providers
- AMM impermanent loss risks

---

### Our Recommendation: Hybrid Parimutuel + House

We recommend a hybrid model that combines the simplicity of house-set odds with the risk mitigation of parimutuel pooling:

| Component | Implementation |
|-----------|----------------|
| **House-Set Opening Odds** | Platform sets initial odds based on historical USGS data |
| **Dynamic Adjustment** | Odds shift based on betting volume (like sports betting) |
| **Capped Exposure** | Platform limits maximum payout per bet to manage risk |
| **Treasury Reserve** | Percentage of rake builds insurance fund for variance |

---

## Odds Calculation Methodology

Fair odds are calculated using historical USGS earthquake frequency data. We then apply a house edge to create the offered odds.

### Base Probabilities (from USGS data)

| Event | Annual Frequency | Weekly Probability |
|-------|------------------|-------------------|
| M5.0+ earthquake (global) | ~1,500/year | 96.7% |
| M6.0+ earthquake (global) | ~120/year | 90.2% |
| M7.0+ earthquake (global) | ~16/year | 26.5% |
| M8.0+ earthquake (global) | ~1/year | 1.9% |
| M5.0+ in California | ~20/year | 32.3% |
| M5.0+ in Japan | ~50/year | 61.5% |
| M5.0+ in Alaska | ~100/year | 85.8% |
| Earthquake with fatalities | ~20/year | 32.3% |

### Converting Probability to Odds

**Fair Odds = 1 / Probability**

**Offered Odds = Fair Odds × (1 - House Edge)**

**Example:** M7.0+ in one week has 26.5% probability.
- Fair odds = 1/0.265 = 3.77x
- With 5% house edge, offered odds = 3.77 × 0.95 = **3.58x**

### Sample Betting Lines

| Bet | YES Odds | NO Odds |
|-----|----------|---------|
| M5.0+ globally this week | 1.03x | 15.0x |
| M6.0+ globally this week | 1.05x | 5.0x |
| M7.0+ globally this week | 3.58x | 1.35x |
| M8.0+ globally this week | 48.0x | 1.01x |
| M5.0+ in California this week | 2.95x | 1.45x |
| Over 15 quakes (M4.0+) today | 1.80x | 2.10x |

---

## The Death Forfeit Mechanic

**This is QuakeBet's core differentiator and ethical innovation.**

### How It Works

1. USGS provides **PAGER** (Prompt Assessment of Global Earthquakes for Response) alerts
2. PAGER uses color codes: **Green**, **Yellow**, **Orange**, **Red**
3. **Orange** = significant casualties likely; **Red** = high casualties expected
4. If any earthquake during a betting period receives Orange or Red PAGER alert: **ALL active bets are forfeited**
5. Forfeited funds allocation:
   - **50%** → Humanitarian relief fund (Red Cross, Doctors Without Borders, etc.)
   - **50%** → Platform treasury

### Why This Matters

| Benefit | Explanation |
|---------|-------------|
| **No perverse incentives** | Users can never profit from human death |
| **Shared fate** | Community loses together when tragedy strikes |
| **Positive externality** | Platform generates humanitarian relief funding |
| **PR advantage** | Addresses criticism faced by Kalshi/Polymarket |

### Historical Forfeit Probability

Based on USGS data, approximately **20-25 earthquakes per year** result in fatalities. This translates to roughly a **32-40% chance** of at least one deadly earthquake in any given week globally.

This significant forfeit risk is factored into all odds calculations and creates a natural house edge beyond the explicit margin.

### Smart Contract Implementation

The death forfeit is enforced at the smart contract level:

```solidity
function checkAndResolveBet(uint256 betId) external {
    Bet storage bet = bets[betId];
    
    // Check oracle for PAGER alerts during betting period
    (bool hasDeadlyQuake, ) = oracle.checkPagerAlerts(
        bet.startTime, 
        bet.endTime
    );
    
    if (hasDeadlyQuake) {
        // FORFEIT: All funds redistributed
        bet.status = BetStatus.FORFEITED;
        treasury.allocateToRelief(bet.totalPool * 50 / 100);
        treasury.allocateToPlatform(bet.totalPool * 50 / 100);
        emit BetForfeited(betId, "Casualties detected");
        return;
    }
    
    // Normal resolution continues...
}
```

**Properties:**
- Immutable and transparent
- Tamper-proof execution
- Automatic fund distribution
- Publicly auditable

---

## Technical Architecture

### Data Sources

| Source | Purpose | Cost |
|--------|---------|------|
| **USGS Earthquake API** | Real-time feed of global seismic activity | Free, no API key |
| **USGS PAGER System** | Casualty estimates within 30 minutes of major quakes | Free |
| **Chainlink Oracle** | Brings off-chain USGS data on-chain | Per-request fee |

### Smart Contract Stack

| Contract | Purpose |
|----------|---------|
| **BetFactory.sol** | Creates new betting markets |
| **QuakeBet.sol** | Individual bet logic, resolution, forfeit handling |
| **Treasury.sol** | Manages platform funds, payouts, relief allocation |
| **QTK Token (ERC-20)** | Platform token for betting and governance |

**Blockchain:** Polygon (low fees, EVM compatible)

### Resolution Flow

```
┌─────────────────┐
│ Betting Period  │
│     Ends        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Oracle Fetches  │
│   USGS Data     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     YES    ┌─────────────────┐
│ PAGER Orange/   │──────────▶ │    FORFEIT      │
│   Red Alert?    │            │  50% Relief     │
└────────┬────────┘            │  50% Treasury   │
         │ NO                  └─────────────────┘
         ▼
┌─────────────────┐     YES    ┌─────────────────┐
│ Did Predicted   │──────────▶ │ Pay Winners     │
│ Event Occur?    │            │ (minus house %) │
└────────┬────────┘            └─────────────────┘
         │ NO
         ▼
┌─────────────────┐
│ Pay NO Bettors  │
│ (minus house %) │
└─────────────────┘
```

---

## Tokenomics

### QTK Token Utility

- **Primary betting currency** — all bets denominated in QTK
- **Governance voting** — holders vote on new market types
- **Staking** — stake QTK for reduced platform fees
- **Liquidity provision** — earn rewards by providing AMM liquidity

### Token Distribution

| Allocation | Percentage |
|------------|------------|
| Public Sale | 40% |
| Team & Advisors (4-year vest) | 20% |
| Treasury / Operations | 15% |
| Liquidity Mining Rewards | 15% |
| Humanitarian Relief Fund | 10% |

### Revenue Model

| Source | Rate |
|--------|------|
| House Edge | 3-5% built into odds |
| Forfeit Allocation | 50% of forfeited bets |
| Withdrawal Fees | 1% on token withdrawals |
| Premium Features | Subscription for advanced analytics |

---

## Regulatory Considerations

### Classification Strategy

QuakeBet is designed to be classified as a **prediction market / event contract exchange** rather than a gambling platform:

1. **No games of pure chance** — outcomes based on real-world events
2. **Information aggregation function** — prices reflect crowd wisdom
3. **Hedging utility** — insurance companies, seismologists can hedge exposure
4. **CFTC precedent** — Kalshi's 2024 court victory established prediction markets as derivatives

### Compliance Measures

- KYC/AML verification for all users
- Geofencing for restricted jurisdictions
- Bet limits to prevent money laundering
- Transparent smart contract audits
- Partnership with licensed payment processors

---

## Conclusion

QuakeBet represents a new paradigm in prediction markets: one where the house always wins when tragedy strikes, and that "win" is redirected to humanitarian relief.

By leveraging verifiable USGS data, transparent smart contracts, and the innovative Death Forfeit Mechanic, we create a platform that is:

✅ **Ethically differentiated** from existing prediction markets

✅ **Technically sound** with authoritative data sources

✅ **Economically sustainable** through multiple revenue streams

✅ **Socially responsible** through humanitarian relief contributions

---

*Earthquakes remind us of nature's power and unpredictability. QuakeBet channels that fascination responsibly.*

---

## Appendix A: USGS API Reference

**Base Endpoint:**
```
https://earthquake.usgs.gov/fdsnws/event/1/query
```

**Parameters:**
- `format`: geojson, csv, xml
- `starttime` / `endtime`: ISO 8601 dates
- `minmagnitude` / `maxmagnitude`: Richter scale
- `latitude` / `longitude` / `maxradiuskm`: Geographic filter

**PAGER Alert Levels:**
| Level | Expected Fatalities | Expected Economic Loss |
|-------|---------------------|------------------------|
| Green | 0 | < $1M |
| Yellow | 1-99 | $1M - $100M |
| Orange | 100-999 | $100M - $1B |
| Red | 1,000+ | > $1B |

---

## Appendix B: Sample Smart Contract Interface

```solidity
interface IQuakeBet {
    enum BetStatus { ACTIVE, WON, LOST, FORFEITED }
    enum BetType { MAGNITUDE, COUNT, REGION }
    
    struct Bet {
        uint256 id;
        BetType betType;
        string prediction;    // e.g., "over5", "california"
        uint256 amount;
        uint256 odds;         // in basis points (10000 = 1x)
        uint256 startTime;
        uint256 endTime;
        address bettor;
        BetStatus status;
    }
    
    function placeBet(BetType _type, string calldata _prediction, uint256 _timeframe) 
        external payable returns (uint256 betId);
    
    function resolveBet(uint256 _betId) external;
    
    function claimWinnings(uint256 _betId) external;
    
    event BetPlaced(uint256 indexed betId, address indexed bettor, uint256 amount);
    event BetResolved(uint256 indexed betId, BetStatus status, uint256 payout);
    event BetForfeited(uint256 indexed betId, string reason);
}
```

---

**Contact:** [team@quakebet.io]

**Website:** [quakebet.io]

**Discord:** [discord.gg/quakebet]

---

*© 2026 QuakeBet. All rights reserved.*
