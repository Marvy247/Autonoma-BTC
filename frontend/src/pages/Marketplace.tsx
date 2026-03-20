import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, TrendingUp, Zap, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { AGENT_TYPE_LABELS, AGENT_TYPE_COLORS } from '../utils/format';
import type { AgentType } from '../context/AgentContext';

interface MarketAgent {
  id: string;
  name: string;
  type: AgentType;
  owner: string;
  price: number;
  currency: 'STX' | 'sBTC';
  apy: number;
  tasksCompleted: number;
  rating: number;
  description: string;
}

const MARKET_AGENTS: MarketAgent[] = [
  { id: 'm1', name: 'Alpha Yield Bot', type: 'yield-optimizer', owner: 'SP2J6...A4F', price: 500, currency: 'STX', apy: 14.2, tasksCompleted: 1240, rating: 4.9, description: 'Battle-tested yield optimizer with 14.2% APY on Bitflow LP. Auto-rebalances every 6 hours.' },
  { id: 'm2', name: 'Oracle Scout Pro', type: 'data-researcher', owner: 'SP3K1...B7C', price: 0.001, currency: 'sBTC', apy: 0, tasksCompleted: 3400, rating: 4.7, description: 'Aggregates price data from 12 sources via x402 micropayments. Feeds 50+ downstream agents.' },
  { id: 'm3', name: 'Swarm Commander', type: 'trader', owner: 'SP1M9...D2E', price: 1200, currency: 'STX', apy: 22.1, tasksCompleted: 890, rating: 4.8, description: 'Orchestrates 5-agent trading swarm. Research → signal → execution pipeline with sBTC settlement.' },
  { id: 'm4', name: 'Stable Keeper', type: 'yield-optimizer', owner: 'SP4N2...F9G', price: 300, currency: 'STX', apy: 8.5, tasksCompleted: 2100, rating: 4.6, description: 'Conservative USDCx yield strategy. Optimizes lending rates across protocols with minimal risk.' },
  { id: 'm5', name: 'News Hawk', type: 'data-researcher', owner: 'SP5P3...H1I', price: 0.0005, currency: 'sBTC', apy: 0, tasksCompleted: 5600, rating: 4.5, description: 'Monitors Bitcoin and Stacks news, pays x402 for premium feeds, sells summaries to trading agents.' },
  { id: 'm6', name: 'DeFi Arbitrageur', type: 'trader', owner: 'SP6Q4...J3K', price: 2000, currency: 'STX', apy: 31.4, tasksCompleted: 420, rating: 4.9, description: 'Finds and executes arbitrage opportunities across Stacks DeFi protocols. High risk, high reward.' },
];

const FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: '📈 Yield', value: 'yield-optimizer' },
  { label: '🔍 Research', value: 'data-researcher' },
  { label: '⚡ Trader', value: 'trader' },
];

export default function Marketplace() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [buying, setBuying] = useState<string | null>(null);

  const filtered = MARKET_AGENTS.filter(a => {
    const matchType = filter === 'all' || a.type === filter;
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const handleBuy = async (agent: MarketAgent) => {
    setBuying(agent.id);
    await new Promise(r => setTimeout(r, 1500));
    setBuying(null);
    toast.success(`${agent.name} purchased! Check your dashboard.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-extrabold text-3xl text-text-main mb-1">Agent Marketplace</h1>
        <p className="text-text-dim text-sm">Buy, sell, and rent battle-tested AI agents as NFTs</p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-pale" />
          <input
            className="input-premium pl-10"
            placeholder="Search agents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-white border border-app-border text-text-dim hover:border-orange-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white border border-app-border rounded-2xl p-5 hover:shadow-floating hover:border-orange-200 transition-all"
          >
            {/* Type badge */}
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${AGENT_TYPE_COLORS[agent.type]}`}>
                {AGENT_TYPE_LABELS[agent.type]}
              </span>
              <div className="flex items-center gap-1 text-xs text-yellow-500 font-semibold">
                <Star size={12} fill="currentColor" />
                {agent.rating}
              </div>
            </div>

            <h3 className="font-display font-bold text-base text-text-main mb-1">{agent.name}</h3>
            <p className="text-xs text-text-pale mb-1">by {agent.owner}</p>
            <p className="text-sm text-text-dim mb-4 line-clamp-2">{agent.description}</p>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-xs text-text-pale">
              {agent.apy > 0 && (
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <TrendingUp size={12} /> {agent.apy}% APY
                </span>
              )}
              <span className="flex items-center gap-1">
                <Zap size={12} /> {agent.tasksCompleted.toLocaleString()} tasks
              </span>
            </div>

            {/* Price + Buy */}
            <div className="flex items-center justify-between pt-3 border-t border-app-border">
              <div>
                <p className="text-xs text-text-pale">Price</p>
                <p className="font-display font-bold text-base text-text-main">
                  {agent.price} {agent.currency}
                </p>
              </div>
              <button
                onClick={() => handleBuy(agent)}
                disabled={buying === agent.id}
                className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-all disabled:opacity-60"
              >
                {buying === agent.id ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShoppingCart size={14} />
                )}
                Buy
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
