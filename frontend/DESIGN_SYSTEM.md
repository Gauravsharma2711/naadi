# Din Design System: Token Catalog & Visual Specification

**THIS FILE IS THE SINGLE SOURCE OF TRUTH FOR ALL VISUAL DESIGN. Before creating or editing ANY UI component, read this file first. Never invent new colors, fonts, spacing values, or component styles that aren't defined here. If a new need arises, ADD it to this file first, then use it — never improvise inline.**

---

## 1. Color Palette (Light Sprout Green Theme)

All colors are mapped semantically inside `tailwind.config.js` under the `sky` key:

| Tailwind Class | Hex Value | Name / Purpose |
| :--- | :--- | :--- |
| `bg-sky-dark` | `#F7F9F8` | **Off-White Canvas**: Main page body background. |
| `bg-sky-card` | `#FFFFFF` | **Pure White**: Primary container card and module backgrounds. |
| `border-sky-midnight` | `#E2E8E5` | **Sage Divider**: Thin grid overlay lines, input borders, and card outlines. |
| `text-sky-cream` | `#0E1714` | **Charcoal Forest**: High-contrast primary text, main titles, and headers. |
| `text-sky-grey` | `#62756E` | **Muted Sage**: Secondary paragraphs, captions, and helper labels. |
| `text-sky-gold` / `bg-sky-gold` | `#00684A` | **Vivid Forest Green**: Primary brand actions, buttons, and fully ready indicators. |
| `text-sky-sunset` / `bg-sky-sunset` | `#D1FAE5` | **Pale Sprout Green**: Initial sprout rings, low progress tracks, and mild warnings. |
| `text-sky-amethyst` / `bg-sky-amethyst` | `#00ED64` | **Spring Green Flare**: Active pulses, success badges, and optimized indicators. |
| `text-sky-crimson` / `bg-sky-crimson` | `#F26157` | **Alert Red**: Warnings, late filings, and needs-attention badges. |

---

## 2. Typography

*   **Display & Headings**: `Space Grotesk` (Google Font)
    *   *Usage*: Page titles, dashboard widgets, countdown values, and primary badges.
    *   *Styling*: Uppercase, semibold/extrabold, with tracking `tracking-widest` or `tracking-wider` to build technical trust.
*   **Body & Form Inputs**: `Plus Jakarta Sans` (Google Font)
    *   *Usage*: Explanatory text, secondary reasons, descriptive captions, and form inputs.
    *   *Styling*: Regular/Medium weights with standard tight leading.

---

## 3. Border-Radius, Shadows & Spacing Rules

*   **Border-Radius**:
    *   `rounded-xl` ($12\text{px}$): Primary container cards and widgets.
    *   `rounded-2xl` ($16\text{px}$): Onboarding panels.
    *   `rounded-full`: Buttons, status badges, input fields, and progression tracks.
*   **Shadows**:
    *   `shadow-[0_8px_30px_rgba(0,104,74,0.02)]` (and `0.03` variation): Custom organic shadow with a soft green tint, providing depth without harsh borderlines.
*   **Spacing Rhythm**:
    *   Page Margin: `p-8` ($32\text{px}$)
    *   Card Padding: `p-6` ($24\text{px}$)
    *   Elements Gaps: `gap-4` ($16\text{px}$) or `gap-2` ($8\text{px}$)

---

## 4. Countdown Dial: Leaf Growth Ring

The Countdown Dial is the single signature visual element representing a sprout growing into a full leaf:
*   **Visual Structure**: A full circular gauge containing concentric tree rings (`stroke="#E2E8E5"`, `opacity="0.3"`) in the background.
*   **Dynamic Progress**: Visually grows clockwise proportional to readiness. Starts as a thin, pale sprout green (`#D1FAE5`) track and morphs into a thick, solid forest green (`#00684A`) outline.
*   **Central Content**: Big bold countdown value rendered in charcoal `Space Grotesk` font with the "until ready" label centered below.
*   **Growth Badges**: Shows the status dynamically as the ring expands (Seedling $\rightarrow$ Sprouting $\rightarrow$ Blooming).
