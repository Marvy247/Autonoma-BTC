import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { connect, disconnect } from '@stacks/connect';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  network: 'testnet' | 'mainnet';
  connect: () => void;
  disconnect: () => void;
  toggleNetwork: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');

  const handleConnect = useCallback(async () => {
    try {
      // connect() opens the wallet selector modal (Leather, Xverse, etc.)
      // Returns { addresses: AddressEntry[] } where each entry has symbol + address
      const result = await connect();
      const stxEntry = result.addresses.find(
        a => a.symbol === 'STX' || a.address.startsWith('S')
      );
      if (stxEntry) setAddress(stxEntry.address);
    } catch (e) {
      console.error('[wallet] connect cancelled or failed', e);
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setAddress(null);
  }, []);

  const toggleNetwork = useCallback(() => {
    setNetwork(n => (n === 'testnet' ? 'mainnet' : 'testnet'));
  }, []);

  return (
    <WalletContext.Provider value={{
      address,
      isConnected: !!address,
      network,
      connect: handleConnect,
      disconnect: handleDisconnect,
      toggleNetwork,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
