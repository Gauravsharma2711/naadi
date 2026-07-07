# Din (Naadi) — 5-Minute Demo Script

This is the spoken script for the presentation. Practicing with these timestamps will ensure you hit the 5-minute mark exactly.

---

## 1. Opening Hook (0:00 - 0:20) — [20 Seconds]

**What to do**: Stand confidently, make eye contact, and speak slowly but punchily.

> *"Imagine you’re running a small manufacturing unit or a local retail store in India, and you need capital to expand. You apply for a business loan. What happens next? A black box. You wait weeks with zero updates, zero guidance, and eventually—a flat rejection, with no explanation of why. That is the frustrating, silent reality for millions of MSMEs in our country today."*

---

## 2. The Problem (0:20 - 0:50) — [30 Seconds]

**What to do**: Show slides or indicate the current state of MSME underwriting.

> *"Traditional credit scoring is fundamentally broken for New-to-Credit MSMEs. Traditional models look for long-term formal borrowing records—histories that these small businesses simply do not have, labeling them as 'high-risk'. Yet, these businesses are alive and transacting. They file GST, settle daily customer invoices via UPI, pay employee salaries through EPFO, and maintain cash balances. The problem isn’t a lack of data; it’s that lenders lack a way to read this real-time financial pulse and turn it into a clear, actionable path to credit readiness."*

---

## 3. The Solution: Din (0:50 - 1:10) — [20 Seconds]

**What to do**: Transition to the onboarding screen of the app.

> *"Introducing **Din**—meaning the 'days' until loan-ready. Din is an AI-powered financial pulse card that connects to an MSME's digital ledgers. Instead of presenting them with a static, discouraging credit score, Din gives them a dynamic countdown: exactly how many **Days until Credit-Ready**, paired with a ranked list of recommended actions that shrink that number down to zero."*

---

## 4. Live Walkthrough: Demo MSME A (1:10 - 2:30) — [1 Minute 20 Seconds]

**What to do**: Click and interact with the UI live in the browser using profile ID `demo-msme-a`.

*   **1:10 (Onboarding & Link)**: 
    > *"Let’s see it in action. We select **Demo MSME A** on our Onboarding screen. We connect their live financial ledgers: GST filings, UPI settlement logs, bank statements via Account Aggregator, and EPFO payroll records. Now, we tap 'See My Countdown'..."*

*   **1:25 (Initial Dashboard)**: 
    > *"[Transition to Dashboard] Here is the Din Dashboard. At the center is the **Leaf Growth Ring Dial**, representing credit maturity. The dial is currently in the **Seedling stage**, showing **47 days until ready**, with an approval probability of **57.7%**. Based on 6 months of ledger data."*

*   **1:40 (Action Board - Speedrun)**: 
    > *"To shorten this wait, we look at the **Action Board**. Din has analyzed their ledgers and ranked recovery actions. Tapping 'Complete' on the GST recommendation... [Click Complete] ...and the countdown instantly ticks down from **47 to 27 days**! Tapping the UPI action... [Click Complete] ...shrinks it further to **12 days remaining**. The visual rings expand, and the probability badge leaps to **87.7%** in the Blooming stage."*

*   **2:10 (SHAP Score Explanation)**: 
    > *"If the business owner asks, 'Why this score?', they scroll down to the **Score Breakdown**. Din translates complex machine learning outputs into plain language. It displays constraints holding them back—like cashflow volatility—and strengths working for them—like EPFO payroll history."*

---

## 5. The Wow Reveal: Demo MSME B (2:30 - 3:10) — [40 Seconds]

**What to do**: Click the back button, select `demo-msme-b` on onboarding, and load the Ready state.

> *"What is the final destination? Let’s load **Demo MSME B**. Tapping 'See My Countdown'... [Click B] ...and MSME B loads instantly at **0 days remaining**! The Leaf Growth Ring is a solid Forest Green, showing full credit maturity. The dashboard displays a pre-approved loan offer: a limit of ₹10 Lakhs at 11.5% APR. The business owner can now tap **Download Report**... [Click Download Report] ...which instantly serves a secure, S3-hosted PDF credit health report, ready for bank submission."*

---

## 6. Contrast View: The AI is Not Fooled (3:10 - 3:50) — [40 Seconds]

**What to do**: Click back to Onboarding, then click the floating "Compare Models" button on the bottom right.

> *"How does our model handle complex, realistic cases? Let's open our **Compare View** to view **Demo C** and **Demo F** side-by-side. On the surface, both look similar because they have volatile monthly bank statements. However, the model isn't fooled. It scores Demo C at **133 days** due to compounding risks: poor GST compliance and high buyer concentration. Meanwhile, Demo F is recognized as just a seasonal business with low buyer concentration and solid payroll records, scored at just **32 days**. Dynamic AI underwriting separates seasonal variance from genuine default risk."*

---

## 7. Under the Hood: The AI Engine (3:50 - 4:20) — [30 Seconds]

**What to do**: Show the technical/model slide or reference the explainability pipeline.

> *"Under the hood, Din is powered by a custom XGBoost classifier that evaluates transaction-level trends, payroll compliance, and cash flow volatility against institutional underwriting rules. We then apply SHAP explainability to compute the exact mathematical impact of each factor in real-time, translating abstract feature weights directly into estimated days saved."*

---

## 8. Impact & Closing (4:20 - 5:00) — [40 Seconds]

**What to do**: Present the impact slide, smile, and deliver the final line.

> *"For lenders, Din replaces slow, manual credit audits with secure, automated, data-driven underwriting—reducing customer acquisition costs and minimizing NPAs. For MSMEs, it provides credit transparency and a clear roadmap, transforming millions of New-to-Credit enterprises from 'unbankable' risks into viable, high-quality borrowing profiles. With Din, credit eligibility is no longer a mystery—it’s just a countdown. Thank you."*
