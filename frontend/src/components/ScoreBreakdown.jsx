import React from "react";

export default function ScoreBreakdown({ shapBreakdown, msmeData }) {
  if (!shapBreakdown || shapBreakdown.length === 0) return null;

  // Resolve the raw feature value from msmeData using the feature key
  const getFeatureValue = (feature) => {
    if (!msmeData || !feature) return null;
    return msmeData[feature] ?? null;
  };

  // Determine if a metric is operationally healthy based on target thresholds
  const isHealthyMetric = (feature, val) => {
    if (val === null) return false;
    switch (feature) {
      case "filing_on_time_rate":
        return val >= 0.90;
      case "upi_trend_slope":
        return val >= 0.02;
      case "cashflow_volatility_score":
        return val <= 0.15;
      case "top_buyer_concentration_pct":
        return val <= 0.30;
      case "payroll_consistency_score":
        return val >= 0.90 || (val === 0.5 && msmeData && !msmeData.has_employees);
      default:
        return false;
    }
  };

  // Categorize metrics operationally to align perfectly with human reasons
  const strengths = shapBreakdown.filter((item) => isHealthyMetric(item.feature, getFeatureValue(item.feature)));
  const constraints = shapBreakdown.filter((item) => !isHealthyMetric(item.feature, getFeatureValue(item.feature)));

  return (
    <section className="bg-sky-card border border-sky-midnight p-6 rounded-xl shadow-[0_8px_30px_rgba(0,104,74,0.02)] space-y-6">
      
      {/* Panel Header */}
      <div className="border-b border-sky-midnight pb-4">
        <h3 className="text-sm font-display uppercase tracking-widest font-extrabold text-sky-cream">
          Understanding Your Countdown
        </h3>
        <p className="text-xs font-sans text-sky-grey mt-1">
          A plain-language breakdown of the factors impacting your credit readiness rating.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Constraints: Factors holding the business back */}
        {constraints.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-display font-bold text-sky-crimson uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-crimson animate-pulse" />
              Holding You Back
            </h4>
            <div className="space-y-2.5">
              {constraints.map((item, index) => (
                <div 
                  key={item.feature || index}
                  className="p-4 bg-sky-dark border border-sky-midnight rounded-xl flex items-start gap-3.5 hover:border-sky-crimson/30 transition-all duration-300 shadow-sm"
                >
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-sky-crimson/10 flex items-center justify-center text-sky-crimson">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-display uppercase tracking-wider font-extrabold text-sky-cream">
                      {item.label}
                    </h5>
                    <p className="text-xs font-sans text-sky-grey leading-relaxed">
                      {item.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths: Factors helping the business */}
        {strengths.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-display font-bold text-sky-gold uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-gold" />
              Working For You
            </h4>
            <div className="space-y-2.5">
              {strengths.map((item, index) => (
                <div 
                  key={item.feature || index}
                  className="p-4 bg-sky-dark border border-sky-midnight rounded-xl flex items-start gap-3.5 hover:border-sky-gold/30 transition-all duration-300 shadow-sm"
                >
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-sky-sunset flex items-center justify-center text-sky-gold">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-display uppercase tracking-wider font-extrabold text-sky-cream">
                      {item.label}
                    </h5>
                    <p className="text-xs font-sans text-sky-grey leading-relaxed">
                      {item.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}