import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountdownDial from "../components/CountdownDial";
import ActionCard from "../components/ActionCard";
import ScoreBreakdown from "../components/ScoreBreakdown";
import { getMsmeScore, completeAction } from "../services/api";

export default function Dashboard({ msmeId, onBack }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [msmeData, setMsmeData] = useState(null);
  const [completedActions, setCompletedActions] = useState(new Set());

  // Load score data from the real backend on page load
  useEffect(() => {
    let active = true;

    async function fetchScore() {
      setLoading(true);
      setError(null);
      try {
        const data = await getMsmeScore(msmeId);
        if (active) {
          setScoreData(data);
          setMsmeData(data.msme_data);
        }
      } catch (err) {
        if (active) {
          console.error(err);
          setError(`Could not retrieve credit-readiness score for ID ${msmeId}. Check that the backend is running.`);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (msmeId) {
      fetchScore();
    }

    return () => {
      active = false;
    };
  }, [msmeId]);

  // Handle action complete submissions — call real backend, update state with real returned data
  const handleActionComplete = async (actionId) => {
    if (completedActions.has(actionId)) return;

    // Optimistically add to local completion set for immediate card completion status
    setCompletedActions((prev) => {
      const next = new Set(prev);
      next.add(actionId);
      return next;
    });

    try {
      // POST completion to the real backend
      const updatedData = await completeAction(msmeId, actionId);
      
      // Update local state with real returned daysRemaining and score parameters
      setScoreData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          days_remaining: updatedData.days_remaining,
          current_probability: updatedData.current_probability,
          top_3_actions: updatedData.top_3_actions,
        };
      });
      
      if (updatedData.msme_data) {
        setMsmeData(updatedData.msme_data);
      }

      // Re-fetch full score data in the background to refresh the complete SHAP explanation breakdown
      try {
        const fullRefresh = await getMsmeScore(msmeId);
        setScoreData(fullRefresh);
        setMsmeData(fullRefresh.msme_data);
      } catch (refreshErr) {
        console.warn("Background SHAP refresh failed, using partial update from action complete response:", refreshErr);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit action. Please try again.");
      // Rollback optimistic completed state
      setCompletedActions((prev) => {
        const next = new Set(prev);
        next.delete(actionId);
        return next;
      });
    }
  };

  // Rendering Loading State (consistent with DESIGN_SYSTEM.md)
  if (loading) {
    return (
      <div className="min-h-screen bg-sky-dark flex flex-col justify-center items-center font-sans select-none">
        <svg className="animate-spin h-10 w-10 text-sky-gold mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm font-display text-sky-grey tracking-wider uppercase font-semibold">
          Analyzing Credit Ledger...
        </p>
      </div>
    );
  }

  // Rendering Error State (consistent with DESIGN_SYSTEM.md)
  if (error) {
    return (
      <div className="min-h-screen bg-sky-dark flex flex-col justify-center items-center px-4 font-sans select-none text-sky-cream">
        <div className="w-full max-w-md bg-sky-card border border-sky-midnight p-8 rounded-2xl shadow-[0_8px_30px_rgba(0,104,74,0.02)] space-y-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-sky-crimson/10 flex items-center justify-center text-sky-crimson text-xl font-bold font-display">
            !
          </div>
          <h2 className="text-lg font-display uppercase tracking-widest font-extrabold text-sky-cream">
            Failed to Load Score
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

  // Extract variables safely
  const daysRemaining = scoreData?.days_remaining ?? 0;
  const probability = scoreData?.current_probability ?? 0;
  const actions = scoreData?.top_3_actions ?? [];
  const shapBreakdown = scoreData?.shap_breakdown ?? [];
  const maxDays = 180; // Maximum possible count from calibration heuristic

  return (
    <div className="min-h-screen bg-sky-dark px-4 py-8 relative overflow-hidden font-sans select-none text-sky-cream">
      
      {/* Decorative organic green halos */}
      <div className="absolute w-[450px] h-[450px] rounded-full bg-sky-gold/5 blur-[120px] top-10 right-10 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-sky-sunset/20 blur-[120px] -bottom-20 left-10 pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#E2E8E5_1px,transparent_1px),linear-gradient(to_bottom,#E2E8E5_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-25 pointer-events-none" />

      <div className="w-full max-w-2xl mx-auto relative z-10 space-y-6">
        
        {/* Navigation & Header */}
        <header className="flex justify-between items-center bg-sky-card border border-sky-midnight px-6 py-4 rounded-xl shadow-[0_8px_30px_rgba(0,104,74,0.02)]">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-sky-grey hover:text-sky-cream transition-colors duration-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 className="text-sm font-display uppercase tracking-widest font-extrabold text-sky-cream leading-tight">
                Din <span className="text-[10px] font-display font-bold text-sky-gold uppercase tracking-widest bg-sky-sunset px-2 py-0.5 rounded ml-1 border border-sky-gold/10">Dashboard</span>
              </h2>
              <p className="text-[9px] font-display text-sky-grey uppercase tracking-widest mt-1">
                Business ID: <strong className="text-sky-cream">{msmeId}</strong>
              </p>
            </div>
          </div>
          
          <div className="text-right flex items-center gap-2">
            <span className="text-[10px] font-display text-sky-grey font-semibold uppercase tracking-widest hidden sm:inline">
              Integration: 
            </span>
            <span className="text-[9px] font-display font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border bg-sky-sunset text-sky-gold border-sky-gold/20">
              Live
            </span>
          </div>
        </header>

        {/* Hero Section: Countdown Dial Centered */}
        <main className="w-full flex justify-center">
          <div className="w-full max-w-md">
            <CountdownDial 
              daysRemaining={daysRemaining} 
              maxDays={maxDays} 
              probability={probability} 
            />
          </div>
        </main>

        {/* Action Board Section */}
        <section className="bg-sky-card border border-sky-midnight p-6 rounded-xl shadow-[0_8px_30px_rgba(0,104,74,0.02)] space-y-6">
          <div className="border-b border-sky-midnight pb-4 flex justify-between items-baseline">
            <h3 className="text-sm font-display uppercase tracking-widest font-extrabold text-sky-cream">
              Action Board
            </h3>
            <span className="text-[9px] font-display text-sky-grey font-bold uppercase tracking-widest">
              {actions.length} action{actions.length !== 1 ? "s" : ""} remaining
            </span>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {daysRemaining <= 0 ? (
                /* Credit-Ready State Banner */
                <motion.div
                  key="ready-banner"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 bg-sky-sunset/60 border border-sky-gold/20 rounded-xl text-center space-y-3 relative overflow-hidden"
                >
                  <div className="absolute w-[200px] h-[200px] rounded-full bg-sky-gold/5 blur-[50px] -bottom-10 left-1/2 -translate-x-1/2 pointer-events-none" />
                  
                  <span className="text-3xl">🌱</span>
                  <h4 className="text-sm font-display uppercase tracking-widest font-extrabold text-sky-gold">
                    Your Business is Credit-Ready!
                  </h4>
                  <p className="text-xs font-sans text-sky-cream/80 max-w-lg mx-auto leading-relaxed">
                    All compliance parameters meet the recommended underwriting limits. You can confidently apply for standard MSME business funding.
                  </p>
                </motion.div>
              ) : actions.length === 0 ? (
                /* No actions from model but still days remaining (edge case) */
                <motion.div
                  key="no-actions"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 bg-sky-dark border border-sky-midnight rounded-xl text-center"
                >
                  <p className="text-xs font-sans text-sky-grey">
                    No specific actions identified. Continue maintaining your current financial discipline.
                  </p>
                </motion.div>
              ) : (
                /* Real Action Cards from Backend */
                actions.map((item) => (
                  <ActionCard
                    key={item.action_id}
                    featureId={item.action_id}
                    action={item.action}
                    daysSaved={item.days_saved}
                    reason={
                      shapBreakdown.find(s => s.feature === item.action_id)?.reason || ""
                    }
                    onComplete={handleActionComplete}
                    isCompleted={completedActions.has(item.action_id)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* SHAP Breakdown Panel */}
        {shapBreakdown.length > 0 && (
          <ScoreBreakdown 
            shapBreakdown={shapBreakdown} 
            msmeData={msmeData} 
          />
        )}

      </div>
    </div>
  );
}