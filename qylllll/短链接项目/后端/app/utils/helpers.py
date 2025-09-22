import qrcode
from io import BytesIO
import base64
from user_agents import parse
import re
from typing import Optional, Dict, Any


def generate_qr_code(url: str, size: int = 10, border: int = 4) -> str:
    """生成二维码并返回 base64 编码的图片"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=size,
        border=border,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # 转换为 base64
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"


def parse_user_agent(user_agent: str) -> Dict[str, Optional[str]]:
    """解析 User-Agent 字符串"""
    if not user_agent:
        return {
            "browser": None,
            "os": None,
            "device_type": None
        }
    
    ua = parse(user_agent)
    
    # 设备类型判断
    device_type = "desktop"
    if ua.is_mobile:
        device_type = "mobile"
    elif ua.is_tablet:
        device_type = "tablet"
    
    return {
        "browser": ua.browser.family if ua.browser.family else None,
        "os": ua.os.family if ua.os.family else None,
        "device_type": device_type
    }


def extract_domain(url: str) -> Optional[str]:
    """从 URL 中提取域名"""
    if not url:
        return None
    
    # 简单的域名提取
    pattern = r'https?://(?:www\.)?([^/]+)'
    match = re.search(pattern, url)
    return match.group(1) if match else None


def is_valid_url(url: str) -> bool:
    """验证 URL 格式"""
    pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    return pattern.match(url) is not None


def get_country_by_ip(ip_address: str) -> Optional[str]:
    """根据 IP 地址获取国家（需要 GeoIP 数据库）"""
    # 这里是示例实现，实际需要配置 GeoIP 数据库
    # try:
    #     import geoip2.database
    #     reader = geoip2.database.Reader('GeoLite2-Country.mmdb')
    #     response = reader.country(ip_address)
    #     return response.country.name
    # except:
    #     return None
    
    # 简单的示例实现
    if not ip_address or ip_address in ['127.0.0.1', 'localhost']:
        return "China"
    return "Unknown"


def get_city_by_ip(ip_address: str) -> Optional[str]:
    """根据 IP 地址获取城市"""
    # 简单的示例实现
    if not ip_address or ip_address in ['127.0.0.1', 'localhost']:
        return "Beijing"
    return "Unknown"


def format_click_count(count: int) -> str:
    """格式化点击数显示"""
    if count < 1000:
        return str(count)
    elif count < 1000000:
        return f"{count/1000:.1f}K"
    else:
        return f"{count/1000000:.1f}M"


def validate_short_code(short_code: str) -> bool:
    """验证短码格式"""
    if not short_code:
        return False
    
    # 只允许字母、数字、下划线和连字符，长度3-20位
    pattern = r'^[a-zA-Z0-9_-]{3,20}$'
    return bool(re.match(pattern, short_code))


def sanitize_string(text: str, max_length: int = 200) -> str:
    """清理和截断字符串"""
    if not text:
        return ""
    
    # 移除特殊字符
    text = re.sub(r'[^\w\s\u4e00-\u9fff]', '', text)
    
    # 截断长度
    if len(text) > max_length:
        text = text[:max_length] + "..."
    
    return text.strip()


def get_referrer_domain(referrer: str) -> str:
    """从 referrer 中提取域名"""
    if not referrer:
        return "Direct"
    
    domain = extract_domain(referrer)
    if not domain:
        return "Unknown"
    
    # 常见搜索引擎和社交媒体识别
    if "google" in domain:
        return "Google"
    elif "baidu" in domain:
        return "Baidu"
    elif "bing" in domain:
        return "Bing"
    elif "facebook" in domain:
        return "Facebook"
    elif "twitter" in domain:
        return "Twitter"
    elif "weibo" in domain:
        return "Weibo"
    elif "wechat" in domain:
        return "WeChat"
    else:
        return domain


def calculate_percentage(part: int, total: int) -> float:
    """计算百分比"""
    if total == 0:
        return 0.0
    return round((part / total) * 100, 2)


def generate_analytics_summary(clicks: list, unique_clicks: int) -> Dict[str, Any]:
    """生成分析数据摘要"""
    if not clicks:
        return {
            "total_clicks": 0,
            "unique_clicks": 0,
            "peak_hour": "00:00",
            "peak_day": None,
            "avg_daily_clicks": 0
        }
    
    from collections import Counter
    from datetime import datetime
    
    # 按小时统计
    hours = [click.clicked_at.hour for click in clicks]
    hour_counter = Counter(hours)
    peak_hour = hour_counter.most_common(1)[0][0] if hour_counter else 0
    
    # 按天统计
    days = [click.clicked_at.date() for click in clicks]
    day_counter = Counter(days)
    peak_day = day_counter.most_common(1)[0][0] if day_counter else None
    
    # 平均每日点击数
    unique_days = len(day_counter)
    avg_daily_clicks = len(clicks) / unique_days if unique_days > 0 else 0
    
    return {
        "total_clicks": len(clicks),
        "unique_clicks": unique_clicks,
        "peak_hour": f"{peak_hour:02d}:00",
        "peak_day": peak_day.isoformat() if peak_day else None,
        "avg_daily_clicks": round(avg_daily_clicks, 2)
    }