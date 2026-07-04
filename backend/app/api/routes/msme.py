from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db.database import get_msme

router = APIRouter()

class ConnectRequest(BaseModel):
    msme_id: str
    sources: list[str]  # e.g. ["gst", "upi", "bank", "epfo"]

class ConnectResponse(BaseModel):
    msme_id: str
    connected_sources: list[str]
    business_name: str
    discipline_level: str
    has_employees: bool

@router.post("/msme/connect", response_model=ConnectResponse)
def connect_msme(payload: ConnectRequest):
    """
    Validates that the given MSME exists in our database and 'connects'
    the requested data sources. In production this would trigger real
    OAuth/AA consent flows; for the hackathon demo it validates the ID
    and returns confirmation with basic business metadata.
    """
    msme_id = payload.msme_id.strip()
    if not msme_id:
        raise HTTPException(status_code=400, detail="msme_id is required")

    msme_data = get_msme(msme_id)
    if not msme_data:
        raise HTTPException(
            status_code=404,
            detail=f"No business found with ID '{msme_id}'. Check the ID and try again."
        )

    valid_sources = {"gst", "upi", "bank", "epfo"}
    requested = [s.lower().strip() for s in payload.sources]
    invalid = [s for s in requested if s not in valid_sources]
    if invalid:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown data sources: {invalid}. Valid sources are: {sorted(valid_sources)}"
        )

    return ConnectResponse(
        msme_id=msme_id,
        connected_sources=requested,
        business_name=f"MSME {msme_id[:8]}",
        discipline_level=msme_data.get("discipline_level", "unknown"),
        has_employees=msme_data.get("has_employees", False),
    )
