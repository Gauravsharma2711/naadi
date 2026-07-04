import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { connectMsme } from "../services/api";

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
    { key: "gst",  title: "Connect your GST filings",       desc: "Validates monthly tax returns and historical filing compliance." },
    { key: "upi",  title: "Connect your UPI settlement logs", desc: "Tracks transaction volume slopes and merchant settlement velocity." },
    { key: "bank", title: "Connect your bank statements",     desc: "Analyzes cashflow volatility index via Account Aggregator." },
    { key: "epfo", title: "Connect your payroll filings",     desc: "Verifies payroll consistency and formal employee registrations." },
  ];

  return (
    <div className="min-h-screen bg-sky-dark flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans select-none text-sky-cream">
      
      {/* Decorative halos */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-sky-gold/5 blur-[100px] -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-sky-sunset/30 blur-[120px] -bottom-20 -right-20 pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#E2E8E5_1px,transparent_1px),linear-gradient(to_bottom,#E2E8E5_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Main card */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-sky-card border border-sky-midnight p-8 rounded-2xl shadow-[0_8px_30px_rgba(0,104,74,0.02)] relative z-10"
      >
        <AnimatePresence mode="wait">
          {step === 1 ? (
            /* ── Step 1: Enter MSME ID ── */
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
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
                      placeholder="e.g. 967b0eeb"
                      className="flex-1 bg-white border border-sky-midnight rounded-full px-5 py-3 font-display text-sky-cream placeholder-sky-grey/50 focus:outline-none focus:border-sky-gold transition-all duration-300 text-sm shadow-sm"
                    />
                    <button
                      type="submit"
                      className="bg-sky-gold hover:bg-[#00523A] text-white px-6 rounded-full font-display font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-sm"
                    >
                      Next
                    </button>
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
              <div className="space-y-3">
                <div
                  onClick={() => handleDemoSelect("967b0eeb")}
                  className="p-4 bg-white border border-sky-midnight hover:border-sky-crimson hover:shadow-sm rounded-xl flex justify-between items-center cursor-pointer transition-all duration-300 group"
                >
                  <div>
                    <h4 className="text-sm font-display font-bold text-sky-cream group-hover:text-sky-crimson transition-colors">Scenario A: Slow Start</h4>
                    <p className="text-xs font-sans text-sky-grey mt-0.5">MSME starting far from ready (~180-day countdown).</p>
                  </div>
                  <div className="text-[9px] uppercase font-bold text-sky-crimson bg-sky-crimson/10 border border-sky-crimson/20 px-2.5 py-0.5 rounded-full tracking-wider">Weak</div>
                </div>

                <div
                  onClick={() => handleDemoSelect("8cdd3d24")}
                  className="p-4 bg-white border border-sky-midnight hover:border-sky-gold hover:shadow-sm rounded-xl flex justify-between items-center cursor-pointer transition-all duration-300 group"
                >
                  <div>
                    <h4 className="text-sm font-display font-bold text-sky-cream group-hover:text-sky-gold transition-colors">Scenario B: On the Verge</h4>
                    <p className="text-xs font-sans text-sky-grey mt-0.5">MSME highly stable, close to ready (~18-day countdown).</p>
                  </div>
                  <div className="text-[9px] uppercase font-bold text-sky-gold bg-sky-sunset border border-sky-gold/20 px-2.5 py-0.5 rounded-full tracking-wider">Close</div>
                </div>
              </div>

              <div className="text-center mt-8 text-[9px] font-display text-sky-grey/70 uppercase tracking-widest font-semibold">
                IDBI Bank National Hackathon 2026 • AI-Powered MSME Card
              </div>
            </motion.div>
          ) : (
            /* ── Step 2: Link data sources, then call backend ── */
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Header */}
              <div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-display text-sky-grey hover:text-sky-cream flex items-center gap-1 uppercase tracking-wider mb-3 font-semibold"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Change Business ID
                </button>
                <h2 className="text-xl font-display uppercase tracking-widest font-extrabold text-sky-cream">
                  Link your business ledgers
                </h2>
                <p className="text-xs font-sans text-sky-grey mt-1">
                  Connect your primary financial sources for ID <strong className="text-sky-cream">{msmeIdInput}</strong>.
                </p>
              </div>

              {/* Source rows */}
              <div className="space-y-4">
                {sourceConfig.map((src) => (
                  <div key={src.key} className="p-4 bg-sky-dark border border-sky-midnight rounded-xl flex justify-between items-center gap-4">
                    <div className="flex-1">
                      <h4 className="text-xs font-display uppercase tracking-wider font-extrabold text-sky-cream">{src.title}</h4>
                      <p className="text-[11px] font-sans text-sky-grey mt-0.5">{src.desc}</p>
                    </div>
                    <SourceButton
                      status={
                        sourcesLinked[src.key] ? "connected" :
                        linkingSource === src.key ? "connecting" :
                        "disconnected"
                      }
                      onClick={() => handleLinkSource(src.key)}
                    />
                  </div>
                ))}
              </div>

              {/* Error banner */}
              {connectError && (
                <div className="p-3 bg-sky-crimson/10 border border-sky-crimson/20 rounded-xl text-xs font-sans text-sky-crimson text-center">
                  {connectError}
                </div>
              )}

              {/* Connect / CTA button */}
              <button
                onClick={handleConnect}
                disabled={!allLinked || connecting}
                className={`w-full py-3.5 rounded-full font-display font-extrabold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                  connecting
                    ? "bg-sky-gold text-white cursor-wait"
                    : allLinked
                    ? "bg-sky-gold hover:bg-[#00523A] text-white shadow-md shadow-sky-gold/15"
                    : "bg-sky-sunset text-sky-grey border border-sky-midnight cursor-not-allowed"
                }`}
              >
                {connecting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying business data...
                  </>
                ) : connectedData ? (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Connected — loading dashboard...
                  </>
                ) : (
                  "See my countdown"
                )}
              </button>

            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ── Sub-component: source link status button ── */
function SourceButton({ status, onClick }) {
  if (status === "connected") {
    return (
      <span className="flex items-center gap-1 bg-sky-sunset border border-sky-gold/20 text-sky-gold font-display font-extrabold text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-full">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Linked
      </span>
    );
  }

  if (status === "connecting") {
    return (
      <span className="flex items-center gap-1 text-sky-grey font-display font-bold text-[9px] uppercase tracking-widest px-3 py-1.5 bg-sky-dark border border-sky-midnight rounded-full">
        <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Linking
      </span>
    );
  }

  return (
    <button
      onClick={onClick}
      className="bg-white hover:bg-sky-dark text-sky-cream border border-sky-midnight hover:border-sky-gold px-4 py-1.5 rounded-full font-display font-bold text-[9px] uppercase tracking-widest transition-all duration-300 shadow-sm"
    >
      Link
    </button>
  );
}