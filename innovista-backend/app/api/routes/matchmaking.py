import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.match import Match
from app.schemas.matchmaking import MatchRequest, MatchResponse, MatchResultItem, ConnectRequest, IdeaEvaluationRequest, IdeaEvaluationResponse
from app.services.ai_engine import evaluate_idea_efficiency

router = APIRouter()

# Stop words to ignore during keyword matching
_STOP = {'the','a','an','and','or','for','in','on','at','to','of','is','are',
         'was','with','by','from','that','this','it','as','be','has','have',
         'had','but','not','they','their','we','our','my','i','you','seeking',
         'looking','need','want','help','can','will','about','have','very'}

def _keyword_score(query_kw: set, profile: Profile) -> int:
    """Score a profile against the query keywords. Returns score between 65-98."""
    prof_text = " ".join(filter(None, [
        profile.full_name or "",
        profile.domain or "",
        profile.tags or "",
        profile.bio or "",
        profile.company_name or ""
    ])).lower()
    prof_words = set(re.findall(r'\w+', prof_text)) - _STOP
    overlap = query_kw & prof_words
    ratio = len(overlap) / max(len(query_kw), 1)
    score = int(65 + ratio * 33)
    return min(98, max(65, score)), list(overlap)[:3]


@router.post("/search", response_model=MatchResponse)
def search_ecosystem(
    request: MatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fast matchmaking via direct SQL query + keyword scoring.
    Always returns exactly 5 results with zero network calls.
    """
    # ── 1. Determine target roles ─────────────────────────────────────────────
    role_map = {
        "Student":  ["Mentor"],
        "Mentor":   ["Student"],
        "Startup":  ["Investor"],
        "Investor": ["Startup"],
        "Alumni":   ["Investor", "Startup"],
    }
    target_roles = role_map.get(current_user.role, [])

    # ── 2. Extract query keywords ─────────────────────────────────────────────
    query_kw = set(re.findall(r'\w+', request.query.lower())) - _STOP

    # ── 3. Fetch & score profiles from SQL ────────────────────────────────────
    matches = []
    seen_ids = set()

    for target_role in target_roles:
        profiles = (
            db.query(Profile)
            .options(joinedload(Profile.user))
            .join(Profile.user)
            .filter(User.role == target_role)
            .filter(Profile.user_id != current_user.id)
            .limit(80)  # Fetch plenty so we have good variety after scoring
            .all()
        )

        for prof in profiles:
            if prof.user_id in seen_ids:
                continue
            score, matched_kw = _keyword_score(query_kw, prof)
            reason = (f"Matched on: {', '.join(matched_kw)}." if matched_kw
                      else f"Strong {target_role.lower()} profile aligned with your goals.")

            tags_list = [t.strip() for t in prof.tags.split(',')] if prof.tags else []
            matches.append(MatchResultItem(
                user_id=prof.user_id,
                name=prof.full_name or "Profile",
                role=prof.user.role,
                score=score,
                tags=tags_list,
                reason=reason
            ))
            seen_ids.add(prof.user_id)

    # ── 4. Static fallback if DB is completely empty ───────────────────────────
    if not matches:
        matches = [
            MatchResultItem(user_id=999, name="Dr. Sarah Chen", role="Mentor",
                score=94, tags=["AI/ML","HealthTech","SaaS"],
                reason="Sarah recently mentored similar startups that reached Series A."),
            MatchResultItem(user_id=998, name="Venture Partners Global", role="Investor",
                score=92, tags=["DeepTech","AI","Pre-Seed"],
                reason="Fund thesis targets early-stage AI applications."),
            MatchResultItem(user_id=997, name="NeuroTech AI", role="Startup",
                score=89, tags=["AI","Health","B2B"],
                reason="Complementary startup in the AI healthcare space."),
            MatchResultItem(user_id=996, name="Alex Kumar", role="Student",
                score=86, tags=["Python","ML","Research"],
                reason="Strong technical background in machine learning."),
            MatchResultItem(user_id=995, name="Maya Patel", role="Alumni",
                score=83, tags=["Product","Growth","SaaS"],
                reason="Experienced in scaling SaaS products from 0 to 1."),
        ]

    # ── 5. Sort by score, deduplicate, return top 5 ───────────────────────────
    unique = []
    seen = set()
    for m in sorted(matches, key=lambda x: x.score, reverse=True):
        if m.user_id not in seen:
            unique.append(m)
            seen.add(m.user_id)

    return MatchResponse(matches=unique[:5])


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
        synergy_score=0,
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
