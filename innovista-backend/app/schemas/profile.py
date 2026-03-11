from pydantic import BaseModel
from typing import Optional

class ProfileBase(BaseModel):
    full_name: str
    phone: Optional[str] = None
    company_name: Optional[str] = None
    domain: Optional[str] = None
    stage: Optional[str] = None
    tags: Optional[str] = None
    bio: Optional[str] = None

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
