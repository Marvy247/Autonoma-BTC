/**
 * Real on-chain contract interactions via @stacks/connect + @stacks/transactions
 * Targets deployed testnet contracts
 */
import {
  openContractCall,
  openContractDeploy,
} from '@stacks/connect';
import {
  Cl,
  fetchCallReadOnlyFunction,
  cvToValue,
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { CONTRACTS } from './contracts';

const NETWORK = STACKS_TESTNET;

// ── Read-only calls ──────────────────────────────────────────────────────────

export async function getAgentOnChain(agentId: number) {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACTS.agentRegistry.split('.')[0],
    contractName: CONTRACTS.agentRegistry.split('.')[1],
    functionName: 'get-agent',
    functionArgs: [Cl.uint(agentId)],
    network: NETWORK,
    senderAddress: CONTRACTS.agentRegistry.split('.')[0],
  });
  return cvToValue(result);
}

export async function getAgentCount() {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACTS.agentRegistry.split('.')[0],
    contractName: CONTRACTS.agentRegistry.split('.')[1],
    functionName: 'get-agent-count',
    functionArgs: [],
    network: NETWORK,
    senderAddress: CONTRACTS.agentRegistry.split('.')[0],
  });
  return Number(cvToValue(result));
}

export async function getVaultOnChain(vaultId: number) {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACTS.agentVault.split('.')[0],
    contractName: CONTRACTS.agentVault.split('.')[1],
    functionName: 'get-vault',
    functionArgs: [Cl.uint(vaultId)],
    network: NETWORK,
    senderAddress: CONTRACTS.agentVault.split('.')[0],
  });
  return cvToValue(result);
}

// ── Write calls (open wallet popup) ─────────────────────────────────────────

export function registerAgent(
  name: string,
  description: string,
  agentType: string,
  onSuccess: (txId: string) => void,
  onCancel?: () => void
) {
  openContractCall({
    contractAddress: CONTRACTS.agentRegistry.split('.')[0],
    contractName: CONTRACTS.agentRegistry.split('.')[1],
    functionName: 'register-agent',
    functionArgs: [
      Cl.stringAscii(name.slice(0, 64)),
      Cl.stringAscii(description.slice(0, 256)),
      Cl.stringAscii(agentType.slice(0, 32)),
    ],
    network: NETWORK,
    appDetails: { name: 'Autonoma BTC', icon: window.location.origin + '/favicon.png' },
    onFinish: (data) => {
      onSuccess(data.txId);
    },
    onCancel,
  });
}

export function stakeForAgent(
  agentId: number,
  amountSTX: number,
  onSuccess: (txId: string) => void,
  onCancel?: () => void
) {
  const microSTX = BigInt(Math.floor(amountSTX * 1_000_000));
  openContractCall({
    contractAddress: CONTRACTS.slashing.split('.')[0],
    contractName: CONTRACTS.slashing.split('.')[1],
    functionName: 'stake-for-agent',
    functionArgs: [Cl.uint(agentId), Cl.uint(microSTX)],
    network: NETWORK,
    appDetails: { name: 'Autonoma BTC', icon: window.location.origin + '/favicon.png' },
    onFinish: (data) => onSuccess(data.txId),
    onCancel,
  });
}

export function sendX402Payment(
  recipient: string,
  amountSTX: number,
  memo: string,
  onSuccess: (txId: string) => void,
  onCancel?: () => void
) {
  const microSTX = BigInt(Math.floor(amountSTX * 1_000_000));
  openContractCall({
    contractAddress: CONTRACTS.paymentRouter.split('.')[0],
    contractName: CONTRACTS.paymentRouter.split('.')[1],
    functionName: 'send-payment',
    functionArgs: [
      Cl.principal(recipient),
      Cl.uint(microSTX),
      Cl.stringAscii('STX'),
      Cl.stringAscii(memo.slice(0, 128)),
      Cl.stringAscii('a2a'),
    ],
    network: NETWORK,
    appDetails: { name: 'Autonoma BTC', icon: window.location.origin + '/favicon.png' },
    onFinish: (data) => onSuccess(data.txId),
    onCancel,
  });
}

export function deployAgentContract(
  contractName: string,
  codeBody: string,
  onSuccess: (txId: string) => void,
  onCancel?: () => void
) {
  openContractDeploy({
    contractName: contractName.toLowerCase().replace(/\s+/g, '-').slice(0, 40),
    codeBody,
    network: NETWORK,
    appDetails: { name: 'Autonoma BTC', icon: window.location.origin + '/favicon.png' },
    onFinish: (data) => onSuccess(data.txId),
    onCancel,
  });
}
