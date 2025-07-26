from fastapi import APIRouter, Query
from service_container import service_container
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/logs", tags=["Logs"])

@router.get("/")
async def list(
    module_id: Optional[str] = Query(None, description="Filter by module ID"),
    from_timestamp: Optional[datetime] = Query(None, description="Start timestamp"),
    to_timestamp: Optional[datetime] = Query(None, description="End timestamp"),
    skip: int = Query(0, ge=0, description="Pagination skip"),
    limit: int = Query(100, gt=0, le=1000, description="Pagination limit"),
    order_direction: str = Query("desc", regex="^(asc|desc)$", description="Sort direction")
):
    return await service_container.log_controller().list(
        module_id=module_id,
        from_timestamp=from_timestamp,
        to_timestamp=to_timestamp,
        skip=skip,
        limit=limit,
        order_direction=order_direction
    )
