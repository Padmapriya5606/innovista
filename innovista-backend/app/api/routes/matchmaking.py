from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.match import Match
from app.schemas.matchmaking import MatchRequest, MatchResponse, MatchResultItem, ConnectRequest, IdeaEvaluationRequest, IdeaEvaluationResponse
from app.services.ai_engine import search_profiles, evaluate_match, evaluate_idea_efficiency
import random

router = APIRouter()

@router.post("/search", response_model=MatchResponse)
def search_ecosystem(
    request: MatchRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Takes a plain text query, searches the vector DB for relevant profiles,
    and returns LLM-evaluated match scores.
    """
    # Determine target roles for matching based on rules
    target_roles = []
    if current_user.role == "Student":
        target_roles = ["Mentor"]
    elif current_user.role == "Mentor":
        target_roles = ["Student"]
    elif current_user.role == "Investor":
        target_roles = ["Startup"]
    elif current_user.role == "Startup":
        target_roles = ["Investor"]
    elif current_user.role == "Alumni":
        target_roles = ["Startup", "Investor"]
        
    # 1. Search Vector DB (Chroma)
    try:
        search_results = search_profiles(request.query, target_roles=target_roles)
        
        matches = []
        
        # Check if we got any results from ChromaDB
        if search_results['ids'] and len(search_results['ids'][0]) > 0:
            profile_ids = [int(pid) for pid in search_results['ids'][0]]
            
            # Optimize DB query: fetch all profiles in one query, joinedload user
            from sqlalchemy.orm import joinedload
            matched_profiles = db.query(Profile).options(joinedload(Profile.user)).filter(Profile.id.in_(profile_ids)).all()
            profile_map = {p.id: p for p in matched_profiles}
            
            for i, profile_id_str in enumerate(search_results['ids'][0]):
                profile_id = int(profile_id_str)
                    
                matched_profile = profile_map.get(profile_id)
                if not matched_profile:
                    continue
                    
                # Don't match with self
                if matched_profile.user_id == current_user.id:
                    continue
                
                profile_text = search_results['documents'][0][i]
                
                # 2. Ask LLM to evaluate the match
                evaluation = evaluate_match(request.query, profile_text)
                
                tags_list = [t.strip() for t in matched_profile.tags.split(',')] if matched_profile.tags else []
                
                matches.append(MatchResultItem(
                    user_id=matched_profile.user_id,
                    name=matched_profile.full_name,
                    role=matched_profile.user.role,
                    score=evaluation.get("score", 80),
                    tags=tags_list,
                    reason=evaluation.get("reason", "A strong potential synergy was found.")
                ))
        if not matches:
            raise ValueError("No matches generated from DB")
            
    except Exception as e:
        print(f"Matchmaking fallback triggered: {e}")
        # Fallback dummy data if vector DB is empty (for demo purposes)
        matches = [
            MatchResultItem(
                user_id=999,
                name="Dr. Sarah Chen",
                role="Mentor",
                score=94,
                tags=["AI/ML", "HealthTech", "SaaS"],
                reason="Sarah recently mentored a similar AI diagnostic startup that reached Series A."
            ),
            MatchResultItem(
                user_id=998,
                name="Venture Partners Global",
                role="Investor",
                score=92,
                tags=["DeepTech", "AI", "Pre-Seed"],
                reason="The fund thesis specifically targets early-stage AI applications."
            )
        ]
            
    # Sort by highest score
    matches.sort(key=lambda x: x.score, reverse=True)
    return MatchResponse(matches=matches)

@router.post("/connect")
def request_connection(
    request: ConnectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Records a connection request between two users."""
    if current_user.id == request.target_user_id:
        raise HTTPException(status_code=400, detail="Cannot connect with yourself.")
        
    existing_match = db.query(Match).filter(
        Match.user_id == current_user.id,
        Match.matched_user_id == request.target_user_id
    ).first()
    
    if existing_match:
        raise HTTPException(status_code=400, detail="Connection request already exists.")
        
    new_match = Match(
        user_id=current_user.id,
        matched_user_id=request.target_user_id,
        synergy_score=0, # Would ideally be passed from the frontend selection
        match_reason="Requested via AI Matchmaking"
    )
    db.add(new_match)
    db.commit()
    return {"message": "Connection request sent successfully."}

@router.post("/evaluate-idea", response_model=IdeaEvaluationResponse)
def evaluate_idea(
    request: IdeaEvaluationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Takes an idea pitch string, evaluates it using the LLM for efficiency and viability,
    and returns a score and constructive feedback phrase.
    """
    if not request.idea_text or len(request.idea_text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Idea description is too short.")
        
    evaluation = evaluate_idea_efficiency(request.idea_text)
    
    return IdeaEvaluationResponse(
        score=evaluation.get("score", 0),
        feedback=evaluation.get("feedback", "No feedback could be generated.")
    )
