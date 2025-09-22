from fastapi import FastAPI

app = FastAPI(title="短链接系统", description="一个简单的短链接管理系统")

@app.get("/")
def read_root():
    return {"message": "短链接系统运行正常", "status": "success"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "短链接系统"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)