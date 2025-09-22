import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import get_db, Base

# 测试数据库
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建测试表
Base.metadata.create_all(bind=engine)


def override_get_db():
    """覆盖数据库依赖"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


def test_root():
    """测试根路径"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "短链接系统 API" in data["message"]


def test_health_check():
    """测试健康检查"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_register_user():
    """测试用户注册"""
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123",
        "full_name": "Test User"
    }
    
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "user_id" in data["data"]


def test_login_user():
    """测试用户登录"""
    # 首先注册用户
    user_data = {
        "username": "logintest",
        "email": "login@example.com",
        "password": "loginpass123"
    }
    client.post("/api/auth/register", json=user_data)
    
    # 然后登录
    login_data = {
        "username": "logintest",
        "password": "loginpass123"
    }
    
    response = client.post("/api/auth/login", data=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_create_link():
    """测试创建链接"""
    # 先注册并登录用户
    user_data = {
        "username": "linktest",
        "email": "link@example.com",
        "password": "linkpass123"
    }
    client.post("/api/auth/register", json=user_data)
    
    login_response = client.post("/api/auth/login", data={
        "username": "linktest",
        "password": "linkpass123"
    })
    token = login_response.json()["access_token"]
    
    # 创建链接
    link_data = {
        "original_url": "https://www.example.com",
        "title": "Example Website"
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/api/links/create", json=link_data, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "link" in data["data"]
    assert "short_url" in data["data"]


def test_redirect_link():
    """测试链接重定向"""
    # 创建一个链接
    user_data = {
        "username": "redirecttest",
        "email": "redirect@example.com", 
        "password": "redirectpass123"
    }
    client.post("/api/auth/register", json=user_data)
    
    login_response = client.post("/api/auth/login", data={
        "username": "redirecttest",
        "password": "redirectpass123"
    })
    token = login_response.json()["access_token"]
    
    link_data = {
        "original_url": "https://www.google.com",
        "short_code": "testcode"
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    create_response = client.post("/api/links/create", json=link_data, headers=headers)
    
    # 测试重定向
    response = client.get("/testcode", allow_redirects=False)
    assert response.status_code == 302
    assert response.headers["location"] == "https://www.google.com"


if __name__ == "__main__":
    pytest.main([__file__])