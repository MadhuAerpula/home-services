from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
#from motor.motor_asyncio import AsyncIOMotorClient
from database import db, connect_to_mongo, close_mongo_connection # added for accessing mongodb atlas in place of above
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import httpx
from twilio.rest import Client as TwilioClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

#mongo_url = os.environ['MONGO_URL']
#client = AsyncIOMotorClient(mongo_url)
#db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 30

twilio_account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
twilio_auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
twilio_phone_number = os.environ.get('TWILIO_PHONE_NUMBER')

twilio_client = None
if twilio_account_sid and twilio_auth_token:
    twilio_client = TwilioClient(twilio_account_sid, twilio_auth_token)

def send_sms(to_phone: str, message: str):
    """Send SMS notification via Twilio"""
    if not twilio_client:
        logging.warning(f"SMS not sent - Twilio not configured. Message: {message}")
        return
    try:
        twilio_client.messages.create(
            body=message,
            from_=twilio_phone_number,
            to=to_phone
        )
        logging.info(f"SMS sent to {to_phone}")
    except Exception as e:
        logging.error(f"Failed to send SMS: {str(e)}")

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    phone: Optional[str] = None
    name: str
    picture: Optional[str] = None
    role: str
    created_at: datetime

class UserRegister(BaseModel):
    email: EmailStr
    phone: Optional[str] = None
    password: str
    name: str
    role: str

class UserLogin(BaseModel):
    email: str
    password: str

class SessionData(BaseModel):
    session_id: str

class ServiceCategory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    category_id: str
    name: str
    description: str
    price_range: str
    estimated_time: str
    icon: str
    active: bool = True
    created_at: datetime

class ServiceCategoryCreate(BaseModel):
    name: str
    description: str
    price_range: str
    estimated_time: str
    icon: str

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    booking_id: str
    customer_id: str
    customer_name: str
    customer_phone: Optional[str] = None
    professional_id: Optional[str] = None
    professional_name: Optional[str] = None
    service_category_id: str
    service_name: str
    address: str
    scheduled_date: str
    scheduled_time: str
    status: str
    created_at: datetime

class BookingCreate(BaseModel):
    service_category_id: str
    address: str
    scheduled_date: str
    scheduled_time: str

class ProfessionalProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    service_categories: List[str] = []
    availability: Dict = {}
    verified: bool = False
    rating: float = 0.0
    total_reviews: int = 0
    earnings_total: float = 0.0
    created_at: datetime

class ProfessionalProfileCreate(BaseModel):
    service_categories: List[str]
    availability: Dict = {}

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    review_id: str
    booking_id: str
    customer_id: str
    customer_name: str
    professional_id: str
    rating: int
    comment: str
    created_at: datetime

class ReviewCreate(BaseModel):
    booking_id: str
    rating: int
    comment: str

