from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import RequestPriority, RequestStatus
from app.schemas.request import (
    RequestCreate,
    RequestListResponse,
    RequestResponse,
    RequestStatusUpdate,
    SortField,
    SortOrder,
)
from app.services.auth import verify_admin_token
from app.services import request as request_service

router = APIRouter(prefix="/requests", tags=["requests"])


def require_admin(authorization: Annotated[str | None, Header()] = None) -> None:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Требуется авторизация администратора",
        )
    token = authorization.removeprefix("Bearer ").strip()
    if not verify_admin_token(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительный токен",
        )


@router.post("", response_model=RequestResponse, status_code=status.HTTP_201_CREATED)
def create_request(payload: RequestCreate, db: Session = Depends(get_db)) -> RequestResponse:
    request = request_service.create_request(db, payload)
    return RequestResponse.model_validate(request)


@router.get("", response_model=RequestListResponse)
def list_requests(
    db: Session = Depends(get_db),
    status: RequestStatus | None = None,
    priority: RequestPriority | None = None,
    search: str | None = Query(default=None, min_length=1),
    sort_by: SortField = "created_at",
    sort_order: SortOrder = "desc",
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
) -> RequestListResponse:
    return request_service.list_requests(
        db,
        status_filter=status,
        priority_filter=priority,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size,
    )


@router.patch("/{request_id}/status", response_model=RequestResponse)
def update_status(
    request_id: int,
    payload: RequestStatusUpdate,
    db: Session = Depends(get_db),
) -> RequestResponse:
    request = request_service.update_request_status(db, request_id, payload.status)
    return RequestResponse.model_validate(request)


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_request(
    request_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
) -> None:
    request_service.delete_request(db, request_id)
