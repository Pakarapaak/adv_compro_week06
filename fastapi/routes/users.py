from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import database

router = APIRouter(tags=["users"])

class UserCreate(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    username: str

# Register endpoint
@router.post("/register/", response_model=UserOut)
async def register(user: UserCreate):
    query = """
        INSERT INTO users (username, password)
        VALUES (:username, :password)
    """
    values = {"username": user.username, "password": user.password}
    try:
        await database.execute(query=query, values=values)
        return {"username": user.username}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Login endpoint
@router.post("/login/")
async def login(user: UserCreate):
    query = "SELECT password FROM users WHERE username = :username"
    result = await database.fetch_one(query, values={"username": user.username})
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    if result["password"] != user.password:
        raise HTTPException(status_code=401, detail="Incorrect password")
    return {"message": "Login successful"}
