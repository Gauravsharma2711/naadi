import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { connectMsme, getMsmeScore } from "../services/api";
import AmbientBackground from "../components/AmbientBackground";

export default function Onboarding({ onSelectMsme }) {
  const [step, setStep] = useState(1); // 1 = Enter ID, 2 = Connect Sources
  const [msmeIdInput, setMsmeIdInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [msmeData, setMsmeData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

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

  const getPreFilledData = (key) => {
    if (!msmeData) return "No data available";
    switch (key) {
      case "gst": {
        const rate = msmeData.filing_on_time_rate;
        const pct = (rate * 100).toFixed(1);
        return `${pct}% On-Time Filing Rate`;
      }
      case "upi": {
        const slope = msmeData.upi_trend_slope;
        const sign = slope >= 0 ? "+" : "";
        const pct = (slope * 100).toFixed(1);
        return `${sign}${pct}% MoM Settlement Trend`;
      }
      case "bank": {
        const vol = msmeData.cashflow_volatility_score;
        const level = vol <= 0.1 ? "Low" : vol <= 0.3 ? "Moderate" : "High";
        return `Volatility Index: ${vol.toFixed(3)} (${level})`;
      }
      case "epfo": {
        if (!msmeData.has_employees) {
          return "No employees on record";
        }
        const consistency = msmeData.payroll_consistency_score;
        const pct = (consistency * 100).toFixed(1);
        return `Payroll Consistency: ${pct}%`;
      }
      default:
        return "Not available";
    }
  };

  const handleNextStep = async (e) => {
    e.preventDefault();
    const id = msmeIdInput.trim();
    if (!id) {
      setInputError("Please enter a valid MSME Business ID");
      return;
    }
    setInputError("");
    setConnectError("");
    setConnectedData(null);
    setSourcesLinked({ gst: false, upi: false, bank: false, epfo: false });
    setLoadingData(true);
    try {
      const data = await getMsmeScore(id);
      setMsmeData(data.msme_data);
      setStep(2);
    } catch (err) {
      console.error(err);
      setInputError("No business found with this ID. Check that the backend is running.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleDemoSelect = async (id) => {
    setMsmeIdInput(id);
    setInputError("");
    setConnectError("");
    setConnectedData(null);
    setSourcesLinked({ gst: false, upi: false, bank: false, epfo: false });
    setLoadingData(true);
    try {
      const data = await getMsmeScore(id);
      setMsmeData(data.msme_data);
      setStep(2);
    } catch (err) {
      console.error(err);
      setInputError("Failed to fetch demo scenario. Check that the backend is running.");
    } finally {
      setLoadingData(false);
    }
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
    <div className="min-h-screen bg-transparent flex flex-col justify-center items-center px-6 py-12 relative overflow-x-hidden font-sans select-none text-sky-cream w-full">
      <AmbientBackground daysRemaining={47} />
      
      {step === 2 && (
        <nav className="absolute top-0 left-0 right-0 h-16 bg-sky-dark/85 backdrop-blur-md border-b border-sky-midnight px-4 sm:px-8 flex items-center justify-between z-20">
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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10 relative px-4"
          >
            {/* Left Column: Headline & Visual Phone Illustration (7 / 12 cols on desktop) */}
            <div className="lg:col-span-7 space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left mt-8 lg:mt-0">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-sky-sunset/45 border border-sky-gold/15 px-3 py-1 rounded-full text-[10px] font-display font-bold text-sky-gold tracking-widest uppercase select-none">
                  🌱 IDBI Bank National Hackathon 2026
                </div>
                <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-sky-cream tracking-tight leading-[1.1] max-w-lg">
                  Grow towards <br/>
                  <span className="text-sky-gold">credit-readiness</span>
                </h1>
                <p className="text-sm font-sans text-sky-grey leading-relaxed max-w-md">
                  Din measures your real-time approval countdown using institutional models, and ranks the exact operational tasks you need to complete.
                </p>
              </div>

              {/* Visual phone mockup and growth rings illustration */}
              <div className="relative w-72 h-[26rem] select-none scale-90 sm:scale-100 mt-2 mb-6 lg:mb-0">
                {/* Scattered overlapping growth rings and leaves behind the phone */}
                <div className="absolute -top-10 -left-12 w-28 h-28 text-sky-sunset opacity-40 animate-pulse pointer-events-none">
                  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <circle cx="50" cy="50" r="40" strokeWidth="2" strokeDasharray="3 5" />
                    <circle cx="50" cy="50" r="28" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="absolute -bottom-8 -right-10 w-24 h-24 text-sky-gold opacity-25 pointer-events-none">
                  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <path d="M50 10 C25 35, 25 65, 50 90 C75 65, 75 35, 50 10 Z" strokeWidth="2" fill="currentColor" fillOpacity="0.08" />
                  </svg>
                </div>
                <div className="absolute top-1/2 -right-16 w-16 h-16 text-sky-sunset opacity-35 pointer-events-none">
                  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <circle cx="50" cy="50" r="40" strokeWidth="2.5" strokeDasharray="2 4" />
                  </svg>
                </div>

                {/* Sleek smartphone chassis mockup */}
                <div className="absolute inset-0 bg-[#001E2B] rounded-[36px] p-2.5 shadow-[0_20px_50px_rgba(0,30,43,0.15)] border-2 border-sky-midnight/20 flex flex-col overflow-hidden">
                  {/* Phone Screen Container */}
                  <div className="flex-1 bg-[#FBFBFA] rounded-[28px] overflow-hidden flex flex-col p-4 relative">
                    {/* Top Speaker Notch */}
                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-3 bg-[#001E2B] rounded-full z-20" />
                    
                    {/* Mini Screen App Mockup Header */}
                    <div className="flex justify-between items-baseline border-b border-sky-midnight pb-2 mt-2 select-none">
                      <span className="text-[7px] font-display tracking-widest font-extrabold text-sky-cream uppercase">DIN</span>
                      <span className="text-[6px] font-display font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded-full border bg-sky-sunset text-sky-gold border-sky-gold/20">Live</span>
                    </div>

                    {/* Mini Countdown Ring dial */}
                    <div className="my-auto flex flex-col items-center select-none py-2">
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        {/* Dial circular progress tracks */}
                        <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="#B8E8C8" strokeWidth="7" fill="none" strokeDasharray="180 360" strokeLinecap="round" />
                          <circle cx="50" cy="50" r="40" stroke="#00D66B" strokeWidth="7" fill="none" strokeDasharray="120 360" strokeLinecap="round" />
                        </svg>
                        <div className="text-center z-10 flex flex-col items-center">
                          <span className="text-3xl font-display font-extrabold text-sky-cream tracking-tighter">47</span>
                          <span className="text-[6px] font-display font-bold text-sky-grey uppercase tracking-wider -mt-1">DAYS TO READY</span>
                        </div>
                      </div>
                      <div className="mt-2 text-center">
                        <span className="text-[8px] font-sans text-sky-grey font-medium">Readiness Probability: </span>
                        <span className="text-[8px] font-display font-bold text-sky-gold">68.3%</span>
                      </div>
                    </div>

                    {/* Mini Action Card List Mock */}
                    <div className="space-y-1.5 mt-auto">
                      <div className="p-2 bg-white border border-sky-midnight rounded-lg shadow-sm flex justify-between items-center gap-1.5">
                        <div className="flex-1 min-w-0">
                          <span className="text-[6px] font-display font-extrabold text-sky-cream block uppercase tracking-wider truncate">Link EPFO records</span>
                          <span className="text-[5px] font-sans text-sky-grey block truncate">Verify payroll consistency</span>
                        </div>
                        <span className="text-[7px] font-display font-bold text-sky-gold shrink-0">-22 days</span>
                      </div>
                      <div className="p-2 bg-white border border-sky-midnight rounded-lg shadow-sm flex justify-between items-center gap-1.5 opacity-60">
                        <div className="flex-1 min-w-0">
                          <span className="text-[6px] font-display font-extrabold text-sky-cream block uppercase tracking-wider truncate line-through">GST on-time filings</span>
                          <span className="text-[5px] font-sans text-sky-grey block truncate">Clean filing history verified</span>
                        </div>
                        <span className="text-[5px] font-display font-bold text-sky-grey shrink-0 uppercase">Done</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: The Form Card (5 / 12 cols on desktop) */}
            <div className="lg:col-span-5 flex justify-center w-full">
              <div className="w-full max-w-md bg-sky-card border border-sky-midnight p-6 sm:p-8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(0,104,74,0.03)] transition-all duration-300 relative">
                <div className="space-y-6">
                  {/* Small Brand Logo inside the card */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-display tracking-widest font-extrabold text-sky-cream">DIN</span>
                    <span className="text-[8px] font-display font-bold text-sky-gold uppercase tracking-wider bg-sky-sunset border border-sky-gold/15 px-2 py-0.5 rounded">NAADI</span>
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
                          disabled={loadingData}
                          className="flex-1 bg-white border border-sky-midnight rounded-xl px-4 py-3 font-sans text-sky-cream placeholder-sky-grey/50 focus:outline-none focus:border-sky-gold focus:ring-2 focus:ring-sky-gold/15 transition-all duration-300 text-sm shadow-sm"
                        />
                        <motion.button
                          type="submit"
                          disabled={loadingData}
                          whileHover={!loadingData ? { scale: 1.02, boxShadow: "0 8px 20px rgba(0,214,107,0.15)" } : {}}
                          whileTap={!loadingData ? { scale: 0.98 } : {}}
                          transition={{ duration: 0.2 }}
                          className="bg-sky-gold hover:bg-[#00b056] text-white px-6 rounded-xl font-display font-bold text-xs uppercase tracking-widest transition-colors duration-300 shadow-sm flex items-center justify-center min-w-[80px]"
                        >
                          {loadingData ? (
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            "Next"
                          )}
                        </motion.button>
                      </div>
                      {inputError && (
                        <span className="text-xs text-sky-crimson font-medium block mt-1.5 pl-1">{inputError}</span>
                      )}
                    </div>
                  </form>

                  {/* Separator */}
                  <div className="flex items-center my-6 text-[9px] font-display text-sky-grey/40 uppercase tracking-widest font-semibold">
                    <div className="flex-1 h-[1px] bg-sky-midnight/70" />
                    <span className="px-3">Or choose a demo scenario</span>
                    <div className="flex-1 h-[1px] bg-sky-midnight/70" />
                  </div>

                  {/* Demo scenarios */}
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-sky-midnight">
                    {/* Scenario A */}
                    <motion.div
                      onClick={() => !loadingData && handleDemoSelect("demo-msme-a")}
                      whileHover={!loadingData ? { y: -1.5, borderColor: "#D64545", boxShadow: "0 4px 12px rgba(214,69,69,0.06)" } : {}}
                      whileTap={!loadingData ? { scale: 0.99 } : {}}
                      className="p-3 bg-white border border-sky-midnight rounded-xl flex justify-between items-center cursor-pointer transition-all duration-300 group"
                    >
                      <div className="pr-2 text-left">
                        <h4 className="text-xs font-display font-bold text-sky-cream group-hover:text-sky-crimson transition-colors">Demo A: Mid-Journey (47 Days)</h4>
                        <p className="text-[10px] font-sans text-sky-grey leading-tight mt-0.5">3 actions remaining. Balanced risk profile.</p>
                      </div>
                      <div className="text-[8px] uppercase font-bold text-sky-crimson bg-sky-crimson/10 border border-sky-crimson/20 px-2 py-0.5 rounded-full tracking-wider shrink-0">Demo A</div>
                    </motion.div>

                    {/* Scenario B */}
                    <motion.div
                      onClick={() => !loadingData && handleDemoSelect("demo-msme-b")}
                      whileHover={!loadingData ? { y: -1.5, borderColor: "#00D66B", boxShadow: "0 4px 12px rgba(0,214,107,0.06)" } : {}}
                      whileTap={!loadingData ? { scale: 0.99 } : {}}
                      className="p-3 bg-white border border-sky-midnight rounded-xl flex justify-between items-center cursor-pointer transition-all duration-300 group"
                    >
                      <div className="pr-2 text-left">
                        <h4 className="text-xs font-display font-bold text-sky-cream group-hover:text-sky-gold transition-colors">Demo B: Ready / Pre-Approved (0 Days)</h4>
                        <p className="text-[10px] font-sans text-sky-grey leading-tight mt-0.5">Excellent compliance. Pre-approved loan offer active.</p>
                      </div>
                      <div className="text-[8px] uppercase font-bold text-sky-gold bg-sky-sunset border border-sky-gold/20 px-2 py-0.5 rounded-full tracking-wider shrink-0">Demo B</div>
                    </motion.div>

                    {/* Scenario C */}
                    <motion.div
                      onClick={() => !loadingData && handleDemoSelect("demo-msme-c")}
                      whileHover={!loadingData ? { y: -1.5, borderColor: "#D64545", boxShadow: "0 4px 12px rgba(214,69,69,0.06)" } : {}}
                      whileTap={!loadingData ? { scale: 0.99 } : {}}
                      className="p-3 bg-white border border-sky-midnight rounded-xl flex justify-between items-center cursor-pointer transition-all duration-300 group"
                    >
                      <div className="pr-2 text-left">
                        <h4 className="text-xs font-display font-bold text-sky-cream group-hover:text-sky-crimson transition-colors">Demo C: Compound Risk (133 Days)</h4>
                        <p className="text-[10px] font-sans text-sky-grey leading-tight mt-0.5">Poor GST filing history & high buyer concentration risk.</p>
                      </div>
                      <div className="text-[8px] uppercase font-bold text-sky-crimson bg-sky-crimson/10 border border-sky-crimson/20 px-2 py-0.5 rounded-full tracking-wider shrink-0">Demo C</div>
                    </motion.div>

                    {/* Scenario D */}
                    <motion.div
                      onClick={() => !loadingData && handleDemoSelect("demo-msme-d")}
                      whileHover={!loadingData ? { y: -1.5, borderColor: "#00D66B", boxShadow: "0 4px 12px rgba(0,214,107,0.06)" } : {}}
                      whileTap={!loadingData ? { scale: 0.99 } : {}}
                      className="p-3 bg-white border border-sky-midnight rounded-xl flex justify-between items-center cursor-pointer transition-all duration-300 group"
                    >
                      <div className="pr-2 text-left">
                        <h4 className="text-xs font-display font-bold text-sky-cream group-hover:text-sky-gold transition-colors">Demo D: Close to Ready (12 Days)</h4>
                        <p className="text-[10px] font-sans text-sky-grey leading-tight mt-0.5">No employees (no EPFO data). Needs 1 concentration fix.</p>
                      </div>
                      <div className="text-[8px] uppercase font-bold text-sky-gold bg-sky-sunset border border-sky-gold/20 px-2 py-0.5 rounded-full tracking-wider shrink-0">Demo D</div>
                    </motion.div>

                    {/* Scenario E */}
                    <motion.div
                      onClick={() => !loadingData && handleDemoSelect("demo-msme-e")}
                      whileHover={!loadingData ? { y: -1.5, borderColor: "#00D66B", boxShadow: "0 4px 12px rgba(0,214,107,0.06)" } : {}}
                      whileTap={!loadingData ? { scale: 0.99 } : {}}
                      className="p-3 bg-white border border-sky-midnight rounded-xl flex justify-between items-center cursor-pointer transition-all duration-300 group"
                    >
                      <div className="pr-2 text-left">
                        <h4 className="text-xs font-display font-bold text-sky-cream group-hover:text-sky-gold transition-colors">Demo E: One Blocker (8 Days)</h4>
                        <p className="text-[10px] font-sans text-sky-grey leading-tight mt-0.5">Perfect filing/stability. 1 concentration blocker.</p>
                      </div>
                      <div className="text-[8px] uppercase font-bold text-sky-gold bg-sky-sunset border border-sky-gold/20 px-2 py-0.5 rounded-full tracking-wider shrink-0">Demo E</div>
                    </motion.div>

                    {/* Scenario F */}
                    <motion.div
                      onClick={() => !loadingData && handleDemoSelect("demo-msme-f")}
                      whileHover={!loadingData ? { y: -1.5, borderColor: "#00D66B", boxShadow: "0 4px 12px rgba(0,214,107,0.06)" } : {}}
                      whileTap={!loadingData ? { scale: 0.99 } : {}}
                      className="p-3 bg-white border border-sky-midnight rounded-xl flex justify-between items-center cursor-pointer transition-all duration-300 group"
                    >
                      <div className="pr-2 text-left">
                        <h4 className="text-xs font-display font-bold text-sky-cream group-hover:text-sky-gold transition-colors">Demo F: Seasonal Business (32 Days)</h4>
                        <p className="text-[10px] font-sans text-sky-grey leading-tight mt-0.5">High volatility cashflow but solid underlying business.</p>
                      </div>
                      <div className="text-[8px] uppercase font-bold text-sky-gold bg-sky-sunset border border-sky-gold/20 px-2 py-0.5 rounded-full tracking-wider shrink-0">Demo F</div>
                    </motion.div>
                  </div>

                  <div className="text-center mt-6 text-[9px] font-display text-sky-grey/70 uppercase tracking-widest font-semibold">
                    IDBI Bank National Hackathon 2026 • AI-Powered MSME Card
                  </div>
                </div>
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
                    className={`p-6 bg-sky-card border border-sky-midnight rounded-2xl flex flex-col justify-between h-auto min-h-[20rem] pb-6 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.06)] relative overflow-hidden`}
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

                      {/* Pre-filled data box */}
                      <div className="mt-3.5 p-2.5 bg-sky-dark/50 border border-sky-midnight rounded-xl text-[11px] font-sans text-sky-grey select-none pointer-events-none flex flex-col gap-0.5">
                        <span className="text-[8px] font-display font-extrabold uppercase tracking-widest text-sky-gold">
                          Pre-filled Metric
                        </span>
                        <div className="font-semibold text-sky-cream truncate">
                          {getPreFilledData(src.key)}
                        </div>
                      </div>
                    </div>

                    <motion.button
                      onClick={() => handleLinkSource(src.key)}
                      disabled={isLinked || isLinking}
                      whileHover={!isLinked && !isLinking ? { scale: 1.02 } : {}}
                      whileTap={!isLinked && !isLinking ? { scale: 0.98 } : {}}
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
                    </motion.button>
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