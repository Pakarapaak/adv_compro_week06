from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from routes.users import router as users_router
from routes.items import router as items_router
from database import connect_db, disconnect_db

app = FastAPI(title="Shopping API")

# ---------------- CORS ----------------
origins = [
    "http://localhost:3000",  # Local Next.js dev
    "https://5wfq48bg-3000.asse.devtunnels.ms",  # Your forwarded Next.js devtunnel
    # "https://yourdomain.com",  # <-- Production domain here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Serve Static Files ----------------
os.makedirs("static/images", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# ---------------- Routes ----------------
app.include_router(users_router, prefix="/api")
app.include_router(items_router, prefix="/api")

# ---------------- Database Events ----------------
@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()

# ---------------- Root ----------------
@app.get("/")
async def root():
    return {"message": "Welcome to the Shopping API"}
