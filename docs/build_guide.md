# Naadi (Din) — Student Build Guide
### IDBI Bank Hackathon 2026 — Track 3: AI-Powered MSME Financial Health Card

---

## 1. About The Project (Plain English)

**Naadi** is one AI engine that reads a small business's "financial pulse" from its GST filings, UPI payments, bank statement data (Account Aggregator), and EPFO records — and instead of giving a boring score, it tells the business owner:

> **"You are 47 days away from being loan-ready."**
> Plus 2–3 specific actions that shrink that number.

This version of the product is called **Din** (Hindi for "day") and it's your **primary submission for Track 3**. If time allows, you extend the same engine into 3 bonus surfaces (Kal, Aay, Bachao) to show platform scale — but Din alone, well-built, is a complete winning submission.

**Since you don't have real bank/GSTN/AA/EPFO API access as a student**, you will **simulate these data sources** with realistic synthetic data. This is completely normal and expected for a hackathon — judges care that your AI logic and architecture are real, not that you're plugged into production GSTN servers.

---

## 2. Tech Stack (100% Free)

You do **not** need to spend any of your $100 AWS credit to build or even demo this. Everything below runs free, forever, on a laptop. AWS is optional polish for the last hour, not a requirement.

| Layer | Technology | Cost | Why |
|---|---|---|---|
| Frontend | **React (Vite) + TailwindCSS + Framer Motion** | Free | Vite = fast dev server; Tailwind = fast styling; Framer Motion = smooth countdown animation |
| Charts | **Recharts** | Free | Simple, good-looking charts/dials for the countdown |
| Backend | **FastAPI (Python)** | Free | Fast to build, auto-generates API docs, great for ML serving |
| ML / AI | **XGBoost + scikit-learn + SHAP** | Free | Industry-standard, explainable, trains in seconds on small data |
| Data generation | **Faker (Python)** | Free | Generates realistic fake GST/UPI/AA/EPFO data |
| Database | **SQLite** (dev) → **PostgreSQL via Docker** (optional) | Free | SQLite needs zero setup — perfect for a 48-hour hackathon |
| Auth | **Simple mock login (JWT)** | Free | Real Aadhaar e-KYC is not accessible to students — mock it and say so honestly in your pitch |
| Version control | **GitHub** | Free | Standard |
| Local dev tunnel (optional) | **ngrok** or **Vercel/Netlify (frontend)** | Free | Share a live demo link without touching AWS |
| Deployment (optional, if time remains) | **AWS EC2 t2.micro/t3.micro (Free Tier) or AWS Amplify (frontend Free Tier)** | Free within limits | See AWS section below — treat as a stretch goal, not a requirement |

**Total realistic spend: $0.** Keep your $100 AWS credit untouched unless you specifically want a public demo URL — and even then, Free Tier covers it.

---

## 3. Folder Structure

```
naadi/
├── README.md
├── .env.example
├── docker-compose.yml                # optional — only if you use Postgres instead of SQLite
│
├── backend/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── app/
│       ├── main.py                   # FastAPI entrypoint
│       ├── core/
│       │   └── config.py             # env vars, settings
│       ├── db/
│       │   ├── database.py           # SQLAlchemy engine/session
│       │   └── models.py             # MSME, Transaction, Score, Action tables
│       ├── schemas/
│       │   └── msme.py               # Pydantic request/response models
│       ├── data/
│       │   ├── synthetic_generator.py   # master script — generates all fake data
│       │   ├── mock_gst.py           # fake GST filing history generator
│       │   ├── mock_upi.py           # fake UPI settlement generator
│       │   ├── mock_aa.py            # fake bank statement (AA) generator
│       │   └── mock_epfo.py          # fake EPFO payroll generator
│       ├── ml/
│       │   ├── feature_engineering.py   # turns raw mock data into model features
│       │   ├── train_model.py        # trains the XGBoost credit-readiness model
│       │   ├── predict.py            # loads model, scores a new MSME
│       │   ├── shap_explain.py       # generates SHAP reason codes
│       │   ├── days_calibration.py   # converts SHAP gaps → "days to ready"
│       │   └── model_store/          # saved .json/.pkl model files live here
│       └── api/
│           └── routes/
│               ├── msme.py           # POST /msme/connect, GET /msme/{id}
│               ├── score.py          # GET /msme/{id}/score  → countdown + actions
│               └── actions.py        # POST /msme/{id}/action-complete
│
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── services/
│       │   └── api.js                # axios calls to backend
│       ├── pages/
│       │   ├── Onboarding.jsx        # "Connect GST / UPI / AA / EPFO" (mocked)
│       │   └── Dashboard.jsx         # the main countdown screen
│       └── components/
│           ├── CountdownDial.jsx     # the big "47 Days" animated number
│           ├── ActionCard.jsx        # each recommended action + its day-impact
│           └── ScoreBreakdown.jsx    # SHAP-based "why" explanation panel
│
├── data/
│   └── synthetic_msme_dataset.csv    # generated training dataset (output of Phase 1)
│
├── notebooks/
│   └── model_training.ipynb          # optional — explore/tune the model here first
│
└── docs/
    ├── architecture.md               # 1-page diagram + explanation for your submission
    └── demo_script.md                # your rehearsed 5-minute demo script
```

