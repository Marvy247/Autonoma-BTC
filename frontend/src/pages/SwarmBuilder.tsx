import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ArrowRight, Loader, CheckCircle, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAgents } from '../context/AgentContext';

const STEP_TYPES = [
  { value: 'research', label: '🔍 Research', desc: 'Gather data via x402 APIs' },
  { value: 'analyze', label: '📊 Analyze', desc: 'Process and score signals' },
  { value: 'yield', label: '📈 Yield', desc: 'Optimize sBTC/USDCx yield' },
  { value: 'execute', label: '⚡ Execute', desc: 'Execute trade or action' },
  { value: 'report', label: '📝 Report', desc: 'Summarize and notify' },
];

interface SwarmStep {
  id: string;
  agentId: string;
  stepType: string;
  paymentAmount: number;
  currency: 'STX' | 'sBTC' | 'USDCx';
}

export default function SwarmBuilder() {
  const { agents } = useAgents();
  const [swarmName, setSwarmName] = useState('');
  const [steps, setSteps] = useState<SwarmStep[]>([]);
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);

  const addStep = () => {
    if (agents.length === 0) return;
    setSteps(prev => [...prev, {
      id: Date.now().toString(),
      agentId: agents[0].id,
      stepType: STEP_TYPES[prev.length % STEP_TYPES.length].value,
      paymentAmount: 1,
      currency: 'STX',
    }]);
  };

  const removeStep = (id: string) => setSteps(prev => prev.filter(s => s.id !== id));

  const updateStep = (id: string, key: keyof SwarmStep, value: string | number) =>
    setSteps(prev => prev.map(s => s.id === id ? { ...s, [key]: value } : s));

  const handleDeploy = async () => {
    if (!swarmName || steps.length < 2) {
      toast.error('Add a name and at least 2 steps');
      return;
    }
    setDeploying(true);
    await new Promise(r => setTimeout(r, 2500));
    setDeploying(false);
    setDeployed(true);
    toast.success(`Swarm "${swarmName}" deployed! Agents are collaborating.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-3xl text-text-main mb-1">Swarm Builder</h1>
        <p className="text-text-dim text-sm">Chain agents into a collaborative workflow — each step pays the next via x402</p>
      </div>

      {/* Swarm name */}
      <input
        className="input-premium"
        placeholder="Swarm name (e.g. BTC Alpha Strategy)"
        value={swarmName}
        onChange={e => setSwarmName(e.target.value)}
      />

      {/* Pipeline */}
      <div className="space-y-3">
        <AnimatePresence>
          {steps.map((step, i) => {
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white border border-app-border rounded-2xl p-4"
              >
                <div className="flex items-center gap-3">
                  {/* Step number */}
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </div>

                  {/* Step type */}
                  <select
                    className="input-premium py-2 text-sm flex-1"
                    value={step.stepType}
                    onChange={e => updateStep(step.id, 'stepType', e.target.value)}
                  >
                    {STEP_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label} — {t.desc}</option>
                    ))}
                  </select>

                  {/* Agent */}
                  <select
                    className="input-premium py-2 text-sm flex-1"
                    value={step.agentId}
                    onChange={e => updateStep(step.id, 'agentId', e.target.value)}
                  >
                    {agents.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>

                  {/* x402 payment */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input
                      type="number"
                      min="0"
                      className="input-premium py-2 text-sm w-20"
                      value={step.paymentAmount}
                      onChange={e => updateStep(step.id, 'paymentAmount', Number(e.target.value))}
                    />
                    <select
                      className="input-premium py-2 text-sm w-24"
                      value={step.currency}
                      onChange={e => updateStep(step.id, 'currency', e.target.value)}
                    >
                      <option>STX</option>
                      <option>sBTC</option>
                      <option>USDCx</option>
                    </select>
                  </div>

                  <button onClick={() => removeStep(step.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-text-pale hover:text-red-500 transition-colors flex-shrink-0">
                    <X size={15} />
                  </button>
                </div>

                {i < steps.length - 1 && (
                  <div className="flex items-center gap-2 mt-3 ml-10 text-xs text-text-pale">
                    <ArrowRight size={12} className="text-orange-400" />
                    <span>pays <strong>{step.paymentAmount} {step.currency}</strong> → {agents.find(a => a.id === steps[i + 1]?.agentId)?.name ?? 'next agent'} via x402</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        <button
          onClick={addStep}
          className="w-full py-3 border-2 border-dashed border-app-border rounded-2xl text-sm font-semibold text-text-dim hover:border-orange-300 hover:text-orange-500 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Add Step
        </button>
      </div>

      {/* Summary */}
      {steps.length >= 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-sm text-orange-800"
        >
          <p className="font-semibold mb-1">Swarm Summary</p>
          <p>{steps.length} agents · {steps.reduce((s, st) => s + (st.currency === 'STX' ? st.paymentAmount : 0), 0)} STX total x402 flow · Triggered on-demand</p>
        </motion.div>
      )}

      {/* Deploy */}
      <button
        onClick={handleDeploy}
        disabled={deploying || deployed || steps.length < 2 || !swarmName}
        className="w-full py-3.5 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {deployed ? (
          <><CheckCircle size={16} /> Swarm Deployed!</>
        ) : deploying ? (
          <><Loader size={16} className="animate-spin" /> Deploying Swarm...</>
        ) : (
          <><GripVertical size={16} /> Deploy Swarm</>
        )}
      </button>
    </div>
  );
}
