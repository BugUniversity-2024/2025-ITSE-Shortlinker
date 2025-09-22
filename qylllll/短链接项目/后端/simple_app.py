from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 创建 FastAPI 应用
app = FastAPI(
    title="短链接系统",
    description="一个简单的短链接管理系统",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "短链接系统API运行正常", 
        "status": "success",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy", 
        "service": "短链接系统",
        "api_docs": "/docs"
    }

@app.get("/api/test")
def api_test():
    return {
        "message": "API测试成功",
        "timestamp": "2025-09-20",
        "endpoints": [
            "/docs - API文档",
            "/health - 健康检查",
            "/api/test - API测试"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)