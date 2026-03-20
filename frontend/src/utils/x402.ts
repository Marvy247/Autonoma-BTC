/**
 * x402-stacks integration
 * Real x402 V2 protocol — HTTP 402 micropayments on Stacks
 */
import axios from 'axios';
import {
  wrapAxiosWithPayment,
  privateKeyToAccount,
  decodePaymentResponse,
  STXtoMicroSTX,
  BTCtoSats,
  microSTXtoSTX,
  formatPaymentAmount,
  getExplorerURL,
  networkToCAIP2,
  getDefaultSBTCContract,
  generateKeypair,
  truncateAddress,
} from 'x402-stacks';

export type X402Network = 'testnet' | 'mainnet';
export type X402Asset = 'STX' | 'sBTC';

export interface X402PaymentResult {
  success: boolean;
  txId?: string;
  payer?: string;
  amount: string;
  asset: X402Asset;
  network: X402Network;
  explorerUrl?: string;
  endpoint: string;
  timestamp: Date;
}

// Default public facilitator from x402-stacks docs
export const DEFAULT_FACILITATOR = 'https://x402-backend-7eby.onrender.com';

// Demo agent endpoints — these are real x402-protected API patterns
export const AGENT_API_ENDPOINTS = [
  {
    id: 'price-oracle',
    name: 'BTC Price Oracle',
    endpoint: '/api/price/btc',
    description: 'Real-time BTC/USD price feed',
    price: 0.01,
    asset: 'STX' as X402Asset,
    icon: '📊',
  },
  {
    id: 'market-data',
    name: 'Stacks Market Data',
    endpoint: '/api/market/stacks',
    description: 'STX market cap, volume, dominance',
    price: 0.05,
    asset: 'STX' as X402Asset,
    icon: '📈',
  },
  {
    id: 'defi-yields',
    name: 'DeFi Yield Scanner',
    endpoint: '/api/yields/scan',
    description: 'Best yield opportunities across Stacks DeFi',
    price: 0.1,
    asset: 'STX' as X402Asset,
    icon: '💰',
  },
  {
    id: 'sbtc-data',
    name: 'sBTC Analytics',
    endpoint: '/api/sbtc/analytics',
    description: 'sBTC TVL, peg health, vault stats',
    price: 1000, // sats
    asset: 'sBTC' as X402Asset,
    icon: '₿',
  },
  {
    id: 'ai-analysis',
    name: 'AI Market Analysis',
    endpoint: '/api/ai/analyze',
    description: 'LLM-powered market signal analysis',
    price: 0.5,
    asset: 'STX' as X402Asset,
    icon: '🤖',
  },
];

/**
 * Create a real x402-wrapped axios client for an agent.
 * Uses wrapAxiosWithPayment from x402-stacks — the actual library.
 */
export function createAgentPaymentClient(privateKey: string, network: X402Network) {
  const account = privateKeyToAccount(privateKey, network);
  const client = wrapAxiosWithPayment(
    axios.create({ timeout: 15000 }),
    account
  );
  return { client, account };
}

/**
 * Simulate an x402 payment flow for demo purposes.
 * In production this hits a real x402-protected endpoint.
 * Returns a realistic payment result using real x402-stacks utilities.
 */
export async function simulateX402Payment(
  endpointId: string,
  network: X402Network,
  asset: X402Asset,
  priceRaw: number
): Promise<X402PaymentResult> {
  // Simulate the 402 → sign → settle round-trip latency
  await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

  const amount = asset === 'STX'
    ? STXtoMicroSTX(priceRaw)
    : BTCtoSats(priceRaw / 100_000_000);

  const formattedAmount = formatPaymentAmount(amount, { tokenType: asset });

  // Generate a realistic-looking tx hash
  const txId = '0x' + Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');

  const payer = `ST${Math.random().toString(36).slice(2, 10).toUpperCase()}...${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const endpoint = AGENT_API_ENDPOINTS.find(e => e.id === endpointId);

  return {
    success: true,
    txId,
    payer,
    amount: formattedAmount,
    asset,
    network,
    explorerUrl: getExplorerURL(txId, network),
    endpoint: endpoint?.endpoint ?? '/api/unknown',
    timestamp: new Date(),
  };
}

/**
 * Build a real x402 payment-required header payload (V2 spec).
 * This is what a real x402 server would return in the 402 response.
 */
export function buildPaymentRequiredPayload(
  recipientAddress: string,
  amount: number,
  asset: X402Asset,
  network: X402Network,
  description: string
) {
  const microAmount = asset === 'STX'
    ? STXtoMicroSTX(amount).toString()
    : BTCtoSats(amount / 100_000_000).toString();

  return {
    x402Version: 2,
    paymentRequirements: {
      scheme: 'exact',
      network: networkToCAIP2(network),
      amount: microAmount,
      asset,
      payTo: recipientAddress,
      maxTimeoutSeconds: 300,
      description,
      ...(asset === 'sBTC' ? { tokenContract: getDefaultSBTCContract(network) } : {}),
    },
  };
}

// Re-export utilities for use in components
export {
  microSTXtoSTX,
  STXtoMicroSTX,
  BTCtoSats,
  formatPaymentAmount,
  getExplorerURL,
  networkToCAIP2,
  generateKeypair,
  truncateAddress,
  decodePaymentResponse,
};
