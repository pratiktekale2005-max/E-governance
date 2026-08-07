from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.database.models import User
from app.models.response import UserResponse
from app.api.dependencies import get_current_active_user, require_roles

router = APIRouter(prefix="/users", tags=["Users Management"])


@router.get(
    "",
    response_model=List[UserResponse],
    summary="List All Users (Admin Only)",
    description="Retrieves a list of all registered users. Restricted to Admin and Moderator roles.",
)
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Moderator"])),
):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Get User By ID",
    description="Retrieves user profile by ID. Admin/Moderator or self access required.",
)
def get_user_by_id_route(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if current_user.role not in ["Admin", "Moderator"] and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You cannot view other users' profiles.",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    return user
