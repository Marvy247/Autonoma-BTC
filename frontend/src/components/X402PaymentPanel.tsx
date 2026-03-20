import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle, ExternalLink, Loader, AlertCircle } from 'lucide-react';
import {
  AGENT_API_ENDPOINTS,
  simulateX402Payment,
  buildPaymentRequiredPayload,
  type X402Network,
  type X402Asset,
  type X402PaymentResult,
} from '../utils/x402';
import { useWallet } from '../context/WalletContext';

interface X402PaymentPanelProps {
  agentName: string;
  network: X402Network;
}

export default function X402PaymentPanel({ agentName, network }: X402PaymentPanelProps) {
  const { isConnected, connect } = useWallet();
  const [paying, setPaying] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, X402PaymentResult>>({});
  const [showPayload, setShowPayload] = useState<string | null>(null);

  const handlePay = async (endpointId: string, asset: X402Asset, price: number) => {
    if (!isConnected) { connect(); return; }
    setPaying(endpointId);
    try {
      const result = await simulateX402Payment(endpointId, network, asset, price);
      setResults(prev => ({ ...prev, [endpointId]: result }));
    } finally {
      setPaying(null);
    }
  };

  return (
    <div className="bg-white border border-app-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-app-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
            <Zap size={14} className="text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-main">x402 Payment Layer</p>
            <p className="text-xs text-text-pale">{agentName} · {network} · V2 protocol</p>
          </div>
        </div>
        <span className="text-xs font-mono bg-orange-50 text-orange-600 border border-orange-200 px-2 py-1 rounded-lg">
          {network === 'testnet' ? 'stacks:2147483648' : 'stacks:1'}
        </span>
      </div>

      {/* Endpoints */}
      <div className="divide-y divide-app-border">
        {AGENT_API_ENDPOINTS.map((ep) => {
          const result = results[ep.id];
          const isLoading = paying === ep.id;
          const payload = buildPaymentRequiredPayload(
            'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
            ep.price,
            ep.asset,
            network,
            ep.description
          );

          return (
            <div key={ep.id} className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="text-xl flex-shrink-0">{ep.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-text-main">{ep.name}</p>
                    <code className="text-xs text-text-pale font-mono bg-app-hover px-1.5 py-0.5 rounded">
                      {ep.endpoint}
                    </code>
                  </div>
                  <p className="text-xs text-text-pale mt-0.5">{ep.description}</p>

                  <AnimatePresence>
                    {result && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 flex items-center gap-2 flex-wrap"
                      >
                        <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                          <CheckCircle size={11} /> Paid {result.amount}
                        </span>
                        <span className="text-xs text-text-pale font-mono">
                          tx: {result.txId?.slice(0, 14)}...
                        </span>
                        <a
                          href={result.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-0.5 text-xs text-orange-500 hover:underline"
                        >
                          Explorer <ExternalLink size={10} />
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setShowPayload(showPayload === ep.id ? null : ep.id)}
                    className="text-xs text-text-pale hover:text-orange-500 font-mono border border-app-border px-2 py-1 rounded-lg hover:border-orange-200 transition-colors"
                  >
                    402
                  </button>
                  <button
                    onClick={() => handlePay(ep.id, ep.asset, ep.price)}
                    disabled={isLoading || !!result}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      result
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60'
                    }`}
                  >
                    {isLoading ? (
                      <Loader size={12} className="animate-spin" />
                    ) : result ? (
                      <CheckCircle size={12} />
                    ) : (
                      <Zap size={12} />
                    )}
                    {result ? 'Paid' : `${ep.price} ${ep.asset}`}
                  </button>
                </div>
              </div>

              {/* 402 payload preview */}
              <AnimatePresence>
                {showPayload === ep.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden"
                  >
                    <div className="bg-gray-950 rounded-xl p-3 overflow-x-auto">
                      <p className="text-xs text-gray-500 mb-1 font-mono">HTTP/1.1 402 Payment Required</p>
                      <p className="text-xs text-gray-500 mb-2 font-mono">payment-required: &lt;base64-encoded&gt;</p>
                      <pre className="text-xs text-emerald-400 font-mono leading-relaxed whitespace-pre-wrap">
                        {JSON.stringify(payload, null, 2)}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-3 bg-app-hover border-t border-app-border flex items-center gap-2">
        <AlertCircle size={12} className="text-text-pale flex-shrink-0" />
        <p className="text-xs text-text-pale">
          Powered by <span className="font-semibold text-orange-500">x402-stacks V2</span> — HTTP 402 with facilitator settlement ·{' '}
          <code className="font-mono text-xs">wrapAxiosWithPayment</code> handles signing automatically
        </p>
      </div>
    </div>
  );
}
