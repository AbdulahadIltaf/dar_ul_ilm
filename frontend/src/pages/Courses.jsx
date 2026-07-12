import React, { useState, useEffect } from 'react';
import CourseCard from '../components/CourseCard';
import API_BASE_URL from '../config';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    // 1. Fetch courses
    fetch(`${API_BASE_URL}/api/courses`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch courses");
        return res.json();
      })
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load courses. Please try again later.");
        setLoading(false);
      });

    // 2. Fetch student enrollments if logged in
    if (token) {
      fetch(`${API_BASE_URL}/api/student/enrollments`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          return [];
        })
        .then((data) => {
          const map = {};
          data.forEach((e) => {
            map[e.course_id] = e.status;
          });
          setEnrollments(map);
        })
        .catch((err) => console.error("Error fetching student enrollments:", err));
    }
  }, [token]);

  const handleEnroll = (courseId) => {
    setSuccessMsg(null);
    setError(null);

    fetch(`${API_BASE_URL}/api/student/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ course_id: courseId }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            throw new Error(errData.detail || "Enrollment request failed");
          });
        }
        return res.json();
      })
      .then((data) => {
        // Update enrollment map in state
        setEnrollments((prev) => ({
          ...prev,
          [courseId]: data.status,
        }));
        
        const courseName = courses.find(c => c.id === courseId)?.title || "course";
        setSuccessMsg(`Your enrollment request for '${courseName}' has been submitted successfully! The administration will approve it shortly.`);
        
        // Scroll to top to see notification
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch((err) => {
        setError(err.message || "An error occurred during enrollment.");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  };

  const ongoingCourses = courses.filter((c) => c.status === 'ongoing');
  const upcomingCourses = courses.filter((c) => c.status === 'upcoming');

  return (
    <div className="courses-page section">
      <div className="container">
        <h2 className="section-title">Academic Programs</h2>
        <p className="section-subtitle">
          Classical Islamic learning customized for sisters. Join our ongoing interactive courses or pre-register for upcoming modules.
        </p>

        {successMsg && (
          <div className="alert alert-success">
            {successMsg}
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-state">Loading course listings...</div>
        ) : (
          <>
            {/* Ongoing Batches */}
            <div className="course-group">
              <h3 className="group-title">
                <span className="title-bullet">🌿</span> Ongoing Programs
              </h3>
              {ongoingCourses.length === 0 ? (
                <p className="no-courses">No ongoing courses available.</p>
              ) : (
                <div className="grid-3">
                  {ongoingCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      enrollmentStatus={enrollments[course.id]}
                      onEnroll={handleEnroll}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Batches */}
            <div className="course-group mt-5">
              <h3 className="group-title">
                <span className="title-bullet">✨</span> Upcoming Programs (Starting July 1st)
              </h3>
              {upcomingCourses.length === 0 ? (
                <p className="no-courses">No upcoming courses scheduled.</p>
              ) : (
                <div className="grid-3">
                  {upcomingCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      enrollmentStatus={enrollments[course.id]}
                      onEnroll={handleEnroll}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        .course-group {
          margin-bottom: 56px;
        }
        .group-title {
          font-size: 1.6rem;
          margin-bottom: 28px;
          border-bottom: 1.5px solid rgba(197, 160, 89, 0.2);
          padding-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .title-bullet {
          font-size: 1.3rem;
        }
        .mt-5 {
          margin-top: 56px;
        }
        .no-courses {
          color: var(--color-muted);
          font-style: italic;
          padding: 20px 0;
        }
        .loading-state {
          text-align: center;
          padding: 60px;
          color: var(--color-muted);
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
}
