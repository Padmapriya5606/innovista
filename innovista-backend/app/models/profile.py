from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True, nullable=False)
    
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    domain = Column(String, nullable=True) 
    stage = Column(String, nullable=True)
    tags = Column(String, nullable=True) # Stored as comma-separated values for simplicity
    bio = Column(Text, nullable=True)

    user = relationship("User", backref="profile")
