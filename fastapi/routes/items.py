from fastapi import APIRouter, HTTPException, Form, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
from database import database
import shutil
import os
from datetime import datetime

router = APIRouter()

# Ensure static/images folder exists
IMAGES_DIR = "static/images"
os.makedirs(IMAGES_DIR, exist_ok=True)

# ---------------- SCHEMAS ----------------
class Item(BaseModel):
    id: int
    name: str
    description: str
    price: float
    quantity: int
    username: str
    image: str | None = None  # optional image filename

# ---------------- GET ITEMS FOR USER ----------------
@router.get("/items/user/{username}", response_model=list[Item])
async def get_user_items(username: str):
    query = "SELECT * FROM items WHERE username = :username ORDER BY id;"
    return await database.fetch_all(query, {"username": username})

# ---------------- ADD ITEM ----------------
@router.post("/items/add/", response_model=Item)
async def create_item(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    quantity: int = Form(...),
    username: str = Form(...),
    image: UploadFile | None = File(None)
):
    image_filename = None
    if image:
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        ext = os.path.splitext(image.filename)[1]
        image_filename = f"{username}_{timestamp}{ext}"
        file_path = os.path.join(IMAGES_DIR, image_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

    query = """
        INSERT INTO items (name, description, price, quantity, username, image)
        VALUES (:name, :description, :price, :quantity, :username, :image)
        RETURNING *;
    """
    values = {
        "name": name,
        "description": description,
        "price": price,
        "quantity": quantity,
        "username": username,
        "image": image_filename
    }
    return await database.fetch_one(query, values)

# ---------------- UPDATE ITEM (OWNER ONLY) ----------------
@router.put("/items/{item_id}", response_model=Item)
async def update_item(
    item_id: int,
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    quantity: int = Form(...),
    username: str = Form(...),
    image: UploadFile | None = File(None)
):
    # Fetch current item
    query_get = "SELECT image FROM items WHERE id=:id AND username=:username;"
    current = await database.fetch_one(query_get, {"id": item_id, "username": username})
    if not current:
        raise HTTPException(status_code=404, detail="Item not found or not owned by user")

    image_filename = None
    if image:
        # Delete old image if exists
        if current["image"]:
            old_path = os.path.join(IMAGES_DIR, current["image"])
            if os.path.exists(old_path):
                os.remove(old_path)

        # Save new image
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        ext = os.path.splitext(image.filename)[1]
        image_filename = f"{username}_{timestamp}{ext}"
        file_path = os.path.join(IMAGES_DIR, image_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

    query = """
        UPDATE items
        SET name=:name,
            description=:description,
            price=:price,
            quantity=:quantity,
            updated_at=NOW(),
            image=COALESCE(:image, image)
        WHERE id=:id AND username=:username
        RETURNING *;
    """
    values = {
        "id": item_id,
        "name": name,
        "description": description,
        "price": price,
        "quantity": quantity,
        "username": username,
        "image": image_filename
    }
    updated = await database.fetch_one(query, values)
    if not updated:
        raise HTTPException(status_code=404, detail="Item not found or not owned by user")
    return updated

# ---------------- DELETE ITEM (OWNER ONLY) ----------------
@router.delete("/items/{item_id}")
async def delete_item(item_id: int, username: str = Form(...)):
    # Remove the image file if exists
    query_get = "SELECT image FROM items WHERE id=:id AND username=:username;"
    item = await database.fetch_one(query_get, {"id": item_id, "username": username})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found or not owned by user")

    if item["image"]:
        image_path = os.path.join(IMAGES_DIR, item["image"])
        if os.path.exists(image_path):
            os.remove(image_path)

    query = "DELETE FROM items WHERE id=:id AND username=:username RETURNING *;"
    deleted = await database.fetch_one(query, {"id": item_id, "username": username})
    if not deleted:
        raise HTTPException(status_code=404, detail="Item not found or not owned by user")
    return {"message": "Deleted successfully"}

# ---------------- GET IMAGE ----------------
@router.get("/items/image/{filename}")
async def get_item_image(filename: str):
    file_path = os.path.join(IMAGES_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)
