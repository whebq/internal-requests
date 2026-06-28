import math
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import asc, case, desc, func, or_
from sqlalchemy.orm import Session

from app.models import Request, RequestPriority, RequestStatus
from app.schemas.request import RequestCreate, RequestListResponse, RequestResponse, SortField, SortOrder


PRIORITY_ORDER = case(
    (Request.priority == RequestPriority.high, 3),
    (Request.priority == RequestPriority.normal, 2),
    (Request.priority == RequestPriority.low, 1),
    else_=0,
)


def _ensure_not_done(request: Request) -> None:
    if request.status == RequestStatus.done:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Заявка в статусе done недоступна для изменения",
        )


def create_request(db: Session, data: RequestCreate) -> Request:
    now = datetime.now(timezone.utc)
    request = Request(
        title=data.title,
        description=data.description,
        priority=data.priority,
        status=RequestStatus.new,
        created_at=now,
        updated_at=now,
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


def list_requests(
    db: Session,
    *,
    status_filter: RequestStatus | None,
    priority_filter: RequestPriority | None,
    search: str | None,
    sort_by: SortField,
    sort_order: SortOrder,
    page: int,
    page_size: int,
) -> RequestListResponse:
    query = db.query(Request)

    if status_filter:
        query = query.filter(Request.status == status_filter)
    if priority_filter:
        query = query.filter(Request.priority == priority_filter)
    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(Request.title.ilike(pattern), Request.description.ilike(pattern))
        )

    total = query.with_entities(func.count(Request.id)).scalar() or 0

    if sort_by == "created_at":
        order = Request.created_at.asc() if sort_order == "asc" else Request.created_at.desc()
    else:
        order = PRIORITY_ORDER.asc() if sort_order == "asc" else PRIORITY_ORDER.desc()

    items = (
        query.order_by(order, Request.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    pages = math.ceil(total / page_size) if total else 0

    return RequestListResponse(
        items=[RequestResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


def update_request_status(db: Session, request_id: int, new_status: RequestStatus) -> Request:
    request = db.get(Request, request_id)
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Заявка не найдена")

    _ensure_not_done(request)

    if request.status == RequestStatus.done and new_status != RequestStatus.done:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя изменить статус заявки из done",
        )

    request.status = new_status
    request.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(request)
    return request


def delete_request(db: Session, request_id: int) -> None:
    request = db.get(Request, request_id)
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Заявка не найдена")

    if request.status == RequestStatus.done:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Заявку в статусе done нельзя удалить",
        )

    db.delete(request)
    db.commit()
