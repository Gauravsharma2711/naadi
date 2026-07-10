import React, { useState } from "react";
import { motion } from "framer-motion";
import AmbientBackground from "../components/AmbientBackground";
import CountdownDial from "../components/CountdownDial";
import ScoreBreakdown from "../components/ScoreBreakdown";
import { getMsmeReport } from "../services/api";
import html2canvas from "html2canvas";

const BUSINESS_NAMES = {
  "demo-msme-a": "Retail Dynamics (A)",
  "demo-msme-b": "Surya Agro Traders (B)",
  "demo-msme-c": "Vedic Garments (C)",
  "demo-msme-d": "Hind Plastics (D)",
  "demo-msme-e": "Apex Enterprises (E)",
  "demo-msme-f": "Mehra Seasonal Goods (F)"
};

const sumASCII = (str) => str.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

const getBusinessName = (id) => {
  if (BUSINESS_NAMES[id]) return BUSINESS_NAMES[id];
  const sum = sumASCII(id);
  const prefixes = ["Krishna", "Maruti", "Bajrang", "Ganesh", "Sai", "Balaji"];
  const suffixes = ["Enterprises", "Industries", "Logistics", "Ventures", "Traders", "Foods"];
  return `${prefixes[sum % prefixes.length]} ${suffixes[(sum >> 2) % suffixes.length]} (${id.slice(0, 4)})`;
};

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
    <motion.button
      onClick={handleDownload}
      disabled={downloading}
      whileHover={!downloading ? { scale: 1.02, backgroundColor: "rgba(184,232,200,0.15)" } : {}}
      whileTap={!downloading ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
      className="w-full py-3 border border-sky-gold text-sky-gold hover:text-[#00b056] font-sans font-bold text-xs uppercase tracking-widest transition-all duration-300 rounded-xl mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </motion.button>
  );
}

