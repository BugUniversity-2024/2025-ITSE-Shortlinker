from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from collections import Counter

from ..database import get_db
from ..schemas import Response
from ..crud import links as crud_links
from .auth import get_current_user
from ..models import User, ClickLog
from ..utils.helpers import generate_analytics_summary, calculate_percentage

router = APIRouter()


@router.get("/dashboard", response_model=Response)
async def get_dashboard_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取仪表板数据"""
    # 获取用户统计
    from ..crud.users import get_user_stats
    stats = get_user_stats(db, current_user.id)
    
    # 获取最近链接
    recent_links = crud_links.get_recent_links(db, current_user.id, 5)
    
    # 获取点击趋势（最近7天）
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=7)
    
    # 查询最近7天的点击数据
    from sqlalchemy import and_, func
    from ..models import Link
    
    daily_clicks = db.query(
        func.date(ClickLog.clicked_at).label('date'),
        func.count(ClickLog.id).label('clicks')
    ).join(Link).filter(
        and_(
            Link.owner_id == current_user.id,
            ClickLog.clicked_at >= start_date
        )
    ).group_by(func.date(ClickLog.clicked_at)).all()
    
    # 格式化趋势数据
    click_trends = []
    for i in range(7):
        date = (start_date + timedelta(days=i)).date()
        clicks = next((item.clicks for item in daily_clicks if item.date == date), 0)
        click_trends.append({
            "date": date.isoformat(),
            "clicks": clicks
        })
    
    # 独立访客数（简化计算）
    unique_visitors = db.query(ClickLog.ip_address).join(Link).filter(
        Link.owner_id == current_user.id
    ).distinct().count()
    
    from ..schemas import Link as LinkSchema
    dashboard_data = {
        "total_links": stats["total_links"],
        "total_clicks": stats["total_clicks"],
        "unique_visitors": unique_visitors,
        "active_links": stats["active_links"],
        "recent_links": [LinkSchema.from_orm(link).dict() for link in recent_links],
        "click_trends": click_trends
    }
    
    return Response(
        success=True,
        message="获取成功",
        data=dashboard_data
    )


@router.get("/links/{link_id}", response_model=Response)
async def get_link_analytics(
    link_id: int,
    period: str = Query("week", regex="^(day|week|month|year)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取链接详细分析数据"""
    # 验证链接所有权
    link = crud_links.get_link(db, link_id)
    if not link or link.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="链接不存在")
    
    # 计算时间范围
    end_date = datetime.utcnow()
    if period == "day":
        start_date = end_date - timedelta(days=1)
    elif period == "week":
        start_date = end_date - timedelta(weeks=1)
    elif period == "month":
        start_date = end_date - timedelta(days=30)
    else:  # year
        start_date = end_date - timedelta(days=365)
    
    # 获取点击日志
    from sqlalchemy import and_
    clicks = db.query(ClickLog).filter(
        and_(
            ClickLog.link_id == link_id,
            ClickLog.clicked_at >= start_date
        )
    ).all()
    
    if not clicks:
        empty_analytics = {
            "summary": generate_analytics_summary([], 0),
            "time_series": [],
            "geographic": [],
            "devices": [],
            "referrers": []
        }
        
        return Response(
            success=True,
            message="获取成功",
            data=empty_analytics
        )
    
    # 独立访客数
    unique_clicks = len(set(click.ip_address for click in clicks if click.ip_address))
    
    # 生成摘要
    summary = generate_analytics_summary(clicks, unique_clicks)
    
    # 时间序列数据
    time_series = []
    click_dates = Counter([click.clicked_at.date() for click in clicks])
    
    current_date = start_date.date()
    while current_date <= end_date.date():
        clicks_count = click_dates.get(current_date, 0)
        unique_count = len(set(
            click.ip_address for click in clicks 
            if click.clicked_at.date() == current_date and click.ip_address
        ))
        
        time_series.append({
            "date": current_date.isoformat(),
            "clicks": clicks_count,
            "unique_clicks": unique_count
        })
        current_date += timedelta(days=1)
    
    # 地理分布
    countries = Counter([click.country for click in clicks if click.country])
    total_geo_clicks = sum(countries.values())
    
    geographic = []
    for country, count in countries.most_common(10):
        geographic.append({
            "country": country,
            "clicks": count,
            "percentage": calculate_percentage(count, total_geo_clicks)
        })
    
    # 设备分析
    devices = Counter([click.device_type for click in clicks if click.device_type])
    total_device_clicks = sum(devices.values())
    
    device_data = []
    for device, count in devices.most_common():
        device_data.append({
            "type": device,
            "clicks": count,
            "percentage": calculate_percentage(count, total_device_clicks)
        })
    
    # 来源分析
    from ..utils.helpers import get_referrer_domain
    referrers = Counter([
        get_referrer_domain(click.referer) for click in clicks
    ])
    total_referrer_clicks = sum(referrers.values())
    
    referrer_data = []
    for source, count in referrers.most_common(10):
        referrer_data.append({
            "source": source,
            "clicks": count,
            "percentage": calculate_percentage(count, total_referrer_clicks)
        })
    
    analytics_data = {
        "summary": summary,
        "time_series": time_series,
        "geographic": geographic,
        "devices": device_data,
        "referrers": referrer_data
    }
    
    return Response(
        success=True,
        message="获取成功",
        data=analytics_data
    )


@router.get("/export/{link_id}")
async def export_analytics(
    link_id: int,
    export_format: str = Query("csv", regex="^(csv|json)$"),
    period: str = Query("week", regex="^(day|week|month|year)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """导出分析数据"""
    # 验证链接所有权
    link = crud_links.get_link(db, link_id)
    if not link or link.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="链接不存在")
    
    # 获取点击数据
    end_date = datetime.utcnow()
    if period == "day":
        start_date = end_date - timedelta(days=1)
    elif period == "week":
        start_date = end_date - timedelta(weeks=1)
    elif period == "month":
        start_date = end_date - timedelta(days=30)
    else:  # year
        start_date = end_date - timedelta(days=365)
    
    from sqlalchemy import and_
    clicks = db.query(ClickLog).filter(
        and_(
            ClickLog.link_id == link_id,
            ClickLog.clicked_at >= start_date
        )
    ).all()
    
    if export_format == "csv":
        import csv
        from io import StringIO
        
        output = StringIO()
        writer = csv.writer(output)
        
        # 写入标题行
        writer.writerow([
            "点击时间", "IP地址", "国家", "城市", "设备类型", 
            "浏览器", "操作系统", "来源"
        ])
        
        # 写入数据行
        for click in clicks:
            writer.writerow([
                click.clicked_at.isoformat(),
                click.ip_address or "",
                click.country or "",
                click.city or "",
                click.device_type or "",
                click.browser or "",
                click.os or "",
                click.referer or ""
            ])
        
        from fastapi.responses import Response as FastAPIResponse
        return FastAPIResponse(
            content=output.getvalue(),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=analytics_{link_id}_{period}.csv"
            }
        )
    
    else:  # json
        import json
        
        data = []
        for click in clicks:
            data.append({
                "clicked_at": click.clicked_at.isoformat(),
                "ip_address": click.ip_address,
                "country": click.country,
                "city": click.city,
                "device_type": click.device_type,
                "browser": click.browser,
                "os": click.os,
                "referer": click.referer
            })
        
        from fastapi.responses import Response as FastAPIResponse
        return FastAPIResponse(
            content=json.dumps(data, ensure_ascii=False, indent=2),
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename=analytics_{link_id}_{period}.json"
            }
        )