---

## 4. Workflow — Step by Step (Built for a 24–48 Hour Hackathon)

### Phase 0 — Setup (1–2 hours)
1. `git init`, create the folder structure above.
2. Backend: `python -m venv venv`, install `fastapi uvicorn xgboost scikit-learn shap pandas faker sqlalchemy python-dotenv`.
3. Frontend: `npm create vite@latest frontend -- --template react`, then install `tailwindcss framer-motion recharts axios`.
4. Confirm both run: `uvicorn app.main:app --reload` (backend) and `npm run dev` (frontend).

### Phase 1 — Generate Synthetic Data (2–3 hours)
This is your foundation — spend real care here.
1. In `mock_gst.py`, `mock_upi.py`, `mock_aa.py`, `mock_epfo.py`, use **Faker** + simple randomization rules to generate ~200–500 synthetic MSME profiles, each with:
   - GST filing history (on-time vs. late, over 6–12 months)
   - UPI settlement volume trend (growing/flat/declining)
   - AA bank cash-flow (inflow/outflow volatility)
   - EPFO payroll consistency (if the MSME has employees)
   - Top-buyer revenue concentration % (for the concentration-risk signal)
   - A **label**: whether this MSME would realistically be "credit-ready" (you define reasonable rules, e.g., score = weighted combination + noise, then threshold)
2. Save the combined dataset to `data/synthetic_msme_dataset.csv`.
3. **Be honest about this in your pitch**: "We simulated realistic MSME behavior patterns based on published RBI/industry data on typical GST compliance rates and MSME cash-flow patterns, since production GSTN/AA/EPFO access isn't available to hackathon teams."

### Phase 2 — Train the Model (3–4 hours)
1. In `notebooks/model_training.ipynb`, load the CSV, engineer features (`feature_engineering.py`): filing punctuality rate, settlement trend slope, cash-flow volatility, payroll consistency, concentration %.
2. Train an **XGBoost classifier** predicting credit-readiness probability.
3. Run **SHAP** on the trained model to get per-feature contribution values for any MSME.
4. Build `days_calibration.py`: a simple, honest heuristic mapping SHAP gap magnitude → estimated days (e.g., "each 0.1 of missing probability ≈ 10 days," tuned to feel realistic — label this clearly as a first-pass calibration in your docs).
5. Save the trained model to `ml/model_store/`.
6. Port the notebook logic into `train_model.py` and `predict.py` as clean, callable functions.

### Phase 3 — Backend API (4–5 hours)
1. `db/models.py`: define `MSME`, `Score`, `Action` tables (SQLite via SQLAlchemy).
2. `api/routes/msme.py`: `POST /msme/connect` — accepts a mock "connect GST/UPI/AA/EPFO" request, pulls a synthetic profile, stores it.
3. `api/routes/score.py`: `GET /msme/{id}/score` — runs `predict.py` + `shap_explain.py` + `days_calibration.py`, returns `{ days_remaining, top_3_actions: [{action, days_saved}] }`.
4. `api/routes/actions.py`: `POST /msme/{id}/action-complete` — marks an action done, recomputes the countdown, returns the new (lower) number.
5. Test everything via FastAPI's auto-generated docs at `/docs`.

