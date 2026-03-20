# AgentForge – Build Plan
> Decentralized Autonomous AI Agent Operating System on Bitcoin (Stacks)
> Hackathon: Buidl Battle | Deadline: March 31st

---

## TODO List

### Phase 1 – Foundation & Setup
- [x] Initialize git repo with proper .gitignore
- [x] Create plan.md (this file)
- [ ] Install missing dependencies (@stacks/connect, @stacks/transactions, lucide-react)
- [ ] Update index.html with AgentForge branding & meta tags
- [ ] Set up global theme colors (Bitcoin orange + dark mode)

### Phase 2 – Core Pages & Routing
- [ ] Rewrite App.tsx with AgentForge nav, routes, and layout
- [ ] Landing page – hero, features, stats, CTA
- [ ] Dashboard page – agent overview, stats, quick actions
- [ ] Forge page – natural-language agent creation wizard
- [ ] Marketplace page – browse/buy/rent agents as NFTs
- [ ] Agent Detail page – live monitoring, logs, controls

### Phase 3 – Wallet & Stacks Integration
- [ ] WalletContext – connect/disconnect Hiro wallet via @stacks/connect
- [ ] useWallet hook – address, balance, network state
- [ ] Stacks network config (mainnet/testnet toggle)

### Phase 4 – Clarity Contracts (in /contracts)
- [ ] agent-registry.clar – deploy, register, discover agents
- [ ] agent-vault.clar – sBTC/USDCx dual vault with yield logic
- [ ] payment-router.clar – x402 micropayment routing A2A + external
- [ ] slashing.clar – DAO-governed stake slashing for bad actors
- [ ] Deploy scripts via stacks.js

### Phase 5 – AI Forge (Natural Language → Agent)
- [ ] ForgeWizard component – multi-step prompt UI
- [ ] LLM integration (OpenAI/Grok API) → generates agent config
- [ ] Clarity code preview panel with syntax highlighting
- [ ] One-click deploy to Stacks testnet

### Phase 6 – Agent Dashboard & Monitoring
- [ ] AgentCard component – status, earnings, activity
- [ ] Real-time activity feed (mock + live tx polling)
- [ ] sBTC vault balance display
- [ ] USDCx stable balance display
- [ ] x402 payment history log

### Phase 7 – Marketplace
- [ ] Agent listing grid with filters (yield, type, reputation)
- [ ] Agent NFT mint/list/buy flow (mock + contract call)
- [ ] Swarm builder – combine agents into a workflow

### Phase 8 – Polish & Demo Prep
- [ ] Responsive design audit (mobile + desktop)
- [ ] Loading states, error boundaries, toast notifications
- [ ] Demo data / mock agents for live demo
- [ ] README.md with architecture diagram description
- [ ] Record pitch video checklist

---

## Architecture Overview

```
AgentForge
├── frontend/               # Vite + React + Tailwind
│   ├── src/
│   │   ├── pages/          # Landing, Dashboard, Forge, Marketplace, AgentDetail
│   │   ├── components/     # Shared UI components
│   │   ├── context/        # WalletContext, AgentContext
│   │   ├── hooks/          # useWallet, useAgent, useVault
│   │   └── utils/          # stacks.js helpers, formatting
│   └── ...
└── contracts/              # Clarity smart contracts
    ├── agent-registry.clar
    ├── agent-vault.clar
    ├── payment-router.clar
    └── slashing.clar
```

## Judging Criteria Mapping

| Criterion | How AgentForge Wins |
|---|---|
| Innovation | First full AI Agent OS on Bitcoin. NL → Clarity deployment. |
| Technical Depth | 4 audited Clarity contracts, x402 A2A payments, sBTC vaults |
| Stacks Alignment | Clarity 4, sBTC, USDCx, x402, stacks.js, Hiro wallet, Bitflow |
| UX | Deploy an agent in <60s. Crypto-native + mainstream friendly |
| Impact | Every agent = more sBTC TVL, gas, DeFi activity. Open SDK roadmap |

## Bounty Targets
- 🥇 Most Innovative Use of sBTC → agent-vault.clar dual vault + slashing collateral
- 🥇 Best Use of USDCx → stable ops payments + yield routing through USDCx
- 🥇 Best x402 Integration → payment-router.clar A2A + external API micropayments