export default function ReadyState({ msmeId, onBack, probability, shapBreakdown, msmeData }) {
  const certificateRef = React.useRef(null);
  const [currencyFormat, setCurrencyFormat] = useState("lakhs");

  const formatCurrency = (val) => {
    return currencyFormat === "lakhs" ? "₹10,00,000" : "₹1,000,000";
  };

  const handleApply = () => {
    alert("Application submitted successfully! Your funds are being disbursed.");
  };

  const handleDownloadCertificate = async () => {
    if (!certificateRef.current) return;
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FFFFFF",
        logging: false
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${msmeId}-loan-readiness-certificate.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to generate certificate image:", err);
      alert("Failed to download image. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-transparent px-6 py-12 relative overflow-hidden font-sans select-none text-sky-cream w-full">
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

        {/* Two-Column split on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
          
          {/* Left Column: Blooming countdown dial & Shareable Certificate */}
          <main className="md:col-span-3 space-y-6 w-full flex flex-col items-center">
            <div className="flex justify-center w-full">
              <CountdownDial 
                daysRemaining={0} 
                maxDays={180} 
                probability={probability} 
              />
            </div>

            {/* Shareable Success Certificate */}
            <div className="w-full max-w-sm space-y-4">
              <div ref={certificateRef} className="p-8 bg-white border-2 border-[#B8E8C8] rounded-2xl shadow-lg text-[#001E2B] space-y-6 relative overflow-hidden select-none">
                {/* Inner certificate border */}
                <div className="absolute inset-2 border border-[#B8E8C8]/30 rounded-xl pointer-events-none" />
                
                {/* Logo & Partner Badge */}
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl">🌱</span>
                    <span className="font-display font-black text-xs uppercase tracking-widest text-[#001E2B]">
                      Din <span className="text-[#00D66B]">MSME</span>
                    </span>
                  </div>
                  <span className="text-[8px] font-sans font-bold text-sky-grey uppercase tracking-widest px-2 py-0.5 rounded-full border border-sky-midnight/10 bg-[#F3F4F3]">
                    Verified IDBI Partner
                  </span>
                </div>

                {/* Main Certificate Stamp */}
                <div className="text-center py-6 space-y-4 relative z-10">
                  <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                    <span className="text-9xl">🌱</span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[9px] font-display font-extrabold uppercase tracking-widest text-[#00D66B]">
                      CREDIT-READINESS STATUS
                    </p>
                    <h4 className="text-base font-display font-black uppercase tracking-wider text-[#001E2B]">
                      LOAN-READY CERTIFIED
                    </h4>
                  </div>

                  <div className="py-3 border-t border-b border-[#E3E1DE]/60 space-y-1">
                    <p className="text-[10px] font-sans text-sky-grey font-semibold">BUSINESS NAME</p>
                    <p className="text-xs font-display font-extrabold text-[#001E2B]">{getBusinessName(msmeId)}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-sans text-sky-grey font-semibold">APPROVED FACILITY LIMIT</p>
                    <p className="text-2xl font-display font-black text-[#00D66B]">
                      {formatCurrency(1000000)}
                    </p>
                  </div>
                </div>

                {/* Bottom Hashes & Seals */}
                <div className="flex justify-between items-end border-t border-[#E3E1DE]/40 pt-4 text-[8px] font-mono text-sky-grey relative z-10">
                  <div>
                    <p>SYSTEM RESOLUTION HASH</p>
                    <p className="font-bold text-[#001E2B]">{`DIN-${msmeId.toUpperCase()}-${Math.abs(sumASCII(msmeId)).toString(16).toUpperCase()}`}</p>
                  </div>
                  <div className="text-right">
                    <p>ISSUED DATE</p>
                    <p className="font-bold text-[#001E2B]">11-Jul-2026</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <motion.button
                onClick={handleDownloadCertificate}
                whileHover={{ scale: 1.02, backgroundColor: "#A7D7B7" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full py-3 bg-[#B8E8C8] hover:bg-[#A7D7B7] text-[#001E2B] rounded-xl font-sans font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Shareable Card
              </motion.button>
            </div>
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
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-display font-extrabold text-sky-cream">
                      {formatCurrency(1000000)}
                    </span>
                    {/* Toggle */}
                    <div className="flex gap-1 bg-sky-dark p-0.5 rounded border border-sky-midnight/60">
                      <button 
                        onClick={() => setCurrencyFormat("lakhs")}
                        className={`px-1.5 py-0.5 text-[8px] font-display font-extrabold uppercase tracking-wider rounded transition-all duration-200 ${currencyFormat === "lakhs" ? "bg-sky-gold text-white" : "text-sky-grey hover:text-sky-cream"}`}
                      >
                        Lakhs
                      </button>
                      <button 
                        onClick={() => setCurrencyFormat("full")}
                        className={`px-1.5 py-0.5 text-[8px] font-display font-extrabold uppercase tracking-wider rounded transition-all duration-200 ${currencyFormat === "full" ? "bg-sky-gold text-white" : "text-sky-grey hover:text-sky-cream"}`}
                      >
                        Full
                      </button>
                    </div>
                  </div>
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

              <motion.button
                onClick={handleApply}
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,214,107,0.15)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full py-3.5 bg-sky-gold hover:bg-[#00b056] text-white rounded-xl font-sans font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_8px_20px_rgba(0,214,107,0.15)]"
              >
                Apply Now
              </motion.button>

              {/* Download Report Button (Secondary/Ghost style from DESIGN_SYSTEM.md) */}
              <DownloadReportButton msmeId={msmeId} />
            </motion.div>

            {/* Nearest Branch Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="p-6 bg-sky-card border border-sky-midnight rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-display font-bold text-sky-gold uppercase tracking-widest bg-sky-sunset px-2.5 py-0.5 rounded border border-sky-gold/10">
                    Nearest Branch
                  </span>
                  <h4 className="text-sm font-display font-extrabold text-sky-cream mt-2.5 leading-tight">
                    IDBI Bank, Andheri East
                  </h4>
                </div>
                <span className="text-[10px] font-sans font-bold text-sky-cream bg-sky-sunset px-2.5 py-0.5 rounded-full border border-sky-gold/20">
                  1.2 km away
                </span>
              </div>

              {/* Mock Map Visualizer */}
              <div className="h-[120px] w-full rounded-xl overflow-hidden border border-sky-midnight relative bg-[#F7F9F8]">
                {/* SVG mock map */}
                <svg className="w-full h-full opacity-70" viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg">
                  <rect width="300" height="120" fill="#FBFBFA" />
                  {/* Grid Lines representing Roads */}
                  <line x1="0" y1="40" x2="300" y2="40" stroke="#E3E1DE" strokeWidth="8" />
                  <line x1="0" y1="85" x2="300" y2="85" stroke="#E3E1DE" strokeWidth="6" />
                  <line x1="80" y1="0" x2="80" y2="120" stroke="#E3E1DE" strokeWidth="8" />
                  <line x1="220" y1="0" x2="220" y2="120" stroke="#E3E1DE" strokeWidth="6" />
                  {/* Green route line */}
                  <path d="M 80 85 L 150 85 L 150 40 L 220 40" fill="none" stroke="#00D66B" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" />
                  {/* Accent parks/areas */}
                  <rect x="92" y="8" width="60" height="24" rx="4" fill="#B8E8C8" opacity="0.35" />
                  <rect x="230" y="50" width="60" height="28" rx="4" fill="#B8E8C8" opacity="0.35" />
                </svg>
                {/* Pin Overlay at intersection point */}
                <div className="absolute top-[40px] left-[150px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="relative flex h-5 w-5 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-gold opacity-75"></span>
                    <span className="relative rounded-full h-3 w-3 bg-sky-gold border-2 border-white flex items-center justify-center shadow-md animate-pulse"></span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-xs font-sans text-sky-grey leading-relaxed">
                <p className="font-semibold text-sky-cream">Address:</p>
                <p>Mittal Commercial, Andheri Kurla Road,</p>
                <p>Andheri East, Mumbai, Maharashtra 400059</p>
                <p className="text-[10px] mt-2 block text-sky-grey font-medium">Hours: Mon-Sat • 10:00 AM - 4:00 PM</p>
              </div>
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
