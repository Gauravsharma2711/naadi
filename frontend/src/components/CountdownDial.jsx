import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CountdownDial({ daysRemaining = 47, maxDays = 90, probability }) {
  // Safe bounds check
  const safeMaxDays = maxDays > 0 ? maxDays : 90;
  const safeDaysRemaining = Math.max(0, Math.min(daysRemaining, safeMaxDays));
  
  // Progress ratio (getting closer to 0 days = closer to 1.0)
  const progress = 1.0 - safeDaysRemaining / safeMaxDays;

  // Derive probability if not supplied (for standalone / mock rendering)
  const activeProbability = probability !== undefined ? probability : progress;

  // Circle geometry for the Growth Ring
  const radius = 70;
  const circumference = 2 * Math.PI * radius; // Approx 439.82
  const strokeDashoffset = circumference * (1.0 - progress);

  // Growth stage config (Sprout theme)
  let stageName = "Seedling";
  let stageColor = "text-sky-grey";
  let ringColor = "url(#growthGrad)";
  let haloGlow = "rgba(209, 250, 229, 0.15)"; // Soft pale sprout glow (#D1FAE5)
  
  if (activeProbability >= 0.75) {
    stageName = "Blooming";
    stageColor = "text-sky-gold";
    haloGlow = "rgba(0, 104, 74, 0.08)"; // Deep forest green glow (#00684A)
  } else if (activeProbability >= 0.35) {
    stageName = "Sprouting";
    stageColor = "text-sky-amethyst";
    haloGlow = "rgba(0, 237, 100, 0.06)"; // Spring green glow (#00ED64)
  }

  // Smooth numeric counter animation state
  const [displayCount, setDisplayCount] = useState(safeDaysRemaining);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayCount((prev) => {
        if (prev < safeDaysRemaining) {
          return Math.min(prev + 1, safeDaysRemaining);
        } else if (prev > safeDaysRemaining) {
          return Math.max(prev - 1, safeDaysRemaining);
        }
        clearInterval(interval);
        return prev;
      });
    }, 12);

    return () => clearInterval(interval);
  }, [safeDaysRemaining]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-sky-card rounded-2xl border border-sky-midnight shadow-[0_8px_30px_rgba(0,104,74,0.02)] relative overflow-hidden h-[330px] w-full">
      
      {/* Soft circular halo glow representing growth vitality */}
      <div 
        className="absolute w-[260px] h-[260px] rounded-full blur-[60px] pointer-events-none transition-all duration-1000 -top-6"
        style={{
          background: haloGlow,
        }}
      />

      {/* Leaf Growth Ring Circular Gauge */}
      <div className="w-[180px] h-[180px] relative flex items-center justify-center">
        <svg 
          viewBox="0 0 160 160" 
          className="w-full h-full overflow-visible -rotate-90"
        >
          <defs>
            {/* Gradient that transitions from Sprout Green (#D1FAE5) to Spring Green (#00ED64) to Forest Green (#00684A) */}
            <linearGradient id="growthGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D1FAE5" /> {/* Pale Sprout */}
              <stop offset="50%" stopColor="#00ED64" /> {/* Spring Green */}
              <stop offset="100%" stopColor="#00684A" /> {/* Deep Forest */}
            </linearGradient>
          </defs>

          {/* Concentric Tree Growth Rings (Abstract Background) */}
          <circle cx="80" cy="80" r="50" fill="none" stroke="#E2E8E5" strokeWidth="0.5" opacity="0.3" />
          <circle cx="80" cy="80" r="60" fill="none" stroke="#E2E8E5" strokeWidth="0.5" opacity="0.3" />

          {/* Background Track Arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#E2E8E5"
            strokeWidth="6"
          />

          {/* Growing Progress Ring (Leaf Outline) */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>

        {/* Text inside the Leaf Growth Ring */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <div className="flex items-baseline">
            <motion.span 
              key={displayCount}
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-5xl font-display font-bold text-sky-cream leading-none tracking-tight"
            >
              {displayCount}
            </motion.span>
            <span className="text-sm font-outfit text-sky-grey ml-0.5 font-bold tracking-wider uppercase">d</span>
          </div>
          <span className="text-[9px] font-outfit text-sky-grey uppercase tracking-widest font-extrabold mt-1">
            until ready
          </span>
        </div>
      </div>

      {/* Probability Badge */}
      <div className="mt-4 flex items-center gap-1.5 bg-sky-dark px-4 py-1.5 rounded-full border border-sky-midnight relative z-10 shadow-sm">
        <span className={`h-1.5 w-1.5 rounded-full ${activeProbability >= 0.75 ? 'bg-sky-gold' : 'bg-sky-sunset'} animate-pulse`} />
        <span className="text-[10px] font-outfit text-sky-grey font-bold uppercase tracking-wider">
          Probability: <strong className={`${stageColor} font-extrabold`}>{(activeProbability * 100).toFixed(1)}%</strong>
        </span>
        <span className={`text-[9px] uppercase tracking-widest font-extrabold ml-1 px-1.5 py-0.5 rounded-full bg-sky-sunset ${stageColor}`}>
          {stageName}
        </span>
      </div>
      
    </div>
  );
}