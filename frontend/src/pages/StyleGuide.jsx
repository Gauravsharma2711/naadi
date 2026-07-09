import React from "react";
import { motion } from "framer-motion";
import AmbientBackground from "../components/AmbientBackground";

export default function StyleGuide({ onBack }) {
  const fonts = [
    {
      name: "Space Grotesk",
      class: "font-display",
      usage: "Display headings, titles, countdown numbers, and status labels (often in uppercase with wide letter spacing).",
      weights: ["Regular (400)", "Medium (500)", "SemiBold (600)", "Bold (700)"],
      sample: "DIN (NAADI) - 168 DAYS TO READY"
    },
    {
      name: "Plus Jakarta Sans",
      class: "font-sans",
      usage: "Main body typography, descriptions, and metric labels.",
      weights: ["Light (300)", "Regular (400)", "Medium (500)", "SemiBold (600)", "Bold (700)"],
      sample: "Your cashflow volatility score is moderate (0.28), indicating seasonal fluctuations."
    }
  ];

  const colors = [
    { name: "Sky Dark (Off-White BG)", class: "bg-sky-dark", hex: "#F7F9F8", usage: "Main application background canvas." },
    { name: "Sky Card (Pure White)", class: "bg-sky-card", hex: "#FFFFFF", usage: "Card wrappers, container panels, and overlays." },
    { name: "Sky Midnight (Sage Divider)", class: "bg-sky-midnight", hex: "#E2E8E5", usage: "Delicate separators, dividers, and input borders." },
    { name: "Sky Gold (Forest Green)", class: "bg-sky-gold", hex: "#00684A", usage: "Vivid forest green representing primary brand actions and healthy metrics." },
    { name: "Sky Sunset (Sprout Green)", class: "bg-sky-sunset", hex: "#D1FAE5", usage: "Pale sprout green used for low readiness or background tags." },
    { name: "Sky Amethyst (Spring Green Accent)", class: "bg-sky-amethyst", hex: "#00ED64", usage: "Success badges, bright leaf growths, and secondary triggers." },
    { name: "Sky Crimson (Alert Red)", class: "bg-sky-crimson", hex: "#F26157", usage: "Alert badges, warning texts, and critical action border colors." },
    { name: "Sky Cream (Charcoal Text)", class: "bg-sky-cream", hex: "#0E1714", usage: "High-contrast headings, title texts, and primary characters." },
    { name: "Sky Grey (Muted Sage Text)", class: "bg-sky-grey", hex: "#62756E", usage: "Muted subtitles, secondary captions, and details." }
  ];

  const typeScale = [
    { tag: "h1", class: "text-3xl font-display uppercase tracking-widest font-extrabold", desc: "Hero and Main Headings" },
    { tag: "h2", class: "text-xl font-display uppercase tracking-widest font-extrabold", desc: "Module Headings" },
    { tag: "h3", class: "text-sm font-display uppercase tracking-widest font-extrabold", desc: "Card Titles" },
    { tag: "body", class: "text-sm font-sans text-sky-grey", desc: "Descriptive body copy" },
    { tag: "caption", class: "text-[10px] font-display text-sky-grey uppercase tracking-widest font-semibold", desc: "Sub-headings, badge titles" }
  ];

  const spacing = [
    { name: "p-2", width: "w-8", desc: "8px - Compact gaps" },
    { name: "p-4", width: "w-16", desc: "16px - Standard spacing" },
    { name: "p-6", width: "w-24", desc: "24px - Container padding" },
    { name: "p-8", width: "w-32", desc: "32px - Module margins" },
    { name: "p-12", width: "w-48", desc: "48px - Section padding" }
  ];

  return (
    <div className="min-h-screen bg-transparent p-8 text-sky-cream font-sans select-none relative overflow-hidden">
      <AmbientBackground />

      <div className="w-full max-w-4xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-sky-card border border-sky-midnight p-6 rounded-xl shadow-[0_8px_30px_rgba(0,104,74,0.02)]">
          <div>
            <h1 className="text-2xl font-display uppercase tracking-widest font-extrabold text-sky-cream">
              Din Design System
            </h1>
            <p className="text-[10px] font-display text-sky-grey uppercase tracking-widest mt-1.5 font-bold">
              MongoDB-Inspired Light Sprout Theme
            </p>
          </div>
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,214,107,0.15)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="bg-sky-gold hover:bg-[#00b056] text-white px-5 py-2.5 rounded-xl font-sans font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-sm"
          >
            Back to App
          </motion.button>
        </header>

        {/* Colors Section */}
        <section className="bg-sky-card border border-sky-midnight p-6 rounded-xl shadow-[0_8px_30px_rgba(0,104,74,0.02)] space-y-6">
          <h2 className="text-xs font-display uppercase tracking-widest font-extrabold border-b border-sky-midnight pb-3 text-sky-gold">
            1. Color Palette (Light Forest / Sprout)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {colors.map((c, i) => (
              <div key={i} className="flex items-center gap-4 bg-sky-dark p-3 rounded-xl border border-sky-midnight hover:border-sky-gold/15 transition-all duration-300">
                <div className={`h-12 w-12 rounded border border-sky-midnight ${c.class} shadow-sm flex-shrink-0`} />
                <div>
                  <h4 className="text-xs font-display font-extrabold text-sky-cream uppercase tracking-wider">{c.name}</h4>
                  <code className="text-xs text-sky-gold font-mono font-bold">{c.hex}</code>
                  <p className="text-[10px] text-sky-grey leading-tight mt-1">{c.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography Section */}
        <section className="bg-sky-card border border-sky-midnight p-6 rounded-xl shadow-[0_8px_30px_rgba(0,104,74,0.02)] space-y-6">
          <h2 className="text-xs font-display uppercase tracking-widest font-extrabold border-b border-sky-midnight pb-3 text-sky-gold">
            2. Typography
          </h2>
          <div className="space-y-6">
            {fonts.map((f, i) => (
              <div key={i} className="bg-sky-dark p-4 rounded-xl border border-sky-midnight space-y-2">
                <div className="flex justify-between items-baseline border-b border-sky-midnight/50 pb-2">
                  <h4 className="text-sm font-display font-bold text-sky-cream">{f.name}</h4>
                  <span className="text-[10px] text-sky-grey uppercase tracking-widest font-mono">
                    Class: <span className="text-sky-gold font-bold">{f.class}</span>
                  </span>
                </div>
                <p className="text-xs text-sky-grey">{f.usage}</p>
                <div className="flex flex-wrap gap-2 text-[9px] text-sky-cream font-medium uppercase font-display">
                  Weights: {f.weights.map((w, wi) => (
                    <span key={wi} className="bg-sky-midnight px-2 py-0.5 rounded border border-white/5">{w}</span>
                  ))}
                </div>
                <div className={`text-lg mt-3 p-3 bg-white rounded border border-sky-midnight text-sky-cream ${f.class} tracking-wide`}>
                  {f.sample}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Type Scale Section */}
        <section className="bg-sky-card border border-sky-midnight p-6 rounded-xl shadow-[0_8px_30px_rgba(0,104,74,0.02)] space-y-6">
          <h2 className="text-xs font-display uppercase tracking-widest font-extrabold border-b border-sky-midnight pb-3 text-sky-gold">
            3. Typographic Scale
          </h2>
          <div className="space-y-4">
            {typeScale.map((t, i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 border-b border-sky-midnight last:border-0">
                <div className="w-24">
                  <span className="text-[10px] font-mono text-sky-gold uppercase font-bold">&lt;{t.tag}&gt;</span>
                </div>
                <div className="flex-1">
                  <span className={`${t.class} block`}>
                    Din Design System
                  </span>
                </div>
                <div className="text-right text-xs text-sky-grey font-display">
                  {t.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Spacing Section */}
        <section className="bg-sky-card border border-sky-midnight p-6 rounded-xl shadow-[0_8px_30px_rgba(0,104,74,0.02)] space-y-6">
          <h2 className="text-xs font-display uppercase tracking-widest font-extrabold border-b border-sky-midnight pb-3 text-sky-gold">
            4. Spacing Scale
          </h2>
          <div className="space-y-4">
            {spacing.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-sky-dark border border-sky-midnight rounded-xl">
                <div className="w-16">
                  <code className="text-xs text-sky-gold font-mono font-bold">{s.name}</code>
                </div>
                <div className="flex-1 pl-4">
                  <div className={`h-4 bg-gradient-to-r from-sky-sunset to-sky-gold rounded ${s.width}`} />
                </div>
                <div className="text-xs text-sky-grey font-display">
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
