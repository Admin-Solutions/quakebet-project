# 🚀 GitHub Setup & Claude Code Development Guide

## Step 1: Download the Project

Download the `quakebet-project.zip` file and extract it to your local machine.

## Step 2: Create GitHub Repository

### Option A: GitHub CLI (Recommended)

```bash
# Navigate to the project folder
cd quakebet-project

# Initialize git
git init

# Create repo and push (requires GitHub CLI)
gh repo create quakebet --public --source=. --push
```

### Option B: Manual Setup

1. Go to [github.com/new](https://github.com/new)
2. Create a new repository named `quakebet`
3. **Don't** initialize with README (we already have one)
4. Run these commands locally:

```bash
cd quakebet-project

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: QuakeBet seismic prediction market"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/quakebet.git

# Push
git branch -M main
git push -u origin main
```

## Step 3: Develop with Claude Code

### Install Claude Code CLI

```bash
# Install globally
npm install -g @anthropic-ai/claude-code

# Or use npx
npx @anthropic-ai/claude-code
```

### Start Development Session

```bash
# Navigate to your project
cd quakebet

# Start Claude Code
claude

# Or with specific instructions
claude "Help me add a leaderboard feature to QuakeBet"
```

### Example Claude Code Prompts

```
> Add a leaderboard component that shows top bettors by profit

> Create a smart contract interface for the betting logic

> Add sound effects when new earthquakes appear

> Implement WebSocket connection for real-time updates

> Add a chart showing earthquake frequency over time
```

## Step 4: VS Code with Claude Extension

### Install the Extension

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Claude" or "Anthropic"
4. Install the official Claude extension

### Configure

1. Get your API key from [console.anthropic.com](https://console.anthropic.com)
2. Open VS Code settings
3. Search for "Claude"
4. Add your API key

### Use Claude in VS Code

- **Chat Panel**: Ask Claude questions about your code
- **Inline Assistance**: Select code and ask Claude to explain or improve it
- **Generate Code**: Describe what you want and Claude writes it

## Project Development Roadmap

Here's what to build next:

### Phase 1: Core Improvements
- [ ] Split App.jsx into smaller components
- [ ] Add proper state management (Zustand or Redux)
- [ ] Implement persistent storage (localStorage initially)
- [ ] Add unit tests with Vitest

### Phase 2: Backend Integration
- [ ] Create Express.js or Fastify backend
- [ ] Set up PostgreSQL database
- [ ] Implement user authentication
- [ ] Create REST API endpoints

### Phase 3: Blockchain Integration
- [ ] Write Solidity smart contracts
- [ ] Deploy to Polygon testnet
- [ ] Integrate with SeeMyNFT wallet
- [ ] Add Chainlink oracle for USGS data

### Phase 4: Production
- [ ] Security audit
- [ ] Performance optimization
- [ ] Deploy to production
- [ ] Marketing and launch

## Useful Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Deploy to Vercel
vercel

# Deploy to Netlify
netlify deploy --prod
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/leaderboard

# Make changes, then commit
git add .
git commit -m "Add leaderboard component"

# Push and create PR
git push origin feature/leaderboard
# Then create PR on GitHub

# After PR merged, update main
git checkout main
git pull origin main
```

## Need Help?

- **Claude Code Issues**: Ask Claude directly in the CLI
- **React Questions**: Claude can explain any React concept
- **USGS API**: See [earthquake.usgs.gov/fdsnws/event/1/](https://earthquake.usgs.gov/fdsnws/event/1/)
- **Tailwind CSS**: See [tailwindcss.com/docs](https://tailwindcss.com/docs)

---

Happy coding! 🌋
