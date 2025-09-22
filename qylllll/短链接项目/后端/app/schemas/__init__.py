from pydantic import BaseModel, EmailStr, HttpUrl, field_validator
from typing import Optional, List
from datetime import datetime
import re


# 用户相关模式
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None

    @field_validator('username')
    @classmethod
    def username_alphanumeric(cls, v):
        if not re.match(r'^[a-zA-Z0-9_]{3,20}$', v):
            raise ValueError('用户名必须是3-20位字母、数字或下划线')
        return v


class UserCreate(UserBase):
    password: str

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('密码长度至少8位')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('密码必须包含字母')
        if not re.search(r'\d', v):
            raise ValueError('密码必须包含数字')
        return v


class UserLogin(BaseModel):
    username: str
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class UserPasswordChange(BaseModel):
    current_password: str
    new_password: str

    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('密码长度至少8位')
        return v


class User(UserBase):
    id: int
    is_active: bool
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserStats(BaseModel):
    total_links: int
    total_clicks: int
    active_links: int


# 用户设置模式
class UserSettingsBase(BaseModel):
    email_notifications: bool = True
    public_profile: bool = False
    analytics_sharing: bool = False
    theme: str = "light"
    language: str = "zh-CN"
    timezone: str = "Asia/Shanghai"


class UserSettingsUpdate(UserSettingsBase):
    pass


class UserSettings(UserSettingsBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True


# 链接相关模式
class LinkBase(BaseModel):
    original_url: str  # 改为普通字符串，在验证器中处理
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[str] = None
    
    @field_validator('original_url')
    @classmethod
    def validate_url(cls, v):
        if not v:
            raise ValueError('URL不能为空')
        
        # 自动添加协议
        if not v.startswith(('http://', 'https://')):
            v = f'https://{v}'
        
        # 验证URL格式
        try:
            HttpUrl(v)
        except Exception as exc:
            raise ValueError('URL格式不正确') from exc
        
        return v
    
    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        if v and len(v) > 200:
            raise ValueError('标题长度不能超过200字符')
        return v


class LinkCreate(LinkBase):
    short_code: Optional[str] = None
    password: Optional[str] = None
    expires_at: Optional[datetime] = None
    is_public: bool = False

    @field_validator('short_code')
    @classmethod
    def validate_short_code(cls, v):
        if v and not re.match(r'^[a-zA-Z0-9_-]{3,20}$', v):
            raise ValueError('短码只能包含字母、数字、下划线和连字符，长度3-20位')
        return v


class LinkUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[str] = None
    is_active: Optional[bool] = None
    is_public: Optional[bool] = None
    password: Optional[str] = None
    expires_at: Optional[datetime] = None


class LinkBatch(BaseModel):
    urls: List[str]
    
    @field_validator('urls')
    @classmethod
    def validate_urls(cls, v):
        if len(v) > 100:
            raise ValueError('批量创建最多支持100个链接')
        return v


class Link(LinkBase):
    id: int
    short_code: str
    click_count: int
    is_active: bool
    is_public: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    owner_id: int
    
    class Config:
        from_attributes = True


class LinkInfo(BaseModel):
    """用于重定向的链接信息"""
    original_url: str
    title: Optional[str] = None
    description: Optional[str] = None
    is_active: bool
    expires_at: Optional[datetime] = None
    created_at: datetime


# 点击日志模式
class ClickCreate(BaseModel):
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    referer: Optional[str] = None


class ClickLog(BaseModel):
    id: int
    link_id: int
    ip_address: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    device_type: Optional[str] = None
    browser: Optional[str] = None
    os: Optional[str] = None
    clicked_at: datetime
    
    class Config:
        from_attributes = True


# 分析数据模式
class LinkAnalytics(BaseModel):
    summary: dict
    time_series: List[dict]
    geographic: List[dict]
    devices: List[dict]
    referrers: List[dict]


class DashboardData(BaseModel):
    total_links: int
    total_clicks: int
    unique_visitors: int
    active_links: int
    recent_links: List[Link]
    click_trends: List[dict]


# 认证相关模式
class Token(BaseModel):
    access_token: str
    token_type: str
    user: User


class TokenData(BaseModel):
    username: Optional[str] = None


# API 响应模式
class Response(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None


class PaginatedResponse(BaseModel):
    success: bool
    message: str
    data: List[dict]
    total: int
    page: int
    per_page: int
    pages: int