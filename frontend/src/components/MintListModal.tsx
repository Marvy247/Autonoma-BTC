import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader, CheckCircle, Tag, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Agent } from '../context/AgentContext';
import { AGENT_TYPE_LABELS } from '../utils/format';

interface MintListModalProps {
  agent: Agent;
  onClose: () => void;
}

export default function MintListModal({ agent, onClose }: MintListModalProps) {
  const [tab, setTab] = useState<'mint' | 'list'>('mint');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<'STX' | 'sBTC'>('STX');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (tab === 'list' && !price) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setDone(true);
    setTimeout(() => {
      toast.success(tab === 'mint' ? `${agent.name} minted as NFT!` : `${agent.name} listed for ${price} ${currency}`);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl border border-app-border shadow-floating w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-app-border">
          <h2 className="font-display font-bold text-lg text-text-main">Agent NFT</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-app-hover text-text-dim transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Agent summary */}
        <div className="px-6 py-4 bg-orange-50 border-b border-app-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-lg">⚡</div>
          <div>
            <p className="font-semibold text-sm text-text-main">{agent.name}</p>
            <p className="text-xs text-text-pale">{AGENT_TYPE_LABELS[agent.type]} · Rep: {agent.reputationScore}/1000</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-app-border">
          {(['mint', 'list'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${
                tab === t ? 'text-orange-500 border-b-2 border-orange-500' : 'text-text-dim hover:text-text-main'
              }`}
            >
              {t === 'mint' ? '🪙 Mint NFT' : '🏷 List for Sale'}
            </button>
          ))}
        </div>

        <div className="px-6 py-5 space-y-4">
          {tab === 'mint' ? (
            <div className="space-y-3">
              <p className="text-sm text-text-dim">
                Minting tokenizes your agent as a Stacks NFT (SIP-009). The NFT represents ownership of the agent's Clarity contract and vault.
              </p>
              <div className="bg-app-hover rounded-xl p-3 text-xs text-text-dim space-y-1">
                <p>✅ Transfers agent ownership on-chain</p>
                <p>✅ Vault funds move with the NFT</p>
                <p>✅ Reputation score preserved</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-text-dim">Set a price to list your agent NFT on the marketplace.</p>
              <div className="flex gap-2">
                <input
                  className="input-premium flex-1"
                  placeholder="Price"
                  type="number"
                  min="0"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
                <select
                  className="input-premium w-28"
                  value={currency}
                  onChange={e => setCurrency(e.target.value as 'STX' | 'sBTC')}
                >
                  <option value="STX">STX</option>
                  <option value="sBTC">sBTC</option>
                </select>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || done || (tab === 'list' && !price)}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {done ? (
              <><CheckCircle size={16} /> Done!</>
            ) : loading ? (
              <><Loader size={16} className="animate-spin" /> Processing...</>
            ) : tab === 'mint' ? (
              <><Tag size={16} /> Mint Agent NFT</>
            ) : (
              <><DollarSign size={16} /> List on Marketplace</>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
