import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from 'react-hot-toast';
import { WalletProvider } from './context/WalletContext';
import { AgentProvider } from './context/AgentContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Forge from './pages/Forge';
import Marketplace from './pages/Marketplace';
import AgentDetail from './pages/AgentDetail';

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="pt-28 pb-20 px-6 min-h-screen"
    >
      <div className="max-w-7xl mx-auto">{children}</div>
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/forge" element={<PageWrapper><Forge /></PageWrapper>} />
        <Route path="/marketplace" element={<PageWrapper><Marketplace /></PageWrapper>} />
        <Route path="/agent/:id" element={<PageWrapper><AgentDetail /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <WalletProvider>
      <AgentProvider>
        <BrowserRouter>
          <Analytics />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: '12px', fontFamily: 'Outfit, sans-serif', fontSize: '14px' },
            }}
          />
          <div className="min-h-screen bg-app-bg grid-subtle selection:bg-orange-500/10 selection:text-orange-600">
            <Navbar />
            <main className="relative">
              <AnimatedRoutes />
            </main>
            <footer className="border-t border-app-border py-10 px-6 bg-white">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">⚡</span>
                  </div>
                  <span className="font-display font-bold text-lg text-text-main">
                    Agent<span className="text-orange-500">Forge</span>
                  </span>
                </div>
                <p className="text-xs text-text-pale text-center">
                  Built on Bitcoin · Powered by Stacks · Secured by Clarity
                </p>
                <p className="text-xs text-text-pale">© 2026 AgentForge</p>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </AgentProvider>
    </WalletProvider>
  );
}

export default App;
