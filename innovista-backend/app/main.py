from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, users, matchmaking, notifications, analytics
from app.core.database import engine, Base
from app.core.config import settings

# Create database tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for the Innovista Ecosystem Matchmaking Platform",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(matchmaking.router, prefix="/api/matchmaking", tags=["Matchmaking"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
def root():
    return {"message": "Welcome to the Innovista API. Go to /docs for the Swagger UI."}
