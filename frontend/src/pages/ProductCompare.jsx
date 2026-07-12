import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AmbientBackground from "../components/AmbientBackground";
import CountdownDial from "../components/CountdownDial";
import { getMsmeProducts } from "../services/api";

export default function ProductCompare({ msmeId, onBack, businessName }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productsData, setProductsData] = useState(null);

  useEffect(() => {
    let active = true;

    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const data = await getMsmeProducts(msmeId);
        if (active) {
          setProductsData(data);
        }
      } catch (err) {
        if (active) {
          console.error(err);
          setError("Could not retrieve loan products data. Please check backend server.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      active = false;
    };
  }, [msmeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-dark flex flex-col justify-center items-center font-sans select-none">
        <svg className="animate-spin h-10 w-10 text-sky-gold mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm font-display text-sky-grey tracking-wider uppercase font-semibold">
          Evaluating Product Eligibility...
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
            Evaluation Error
          </h2>
          <p className="text-xs text-sky-grey leading-relaxed">
            {error}
          </p>
          <button
            onClick={onBack}
            className="w-full py-3.5 bg-sky-gold hover:bg-[#00523A] text-white rounded-full font-display font-extrabold text-xs uppercase tracking-widest transition-all duration-300 shadow-md shadow-sky-gold/15"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { working_capital, term_loan } = productsData;

  return (
    <div className="min-h-screen bg-transparent px-6 py-12 relative overflow-x-hidden font-sans select-none text-sky-cream w-full">
      <AmbientBackground />

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
              <h2 className="text-sm font-display uppercase tracking-widest font-extrabold text-sky-cream leading-tight">
                Din <span className="text-[10px] font-display font-bold text-sky-gold uppercase tracking-widest bg-sky-sunset px-2 py-0.5 rounded ml-1 border border-sky-gold/10">Product Comparison</span>
              </h2>
              <p className="text-[9px] font-display text-sky-grey uppercase tracking-widest mt-1">
                {(() => {
                  const names = {
                    "demo-msme-a": "Retail Dynamics (A)",
                    "demo-msme-b": "Surya Agro Traders (B)",
                    "demo-msme-c": "Vedic Garments (C)",
                    "demo-msme-d": "Hind Plastics (D)",
                    "demo-msme-e": "Apex Enterprises (E)",
                    "demo-msme-f": "Mehra Seasonal Goods (F)"
                  };
                  return names[msmeId] || msmeId.toUpperCase();
                })()}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto flex justify-between sm:justify-end items-center gap-2">
            <span className="text-[9px] font-display font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border bg-sky-sunset text-sky-gold border-sky-gold/20">
              Multi-Product Rating
            </span>
          </div>
        </header>

        {/* Side by Side Product Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Working Capital Loan Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center bg-sky-card border border-sky-midnight p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] space-y-6"
          >
            <div className="w-full text-center md:text-left border-b border-sky-midnight pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-display font-extrabold text-sky-cream uppercase tracking-wider">
                  {working_capital.name}
                </h3>
                <p className="text-[9px] font-display text-sky-grey uppercase tracking-widest mt-1">
                  Short-Term Liquidity Support
                </p>
              </div>
              <div>
                {working_capital.status === "Ready" ? (
                  <span className="text-[8px] uppercase font-bold text-[#00D66B] bg-[#00D66B]/10 border border-[#00D66B]/20 px-2 py-0.5 rounded-full">
                    Ready
                  </span>
                ) : working_capital.status === "Almost Eligible" ? (
                  <span className="text-[8px] uppercase font-bold text-sky-gold bg-sky-sunset border border-sky-gold/20 px-2 py-0.5 rounded-full">
                    Almost Eligible
                  </span>
                ) : (
                  <span className="text-[8px] uppercase font-bold text-sky-grey bg-sky-midnight border border-sky-midnight px-2 py-0.5 rounded-full">
                    In-Progress
                  </span>
                )}
              </div>
            </div>

            <CountdownDial
              daysRemaining={working_capital.days_remaining}
              maxDays={90}
              probability={working_capital.probability}
            />

            <div className="w-full space-y-3 p-4 bg-sky-dark/40 border border-sky-midnight rounded-xl text-xs font-sans text-sky-grey">
              <div className="flex justify-between border-b border-sky-midnight/40 pb-2">
                <span>Maximum Limit</span>
                <span className="text-sky-cream font-bold">{working_capital.limit}</span>
              </div>
              <div className="flex justify-between border-b border-sky-midnight/40 pb-2">
                <span>Facility Tenure</span>
                <span className="text-sky-cream font-semibold">{working_capital.tenure}</span>
              </div>
              <div className="flex justify-between border-b border-sky-midnight/40 pb-2">
                <span>Eligibility Threshold</span>
                <span className="text-sky-gold font-semibold">{(working_capital.threshold * 100).toFixed(0)}% Probability</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Days Remaining</span>
                <span className={`font-bold ${working_capital.days_remaining === 0 ? "text-[#00D66B]" : "text-sky-gold"}`}>
                  {working_capital.days_remaining === 0 ? "Eligible" : `${working_capital.days_remaining} Days`}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-sky-grey leading-relaxed text-left w-full">
              Working Capital Loans use a relaxed threshold (<strong>60.0%</strong> readiness) designed for short-term operational expenses. Your digital UPI flows and sales velocity position you well for immediate disbursement with minimal backlog.
            </p>
          </motion.div>

          {/* Term Loan Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center bg-sky-card border border-sky-midnight p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] space-y-6"
          >
            <div className="w-full text-center md:text-left border-b border-sky-midnight pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-display font-extrabold text-sky-cream uppercase tracking-wider">
                  {term_loan.name}
                </h3>
                <p className="text-[9px] font-display text-sky-grey uppercase tracking-widest mt-1">
                  Long-Term Asset/Expansion Financing
                </p>
              </div>
              <div>
                {term_loan.status === "Ready" ? (
                  <span className="text-[8px] uppercase font-bold text-[#00D66B] bg-[#00D66B]/10 border border-[#00D66B]/20 px-2 py-0.5 rounded-full">
                    Ready
                  </span>
                ) : (
                  <span className="text-[8px] uppercase font-bold text-sky-grey bg-sky-midnight border border-sky-midnight px-2 py-0.5 rounded-full">
                    In-Progress
                  </span>
                )}
              </div>
            </div>

            <CountdownDial
              daysRemaining={term_loan.days_remaining}
              maxDays={180}
              probability={term_loan.probability}
            />

            <div className="w-full space-y-3 p-4 bg-sky-dark/40 border border-sky-midnight rounded-xl text-xs font-sans text-sky-grey">
              <div className="flex justify-between border-b border-sky-midnight/40 pb-2">
                <span>Maximum Limit</span>
                <span className="text-sky-cream font-bold">{term_loan.limit}</span>
              </div>
              <div className="flex justify-between border-b border-sky-midnight/40 pb-2">
                <span>Facility Tenure</span>
                <span className="text-sky-cream font-semibold">{term_loan.tenure}</span>
              </div>
              <div className="flex justify-between border-b border-sky-midnight/40 pb-2">
                <span>Eligibility Threshold</span>
                <span className="text-sky-gold font-semibold">{(term_loan.threshold * 100).toFixed(1)}% Probability</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Days Remaining</span>
                <span className={`font-bold ${term_loan.days_remaining === 0 ? "text-[#00D66B]" : "text-sky-gold"}`}>
                  {term_loan.days_remaining === 0 ? "Eligible" : `${term_loan.days_remaining} Days`}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-sky-grey leading-relaxed text-left w-full">
              Term Loans require a stricter compliance baseline (<strong>75.0%</strong> readiness) due to higher credit limits and longer durations. These evaluate structural compliance, including top buyer diversification and EPFO payroll stability.
            </p>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
