import React, { useState, useEffect, useCallback, useMemo } from 'react';

// ============================================
// QUAKEBET - Hybrid House/Parimutuel Model
// ============================================

// Base probabilities from USGS historical data
const BASE_ODDS = {
  magnitude: {
    'over5_global': { prob: 0.967, name: 'M5.0+ Globally', timeframe: 'week' },
    'over6_global': { prob: 0.902, name: 'M6.0+ Globally', timeframe: 'week' },
    'over7_global': { prob: 0.265, name: 'M7.0+ Globally', timeframe: 'week' },
    'over8_global': { prob: 0.019, name: 'M8.0+ Globally', timeframe: 'week' },
  },
  region: {
    'california': { prob: 0.323, name: 'M5.0+ California', timeframe: 'week' },
    'japan': { prob: 0.615, name: 'M5.0+ Japan', timeframe: 'week' },
    'alaska': { prob: 0.858, name: 'M5.0+ Alaska', timeframe: 'week' },
    'indonesia': { prob: 0.712, name: 'M5.0+ Indonesia', timeframe: 'week' },
  },
  count: {
    'over10_m4': { prob: 0.85, name: 'Over 10 M4.0+ quakes', timeframe: 'day' },
    'over20_m4': { prob: 0.45, name: 'Over 20 M4.0+ quakes', timeframe: 'day' },
    'over50_m3': { prob: 0.72, name: 'Over 50 M3.0+ quakes', timeframe: 'day' },
  }
};

const HOUSE_EDGE = 0.05; // 5% house edge
const DEATH_FORFEIT_WEEKLY_PROB = 0.35; // ~35% chance of fatal quake per week

// Calculate initial house odds from probability
const calcOdds = (prob, forYes = true) => {
  const fairOdds = forYes ? 1 / prob : 1 / (1 - prob);
  return Math.round(fairOdds * (1 - HOUSE_EDGE) * 100) / 100;
};

// Dynamic odds adjustment based on betting imbalance
const adjustOdds = (baseOdds, yesPool, noPool) => {
  const total = yesPool + noPool;
  if (total < 100) return baseOdds; // Not enough volume to adjust
  
  const yesRatio = yesPool / total;
  const imbalance = yesRatio - 0.5; // -0.5 to +0.5
  
  // Adjust odds to balance the book (max 20% adjustment)
  const adjustment = 1 - (imbalance * 0.4);
  return Math.round(baseOdds * adjustment * 100) / 100;
};

// Seismic wave background animation
const SeismicBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="absolute w-full h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent"
        style={{
          top: `${12 + i * 12}%`,
          animation: `seismicWave ${3 + i * 0.5}s ease-in-out infinite`,
          animationDelay: `${i * 0.3}s`,
        }}
      />
    ))}
  </div>
);

