import React from "react";
import { motion } from "framer-motion";

export default function AmbientBackground({ daysRemaining = 47 }) {
  // Slow down the animation cycle as daysRemaining goes to 0 (credit-ready success)
  const isReady = daysRemaining <= 0;
  const baseDuration = isReady ? 45 : 25; // 45 seconds when ready, 25 seconds when growing

  // Configurations for 4 distinct drifting leaves
  const leaves = [
    { id: 1, left: "5%", size: 60, delay: 0, durationOffset: 0 },
    { id: 2, left: "15%", size: 40, delay: 8, durationOffset: 5 },
    { id: 3, right: "8%", size: 50, delay: 4, durationOffset: 2 },
    { id: 4, right: "18%", size: 45, delay: 12, durationOffset: 7 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
      
      {/* ── Group 1: Concentric Growth-Rings (Breathing in Corners) ── */}
      {/* Top Right Corner Rings */}
      <svg
        className="absolute -top-16 -right-16 w-80 h-80 text-sky-sunset opacity-[0.25]"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
      >
        <motion.circle
          cx="200"
          cy="0"
          r="100"
          strokeWidth="0.75"
          strokeDasharray="4 6"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx="200"
          cy="0"
          r="150"
          strokeWidth="0.5"
          strokeDasharray="6 8"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.circle
          cx="200"
          cy="0"
          r="180"
          strokeWidth="0.5"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </svg>

      {/* Bottom Left Corner Rings */}
      <svg
        className="absolute -bottom-24 -left-24 w-96 h-96 text-sky-sunset opacity-[0.18]"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
      >
        <motion.circle
          cx="0"
          cy="200"
          r="120"
          strokeWidth="0.75"
          strokeDasharray="5 5"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx="0"
          cy="200"
          r="170"
          strokeWidth="0.5"
          strokeDasharray="8 10"
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
        <motion.circle
          cx="0"
          cy="200"
          r="210"
          strokeWidth="0.5"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </svg>

      {/* ── Group 2: Drifting Leaf Silhouettes ── */}
      {leaves.map((leaf) => {
        const duration = baseDuration + leaf.durationOffset;
        return (
          <motion.div
            key={leaf.id}
            style={{
              position: "absolute",
              bottom: "-10%",
              left: leaf.left,
              right: leaf.right,
              width: leaf.size,
              height: leaf.size,
            }}
            initial={{ y: 0, x: 0, opacity: 0, rotate: 0 }}
            animate={{
              y: ["0vh", "-120vh"],
              x: [0, 15, -15, 10, 0],
              opacity: [0, 0.18, 0.18, 0],
              rotate: [0, 10, -10, 5, 0],
            }}
            transition={{
              duration: duration,
              delay: leaf.delay,
              repeat: Infinity,
              ease: "linear",
            }}
            className="text-sky-gold/30"
          >
            <svg
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              className="w-full h-full"
            >
              {/* Detailed leaf skeleton path */}
              <path
                d="M50 10 C25 35, 25 65, 50 90 C75 65, 75 35, 50 10 Z"
                strokeWidth="1.2"
              />
              <path d="M50 10 L50 90" strokeWidth="0.75" />
              <path d="M50 30 L30 45" strokeWidth="0.5" />
              <path d="M50 45 L30 60" strokeWidth="0.5" />
              <path d="M50 60 L30 75" strokeWidth="0.5" />
              <path d="M50 30 L70 45" strokeWidth="0.5" />
              <path d="M50 45 L70 60" strokeWidth="0.5" />
              <path d="M50 60 L70 75" strokeWidth="0.5" />
            </svg>
          </motion.div>
        );
      })}

      {/* ── Overlay: Subtle Technical Grid ── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#E3E1DE_1px,transparent_1px),linear-gradient(to_bottom,#E3E1DE_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.15]" />
    </div>
  );
}
