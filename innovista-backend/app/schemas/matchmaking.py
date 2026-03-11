from pydantic import BaseModel
from typing import List

class MatchRequest(BaseModel):
    query: str

class MatchResultItem(BaseModel):
    user_id: int
    name: str
    role: str
    score: int
    tags: List[str]
    reason: str

class MatchResponse(BaseModel):
    matches: List[MatchResultItem]

class ConnectRequest(BaseModel):
    target_user_id: int

class IdeaEvaluationRequest(BaseModel):
    idea_text: str

class IdeaEvaluationResponse(BaseModel):
    score: int
    feedback: str
