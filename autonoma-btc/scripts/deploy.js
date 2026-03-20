#!/usr/bin/env node
/**
 * Autonoma BTC — Contract Deployment Script
 * Deploys all 4 Clarity contracts to Stacks testnet in dependency order.
 *
 * Usage:
 *   MNEMONIC="your 24-word mnemonic" node scripts/deploy.js
 *   or set mnemonic in settings/Testnet.toml and run:
 *   clarinet deployments apply --testnet
 */

import {
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
} from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const NETWORK = new StacksTestnet();
const MNEMONIC = process.env.MNEMONIC;

if (!MNEMONIC) {
  console.error('❌  Set MNEMONIC env var to your testnet wallet mnemonic');
  process.exit(1);
}

// Derive private key from mnemonic
import { generateWallet, getStxAddress } from '@stacks/wallet-sdk';

const wallet = await generateWallet({ secretKey: MNEMONIC, password: '' });
const account = wallet.accounts[0];
const senderKey = account.stxPrivateKey;
const deployerAddress = getStxAddress({ account, transactionVersion: 0x80 }); // testnet

console.log(`\n🚀 Deploying from: ${deployerAddress}\n`);

const CONTRACTS = [
  { name: 'agent-registry',  file: 'contracts/agent-registry.clar' },
  { name: 'agent-vault',     file: 'contracts/agent-vault.clar' },
  { name: 'payment-router',  file: 'contracts/payment-router.clar' },
  { name: 'slashing',        file: 'contracts/slashing.clar' },
];

let nonce = 0; // clarinet deployments apply handles nonce automatically

for (const contract of CONTRACTS) {
  const codeBody = readFileSync(resolve(ROOT, contract.file), 'utf8');

  console.log(`📄 Deploying ${contract.name}...`);

  const tx = await makeContractDeploy({
    contractName: contract.name,
    codeBody,
    senderKey,
    network: NETWORK,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 10000n,
  });

  const result = await broadcastTransaction({ transaction: tx, network: NETWORK });

  if ('error' in result) {
    console.error(`❌  ${contract.name} failed:`, result.error, result.reason);
    process.exit(1);
  }

  console.log(`✅  ${contract.name} → txid: ${result.txid}`);
  console.log(`    Explorer: https://explorer.stacks.co/txid/${result.txid}?chain=testnet\n`);

  // Wait between deploys to avoid nonce collisions
  await new Promise(r => setTimeout(r, 3000));
}

console.log('🎉 All contracts deployed to Stacks testnet!');
