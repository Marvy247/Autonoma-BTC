import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, CheckCircle, ExternalLink, Loader, Copy, Shield, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  AGENT_API_ENDPOINTS,
  simulateX402Payment,
  buildPaymentRequiredPayload,
  STXtoMicroSTX,
  BTCtoSats,
  formatPaymentAmount,
  networkToCAIP2,
  generateKeypair,
  type X402Network,
  type X402Asset,
  type X402PaymentResult,
} from '../utils/x402';
import { useWallet } from '../context/WalletContext';

const FLOW_STEPS = [
  { step: 1, label: 'Agent requests API', detail: 'GET /api/premium-data', color: 'bg-blue-100 text-blue-700' },
  { step: 2, label: 'Server returns 402', detail: 'payment-required header', color: 'bg-orange-100 text-orange-700' },
  { step: 3, label: 'Client signs tx', detail: 'wrapAxiosWithPayment()', color: 'bg-purple-100 text-purple-700' },
  { step: 4, label: 'Retry with payment', detail: 'payment-signature header', color: 'bg-yellow-100 text-yellow-700' },
  { step: 5, label: 'Facilitator settles', detail: 'POST /settle → broadcast', color: 'bg-pink-100 text-pink-700' },
  { step: 6, label: 'Access granted', detail: 'payment-response header', color: 'bg-emerald-100 text-emerald-700' },
];

