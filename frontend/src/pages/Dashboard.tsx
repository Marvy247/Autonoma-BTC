import { motion } from 'framer-motion';
import { Plus, TrendingUp, Zap, DollarSign, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAgents } from '../context/AgentContext';
import { useWallet } from '../context/WalletContext';
import AgentCard from '../components/AgentCard';
import { timeAgo } from '../utils/format';

export default function Dashboard() {
  const { agents, updateAgent } = useAgents();
  const { isConnected, connect, address } = useWallet();

  const totalsBTC = agents.reduce((s, a) => s + a.sBtcBalance, 0);
  const totalUSDCx = agents.reduce((s, a) => s + a.usdcxBalance, 0);
  const totalSTX = agents.reduce((s, a) => s + a.stxBalance, 0);
  const activeCount = agents.filter(a => a.status === 'active').length;

  const allTx = agents
    .flatMap(a => a.txHistory.map(tx => ({ ...tx, agentName: a.name })))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 8);

  const handleToggle = (id: string) => {
    const agent = agents.find(a => a.id === id);
    if (!agent) return;
    updateAgent(id, { status: agent.status === 'active' ? 'paused' : 'active' });
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-6">
          <Zap size={28} className="text-orange-500" />
        </div>
        <h2 className="font-display font-bold text-2xl text-text-main mb-3">Connect Your Wallet</h2>
        <p className="text-text-dim mb-6 max-w-sm">Connect your Hiro wallet to view and manage your AI agents on Stacks.</p>
        <button
          onClick={connect}
          className="px-8 py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all"
        >
          Connect Hiro Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-text-main">Dashboard</h1>
          <p className="text-text-dim text-sm mt-1">
            {address?.slice(0, 8)}... · {activeCount} agents active
          </p>
        </div>
        <Link
          to="/forge"
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-all shadow-sm"
        >
          <Plus size={16} />
          New Agent
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'sBTC in Vaults', value: totalsBTC.toFixed(4), icon: <TrendingUp size={18} className="text-orange-500" />, bg: 'bg-orange-50' },
          { label: 'USDCx Balance', value: `$${totalUSDCx.toFixed(0)}`, icon: <DollarSign size={18} className="text-blue-500" />, bg: 'bg-blue-50' },
          { label: 'STX Balance', value: totalSTX.toLocaleString(), icon: <Zap size={18} className="text-purple-500" />, bg: 'bg-purple-50' },
          { label: 'Active Agents', value: `${activeCount}/${agents.length}`, icon: <Activity size={18} className="text-emerald-500" />, bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white border border-app-border rounded-2xl p-5"
          >
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="font-display font-extrabold text-2xl text-text-main">{stat.value}</p>
            <p className="text-xs text-text-pale mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Agents grid + Activity feed */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Agents */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display font-bold text-lg text-text-main">Your Agents</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} onToggle={handleToggle} />
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div>
          <h2 className="font-display font-bold text-lg text-text-main mb-4">Live Activity</h2>
          <div className="bg-white border border-app-border rounded-2xl divide-y divide-app-border overflow-hidden">
            {allTx.length === 0 ? (
              <p className="text-text-pale text-sm p-5 text-center">No activity yet</p>
            ) : (
              allTx.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <span className={`text-lg ${
                    tx.type === 'earn' || tx.type === 'yield' ? '📈' :
                    tx.type === 'pay' ? '⚡' : '🚀'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-main truncate">{tx.agentName}</p>
                    <p className="text-xs text-text-pale truncate">{tx.memo}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-bold ${tx.type === 'pay' ? 'text-red-500' : 'text-emerald-600'}`}>
                      {tx.type === 'pay' ? '-' : '+'}{tx.amount} {tx.currency}
                    </p>
                    <p className="text-xs text-text-pale">{timeAgo(tx.timestamp)}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
