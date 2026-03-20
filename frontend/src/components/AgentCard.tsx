import { motion } from 'framer-motion';
import { Activity, Pause, Play, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Agent } from '../context/AgentContext';
import { AGENT_TYPE_LABELS, AGENT_TYPE_COLORS, STATUS_COLORS, timeAgo } from '../utils/format';

interface AgentCardProps {
  agent: Agent;
  onToggle?: (id: string) => void;
}

export default function AgentCard({ agent, onToggle }: AgentCardProps) {
  const isActive = agent.status === 'active';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-app-border rounded-2xl p-5 hover:shadow-floating hover:border-orange-200 transition-all duration-300 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${AGENT_TYPE_COLORS[agent.type]}`}>
              {AGENT_TYPE_LABELS[agent.type]}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[agent.status]}`}>
              {isActive && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />}
              {agent.status}
            </span>
          </div>
          <h3 className="font-display font-bold text-base text-text-main truncate">{agent.name}</h3>
          <p className="text-xs text-text-pale mt-0.5 line-clamp-1">{agent.description}</p>
        </div>
        {onToggle && (
          <button
            onClick={() => onToggle(agent.id)}
            className="ml-3 p-2 rounded-xl hover:bg-app-hover transition-colors text-text-dim hover:text-orange-500"
          >
            {isActive ? <Pause size={15} /> : <Play size={15} />}
          </button>
        )}
      </div>

      {/* Balances */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-orange-50 rounded-xl p-2.5 text-center">
          <p className="text-xs text-orange-600 font-medium mb-0.5">sBTC</p>
          <p className="text-sm font-bold text-orange-700">{agent.sBtcBalance.toFixed(4)}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-2.5 text-center">
          <p className="text-xs text-blue-600 font-medium mb-0.5">USDCx</p>
          <p className="text-sm font-bold text-blue-700">${agent.usdcxBalance.toFixed(0)}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-2.5 text-center">
          <p className="text-xs text-purple-600 font-medium mb-0.5">STX</p>
          <p className="text-sm font-bold text-purple-700">{agent.stxBalance}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-xs text-text-pale border-t border-app-border pt-3">
        <div className="flex items-center gap-1">
          <TrendingUp size={12} className="text-emerald-500" />
          <span>{agent.tasksCompleted} tasks</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap size={12} className="text-orange-400" />
          <span>Rep: {agent.reputationScore}/1000</span>
        </div>
        <div className="flex items-center gap-1">
          <Activity size={12} />
          <span>{timeAgo(agent.lastActive)}</span>
        </div>
      </div>

      {/* View link */}
      <Link
        to={`/agent/${agent.id}`}
        className="mt-3 w-full flex items-center justify-center py-2 rounded-xl text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors"
      >
        View Agent →
      </Link>
    </motion.div>
  );
}
