import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from '../config';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetch(`${API_BASE_URL}/api/student/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }
        const jsonData = await res.json();
        if (!res.ok) {
          throw new Error(jsonData.detail || "Failed to load dashboard data");
        }
        return jsonData;
      })
      .then((data) => {
        if (data) {
          setData(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Could not retrieve student data.");
        setLoading(false);
      });
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="dashboard-loading container section">
        <div className="loading-state">Loading your student portal dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container section">
        <div className="alert alert-error">{error}</div>
        <div className="text-center">
          <Link to="/" className="btn btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  const { student_name, courses, announcements } = data;

  return (
    <div className="dashboard-page section">
      <div className="container">
        <div className="dashboard-header-panel">
          <div className="welcome-text">
            <span>Assalamu Alaikum, sister</span>
            <h2>{student_name}</h2>
          </div>
          <div className="portal-badge">🛡️ Student Sanctuary Portal</div>
        </div>

        <div className="dashboard-grid">
          {/* Main Content Area: Enrolled Courses */}
          <div className="dashboard-main">
            <h3 className="section-subtitle-left">📖 Your Registered Batches</h3>
            
            {courses.length === 0 ? (
              <div className="card no-enrollment-card">
                <span className="card-icon">🌸</span>
                <h4>No Active Enrolled Courses</h4>
                <p>
                  You are registered in the portal but not actively enrolled in any courses. 
                  View the available courses list and click "Enroll" to join ongoing Tafseer, Tajweed, or Bayannat classes.
                </p>
                <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
              </div>
            ) : (
              <div className="enrolled-courses-list">
                {courses.map((course) => (
                  <div key={course.id} className="card course-portal-card">
                    <div className="course-portal-header">
                      <h4>{course.title}</h4>
                      <span className="course-schedule-tag">📅 {course.schedule}</span>
                    </div>
                    
                    <p className="course-teacher">Instructor: <strong>{course.instructor}</strong></p>
                    
                    {/* Material Sections */}
                    <div className="portal-materials-section">
                      <h5>Learning Materials & Access</h5>
                      
                      {course.materials.length === 0 ? (
                        <p className="no-materials">No study materials posted for this course yet.</p>
                      ) : (
                        <div className="materials-grid">
                          {course.materials.map((mat) => (
                            <div key={mat.id} className="material-item">
                              <span className="material-icon">
                                {mat.content_type === 'pdf' ? '📄' : 
                                 mat.content_type === 'audio' ? '🔊' : 
                                 mat.content_type === 'link' ? '🔗' : '📁'}
                              </span>
                              <div className="material-details">
                                <h6>{mat.title}</h6>
                                <p>{mat.description}</p>
                                <a 
                                  href={mat.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="material-download-btn"
                                >
                                  {mat.content_type === 'link' ? 'Join / Visit Link' : 'Open / Listen'}
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Area: Bulletins & Notices */}
          <div className="dashboard-sidebar">
            <div className="card bulletin-card">
              <h4>📋 Portal Announcements</h4>
              <div className="bulletin-list">
                {announcements.length === 0 ? (
                  <p className="no-bulletins">No notifications posted.</p>
                ) : (
                  announcements.map((ann) => (
                    <div key={ann.id} className="bulletin-item">
                      <span className="bulletin-date">{new Date(ann.created_at).toLocaleDateString()}</span>
                      <h5>{ann.title}</h5>
                      <p>{ann.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card contact-support-card">
              <h4>💬 Need Assistance?</h4>
              <p>For class timing queries, Shariah questions, or portal technical support, contact the Madarsa Admin:</p>
              <div className="support-details">
                <p>📱 Whatsapp: +92 300 1234567</p>
                <p>✉️ Email: support@darulilmlilbanaat.edu.pk</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-header-panel {
          background-color: var(--color-bg-alt);
          border: 1px solid rgba(197, 160, 89, 0.2);
          border-radius: var(--border-radius-md);
          padding: 28px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          border-left: 6px solid var(--color-forest);
        }
        .welcome-text span {
          font-size: 0.95rem;
          color: var(--color-muted);
        }
        .welcome-text h2 {
          font-size: 2rem;
          margin-top: 4px;
          color: var(--color-forest);
        }
        .portal-badge {
          background-color: var(--color-forest);
          color: var(--color-light);
          padding: 8px 18px;
          font-weight: 500;
          font-family: var(--font-title);
          border-radius: 50px;
          font-size: 0.85rem;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 40px;
        }
        @media (max-width: 992px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
        .section-subtitle-left {
          font-size: 1.4rem;
          margin-bottom: 24px;
          border-bottom: 1.5px solid rgba(197, 160, 89, 0.2);
          padding-bottom: 8px;
        }
        .no-enrollment-card {
          text-align: center;
          padding: 48px;
        }
        .card-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 16px;
        }
        .no-enrollment-card h4 {
          margin-bottom: 12px;
          font-size: 1.25rem;
        }
        .no-enrollment-card p {
          color: var(--color-muted);
          margin-bottom: 28px;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
          font-size: 0.95rem;
        }
        .enrolled-courses-list {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .course-portal-card {
          border-top: 4px solid var(--color-gold) !important;
        }
        .course-portal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 8px;
        }
        .course-portal-header h4 {
          font-size: 1.4rem;
          color: var(--color-forest);
        }
        .course-schedule-tag {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--color-muted);
        }
        .course-teacher {
          font-size: 0.92rem;
          color: var(--color-dark);
          margin-bottom: 24px;
        }
        .portal-materials-section {
          border-top: 1px solid rgba(107, 124, 112, 0.15);
          padding-top: 20px;
        }
        .portal-materials-section h5 {
          font-size: 1.05rem;
          color: var(--color-forest);
          margin-bottom: 16px;
        }
        .no-materials {
          font-style: italic;
          color: var(--color-muted);
          font-size: 0.9rem;
        }
        .materials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }
        .material-item {
          display: flex;
          gap: 14px;
          background-color: var(--color-bg-alt);
          padding: 16px;
          border-radius: var(--border-radius-sm);
          border: 1px solid rgba(197, 160, 89, 0.1);
        }
        .material-icon {
          font-size: 1.8rem;
          line-height: 1;
        }
        .material-details h6 {
          font-size: 0.95rem;
          color: var(--color-dark);
          margin-bottom: 4px;
        }
        .material-details p {
          font-size: 0.82rem;
          color: var(--color-muted);
          margin-bottom: 8px;
        }
        .material-download-btn {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--color-gold);
          text-decoration: none;
        }
        .material-download-btn:hover {
          color: var(--color-forest);
          text-decoration: underline;
        }
        .bulletin-card {
          margin-bottom: 24px;
        }
        .bulletin-card h4, .contact-support-card h4 {
          font-size: 1.15rem;
          color: var(--color-forest);
          margin-bottom: 16px;
          border-bottom: 1px solid rgba(197, 160, 89, 0.15);
          padding-bottom: 8px;
        }
        .bulletin-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-height: 320px;
          overflow-y: auto;
        }
        .bulletin-item {
          padding-bottom: 14px;
          border-bottom: 1px dashed rgba(107, 124, 112, 0.2);
        }
        .bulletin-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .bulletin-date {
          font-size: 0.78rem;
          color: var(--color-muted);
          display: block;
          margin-bottom: 4px;
        }
        .bulletin-item h5 {
          font-size: 0.98rem;
          margin-bottom: 6px;
        }
        .bulletin-item p {
          font-size: 0.88rem;
          color: var(--color-dark);
        }
        .contact-support-card p {
          font-size: 0.9rem;
          color: var(--color-muted);
          margin-bottom: 12px;
        }
        .support-details p {
          font-weight: 500;
          color: var(--color-dark);
          margin-bottom: 6px;
        }
      `}</style>
    </div>
  );
}
