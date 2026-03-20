export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatSTX(microSTX: number): string {
  return (microSTX / 1_000_000).toFixed(4);
}

export function formatsBTC(sats: number): string {
  return (sats / 100_000_000).toFixed(6);
}

export function formatUSDCx(micro: number): string {
  return (micro / 1_000_000).toFixed(2);
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export const AGENT_TYPE_LABELS: Record<string, string> = {
  'yield-optimizer': '📈 Yield Optimizer',
  'data-researcher': '🔍 Data Researcher',
  'trader': '⚡ Trader Swarm',
  'custom': '🛠 Custom',
};

export const AGENT_TYPE_COLORS: Record<string, string> = {
  'yield-optimizer': 'text-emerald-600 bg-emerald-50 border-emerald-200',
  'data-researcher': 'text-blue-600 bg-blue-50 border-blue-200',
  'trader': 'text-orange-600 bg-orange-50 border-orange-200',
  'custom': 'text-purple-600 bg-purple-50 border-purple-200',
};

export const STATUS_COLORS: Record<string, string> = {
  active: 'text-emerald-600 bg-emerald-50',
  paused: 'text-yellow-600 bg-yellow-50',
  deploying: 'text-blue-600 bg-blue-50',
  slashed: 'text-red-600 bg-red-50',
};
