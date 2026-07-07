import React, { useState } from "react";
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
          <div className="fixed bottom-4 right-4 flex gap-2 z-50">
            <button
              onClick={() => setShowPortfolio(true)}
              className="bg-sky-card border border-sky-midnight hover:border-sky-gold text-sky-grey hover:text-sky-cream px-3 py-1.5 rounded-full text-xs font-display font-semibold uppercase tracking-wider transition-all duration-300 shadow-[0_8px_30px_rgba(0,104,74,0.02)]"
            >
              RM Portfolio
            </button>
            <button
              onClick={() => setShowCompare(true)}
              className="bg-sky-card border border-sky-midnight hover:border-sky-gold text-sky-grey hover:text-sky-cream px-3 py-1.5 rounded-full text-xs font-display font-semibold uppercase tracking-wider transition-all duration-300 shadow-[0_8px_30px_rgba(0,104,74,0.02)]"
            >
              Compare Models
            </button>
            <button
              onClick={() => setShowStyleGuide(true)}
              className="bg-sky-card border border-sky-midnight hover:border-sky-gold text-sky-grey hover:text-sky-cream px-3 py-1.5 rounded-full text-xs font-display font-semibold uppercase tracking-wider transition-all duration-300 shadow-[0_8px_30px_rgba(0,104,74,0.02)]"
            >
              Design System
            </button>
          </div>
        </>
      )}
    </div>
  );
}