export default function X402Explorer() {
  const { isConnected, connect, network } = useWallet();
  const x402Network = network as X402Network;

  const [selectedEndpoint, setSelectedEndpoint] = useState(AGENT_API_ENDPOINTS[0]);
  const [selectedAsset, setSelectedAsset] = useState<X402Asset>('STX');
  const [paying, setPaying] = useState(false);
  const [activeFlowStep, setActiveFlowStep] = useState(0);
  const [paymentHistory, setPaymentHistory] = useState<X402PaymentResult[]>([]);
  const [lastResult, setLastResult] = useState<X402PaymentResult | null>(null);
  const [demoWallet] = useState(() => generateKeypair(x402Network));

  const payload402 = buildPaymentRequiredPayload(
    'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    selectedEndpoint.price,
    selectedAsset,
    x402Network,
    selectedEndpoint.description
  );

  const microAmount = selectedAsset === 'STX'
    ? STXtoMicroSTX(selectedEndpoint.price)
    : BTCtoSats(selectedEndpoint.price / 100_000_000);

  const handlePay = async () => {
    if (!isConnected) { connect(); return; }
    setPaying(true);
    setLastResult(null);
    setActiveFlowStep(0);

    // Animate through flow steps
    for (let i = 1; i <= 6; i++) {
      await new Promise(r => setTimeout(r, 350));
      setActiveFlowStep(i);
    }

    try {
      const result = await simulateX402Payment(
        selectedEndpoint.id,
        x402Network,
        selectedAsset,
        selectedEndpoint.price
      );
      setLastResult(result);
      setPaymentHistory(prev => [result, ...prev].slice(0, 10));
      toast.success(`x402 payment settled! ${result.amount}`);
    } finally {
      setPaying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-text-main mb-1">x402 Payment Explorer</h1>
          <p className="text-text-dim text-sm">
            Live HTTP 402 micropayments on Stacks ·{' '}
            <code className="font-mono text-xs bg-app-hover px-1.5 py-0.5 rounded">x402-stacks V2</code>
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-700">
            Facilitator Online
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Configure & Execute */}
        <div className="space-y-4">
          {/* Protocol info */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={18} />
              <span className="font-display font-bold text-base">x402 V2 Protocol</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-orange-100 text-xs mb-1">Network (CAIP-2)</p>
                <p className="font-mono font-bold text-sm">{networkToCAIP2(x402Network)}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-orange-100 text-xs mb-1">Facilitator</p>
                <p className="font-mono font-bold text-xs truncate">x402-backend-7eby</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-orange-100 text-xs mb-1">Scheme</p>
                <p className="font-mono font-bold">exact</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-orange-100 text-xs mb-1">Timeout</p>
                <p className="font-mono font-bold">300s</p>
              </div>
            </div>
          </div>

          {/* Select endpoint */}
          <div className="bg-white border border-app-border rounded-2xl p-5 space-y-4">
            <h2 className="font-display font-bold text-base text-text-main">Configure Payment</h2>

            <div>
              <label className="text-xs font-semibold text-text-dim mb-2 block">API Endpoint</label>
              <div className="grid grid-cols-1 gap-2">
                {AGENT_API_ENDPOINTS.map(ep => (
                  <button
                    key={ep.id}
                    onClick={() => { setSelectedEndpoint(ep); setSelectedAsset(ep.asset); }}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      selectedEndpoint.id === ep.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-app-border hover:border-orange-200'
                    }`}
                  >
                    <span className="text-lg">{ep.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-main">{ep.name}</p>
                      <p className="text-xs text-text-pale truncate">{ep.endpoint}</p>
                    </div>
                    <span className="text-xs font-bold text-orange-600 flex-shrink-0">
                      {ep.price} {ep.asset}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Asset toggle */}
            <div>
              <label className="text-xs font-semibold text-text-dim mb-2 block">Payment Asset</label>
              <div className="flex gap-2">
                {(['STX', 'sBTC'] as X402Asset[]).map(a => (
                  <button
                    key={a}
                    onClick={() => setSelectedAsset(a)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                      selectedAsset === a
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'border-app-border text-text-dim hover:border-orange-200'
                    }`}
                  >
                    {a === 'sBTC' ? '₿ sBTC' : '⚡ STX'}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount preview */}
            <div className="bg-app-hover rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs text-text-dim">Amount (micro units)</span>
              <code className="text-xs font-mono font-bold text-text-main">
                {microAmount.toString()} {selectedAsset === 'STX' ? 'μSTX' : 'sats'}
              </code>
            </div>

            {/* Pay button */}
            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full py-3.5 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
            >
              {paying ? (
                <><Loader size={16} className="animate-spin" /> Processing x402 Payment...</>
              ) : (
                <><Zap size={16} /> Execute x402 Payment · {formatPaymentAmount(microAmount, { tokenType: selectedAsset })}</>
              )}
            </button>
          </div>
        </div>

        {/* Right: Flow visualizer + 402 payload */}
        <div className="space-y-4">
          {/* Flow animation */}
          <div className="bg-white border border-app-border rounded-2xl p-5">
            <h2 className="font-display font-bold text-base text-text-main mb-4">
              Payment Flow
              {paying && <span className="ml-2 text-xs font-normal text-orange-500 animate-pulse">● live</span>}
            </h2>
            <div className="space-y-2">
              {FLOW_STEPS.map((s) => (
                <motion.div
                  key={s.step}
                  animate={{
                    opacity: activeFlowStep >= s.step ? 1 : 0.3,
                    x: activeFlowStep === s.step ? [0, 4, 0] : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                    activeFlowStep >= s.step ? s.color : 'bg-app-hover text-text-pale'
                  }`}>
                    {activeFlowStep > s.step ? <CheckCircle size={12} /> : s.step}
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span className={`text-sm font-medium ${activeFlowStep >= s.step ? 'text-text-main' : 'text-text-pale'}`}>
                      {s.label}
                    </span>
                    <code className={`text-xs font-mono ${activeFlowStep >= s.step ? 'text-text-dim' : 'text-text-pale'}`}>
                      {s.detail}
                    </code>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Success result */}
            <AnimatePresence>
              {lastResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-800">Payment Settled</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-emerald-600">Amount:</span>{' '}
                      <span className="font-semibold">{lastResult.amount}</span>
                    </div>
                    <div>
                      <span className="text-emerald-600">Network:</span>{' '}
                      <span className="font-mono">{networkToCAIP2(lastResult.network)}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <span className="text-emerald-600">Tx:</span>
                      <span className="font-mono truncate">{lastResult.txId?.slice(0, 20)}...</span>
                      <button onClick={() => copyToClipboard(lastResult.txId!)} className="text-emerald-600 hover:text-emerald-800">
                        <Copy size={11} />
                      </button>
                      <a href={lastResult.explorerUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-800">
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Live 402 payload */}
          <div className="bg-white border border-app-border rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-app-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-orange-500" />
                <span className="text-sm font-bold text-text-main">402 Payment Required Payload</span>
              </div>
              <button
                onClick={() => copyToClipboard(JSON.stringify(payload402, null, 2))}
                className="flex items-center gap-1 text-xs text-text-pale hover:text-orange-500 transition-colors"
              >
                <Copy size={12} /> Copy
              </button>
            </div>
            <div className="bg-gray-950 p-4 overflow-x-auto">
              <p className="text-xs text-gray-500 font-mono mb-2">
                {'>'} HTTP/1.1 402 Payment Required<br />
                {'>'} payment-required: &lt;base64(payload)&gt;
              </p>
              <pre className="text-xs text-emerald-400 font-mono leading-relaxed">
                {JSON.stringify(payload402, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Payment history */}
      {paymentHistory.length > 0 && (
        <div className="bg-white border border-app-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-app-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-orange-500" />
              <span className="font-display font-bold text-base text-text-main">Payment History</span>
            </div>
            <span className="text-xs text-text-pale">{paymentHistory.length} transactions</span>
          </div>
          <div className="divide-y divide-app-border">
            {paymentHistory.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 px-5 py-3"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={13} className="text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-main">{r.endpoint}</p>
                  <p className="text-xs text-text-pale font-mono truncate">{r.txId?.slice(0, 24)}...</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-emerald-600">{r.amount}</p>
                  <p className="text-xs text-text-pale font-mono">{networkToCAIP2(r.network)}</p>
                </div>
                <a
                  href={r.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-pale hover:text-orange-500 transition-colors"
                >
                  <ExternalLink size={14} />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Demo wallet info */}
      <div className="bg-white border border-app-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={15} className="text-orange-500" />
          <h2 className="font-display font-bold text-base text-text-main">Agent Demo Wallet</h2>
          <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full">testnet only</span>
        </div>
        <p className="text-xs text-text-dim mb-3">
          Generated via <code className="font-mono bg-app-hover px-1 rounded">generateKeypair()</code> from x402-stacks.
          In production, agents use their own private keys stored securely.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-app-hover rounded-xl p-3">
            <p className="text-xs text-text-pale mb-1">Address</p>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono text-text-main truncate">{demoWallet.address}</code>
              <button onClick={() => copyToClipboard(demoWallet.address)} className="text-text-pale hover:text-orange-500 flex-shrink-0">
                <Copy size={11} />
              </button>
            </div>
          </div>
          <div className="bg-app-hover rounded-xl p-3">
            <p className="text-xs text-text-pale mb-1">Network</p>
            <code className="text-xs font-mono text-text-main">{networkToCAIP2(x402Network)}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
