import React from "react";
import { motion } from "framer-motion";

export default function AmbientBackground() {
  // 8 large drifting elements: 4 leaves, 4 growth-rings
  const items = [
    {
      id: 1,
      type: "leaf",
      left: "5%",
      size: 260,
      delay: 0,
      duration: 32,
      xPath: [0, 40, -20, 20, 0]
    },
    {
      id: 2,
      type: "ring",
      left: "15%",
      size: 220,
      delay: 4,
      duration: 38,
      xPath: [0, -30, 30, -15, 0]
    },
    {
      id: 3,
      type: "leaf",
      left: "30%",
      size: 300,
      delay: 2,
      duration: 34,
      xPath: [0, 25, -40, 30, 0]
    },
    {
      id: 4,
      type: "ring",
      left: "45%",
      size: 200,
      delay: 7,
      duration: 40,
      xPath: [0, -20, 20, -30, 0]
    },
    {
      id: 5,
      type: "leaf",
      left: "60%",
      size: 240,
      delay: 3,
      duration: 28,
      xPath: [0, 30, -15, 35, 0]
    },
    {
      id: 6,
      type: "ring",
      left: "72%",
      size: 320,
      delay: 9,
      duration: 36,
      xPath: [0, -35, 25, -20, 0]
    },
    {
      id: 7,
      type: "leaf",
      left: "85%",
      size: 210,
      delay: 1,
      duration: 42,
      xPath: [0, 15, -30, 15, 0]
    },
    {
      id: 8,
      type: "ring",
      left: "92%",
      size: 280,
      delay: 5,
      duration: 30,
      xPath: [0, -15, 35, -25, 0]
    }
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1] select-none">
      {/* ── Corner Ambient Rings (Static backdrop depth) ── */}
      <svg
        className="absolute -top-24 -right-24 w-96 h-96 text-sky-sunset opacity-[0.10]"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="200" cy="0" r="100" strokeWidth="0.75" strokeDasharray="4 6" />
        <circle cx="200" cy="0" r="150" strokeWidth="0.5" strokeDasharray="6 8" />
        <circle cx="200" cy="0" r="190" strokeWidth="0.5" />
      </svg>
      <svg
        className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] text-sky-sunset opacity-[0.10]"
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
            bottom: "-350px", // Start completely off-screen relative to its size
            left: item.left,
            width: item.size,
            height: item.size
          }}
          initial={{ y: "105vh", x: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: ["105vh", "-50vh"], // Float all the way through the viewport
            x: item.xPath,
            opacity: [0, 0.10, 0.10, 0], // Consistent 10% opacity for real atmosphere
            rotate: [0, 25, -25, 15, 0]
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "linear"
          }}
          className="blur-[6px]" // Soft focus blur to blend elements into the background
        >
          {item.type === "leaf" ? (
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full"
            >
              {/* Dual-layered organic leaf silhouette */}
              <path
                d="M200 40C200 40 120 120 120 200C120 280 200 360 200 360C200 360 280 280 280 200C280 120 200 40 200 40Z"
                fill="#00D66B"
              />
              <path
                d="M200 80C200 80 150 140 150 200C150 260 200 320 200 320C200 320 250 260 250 200C250 140 200 80 200 80Z"
                fill="#B8E8C8"
              />
            </svg>
          ) : (
            <svg
              viewBox="0 0 400 400"
              fill="none"
              className="w-full h-full"
            >
              {/* Concentric growth-ring arcs */}
              <path
                d="M80 200C80 133.726 133.726 80 200 80"
                stroke="#00D66B"
                strokeWidth="20"
                strokeLinecap="round"
              />
              <path
                d="M40 200C40 111.634 111.634 40 200 40"
                stroke="#B8E8C8"
                strokeWidth="20"
                strokeLinecap="round"
              />
              <path
                d="M120 200C120 155.817 155.817 120 200 120"
                stroke="#00D66B"
                strokeWidth="20"
                strokeLinecap="round"
                opacity="0.6"
              />
            </svg>
          )}
        </motion.div>
      ))}

      {/* ── Overlay: Subtle Technical Grid ── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#E3E1DE_1px,transparent_1px),linear-gradient(to_bottom,#E3E1DE_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.06]" />
    </div>
  );
}
