import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AmbientBackground from "../components/AmbientBackground";
import CountdownDial from "../components/CountdownDial";
import { getMsmeScore } from "../services/api";

export default function Compare({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scoreC, setScoreC] = useState(null);
  const [scoreF, setScoreF] = useState(null);

  useEffect(() => {
    let active = true;

    async function fetchScores() {
      setLoading(true);
      setError(null);
      try {
        const [dataC, dataF] = await Promise.all([
          getMsmeScore("demo-msme-c"),
          getMsmeScore("demo-msme-f")
        ]);
        if (active) {
          setScoreC(dataC);
          setScoreF(dataF);
        }
      } catch (err) {
        if (active) {
          console.error(err);
          setError("Could not retrieve score data. Please make sure the backend server is running.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchScores();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-dark flex flex-col justify-center items-center font-sans select-none">
        <svg className="animate-spin h-10 w-10 text-sky-gold mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm font-display text-sky-grey tracking-wider uppercase font-semibold">
          Comparing Ledger Behaviors...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-sky-dark flex flex-col justify-center items-center px-4 font-sans select-none text-sky-cream">
        <div className="w-full max-w-md bg-sky-card border border-sky-midnight p-8 rounded-2xl shadow-[0_8px_30px_rgba(0,104,74,0.02)] space-y-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-sky-crimson/10 flex items-center justify-center text-sky-crimson text-xl font-bold font-display">
            !
          </div>
          <h2 className="text-lg font-display uppercase tracking-widest font-extrabold text-sky-cream">
            Comparison Error
          </h2>
          <p className="text-xs text-sky-grey leading-relaxed">
            {error}
          </p>
          <button
            onClick={onBack}
            className="w-full py-3.5 bg-sky-gold hover:bg-[#00523A] text-white rounded-full font-display font-extrabold text-xs uppercase tracking-widest transition-all duration-300 shadow-md shadow-sky-gold/15"
          >
            Back to Onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent px-6 py-12 relative overflow-hidden font-sans select-none text-sky-cream w-full">
      <AmbientBackground />

      <div className="w-full max-w-6xl mx-auto relative z-10 space-y-6">
        {/* Navigation & Header */}
        <header className="flex justify-between items-center bg-sky-card border border-sky-midnight px-6 py-4 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
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
                Din <span className="text-[10px] font-display font-bold text-sky-gold uppercase tracking-widest bg-sky-sunset px-2 py-0.5 rounded ml-1 border border-sky-gold/10">Comparison Engine</span>
              </h2>
              <p className="text-[9px] font-display text-sky-grey uppercase tracking-widest mt-1">
                Risk Modeling Contrast View
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] font-display font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border bg-sky-sunset text-sky-gold border-sky-gold/20">
              Side-by-Side Model Insights
            </span>
          </div>
        </header>

        {/* Comparison Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Left Side: MSME C */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center bg-sky-card border border-sky-midnight p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] space-y-6"
          >
            <div className="w-full text-center md:text-left border-b border-sky-midnight pb-3">
              <h3 className="text-sm font-display font-extrabold text-sky-cream uppercase tracking-wider">
                Demo MSME C: Compound Risk
              </h3>
              <p className="text-[11px] font-display text-sky-grey uppercase tracking-widest mt-1">
                Business ID: <strong className="text-sky-cream">demo-msme-c</strong>
              </p>
            </div>

            <CountdownDial
              daysRemaining={scoreC?.days_remaining ?? 133}
              maxDays={180}
              probability={scoreC?.current_probability ?? 0.2057}
            />

            <div className="p-4 bg-sky-dark/40 border border-sky-midnight rounded-xl w-full text-xs font-sans text-sky-grey leading-relaxed space-y-3">
              <p>
                <strong className="text-sky-cream font-bold block mb-1">Volatile Cashflow Metaphor:</strong>
                Both MSMEs show highly volatile cashflows (a score of <strong className="text-sky-gold">0.25</strong> for C vs <strong className="text-sky-gold">0.48</strong> for F), which on simple rule-based ledger evaluations might make them look identically risky.
              </p>
              <p>
                <strong className="text-sky-crimson font-bold block mb-1">Compounding Risk (High-Risk):</strong>
                However, Demo C suffers from compounding risk factors. It has a poor GST on-time filing compliance of only <strong className="text-sky-cream font-semibold">58.3%</strong>, flat UPI growth trends, and an extremely high buyer concentration of <strong className="text-sky-cream font-semibold">80.0%</strong>. This combined risk profile makes it a genuine default threat, pushing it to <strong className="text-sky-crimson font-bold">133 days remaining</strong>.
              </p>
            </div>
          </motion.div>

          {/* Right Side: MSME F */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center bg-sky-card border border-sky-midnight p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] space-y-6"
          >
            <div className="w-full text-center md:text-left border-b border-sky-midnight pb-3">
              <h3 className="text-sm font-display font-extrabold text-sky-cream uppercase tracking-wider">
                Demo MSME F: Seasonal Business
              </h3>
              <p className="text-[11px] font-display text-sky-grey uppercase tracking-widest mt-1">
                Business ID: <strong className="text-sky-cream">demo-msme-f</strong>
              </p>
            </div>

            <CountdownDial
              daysRemaining={scoreF?.days_remaining ?? 32}
              maxDays={180}
              probability={scoreF?.current_probability ?? 0.6300}
            />

            <div className="p-4 bg-sky-dark/40 border border-sky-midnight rounded-xl w-full text-xs font-sans text-sky-grey leading-relaxed space-y-3">
              <p>
                <strong className="text-sky-cream font-bold block mb-1">Volatile Cashflow Metaphor:</strong>
                Both MSMEs show highly volatile cashflows (a score of <strong className="text-sky-gold">0.25</strong> for C vs <strong className="text-sky-gold">0.48</strong> for F), which on simple rule-based ledger evaluations might make them look identically risky.
              </p>
              <p>
                <strong className="text-sky-gold font-bold block mb-1">Seasonal Volatility (Low-Risk):</strong>
                Demo F exhibits high cashflow volatility (<strong className="text-sky-cream font-semibold">0.48</strong>), but the underlying metrics are solid: UPI trend is growing at <strong className="text-sky-cream font-semibold">3.5%</strong> MoM, buyer concentration is healthy at only <strong className="text-sky-cream font-semibold">25.0%</strong>, and EPFO payroll consistency is solid. The model recognizes the volatility is merely seasonal business activity, rating it a safe bet with only <strong className="text-sky-gold font-bold">32 days remaining</strong>.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
