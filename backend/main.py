from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import timedelta

import database, models, schemas, auth

app = FastAPI(title="Madarsa Dar-Ul-Ilm Lilbanaat API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root Endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to Madarsa Dar-Ul-Ilm Lilbanaat Student Portal API"}

# --- AUTHENTICATION ---

@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register(user_data: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    # Hash password
    hashed_pwd = auth.get_password_hash(user_data.password)
    
    # Create user
    new_user = models.User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_pwd,
        phone=user_data.phone,
        role="student",
        is_approved=False  # Must be approved by admin/teacher
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/login", response_model=schemas.Token)
def login(login_data: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    if not user or not auth.verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check approval status (Only admins bypass approval check during token generation)
    # Actually, we let them login, but verify_active_user dependency will prevent accessing dashboard if not approved.
    # To make frontend flow smoother, we return role and is_approved in the token response.
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "is_approved": user.is_approved,
        "name": user.name
    }

# --- PUBLIC APIS ---

@app.get("/api/courses", response_model=List[schemas.CourseResponse])
def get_courses(status: Optional[str] = None, db: Session = Depends(database.get_db)):
    query = db.query(models.Course)
    if status:
        query = query.filter(models.Course.status == status)
    return query.all()

@app.get("/api/teachers", response_model=List[schemas.TeacherProfileResponse])
def get_teachers(db: Session = Depends(database.get_db)):
    return db.query(models.TeacherProfile).all()

@app.get("/api/announcements", response_model=List[schemas.AnnouncementResponse])
def get_announcements(db: Session = Depends(database.get_db)):
    # Fetch global or general announcements (sorted by latest)
    return db.query(models.Announcement).order_by(models.Announcement.created_at.desc()).all()

# --- STUDENT DASHBOARD APIS ---

@app.get("/api/student/profile", response_model=schemas.UserResponse)
def get_student_profile(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

@app.get("/api/student/enrollments", response_model=List[schemas.EnrollmentResponse])
def get_student_enrollments(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    return db.query(models.Enrollment).filter(models.Enrollment.user_id == current_user.id).all()

@app.post("/api/student/enroll", response_model=schemas.EnrollmentResponse)
def enroll_in_course(
    enroll_data: schemas.EnrollmentCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    # Verify course exists
    course = db.query(models.Course).filter(models.Course.id == enroll_data.course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Check if already enrolled
    existing = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == current_user.id,
        models.Enrollment.course_id == enroll_data.course_id
    ).first()
    
    if existing:
        return existing
        
    new_enrollment = models.Enrollment(
        user_id=current_user.id,
        course_id=enroll_data.course_id,
        status="pending"  # Wait for admin approval to access portal material
    )
    
    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)
    return new_enrollment

@app.get("/api/student/dashboard")
def get_student_dashboard(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    # 1. Get active enrollments
    active_enrollments = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == current_user.id,
        models.Enrollment.status == "active"
    ).all()
    
    course_ids = [e.course_id for e in active_enrollments]
    
    # 2. Fetch courses detail
    enrolled_courses = db.query(models.Course).filter(models.Course.id.in_(course_ids)).all() if course_ids else []
    
    # 3. Fetch portal content for these courses
    portal_materials = db.query(models.PortalContent).filter(
        models.PortalContent.course_id.in_(course_ids)
    ).order_by(models.PortalContent.created_at.desc()).all() if course_ids else []
    
    # 4. Fetch announcements for these courses (and global announcements)
    announcements = db.query(models.Announcement).filter(
        (models.Announcement.course_id.in_(course_ids)) | (models.Announcement.course_id.is_(None))
    ).order_by(models.Announcement.created_at.desc()).all()
    
    # Format courses with their content
    formatted_courses = []
    for c in enrolled_courses:
        c_material = [mat for mat in portal_materials if mat.course_id == c.id]
        formatted_courses.append({
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "schedule": c.schedule,
            "instructor": c.instructor,
            "status": c.status,
            "materials": c_material
        })
        
    return {
        "student_name": current_user.name,
        "email": current_user.email,
        "courses": formatted_courses,
        "announcements": announcements
    }

# --- ADMIN / TEACHER APIS ---

@app.get("/api/admin/pending-students", response_model=List[schemas.UserResponse])
def get_pending_students(
    admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    return db.query(models.User).filter(
        models.User.role == "student",
        models.User.is_approved == False
    ).order_by(models.User.created_at.desc()).all()

@app.put("/api/admin/approve-student/{user_id}", response_model=schemas.UserResponse)
def approve_student(
    user_id: int,
    admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")
        
    user.is_approved = True
    db.commit()
    db.refresh(user)
    return user

@app.get("/api/admin/pending-enrollments", response_model=List[schemas.EnrollmentAdminResponse])
def get_pending_enrollments(
    admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    # Fetch all enrollments with status 'pending'
    return db.query(models.Enrollment).options(
        joinedload(models.Enrollment.user),
        joinedload(models.Enrollment.course)
    ).filter(models.Enrollment.status == "pending").all()

@app.put("/api/admin/approve-enrollment/{enrollment_id}", response_model=schemas.EnrollmentResponse)
def approve_enrollment(
    enrollment_id: int,
    admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    enrollment = db.query(models.Enrollment).filter(models.Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment record not found")
        
    enrollment.status = "active"
    db.commit()
    db.refresh(enrollment)
    return enrollment

@app.post("/api/admin/courses", response_model=schemas.CourseResponse)
def create_course(
    course_data: schemas.CourseCreate,
    admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    new_course = models.Course(**course_data.model_dump())
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course

@app.post("/api/admin/content", response_model=schemas.PortalContentResponse)
def create_portal_content(
    content_data: schemas.PortalContentCreate,
    admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    new_content = models.PortalContent(**content_data.model_dump())
    db.add(new_content)
    db.commit()
    db.refresh(new_content)
    return new_content

@app.post("/api/admin/announcements", response_model=schemas.AnnouncementResponse)
def create_announcement(
    ann_data: schemas.AnnouncementCreate,
    admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    new_ann = models.Announcement(**ann_data.model_dump())
    db.add(new_ann)
    db.commit()
    db.refresh(new_ann)
    return new_ann

@app.post("/api/admin/teachers", response_model=schemas.TeacherProfileResponse)
def create_teacher_profile(
    teacher_data: schemas.TeacherProfileCreate,
    admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    new_teacher = models.TeacherProfile(**teacher_data.model_dump())
    db.add(new_teacher)
    db.commit()
    db.refresh(new_teacher)
    return new_teacher

@app.delete("/api/admin/courses/{course_id}")
def delete_course(
    course_id: int,
    admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Also delete associated content, announcements, enrollments to prevent foreign key constraint issues
    db.query(models.Enrollment).filter(models.Enrollment.course_id == course_id).delete()
    db.query(models.PortalContent).filter(models.PortalContent.course_id == course_id).delete()
    db.query(models.Announcement).filter(models.Announcement.course_id == course_id).delete()
    
    db.delete(course)
    db.commit()
    return {"message": "Course deleted successfully"}

@app.delete("/api/admin/teachers/{teacher_id}")
def delete_teacher(
    teacher_id: int,
    admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    teacher = db.query(models.TeacherProfile).filter(models.TeacherProfile.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    db.delete(teacher)
    db.commit()
    return {"message": "Teacher profile deleted successfully"}

@app.delete("/api/admin/announcements/{announcement_id}")
def delete_announcement(
    announcement_id: int,
    admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    announcement = db.query(models.Announcement).filter(models.Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    db.delete(announcement)
    db.commit()
    return {"message": "Announcement deleted successfully"}


