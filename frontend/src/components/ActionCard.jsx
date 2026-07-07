import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

export default function ActionCard({ action, daysSaved, reason, featureId, onComplete, isCompleted }) {
  const [isCompleting, setIsCompleting] = useState(false);
  const completingRef = useRef(false);

  const handleComplete = async () => {
    if (isCompleted || completingRef.current) return;
    completingRef.current = true;
    setIsCompleting(true);
    try {
      await onComplete(featureId);
    } catch (e) {
      console.error(e);
      completingRef.current = false;
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={!isCompleted && !isCompleting ? { y: -3, scale: 1.01, boxShadow: "0 8px 20px rgba(0,0,0,0.06)" } : {}}
      transition={{ duration: 0.3 }}
      className={`p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 relative overflow-hidden ${
        isCompleted
          ? "bg-sky-gold/5 border border-sky-midnight opacity-65"
          : "bg-sky-card border border-sky-midnight shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
      }`}
    >
      {/* Decorative vertical line representing MongoDB growth leaf vein */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isCompleted ? 'bg-sky-grey/30' : 'bg-sky-gold'}`} />

      {/* Action Content */}
      <div className="flex-1 pl-2">
        <h4 className={`text-sm font-display uppercase tracking-wider font-extrabold ${isCompleted ? 'text-sky-grey line-through' : 'text-sky-cream'}`}>
          {action}
        </h4>
        <p className="text-xs font-sans text-sky-grey mt-1">
          <strong className="text-sky-gold font-bold">Why?</strong> {reason}
        </p>
      </div>

      {/* Days Saved & Action Button */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t border-sky-midnight md:border-none pt-3 md:pt-0">
        <div className="flex flex-col items-center md:items-end">
          <span className={`text-2xl font-display font-bold leading-none ${isCompleted ? 'text-sky-grey' : 'text-sky-gold'}`}>
            -{daysSaved}
          </span>
          <span className="text-[8px] font-display text-sky-grey uppercase tracking-widest font-extrabold mt-0.5">
            days saved
          </span>
        </div>

        <motion.button
          onClick={handleComplete}
          disabled={isCompleting || isCompleted}
          whileHover={!isCompleting && !isCompleted ? { scale: 1.02, boxShadow: "0 8px 20px rgba(0,214,107,0.15)" } : {}}
          whileTap={!isCompleting && !isCompleted ? { scale: 0.98 } : {}}
          transition={{ duration: 0.2 }}
          className={`px-5 py-2.5 rounded-xl font-display text-[9px] font-extrabold tracking-widest uppercase transition-colors duration-300 ${
            isCompleted
              ? "bg-sky-sunset/30 text-sky-gold border border-sky-gold/15 cursor-not-allowed"
              : isCompleting
              ? "bg-sky-dark text-sky-grey border border-sky-midnight cursor-not-allowed"
              : "bg-sky-gold hover:bg-[#00b056] text-white shadow-sm"
          }`}
        >
          {isCompleted ? (
            <span className="flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Done
            </span>
          ) : isCompleting ? (
            <span className="flex items-center gap-1.5">
              <svg className="animate-spin h-3.5 w-3.5 text-sky-grey" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </span>
          ) : (
            "Complete"
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}