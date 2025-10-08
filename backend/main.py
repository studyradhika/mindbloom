import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Import routers
from auth.router import router as auth_router
from users.router import router as users_router
from training.router import router as training_router
from progress.router import router as progress_router

# Load environment variables
load_dotenv()

app = FastAPI(title="MindBloom API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB client
client = None
db = None

@app.on_event("startup")
async def startup_db_client():
    global client, db
    mongodb_uri = os.getenv("MONGODB_URI")
    if mongodb_uri:
        client = AsyncIOMotorClient(mongodb_uri)
        db = client.mindbloom  # Database name

@app.on_event("shutdown")
async def shutdown_db_client():
    global client
    if client:
        client.close()

@app.get("/healthz")
async def health_check():
    db_status = "failed"
    
    if client is not None and db is not None:
        try:
            # Test database connection by pinging
            await client.admin.command('ping')
            db_status = "successful"
        except Exception as e:
            db_status = "failed"
    
    return {
        "status": "ok",
        "db_connection": db_status
    }

# Include routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(users_router, prefix="/api/v1/users", tags=["users"])
app.include_router(training_router, prefix="/api/v1/training", tags=["training"])
app.include_router(progress_router, prefix="/api/v1/progress", tags=["progress"])