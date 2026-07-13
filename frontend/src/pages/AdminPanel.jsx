import React, { useState, useEffect } from 'react';
import logoImg from '../assets/logo.jpeg';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

export default function AdminPanel() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [activeTab, setActiveTab] = useState('registrations');

  // Backend Data State
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);



  // Form State - Announcement Creation
  const [annCourseId, setAnnCourseId] = useState(''); // Empty string is global
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');

  // Form State - Course Management
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseStatus, setCourseStatus] = useState('ongoing');

  // Form State - Teacher Management
  const [teacherName, setTeacherName] = useState('');
  const [teacherQual, setTeacherQual] = useState('');
  const [teacherBio, setTeacherBio] = useState('');
  const [teacherImg, setTeacherImg] = useState('');

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
      fetch(`${API_BASE_URL}/api/admin/pending-students`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/admin/pending-enrollments`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/courses`).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/teachers`).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/announcements`).then(res => res.json())
    ])
      .then(([usersData, enrollData, coursesData, teachersData, announcementsData]) => {
        setPendingUsers(usersData);
        setPendingEnrollments(enrollData);
        setCourses(coursesData);
        setTeachers(teachersData);
        setAnnouncements(announcementsData);
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
    fetch(`${API_BASE_URL}/api/admin/approve-student/${userId}`, {
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
    fetch(`${API_BASE_URL}/api/admin/approve-enrollment/${enrollmentId}`, {
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



  // Handler: Add Announcement Form Submission
  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    clearAlerts();

    const payload = {
      course_id: annCourseId === '' ? null : parseInt(annCourseId),
      title: annTitle,
      message: annMessage
    };

    fetch(`${API_BASE_URL}/api/admin/announcements`, {
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
      .then((newAnn) => {
        setAnnouncements(prev => [newAnn, ...prev]);
        setSuccess(`Successfully posted announcement: '${newAnn.title}'`);
        // Reset form
        setAnnTitle('');
        setAnnMessage('');
      })
      .catch(err => setError(err.message));
  };

  // Handler: Delete Announcement
  const handleDeleteAnnouncement = (announcementId, announcementTitle) => {
    if (!window.confirm(`Are you sure you want to delete announcement "${announcementTitle}"?`)) return;
    clearAlerts();

    fetch(`${API_BASE_URL}/api/admin/announcements/${announcementId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete announcement");
        setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
        setSuccess(`Successfully deleted announcement: ${announcementTitle}`);
      })
      .catch(err => setError(err.message));
  };

  // Handler: Add Course
  const handleAddCourse = (e) => {
    e.preventDefault();
    clearAlerts();

    const payload = {
      title: courseTitle,
      description: courseDesc || null,
      status: courseStatus
    };

    fetch(`${API_BASE_URL}/api/admin/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add course");
        return res.json();
      })
      .then((newCourse) => {
        setCourses(prev => [...prev, newCourse]);
        setSuccess(`Successfully added course: ${newCourse.title}`);
        // Reset form
        setCourseTitle('');
        setCourseDesc('');
        setCourseStatus('ongoing');
      })
      .catch(err => setError(err.message));
  };

  // Handler: Delete Course
  const handleDeleteCourse = (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete course "${courseTitle}"? All associated materials, enrollments, and announcements will be deleted.`)) return;
    clearAlerts();

    fetch(`${API_BASE_URL}/api/admin/courses/${courseId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete course");
        setCourses(prev => prev.filter(c => c.id !== courseId));
        setSuccess(`Successfully deleted course: ${courseTitle}`);
      })
      .catch(err => setError(err.message));
  };

  // Handler: Add Teacher
  const handleAddTeacher = (e) => {
    e.preventDefault();
    clearAlerts();

    const payload = {
      name: teacherName,
      qualification: teacherQual || null,
      bio: teacherBio || null,
      image_url: teacherImg || null
    };

    fetch(`${API_BASE_URL}/api/admin/teachers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add teacher");
        return res.json();
      })
      .then((newTeacher) => {
        setTeachers(prev => [...prev, newTeacher]);
        setSuccess(`Successfully added teacher profile: ${newTeacher.name}`);
        // Reset form
        setTeacherName('');
        setTeacherQual('');
        setTeacherBio('');
        setTeacherImg('');
      })
      .catch(err => setError(err.message));
  };

  // Handler: Delete Teacher
  const handleDeleteTeacher = (teacherId, teacherName) => {
    if (!window.confirm(`Are you sure you want to delete teacher "${teacherName}"?`)) return;
    clearAlerts();

    fetch(`${API_BASE_URL}/api/admin/teachers/${teacherId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete teacher");
        setTeachers(prev => prev.filter(t => t.id !== teacherId));
        setSuccess(`Successfully deleted teacher profile: ${teacherName}`);
      })
      .catch(err => setError(err.message));
  };


  return (
    <div className="admin-page section">
      <div className="container">
        <div className="admin-header">
          <img src={logoImg} alt="Madarsa Dar-Ul-Ilm Lilbanaat" className="admin-logo" />
          <div>
            <h2 className="admin-title">Administration Panel</h2>
            <p className="admin-subtitle">Welcome to the teacher/admin dashboard. Review registrations, enrollments, and post materials.</p>
          </div>
        </div>

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
            className={`tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => { setActiveTab('announcements'); clearAlerts(); }}
          >
            Post Announcements ({announcements.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'manage-courses' ? 'active' : ''}`}
            onClick={() => { setActiveTab('manage-courses'); clearAlerts(); }}
          >
            Manage Courses ({courses.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'manage-teachers' ? 'active' : ''}`}
            onClick={() => { setActiveTab('manage-teachers'); clearAlerts(); }}
          >
            Manage Teachers ({teachers.length})
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



            {/* Tab: Post Announcements */}
            {activeTab === 'announcements' && (
              <div className="tab-pane">
                <div className="admin-split-layout">
                  {/* List Announcements */}
                  <div className="admin-list-section card">
                    <h3>Active Announcements</h3>
                    {announcements.length === 0 ? (
                      <p className="empty-message">No announcements posted yet.</p>
                    ) : (
                      <div className="table-wrapper">
                        <table>
                          <thead>
                            <tr>
                              <th>Scope</th>
                              <th>Title</th>
                              <th>Message Summary</th>
                              <th>Posted Date</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {announcements.map((ann) => (
                              <tr key={ann.id}>
                                <td>
                                  <span className={`badge ${ann.course_id ? 'badge-info' : 'badge-primary'}`}>
                                    {ann.course_id 
                                      ? courses.find(c => c.id === ann.course_id)?.title || 'Course-specific'
                                      : '📢 Global'}
                                  </span>
                                </td>
                                <td><strong>{ann.title}</strong></td>
                                <td>{ann.message.substring(0, 50)}{ann.message.length > 50 ? '...' : ''}</td>
                                <td>{new Date(ann.created_at).toLocaleDateString()}</td>
                                <td>
                                  <button 
                                    onClick={() => handleDeleteAnnouncement(ann.id, ann.title)} 
                                    className="btn btn-danger btn-sm"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Add Announcement Form */}
                  <div className="admin-form-section card form-card">
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
                </div>
              </div>
            )}

            {/* Tab: Manage Courses */}
            {activeTab === 'manage-courses' && (
              <div className="tab-pane">
                <div className="admin-split-layout">
                  {/* List Courses */}
                  <div className="admin-list-section card">
                    <h3>Existing Courses</h3>
                    {courses.length === 0 ? (
                      <p className="empty-message">No courses available.</p>
                    ) : (
                      <div className="table-wrapper">
                        <table>
                          <thead>
                            <tr>
                              <th>Title</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {courses.map((c) => (
                              <tr key={c.id}>
                                <td><strong>{c.title}</strong></td>
                                <td>
                                  <span className={`badge ${c.status === 'ongoing' ? 'badge-success' : 'badge-warning'}`}>
                                    {c.status === 'ongoing' ? 'Ongoing' : 'Upcoming'}
                                  </span>
                                </td>
                                <td>
                                  <button 
                                    onClick={() => handleDeleteCourse(c.id, c.title)} 
                                    className="btn btn-danger btn-sm"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Add Course Form */}
                  <div className="admin-form-section card form-card">
                    <h3>Add New Course</h3>
                    <form onSubmit={handleAddCourse}>
                      <div className="form-group">
                        <label className="form-label">Course Title</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={courseTitle}
                          onChange={(e) => setCourseTitle(e.target.value)}
                          placeholder="e.g. Fiqh ul-Hadith"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Course Description</label>
                        <textarea 
                          className="form-control"
                          value={courseDesc}
                          onChange={(e) => setCourseDesc(e.target.value)}
                          placeholder="Course outline and goals..."
                          rows="3"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select 
                          className="form-control"
                          value={courseStatus}
                          onChange={(e) => setCourseStatus(e.target.value)}
                        >
                          <option value="ongoing">Ongoing</option>
                          <option value="upcoming">Upcoming</option>
                        </select>
                      </div>

                      <button type="submit" className="btn btn-primary">Create Course</button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Manage Teachers */}
            {activeTab === 'manage-teachers' && (
              <div className="tab-pane">
                <div className="admin-split-layout">
                  {/* List Teachers */}
                  <div className="admin-list-section card">
                    <h3>Registered Teachers</h3>
                    {teachers.length === 0 ? (
                      <p className="empty-message">No teachers registered.</p>
                    ) : (
                      <div className="table-wrapper">
                        <table>
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Qualification</th>
                              <th>Bio Summary</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {teachers.map((t) => (
                              <tr key={t.id}>
                                <td><strong>{t.name}</strong></td>
                                <td>{t.qualification || 'N/A'}</td>
                                <td>{t.bio ? t.bio.substring(0, 80) + '...' : 'N/A'}</td>
                                <td>
                                  <button 
                                    onClick={() => handleDeleteTeacher(t.id, t.name)} 
                                    className="btn btn-danger btn-sm"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Add Teacher Form */}
                  <div className="admin-form-section card form-card">
                    <h3>Add New Teacher Profile</h3>
                    <form onSubmit={handleAddTeacher}>
                      <div className="form-group">
                        <label className="form-label">Teacher Name</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={teacherName}
                          onChange={(e) => setTeacherName(e.target.value)}
                          placeholder="e.g. Ustadha Fatima"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Qualification</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={teacherQual}
                          onChange={(e) => setTeacherQual(e.target.value)}
                          placeholder="e.g. Alimah (Shahadat-ul-Alimiyyah)"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Profile Image URL (Optional)</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={teacherImg}
                          onChange={(e) => setTeacherImg(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Short Bio / Background</label>
                        <textarea 
                          className="form-control"
                          value={teacherBio}
                          onChange={(e) => setTeacherBio(e.target.value)}
                          placeholder="Teaching experience, specialization, etc..."
                          rows="4"
                        />
                      </div>

                      <button type="submit" className="btn btn-primary">Create Teacher Profile</button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .admin-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 40px;
        }
        .admin-logo {
          width: 90px;
          height: 90px;
          object-fit: contain;
          flex-shrink: 0;
        }
        .admin-title {
          font-size: 2.2rem;
          color: var(--color-forest);
          margin-bottom: 6px;
        }
        .admin-subtitle {
          color: var(--color-muted);
          margin-bottom: 0;
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
        .admin-split-layout {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 32px;
          align-items: start;
        }
        .admin-list-section {
          overflow-x: auto;
        }
        @media (max-width: 992px) {
          .admin-split-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
