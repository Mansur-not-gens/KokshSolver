from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas
from app.database import get_db

router = APIRouter()

# сколько голосов нужно, чтобы пост стал важным
IMPORTANT_THRESHOLD = 300

# ------------------- CREATE POST -------------------
@router.post("/", response_model=schemas.PostResponse)
def create_post(post: schemas.PostCreate, db: Session = Depends(get_db)):
    db_post = models.Post(
        title=post.title,
        content=post.content,
        image_url=post.image_url
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


# ------------------- GET ALL POSTS -------------------
@router.get("/", response_model=List[schemas.PostResponse])
def get_posts(db: Session = Depends(get_db)):
    posts = db.query(models.Post).order_by(models.Post.created_at.desc()).all()
    return posts


# ------------------- GET POST BY ID -------------------
@router.get("/{post_id}", response_model=schemas.PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


# ------------------- VOTE FOR POST -------------------
@router.post("/{post_id}/vote", response_model=schemas.PostResponse)
def vote_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.votes += 1
    if post.votes >= IMPORTANT_THRESHOLD:
        post.is_important = True

    db.commit()
    db.refresh(post)
    return post
