import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getMsmeScore } from "../services/api";
import AmbientBackground from "../components/AmbientBackground";

const DEMO_MSMES = [
  { id: "demo-msme-a", name: "Retail Dynamics (A)", desc: "Mid-Journey Recovery" },
  { id: "demo-msme-b", name: "Surya Agro Traders (B)", desc: "Perfect Credit Hygiene" },
  { id: "demo-msme-c", name: "Vedic Garments (C)", desc: "Compounding Risk Profile" },
  { id: "demo-msme-d", name: "Hind Plastics (D)", desc: "No Employee Baseline" },
  { id: "demo-msme-e", name: "Apex Enterprises (E)", desc: "One Clear Blocker" },
  { id: "demo-msme-f", name: "Mehra Seasonal Goods (F)", desc: "Seasonal Cashflow Volatility" }
];

export default function Portfolio({ onBack }) {
  const [portfolioData, setPortfolioData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadPortfolio() {
      try {
        const promises = DEMO_MSMES.map(async (msme) => {
          const score = await getMsmeScore(msme.id);
          return {
            ...msme,
            daysRemaining: score.days_remaining,
            probability: score.current_probability,
            shapBreakdown: score.shap_breakdown,
            disciplineLevel: score.msme_data.discipline_level
          };
        });
        
        const results = await Promise.all(promises);
        
        // Sort urgency: lowest days_remaining first (Ready = 0 days is placed at the very top)
        results.sort((a, b) => a.daysRemaining - b.daysRemaining);
        
        if (active) {
          setPortfolioData(results);
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setError("Failed to retrieve live scores for some portfolio accounts. Ensure the backend server is running.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPortfolio();
    return () => { active = false; };
  }, []);

  const getTopConstraint = (shapBreakdown) => {
    if (!shapBreakdown || shapBreakdown.length === 0) return "Optimal Ledgers";
    // Find the most negative SHAP driver
    const negativeDrivers = [...shapBreakdown].filter(x => x.shap_value < 0);
    if (negativeDrivers.length === 0) return "Optimal Ledgers";
    negativeDrivers.sort((a, b) => a.shap_value - b.shap_value); // most negative first
    return negativeDrivers[0].label;
  };

  const getUrgencyStyle = (days) => {
    if (days === 0) return { bg: "bg-sky-sunset/15 text-sky-gold border-sky-gold/30", label: "Ready" };
    if (days <= 15) return { bg: "bg-[#D64545]/15 text-[#D64545] border-[#D64545]/30", label: `${days} Days` };
    if (days <= 47) return { bg: "bg-amber-500/15 text-amber-400 border-amber-500/30", label: `${days} Days` };
    return { bg: "bg-sky-grey/15 text-sky-grey border-sky-midnight", label: `${days} Days` };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-dark flex flex-col justify-center items-center font-sans">
        <svg className="animate-spin h-10 w-10 text-sky-gold mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-xs font-display text-sky-grey uppercase tracking-widest font-extrabold">Loading RM Portfolio view...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-sky-dark flex flex-col justify-center items-center px-4 font-sans text-sky-cream">
        <div className="w-full max-w-md bg-sky-card border border-sky-midnight p-8 rounded-2xl text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-sky-crimson/10 flex items-center justify-center text-sky-crimson text-xl font-bold">!</div>
          <h2 className="text-md font-display uppercase tracking-widest font-extrabold">Portfolio Load Failed</h2>
          <p className="text-xs text-sky-grey leading-relaxed">{error}</p>
          <button onClick={onBack} className="w-full py-3 bg-sky-gold hover:bg-[#00523A] text-white rounded-xl font-display font-extrabold text-xs uppercase tracking-widest transition-colors duration-300">
            Back to Onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-dark px-6 py-12 relative overflow-hidden font-sans text-sky-cream w-full">
      <AmbientBackground daysRemaining={45} />
      
      <div className="w-full max-w-5xl mx-auto relative z-10 space-y-6">
        
        {/* Header section */}
        <header className="flex justify-between items-center bg-sky-card border border-sky-midnight px-6 py-4 rounded-xl shadow-md">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="text-sky-grey hover:text-sky-cream transition-colors duration-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
            <div>
              <h2 className="text-sm font-display uppercase tracking-widest font-extrabold text-sky-cream leading-tight">
                Relationship Manager <span className="text-[10px] font-display font-bold text-sky-gold uppercase tracking-widest bg-sky-sunset px-2 py-0.5 rounded ml-1 border border-sky-gold/10">Portfolio</span>
              </h2>
              <p className="text-[9px] font-display text-sky-grey uppercase tracking-widest mt-1">
                Lending Pipeline Overview (6 active demo profiles)
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-display font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border bg-sky-dark text-sky-grey border-sky-midnight">
              6 Accounts Registered
            </span>
          </div>
        </header>

        {/* Dense tabular portfolio card */}
        <div className="bg-sky-card border border-sky-midnight rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sky-midnight bg-sky-dark/45 text-[9px] font-display text-sky-grey uppercase tracking-widest font-extrabold">
                  <th className="px-6 py-4">MSME Account Name</th>
                  <th className="px-6 py-4">Account ID</th>
                  <th className="px-6 py-4">Discipline</th>
                  <th className="px-6 py-4">Credit Readiness</th>
                  <th className="px-6 py-4">Readiness Countdown</th>
                  <th className="px-6 py-4">Primary Constraints / SHAP Tag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-midnight text-xs font-sans">
                {portfolioData.map((msme) => {
                  const urg = getUrgencyStyle(msme.daysRemaining);
                  const topConstraint = getTopConstraint(msme.shapBreakdown);
                  
                  return (
                    <tr key={msme.id} className="hover:bg-sky-dark/30 transition-colors duration-150">
                      <td className="px-6 py-4 font-semibold text-sky-cream">
                        {msme.name}
                        <span className="block text-[9px] font-normal text-sky-grey mt-0.5">
                          {msme.desc}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] text-sky-grey">
                        {msme.id}
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] text-sky-grey uppercase tracking-wider">
                        {msme.disciplineLevel}
                      </td>
                      <td className="px-6 py-4 font-bold text-sky-cream">
                        {(msme.probability * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-display font-bold border uppercase tracking-wider ${urg.bg}`}>
                          {urg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-sky-dark/80 border border-sky-midnight rounded text-[10px] text-sky-grey font-medium inline-block">
                          {topConstraint}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
