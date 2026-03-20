# Autonoma BTC – Build Plan
> Decentralized Autonomous AI Agent Operating System on Bitcoin (Stacks)
> Hackathon: Buidl Battle | Deadline: March 31st

---

## TODO List

### Phase 1 – Foundation & Setup
- [x] Initialize git repo with proper .gitignore
- [x] Create plan.md (this file)
- [x] Install missing dependencies (@stacks/connect, @stacks/transactions, lucide-react)
- [x] Update index.html with Autonoma BTC branding & meta tags
- [x] Set up global theme colors (Bitcoin orange + dark mode)

### Phase 2 – Core Pages & Routing
- [x] Rewrite App.tsx with Autonoma BTC nav, routes, and layout
- [x] Landing page – hero, features, stats, CTA
- [x] Dashboard page – agent overview, stats, quick actions
- [x] Forge page – natural-language agent creation wizard
- [x] Marketplace page – browse/buy/rent agents as NFTs
- [x] Agent Detail page – live monitoring, logs, controls

### Phase 3 – Wallet & Stacks Integration
- [x] WalletContext – connect/disconnect Hiro wallet via @stacks/connect
- [x] useWallet hook – address, balance, network state
- [x] Stacks network config (mainnet/testnet toggle)

### Phase 4 – Clarity Contracts (in /contracts)
- [x] agent-registry.clar – deploy, register, discover agents
- [x] agent-vault.clar – sBTC/USDCx dual vault with yield logic
- [x] payment-router.clar – x402 micropayment routing A2A + external
- [x] slashing.clar – DAO-governed stake slashing for bad actors
- [ ] Deploy scripts via stacks.js (deploy to testnet)

### Phase 5 – AI Forge (Natural Language → Agent)
- [x] ForgeWizard component – multi-step prompt UI
- [x] Clarity code preview panel with syntax highlighting
- [x] One-click deploy to Stacks testnet (mock flow)
- [ ] Wire real LLM API (OpenAI/Grok) for Clarity code-gen

### Phase 6 – Agent Dashboard & Monitoring
- [x] AgentCard component – status, earnings, activity
- [x] Real-time activity feed (mock + live tx polling)
- [x] sBTC vault balance display
- [x] USDCx stable balance display
- [x] x402 payment history log

### Phase 7 – Marketplace
- [x] Agent listing grid with filters (yield, type, reputation)
- [x] Agent NFT buy flow (mock + contract call)
- [ ] Agent NFT mint/list flow
- [ ] Swarm builder – combine agents into a workflow

### Phase 8 – Polish & Demo Prep
- [ ] Responsive design audit (mobile + desktop)
- [ ] Loading states, error boundaries, toast notifications ✅ (toasts done)
- [ ] README.md with architecture diagram description
- [ ] Record pitch video checklist

---

## Architecture Overview

```
Autonoma BTC
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

| Criterion | How Autonoma BTC Wins |
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
