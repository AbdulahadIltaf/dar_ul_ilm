import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CourseCard({ course, enrollmentStatus, onEnroll }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleEnrollClick = () => {
    if (!token) {
      navigate('/login?redirect=courses');
    } else {
      onEnroll(course.id);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'ongoing') {
      return <span className="badge badge-success">Ongoing</span>;
    }
    return <span className="badge badge-warning">Upcoming - July 1st</span>;
  };

  const getEnrollButton = () => {
    if (!token) {
      return (
        <button onClick={handleEnrollClick} className="btn btn-primary btn-full">
          Enroll Now
        </button>
      );
    }

    if (enrollmentStatus === 'active') {
      return (
        <button disabled className="btn btn-secondary btn-full btn-disabled">
          ✓ Active Enrollment
        </button>
      );
    }

    if (enrollmentStatus === 'pending') {
      return (
        <button disabled className="btn btn-secondary btn-full btn-disabled">
          ⏳ Pending Approval
        </button>
      );
    }

    return (
      <button onClick={handleEnrollClick} className="btn btn-primary btn-full">
        Enroll Now
      </button>
    );
  };

  return (
    <div className="card course-card">
      <div className="course-card-header">
        {getStatusBadge(course.status)}
      </div>
      
      <h3 className="course-title">{course.title}</h3>
      <p className="course-desc">{course.description}</p>
      
      <div className="course-actions">
        {getEnrollButton()}
      </div>

      <style>{`
        .course-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          border-top: 4px solid var(--color-gold) !important;
        }
        .course-card-header {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          margin-bottom: 16px;
        }
        .course-title {
          font-size: 1.35rem;
          margin-bottom: 12px;
          color: var(--color-forest);
        }
        .course-desc {
          font-size: 0.92rem;
          color: var(--color-muted);
          margin-bottom: 20px;
          flex-grow: 1;
        }
        .btn-full {
          width: 100%;
        }
        .btn-disabled {
          background-color: var(--color-bg-alt) !important;
          border-color: rgba(107, 124, 112, 0.2) !important;
          color: var(--color-muted) !important;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
