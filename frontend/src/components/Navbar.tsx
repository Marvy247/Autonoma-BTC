import { motion } from 'framer-motion';
import { Wallet, Zap, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { shortenAddress } from '../utils/format';

const navLinks = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/forge', label: 'Forge Agent' },
  { path: '/marketplace', label: 'Marketplace' },
];

export default function Navbar() {
  const location = useLocation();
  const { address, isConnected, connect, disconnect, network, toggleNetwork } = useWallet();

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-7xl">
      <div className="glass rounded-2xl px-5 py-3 border border-app-border shadow-floating flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-text-main">
            Autonoma<span className="text-orange-500"> BTC</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-text-dim hover:text-orange-500 hover:bg-orange-50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Network toggle */}
          <button
            onClick={toggleNetwork}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-app-border text-text-dim hover:border-orange-300 transition-all"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${network === 'testnet' ? 'bg-yellow-400' : 'bg-emerald-400'}`} />
            {network}
            <ChevronDown size={12} />
          </button>

          {/* Wallet */}
          {isConnected ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={disconnect}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium hover:bg-orange-100 transition-all"
            >
              <Wallet size={14} />
              {shortenAddress(address!)}
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={connect}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-all shadow-sm"
            >
              <Wallet size={14} />
              Connect Wallet
            </motion.button>
          )}
        </div>
      </div>
    </nav>
  );
}
