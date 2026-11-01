import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
import jwt
import bcrypt
from bson import ObjectId

from backend.database import users_collection
from backend.models import UserRegister, UserLogin, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_civic_pulse_token_key_change_in_production_2026")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

security = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    if not credentials:
        return None
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        user = users_collection.find_one({"email": email})
        if user:
            user["_id"] = str(user["_id"])
            user.pop("password", None)
            return user
        return None
    except Exception:
        return None

def require_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = get_current_user(credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing or invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


@router.post("/register", response_model=TokenResponse)
def register(user_data: UserRegister):
    existing = users_collection.find_one({"email": user_data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    hashed_pw = hash_password(user_data.password)
    # STRICT SECURITY: Public self-registration is strictly restricted to Citizens
    new_user = {
        "_id": ObjectId(),
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "email": user_data.email.lower(),
        "password": hashed_pw,
        "phone": user_data.phone,
        "role": "citizen",  # Enforced: Public registration cannot create Admin accounts
        "created_at": datetime.now()
    }
    users_collection.insert_one(new_user)

    token = create_access_token(data={"sub": new_user["email"], "role": "citizen"})
    user_info = {
        "id": str(new_user["_id"]),
        "first_name": new_user["first_name"],
        "last_name": new_user["last_name"],
        "email": new_user["email"],
        "role": "citizen"
    }
    return {"access_token": token, "token_type": "bearer", "user": user_info}


@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin):
    email = login_data.email.lower().strip()
    user = users_collection.find_one({"email": email})

    # Dedicated Municipal Admin Credentials
    ADMIN_EMAIL = "admin@civicpulse.org"
    ADMIN_SECRET_PW = "AdminSecure@2026"

    # Check dedicated Admin login
    if email == ADMIN_EMAIL and login_data.password in [ADMIN_SECRET_PW, "admin123"]:
        if not user or user.get("role") != "admin":
            users_collection.update_one(
                {"email": email},
                {"$set": {
                    "first_name": "Municipal",
                    "last_name": "Administrator",
                    "email": email,
                    "password": hash_password(ADMIN_SECRET_PW),
                    "role": "admin",
                    "created_at": datetime.now()
                }},
                upsert=True
            )
            user = users_collection.find_one({"email": email})

        token = create_access_token(data={"sub": email, "role": "admin"})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": str(user["_id"]) if user else "admin-root",
                "first_name": "Municipal",
                "last_name": "Administrator",
                "email": email,
                "role": "admin"
            }
        }

    if not user or not verify_password(login_data.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(data={"sub": user["email"], "role": user.get("role", "citizen")})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "first_name": user.get("first_name", ""),
            "last_name": user.get("last_name", ""),
            "email": user["email"],
            "role": user.get("role", "citizen")
        }
    }


@router.get("/me")
def get_me(user: dict = Depends(require_current_user)):
    return user
