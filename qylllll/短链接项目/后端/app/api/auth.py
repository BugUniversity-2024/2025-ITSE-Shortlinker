from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from ..database import get_db
from ..schemas import (
    UserCreate, User, UserUpdate, UserPasswordChange,
    UserSettings, UserSettingsUpdate, UserStats, Token, Response
)
from ..crud import users as crud_users
from ..core.security import create_access_token, verify_token, verify_password
from ..core.config import settings

router = APIRouter()

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.api_prefix}/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """获取当前用户"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
    
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    
    user = crud_users.get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    
    return user


@router.post("/register", response_model=Response)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """用户注册"""
    # 检查用户名是否已存在
    if crud_users.get_user_by_username(db, username=user.username):
        raise HTTPException(
            status_code=400,
            detail="用户名已存在"
        )
    
    # 检查邮箱是否已存在
    if crud_users.get_user_by_email(db, email=user.email):
        raise HTTPException(
            status_code=400,
            detail="邮箱已存在"
        )
    
    # 创建用户
    db_user = crud_users.create_user(db=db, user=user)
    
    return Response(
        success=True,
        message="注册成功",
        data={"user_id": db_user.id}
    )


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """用户登录"""
    user = crud_users.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=User.from_orm(user)
    )


@router.get("/profile", response_model=Response)
async def get_profile(current_user: User = Depends(get_current_user)):
    """获取用户资料"""
    return Response(
        success=True,
        message="获取成功",
        data=User.from_orm(current_user).dict()
    )


@router.put("/profile", response_model=Response)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新用户资料"""
    updated_user = crud_users.update_user(db, current_user.id, user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    return Response(
        success=True,
        message="资料更新成功",
        data={"user": User.from_orm(updated_user).dict()}
    )


@router.post("/change-password", response_model=Response)
async def change_password(
    password_data: UserPasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """修改密码"""
    # 验证当前密码
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="当前密码错误")
    
    # 修改密码
    success = crud_users.change_password(db, current_user.id, password_data.new_password)
    if not success:
        raise HTTPException(status_code=500, detail="密码修改失败")
    
    return Response(
        success=True,
        message="密码修改成功"
    )


@router.get("/settings", response_model=UserSettings)
async def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户设置"""
    user_settings = crud_users.get_user_settings(db, current_user.id)
    if not user_settings:
        raise HTTPException(status_code=404, detail="设置不存在")
    
    return user_settings


@router.put("/settings", response_model=Response)
async def update_settings(
    settings_update: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新用户设置"""
    updated_settings = crud_users.update_user_settings(db, current_user.id, settings_update)
    
    return Response(
        success=True,
        message="设置更新成功",
        data={"settings": UserSettings.from_orm(updated_settings).dict()}
    )


@router.get("/stats", response_model=UserStats)
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户统计信息"""
    stats = crud_users.get_user_stats(db, current_user.id)
    return UserStats(**stats)


@router.delete("/account", response_model=Response)
async def delete_account(
    password_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除账户"""
    # 验证密码
    if not verify_password(password_data.get("password"), current_user.hashed_password):
        raise HTTPException(status_code=400, detail="密码错误")
    
    # 删除用户
    success = crud_users.delete_user(db, current_user.id)
    if not success:
        raise HTTPException(status_code=500, detail="账户删除失败")
    
    return Response(
        success=True,
        message="账户已删除"
    )