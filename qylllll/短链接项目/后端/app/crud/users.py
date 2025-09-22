from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import Optional
from ..models import User, UserSettings
from ..schemas import UserCreate, UserUpdate, UserSettingsUpdate
from ..core.security import get_password_hash, verify_password


def get_user(db: Session, user_id: int) -> Optional[User]:
    """根据ID获取用户"""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """根据用户名获取用户"""
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """根据邮箱获取用户"""
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user: UserCreate) -> User:
    """创建用户"""
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # 创建默认用户设置
    user_settings = UserSettings(user_id=db_user.id)
    db.add(user_settings)
    db.commit()
    
    return db_user


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """验证用户"""
    user = get_user_by_username(db, username)
    if not user:
        user = get_user_by_email(db, username)
    
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
    """更新用户信息"""
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user


def change_password(db: Session, user_id: int, new_password: str) -> bool:
    """修改密码"""
    db_user = get_user(db, user_id)
    if not db_user:
        return False
    
    db_user.hashed_password = get_password_hash(new_password)
    db.commit()
    return True


def get_user_settings(db: Session, user_id: int) -> Optional[UserSettings]:
    """获取用户设置"""
    return db.query(UserSettings).filter(UserSettings.user_id == user_id).first()


def update_user_settings(db: Session, user_id: int, settings: UserSettingsUpdate) -> Optional[UserSettings]:
    """更新用户设置"""
    db_settings = get_user_settings(db, user_id)
    if not db_settings:
        # 如果设置不存在，创建新的
        db_settings = UserSettings(user_id=user_id)
        db.add(db_settings)
    
    update_data = settings.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_settings, field, value)
    
    db.commit()
    db.refresh(db_settings)
    return db_settings


def delete_user(db: Session, user_id: int) -> bool:
    """删除用户"""
    db_user = get_user(db, user_id)
    if not db_user:
        return False
    
    db.delete(db_user)
    db.commit()
    return True


def get_user_stats(db: Session, user_id: int) -> dict:
    """获取用户统计信息"""
    from ..models import Link, ClickLog
    
    # 总链接数
    total_links = db.query(Link).filter(Link.owner_id == user_id).count()
    
    # 活跃链接数
    active_links = db.query(Link).filter(
        and_(Link.owner_id == user_id, Link.is_active == True)
    ).count()
    
    # 总点击数
    total_clicks = db.query(Link).filter(Link.owner_id == user_id).with_entities(
        func.sum(Link.click_count)
    ).scalar() or 0
    
    return {
        "total_links": total_links,
        "active_links": active_links,
        "total_clicks": total_clicks
    }