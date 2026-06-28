from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from app.models import RequestPriority, RequestStatus


class RequestCreate(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str | None = Field(default=None, max_length=1000)
    priority: RequestPriority = RequestPriority.normal


class RequestStatusUpdate(BaseModel):
    status: RequestStatus


class RequestResponse(BaseModel):
    id: int
    title: str
    description: str | None
    status: RequestStatus
    priority: RequestPriority
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RequestListResponse(BaseModel):
    items: list[RequestResponse]
    total: int
    page: int
    page_size: int
    pages: int


SortField = Literal["created_at", "priority"]
SortOrder = Literal["asc", "desc"]