async def get_current_user(request: Request, credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    """Get current user from session_token cookie or Authorization header"""
    token = None
    
    if "session_token" in request.cookies:
        token = request.cookies.get("session_token")
    elif credentials:
        token = credentials.credentials
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user_doc.get("created_at"), str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    
    return User(**user_doc)

async def get_admin_user(current_user: User = Depends(get_current_user)):
    """Require admin role"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    """Register new user with email/password"""
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    password_hash = pwd_context.hash(user_data.password)
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "phone": user_data.phone,
        "name": user_data.name,
        "picture": None,
        "role": user_data.role,
        "password_hash": password_hash,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    session_token = f"session_{uuid.uuid4().hex}"
    session_doc = {
        "session_token": session_token,
        "user_id": user_id,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS),
        "created_at": datetime.now(timezone.utc)
    }
    await db.user_sessions.insert_one(session_doc)
    
    if user_data.role == "professional":
        prof_doc = {
            "user_id": user_id,
            "service_categories": [],
            "availability": {},
            "verified": False,
            "rating": 0.0,
            "total_reviews": 0,
            "earnings_total": 0.0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.professionals.insert_one(prof_doc)
    
    user_doc.pop("password_hash", None)
    user_doc.pop("_id", None)
    user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    
    return {"user": User(**user_doc), "token": session_token}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    """Login with email/password"""
    user_doc = await db.users.find_one({"email": credentials.email})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not pwd_context.verify(credentials.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    session_token = f"session_{uuid.uuid4().hex}"
    session_doc = {
        "session_token": session_token,
        "user_id": user_doc["user_id"],
        "expires_at": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS),
        "created_at": datetime.now(timezone.utc)
    }
    await db.user_sessions.insert_one(session_doc)
    
    user_doc.pop("password_hash", None)
    user_doc.pop("_id", None)
    if isinstance(user_doc.get("created_at"), str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    
    return {"user": User(**user_doc), "token": session_token}

@api_router.post("/auth/google/session")
async def google_session(session_data: SessionData, response: Response):
    """Exchange Google OAuth session_id for user data"""
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_data.session_id}
            )
            resp.raise_for_status()
            google_user = resp.json()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to fetch session data: {str(e)}")
    
    user_doc = await db.users.find_one({"email": google_user["email"]})
    
    if user_doc:
        user_id = user_doc["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": google_user["name"],
                "picture": google_user.get("picture")
            }}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": google_user["email"],
            "phone": None,
            "name": google_user["name"],
            "picture": google_user.get("picture"),
            "role": "customer",
            "password_hash": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    session_token = google_user["session_token"]
    session_doc = {
        "session_token": session_token,
        "user_id": user_id,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    }
    await db.user_sessions.insert_one(session_doc)
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    if isinstance(user_doc.get("created_at"), str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    
    return {"user": User(**user_doc), "token": session_token}

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user

@api_router.put("/auth/profile", response_model=User)
async def update_profile(name: str = None, phone: str = None, current_user: User = Depends(get_current_user)):
    """Update user profile"""
    update_data = {}
    if name:
        update_data["name"] = name
    if phone is not None:
        update_data["phone"] = phone
    
    if update_data:
        await db.users.update_one(
            {"user_id": current_user.user_id},
            {"$set": update_data}
        )
    
    user_doc = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0, "password_hash": 0})
    if isinstance(user_doc.get("created_at"), str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    
    return User(**user_doc)

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response, current_user: User = Depends(get_current_user)):
    """Logout user"""
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

@api_router.get("/services", response_model=List[ServiceCategory])
async def get_services():
    """Get all active service categories"""
    services = await db.service_categories.find({"active": True}, {"_id": 0}).to_list(100)
    for service in services:
        if isinstance(service.get("created_at"), str):
            service["created_at"] = datetime.fromisoformat(service["created_at"])
    return services

@api_router.get("/services/{category_id}", response_model=ServiceCategory)
async def get_service(category_id: str):
    """Get service category details"""
    service = await db.service_categories.find_one({"category_id": category_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    if isinstance(service.get("created_at"), str):
        service["created_at"] = datetime.fromisoformat(service["created_at"])
    return ServiceCategory(**service)

@api_router.post("/admin/services", response_model=ServiceCategory)
async def create_service(service_data: ServiceCategoryCreate, admin: User = Depends(get_admin_user)):
    """Create service category (admin only)"""
    category_id = f"service_{uuid.uuid4().hex[:8]}"
    service_doc = {
        "category_id": category_id,
        "name": service_data.name,
        "description": service_data.description,
        "price_range": service_data.price_range,
        "estimated_time": service_data.estimated_time,
        "icon": service_data.icon,
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.service_categories.insert_one(service_doc)
    service_doc["created_at"] = datetime.fromisoformat(service_doc["created_at"])
    return ServiceCategory(**service_doc)

@api_router.post("/bookings", response_model=Booking)
async def create_booking(booking_data: BookingCreate, current_user: User = Depends(get_current_user)):
    """Create new booking (customer only)"""
    if current_user.role != "customer":
        raise HTTPException(status_code=403, detail="Only customers can create bookings")
    
    service = await db.service_categories.find_one({"category_id": booking_data.service_category_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    booking_id = f"booking_{uuid.uuid4().hex[:12]}"
    booking_doc = {
        "booking_id": booking_id,
        "customer_id": current_user.user_id,
        "customer_name": current_user.name,
        "customer_phone": current_user.phone,
        "professional_id": None,
        "professional_name": None,
        "service_category_id": booking_data.service_category_id,
        "service_name": service["name"],
        "address": booking_data.address,
        "scheduled_date": booking_data.scheduled_date,
        "scheduled_time": booking_data.scheduled_time,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.bookings.insert_one(booking_doc)
    
    if current_user.phone:
        send_sms(current_user.phone, f"Booking confirmed for {service['name']} on {booking_data.scheduled_date} at {booking_data.scheduled_time}. Booking ID: {booking_id}")
    
    booking_doc["created_at"] = datetime.fromisoformat(booking_doc["created_at"])
    return Booking(**booking_doc)

@api_router.get("/bookings", response_model=List[Booking])
async def get_bookings(current_user: User = Depends(get_current_user)):
    """Get bookings for current user"""
    query = {}
    if current_user.role == "customer":
        query["customer_id"] = current_user.user_id
    elif current_user.role == "professional":
        query["professional_id"] = current_user.user_id
    
    bookings = await db.bookings.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    for booking in bookings:
        if isinstance(booking.get("created_at"), str):
            booking["created_at"] = datetime.fromisoformat(booking["created_at"])
    return bookings

@api_router.get("/bookings/{booking_id}", response_model=Booking)
async def get_booking(booking_id: str, current_user: User = Depends(get_current_user)):
    """Get booking details"""
    booking = await db.bookings.find_one({"booking_id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if current_user.role == "customer" and booking["customer_id"] != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    elif current_user.role == "professional" and booking["professional_id"] != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if isinstance(booking.get("created_at"), str):
        booking["created_at"] = datetime.fromisoformat(booking["created_at"])
    return Booking(**booking)

@api_router.get("/professionals/available-bookings", response_model=List[Booking])
async def get_available_bookings(current_user: User = Depends(get_current_user)):
    """Get pending bookings for professional's service categories"""
    if current_user.role != "professional":
        raise HTTPException(status_code=403, detail="Professional access required")
    
    prof = await db.professionals.find_one({"user_id": current_user.user_id}, {"_id": 0})
    if not prof or not prof.get("verified"):
        return []
    
    bookings = await db.bookings.find({
        "status": "pending",
        "service_category_id": {"$in": prof["service_categories"]}
    }, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for booking in bookings:
        if isinstance(booking.get("created_at"), str):
            booking["created_at"] = datetime.fromisoformat(booking["created_at"])
    return bookings

@api_router.put("/bookings/{booking_id}/accept")
async def accept_booking(booking_id: str, current_user: User = Depends(get_current_user)):
    """Professional accepts booking"""
    if current_user.role != "professional":
        raise HTTPException(status_code=403, detail="Professional access required")
    
    booking = await db.bookings.find_one({"booking_id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking["status"] != "pending":
        raise HTTPException(status_code=400, detail="Booking already processed")
    
    await db.bookings.update_one(
        {"booking_id": booking_id},
        {"$set": {
            "professional_id": current_user.user_id,
            "professional_name": current_user.name,
            "status": "accepted"
        }}
    )
    
    if booking.get("customer_phone"):
        send_sms(booking["customer_phone"], f"Your booking {booking_id} has been accepted by {current_user.name}!")
    
    return {"message": "Booking accepted"}

@api_router.put("/bookings/{booking_id}/reject")
async def reject_booking(booking_id: str, current_user: User = Depends(get_current_user)):
    """Professional rejects booking"""
    if current_user.role != "professional":
        raise HTTPException(status_code=403, detail="Professional access required")
    
    booking = await db.bookings.find_one({"booking_id": booking_id})
    if not booking or booking["status"] != "pending":
        raise HTTPException(status_code=400, detail="Invalid booking")
    
    await db.bookings.update_one({"booking_id": booking_id}, {"$set": {"status": "cancelled"}})
    
    if booking.get("customer_phone"):
        send_sms(booking["customer_phone"], f"Your booking {booking_id} was cancelled.")
    
    return {"message": "Booking rejected"}

@api_router.put("/bookings/{booking_id}/status")
async def update_booking_status(booking_id: str, status: str, current_user: User = Depends(get_current_user)):
    """Update booking status"""
    booking = await db.bookings.find_one({"booking_id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if current_user.role == "professional" and booking["professional_id"] != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    valid_statuses = ["pending", "accepted", "in_progress", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    await db.bookings.update_one({"booking_id": booking_id}, {"$set": {"status": status}})
    
    if booking.get("customer_phone"):
        send_sms(booking["customer_phone"], f"Booking {booking_id} status updated to: {status}")
    
    return {"message": "Status updated"}

@api_router.post("/professionals/profile", response_model=ProfessionalProfile)
async def update_professional_profile(profile_data: ProfessionalProfileCreate, current_user: User = Depends(get_current_user)):
    """Create/update professional profile"""
    if current_user.role != "professional":
        raise HTTPException(status_code=403, detail="Professional access required")
    
    existing = await db.professionals.find_one({"user_id": current_user.user_id})
    
    if existing:
        await db.professionals.update_one(
            {"user_id": current_user.user_id},
            {"$set": {
                "service_categories": profile_data.service_categories,
                "availability": profile_data.availability
            }}
        )
    else:
        prof_doc = {
            "user_id": current_user.user_id,
            "service_categories": profile_data.service_categories,
            "availability": profile_data.availability,
            "verified": False,
            "rating": 0.0,
            "total_reviews": 0,
            "earnings_total": 0.0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.professionals.insert_one(prof_doc)
    
    prof = await db.professionals.find_one({"user_id": current_user.user_id}, {"_id": 0})
    if isinstance(prof.get("created_at"), str):
        prof["created_at"] = datetime.fromisoformat(prof["created_at"])
    return ProfessionalProfile(**prof)

@api_router.get("/professionals/profile", response_model=ProfessionalProfile)
async def get_professional_profile(current_user: User = Depends(get_current_user)):
    """Get professional profile"""
    if current_user.role != "professional":
        raise HTTPException(status_code=403, detail="Professional access required")
    
    prof = await db.professionals.find_one({"user_id": current_user.user_id}, {"_id": 0})
    if not prof:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    if isinstance(prof.get("created_at"), str):
        prof["created_at"] = datetime.fromisoformat(prof["created_at"])
    return ProfessionalProfile(**prof)

@api_router.get("/professionals/earnings")
async def get_earnings(current_user: User = Depends(get_current_user)):
    """Get professional earnings dashboard"""
    if current_user.role != "professional":
        raise HTTPException(status_code=403, detail="Professional access required")
    
    prof = await db.professionals.find_one({"user_id": current_user.user_id}, {"_id": 0})
    if not prof:
        return {"total_earnings": 0.0, "completed_jobs": 0}
    
    completed = await db.bookings.count_documents({
        "professional_id": current_user.user_id,
        "status": "completed"
    })
    
    return {
        "total_earnings": prof.get("earnings_total", 0.0),
        "completed_jobs": completed,
        "rating": prof.get("rating", 0.0),
        "total_reviews": prof.get("total_reviews", 0)
    }

@api_router.post("/reviews", response_model=Review)
async def create_review(review_data: ReviewCreate, current_user: User = Depends(get_current_user)):
    """Create review for completed booking"""
    if current_user.role != "customer":
        raise HTTPException(status_code=403, detail="Only customers can create reviews")
    
    booking = await db.bookings.find_one({"booking_id": review_data.booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking["customer_id"] != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if booking["status"] != "completed":
        raise HTTPException(status_code=400, detail="Can only review completed bookings")
    
    existing = await db.reviews.find_one({"booking_id": review_data.booking_id})
    if existing:
        raise HTTPException(status_code=400, detail="Review already exists")
    
    review_id = f"review_{uuid.uuid4().hex[:12]}"
    review_doc = {
        "review_id": review_id,
        "booking_id": review_data.booking_id,
        "customer_id": current_user.user_id,
        "customer_name": current_user.name,
        "professional_id": booking["professional_id"],
        "rating": review_data.rating,
        "comment": review_data.comment,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.reviews.insert_one(review_doc)
    
    reviews = await db.reviews.find({"professional_id": booking["professional_id"]}).to_list(1000)
    avg_rating = sum(r["rating"] for r in reviews) / len(reviews) if reviews else 0.0
    
    await db.professionals.update_one(
        {"user_id": booking["professional_id"]},
        {"$set": {"rating": avg_rating, "total_reviews": len(reviews)}}
    )
    
    review_doc["created_at"] = datetime.fromisoformat(review_doc["created_at"])
    return Review(**review_doc)

@api_router.get("/reviews/professional/{professional_id}", response_model=List[Review])
async def get_professional_reviews(professional_id: str):
    """Get reviews for a professional"""
    reviews = await db.reviews.find({"professional_id": professional_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for review in reviews:
        if isinstance(review.get("created_at"), str):
            review["created_at"] = datetime.fromisoformat(review["created_at"])
    return reviews

@api_router.get("/admin/users")
async def get_users(admin: User = Depends(get_admin_user)):
    """Get all users (admin only)"""
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

@api_router.get("/admin/professionals")
async def get_professionals(admin: User = Depends(get_admin_user)):
    """Get all professionals with user info (admin only)"""
    professionals = await db.professionals.find({}, {"_id": 0}).to_list(1000)
    
    for prof in professionals:
        user = await db.users.find_one({"user_id": prof["user_id"]}, {"_id": 0, "password_hash": 0})
        if user:
            prof["user_info"] = user
    
    return professionals

@api_router.put("/admin/professionals/{user_id}/verify")
async def verify_professional(user_id: str, verified: bool, admin: User = Depends(get_admin_user)):
    """Verify/unverify professional (admin only)"""
    result = await db.professionals.update_one(
        {"user_id": user_id},
        {"$set": {"verified": verified}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Professional not found")
    
    return {"message": "Professional verification updated"}

@api_router.get("/admin/analytics")
async def get_analytics(admin: User = Depends(get_admin_user)):
    """Get dashboard analytics (admin only)"""
    total_users = await db.users.count_documents({})
    total_customers = await db.users.count_documents({"role": "customer"})
    total_professionals = await db.users.count_documents({"role": "professional"})
    total_bookings = await db.bookings.count_documents({})
    completed_bookings = await db.bookings.count_documents({"status": "completed"})
    pending_bookings = await db.bookings.count_documents({"status": "pending"})
    total_services = await db.service_categories.count_documents({"active": True})
    
    recent_bookings = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
    
    return {
        "total_users": total_users,
        "total_customers": total_customers,
        "total_professionals": total_professionals,
        "total_bookings": total_bookings,
        "completed_bookings": completed_bookings,
        "pending_bookings": pending_bookings,
        "total_services": total_services,
        "recent_bookings": recent_bookings
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# comment out if want to access mongodb by default (emergent)
#@app.on_event("shutdown")
#async def shutdown_db_client():
#    client.close()

# down two hooks are added to access mongodb atlas
#1
@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

#2
@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

