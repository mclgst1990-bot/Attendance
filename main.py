from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncpg
import aioredis
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    app.state.pg_pool = await asyncpg.create_pool(
        dsn=os.getenv("DATABASE_URL"),
        min_size=10,
        max_size=50
    )
    app.state.redis = await aioredis.create_redis_pool(
        os.getenv("REDIS_URL")
    )
    yield
    # Shutdown
    await app.state.pg_pool.close()
    app.state.redis.close()
    await app.state.redis.wait_closed()

app = FastAPI(
    title="Sales Attendance Payroll System",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.v1.api import api_router
app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 10000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False
    )
