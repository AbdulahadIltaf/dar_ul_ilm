from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Auth schemas
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    is_approved: bool
    name: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# Course schemas
class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    schedule: Optional[str] = None
    instructor: Optional[str] = None
    status: Optional[str] = "ongoing"

class CourseResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    schedule: Optional[str] = None
    instructor: Optional[str] = None
    status: str

    class Config:
        from_attributes = True

# Enrollment schemas
class EnrollmentCreate(BaseModel):
    course_id: int

class EnrollmentResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    status: str
    created_at: datetime
    course: Optional[CourseResponse] = None

    class Config:
        from_attributes = True

class EnrollmentAdminResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    status: str
    created_at: datetime
    user: UserResponse
    course: CourseResponse

    class Config:
        from_attributes = True

# Portal Content schemas
class PortalContentCreate(BaseModel):
    course_id: int
    title: str
    content_type: str  # "pdf", "audio", "video", "link"
    url: str
    description: Optional[str] = None

class PortalContentResponse(BaseModel):
    id: int
    course_id: int
    title: str
    content_type: str
    url: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Announcement schemas
class AnnouncementCreate(BaseModel):
    course_id: Optional[int] = None
    title: str
    message: str

class AnnouncementResponse(BaseModel):
    id: int
    course_id: Optional[int] = None
    title: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True

# Teacher Profile schemas
class TeacherProfileCreate(BaseModel):
    name: str
    bio: Optional[str] = None
    qualification: Optional[str] = None
    image_url: Optional[str] = None

class TeacherProfileResponse(BaseModel):
    id: int
    name: str
    bio: Optional[str] = None
    qualification: Optional[str] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True
