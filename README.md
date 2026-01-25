# 🌋 QuakeBet - Seismic Prediction Market

A blockchain-ready prediction market for earthquake activity with a humanitarian twist: **if any earthquake causes casualties, all bets are forfeited**.

![QuakeBet Screenshot](docs/screenshot.png)

## 🎯 Features

- **Real-time USGS Data**: Live earthquake feed from the United States Geological Survey
- **Hybrid Odds Model**: House-set opening odds with dynamic parimutuel-style adjustment
- **Death Forfeit Mechanic**: All bets forfeit if casualties occur (50% to relief, 50% to treasury)
- **Multiple Market Types**: Magnitude, regional, and count-based predictions
- **Responsive Design**: Works on desktop and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/quakebet.git
cd quakebet

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
quakebet/
├── src/
│   ├── components/       # React components
│   │   ├── MarketCard.jsx
│   │   ├── EarthquakeFeed.jsx
│   │   ├── BetSlip.jsx
│   │   └── ...
│   ├── hooks/            # Custom React hooks
│   │   └── useEarthquakes.js
│   ├── utils/            # Utility functions
│   │   └── odds.js       # Odds calculation logic
│   ├── App.jsx           # Main application
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── docs/                 # Documentation
│   └── WHITEPAPER.md     # Technical whitepaper
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 📊 Odds Calculation

### Base Probabilities (USGS Data)

| Event | Annual Frequency | Weekly Probability | YES Odds | NO Odds |
|-------|------------------|-------------------|----------|---------|
| M5.0+ Globally | ~1,500/year | 96.7% | 1.03x | 15.0x |
| M6.0+ Globally | ~120/year | 90.2% | 1.05x | 5.0x |
| M7.0+ Globally | ~16/year | 26.5% | 3.58x | 1.35x |
| M8.0+ Globally | ~1/year | 1.9% | 50.0x | 1.01x |

### Odds Formula

```javascript
// Fair odds from probability
fairOdds = 1 / probability

// Apply 5% house edge
offeredOdds = fairOdds × (1 - 0.05)

// Dynamic adjustment based on betting imbalance
adjustment = 1 - (imbalance × 0.4)  // Max ±20%
finalOdds = offeredOdds × adjustment
```

## 💀 Death Forfeit Mechanic

The core ethical innovation of QuakeBet:

1. USGS provides PAGER (Prompt Assessment of Global Earthquakes for Response) alerts
2. **Orange/Red** PAGER alerts indicate expected casualties
3. When detected: ALL active bets are **forfeited**
4. Forfeited funds split: **50% humanitarian relief** + **50% platform treasury**

This ensures no one can profit from human tragedy.

## 🛠️ Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Adding New Markets

Edit `src/utils/odds.js`:

```javascript
export const BASE_ODDS = {
  // Add new category or market
  newCategory: {
    'market_key': { 
      prob: 0.5,              // Historical probability
      name: 'Display Name', 
      timeframe: 'week',      // 'week' or 'day'
      description: '...'
    },
  },
};
```

## 🔗 Integration with SeeMyNFT

QuakeBet is designed to integrate with the SeeMyNFT napp ecosystem:

1. **QTK Token**: Uses the platform's native token for betting
2. **Wallet Integration**: Connects to SeeMyNFT identity wallet
3. **NFT Receipts**: Bets can be minted as NFT receipts
4. **Leaderboards**: Chapter-based competition support

### API Endpoints (for backend integration)

```javascript
// Place bet
POST /api/bets
{
  marketId: number,
  side: 'yes' | 'no',
  amount: number,
  walletAddress: string
}

// Get markets
GET /api/markets

// Get earthquake feed
GET /api/earthquakes
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 📚 Resources

- [USGS Earthquake API Documentation](https://earthquake.usgs.gov/fdsnws/event/1/)
- [USGS PAGER System](https://earthquake.usgs.gov/data/pager/)
- [Technical Whitepaper](docs/WHITEPAPER.md)

---

**⚠️ Disclaimer**: QuakeBet is a demonstration project. No real currency is involved. Earthquakes are real events that affect real people - this platform's Death Forfeit Mechanic exists to ensure ethical engagement with natural disaster prediction.
