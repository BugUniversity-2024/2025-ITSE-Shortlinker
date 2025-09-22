from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..schemas import (
    LinkCreate, LinkUpdate, Link, LinkBatch, Response, PaginatedResponse
)
from ..crud import links as crud_links
from .auth import get_current_user
from ..models import User

router = APIRouter()


@router.post("/create", response_model=Response)
async def create_link(
    link: LinkCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建短链接"""
    try:
        db_link = crud_links.create_link(db=db, link=link, user_id=current_user.id)
        
        # 直接返回链接数据，包含short_url
        link_data = Link.from_orm(db_link).dict()
        link_data['short_url'] = f"http://localhost:8000/{db_link.short_code}"
        
        return Response(
            success=True,
            message="链接创建成功",
            data=link_data
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/batch", response_model=Response)
async def batch_create_links(
    links_data: LinkBatch,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """批量创建短链接"""
    try:
        db_links = crud_links.batch_create_links(db=db, urls=links_data.urls, user_id=current_user.id)
        
        links_result = []
        for db_link in db_links:
            links_result.append({
                "id": db_link.id,
                "original_url": db_link.original_url,
                "short_code": db_link.short_code,
                "short_url": f"http://localhost:8000/{db_link.short_code}"
            })
        
        return Response(
            success=True,
            message=f"成功创建 {len(db_links)} 个链接",
            data={"links": links_result}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=Response)
async def get_links(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户的链接列表"""
    if search:
        links = crud_links.search_links(db, current_user.id, search, skip, limit)
        total = len(links)  # 简化实现
    else:
        links = crud_links.get_user_links(db, current_user.id, skip, limit)
        total = len(links)  # 实际应该查询总数
    
    links_data = [Link.from_orm(link).dict() for link in links]
    
    return Response(
        success=True,
        message="获取成功",
        data={
            "links": links_data,
            "pagination": {
                "current_page": skip // limit + 1,
                "per_page": limit,
                "total": total,
                "total_pages": (total + limit - 1) // limit
            }
        }
    )


@router.get("/{link_id}", response_model=Response)
async def get_link(
    link_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取单个链接详情"""
    link = crud_links.get_link(db, link_id)
    if not link or link.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="链接不存在")
    
    return Response(
        success=True,
        message="获取成功",
        data={"link": Link.from_orm(link).dict()}
    )


@router.put("/{link_id}", response_model=Response)
async def update_link(
    link_id: int,
    link_update: LinkUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新链接"""
    db_link = crud_links.update_link(db, link_id, link_update, current_user.id)
    if not db_link:
        raise HTTPException(status_code=404, detail="链接不存在")
    
    return Response(
        success=True,
        message="链接更新成功",
        data={"link": Link.from_orm(db_link).dict()}
    )


@router.delete("/{link_id}", response_model=Response)
async def delete_link(
    link_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除链接"""
    success = crud_links.delete_link(db, link_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="链接不存在")
    
    return Response(
        success=True,
        message="链接删除成功"
    )


@router.get("/recent/list", response_model=Response)
async def get_recent_links(
    limit: int = Query(5, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取最近创建的链接"""
    links = crud_links.get_recent_links(db, current_user.id, limit)
    links_data = [Link.from_orm(link).dict() for link in links]
    
    return Response(
        success=True,
        message="获取成功",
        data={"links": links_data}
    )


@router.get("/popular/list", response_model=Response)
async def get_popular_links(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取热门链接"""
    links = crud_links.get_popular_links(db, current_user.id, limit)
    links_data = [Link.from_orm(link).dict() for link in links]
    
    return Response(
        success=True,
        message="获取成功",
        data={"links": links_data}
    )


@router.post("/{link_id}/toggle-status", response_model=Response)
async def toggle_link_status(
    link_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """切换链接状态（启用/禁用）"""
    link = crud_links.get_link(db, link_id)
    if not link or link.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="链接不存在")
    
    from ..schemas import LinkUpdate
    link_update = LinkUpdate(is_active=not link.is_active)
    db_link = crud_links.update_link(db, link_id, link_update, current_user.id)
    
    status_text = "启用" if db_link.is_active else "禁用"
    
    return Response(
        success=True,
        message=f"链接已{status_text}",
        data={"link": Link.from_orm(db_link).dict()}
    )


@router.get("/{link_id}/clicks", response_model=Response)
async def get_link_clicks(
    link_id: int,
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取链接点击日志"""
    link = crud_links.get_link(db, link_id)
    if not link or link.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="链接不存在")
    
    clicks = crud_links.get_link_clicks(db, link_id, limit)
    
    from ..schemas import ClickLog
    clicks_data = [ClickLog.from_orm(click).dict() for click in clicks]
    
    return Response(
        success=True,
        message="获取成功",
        data={"clicks": clicks_data}
    )