// Pulsing live indicator
const LiveIndicator = ({ isDemo }) => (
  <div className="flex items-center gap-2">
    <span className="relative flex h-3 w-3">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDemo ? 'bg-amber-400' : 'bg-green-400'}`} />
      <span className={`relative inline-flex rounded-full h-3 w-3 ${isDemo ? 'bg-amber-500' : 'bg-green-500'}`} />
    </span>
    <span className="text-xs font-medium tracking-wider">{isDemo ? 'DEMO' : 'LIVE'}</span>
  </div>
);

// Magnitude badge with color
const MagnitudeBadge = ({ mag }) => {
  const color = mag >= 7 ? 'bg-red-500' : mag >= 6 ? 'bg-orange-500' : mag >= 5 ? 'bg-amber-500' : mag >= 4 ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className={`${color} text-white font-bold text-lg w-14 h-14 rounded-lg flex items-center justify-center shadow-lg`}>
      {mag.toFixed(1)}
    </div>
  );
};

// Market card component
const MarketCard = ({ market, onBet, userBets }) => {
  const [selectedSide, setSelectedSide] = useState(null);
  const [amount, setAmount] = useState(50);
  
  const userBet = userBets.find(b => b.marketId === market.id);
  const yesOdds = adjustOdds(market.baseYesOdds, market.yesPool, market.noPool);
  const noOdds = adjustOdds(market.baseNoOdds, market.noPool, market.yesPool);
  
  const impliedYesProb = Math.round((1 / yesOdds) * 100);
  const impliedNoProb = Math.round((1 / noOdds) * 100);
  
  return (
    <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-xl overflow-hidden hover:border-amber-900/50 transition-all">
      <div className="p-4 border-b border-gray-800">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-100">{market.name}</h3>
          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">{market.timeframe}</span>
        </div>
        <p className="text-xs text-gray-500">Pool: {(market.yesPool + market.noPool).toLocaleString()} QTK</p>
      </div>
      
      <div className="p-4 grid grid-cols-2 gap-3">
        {/* YES Button */}
        <button
          onClick={() => setSelectedSide(selectedSide === 'yes' ? null : 'yes')}
          disabled={!!userBet}
          className={`p-3 rounded-lg border-2 transition-all ${
            selectedSide === 'yes' 
              ? 'border-green-500 bg-green-500/20' 
              : userBet?.side === 'yes'
              ? 'border-green-500/50 bg-green-500/10 opacity-60'
              : 'border-gray-700 hover:border-green-500/50 hover:bg-green-500/10'
          } ${userBet ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="text-green-400 font-bold text-xl">{yesOdds}x</div>
          <div className="text-xs text-gray-400">YES ({impliedYesProb}%)</div>
        </button>
        
        {/* NO Button */}
        <button
          onClick={() => setSelectedSide(selectedSide === 'no' ? null : 'no')}
          disabled={!!userBet}
          className={`p-3 rounded-lg border-2 transition-all ${
            selectedSide === 'no' 
              ? 'border-red-500 bg-red-500/20' 
              : userBet?.side === 'no'
              ? 'border-red-500/50 bg-red-500/10 opacity-60'
              : 'border-gray-700 hover:border-red-500/50 hover:bg-red-500/10'
          } ${userBet ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="text-red-400 font-bold text-xl">{noOdds}x</div>
          <div className="text-xs text-gray-400">NO ({impliedNoProb}%)</div>
        </button>
      </div>
      
      {/* Bet input (shown when side selected) */}
      {selectedSide && !userBet && (
        <div className="px-4 pb-4 space-y-3 animate-fadeIn">
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-amber-400 font-mono focus:border-amber-500 focus:outline-none"
            />
            <span className="flex items-center text-gray-500 text-sm">QTK</span>
          </div>
          <div className="flex gap-2">
            {[25, 50, 100, 250].map(v => (
              <button
                key={v}
                onClick={() => setAmount(v)}
                className={`flex-1 py-1 text-xs rounded ${amount === v ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Potential win:</span>
            <span className="text-amber-400 font-mono">
              {Math.round(amount * (selectedSide === 'yes' ? yesOdds : noOdds))} QTK
            </span>
          </div>
          <button
            onClick={() => {
              onBet(market.id, selectedSide, amount, selectedSide === 'yes' ? yesOdds : noOdds);
              setSelectedSide(null);
            }}
            className="w-full py-2 rounded-lg font-semibold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 transition-all"
          >
            Place {selectedSide.toUpperCase()} Bet
          </button>
        </div>
      )}
      
      {/* User's existing bet */}
      {userBet && (
        <div className="px-4 pb-4">
          <div className={`p-3 rounded-lg ${userBet.side === 'yes' ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Your bet</span>
              <span className={`text-xs font-medium ${userBet.side === 'yes' ? 'text-green-400' : 'text-red-400'}`}>
                {userBet.side.toUpperCase()} @ {userBet.odds}x
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="font-mono text-amber-400">{userBet.amount} QTK</span>
              <span className="text-xs text-gray-500">→ {Math.round(userBet.amount * userBet.odds)} QTK</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App
export default function QuakeBetApp() {
  const [balance, setBalance] = useState(1000);
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [activeBets, setActiveBets] = useState([]);
  const [betHistory, setBetHistory] = useState([]);
  const [showDeathAlert, setShowDeathAlert] = useState(false);
  const [activeTab, setActiveTab] = useState('markets');
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Initialize markets with house-set odds
  const [markets, setMarkets] = useState(() => {
    const allMarkets = [];
    let id = 0;
    
    Object.entries(BASE_ODDS).forEach(([category, bets]) => {
      Object.entries(bets).forEach(([key, data]) => {
        allMarkets.push({
          id: id++,
          category,
          key,
          name: data.name,
          timeframe: data.timeframe === 'week' ? 'This Week' : 'Today',
          baseProbability: data.prob,
          baseYesOdds: calcOdds(data.prob, true),
          baseNoOdds: calcOdds(data.prob, false),
          yesPool: Math.floor(Math.random() * 500) + 100, // Simulate existing bets
          noPool: Math.floor(Math.random() * 500) + 100,
          endsAt: data.timeframe === 'week' 
            ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
      });
    });
    
    return allMarkets;
  });

  // Generate demo earthquakes
  const generateDemoQuakes = useCallback(() => {
    const regions = [
      { place: 'Southern California', lat: 34.0, lon: -118.0 },
      { place: 'Alaska Peninsula', lat: 55.0, lon: -160.0 },
      { place: 'near the coast of Japan', lat: 35.0, lon: 140.0 },
      { place: 'Indonesia', lat: -6.0, lon: 110.0 },
      { place: 'Chile', lat: -33.0, lon: -70.0 },
      { place: 'Puerto Rico region', lat: 18.0, lon: -66.0 },
      { place: 'Hawaii region', lat: 19.5, lon: -155.5 },
      { place: 'Tonga Islands', lat: -21.0, lon: -175.0 },
      { place: 'Philippines', lat: 14.0, lon: 121.0 },
    ];
    
    const now = Date.now();
    return Array.from({ length: 20 }, (_, i) => {
      const region = regions[Math.floor(Math.random() * regions.length)];
      const magnitude = 2.5 + Math.random() * 4.5;
      const hoursAgo = Math.random() * 24;
      
      return {
        id: `demo-${i}-${now}`,
        magnitude: Math.round(magnitude * 10) / 10,
        place: `${Math.floor(Math.random() * 50 + 10)}km ${['N', 'S', 'E', 'W', 'NW', 'SE'][Math.floor(Math.random() * 6)]} of ${region.place}`,
        time: new Date(now - hoursAgo * 60 * 60 * 1000),
        alert: magnitude > 6.5 ? 'orange' : magnitude > 6 ? 'yellow' : null,
        depth: Math.round((Math.random() * 100 + 5) * 10) / 10,
        hasCasualties: false,
      };
    }).sort((a, b) => b.time - a.time);
  }, []);

  // Fetch earthquakes
  const fetchEarthquakes = useCallback(async () => {
    try {
      const endTime = new Date().toISOString();
      const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(
        `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startTime}&endtime=${endTime}&minmagnitude=2.5&orderby=time&limit=30`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      const quakes = data.features.map((f) => ({
        id: f.id,
        magnitude: f.properties.mag,
        place: f.properties.place,
        time: new Date(f.properties.time),
        alert: f.properties.alert,
        depth: f.geometry.coordinates[2],
        hasCasualties: f.properties.alert === 'red' || f.properties.alert === 'orange',
      }));
      
      setEarthquakes(quakes);
      setIsDemo(false);
      setLastUpdate(new Date());
      setLoading(false);
      
      // Check for casualties
      const deadlyQuake = quakes.find(q => q.hasCasualties);
      if (deadlyQuake && activeBets.length > 0) {
        triggerDeathForfeit();
      }
    } catch (error) {
      console.log('Using demo data');
      setEarthquakes(generateDemoQuakes());
      setIsDemo(true);
      setLastUpdate(new Date());
      setLoading(false);
    }
  }, [activeBets.length, generateDemoQuakes]);

  useEffect(() => {
    fetchEarthquakes();
    const interval = setInterval(fetchEarthquakes, 30000);
    return () => clearInterval(interval);
  }, []);

  // Death forfeit handler
  const triggerDeathForfeit = () => {
    setShowDeathAlert(true);
    const forfeitedBets = activeBets.map(bet => ({
      ...bet,
      result: 'FORFEITED',
      reason: 'Casualties detected',
      resolvedAt: new Date(),
    }));
    setBetHistory(prev => [...forfeitedBets, ...prev]);
    setActiveBets([]);
  };

  // Place bet handler
  const placeBet = (marketId, side, amount, odds) => {
    if (amount > balance) return;
    
    setBalance(prev => prev - amount);
    
    const market = markets.find(m => m.id === marketId);
    const newBet = {
      id: Date.now(),
      marketId,
      marketName: market.name,
      side,
      amount,
      odds,
      placedAt: new Date(),
      endsAt: market.endsAt,
    };
    
    setActiveBets(prev => [...prev, newBet]);
    
    // Update market pools
    setMarkets(prev => prev.map(m => {
      if (m.id === marketId) {
        return {
          ...m,
          yesPool: side === 'yes' ? m.yesPool + amount : m.yesPool,
          noPool: side === 'no' ? m.noPool + amount : m.noPool,
        };
      }
      return m;
    }));
  };

  // Simulate bet resolution (for demo)
  const simulateResolution = (won) => {
    if (activeBets.length === 0) return;
    
    const resolvedBets = activeBets.map(bet => ({
      ...bet,
      result: won ? 'WON' : 'LOST',
      payout: won ? Math.round(bet.amount * bet.odds) : 0,
      resolvedAt: new Date(),
    }));
    
    const totalPayout = resolvedBets.reduce((sum, b) => sum + (b.payout || 0), 0);
    setBalance(prev => prev + totalPayout);
    setBetHistory(prev => [...resolvedBets, ...prev]);
    setActiveBets([]);
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  // Stats
  const stats = useMemo(() => ({
    totalBets: activeBets.length,
    totalStaked: activeBets.reduce((sum, b) => sum + b.amount, 0),
    potentialWin: activeBets.reduce((sum, b) => sum + Math.round(b.amount * b.odds), 0),
    winRate: betHistory.length > 0 
      ? Math.round(betHistory.filter(b => b.result === 'WON').length / betHistory.length * 100) 
      : 0,
    quakesToday: earthquakes.length,
    maxMagnitude: earthquakes.length > 0 ? Math.max(...earthquakes.map(q => q.magnitude)) : 0,
  }), [activeBets, betHistory, earthquakes]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        * { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        @keyframes seismicWave {
          0%, 100% { transform: scaleY(1) translateX(-100%); opacity: 0; }
          50% { transform: scaleY(2) translateX(100%); opacity: 1; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0); }
          25% { transform: translateX(-4px) rotate(-1deg); }
          75% { transform: translateX(4px) rotate(1deg); }
        }
        
        .animate-shake { animation: shake 0.4s ease-in-out infinite; }
        
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
      `}</style>
      
      <SeismicBackground />
      
      {/* Death Alert Modal */}
      {showDeathAlert && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border-2 border-red-600 rounded-2xl p-8 max-w-md animate-shake">
            <div className="text-center">
              <div className="text-7xl mb-4">💀</div>
              <h2 className="text-2xl font-bold text-red-500 mb-4">CASUALTIES DETECTED</h2>
              <p className="text-gray-300 mb-4">
                An earthquake with reported casualties has occurred. All active bets have been forfeited.
              </p>
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-400 mb-2">Forfeited funds allocation:</div>
                <div className="flex justify-between text-sm">
                  <span>Humanitarian Relief</span>
                  <span className="text-green-400">50%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Platform Treasury</span>
                  <span className="text-amber-400">50%</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-6">
                This mechanic ensures no one profits from human tragedy.
              </p>
              <button
                onClick={() => setShowDeathAlert(false)}
                className="w-full py-3 rounded-lg font-semibold bg-red-600 hover:bg-red-700 transition-colors"
              >
                ACKNOWLEDGE
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-950/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌋</span>
              <div>
                <h1 className="text-xl font-bold text-amber-500">QUAKE BET</h1>
                <p className="text-[10px] text-gray-500 tracking-widest">SEISMIC PREDICTION MARKET</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <LiveIndicator isDemo={isDemo} />
              <div className="text-right">
                <p className="text-[10px] text-gray-500">BALANCE</p>
                <p className="text-xl font-bold font-mono text-amber-400">{balance.toLocaleString()} <span className="text-xs text-gray-500">QTK</span></p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Stats Bar */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
            <div>
              <p className="text-[10px] text-gray-500">QUAKES (24H)</p>
              <p className="text-lg font-bold text-amber-400">{stats.quakesToday}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">MAX MAG</p>
              <p className="text-lg font-bold text-orange-400">{stats.maxMagnitude.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">ACTIVE BETS</p>
              <p className="text-lg font-bold text-blue-400">{stats.totalBets}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">STAKED</p>
              <p className="text-lg font-bold text-purple-400">{stats.totalStaked}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">POTENTIAL</p>
              <p className="text-lg font-bold text-green-400">{stats.potentialWin}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">WIN RATE</p>
              <p className="text-lg font-bold text-cyan-400">{stats.winRate}%</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {['markets', 'live', 'bets', 'history'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab 
                    ? 'text-amber-400' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.toUpperCase()}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                )}
                {tab === 'bets' && activeBets.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-amber-600 rounded-full">{activeBets.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Markets Tab */}
        {activeTab === 'markets' && (
          <div className="space-y-6">
            {/* Death forfeit warning */}
            <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-4 flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-400 mb-1">Death Forfeit Active</h3>
                <p className="text-sm text-gray-400">
                  All bets are forfeited if any earthquake causes casualties during the betting period. 
                  Weekly forfeit probability: ~{Math.round(DEATH_FORFEIT_WEEKLY_PROB * 100)}%
                </p>
              </div>
            </div>
            
            {/* Market categories */}
            {['magnitude', 'region', 'count'].map(category => (
              <div key={category}>
                <h2 className="text-lg font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  {category === 'magnitude' && '📊 Magnitude Bets'}
                  {category === 'region' && '🗺️ Regional Bets'}
                  {category === 'count' && '🔢 Count Bets'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {markets.filter(m => m.category === category).map(market => (
                    <MarketCard 
                      key={market.id} 
                      market={market} 
                      onBet={placeBet}
                      userBets={activeBets}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Live Feed Tab */}
        {activeTab === 'live' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-300">Live Earthquake Feed</h2>
              <span className="text-xs text-gray-500">
                {lastUpdate ? `Updated ${formatTimeAgo(lastUpdate)}` : 'Loading...'}
              </span>
            </div>
            
            {loading ? (
              <div className="text-center py-12 text-amber-500">Loading seismic data...</div>
            ) : (
              <div className="space-y-2">
                {earthquakes.map((quake, i) => (
                  <div 
                    key={quake.id}
                    className="bg-gray-900/80 border border-gray-800 rounded-lg p-4 flex items-center gap-4 hover:border-gray-700 transition-colors animate-fadeIn"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <MagnitudeBadge mag={quake.magnitude} />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 truncate">{quake.place || 'Unknown location'}</p>
                      <p className="text-xs text-gray-500">
                        Depth: {quake.depth?.toFixed(1)}km • {formatTimeAgo(quake.time)}
                      </p>
                    </div>
                    {quake.alert && (
                      <span className={`text-xs px-2 py-1 rounded uppercase ${
                        quake.alert === 'red' ? 'bg-red-900/50 text-red-400' :
                        quake.alert === 'orange' ? 'bg-orange-900/50 text-orange-400' :
                        'bg-yellow-900/50 text-yellow-400'
                      }`}>
                        {quake.alert}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Active Bets Tab */}
        {activeTab === 'bets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-300">Active Bets</h2>
              {isDemo && activeBets.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => simulateResolution(true)}
                    className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded"
                  >
                    Simulate Win
                  </button>
                  <button
                    onClick={() => simulateResolution(false)}
                    className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded"
                  >
                    Simulate Loss
                  </button>
                  <button
                    onClick={triggerDeathForfeit}
                    className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
                  >
                    💀 Simulate Forfeit
                  </button>
                </div>
              )}
            </div>
            
            {activeBets.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-2">🎯</p>
                <p>No active bets</p>
                <p className="text-sm">Head to Markets to place your predictions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeBets.map(bet => (
                  <div key={bet.id} className="bg-gray-900/80 border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{bet.marketName}</h3>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        bet.side === 'yes' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                      }`}>
                        {bet.side.toUpperCase()} @ {bet.odds}x
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Staked</span>
                      <span className="font-mono text-amber-400">{bet.amount} QTK</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Potential Return</span>
                      <span className="font-mono text-green-400">{Math.round(bet.amount * bet.odds)} QTK</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Placed</span>
                      <span className="text-gray-400">{formatTimeAgo(bet.placedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-300">Bet History</h2>
            
            {betHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-2">📜</p>
                <p>No betting history yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {betHistory.map(bet => (
                  <div 
                    key={bet.id} 
                    className={`bg-gray-900/80 border rounded-lg p-4 ${
                      bet.result === 'WON' ? 'border-green-900/50' :
                      bet.result === 'FORFEITED' ? 'border-red-900/50' :
                      'border-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{bet.marketName}</h3>
                      <span className={`text-xs px-2 py-1 rounded font-bold ${
                        bet.result === 'WON' ? 'bg-green-600 text-white' :
                        bet.result === 'FORFEITED' ? 'bg-red-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {bet.result}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{bet.side.toUpperCase()} @ {bet.odds}x</span>
                      <span className={`font-mono ${
                        bet.result === 'WON' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {bet.result === 'WON' ? `+${bet.payout}` : `-${bet.amount}`} QTK
                      </span>
                    </div>
                    {bet.reason && (
                      <p className="text-xs text-red-400 mt-1">💀 {bet.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-xs text-gray-600">
          <p>QuakeBet uses real USGS earthquake data. No real currency involved.</p>
          <p className="mt-1">Death Forfeit Mechanic: All bets forfeit if casualties occur. 50% to humanitarian relief.</p>
        </div>
      </footer>
    </div>
  );
}
