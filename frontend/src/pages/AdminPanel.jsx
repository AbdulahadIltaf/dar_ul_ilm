import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [activeTab, setActiveTab] = useState('registrations');

  // Backend Data State
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State - Material Upload
  const [matCourseId, setMatCourseId] = useState('');
  const [matTitle, setMatTitle] = useState('');
  const [matType, setMatType] = useState('pdf');
  const [matUrl, setMatUrl] = useState('');
  const [matDesc, setMatDesc] = useState('');

  // Form State - Announcement Creation
  const [annCourseId, setAnnCourseId] = useState(''); // Empty string is global
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');

  // Alert State
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const clearAlerts = () => {
    setSuccess(null);
    setError(null);
  };

  useEffect(() => {
    if (!token || role !== 'admin') {
      navigate('/login');
      return;
    }

    setLoading(true);
    // Fetch all required data in parallel
    Promise.all([
      fetch('http://localhost:8000/api/admin/pending-students', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
      fetch('http://localhost:8000/api/admin/pending-enrollments', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
      fetch('http://localhost:8000/api/courses').then(res => res.json())
    ])
      .then(([usersData, enrollData, coursesData]) => {
        setPendingUsers(usersData);
        setPendingEnrollments(enrollData);
        setCourses(coursesData);
        if (coursesData.length > 0) {
          setMatCourseId(coursesData[0].id.toString());
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching admin panel data:", err);
        setError("Failed to retrieve administrative data.");
        setLoading(false);
      });
  }, [token, role, navigate]);

  // Handler: Approve Student Registration
  const handleApproveStudent = (userId) => {
    clearAlerts();
    fetch(`http://localhost:8000/api/admin/approve-student/${userId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Approval failed");
        return res.json();
      })
      .then((data) => {
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
        setSuccess(`Successfully approved student account: ${data.name}`);
      })
      .catch(err => setError(err.message));
  };

  // Handler: Approve Course Enrollment
  const handleApproveEnrollment = (enrollmentId) => {
    clearAlerts();
    fetch(`http://localhost:8000/api/admin/approve-enrollment/${enrollmentId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Enrollment approval failed");
        return res.json();
      })
      .then((data) => {
        setPendingEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
        setSuccess("Successfully approved course enrollment request.");
      })
      .catch(err => setError(err.message));
  };

  // Handler: Add Material Form Submission
  const handleAddMaterial = (e) => {
    e.preventDefault();
    clearAlerts();

    const payload = {
      course_id: parseInt(matCourseId),
      title: matTitle,
      content_type: matType,
      url: matUrl,
      description: matDesc
    };

    fetch('http://localhost:8000/api/admin/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) throw new Error("Upload failed");
        return res.json();
      })
      .then(() => {
        setSuccess(`Successfully uploaded study material '${matTitle}'!`);
        // Reset form
        setMatTitle('');
        setMatUrl('');
        setMatDesc('');
      })
      .catch(err => setError(err.message));
  };

  // Handler: Add Announcement Form Submission
  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    clearAlerts();

    const payload = {
      course_id: annCourseId === '' ? null : parseInt(annCourseId),
      title: annTitle,
      message: annMessage
    };

    fetch('http://localhost:8000/api/admin/announcements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) throw new Error("Announcement post failed");
        return res.json();
      })
      .then(() => {
        setSuccess(`Successfully posted announcement: '${annTitle}'`);
        // Reset form
        setAnnTitle('');
        setAnnMessage('');
      })
      .catch(err => setError(err.message));
  };

  return (
    <div className="admin-page section">
      <div className="container">
        <h2 className="admin-title">🕌 Administration Panel</h2>
        <p className="admin-subtitle">Welcome to the teacher/admin dashboard. Review registrations, enrollments, and post materials.</p>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'registrations' ? 'active' : ''}`}
            onClick={() => { setActiveTab('registrations'); clearAlerts(); }}
          >
            Pending Registrations ({pendingUsers.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'enrollments' ? 'active' : ''}`}
            onClick={() => { setActiveTab('enrollments'); clearAlerts(); }}
          >
            Course Requests ({pendingEnrollments.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={() => { setActiveTab('materials'); clearAlerts(); }}
          >
            Add Study Materials
          </button>
          <button 
            className={`tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => { setActiveTab('announcements'); clearAlerts(); }}
          >
            Post Announcements
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Loading administration workspace...</div>
        ) : (
          <div className="admin-tab-content">
            {/* Tab: Pending Registrations */}
            {activeTab === 'registrations' && (
              <div className="tab-pane">
                <h3>Approve Student Registrations</h3>
                {pendingUsers.length === 0 ? (
                  <p className="empty-message">No student registrations currently pending approval.</p>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email Address</th>
                          <th>Phone</th>
                          <th>Registered Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingUsers.map((u) => (
                          <tr key={u.id}>
                            <td><strong>{u.name}</strong></td>
                            <td>{u.email}</td>
                            <td>{u.phone || 'N/A'}</td>
                            <td>{new Date(u.created_at).toLocaleDateString()}</td>
                            <td>
                              <button 
                                onClick={() => handleApproveStudent(u.id)} 
                                className="btn btn-primary btn-sm"
                              >
                                Approve Account
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Course Enrollments */}
            {activeTab === 'enrollments' && (
              <div className="tab-pane">
                <h3>Course Access Requests</h3>
                {pendingEnrollments.length === 0 ? (
                  <p className="empty-message">No course enrollment requests pending approval.</p>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Student Email</th>
                          <th>Requested Course</th>
                          <th>Request Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingEnrollments.map((e) => (
                          <tr key={e.id}>
                            <td><strong>{e.user.name}</strong></td>
                            <td>{e.user.email}</td>
                            <td><span className="badge badge-info">{e.course.title}</span></td>
                            <td>{new Date(e.created_at).toLocaleDateString()}</td>
                            <td>
                              <button 
                                onClick={() => handleApproveEnrollment(e.id)} 
                                className="btn btn-gold btn-sm"
                              >
                                Approve Access
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Upload Materials */}
            {activeTab === 'materials' && (
              <div className="tab-pane card form-card">
                <h3>Post Course Resources</h3>
                <form onSubmit={handleAddMaterial}>
                  <div className="form-group">
                    <label className="form-label">Select Course</label>
                    <select 
                      className="form-control"
                      value={matCourseId}
                      onChange={(e) => setMatCourseId(e.target.value)}
                      required
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Resource Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={matTitle}
                      onChange={(e) => setMatTitle(e.target.value)}
                      placeholder="e.g. Surah Al-Baqarah Verses 21-30 Tafseer Notes"
                      required
                    />
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Resource Type</label>
                      <select 
                        className="form-control"
                        value={matType}
                        onChange={(e) => setMatType(e.target.value)}
                      >
                        <option value="pdf">📄 PDF Document</option>
                        <option value="audio">🔊 Audio (MP3 Lecture)</option>
                        <option value="link">🔗 Zoom/Meet Class Link</option>
                        <option value="video">📹 Video Recording</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Resource URL / Link</label>
                      <input 
                        type="url" 
                        className="form-control" 
                        value={matUrl}
                        onChange={(e) => setMatUrl(e.target.value)}
                        placeholder="https://example.com/file.pdf"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Resource Description (Optional)</label>
                    <textarea 
                      className="form-control"
                      value={matDesc}
                      onChange={(e) => setMatDesc(e.target.value)}
                      placeholder="Provide quick notes or joining instructions for the student portal..."
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">Add Resource to Portal</button>
                </form>
              </div>
            )}

            {/* Tab: Post Announcements */}
            {activeTab === 'announcements' && (
              <div className="tab-pane card form-card">
                <h3>Post a Notification</h3>
                <form onSubmit={handleAddAnnouncement}>
                  <div className="form-group">
                    <label className="form-label">Select Scope</label>
                    <select 
                      className="form-control"
                      value={annCourseId}
                      onChange={(e) => setAnnCourseId(e.target.value)}
                    >
                      <option value="">📢 Global (All Portal Users)</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>Course: {c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Announcement Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      placeholder="e.g. Schedule Update / Upcoming Event"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Announcement Message</label>
                    <textarea 
                      className="form-control"
                      value={annMessage}
                      onChange={(e) => setAnnMessage(e.target.value)}
                      placeholder="Write details for your students here..."
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">Post Announcement</button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .admin-title {
          font-size: 2.2rem;
          color: var(--color-forest);
          margin-bottom: 8px;
        }
        .admin-subtitle {
          color: var(--color-muted);
          margin-bottom: 40px;
        }
        .admin-tabs {
          display: flex;
          gap: 12px;
          border-bottom: 2px solid rgba(197, 160, 89, 0.2);
          padding-bottom: 2px;
          margin-bottom: 32px;
          overflow-x: auto;
        }
        .tab-btn {
          background: none;
          border: none;
          padding: 12px 20px;
          font-family: var(--font-title);
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--color-muted);
          cursor: pointer;
          border-radius: var(--border-radius-sm) var(--border-radius-sm) 0 0;
          transition: var(--transition-fast);
          white-space: nowrap;
        }
        .tab-btn:hover {
          color: var(--color-forest);
          background-color: var(--color-bg-alt);
        }
        .tab-btn.active {
          color: var(--color-forest);
          border-bottom: 3px solid var(--color-forest);
          background-color: var(--color-bg-alt);
        }
        .admin-tab-content h3 {
          font-size: 1.4rem;
          color: var(--color-forest);
          margin-bottom: 24px;
        }
        .empty-message {
          color: var(--color-muted);
          font-style: italic;
          padding: 30px 0;
        }
        .form-card {
          border-top: 4px solid var(--color-gold) !important;
          max-width: 800px;
        }
        .loading-state {
          text-align: center;
          padding: 60px;
          color: var(--color-muted);
        }
      `}</style>
    </div>
  );
}
