import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountdownDial from "../components/CountdownDial";
import ActionCard from "../components/ActionCard";
import ScoreBreakdown from "../components/ScoreBreakdown";
import { getMsmeScore, completeAction, simulateScore, resetDemo } from "../services/api";
import AmbientBackground from "../components/AmbientBackground";
import ReadyState from "./ReadyState";
import ProductCompare from "./ProductCompare";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const MONITOR_MESSAGES = [
  "Analyzing latest UPI transactions...",
  "Checking GST portal synchronization...",
  "Verifying EPFO deposit compliance...",
  "Syncing account aggregator balances...",
  "Recalibrating transactional risk models...",
  "Scanning ledger invoices..."
];

export default function Dashboard({ msmeId, onBack }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [msmeData, setMsmeData] = useState(null);
  const [completedActions, setCompletedActions] = useState(new Set());
  const [completedActionsTimestamps, setCompletedActionsTimestamps] = useState({});
  const [tick, setTick] = useState(0);
  const [reductionPct, setReductionPct] = useState(0);
  const [simulatedDays, setSimulatedDays] = useState(null);
  const [monitorIndex, setMonitorIndex] = useState(0);
  const [monitorActive, setMonitorActive] = useState(false);
  const [showProductCompare, setShowProductCompare] = useState(false);

  // Trigger relative time refresh ticker every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const journeyLog = useMemo(() => {
    if (!completedActionsTimestamps) return [];
    const logItems = Object.entries(completedActionsTimestamps).map(([actionId, completedAt]) => ({
      action_id: actionId,
      completed_at: completedAt
    }));
    logItems.sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
    return logItems;
  }, [completedActionsTimestamps]);

  const getActionLabel = (actionId) => {
    const labels = {
      'filing_on_time_rate': 'GST Filing Compliance',
      'upi_trend_slope': 'UPI Settlement Growth',
      'cashflow_volatility_score': 'Cashflow Stability',
      'top_buyer_concentration_pct': 'Buyer Concentration Risk',
      'payroll_consistency_score': 'EPFO Payroll Consistency'
    };
    return labels[actionId] || actionId;
  };

  const getRelativeTime = (timestampIso) => {
    if (!timestampIso) return "";
    const date = new Date(timestampIso);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    
    if (diffSec < 15) {
      return "just now";
    } else if (diffSec < 60) {
      return `${diffSec} seconds ago`;
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
    } else if (diffHr < 24) {
      return `${diffHr} hour${diffHr !== 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Trigger continuous monitoring micro-animation every 10 seconds
  useEffect(() => {
    if (loading || error) return;
    
    const interval = setInterval(() => {
      setMonitorIndex((prev) => (prev + 1) % MONITOR_MESSAGES.length);
      setMonitorActive(true);

      const fadeTimeout = setTimeout(() => {
        setMonitorActive(false);
      }, 3000);

      return () => clearTimeout(fadeTimeout);
    }, 10000);

    return () => clearInterval(interval);
  }, [loading, error]);

  // Simulation logic triggered by slider
  useEffect(() => {
    if (!msmeData || !msmeId) return;
    const baseVal = msmeData.top_buyer_concentration_pct;
    const simulatedVal = baseVal * (1 - reductionPct / 100);
    
    let active = true;
    async function runSim() {
      try {
        const res = await simulateScore(msmeId, { top_buyer_concentration_pct: simulatedVal });
        if (active) {
          setSimulatedDays(res.days_remaining);
        }
      } catch (err) {
        console.warn("Simulation failed:", err);
      }
    }
    
    if (reductionPct > 0) {
      runSim();
    } else {
      setSimulatedDays(null);
    }
    
    return () => {
      active = false;
    };
  }, [reductionPct, msmeData, msmeId]);


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
          if (data.completed_actions) {
            setCompletedActions(new Set(data.completed_actions));
          }
          if (data.completed_actions_timestamps) {
            setCompletedActionsTimestamps(data.completed_actions_timestamps);
          }
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

      if (updatedData.completed_actions) {
        setCompletedActions(new Set(updatedData.completed_actions));
      }

      if (updatedData.completed_actions_timestamps) {
        setCompletedActionsTimestamps(updatedData.completed_actions_timestamps);
      }

      // Re-fetch full score data in the background to refresh the complete SHAP explanation breakdown
      try {
        const fullRefresh = await getMsmeScore(msmeId);
        setScoreData(fullRefresh);
        setMsmeData(fullRefresh.msme_data);
        if (fullRefresh.completed_actions) {
          setCompletedActions(new Set(fullRefresh.completed_actions));
        }
        if (fullRefresh.completed_actions_timestamps) {
          setCompletedActionsTimestamps(fullRefresh.completed_actions_timestamps);
        }
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

  const handleResetDemo = async () => {
    if (!confirm("Are you sure you want to reset this demo's progress?")) return;
    
    try {
      const resetData = await resetDemo(msmeId);
      
      // Update local state with the reset baseline data
      setScoreData(resetData);
      setMsmeData(resetData.msme_data);
      setCompletedActions(new Set());
      setCompletedActionsTimestamps({});
    } catch (err) {
      console.error(err);
      alert("Failed to reset demo. Please try again.");
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

  if (showProductCompare) {
    return (
      <ProductCompare 
        msmeId={msmeId}
        onBack={() => setShowProductCompare(false)}
      />
    );
  }

  if (daysRemaining <= 0) {
    return (
      <ReadyState
        msmeId={msmeId}
        onBack={onBack}
        probability={probability}
        shapBreakdown={shapBreakdown}
        msmeData={msmeData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-transparent px-6 py-12 relative overflow-x-hidden font-sans select-none text-sky-cream w-full">
      <AmbientBackground daysRemaining={daysRemaining} />

      <div className="w-full max-w-6xl mx-auto relative z-10 space-y-6">
        
        {/* Navigation & Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-sky-card border border-sky-midnight px-4 py-3 sm:px-6 sm:py-4 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] gap-3 sm:gap-0">
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
              <h2 className="text-sm font-display uppercase tracking-widest font-extrabold text-sky-cream leading-tight flex items-center gap-2">
                Din <span className="text-[10px] font-display font-bold text-sky-gold uppercase tracking-widest bg-sky-sunset px-2 py-0.5 rounded border border-sky-gold/10">Dashboard</span>
                {completedActions.size > 0 && (
                  <span className="text-[9px] font-sans font-medium text-sky-info bg-sky-info/5 border border-sky-info/20 px-2 py-0.5 rounded-full flex items-center gap-1 select-none">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-info animate-pulse" />
                    Continuing your progress
                  </span>
                )}
              </h2>
              <p className="text-[9px] font-display text-sky-grey uppercase tracking-widest mt-1 flex items-center gap-2 select-none">
                <span>Business ID: <strong className="text-sky-cream">{msmeId}</strong></span>
                {completedActions.size > 0 && (
                  <>
                    <span className="text-sky-midnight">|</span>
                    <button
                      onClick={handleResetDemo}
                      className="font-sans font-bold text-sky-grey hover:text-sky-crimson hover:underline transition-colors duration-200 uppercase tracking-wider bg-transparent border-none cursor-pointer p-0"
                    >
                      Reset Demo
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
          
          <div className="w-full sm:w-auto flex justify-between sm:justify-end items-center gap-2">
            <motion.button
              onClick={() => setShowProductCompare(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 bg-sky-sunset text-sky-gold hover:text-white hover:bg-sky-gold border border-sky-gold/20 rounded font-sans font-bold text-[9px] uppercase tracking-widest transition-all duration-300 mr-2"
            >
              Compare Products
            </motion.button>
            <span className="text-[10px] font-display text-sky-grey font-semibold uppercase tracking-widest hidden sm:inline">
              Integration: 
            </span>
            <span className="text-[9px] font-display font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border bg-sky-sunset text-sky-gold border-sky-gold/20">
              Live
            </span>
          </div>
        </header>

        {/* Verification Trust Badges */}
        <div className="flex flex-wrap gap-3 items-center justify-start bg-sky-card/45 border border-sky-midnight/55 px-4 py-2.5 rounded-xl shadow-sm">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#00D66B]/10 rounded-full border border-[#00D66B]/20 text-[10px] font-sans font-bold text-sky-cream">
            <svg className="h-3 w-3 text-[#00D66B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>GST Verified</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#00D66B]/10 rounded-full border border-[#00D66B]/20 text-[10px] font-sans font-bold text-sky-cream">
            <svg className="h-3 w-3 text-[#00D66B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>UPI Verified</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#00D66B]/10 rounded-full border border-[#00D66B]/20 text-[10px] font-sans font-bold text-sky-cream">
            <svg className="h-3 w-3 text-[#00D66B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>AA Connected</span>
          </div>

          {msmeData?.has_employees ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#00D66B]/10 rounded-full border border-[#00D66B]/20 text-[10px] font-sans font-bold text-sky-cream">
              <svg className="h-3 w-3 text-[#00D66B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>EPFO Linked</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-sky-sunset/10 rounded-full border border-sky-sunset/20 text-[10px] font-sans font-bold text-sky-grey">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-grey" />
              <span>No EPFO Data</span>
            </div>
          )}
        </div>

        {/* Main Body Columns: Two-Column split on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
          
          {/* Left Column: Growth-Ring Dial (~60% width) & Timeline */}
          <main className="md:col-span-3 space-y-6 w-full">
            <div className="flex flex-col items-center w-full">
              <CountdownDial 
                daysRemaining={daysRemaining} 
                maxDays={maxDays} 
                probability={probability} 
                simulatedDays={simulatedDays}
              />
              
              {/* Subtle Live Ledger Pulse */}
              <div className="flex items-center justify-center gap-2 mt-4 text-[10px] font-sans text-sky-grey select-none min-h-[16px]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D66B] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D66B]"></span>
                </span>
                <span className="font-extrabold uppercase tracking-widest text-[#5A6B70]">Ledger Monitoring Active</span>
                
                <span 
                  className="transition-all duration-700 ease-in-out font-medium"
                  style={{ 
                    opacity: monitorActive ? 0.8 : 0, 
                    transform: monitorActive ? "translateY(0)" : "translateY(2px)" 
                  }}
                >
                  — {MONITOR_MESSAGES[monitorIndex]}
                </span>
              </div>
            </div>

            {/* Credit Readiness Timeline Chart */}
            {scoreData?.historical_timeline && (
              <div className="bg-sky-card border border-sky-midnight p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] space-y-4">
                <div className="border-b border-sky-midnight pb-3">
                  <h3 className="text-xs font-display uppercase tracking-widest font-extrabold text-sky-cream">
                    Credit Readiness Timeline
                  </h3>
                  <p className="text-[9px] font-display text-sky-grey uppercase tracking-widest mt-1">
                    6-Month Historical Countdown Trend (Days Remaining)
                  </p>
                </div>
                <div className="h-[200px] w-full font-sans text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={scoreData.historical_timeline}
                      margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00D66B" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#00D66B" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E1DE" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#5A6B70" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false} 
                        dy={8}
                      />
                      <YAxis 
                        stroke="#5A6B70" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 'auto']}
                        dx={-8}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E3E1DE',
                          borderRadius: '12px',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '11px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          color: '#001E2B'
                        }}
                        labelStyle={{ fontWeight: 'bold', color: '#001E2B', marginBottom: '4px' }}
                        itemStyle={{ color: '#00D66B' }}
                        formatter={(value) => [`${value} Days`, "Readiness"]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="days_remaining" 
                        stroke="#00D66B" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#colorDays)" 
                        dot={{ r: 3, stroke: '#00D66B', strokeWidth: 2, fill: '#FFFFFF' }}
                        activeDot={{ r: 5, stroke: '#00D66B', strokeWidth: 2, fill: '#00D66B' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </main>

          {/* Right Column: Actions Stack or Success Offer Card (~40% width) */}
          <section className="md:col-span-2 space-y-4 w-full">
            {/* Action Cards Stack */}
            <div className="bg-sky-card border border-sky-midnight p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] space-y-4">
              <div className="border-b border-sky-midnight pb-3 flex justify-between items-baseline">
                <h3 className="text-xs font-display uppercase tracking-widest font-extrabold text-sky-cream">
                  Accelerate Growth
                </h3>
                <span className="text-[9px] font-display text-sky-grey font-bold uppercase tracking-widest">
                  {actions.length} action{actions.length !== 1 ? "s" : ""} left
                </span>
              </div>

              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {actions.length === 0 ? (
                    <p className="text-xs font-sans text-sky-grey text-center py-4">
                      No actions remaining. Keep maintaining credit hygiene.
                    </p>
                  ) : (
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
            </div>

            {/* Your Journey Log */}
            {journeyLog.length > 0 && (
              <div className="bg-sky-card border border-sky-midnight p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] space-y-4">
                <div className="border-b border-sky-midnight pb-3">
                  <h3 className="text-xs font-display uppercase tracking-widest font-extrabold text-sky-info flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-sky-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Your Journey
                  </h3>
                </div>
                <div className="flow-root">
                  <ul className="-mb-8">
                    {journeyLog.map((logItem, logIdx) => (
                      <li key={logItem.action_id}>
                        <div className="relative pb-8">
                          {logIdx !== journeyLog.length - 1 ? (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-sky-midnight" aria-hidden="true" />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-sky-info/10 border border-sky-info/20 flex items-center justify-center ring-8 ring-sky-card">
                                <svg className="h-4 w-4 text-sky-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-xs text-sky-cream font-sans font-medium">
                                  You completed <span className="font-extrabold text-sky-info">"{getActionLabel(logItem.action_id)}"</span>
                                </p>
                              </div>
                              <div className="text-right text-[10px] whitespace-nowrap text-sky-grey font-sans">
                                <span>{getRelativeTime(logItem.completed_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* What-If Simulator Panel */}
            <div className="bg-sky-card border border-sky-midnight p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] space-y-4">
              <div className="border-b border-sky-midnight pb-3">
                <h3 className="text-xs font-display uppercase tracking-widest font-extrabold text-sky-gold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-gold animate-pulse" />
                  What-If Simulation
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-sans text-sky-grey">
                  <span>Reduce Buyer Concentration by:</span>
                  <span className="text-sky-cream font-bold text-sm">{reductionPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={reductionPct}
                  onChange={(e) => setReductionPct(Number(e.target.value))}
                  className="w-full h-1.5 bg-sky-dark rounded-lg appearance-none cursor-pointer accent-sky-gold border border-sky-midnight"
                />
                <div className="text-[10px] font-sans text-sky-grey leading-relaxed bg-sky-dark/40 p-3 rounded-lg border border-sky-midnight/55 space-y-1">
                  <p>
                    <strong>Hypothetical value:</strong> {msmeData ? (msmeData.top_buyer_concentration_pct * (1 - reductionPct / 100) * 100).toFixed(1) : 0}% of revenue from top buyer (Base: {msmeData ? (msmeData.top_buyer_concentration_pct * 100).toFixed(1) : 0}%).
                  </p>
                  <p className="text-sky-gold font-medium">
                    * Adjusting the slider will update the simulated preview countdown badge below the main dial. No database changes are saved.
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Quiet Bottom SHAP Breakdown Section */}
        {shapBreakdown.length > 0 && (
          <ScoreBreakdown 
            shapBreakdown={shapBreakdown} 
            msmeData={msmeData}
            daysRemaining={daysRemaining}
            msmeId={msmeId}
          />
        )}

      </div>
    </div>
  );
}