from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from datetime import datetime
import uuid

from models.memory_note import MemoryNote, MemoryNoteCreate, MemoryNoteUpdate
from models.user import User
from auth.router import get_current_user

router = APIRouter()

# Database dependency - will be injected from main.py
async def get_database() -> AsyncIOMotorDatabase:
    from main import db
    return db

@router.post("/", response_model=MemoryNote, status_code=status.HTTP_201_CREATED)
async def create_memory_note(
    note_data: MemoryNoteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new memory note for the authenticated user"""
    try:
        # Create new note document
        note_doc = {
            "_id": str(uuid.uuid4()),
            "userId": current_user.id,
            "title": note_data.title,
            "content": note_data.content,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        # Insert into database
        result = await db.memory_notes.insert_one(note_doc)
        
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create memory note"
            )
        
        # Convert MongoDB document to MemoryNote model
        note_doc["id"] = note_doc["_id"]
        del note_doc["_id"]
        
        return MemoryNote(**note_doc)
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create memory note"
        )

@router.get("/", response_model=List[MemoryNote])
async def get_memory_notes(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Retrieve all memory notes for the authenticated user"""
    try:
        # Find all notes for the current user, sorted by creation date (newest first)
        cursor = db.memory_notes.find({"userId": current_user.id}).sort("createdAt", -1)
        notes = await cursor.to_list(length=None)
        
        # Convert MongoDB documents to MemoryNote models
        memory_notes = []
        for note_doc in notes:
            note_doc["id"] = str(note_doc["_id"])
            del note_doc["_id"]
            memory_notes.append(MemoryNote(**note_doc))
        
        return memory_notes
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve memory notes"
        )

@router.get("/{note_id}", response_model=MemoryNote)
async def get_memory_note(
    note_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Retrieve a specific memory note by ID"""
    try:
        # Find the note by ID and ensure it belongs to the current user
        note_doc = await db.memory_notes.find_one({
            "_id": note_id,
            "userId": current_user.id
        })
        
        if not note_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Memory note not found"
            )
        
        # Convert MongoDB document to MemoryNote model
        note_doc["id"] = str(note_doc["_id"])
        del note_doc["_id"]
        
        return MemoryNote(**note_doc)
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve memory note"
        )

@router.put("/{note_id}", response_model=MemoryNote)
async def update_memory_note(
    note_id: str,
    note_update: MemoryNoteUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update an existing memory note"""
    try:
        # Build update document with only provided fields
        update_doc = {"updatedAt": datetime.utcnow()}
        
        if note_update.title is not None:
            update_doc["title"] = note_update.title
        if note_update.content is not None:
            update_doc["content"] = note_update.content
        
        # Update the note in database (only if it belongs to the current user)
        result = await db.memory_notes.update_one(
            {"_id": note_id, "userId": current_user.id},
            {"$set": update_doc}
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Memory note not found"
            )
        
        # Fetch and return updated note
        updated_note_doc = await db.memory_notes.find_one({
            "_id": note_id,
            "userId": current_user.id
        })
        
        if not updated_note_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Memory note not found after update"
            )
        
        # Convert MongoDB document to MemoryNote model
        updated_note_doc["id"] = str(updated_note_doc["_id"])
        del updated_note_doc["_id"]
        
        return MemoryNote(**updated_note_doc)
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update memory note"
        )

@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_memory_note(
    note_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete an existing memory note"""
    try:
        # Delete the note (only if it belongs to the current user)
        result = await db.memory_notes.delete_one({
            "_id": note_id,
            "userId": current_user.id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Memory note not found"
            )
        
        # Return 204 No Content on successful deletion
        return None
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete memory note"
        )