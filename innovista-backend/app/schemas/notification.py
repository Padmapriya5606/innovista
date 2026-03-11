from pydantic import BaseModel
from datetime import datetime

class NotificationResponse(BaseModel):
    id: int
    content: str
    type: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
