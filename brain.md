# Naadi (Din) — Project Brain

## 1. What This Project Is
**Naadi (Din)** is an AI engine that reads a small business's "financial pulse" from its GST filings, UPI payments, bank statement data (Account Aggregator), and EPFO records. Instead of providing a static credit score, it outputs a "days until credit-ready" countdown and recommends specific ranked actions that shrink that number.

**Hackathon details:** IDBI Bank National Hackathon 2026, Track 3: AI-Powered MSME Financial Health Card.
**Submission Date:** July 8.

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
* **What's built and working so far**: **Day 1 and Day 2 are COMPLETE.** We initialized the FastAPI backend, set up a CORS middleware supporting wide-open origins for browser sandbox compatibility, and scaffolded the Vite/React frontend. We trained a high-performing XGBoost model (91.67% accuracy, 0.86 F1 score) to classify MSME credit readiness, and built a custom SHAP explainability pipeline. Additionally, we developed a stateful days-calibration engine that computes "days remaining" until ready and ranks the top 3 corrective actions. These are fully exposed via stateful `/msme/{id}/score` and `/msme/{id}/action-complete` API routes that persist state directly to the CSV dataset.
* **What's in progress right now**: Day 2 complete. Ready for Day 3.
* **What's broken or blocked**: Nothing.
* **Last updated**: 2026-07-04 (Antigravity Agent)

## 5. Day-by-Day Roadmap
* [x] **Day 1**: Phase 0 Setup (Backend/Frontend initialization) and Phase 1 Synthetic Data Generation.
* [x] **Day 2**: Phase 2 Finish Model + Backend API (train the XGBoost model, add SHAP explainability, build the days-calibration logic, and expose it all through /score and /action-complete endpoints).
* [ ] **Day 3**: Phase 3 Build the frontend UI — Onboarding screen, Dashboard, and the Countdown Dial animation — initially built as a Claude.ai artifact with mock data, to be wired to the real backend afterward.
* [ ] **Day 4**: Phase 4 Frontend Integration and Routing.
* [ ] **Day 5**: Phase 5 Integration Testing (End-to-End flow).
* [ ] **Day 6**: Phase 6 Polish & Demo Script, Rehearsal, and final Submission.

## 6. Decisions & Reasoning Log
* **Used simulated synthetic data**: Since production GSTN/AA/EPFO access isn't available to student teams, we will simulate realistic data patterns. This allows us to build the real architecture without being blocked by API credentials.
* **Days-calibration as a heuristic**: We use a simple rule to map SHAP gap magnitude to an estimated "days to ready" number because we don't have real historical approval-timeline data for this hackathon. The model computes $Days = 7 + (Gap / 0.75) * 173$, placing the countdown between 7 and 180 days. Days saved are distributed proportionally according to absolute SHAP contribution weights of negative drivers.
* **SQLite over Postgres**: Selected for zero-setup simplicity given the hackathon time constraints.
* **Jupyter Notebooks Abandoned**: We abandoned Jupyter notebooks (.ipynb files) in favor of plain .py scripts due to file corruption issues. All exploration and training scripts run natively via terminal.
* **Wide-open CORS Policy**: Enabled `CORSMiddleware` with `allow_origins=["*"]` and `allow_credentials=False` to support browser sandbox connections, ensuring that frontend client pages running inside Claude.ai artifacts can query the local server.

## 7. Known Issues / Things To Watch
* The countdown dial animation is the "wow moment". Do not prioritize it.
* Avoid AWS deployments unless all core functionality is fully completed with time to spare; live demos can be done locally or via ngrok to reduce risk.
* No `.ipynb` files should be used anywhere in this project going forward. Use plain Python scripts for ML/data tasks.
* The days-calibration formula is an unvalidated mathematical heuristic and is not based on historical lender approval records.

## 8. How To Resume Work
* **Next Task**: Phase 3 - Build the frontend UI (Onboarding, Dashboard, and Countdown Dial animation) as a Claude.ai artifact, then integrate.
* **Backend Run**: `cd backend; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --reload`
* **Frontend Run**: `cd frontend; npm run dev`
* **Test MSME IDs**:
  * Weak MSME: `967b0eeb` (Starts at 180 days remaining, probability: 0.0021)
  * Closer MSME: `8cdd3d24` (Starts at 18 days remaining, probability: 0.7023)

