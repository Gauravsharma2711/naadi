# Din — Design System (MongoDB-Inspired)
### For use with Google Stitch, and as the source of truth for the coded frontend

---

## 1. Design Philosophy

Din is a countdown to loan-readiness for Indian MSMEs, not a static credit score. The visual language borrows MongoDB's confident, technical-trust aesthetic — clean geometric type, a single strong green accent, generous white space, soft rounded surfaces — and adapts it to Din's own metaphor: **a business growing toward readiness**, expressed as a growth-ring dial that fills in as days count down.

Animation should feel *organic and confident*, never bouncy or playful — think of something growing steadily, not a game UI celebrating.

---

## 2. Color Palette

| Name | Hex | Usage |
|---|---|---|
| Background | `#FBFBFA` | Page background, off-white |
| Surface | `#FFFFFF` | Cards, elevated panels |
| Primary Green | `#00D66B` | Primary accent, CTAs, filled dial, success states |
| Sprout Green (muted) | `#B8E8C8` | Unfilled dial track, secondary/disabled accents |
| Deep Text | `#001E2B` | Headings, primary text (not pure black) |
| Muted Text | `#5A6B70` | Secondary text, captions, "Why This Score" section |
| Border/Divider | `#E3E1DE` | Subtle borders, dividers |
| Error/Alert | `#D64545` | Error states only, used sparingly |

**Gradient (used only on the growth-ring dial):** `#B8E8C8` → `#00D66B`, applied along the fill arc as it progresses from low to high readiness.

---

## 3. Typography

| Role | Font | Weight | Notes |
|---|---|---|---|
| Display/Numbers (the countdown) | **Space Grotesk** | 700 | Used ONLY for the big day-count number and page hero headlines |
| Headings | **Space Grotesk** | 600 | Section titles |
| Body/UI text | **Inter** | 400–500 | Everything else — labels, buttons, descriptions |

Type scale: Hero number `96px` / Headings `28px` / Subheadings `18px` / Body `15px` / Caption `13px`.

---

## 4. Shape & Elevation

- Border-radius: **16px** on cards, **12px** on buttons, **full circle** on the dial and icon containers.
- Shadows: soft only — `0 4px 12px rgba(0,0,0,0.06)` on resting cards, `0 8px 20px rgba(0,214,107,0.15)` (a soft green-tinted glow) on the primary CTA button on hover.
- No hard borders except the 1px `#E3E1DE` divider where absolutely needed.

---

## 5. Animation Guidelines (this is the section Stitch prompts need to reflect)

Animations should feel **smooth, physical, and organic** — like something growing — never bouncy, elastic, or game-like.

| Element | Animation | Timing/Easing |
|---|---|---|
| Growth-ring dial fill | Arc fills smoothly from current value to new value | 900ms, ease-out cubic |
| Dial color | Shifts along the sprout→primary green gradient as it fills | Synced with the fill animation |
| Number count-up/down | Digits roll/count between old and new value, not an instant jump | 600ms, ease-in-out |
| Action card on tap | Checkmark fades/scales in, card background tints faintly green | 300ms, ease-out |
| Page transitions | Gentle fade + slight upward slide (12px) on new content entering | 400ms, ease-out |
| Buttons on hover | Soft green glow shadow appears, slight scale (1.02x) | 200ms |
| Loading states | A slow pulsing of the dial's muted green track (not a generic spinner) | 1.5s loop, ease-in-out |

**Rule for any coding agent implementing this later:** use Framer Motion, and always animate *from the real previous value to the real new value* — never fake a random animation disconnected from the actual data.

---

## 6. Component Patterns

- **Growth-Ring Dial:** circular arc (not a full plain ring — leave a small organic gap, like a sprout shape), large number centered, label below in Muted Text.
- **Action Card:** white surface, 16px radius, soft shadow, icon/checkbox left, title + day-impact right, tap triggers the tap animation above.
- **Primary Button:** filled Primary Green, white Inter text, 12px radius, hover glow per above.
- **Secondary/Ghost Button:** transparent background, Primary Green text and 1px border.
- **"Why This Score" list:** no card/border — just Muted Text rows with a small dot separator, deliberately quieter than everything else on the page.

---

## 7. Non-Negotiables

1. The growth-ring dial is the ONE hero element on every screen it appears — nothing else should visually compete with it.
2. Never introduce a new color, font, or spacing value outside this document without updating this document first.
3. Animations always reflect real, current data — never decorative-only motion disconnected from state.