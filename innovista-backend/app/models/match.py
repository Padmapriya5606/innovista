from sqlalchemy import Column, Integer, String, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    matched_user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    
    synergy_score = Column(Integer, nullable=False)
    match_reason = Column(Text, nullable=False)
    status = Column(String, default="Pending") # Pending, Connected, Rejected

    # Prevent a user from matching with themselves
    __table_args__ = (
        CheckConstraint('user_id != matched_user_id', name='check_not_self_match'),
    )

    user = relationship("User", foreign_keys=[user_id], backref="initiated_matches")
    matched_user = relationship("User", foreign_keys=[matched_user_id], backref="received_matches")
