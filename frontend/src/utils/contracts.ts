/**
 * Deployed contract addresses — Stacks Testnet
 * Deployer: ST3Q4NCCEW1PGYRT6EV78HX8NZH07S1DXZG2SCP88
 */
export const DEPLOYER = 'ST3Q4NCCEW1PGYRT6EV78HX8NZH07S1DXZG2SCP88';

export const CONTRACTS = {
  agentRegistry:  `${DEPLOYER}.agent-registry`,
  agentVault:     `${DEPLOYER}.agent-vault`,
  paymentRouter:  `${DEPLOYER}.payment-router`,
  slashing:       `${DEPLOYER}.slashing`,
} as const;

export const EXPLORER_BASE = 'https://explorer.stacks.co';

export function explorerTx(txId: string) {
  return `${EXPLORER_BASE}/txid/${txId}?chain=testnet`;
}

export function explorerContract(contractId: string) {
  return `${EXPLORER_BASE}/address/${contractId}?chain=testnet`;
}
