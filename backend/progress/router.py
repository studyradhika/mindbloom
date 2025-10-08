from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.progress import ProgressSummary
from models.user import User
from auth.router import get_current_user, get_database
from progress.logic import get_progress_analytics

router = APIRouter()

@router.get("/", response_model=ProgressSummary)
async def get_user_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get comprehensive progress analytics for the authenticated user.
    
    This endpoint returns:
    - Overall performance statistics
    - Focus area analytics with trends
    - Performance trends over time
    - Identified improvement areas and strengths
    """
    try:
        progress_summary = await get_progress_analytics(current_user.id, db)
        return progress_summary
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve progress analytics: {str(e)}"
        )