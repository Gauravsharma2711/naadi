# Naadi (Din) — Project Brain

## 1. What This Project Is
**Naadi (Din)** is an AI engine that reads a small business's "financial pulse" from its GST filings, UPI payments, bank statement data (Account Aggregator), and EPFO records. Instead of providing a static credit score, it outputs a "days until credit-ready" countdown and recommends specific ranked actions that shrink that number.

**Hackathon details:** IDBI Bank National Hackathon 2026, Track 3: AI-Powered MSME Financial Health Card.
**Submission Date:** July 8.

**Frontend visual design source of truth:** [DESIGN_SYSTEM.md](file:///c:/hackathon-projects/naadi/frontend/DESIGN_SYSTEM.md) — always read before any UI work.

## 2. Tech Stack
* **Frontend**: React (Vite) + TailwindCSS + Framer Motion
* **Charts**: Recharts
* **Backend**: FastAPI (Python)
* **ML / AI**: XGBoost + scikit-learn + SHAP
* **Data generation**: Faker (Python)
* **Database**: SQLite (dev) → PostgreSQL via Docker (optional)
* **Auth**: Simple mock login (JWT)

## 3. Folder Structure
```
naadi/
├── .git/
└── docs/
    └── build_guide.md
```

## 4. Current Status
* **What's built and working so far**: **Days 1-4 are COMPLETE.** 
  * **Backend**: FastAPI API services, SQLite DB interface, custom XGBoost classifier model (91.67% accuracy), SHAP explainability pipeline, days-to-ready calibration engine.
  * **Frontend**: React client with MongoDB Sprout Green design system. `StyleGuide` token catalog, `Onboarding` flow, `CountdownDial` (Leaf Growth Ring dial), `ActionCard` interactive list, and `ScoreBreakdown` (Financial Health Insights).
  * **Data Flow Architecture**:
    * `Onboarding.jsx` calls `POST /msme/connect` on submit (validates ID and connection sources).
    * `Dashboard.jsx` calls `GET /msme/{msme_id}/score` on page load to fetch the initial countdown, probability, top 3 actions, and SHAP explanations.
    * `Dashboard.jsx` calls `POST /msme/{msme_id}/action-complete` when an action is clicked (sends `{ action_id }` and receives updated countdown parameters). Subsequently triggers a background `GET /msme/{msme_id}/score` refresh to update the insights panel.
* **What's in progress right now**: Day 4 complete. Ready for Day 5.
* **What's broken or blocked**: Nothing.
* **Last updated**: 2026-07-05 (Antigravity Agent)

## 5. Day-by-Day Roadmap
* [x] **Day 1**: Phase 0 Setup (Backend/Frontend initialization) and Phase 1 Synthetic Data Generation.
* [x] **Day 2**: Phase 2 Finish Model + Backend API (train the XGBoost model, add SHAP explainability, build the days-calibration logic, and expose it all through /score and /action-complete endpoints).
* [x] **Day 3**: Phase 3 Build the frontend UI — Onboarding screen, Dashboard, and the Countdown Dial animation — with design system (DESIGN_SYSTEM.md), StyleGuide, CountdownDial, ActionCard, ScoreBreakdown components.
* [x] **Day 4**: Phase 4 Frontend Integration — Dashboard wired to real backend (no mock data), action-complete POST round-trips, SHAP breakdown panel added, full E2E verified with both sample MSMEs.
* [ ] **Day 5**: Phase 5 Testing + demo prep — prepare 2 fixed demo MSME profiles, write the demo script, fix any remaining bugs, rehearse.
* [ ] **Day 6**: Phase 6 Polish & Demo Script, Rehearsal, and final Submission.

## 6. Decisions & Reasoning Log
* **Used simulated synthetic data**: Since production GSTN/AA/EPFO access isn't available to student teams, we will simulate realistic data patterns. This allows us to build the real architecture without being blocked by API credentials.
* **Days-calibration as a heuristic**: We use a simple rule to map SHAP gap magnitude to an estimated "days to ready" number because we don't have real historical approval-timeline data for this hackathon. The model computes $Days = 7 + (Gap / 0.75) * 173$, placing the countdown between 7 and 180 days. Days saved are distributed proportionally according to absolute SHAP contribution weights of negative drivers.
* **SQLite over Postgres**: Selected for zero-setup simplicity given the hackathon time constraints.
* **Jupyter Notebooks Abandoned**: We abandoned Jupyter notebooks (.ipynb files) in favor of plain .py scripts due to file corruption issues. All exploration and training scripts run natively via terminal.
* **Wide-open CORS Policy**: Enabled `CORSMiddleware` with `allow_origins=["*"]` and `allow_credentials=False` to support browser sandbox connections, ensuring that frontend client pages running inside Claude.ai artifacts can query the local server.
* **Visual Identity Shift to Light-Mode Sprout Theme**: Redesigned the visual system to a light-mode layout inspired by MongoDB's visual guidelines. Discarded the sunset dawn theme and the previous dark mode in favor of a clean, crisp off-white (`#F7F9F8`) and pure white (`#FFFFFF`) surface set, with deep forest-charcoal text (`#0E1714`) for technical trust, and a green progress theme. The countdown dial is now a circular Leaf Growth Ring transitioning from sprout green (`#D1FAE5`) to vivid MongoDB forest green (`#00684A`), reflecting a business growing towards credit-readiness.
* **Self-Managed Page Loads**: Encapsulated loading, fetching, and error handling states directly inside the [Dashboard.jsx](file:///c:/hackathon-projects/naadi/frontend/src/pages/Dashboard.jsx) component to maximize modularity and simplify routing in `App.jsx`.
* **Operational Threshold Grouping in ScoreBreakdown**: Replaced raw mathematical SHAP sign classification with operational health thresholds. This prevents the logical UX anomaly where mediocre metrics (e.g. 4 late payments) appear under "Working For You" just because the SHAP sign was positive relative to the dataset average.
* **SVG Icons over Emojis**: Replaced text emojis with custom styled SVG vector assets for checkmark and warning states in [ScoreBreakdown.jsx](file:///c:/hackathon-projects/naadi/frontend/src/components/ScoreBreakdown.jsx) to elevate visual finish.

## 7. Known Issues / Things To Watch
* The countdown dial animation is the "wow moment". Do not prioritize it.
* Avoid AWS deployments unless all core functionality is fully completed with time to spare; live demos can be done locally or via ngrok to reduce risk.
* No `.ipynb` files should be used anywhere in this project going forward. Use plain Python scripts for ML/data tasks.
* The days-calibration formula is an unvalidated mathematical heuristic and is not based on historical lender approval records.
* The synthetic generator does not use a fixed seed; full dataset regeneration will alter the UUIDs of the Scenario A and B MSMEs. Restore the CSV dataset via `git checkout` to retain fixed test profiles.

## 8. How To Resume Work
* **Start Backend Server**:
  ```powershell
  cd backend
  .\venv\Scripts\Activate.ps1
  python -m uvicorn app.main:app --reload
  ```
* **Start Frontend Dev Server**:
  ```powershell
  cd frontend
  npm run dev
  ```
* **Test MSME IDs**:
  * Weak MSME (Scenario A): `967b0eeb` (Starts at 180 days remaining, probability: 0.0021)
  * Closer MSME (Scenario B): `8cdd3d24` (Starts at 18 days remaining, probability: 0.7023)

