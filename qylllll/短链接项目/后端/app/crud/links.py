from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from typing import Optional, List
import secrets
import string
from ..models import Link, ClickLog
from ..schemas import LinkCreate, LinkUpdate, ClickCreate


def generate_short_code(length: int = 6) -> str:
    """生成短码"""
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))


def get_link(db: Session, link_id: int) -> Optional[Link]:
    """根据ID获取链接"""
    return db.query(Link).filter(Link.id == link_id).first()


def get_link_by_short_code(db: Session, short_code: str) -> Optional[Link]:
    """根据短码获取链接"""
    return db.query(Link).filter(Link.short_code == short_code).first()


def get_user_links(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Link]:
    """获取用户的链接列表"""
    return db.query(Link).filter(Link.owner_id == user_id).offset(skip).limit(limit).all()


def create_link(db: Session, link: LinkCreate, user_id: int) -> Link:
    """创建链接"""
    # 生成短码
    if link.short_code:
        short_code = link.short_code
        # 检查短码是否已存在
        if get_link_by_short_code(db, short_code):
            raise ValueError("短码已存在")
    else:
        # 自动生成唯一短码
        while True:
            short_code = generate_short_code()
            if not get_link_by_short_code(db, short_code):
                break
    
    db_link = Link(
        original_url=str(link.original_url),
        short_code=short_code,
        title=link.title,
        description=link.description,
        tags=link.tags,
        is_public=link.is_public,
        password=link.password,
        expires_at=link.expires_at,
        owner_id=user_id
    )
    
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    return db_link


def update_link(db: Session, link_id: int, link_update: LinkUpdate, user_id: int) -> Optional[Link]:
    """更新链接"""
    db_link = db.query(Link).filter(
        and_(Link.id == link_id, Link.owner_id == user_id)
    ).first()
    
    if not db_link:
        return None
    
    update_data = link_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_link, field, value)
    
    db.commit()
    db.refresh(db_link)
    return db_link


def delete_link(db: Session, link_id: int, user_id: int) -> bool:
    """删除链接"""
    db_link = db.query(Link).filter(
        and_(Link.id == link_id, Link.owner_id == user_id)
    ).first()
    
    if not db_link:
        return False
    
    db.delete(db_link)
    db.commit()
    return True


def increment_click_count(db: Session, link_id: int) -> bool:
    """增加点击次数"""
    db_link = get_link(db, link_id)
    if not db_link:
        return False
    
    db_link.click_count += 1
    db.commit()
    return True


def create_click_log(db: Session, link_id: int, click_data: ClickCreate, extra_data: dict = None) -> ClickLog:
    """创建点击日志"""
    db_click = ClickLog(
        link_id=link_id,
        ip_address=click_data.ip_address,
        user_agent=click_data.user_agent,
        referer=click_data.referer
    )
    
    # 添加额外的分析数据
    if extra_data:
        for key, value in extra_data.items():
            if hasattr(db_click, key):
                setattr(db_click, key, value)
    
    db.add(db_click)
    db.commit()
    db.refresh(db_click)
    return db_click


def get_link_clicks(db: Session, link_id: int, limit: int = 100) -> List[ClickLog]:
    """获取链接点击日志"""
    return db.query(ClickLog).filter(ClickLog.link_id == link_id).order_by(
        desc(ClickLog.clicked_at)
    ).limit(limit).all()


def search_links(db: Session, user_id: int, query: str, skip: int = 0, limit: int = 100) -> List[Link]:
    """搜索链接"""
    return db.query(Link).filter(
        and_(
            Link.owner_id == user_id,
            or_(
                Link.title.contains(query),
                Link.description.contains(query),
                Link.tags.contains(query),
                Link.original_url.contains(query)
            )
        )
    ).offset(skip).limit(limit).all()


def get_recent_links(db: Session, user_id: int, limit: int = 5) -> List[Link]:
    """获取最近创建的链接"""
    return db.query(Link).filter(Link.owner_id == user_id).order_by(
        desc(Link.created_at)
    ).limit(limit).all()


def get_popular_links(db: Session, user_id: int, limit: int = 10) -> List[Link]:
    """获取热门链接（按点击量排序）"""
    return db.query(Link).filter(Link.owner_id == user_id).order_by(
        desc(Link.click_count)
    ).limit(limit).all()


def batch_create_links(db: Session, urls: List[str], user_id: int) -> List[Link]:
    """批量创建链接"""
    links = []
    for url in urls:
        # 生成唯一短码
        while True:
            short_code = generate_short_code()
            if not get_link_by_short_code(db, short_code):
                break
        
        db_link = Link(
            original_url=url,
            short_code=short_code,
            owner_id=user_id
        )
        links.append(db_link)
    
    db.add_all(links)
    db.commit()
    
    for link in links:
        db.refresh(link)
    
    return links