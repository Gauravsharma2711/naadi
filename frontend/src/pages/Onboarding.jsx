import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { connectMsme } from "../services/api";
import AmbientBackground from "../components/AmbientBackground";

export default function Onboarding({ onSelectMsme }) {
  const [step, setStep] = useState(1); // 1 = Enter ID, 2 = Connect Sources
  const [msmeIdInput, setMsmeIdInput] = useState("");
  const [inputError, setInputError] = useState("");

  // Connection flow state
  const [connecting, setConnecting] = useState(false); // True while POST is in flight
  const [connectError, setConnectError] = useState("");
  const [connectedData, setConnectedData] = useState(null); // Backend response

  // Source linking progress (visual only — the real call sends all 4 at once)
  const [sourcesLinked, setSourcesLinked] = useState({
    gst: false, upi: false, bank: false, epfo: false,
  });
  const [linkingSource, setLinkingSource] = useState(null); // Currently animating

  const ALL_SOURCES = ["gst", "upi", "bank", "epfo"];

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!msmeIdInput.trim()) {
      setInputError("Please enter a valid MSME Business ID");
      return;
    }
    setInputError("");
    setConnectError("");
    setConnectedData(null);
    setSourcesLinked({ gst: false, upi: false, bank: false, epfo: false });
    setStep(2);
  };

  const handleDemoSelect = (id) => {
    setMsmeIdInput(id);
    setInputError("");
    setConnectError("");
    setConnectedData(null);
    setSourcesLinked({ gst: false, upi: false, bank: false, epfo: false });
    setStep(2);
  };

  /**
   * When the user clicks "Link" on a source, play a brief animation
   * then mark it linked. Once all 4 are linked, fire the real backend call.
   */
  const handleLinkSource = (sourceKey) => {
    if (sourcesLinked[sourceKey] || linkingSource) return;

    setLinkingSource(sourceKey);
    setTimeout(() => {
      setSourcesLinked((prev) => ({ ...prev, [sourceKey]: true }));
      setLinkingSource(null);
    }, 800);
  };

  const allLinked = ALL_SOURCES.every((s) => sourcesLinked[s]);

  /**
   * Fire the real POST /msme/connect with all 4 sources.
   * On success, pass the MSME ID up to App.jsx to load the Dashboard.
   */
  const handleConnect = async () => {
    if (connecting) return;
    setConnecting(true);
    setConnectError("");

    try {
      const result = await connectMsme(msmeIdInput.trim(), ALL_SOURCES);
      setConnectedData(result);

      // Brief pause so the user sees the success state, then navigate
      setTimeout(() => {
        onSelectMsme(result.msme_id);
      }, 600);
    } catch (err) {
      setConnectError(err.message || "Couldn't connect. Check that the backend is running.");
    } finally {
      setConnecting(false);
    }
  };

  const sourceConfig = [
    { key: "gst",  shortTitle: "GST Filings",        title: "Connect your GST filings",       desc: "Validates monthly tax returns and historical filing compliance." },
    { key: "upi",  shortTitle: "UPI Payments",       title: "Connect your UPI settlement logs", desc: "Tracks transaction volume slopes and merchant settlement velocity." },
    { key: "bank", shortTitle: "Bank Account",       title: "Connect your bank statements",     desc: "Analyzes cashflow volatility index via Account Aggregator." },
    { key: "epfo", shortTitle: "EPFO Records",       title: "Connect your payroll filings",     desc: "Verifies payroll consistency and formal employee registrations." },
  ];

  return (
    <div className="min-h-screen bg-sky-dark flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden font-sans select-none text-sky-cream w-full">
      <AmbientBackground daysRemaining={47} />
      
      {step === 2 && (
        <nav className="absolute top-0 left-0 right-0 h-16 bg-sky-dark/85 backdrop-blur-md border-b border-sky-midnight px-8 flex items-center justify-between z-20">
          <div className="font-display font-bold text-lg uppercase tracking-widest text-sky-cream">
            DIN
          </div>
          <button
            onClick={() => setStep(1)}
            className="text-[10px] font-display text-sky-grey hover:text-sky-cream transition-colors uppercase tracking-widest font-extrabold"
          >
            ← Change ID
          </button>
        </nav>
      )}

      <AnimatePresence mode="wait">
        {step === 1 ? (
          /* Step 1: Enter Business ID Card */
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md bg-sky-card border border-sky-midnight p-8 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 relative z-10"
          >
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-display uppercase tracking-widest font-extrabold text-sky-cream flex justify-center items-baseline gap-1">
                  Din <span className="text-[10px] font-display font-bold text-sky-gold uppercase tracking-widest bg-sky-sunset border border-sky-gold/15 px-2 py-0.5 rounded ml-2">Naadi</span>
                </h1>
                <p className="text-xs font-sans text-sky-grey mt-4 leading-relaxed">
                  Calculate your "Days until Loan-Ready" countdown and discover ranked actions to get funding faster.
                </p>
              </div>

              <form onSubmit={handleNextStep} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-display font-semibold text-sky-grey uppercase tracking-widest mb-2">
                    Enter MSME Business ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={msmeIdInput}
                      onChange={(e) => setMsmeIdInput(e.target.value)}
                      placeholder="e.g. demo-msme-a"
                      className="flex-1 bg-white border border-sky-midnight rounded-xl px-5 py-3 font-display text-sky-cream placeholder-sky-grey/50 focus:outline-none focus:border-sky-gold transition-all duration-300 text-sm shadow-sm"
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,214,107,0.15)" }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="bg-sky-gold hover:bg-[#00b056] text-white px-6 rounded-xl font-display font-bold text-xs uppercase tracking-widest transition-colors duration-300 shadow-sm"
                    >
                      Next
                    </motion.button>
                  </div>
                  {inputError && (
                    <span className="text-xs text-sky-crimson font-medium block mt-1.5 pl-1">{inputError}</span>
                  )}
                </div>
              </form>

              {/* Separator */}
              <div className="flex items-center my-8 text-[10px] font-display text-sky-grey/50 uppercase tracking-widest">
                <div className="flex-1 h-[1px] bg-sky-midnight" />
                <span className="px-3">Or choose a demo scenario</span>
                <div className="flex-1 h-[1px] bg-sky-midnight" />
              </div>

              {/* Demo scenarios */}
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-sky-midnight">
                {/* Scenario A */}
                <motion.div
                  onClick={() => handleDemoSelect("demo-msme-a")}
                  whileHover={{ y: -1.5, borderColor: "#D64545" }}
                  whileTap={{ scale: 0.99 }}
                  className="p-3 bg-white border border-sky-midnight rounded-xl flex justify-between items-center cursor-pointer transition-all duration-300 group"
                >
                  <div className="pr-2">
                    <h4 className="text-xs font-display font-bold text-sky-cream group-hover:text-sky-crimson transition-colors">Demo A: Mid-Journey (47 Days)</h4>
                    <p className="text-[10px] font-sans text-sky-grey leading-tight mt-0.5">3 actions remaining. Balanced risk profile.</p>
                  </div>
                  <div className="text-[8px] uppercase font-bold text-sky-crimson bg-sky-crimson/10 border border-sky-crimson/20 px-2 py-0.5 rounded-full tracking-wider shrink-0">Demo A</div>
                </motion.div>

                {/* Scenario B */}
                <motion.div
                  onClick={() => handleDemoSelect("demo-msme-b")}
                  whileHover={{ y: -1.5, borderColor: "#00D66B" }}
                  whileTap={{ scale: 0.99 }}
                  className="p-3 bg-white border border-sky-midnight rounded-xl flex justify-between items-center cursor-pointer transition-all duration-300 group"
                >
                  <div className="pr-2">
                    <h4 className="text-xs font-display font-bold text-sky-cream group-hover:text-sky-gold transition-colors">Demo B: Ready / Pre-Approved (0 Days)</h4>
                    <p className="text-[10px] font-sans text-sky-grey leading-tight mt-0.5">Excellent compliance. Pre-approved loan offer active.</p>
                  </div>
                  <div className="text-[8px] uppercase font-bold text-sky-gold bg-sky-sunset border border-sky-gold/20 px-2 py-0.5 rounded-full tracking-wider shrink-0">Demo B</div>
                </motion.div>

                {/* Scenario C */}
                <motion.div
                  onClick={() => handleDemoSelect("demo-msme-c")}
                  whileHover={{ y: -1.5, borderColor: "#D64545" }}
                  whileTap={{ scale: 0.99 }}
                  className="p-3 bg-white border border-sky-midnight rounded-xl flex justify-between items-center cursor-pointer transition-all duration-300 group"
                >
                  <div className="pr-2">
                    <h4 className="text-xs font-display font-bold text-sky-cream group-hover:text-sky-crimson transition-colors">Demo C: Compound Risk (133 Days)</h4>
                    <p className="text-[10px] font-sans text-sky-grey leading-tight mt-0.5">Poor GST filing history & high buyer concentration risk.</p>
                  </div>
                  <div className="text-[8px] uppercase font-bold text-sky-crimson bg-sky-crimson/10 border border-sky-crimson/20 px-2 py-0.5 rounded-full tracking-wider shrink-0">Demo C</div>
                </motion.div>

                {/* Scenario D */}
                <motion.div
                  onClick={() => handleDemoSelect("demo-msme-d")}
                  whileHover={{ y: -1.5, borderColor: "#00D66B" }}
                  whileTap={{ scale: 0.99 }}
                  className="p-3 bg-white border border-sky-midnight rounded-xl flex justify-between items-center cursor-pointer transition-all duration-300 group"
                >
                  <div className="pr-2">
                    <h4 className="text-xs font-display font-bold text-sky-cream group-hover:text-sky-gold transition-colors">Demo D: Close to Ready (12 Days)</h4>
                    <p className="text-[10px] font-sans text-sky-grey leading-tight mt-0.5">No employees (no EPFO data). Needs 1 concentration fix.</p>
                  </div>
                  <div className="text-[8px] uppercase font-bold text-sky-gold bg-sky-sunset border border-sky-gold/20 px-2 py-0.5 rounded-full tracking-wider shrink-0">Demo D</div>
                </motion.div>

                {/* Scenario E */}
                <motion.div
                  onClick={() => handleDemoSelect("demo-msme-e")}
                  whileHover={{ y: -1.5, borderColor: "#00D66B" }}
                  whileTap={{ scale: 0.99 }}
                  className="p-3 bg-white border border-sky-midnight rounded-xl flex justify-between items-center cursor-pointer transition-all duration-300 group"
                >
                  <div className="pr-2">
                    <h4 className="text-xs font-display font-bold text-sky-cream group-hover:text-sky-gold transition-colors">Demo E: One Blocker (8 Days)</h4>
                    <p className="text-[10px] font-sans text-sky-grey leading-tight mt-0.5">Perfect filing/stability. 1 concentration blocker.</p>
                  </div>
                  <div className="text-[8px] uppercase font-bold text-sky-gold bg-sky-sunset border border-sky-gold/20 px-2 py-0.5 rounded-full tracking-wider shrink-0">Demo E</div>
                </motion.div>

                {/* Scenario F */}
                <motion.div
                  onClick={() => handleDemoSelect("demo-msme-f")}
                  whileHover={{ y: -1.5, borderColor: "#00D66B" }}
                  whileTap={{ scale: 0.99 }}
                  className="p-3 bg-white border border-sky-midnight rounded-xl flex justify-between items-center cursor-pointer transition-all duration-300 group"
                >
                  <div className="pr-2">
                    <h4 className="text-xs font-display font-bold text-sky-cream group-hover:text-sky-gold transition-colors">Demo F: Seasonal Business (32 Days)</h4>
                    <p className="text-[10px] font-sans text-sky-grey leading-tight mt-0.5">High volatility cashflow but solid underlying business.</p>
                  </div>
                  <div className="text-[8px] uppercase font-bold text-sky-gold bg-sky-sunset border border-sky-gold/20 px-2 py-0.5 rounded-full tracking-wider shrink-0">Demo F</div>
                </motion.div>
              </div>

              <div className="text-center mt-8 text-[9px] font-display text-sky-grey/70 uppercase tracking-widest font-semibold">
                IDBI Bank National Hackathon 2026 • AI-Powered MSME Card
              </div>
            </div>
          </motion.div>
        ) : (
          /* Step 2: Connection Cards Row side-by-side */
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-6xl flex flex-col items-center z-10 relative mt-8 space-y-8"
          >
            {/* Centered Hero Heading */}
            <div className="text-center max-w-2xl mx-auto mb-4">
              <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-sky-cream tracking-tight leading-tight">
                Know exactly how many days until you're loan-ready
              </h1>
              <p className="text-sm font-sans text-sky-grey mt-3 leading-relaxed">
                Connect your business data securely. Din calculates your real-time approval countdown using institutional models.
              </p>
            </div>

            {/* Connection Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
              {sourceConfig.map((src) => {
                const isLinked = sourcesLinked[src.key];
                const isLinking = linkingSource === src.key;
                return (
                  <motion.div
                    key={src.key}
                    whileHover={!isLinked ? { y: -4, scale: 1.01, boxShadow: "0 8px 20px rgba(0,0,0,0.06)" } : {}}
                    transition={{ duration: 0.2 }}
                    className={`p-6 bg-sky-card border border-sky-midnight rounded-2xl flex flex-col justify-between h-64 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.06)] relative overflow-hidden`}
                  >
                    {/* Top indicator bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 transition-all ${isLinked ? 'bg-sky-gold' : 'bg-transparent'}`} />

                    <div>
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${isLinked ? 'bg-sky-gold/10 text-sky-gold' : 'bg-sky-dark text-sky-grey'}`}>
                        <SourceIcon sourceKey={src.key} />
                      </div>
                      <h4 className="text-xs font-display uppercase tracking-wider font-extrabold text-sky-cream mb-2">
                        {src.shortTitle}
                      </h4>
                      <p className="text-[11px] font-sans text-sky-grey leading-relaxed">
                        {src.desc}
                      </p>
                    </div>

                    <button
                      onClick={() => handleLinkSource(src.key)}
                      disabled={isLinked || isLinking}
                      className={`w-full py-2.5 rounded-xl font-display font-extrabold text-[10px] uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 ${
                        isLinked
                          ? "bg-sky-sunset text-sky-gold border border-sky-gold/10"
                          : isLinking
                          ? "bg-sky-dark text-sky-grey border border-sky-midnight cursor-wait animate-pulse"
                          : "bg-white hover:bg-sky-dark text-sky-cream border border-sky-midnight hover:border-sky-gold"
                      }`}
                    >
                      {isLinked ? (
                        <>
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Linked
                        </>
                      ) : isLinking ? (
                        "Linking..."
                      ) : (
                        "Connect"
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Error banner */}
            {connectError && (
              <div className="w-full max-w-xs p-3 bg-sky-crimson/10 border border-sky-crimson/20 rounded-xl text-xs font-sans text-sky-crimson text-center">
                {connectError}
              </div>
            )}

            {/* Primary Action Button */}
            <div className="w-full max-w-xs pt-4">
              <motion.button
                onClick={handleConnect}
                disabled={!allLinked || connecting}
                whileHover={allLinked && !connecting ? { scale: 1.02, boxShadow: "0 8px 20px rgba(0,214,107,0.15)" } : {}}
                whileTap={allLinked && !connecting ? { scale: 0.98 } : {}}
                transition={{ duration: 0.2 }}
                className={`w-full py-4 rounded-xl font-display font-extrabold text-xs uppercase tracking-widest transition-colors duration-300 flex items-center justify-center gap-2 ${
                  connecting
                    ? "bg-sky-gold text-white cursor-wait"
                    : allLinked
                    ? "bg-sky-gold hover:bg-[#00b056] text-white"
                    : "bg-sky-sunset text-sky-grey border border-sky-midnight cursor-not-allowed"
                }`}
              >
                {connecting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying...
                  </>
                ) : (
                  "See My Countdown"
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Sub-component: source link status button ── */
function SourceIcon({ sourceKey }) {
  switch (sourceKey) {
    case "gst":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case "upi":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "bank":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case "epfo":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    default:
      return null;
  }
}