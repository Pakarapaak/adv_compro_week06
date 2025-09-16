from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from database import database

router = APIRouter(tags=["users"])

# Pydantic model for registration
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    name: str
    phone: str
    address: str
    # confirmPassword is handled in frontend, not stored

# Pydantic model for login
class UserLogin(BaseModel):
    username: str
    password: str

# Pydantic model for output (public info)
class UserOut(BaseModel):
    username: str
    email: EmailStr
    name: str

# Register endpoint
@router.post("/register/", response_model=UserOut)
async def register(user: UserCreate):
    query = """
        INSERT INTO users (username, email, password, name, phone, address)
        VALUES (:username, :email, :password, :name, :phone, :address)
    """
    values = {
        "username": user.username,
        "email": user.email,
        "password": user.password,  # In production, hash this!
        "name": user.name,
        "phone": user.phone,
        "address": user.address
    }
    try:
        await database.execute(query=query, values=values)
        return {
            "username": user.username,
            "email": user.email,
            "name": user.name
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Login endpoint (username & password only)
@router.post("/login/")
async def login(user: UserLogin):
    query = "SELECT password FROM users WHERE username = :username"
    result = await database.fetch_one(query, values={"username": user.username})
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    if result["password"] != user.password:
        raise HTTPException(status_code=401, detail="Incorrect password")
    return {"message": "Login successful"}