### Phase 4 — Frontend (6–8 hours)
1. `Onboarding.jsx`: simple "Connect your business" screen with 4 buttons (GST / UPI / AA / EPFO) that just call the mock-connect endpoint — no real OAuth needed.
2. `CountdownDial.jsx`: the big animated number — **this is your one wow moment, spend the most polish time here**. Use Framer Motion to animate the number ticking down smoothly when an action is completed.
3. `ActionCard.jsx`: shows each recommended action with its day-impact ("File GST 4 days earlier → −12 days"); tapping it calls the action-complete endpoint and triggers the countdown animation.
4. `ScoreBreakdown.jsx`: a simple SHAP-based panel — "why" behind the number, in plain language.
5. Wire it all together in `Dashboard.jsx`.

### Phase 5 — Integration Testing (2–3 hours)
Run the full flow end to end: onboard a fake MSME → see the countdown → complete an action → watch it tick down → reach 0 days → see a "Pre-Approved" state. Fix bugs.

### Phase 6 — Polish & Demo Script (2–3 hours)
1. Prepare **2 synthetic MSME profiles** in advance: one starting at "47 days" and one already at "0 days — Pre-Approved," so your live demo has both the journey and the payoff without relying on live randomness.
2. Write `docs/demo_script.md` — script your exact 5-minute flow (see prior conversation for the structure: hook → problem → live countdown → tap 2 actions → reveal 0-day MSME → close on business impact).
3. Add a short `docs/architecture.md` with a simple diagram (data sources → feature engineering → XGBoost + SHAP → days calibration → API → React UI).

### Phase 7 — Rehearse (1–2 hours)
Run the demo start to finish at least 3 times before presenting. Time it. Cut anything that doesn't serve the countdown moment.

---

## 5. About Your AWS Free Tier ($100 credit) — Use It Carefully

**Recommendation: don't touch AWS unless you finish everything above with time to spare.** A live AWS deployment adds real risk (broken demo, unexpected charges, DNS/config issues) for very little judging benefit — judges almost always accept a localhost or ngrok demo.

**If you do want a public URL, here's the safest path, entirely within Free Tier:**

| What | Free Tier Limit (first 12 months) | Use For |
|---|---|---|
| **EC2 t2.micro / t3.micro** | 750 hours/month free | Run your FastAPI backend |
| **S3** | 5GB storage free | Host your built React frontend as a static site |
| **CloudFront** (optional) | 1TB data transfer free | Serve the frontend fast globally |
| **AWS Amplify Hosting** | Free tier available | Easiest one-click way to host the React frontend — simpler than S3+CloudFront |
| **RDS (Postgres)** | 750 hours db.t3.micro + 20GB free | Only if you outgrow SQLite — not needed for a hackathon |

**Before touching AWS at all:**
1. Go to **Billing → Budgets** and set a **budget alert at $5**, so you get emailed immediately if anything unexpected starts costing money.
2. Stick to `t2.micro`/`t3.micro` instances only — anything bigger is not free.
3. **Terminate (not just stop) your EC2 instance** the moment your demo is over.
4. Never enable NAT Gateways, Elastic IPs left unattached, or RDS Multi-AZ — these are the classic ways students accidentally get billed even on "free tier."

**Simplest safe setup if you want it:** deploy the frontend to **AWS Amplify** (free, one command) and the backend to a single **EC2 t3.micro** instance running `uvicorn` behind a simple systemd service. That's it — no load balancers, no RDS, no Docker orchestration needed for a hackathon demo.

---

## 6. Quick-Reference: What to Say If Judges Ask About Data

Be upfront and confident, not defensive:

> "We don't have production access to GSTN, AA, or EPFO APIs as a student team — those require formal bank/NBFC partnerships. So we built a synthetic data generator that mirrors realistic MSME filing and cash-flow patterns, and built the full production-grade API contract (`POST /msme/connect`) so that swapping in real GSTN/AA/EPFO credentials later is a data-source change, not an architecture change."

This answer, said clearly, actually **increases** judge confidence rather than hurting you — it shows you understand exactly what's real vs. simulated and designed for a clean handoff to production.

---

## 7. Priority Order If You Run Out of Time

If Phase timings slip, cut in this order (last item cut first):
1. ~~Bonus surfaces (Kal/Aay/Bachao)~~ — cut first, these are stretch goals only.
2. ~~AWS deployment~~ — demo locally via ngrok/localhost instead.
3. ~~ScoreBreakdown SHAP panel~~ — nice-to-have; the countdown + action cards are the real wow.
4. ~~Second synthetic MSME profile~~ — one working profile is enough if truly tight on time.

**Never cut:** the countdown animation itself. That is the entire wow moment — protect the hours needed to make it feel smooth and alive, even if everything else is rougher.