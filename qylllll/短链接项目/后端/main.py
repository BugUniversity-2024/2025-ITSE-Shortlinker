from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uvicorn

from app.database import get_db, create_tables
from app.core.config import settings
from app.api import auth
from app.crud import links as crud_links
from app.utils.helpers import parse_user_agent, get_country_by_ip, get_city_by_ip

# 创建 FastAPI 应用
app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含路由
app.include_router(auth.router, prefix=f"{settings.api_prefix}/auth", tags=["认证"])

# 导入其他路由模块
from app.api import links, analytics

app.include_router(links.router, prefix=f"{settings.api_prefix}/links", tags=["链接管理"])
app.include_router(analytics.router, prefix=f"{settings.api_prefix}/analytics", tags=["数据分析"])

# 创建数据库表
create_tables()


@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "短链接系统 API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy"}


@app.get("/qr/{short_code}")
async def get_qr_code(short_code: str, db: Session = Depends(get_db)):
    """生成二维码"""
    import qrcode
    from io import BytesIO
    from fastapi.responses import StreamingResponse
    
    # 获取链接
    link = crud_links.get_link_by_short_code(db, short_code)
    if not link:
        raise HTTPException(status_code=404, detail="链接不存在")
    
    # 生成二维码
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(f"http://localhost:8000/{short_code}")
    qr.make(fit=True)
    
    # 创建图片
    img = qr.make_image(fill_color="black", back_color="white")
    
    # 转换为字节流
    img_buffer = BytesIO()
    img.save(img_buffer, format='PNG')
    img_buffer.seek(0)
    
    return StreamingResponse(
        img_buffer, 
        media_type="image/png",
        headers={"Content-Disposition": "inline; filename=qr.png"}
    )


@app.get("/{short_code}")
async def redirect_link(short_code: str, request: Request, db: Session = Depends(get_db)):
    """短链接重定向"""
    # 获取链接信息
    link = crud_links.get_link_by_short_code(db, short_code)
    if not link:
        raise HTTPException(status_code=404, detail="链接不存在")
    
    # 检查链接是否激活
    if not link.is_active:
        raise HTTPException(status_code=410, detail="链接已禁用")
    
    # 检查是否过期
    from datetime import datetime
    if link.expires_at and datetime.utcnow() > link.expires_at:
        raise HTTPException(status_code=410, detail="链接已过期")
    
    # 获取访问信息
    ip_address = request.client.host
    user_agent = request.headers.get("user-agent", "")
    referer = request.headers.get("referer", "")
    
    # 解析 User-Agent
    ua_info = parse_user_agent(user_agent)
    
    # 获取地理位置信息
    country = get_country_by_ip(ip_address)
    city = get_city_by_ip(ip_address)
    
    # 记录点击日志
    from app.schemas import ClickCreate
    click_data = ClickCreate(
        ip_address=ip_address,
        user_agent=user_agent,
        referer=referer
    )
    
    extra_data = {
        "country": country,
        "city": city,
        "device_type": ua_info["device_type"],
        "browser": ua_info["browser"],
        "os": ua_info["os"]
    }
    
    crud_links.create_click_log(db, link.id, click_data, extra_data)
    crud_links.increment_click_count(db, link.id)
    
    # 重定向
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=str(link.original_url), status_code=302)


@app.get("/api/redirect/{short_code}")
async def get_link_info(short_code: str, db: Session = Depends(get_db)):
    """获取链接信息（用于预览）"""
    link = crud_links.get_link_by_short_code(db, short_code)
    if not link:
        raise HTTPException(status_code=404, detail="链接不存在")
    
    from app.schemas import LinkInfo, Response as ApiResponse
    link_info = LinkInfo(
        original_url=link.original_url,
        title=link.title,
        description=link.description,
        is_active=link.is_active,
        expires_at=link.expires_at,
        created_at=link.created_at
    )
    
    return ApiResponse(
        success=True,
        message="获取成功",
        data=link_info.dict()
    )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )