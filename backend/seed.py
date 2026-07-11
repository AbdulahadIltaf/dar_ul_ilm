from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models
import auth

def seed_database():
    # Create tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Create Default Admin User
        admin_email = "admin@darulilm.com"
        admin_user = db.query(models.User).filter(models.User.email == admin_email).first()
        if not admin_user:
            admin_user = models.User(
                name="Administration",
                email=admin_email,
                password_hash=auth.get_password_hash("adminpassword"),
                phone="0300-1234567",
                role="admin",
                is_approved=True
            )
            db.add(admin_user)
            print("Admin account created (admin@darulilm.com / adminpassword)")

        # 2. Create Default Student User (for demo)
        student_email = "student@darulilm.com"
        student_user = db.query(models.User).filter(models.User.email == student_email).first()
        if not student_user:
            student_user = models.User(
                name="Ayesha Ahmed",
                email=student_email,
                password_hash=auth.get_password_hash("studentpassword"),
                phone="0312-7654321",
                role="student",
                is_approved=True
            )
            db.add(student_user)
            print("Student account created (student@darulilm.com / studentpassword)")

        # 3. Create Default Courses if not existing
        courses_data = [
            {
                "title": "Tafseer ul Quran (Batch 1)",
                "description": "An in-depth study of the Quranic verses, word-to-word translation, grammatical analysis, and practical implementation in daily life.",
                "schedule": "Every Saturday & Sunday - 10:00 AM to 11:30 AM",
                "instructor": "Ustadha Zainab Khanani",
                "status": "ongoing"
            },
            {
                "title": "Tafseer ul Quran (Batch 2)",
                "description": "Weekly Tafseer class focused on Juz 30 and daily supplications, perfect for beginners and young learners.",
                "schedule": "Every Tuesday & Thursday - 5:00 PM to 6:30 PM",
                "instructor": "Ustadha Zainab Khanani",
                "status": "ongoing"
            },
            {
                "title": "Tajweed ul Quran",
                "description": "Mastering the rules of Tajweed, correct pronunciation of letters (Makharij), and beautification of Quran recitation.",
                "schedule": "Every Monday & Wednesday - 3:00 PM to 4:30 PM",
                "instructor": "Ustadha Zainab Khanani",
                "status": "ongoing"
            },
            {
                "title": "Weekly Bayannat (Dua Series)",
                "description": "A weekly spiritual gathering (Islahi talk) focusing on the power of Dua, purification of the heart, and gaining closeness to Allah.",
                "schedule": "Every Friday - 9:00 PM PKT",
                "instructor": "Ustadha Zainab Khanani",
                "status": "ongoing"
            },
            {
                "title": "Deeni o Sharai Masail",
                "description": "Upcoming fiqh course addressing everyday Islamic jurisprudence queries, purification (Taharah), prayer rules, and contemporary issues.",
                "schedule": "Starting 1st of July - Every Thursday - 4:00 PM",
                "instructor": "Ustadha Zainab Khanani",
                "status": "upcoming"
            }
        ]

        seeded_courses = {}
        for c_data in courses_data:
            course = db.query(models.Course).filter(models.Course.title == c_data["title"]).first()
            if not course:
                course = models.Course(**c_data)
                db.add(course)
                db.flush()  # to get the ID
                print(f"Course '{course.title}' created.")
            seeded_courses[c_data["title"]] = course

        # 4. Seed Course Content for Student Portal (for ongoing courses)
        # Tafseer Batch 1 Content
        c_tafseer_1 = seeded_courses["Tafseer ul Quran (Batch 1)"]
        if not db.query(models.PortalContent).filter(models.PortalContent.course_id == c_tafseer_1.id).first():
            db.add_all([
                models.PortalContent(
                    course_id=c_tafseer_1.id,
                    title="Surah Al-Baqarah Verses 1-20 Tafseer Notes",
                    content_type="pdf",
                    url="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    description="Detailed explanation PDF notes covering Tafseer of Surah Al-Baqarah."
                ),
                models.PortalContent(
                    course_id=c_tafseer_1.id,
                    title="Live Zoom Link for Saturday Class",
                    content_type="link",
                    url="https://zoom.us/j/9876543210",
                    description="Join the live online class directly every Saturday."
                )
            ])

        # Weekly Bayannat Content
        c_bayannat = seeded_courses["Weekly Bayannat (Dua Series)"]
        if not db.query(models.PortalContent).filter(models.PortalContent.course_id == c_bayannat.id).first():
            db.add_all([
                models.PortalContent(
                    course_id=c_bayannat.id,
                    title="Bayyan 1: Importance & Power of Dua",
                    content_type="audio",
                    url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                    description="Audio recording of weekly Islahi Bayan held on Friday."
                ),
                models.PortalContent(
                    course_id=c_bayannat.id,
                    title="Dua List & Sunnah Supplications Compilation",
                    content_type="pdf",
                    url="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    description="Handy reference booklet for regular morning & evening supplications."
                )
            ])

        # 5. Seed Enrollments
        # Enroll default student in Tafseer Batch 1 and Weekly Bayannat
        if student_user:
            for course_name in ["Tafseer ul Quran (Batch 1)", "Weekly Bayannat (Dua Series)"]:
                course = seeded_courses[course_name]
                enrollment = db.query(models.Enrollment).filter(
                    models.Enrollment.user_id == student_user.id,
                    models.Enrollment.course_id == course.id
                ).first()
                if not enrollment:
                    enrollment = models.Enrollment(
                        user_id=student_user.id,
                        course_id=course.id,
                        status="active"
                    )
                    db.add(enrollment)
                    print(f"Enrolled default student in '{course_name}'")

        # 6. Seed Teacher Profiles
        teachers_data = [
            {
                "name": "Ustadha Zainab Khanani",
                "bio": "Ustadha Zainab Khanani is a highly respected Islamic scholar and educator. She has dedicated her life to teaching Quranic Tafseer, Tajweed, and Hadith sciences, particularly focusing on sisters' spiritual development (Tazkiyah) and jurisprudence questions (Masail).",
                "qualification": "Alimah (Shahadat-ul-Alimiyyah) & Master's in Islamic Studies",
                "image_url": ""
            }
        ]

        for t_data in teachers_data:
            teacher = db.query(models.TeacherProfile).filter(models.TeacherProfile.name == t_data["name"]).first()
            if not teacher:
                teacher = models.TeacherProfile(**t_data)
                db.add(teacher)
                print(f"Teacher Profile '{teacher.name}' created.")

        # 7. Seed Announcements
        announcements_data = [
            {
                "course_id": None, # Global announcement
                "title": "Welcome to Dar-Ul-Ilm Lilbanaat Portal",
                "message": "Assalamu Alaikum. We welcome all our students to the newly launched portal. Register today, select your courses, and access your lecture notes, live class links, and recorded audio bayannat directly from your dashboard!"
            },
            {
                "course_id": None,
                "title": "Upcoming Course: Deeni o Sharai Masail",
                "message": "Register now for our upcoming 'Deeni o Sharai Masail' course starting on the 1st of July. The course will address everyday jurisprudence issues, specifically customized for women."
            }
        ]

        for a_data in announcements_data:
            ann = db.query(models.Announcement).filter(models.Announcement.title == a_data["title"]).first()
            if not ann:
                ann = models.Announcement(**a_data)
                db.add(ann)
                print(f"Global announcement '{ann.title}' created.")

        db.commit()
        print("Database successfully seeded!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
