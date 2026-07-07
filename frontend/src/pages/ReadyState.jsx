import React, { useState } from "react";
import { motion } from "framer-motion";
import AmbientBackground from "../components/AmbientBackground";
import CountdownDial from "../components/CountdownDial";
import ScoreBreakdown from "../components/ScoreBreakdown";
import { getMsmeReport } from "../services/api";

function DownloadReportButton({ msmeId }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const result = await getMsmeReport(msmeId);
      if (result && result.report_url) {
        window.open(result.report_url, "_blank");
      } else {
        alert("Could not generate report URL");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to download report: " + err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="w-full py-3 border border-sky-gold hover:bg-sky-sunset/15 text-sky-gold hover:text-[#00b056] font-display font-extrabold text-xs uppercase tracking-widest transition-all duration-300 rounded-xl mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {downloading ? (
        <>
          <svg className="animate-spin h-4 w-4 text-sky-gold" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Generating Report...
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Report
        </>
      )}
    </button>
  );
}

export default function ReadyState({ msmeId, onBack, probability, shapBreakdown, msmeData }) {
  const handleApply = () => {
    alert("Application submitted successfully! Your funds are being disbursed.");
  };

  return (
    <div className="min-h-screen bg-sky-dark px-6 py-12 relative overflow-hidden font-sans select-none text-sky-cream w-full">
      {/* Ambient background with leaf/growth-ring drift animations */}
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
                Din <span className="text-[10px] font-display font-bold text-sky-gold uppercase tracking-widest bg-sky-sunset px-2 py-0.5 rounded ml-1 border border-sky-gold/10">Dashboard</span>
              </h2>
              <p className="text-[9px] font-display text-sky-grey uppercase tracking-widest mt-1">
                Business ID: <strong className="text-sky-cream">{msmeId}</strong>
              </p>
            </div>
          </div>
          
          <div className="text-right flex items-center gap-2">
            <span className="text-[10px] font-display text-sky-grey font-semibold uppercase tracking-widest hidden sm:inline">
              Status: 
            </span>
            <span className="text-[9px] font-display font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border bg-sky-sunset text-sky-gold border-sky-gold/20 animate-pulse">
              Credit Ready
            </span>
          </div>
        </header>

        {/* Two-Column split on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
          
          {/* Left Column: Blooming countdown dial */}
          <main className="md:col-span-3 flex justify-center w-full">
            <CountdownDial 
              daysRemaining={0} 
              maxDays={180} 
              probability={probability} 
            />
          </main>

          {/* Right Column: Pre-approved Offer details */}
          <section className="md:col-span-2 space-y-4 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="p-6 bg-sky-card border border-sky-midnight rounded-2xl shadow-[0_8px_20px_rgba(0,214,107,0.06)] hover:shadow-[0_8px_20px_rgba(0,214,107,0.12)] space-y-6 relative overflow-hidden transition-all duration-300"
            >
              {/* Visual success top bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-sky-gold" />
              
              <div>
                <span className="text-2xl">🌱</span>
                <h3 className="text-lg font-display uppercase tracking-wider font-extrabold text-sky-cream mt-2">
                  Pre-Approved Loan Offer
                </h3>
                <p className="text-xs font-sans text-sky-grey mt-2 leading-relaxed">
                  Congratulations! Your business has achieved excellent compliance benchmarks and has been classified as credit-ready.
                </p>
              </div>

              <div className="border-t border-b border-sky-midnight py-4 my-2 flex justify-between items-center">
                <div>
                  <span className="text-2xl font-display font-extrabold text-sky-cream">₹10,00,000</span>
                  <p className="text-[10px] font-display text-sky-grey uppercase tracking-widest font-extrabold mt-0.5">Approved Limit</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-display font-extrabold text-sky-gold">11.5%</span>
                  <p className="text-[10px] font-display text-sky-grey uppercase tracking-widest font-extrabold mt-0.5">Annual APR</p>
                </div>
              </div>

              <div className="space-y-2 text-xs font-sans text-sky-grey">
                <div className="flex justify-between">
                  <span>Tenure</span>
                  <span className="text-sky-cream font-semibold">24 Months</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fee</span>
                  <span className="text-sky-cream font-semibold">0% (Hackathon Waiver)</span>
                </div>
                <div className="flex justify-between">
                  <span>Collateral Requirement</span>
                  <span className="text-sky-cream font-semibold">Zero / Clean Unsecured</span>
                </div>
              </div>

              <button
                onClick={handleApply}
                className="w-full py-3.5 bg-sky-gold hover:bg-[#00b056] text-white rounded-xl font-display font-extrabold text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_8px_20px_rgba(0,214,107,0.15)] hover:scale-[1.02] hover:shadow-[0_8px_20px_rgba(0,214,107,0.22)]"
              >
                Apply Now
              </button>

              {/* Download Report Button (Secondary/Ghost style from DESIGN_SYSTEM.md) */}
              <DownloadReportButton msmeId={msmeId} />
            </motion.div>
          </section>

        </div>

        {/* Quiet Bottom SHAP Breakdown Section */}
        {shapBreakdown.length > 0 && (
          <ScoreBreakdown 
            shapBreakdown={shapBreakdown} 
            msmeData={msmeData}
            daysRemaining={0}
            msmeId={msmeId}
          />
        )}
      </div>
    </div>
  );
}
