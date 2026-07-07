import React, { useState, useEffect } from "react";
import { getMsmeStory } from "../services/api";

export default function ScoreBreakdown({ shapBreakdown, msmeData, daysRemaining = 47, msmeId }) {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!msmeId) return;

    let active = true;
    async function fetchStory() {
      setLoading(true);
      try {
        const res = await getMsmeStory(msmeId);
        if (active) {
          if (res && res.story) {
            setStory(res.story);
          } else {
            setStory(null);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch Bedrock narrative, falling back to SHAP bullets:", err);
        if (active) {
          setStory(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchStory();

    return () => {
      active = false;
    };
  }, [msmeId, shapBreakdown]);

  if (!shapBreakdown || shapBreakdown.length === 0) return null;

  const titleText = daysRemaining <= 0 ? "What Got You Here" : "Why This Score";

  return (
    <div className="pt-8 border-t border-sky-midnight mt-8 z-10 relative w-full">
      <div className="text-center md:text-left mb-4">
        <h4 className="text-[11px] font-display uppercase tracking-widest font-extrabold text-sky-grey">
          {titleText}
        </h4>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-sans text-sky-grey animate-pulse py-1">
          <svg className="animate-spin h-3.5 w-3.5 text-sky-gold" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Analyzing credit story...</span>
        </div>
      ) : story ? (
        <p className="text-sm font-sans text-sky-grey leading-relaxed max-w-3xl text-center md:text-left transition-opacity duration-300">
          {story}
        </p>
      ) : (
        /* Quiet list of text rows with dot separators */
        <div className="flex flex-wrap justify-center md:justify-start items-center gap-y-2 gap-x-4 text-xs font-sans text-sky-grey">
          {shapBreakdown.map((item, index) => (
            <div key={item.feature || index} className="flex items-center gap-2">
              {index > 0 && <span className="text-sky-midnight select-none text-[9px]">•</span>}
              <span className="leading-relaxed">
                <strong className="text-sky-cream font-bold">{item.label}:</strong> {item.reason}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}