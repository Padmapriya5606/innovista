import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Pages
import SplashScreen from './pages/SplashScreen';
import RoleSelection from './pages/RoleSelection';
import Register from './pages/Register';
import MatchResults from './pages/MatchResults';
import Dashboard from './pages/Dashboard';
import EcosystemGraph from './pages/EcosystemGraph';

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-page text-white overflow-hidden relative selection:bg-accent-600/30">

      {/* Global abstract noise and gradient layer */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      <div className="relative z-10 w-full h-full">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/select-role" element={<RoleSelection />} />
            <Route path="/register/:role" element={<Register />} />
            <Route path="/match-results" element={<MatchResults />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ecosystem" element={<EcosystemGraph />} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
