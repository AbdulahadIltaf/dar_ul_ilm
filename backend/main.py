from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from datetime import timedelta

import database, schemas, auth

app = FastAPI(title="Madarsa Dar-Ul-Ilm Lilbanaat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── ROOT & HEALTH ────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"message": "Welcome to Madarsa Dar-Ul-Ilm Lilbanaat Student Portal API"}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "API is running"}

# ── AUTHENTICATION ───────────────────────────────────────────────────────────

@app.post("/api/auth/register")
def register(user_data: schemas.UserCreate):
    # Check duplicate email
    existing = database.supabase.table("users").select("id").eq("email", user_data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="A user with this email address already exists.")

    hashed_pwd = auth.get_password_hash(user_data.password)

    result = database.supabase.table("users").insert({
        "name": user_data.name,
        "email": user_data.email,
        "password_hash": hashed_pwd,
        "phone": user_data.phone,
        "role": "student",
        "is_approved": False,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create user account.")

    return result.data[0]


@app.post("/api/auth/login")
def login(login_data: schemas.UserLogin):
    result = database.supabase.table("users").select("*").eq("email", login_data.email).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = result.data[0]

    if not auth.verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = auth.create_access_token(
        data={"sub": user["email"], "role": user["role"]},
        expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user["role"],
        "is_approved": user["is_approved"],
        "name": user["name"],
    }

# ── PUBLIC APIs ──────────────────────────────────────────────────────────────

@app.get("/api/courses")
def get_courses(status: Optional[str] = None):
    query = database.supabase.table("courses").select("*")
    if status:
        query = query.eq("status", status)
    return query.execute().data


@app.get("/api/teachers")
def get_teachers():
    return database.supabase.table("teacher_profiles").select("*").execute().data


@app.get("/api/announcements")
def get_announcements():
    return database.supabase.table("announcements").select("*").order("created_at", desc=True).execute().data

# ── STUDENT DASHBOARD APIs ───────────────────────────────────────────────────

@app.get("/api/student/profile")
def get_student_profile(current_user: dict = Depends(auth.get_current_active_user)):
    return current_user


@app.get("/api/student/enrollments")
def get_student_enrollments(current_user: dict = Depends(auth.get_current_active_user)):
    return database.supabase.table("enrollments") \
        .select("*, courses(*)") \
        .eq("user_id", current_user["id"]) \
        .execute().data


@app.post("/api/student/enroll")
def enroll_in_course(
    enroll_data: schemas.EnrollmentCreate,
    current_user: dict = Depends(auth.get_current_active_user),
):
    # Verify course exists
    course = database.supabase.table("courses").select("id").eq("id", enroll_data.course_id).execute()
    if not course.data:
        raise HTTPException(status_code=404, detail="Course not found")

    # Return existing enrollment if already enrolled
    existing = database.supabase.table("enrollments") \
        .select("*") \
        .eq("user_id", current_user["id"]) \
        .eq("course_id", enroll_data.course_id) \
        .execute()
    if existing.data:
        return existing.data[0]

    result = database.supabase.table("enrollments").insert({
        "user_id": current_user["id"],
        "course_id": enroll_data.course_id,
        "status": "pending",
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create enrollment.")

    return result.data[0]


@app.get("/api/student/dashboard")
def get_student_dashboard(current_user: dict = Depends(auth.get_current_active_user)):
    user_id = current_user["id"]

    # Active enrollments
    enrollments = database.supabase.table("enrollments") \
        .select("course_id") \
        .eq("user_id", user_id) \
        .eq("status", "active") \
        .execute().data

    course_ids = [e["course_id"] for e in enrollments]

    if course_ids:
        courses = database.supabase.table("courses").select("*").in_("id", course_ids).execute().data
        materials = database.supabase.table("portal_contents").select("*").in_("course_id", course_ids).order("created_at", desc=True).execute().data

        # Course-specific + global announcements
        course_anns = database.supabase.table("announcements").select("*").in_("course_id", course_ids).execute().data
        global_anns = database.supabase.table("announcements").select("*").is_("course_id", "null").execute().data
        announcements = sorted(course_anns + global_anns, key=lambda x: x.get("created_at", ""), reverse=True)

        formatted_courses = [
            {
                "id": c["id"],
                "title": c["title"],
                "description": c.get("description"),
                "schedule": c.get("schedule"),
                "instructor": c.get("instructor"),
                "status": c["status"],
                "materials": [m for m in materials if m["course_id"] == c["id"]],
            }
            for c in courses
        ]
    else:
        formatted_courses = []
        announcements = database.supabase.table("announcements").select("*").is_("course_id", "null").order("created_at", desc=True).execute().data

    return {
        "student_name": current_user["name"],
        "email": current_user["email"],
        "courses": formatted_courses,
        "announcements": announcements,
    }

# ── ADMIN APIs ───────────────────────────────────────────────────────────────

@app.get("/api/admin/students")
def get_all_students(admin: dict = Depends(auth.get_current_admin)):
    return database.supabase.table("users") \
        .select("id, name, phone, email, created_at") \
        .eq("role", "student") \
        .eq("is_approved", True) \
        .order("name") \
        .execute().data


@app.delete("/api/admin/students/{user_id}")
def delete_student(user_id: int, admin: dict = Depends(auth.get_current_admin)):
    # Cascade delete enrollments first
    database.supabase.table("enrollments").delete().eq("user_id", user_id).execute()
    result = database.supabase.table("users").delete().eq("id", user_id).eq("role", "student").execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": "Student deleted successfully"}


@app.get("/api/admin/pending-students")
def get_pending_students(admin: dict = Depends(auth.get_current_admin)):
    return database.supabase.table("users") \
        .select("*") \
        .eq("role", "student") \
        .eq("is_approved", False) \
        .order("created_at", desc=True) \
        .execute().data


@app.put("/api/admin/approve-student/{user_id}")
def approve_student(user_id: int, admin: dict = Depends(auth.get_current_admin)):
    result = database.supabase.table("users").update({"is_approved": True}).eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Student not found")
    return result.data[0]


@app.get("/api/admin/pending-enrollments")
def get_pending_enrollments(admin: dict = Depends(auth.get_current_admin)):
    return database.supabase.table("enrollments") \
        .select("*, users(*), courses(*)") \
        .eq("status", "pending") \
        .execute().data


@app.put("/api/admin/approve-enrollment/{enrollment_id}")
def approve_enrollment(enrollment_id: int, admin: dict = Depends(auth.get_current_admin)):
    result = database.supabase.table("enrollments").update({"status": "active"}).eq("id", enrollment_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return result.data[0]


@app.post("/api/admin/courses")
def create_course(course_data: schemas.CourseCreate, admin: dict = Depends(auth.get_current_admin)):
    result = database.supabase.table("courses").insert(course_data.model_dump()).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create course.")
    return result.data[0]


@app.post("/api/admin/content")
def create_portal_content(content_data: schemas.PortalContentCreate, admin: dict = Depends(auth.get_current_admin)):
    result = database.supabase.table("portal_contents").insert(content_data.model_dump()).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create content.")
    return result.data[0]


@app.post("/api/admin/announcements")
def create_announcement(ann_data: schemas.AnnouncementCreate, admin: dict = Depends(auth.get_current_admin)):
    result = database.supabase.table("announcements").insert(ann_data.model_dump()).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create announcement.")
    return result.data[0]


@app.post("/api/admin/teachers")
def create_teacher_profile(teacher_data: schemas.TeacherProfileCreate, admin: dict = Depends(auth.get_current_admin)):
    result = database.supabase.table("teacher_profiles").insert(teacher_data.model_dump()).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create teacher profile.")
    return result.data[0]


@app.delete("/api/admin/courses/{course_id}")
def delete_course(course_id: int, admin: dict = Depends(auth.get_current_admin)):
    # Cascade delete related records first
    database.supabase.table("enrollments").delete().eq("course_id", course_id).execute()
    database.supabase.table("portal_contents").delete().eq("course_id", course_id).execute()
    database.supabase.table("announcements").delete().eq("course_id", course_id).execute()
    result = database.supabase.table("courses").delete().eq("id", course_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Course deleted successfully"}


@app.delete("/api/admin/teachers/{teacher_id}")
def delete_teacher(teacher_id: int, admin: dict = Depends(auth.get_current_admin)):
    result = database.supabase.table("teacher_profiles").delete().eq("id", teacher_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return {"message": "Teacher profile deleted successfully"}


@app.delete("/api/admin/announcements/{announcement_id}")
def delete_announcement(announcement_id: int, admin: dict = Depends(auth.get_current_admin)):
    result = database.supabase.table("announcements").delete().eq("id", announcement_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"message": "Announcement deleted successfully"}
