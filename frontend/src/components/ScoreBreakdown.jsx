import React from "react";

export default function ScoreBreakdown({ shapBreakdown, msmeData, daysRemaining = 47 }) {
  if (!shapBreakdown || shapBreakdown.length === 0) return null;

  // Resolve the raw feature value from msmeData using the feature key
  const getFeatureValue = (feature) => {
    if (!msmeData || !feature) return null;
    return msmeData[feature] ?? null;
  };

  const titleText = daysRemaining <= 0 ? "What Got You Here" : "Why This Score";

  return (
    <div className="pt-8 border-t border-sky-midnight mt-8 z-10 relative">
      <div className="text-center md:text-left mb-4">
        <h4 className="text-[11px] font-display uppercase tracking-widest font-extrabold text-sky-grey">
          {titleText}
        </h4>
      </div>
      
      {/* Quiet list of text rows with dot separators */}
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
    </div>
  );
}