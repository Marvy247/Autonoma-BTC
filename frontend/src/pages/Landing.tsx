import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Shield, Cpu, DollarSign, TrendingUp, Activity, ChevronRight } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const STATS = [
  { label: 'Total Agents Deployed', value: '1,247', delta: '+12 today' },
  { label: 'sBTC in Vaults', value: '4.82 BTC', delta: '+0.3 BTC this week' },
  { label: 'x402 Payments Routed', value: '$48,200', delta: '+$2,100 today' },
  { label: 'Avg Agent Yield APY', value: '11.4%', delta: 'via Bitflow LP' },
];

const FEATURES = [
  {
    icon: <Cpu size={22} className="text-orange-500" />,
    title: 'Natural Language → Agent',
    desc: 'Describe your agent in plain English. AgentForge generates secure Clarity contracts and deploys them in one click.',
  },
  {
    icon: <Shield size={22} className="text-blue-500" />,
    title: 'Clarity Agent Kernel',
    desc: 'Every agent runs inside a non-custodial Clarity contract with post-conditions, spending policies, and DAO-governed slashing.',
  },
  {
    icon: <DollarSign size={22} className="text-emerald-500" />,
    title: 'sBTC / USDCx Dual Vaults',
    desc: 'Agents auto-earn yield across Bitflow and lending protocols. sBTC as collateral, USDCx for stable operations.',
  },
  {
    icon: <Zap size={22} className="text-purple-500" />,
    title: 'x402 Native Payments',
    desc: 'Agents pay each other and external APIs autonomously via x402 micropayments — no subscriptions, pure pay-per-task.',
  },
  {
    icon: <Activity size={22} className="text-pink-500" />,
    title: 'Swarm Orchestration',
    desc: 'Agents discover, hire, and pay each other for complex tasks: research → analysis → execution, all on-chain.',
  },
  {
    icon: <TrendingUp size={22} className="text-yellow-500" />,
    title: 'Agent Marketplace',
    desc: 'Buy, sell, and rent agents as NFTs. Earn passive income by listing your agents for others to use.',
  },
];

const AGENT_DEMOS = [
  { name: 'Yield Hawk', type: 'Yield Optimizer', earning: '+0.00012 sBTC', status: 'active', color: 'orange' },
  { name: 'Data Scout', type: 'Data Researcher', earning: '+5 USDCx', status: 'active', color: 'blue' },
  { name: 'Swarm Alpha', type: 'Trader Swarm', earning: '+120 STX', status: 'active', color: 'purple' },
];

export default function Landing() {
  const { connect, isConnected } = useWallet();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-36 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Built on Bitcoin · Powered by Stacks
            </span>

            <h1 className="font-display font-extrabold text-5xl md:text-7xl tracking-tight text-text-main mb-6 leading-[1.05]">
              The Bitcoin-Native
              <br />
              <span className="text-orange-500">AI Agent OS</span>
            </h1>

            <p className="text-xl text-text-dim max-w-2xl mx-auto mb-10 leading-relaxed">
              Natural language → deploy unstoppable AI agent swarms that earn, spend, and collaborate
              in sBTC/USDCx using native Clarity security and x402 micropayments.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/forge"
                className="flex items-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-2xl font-bold text-base hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5"
              >
                <Zap size={18} />
                Forge Your First Agent
                <ArrowRight size={16} />
              </Link>
              {!isConnected && (
                <button
                  onClick={connect}
                  className="flex items-center gap-2 px-8 py-4 bg-white border border-app-border text-text-main rounded-2xl font-semibold text-base hover:border-orange-300 hover:shadow-premium transition-all"
                >
                  Connect Hiro Wallet
                </button>
              )}
            </div>
          </motion.div>

          {/* Live agent demo strip */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            {AGENT_DEMOS.map((agent, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 bg-white border border-app-border rounded-2xl shadow-premium min-w-[200px]"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-bold text-text-main">{agent.name}</p>
                  <p className="text-xs text-text-pale">{agent.type}</p>
                </div>
                <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                  {agent.earning}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-white border-y border-app-border">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <p className="font-display font-extrabold text-3xl text-text-main">{stat.value}</p>
              <p className="text-sm text-text-dim mt-1">{stat.label}</p>
              <p className="text-xs text-emerald-600 mt-0.5">{stat.delta}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-extrabold text-4xl text-text-main mb-4">
              One OS. Every Agent. All on Bitcoin.
            </h2>
            <p className="text-text-dim text-lg max-w-xl mx-auto">
              AgentForge unifies yield optimization, data research, trading, and payments into a single composable protocol.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-white border border-app-border rounded-2xl p-6 hover:shadow-floating hover:border-orange-200 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-app-hover flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-base text-text-main mb-2">{f.title}</h3>
                <p className="text-sm text-text-dim leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-12 text-white shadow-xl">
            <h2 className="font-display font-extrabold text-4xl mb-4">
              Turn Bitcoin into a Productive Asset
            </h2>
            <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
              Deploy your first AI agent in under 60 seconds. No crypto knowledge required.
            </p>
            <Link
              to="/forge"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 rounded-2xl font-bold text-base hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              Start Forging <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
