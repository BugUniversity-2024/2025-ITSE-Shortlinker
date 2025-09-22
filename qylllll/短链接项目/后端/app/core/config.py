from typing import List


class Settings:
    # 应用配置
    app_name: str = "短链接系统 API"
    debug: bool = True
    api_prefix: str = "/api"
    
    # 数据库配置
    database_url: str = "sqlite:///./shortlink.db"
    
    # JWT 配置
    secret_key: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    
    # CORS 配置
    cors_origins: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # 短链接配置
    base_url: str = "http://localhost:8000"
    short_code_length: int = 6


settings = Settings()