import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Activity, TrendingUp, Zap, Shield, Play, Pause, DollarSign } from 'lucide-react';
import { useAgents } from '../context/AgentContext';
import { AGENT_TYPE_LABELS, STATUS_COLORS, timeAgo } from '../utils/format';

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const { agents, updateAgent } = useAgents();
  const agent = agents.find(a => a.id === id);

  if (!agent) {
    return (
      <div className="text-center py-20">
        <p className="text-text-dim mb-4">Agent not found.</p>
        <Link to="/dashboard" className="text-orange-500 font-semibold hover:underline">← Back to Dashboard</Link>
      </div>
    );
  }

  const handleToggle = () => {
    updateAgent(agent.id, { status: agent.status === 'active' ? 'paused' : 'active' });
  };

  const reputationPct = (agent.reputationScore / 1000) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back + header */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="p-2 rounded-xl hover:bg-app-hover transition-colors text-text-dim">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display font-extrabold text-2xl text-text-main">{agent.name}</h1>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[agent.status]}`}>
              {agent.status === 'active' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />}
              {agent.status}
            </span>
          </div>
          <p className="text-sm text-text-dim mt-0.5">{AGENT_TYPE_LABELS[agent.type]} · Last active {timeAgo(agent.lastActive)}</p>
        </div>
        <button
          onClick={handleToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            agent.status === 'active'
              ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          {agent.status === 'active' ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Resume</>}
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'sBTC Balance', value: agent.sBtcBalance.toFixed(6), icon: <TrendingUp size={16} className="text-orange-500" />, bg: 'bg-orange-50' },
          { label: 'USDCx Balance', value: `$${agent.usdcxBalance.toFixed(2)}`, icon: <DollarSign size={16} className="text-blue-500" />, bg: 'bg-blue-50' },
          { label: 'STX Balance', value: agent.stxBalance.toLocaleString(), icon: <Zap size={16} className="text-purple-500" />, bg: 'bg-purple-50' },
          { label: 'Tasks Done', value: agent.tasksCompleted.toLocaleString(), icon: <Activity size={16} className="text-emerald-500" />, bg: 'bg-emerald-50' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white border border-app-border rounded-2xl p-4"
          >
            <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>{s.icon}</div>
            <p className="font-display font-bold text-xl text-text-main">{s.value}</p>
            <p className="text-xs text-text-pale">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Reputation */}
        <div className="bg-white border border-app-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-orange-500" />
            <h2 className="font-display font-bold text-base text-text-main">Reputation Score</h2>
          </div>
          <div className="flex items-end gap-3 mb-3">
            <span className="font-display font-extrabold text-4xl text-text-main">{agent.reputationScore}</span>
            <span className="text-text-pale text-sm mb-1">/ 1000</span>
          </div>
          <div className="w-full bg-app-hover rounded-full h-2.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${reputationPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
            />
          </div>
          <p className="text-xs text-text-pale mt-2">
            {reputationPct >= 80 ? '🟢 Excellent — eligible for high-value tasks' :
             reputationPct >= 60 ? '🟡 Good — building trust' :
             '🔴 Low — complete more tasks to improve'}
          </p>
        </div>

        {/* Description */}
        <div className="bg-white border border-app-border rounded-2xl p-5">
          <h2 className="font-display font-bold text-base text-text-main mb-3">Agent Description</h2>
          <p className="text-sm text-text-dim leading-relaxed">{agent.description}</p>
          <div className="mt-4 pt-4 border-t border-app-border grid grid-cols-2 gap-3 text-xs">
            <div><span className="text-text-pale">Total Earnings:</span> <span className="font-semibold text-emerald-600">{agent.totalEarnings} STX</span></div>
            <div><span className="text-text-pale">Agent ID:</span> <span className="font-mono text-text-dim">#{agent.id}</span></div>
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="bg-white border border-app-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-app-border">
          <h2 className="font-display font-bold text-base text-text-main">Transaction History</h2>
        </div>
        {agent.txHistory.length === 0 ? (
          <p className="text-text-pale text-sm p-6 text-center">No transactions yet. Deploy and activate your agent to start earning.</p>
        ) : (
          <div className="divide-y divide-app-border">
            {agent.txHistory.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 px-5 py-3.5"
              >
                <span className="text-xl">
                  {tx.type === 'earn' || tx.type === 'yield' ? '📈' : tx.type === 'pay' ? '⚡' : '🚀'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-main capitalize">{tx.type}</p>
                  <p className="text-xs text-text-pale truncate">{tx.memo}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.type === 'pay' ? 'text-red-500' : 'text-emerald-600'}`}>
                    {tx.type === 'pay' ? '-' : '+'}{tx.amount} {tx.currency}
                  </p>
                  <p className="text-xs text-text-pale">{timeAgo(tx.timestamp)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
