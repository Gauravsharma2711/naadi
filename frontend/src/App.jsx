import React, { useState } from "react";
import { motion } from "framer-motion";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import StyleGuide from "./pages/StyleGuide";
import Compare from "./pages/Compare";
import Portfolio from "./pages/Portfolio";

export default function App() {
  const [msmeId, setMsmeId] = useState(() => {
    return sessionStorage.getItem("msmeId") || null;
  });
  const [showStyleGuide, setShowStyleGuide] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);

  const handleSelectMsme = (id) => {
    setMsmeId(id);
    sessionStorage.setItem("msmeId", id);
  };

  const handleBack = () => {
    setMsmeId(null);
    sessionStorage.removeItem("msmeId");
  };

  return (
    <div className="min-h-screen bg-sky-dark text-sky-cream antialiased font-sans select-none">
      {showStyleGuide ? (
        <StyleGuide onBack={() => setShowStyleGuide(false)} />
      ) : showCompare ? (
        <Compare onBack={() => setShowCompare(false)} />
      ) : showPortfolio ? (
        <Portfolio onBack={() => setShowPortfolio(false)} />
      ) : msmeId ? (
        <Dashboard
          msmeId={msmeId}
          onBack={handleBack}
        />
      ) : (
        <>
          <Onboarding onSelectMsme={handleSelectMsme} />
          {/* Floating Utility Triggers */}
          {/* Floating Utility Triggers */}
          <div className="fixed bottom-4 right-4 flex flex-col sm:flex-row gap-2 z-50 items-end">
            <motion.button
              onClick={() => setShowPortfolio(true)}
              whileHover={{ scale: 1.05, y: -2, boxShadow: "0 8px 20px rgba(0,214,107,0.12)", borderColor: "#00D66B" }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-sky-card border border-sky-midnight text-sky-grey hover:text-sky-cream px-4 py-2 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.04)] flex items-center gap-1.5 select-none"
            >
              <svg className="w-3.5 h-3.5 text-sky-gold/75" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              RM Portfolio
            </motion.button>
            <motion.button
              onClick={() => setShowCompare(true)}
              whileHover={{ scale: 1.05, y: -2, boxShadow: "0 8px 20px rgba(0,214,107,0.12)", borderColor: "#00D66B" }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-sky-card border border-sky-midnight text-sky-grey hover:text-sky-cream px-4 py-2 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.04)] flex items-center gap-1.5 select-none"
            >
              <svg className="w-3.5 h-3.5 text-sky-gold/75" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Compare Models
            </motion.button>
            <motion.button
              onClick={() => setShowStyleGuide(true)}
              whileHover={{ scale: 1.05, y: -2, boxShadow: "0 8px 20px rgba(0,214,107,0.12)", borderColor: "#00D66B" }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-sky-card border border-sky-midnight text-sky-grey hover:text-sky-cream px-4 py-2 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.04)] flex items-center gap-1.5 select-none"
            >
              <svg className="w-3.5 h-3.5 text-sky-gold/75" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              Design System
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
}