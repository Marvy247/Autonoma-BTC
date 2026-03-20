import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronRight, ChevronLeft, Loader, CheckCircle, Code, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAgents } from '../context/AgentContext';
import type { Agent, AgentType } from '../context/AgentContext';
import { useWallet } from '../context/WalletContext';
import toast from 'react-hot-toast';

const AGENT_TEMPLATES = [
  {
    type: 'yield-optimizer' as AgentType,
    icon: '📈',
    title: 'Yield Optimizer',
    desc: 'Auto-farms sBTC yield across Bitflow LP and lending protocols',
    prompt: 'Create an agent that monitors sBTC yield rates across Bitflow and lending protocols, automatically moves funds to the highest-yielding pool, and reports earnings daily.',
  },
  {
    type: 'data-researcher' as AgentType,
    icon: '🔍',
    title: 'Data Researcher',
    desc: 'Pays x402 micropayments for web data, feeds insights to swarm',
    prompt: 'Create an agent that pays for web scraping APIs via x402 micropayments, aggregates market data, and sells insights to other agents in the swarm.',
  },
  {
    type: 'trader' as AgentType,
    icon: '⚡',
    title: 'Trader Swarm',
    desc: 'Orchestrates multi-agent research → analysis → execution pipeline',
    prompt: 'Create a swarm of agents that collaborates: one researches market data, one analyzes signals, and one executes trades — all paying each other via x402.',
  },
  {
    type: 'custom' as AgentType,
    icon: '🛠',
    title: 'Custom Agent',
    desc: 'Describe your own agent in natural language',
    prompt: '',
  },
];

const GENERATED_CLARITY = `(define-constant AGENT-OWNER tx-sender)
(define-constant YIELD-TARGET u500) ;; 5% APY target

(define-data-var current-strategy (string-ascii 32) "bitflow-lp")
(define-data-var total-yield uint u0)

;; Auto-rebalance yield strategy
(define-public (rebalance (new-strategy (string-ascii 32)))
  (begin
    (asserts! (is-eq tx-sender AGENT-OWNER) (err u100))
    (var-set current-strategy new-strategy)
    (ok true)
  )
)

;; Claim yield and record earnings
(define-public (claim-yield (amount uint))
  (begin
    (var-set total-yield (+ (var-get total-yield) amount))
    (ok (var-get total-yield))
  )
)

(define-read-only (get-strategy) (var-get current-strategy))
(define-read-only (get-total-yield) (var-get total-yield))`;

const STEPS = ['Choose Template', 'Configure', 'Review & Deploy'];

