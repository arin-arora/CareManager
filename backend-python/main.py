from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import health_router, symptoms_router, lab_router, drugs_router

app = FastAPI(title="MedGuide AI Prediction Service")

import os

# Configure CORS
frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
allowed_origins = [
    frontend_url,
    "http://localhost:3000",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health_router)
app.include_router(symptoms_router)
app.include_router(lab_router)
app.include_router(drugs_router)
