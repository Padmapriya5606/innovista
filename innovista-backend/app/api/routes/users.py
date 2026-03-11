from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.schemas.user import UserResponse
from app.schemas.profile import ProfileUpdate, ProfileResponse
from app.services.ai_engine import index_profile

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/profile", response_model=ProfileResponse)
def get_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.put("/profile", response_model=ProfileResponse)
def update_profile(
    profile_in: ProfileUpdate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id, **profile_in.model_dump(exclude_unset=True))
        db.add(profile)
    else:
        for var, value in profile_in.model_dump(exclude_unset=True).items():
            setattr(profile, var, value)
            
    db.commit()
    db.refresh(profile)
    
    # Index the profile into Vector DB for Matchmaking
    text_content = f"{profile.bio or ''} {profile.tags or ''} {profile.domain or ''} {profile.stage or ''}".strip()
    if text_content:
        metadata = {
            "role": current_user.role,
            "domain": profile.domain or "",
            "stage": profile.stage or ""
        }
        # Run indexing in background to keep API fast
        background_tasks.add_task(index_profile, profile.id, text_content, metadata)
        
    return profile