export default function Forge() {
  const [step, setStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [prompt, setPrompt] = useState('');
  const [agentName, setAgentName] = useState('');
  const [yieldStrategy, setYieldStrategy] = useState('bitflow-lp');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const { addAgent } = useAgents();
  const { isConnected, connect } = useWallet();
  const navigate = useNavigate();

  const handleTemplateSelect = (i: number) => {
    setSelectedTemplate(i);
    setPrompt(AGENT_TEMPLATES[i].prompt);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 2000)); // Simulate LLM call
    setIsGenerating(false);
    setStep(2);
  };

  const handleDeploy = async () => {
    if (!isConnected) { connect(); return; }
    setIsDeploying(true);
    await new Promise(r => setTimeout(r, 2500)); // Simulate contract deployment

    const template = AGENT_TEMPLATES[selectedTemplate ?? 3];
    const newAgent: Agent = {
      id: Date.now().toString(),
      name: agentName || `${template.title} #${Math.floor(Math.random() * 999)}`,
      description: prompt.slice(0, 120),
      type: template.type,
      status: 'active',
      sBtcBalance: 0,
      usdcxBalance: 0,
      stxBalance: 0,
      totalEarnings: 0,
      reputationScore: 500,
      tasksCompleted: 0,
      lastActive: new Date(),
      txHistory: [],
    };

    addAgent(newAgent);
    setIsDeploying(false);
    toast.success('Agent deployed to Stacks testnet! 🚀');
    navigate('/dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-3xl text-text-main mb-2">Forge an Agent</h1>
        <p className="text-text-dim">Natural language → secure Clarity contract → deployed on Bitcoin</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              i === step ? 'bg-orange-500 text-white' :
              i < step ? 'bg-emerald-100 text-emerald-700' :
              'bg-app-hover text-text-pale'
            }`}>
              {i < step ? <CheckCircle size={14} /> : <span>{i + 1}</span>}
              {s}
            </div>
            {i < STEPS.length - 1 && <ChevronRight size={14} className="text-text-pale" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: Choose Template */}
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {AGENT_TEMPLATES.map((t, i) => (
                <button
                  key={i}
                  onClick={() => handleTemplateSelect(i)}
                  className={`text-left p-5 rounded-2xl border-2 transition-all ${
                    selectedTemplate === i
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-app-border bg-white hover:border-orange-200'
                  }`}
                >
                  <span className="text-3xl mb-3 block">{t.icon}</span>
                  <h3 className="font-display font-bold text-base text-text-main mb-1">{t.title}</h3>
                  <p className="text-sm text-text-dim">{t.desc}</p>
                </button>
              ))}
            </div>
            <button
              disabled={selectedTemplate === null}
              onClick={() => setStep(1)}
              className="w-full py-3.5 bg-orange-500 text-white rounded-2xl font-bold disabled:opacity-40 hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
            >
              Continue <ChevronRight size={18} />
            </button>
          </motion.div>
        )}

        {/* Step 1: Configure */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-text-main mb-2">Agent Name</label>
              <input
                className="input-premium"
                placeholder="e.g. Yield Hawk, Data Scout..."
                value={agentName}
                onChange={e => setAgentName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-main mb-2">
                Describe your agent <span className="text-orange-500">(natural language)</span>
              </label>
              <textarea
                className="input-premium min-h-[140px] resize-none"
                placeholder="Describe what your agent should do, what assets it manages, how it earns, and what it pays for..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-main mb-2">Yield Strategy</label>
              <select
                className="input-premium"
                value={yieldStrategy}
                onChange={e => setYieldStrategy(e.target.value)}
              >
                <option value="bitflow-lp">Bitflow LP (highest yield)</option>
                <option value="lending">Lending Protocol</option>
                <option value="hold">Hold (no yield, max safety)</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex items-center gap-1 px-5 py-3 rounded-xl border border-app-border text-text-dim hover:bg-app-hover transition-all text-sm font-medium">
                <ChevronLeft size={16} /> Back
              </button>
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="flex-1 py-3 bg-orange-500 text-white rounded-2xl font-bold disabled:opacity-40 hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <><Loader size={16} className="animate-spin" /> Generating Clarity Contract...</>
                ) : (
                  <><Cpu size={16} /> Generate Agent</>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Review & Deploy */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-800">Clarity contract generated successfully</p>
                <p className="text-xs text-emerald-600">Security checks passed · Post-conditions applied · Ready to deploy</p>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white border border-app-border rounded-2xl p-5 space-y-3">
              <h3 className="font-display font-bold text-base text-text-main">Agent Summary</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-text-pale">Name:</span> <span className="font-medium">{agentName || 'Auto-named'}</span></div>
                <div><span className="text-text-pale">Type:</span> <span className="font-medium">{AGENT_TEMPLATES[selectedTemplate ?? 3].title}</span></div>
                <div><span className="text-text-pale">Yield:</span> <span className="font-medium">{yieldStrategy}</span></div>
                <div><span className="text-text-pale">Network:</span> <span className="font-medium text-yellow-600">Testnet</span></div>
              </div>
            </div>

            {/* Code preview */}
            <div className="bg-white border border-app-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowCode(!showCode)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-text-main hover:bg-app-hover transition-colors"
              >
                <span className="flex items-center gap-2"><Code size={15} /> View Generated Clarity Contract</span>
                <ChevronRight size={15} className={`transition-transform ${showCode ? 'rotate-90' : ''}`} />
              </button>
              {showCode && (
                <pre className="bg-gray-950 text-emerald-400 text-xs p-5 overflow-x-auto leading-relaxed font-mono">
                  {GENERATED_CLARITY}
                </pre>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 px-5 py-3 rounded-xl border border-app-border text-text-dim hover:bg-app-hover transition-all text-sm font-medium">
                <ChevronLeft size={16} /> Back
              </button>
              <button
                onClick={handleDeploy}
                disabled={isDeploying}
                className="flex-1 py-3 bg-orange-500 text-white rounded-2xl font-bold disabled:opacity-40 hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
              >
                {isDeploying ? (
                  <><Loader size={16} className="animate-spin" /> Deploying to Stacks...</>
                ) : (
                  <><Zap size={16} /> Deploy Agent</>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
