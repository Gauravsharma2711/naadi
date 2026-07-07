import React from "react";
import { motion } from "framer-motion";

export default function AmbientBackground() {
  // 8 floating elements: 4 leaves, 4 growth-rings
  const items = [
    {
      id: 1,
      type: "leaf",
      left: "5%",
      size: 55,
      delay: 0,
      duration: 26,
      color: "text-sky-sunset", // Sprout Green
      xPath: [0, 25, -15, 10, 0]
    },
    {
      id: 2,
      type: "ring",
      left: "18%",
      size: 50,
      delay: 5,
      duration: 34,
      color: "text-sky-gold", // Primary Green
      xPath: [0, -20, 20, -10, 0]
    },
    {
      id: 3,
      type: "leaf",
      left: "32%",
      size: 60,
      delay: 2,
      duration: 29,
      color: "text-sky-gold", // Primary Green
      xPath: [0, 15, -25, 20, 0]
    },
    {
      id: 4,
      type: "ring",
      left: "45%",
      size: 45,
      delay: 8,
      duration: 38,
      color: "text-sky-sunset", // Sprout Green
      xPath: [0, -15, 15, -20, 0]
    },
    {
      id: 5,
      type: "leaf",
      left: "58%",
      size: 50,
      delay: 4,
      duration: 23,
      color: "text-sky-sunset", // Sprout Green
      xPath: [0, 20, -10, 25, 0]
    },
    {
      id: 6,
      type: "ring",
      left: "72%",
      size: 55,
      delay: 11,
      duration: 31,
      color: "text-sky-gold", // Primary Green
      xPath: [0, -25, 15, -15, 0]
    },
    {
      id: 7,
      type: "leaf",
      left: "85%",
      size: 48,
      delay: 1,
      duration: 36,
      color: "text-sky-gold", // Primary Green
      xPath: [0, 10, -20, 10, 0]
    },
    {
      id: 8,
      type: "ring",
      left: "93%",
      size: 52,
      delay: 7,
      duration: 21,
      color: "text-sky-sunset", // Sprout Green
      xPath: [0, -10, 25, -20, 0]
    }
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {/* ── Corner Ambient Rings (Very low opacity background depth) ── */}
      <svg
        className="absolute -top-24 -right-24 w-96 h-96 text-sky-sunset opacity-[0.04]"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="200" cy="0" r="100" strokeWidth="0.75" strokeDasharray="4 6" />
        <circle cx="200" cy="0" r="150" strokeWidth="0.5" strokeDasharray="6 8" />
        <circle cx="200" cy="0" r="190" strokeWidth="0.5" />
      </svg>
      <svg
        className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] text-sky-sunset opacity-[0.04]"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="0" cy="200" r="120" strokeWidth="0.75" strokeDasharray="5 5" />
        <circle cx="0" cy="200" r="170" strokeWidth="0.5" strokeDasharray="8 10" />
        <circle cx="0" cy="200" r="220" strokeWidth="0.5" />
      </svg>

      {/* ── Drifting Elements (Leaves & Growth-Rings) ── */}
      {items.map((item) => (
        <motion.div
          key={item.id}
          style={{
            position: "absolute",
            bottom: "-10%",
            left: item.left,
            width: item.size,
            height: item.size
          }}
          initial={{ y: "105vh", x: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: ["105vh", "-15vh"],
            x: item.xPath,
            opacity: [0, 0.1, 0.1, 0], // Consistent 8-12% visible range (10% center opacity)
            rotate: [0, 15, -15, 10, 0]
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`${item.color}`}
        >
          {item.type === "leaf" ? (
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
              <path d="M50 30 L35 42" strokeWidth="0.5" />
              <path d="M50 45 L35 57" strokeWidth="0.5" />
              <path d="M50 60 L35 72" strokeWidth="0.5" />
              <path d="M50 30 L65 42" strokeWidth="0.5" />
              <path d="M50 45 L65 57" strokeWidth="0.5" />
              <path d="M50 60 L65 72" strokeWidth="0.5" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              className="w-full h-full"
            >
              {/* Concentric growth-ring pattern */}
              <circle cx="50" cy="50" r="40" strokeWidth="1.2" strokeDasharray="3 5" />
              <circle cx="50" cy="50" r="28" strokeWidth="0.8" />
              <circle cx="50" cy="50" r="16" strokeWidth="0.5" strokeDasharray="1 3" />
            </svg>
          )}
        </motion.div>
      ))}

      {/* ── Overlay: Subtle Technical Grid ── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#E3E1DE_1px,transparent_1px),linear-gradient(to_bottom,#E3E1DE_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.06]" />
    </div>
  );
}
