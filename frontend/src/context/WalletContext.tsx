import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  network: 'testnet' | 'mainnet';
  connect: () => void;
  disconnect: () => void;
  toggleNetwork: () => void;
  getNetwork: () => typeof STACKS_TESTNET | typeof STACKS_MAINNET;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(() => {
    if (userSession.isUserSignedIn()) {
      const data = userSession.loadUserData();
      return data.profile.stxAddress.testnet;
    }
    return null;
  });
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');

  const connect = useCallback(() => {
    showConnect({
      appDetails: { name: 'Autonoma BTC', icon: '/favicon.png' },
      redirectTo: '/',
      onFinish: () => {
        const data = userSession.loadUserData();
        const addr = network === 'testnet'
          ? data.profile.stxAddress.testnet
          : data.profile.stxAddress.mainnet;
        setAddress(addr);
      },
      userSession,
    });
  }, [network]);

  const disconnect = useCallback(() => {
    userSession.signUserOut('/');
    setAddress(null);
  }, []);

  const toggleNetwork = useCallback(() => {
    setNetwork(n => n === 'testnet' ? 'mainnet' : 'testnet');
  }, []);

  const getNetwork = useCallback(() => {
    return network === 'testnet' ? STACKS_TESTNET : STACKS_MAINNET;
  }, [network]);

  return (
    <WalletContext.Provider value={{ address, isConnected: !!address, network, connect, disconnect, toggleNetwork, getNetwork }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
