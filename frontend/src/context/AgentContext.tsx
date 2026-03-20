import { createContext, useContext, useState, type ReactNode } from 'react';

export type AgentType = 'yield-optimizer' | 'data-researcher' | 'trader' | 'custom';
export type AgentStatus = 'active' | 'paused' | 'deploying' | 'slashed';

export interface Agent {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  status: AgentStatus;
  sBtcBalance: number;
  usdcxBalance: number;
  stxBalance: number;
  totalEarnings: number;
  reputationScore: number;
  tasksCompleted: number;
  lastActive: Date;
  txHistory: TxEntry[];
}

export interface TxEntry {
  id: string;
  type: 'earn' | 'pay' | 'yield' | 'deploy';
  amount: number;
  currency: 'STX' | 'sBTC' | 'USDCx';
  memo: string;
  timestamp: Date;
}

const DEMO_AGENTS: Agent[] = [
  {
    id: '1',
    name: 'Yield Hawk',
    description: 'Auto-optimizes sBTC yield across Bitflow and lending protocols',
    type: 'yield-optimizer',
    status: 'active',
    sBtcBalance: 0.0042,
    usdcxBalance: 120.5,
    stxBalance: 850,
    totalEarnings: 1240,
    reputationScore: 920,
    tasksCompleted: 347,
    lastActive: new Date(),
    txHistory: [
      { id: 'tx1', type: 'yield', amount: 0.00012, currency: 'sBTC', memo: 'Bitflow LP yield', timestamp: new Date(Date.now() - 60000) },
      { id: 'tx2', type: 'pay', amount: 0.5, currency: 'STX', memo: 'x402: price oracle API', timestamp: new Date(Date.now() - 180000) },
    ],
  },
  {
    id: '2',
    name: 'Data Scout',
    description: 'Pays x402 micropayments for web data, feeds insights to swarm',
    type: 'data-researcher',
    status: 'active',
    sBtcBalance: 0.0011,
    usdcxBalance: 45.0,
    stxBalance: 320,
    totalEarnings: 560,
    reputationScore: 780,
    tasksCompleted: 128,
    lastActive: new Date(Date.now() - 300000),
    txHistory: [
      { id: 'tx3', type: 'pay', amount: 1.2, currency: 'STX', memo: 'x402: web scrape API', timestamp: new Date(Date.now() - 300000) },
      { id: 'tx4', type: 'earn', amount: 5.0, currency: 'USDCx', memo: 'Research task reward', timestamp: new Date(Date.now() - 600000) },
    ],
  },
  {
    id: '3',
    name: 'Swarm Alpha',
    description: 'Orchestrates trader swarm — research → analysis → execution',
    type: 'trader',
    status: 'paused',
    sBtcBalance: 0.0089,
    usdcxBalance: 310.0,
    stxBalance: 1200,
    totalEarnings: 3100,
    reputationScore: 855,
    tasksCompleted: 512,
    lastActive: new Date(Date.now() - 3600000),
    txHistory: [],
  },
];

interface AgentContextType {
  agents: Agent[];
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
}

const AgentContext = createContext<AgentContextType | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>(DEMO_AGENTS);

  const addAgent = (agent: Agent) => setAgents(prev => [agent, ...prev]);

  const updateAgent = (id: string, updates: Partial<Agent>) =>
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));

  return (
    <AgentContext.Provider value={{ agents, addAgent, updateAgent }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgents() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error('useAgents must be used within AgentProvider');
  return ctx;
}
