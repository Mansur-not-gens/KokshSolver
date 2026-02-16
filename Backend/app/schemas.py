from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


# ---------- COMMENTS ----------

class CommentCreate(BaseModel):
    text: str


class CommentResponse(BaseModel):
    id: int
    text: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- POSTS ----------

class PostCreate(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None


class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    image_url: Optional[str]
    votes: int
    is_important: bool
    created_at: datetime
    comments: List[CommentResponse] = []

    class Config:
        from_attributes = True
