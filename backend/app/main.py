from fastapi import FastAPI
from app.api.v1.api import api_router

app = FastAPI(
    title="Personal Knowledge Base API",
    description="API for managing and querying a personal knowledge base.",
    version="1.0.0"
)

@app.get("/", tags=["Health Check"])
def read_root():
    """Health check endpoint to confirm the server is running."""
    return {"status": "ok"}

# Include the v1 API router
app.include_router(api_router, prefix="/api/v1")
