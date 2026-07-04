from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.score import router as score_router
from app.api.routes.actions import router as actions_router
from app.api.routes.msme import router as msme_router

app = FastAPI(title="Naadi (Din) API")

# Enable CORS for hackathon demo (e.g. Claude.ai artifact browser sandbox calls)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(score_router)
app.include_router(actions_router)
app.include_router(msme_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}

