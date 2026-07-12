import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch courses and announcements in parallel
    Promise.all([
      fetch(`${API_BASE_URL}/api/courses`).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/announcements`).then(res => res.json())
    ])
      .then(([coursesData, announcementsData]) => {
        setCourses(coursesData.slice(0, 3)); // show first 3
        setAnnouncements(announcementsData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching homepage data:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <span className="hero-tag">Guiding Hearts Through the Light of the Qur'an</span>
            <h1 className="hero-title">Welcome to Madarsa Dar-Ul-Ilm Lilbanaat</h1>
            <p className="hero-subtitle">
              A sanctuary of learning, where hearts turn towards guidance, minds awaken through knowledge, and every step is taken with the hope of drawing closer to Allah ﷻ.
            </p>
            <div className="hero-actions">
              <Link to="/courses" className="btn btn-primary">Explore Courses</Link>
              <Link to="/login" className="btn btn-secondary">Student Portal</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card-pattern">
              <div className="pattern-inner">
                <span className="pattern-arabic">طلب العلم نور</span>
                <span className="pattern-eng">Seeking Knowledge is Light</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="container welcome-container">
          <div className="welcome-card">
            <h2 className="welcome-title">A Place Where Knowledge Finds a Home</h2>
            <div className="floral-divider">❦ ════ • 💮 • ════ ❦</div>
            <p className="welcome-greeting">Assalamu Alaikum Wa Rahmatullahi Wa Barakatuh</p>
            <div className="welcome-text">
              <p>
                Welcome to <strong>Madarsa Dar-Ul-Ilm Lilbanaat</strong> — a sanctuary of learning, where hearts turn towards guidance, minds awaken through knowledge, and every step is taken with the hope of drawing closer to Allah ﷻ.
              </p>
              <p>
                Here, we believe that sacred knowledge is more than words learned and lessons remembered. It is light that enters the heart, shapes the character, and transforms the journey of life.
              </p>
              
              <div className="arabic-callout">
                <span className="arabic-text">طلب العلم نور</span>
                <span className="english-translation">Seeking knowledge is light.</span>
              </div>
              
              <p>
                May this be a place where questions find understanding, hearts find purpose, and knowledge becomes a lifelong companion.
              </p>
              <p className="welcome-conclusion">
                Your journey towards light begins here. <br />
                <strong>Welcome home. Welcome to Dar-Ul-Ilm.</strong> 🌿
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements Board */}
      {announcements.length > 0 && (
        <section className="announcements-section">
          <div className="container">
            <div className="announcement-board">
              <div className="board-header">
                <h3>📢 Important Announcements</h3>
              </div>
              <div className="board-content">
                {announcements.map((ann, idx) => (
                  <div key={idx} className="ann-item">
                    <span className="ann-date">{new Date(ann.created_at).toLocaleDateString()}</span>
                    <h4 className="ann-title">{ann.title}</h4>
                    <p className="ann-message">{ann.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Core Values / Features */}
      <section className="section values-section">
        <div className="container">
          <h2 className="section-title">Why Study With Us?</h2>
          <p className="section-subtitle">We strive to provide a complete spiritual and academic environment for sisters seeking classical Islamic sciences.</p>
          
          <div className="grid-3">
            <div className="card value-card">
              <div className="value-icon">📖</div>
              <h3>Authentic Curriculum</h3>
              <p>Courses in Tafseer, Tajweed, and Sharai Masail verified and structured by qualified Alimahs.</p>
            </div>
            <div className="card value-card">
              <div className="value-icon">🌿</div>
              <h3>Qualified Female Faculty</h3>
              <p>Classes led by experienced Ustadhas dedicated to personal mentoring and spiritual grooming (Tazkiyah).</p>
            </div>
            <div className="card value-card">
              <div className="value-icon">💻</div>
              <h3>Flexible Student Portal</h3>
              <p>Access notes, audio recordings, zoom class links, and submit queries from the comfort of your home.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="section bg-light-section">
        <div className="container">
          <h2 className="section-title">Ongoing & Upcoming Courses</h2>
          <p className="section-subtitle">Enroll in our current batches or register for upcoming programs.</p>
          
          {loading ? (
            <div className="loading-state">Loading courses...</div>
          ) : (
            <div className="grid-3">
              {courses.map(course => (
                <div key={course.id} className="card home-course-card">
                  <span className={`badge ${course.status === 'ongoing' ? 'badge-success' : 'badge-warning'}`}>
                    {course.status === 'ongoing' ? 'Ongoing' : 'Upcoming'}
                  </span>
                  <h3>{course.title}</h3>
                  <p>{course.description.substring(0, 120)}...</p>
                  <Link to="/courses" className="course-link">View Course Details →</Link>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-4">
            <Link to="/courses" className="btn btn-gold">View All Courses & Timings</Link>
          </div>
        </div>
      </section>

      {/* Principal / Teacher Quote */}
      <section className="section quote-section">
        <div className="container quote-container">
          <div className="quote-box">
            <span className="quote-mark">“</span>
            <p className="quote-text">
              Our vision is to empower sisters with traditional Islamic knowledge, enabling them to build a deep, meaningful connection with the Quran, develop fine moral character, and confidently navigate daily life in accordance with the Shariah.
            </p>
            <div className="quote-author">
              <span className="author-name">Bint-e-Iftikhar</span>
              <span className="author-title">Founder, Madarsa Dar-Ul-Ilm Lilbanaat</span>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .hero-section {
          background: linear-gradient(135deg, #FFFFFF 0%, #FAF9F6 100%);
          padding: 100px 0;
          overflow: hidden;
          border-bottom: 1px solid rgba(197, 160, 89, 0.1);
        }
        .hero-container {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          align-items: center;
          gap: 48px;
        }
        .hero-content {
          max-width: 650px;
        }
        .hero-tag {
          font-family: var(--font-title);
          font-weight: 600;
          color: var(--color-gold);
          font-size: 1.1rem;
          display: inline-block;
          margin-bottom: 16px;
          border-bottom: 2px solid var(--color-pink);
          padding-bottom: 4px;
        }
        .hero-title {
          font-size: 3rem;
          line-height: 1.2;
          margin-bottom: 24px;
          color: var(--color-forest);
        }
        .hero-subtitle {
          font-size: 1.1rem;
          color: var(--color-muted);
          margin-bottom: 36px;
        }
        .hero-actions {
          display: flex;
          gap: 16px;
        }
        .hero-visual {
          display: flex;
          justify-content: center;
        }
        .hero-card-pattern {
          width: 320px;
          height: 320px;
          background-color: var(--color-forest);
          border: 4px solid var(--color-gold);
          border-radius: var(--border-radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: var(--shadow-lg);
        }
        .hero-card-pattern::before {
          content: "";
          position: absolute;
          width: calc(100% - 16px);
          height: calc(100% - 16px);
          border: 1px dashed var(--color-gold);
          border-radius: calc(var(--border-radius-lg) - 8px);
        }
        .pattern-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          color: var(--color-light);
          padding: 24px;
          z-index: 1;
        }
        .pattern-arabic {
          font-size: 2.2rem;
          font-family: 'Outfit', sans-serif;
          margin-bottom: 12px;
          color: var(--color-gold);
        }
        .pattern-eng {
          font-size: 0.95rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          opacity: 0.8;
        }
        .bg-light-section {
          background-color: var(--color-bg-alt);
        }
        .announcements-section {
          margin-top: -40px;
          margin-bottom: 40px;
          position: relative;
          z-index: 10;
        }
        .announcement-board {
          background-color: var(--color-light);
          border: 2px solid var(--color-gold);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-md);
          overflow: hidden;
        }
        .board-header {
          background-color: var(--color-forest);
          padding: 16px 24px;
        }
        .board-header h3 {
          color: var(--color-gold);
          font-size: 1.15rem;
          margin: 0;
        }
        .board-content {
          max-height: 240px;
          overflow-y: auto;
          padding: 12px 24px;
        }
        .ann-item {
          padding: 16px 0;
          border-bottom: 1px solid rgba(197, 160, 89, 0.15);
        }
        .ann-item:last-child {
          border-bottom: none;
        }
        .ann-date {
          font-size: 0.8rem;
          color: var(--color-muted);
          font-weight: 500;
          display: block;
          margin-bottom: 4px;
        }
        .ann-title {
          font-size: 1.05rem;
          margin-bottom: 6px;
          color: var(--color-forest);
        }
        .ann-message {
          font-size: 0.92rem;
          color: var(--color-dark);
        }
        .value-card {
          text-align: center;
          border-top: 4px solid var(--color-forest) !important;
        }
        .value-icon {
          font-size: 3rem;
          margin-bottom: 20px;
        }
        .value-card h3 {
          margin-bottom: 12px;
          font-size: 1.25rem;
        }
        .value-card p {
          font-size: 0.92rem;
          color: var(--color-muted);
        }
        .home-course-card {
          background-color: var(--color-light);
          border-radius: var(--border-radius-md);
          padding: 28px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        .home-course-card h3 {
          font-size: 1.25rem;
          color: var(--color-forest);
          margin-top: 8px;
        }
        .home-course-card p {
          font-size: 0.92rem;
          color: var(--color-muted);
          flex-grow: 1;
        }
        .course-link {
          text-decoration: none;
          color: var(--color-gold);
          font-weight: 600;
          font-size: 0.92rem;
          margin-top: 12px;
        }
        .course-link:hover {
          color: var(--color-forest);
        }
        .quote-section {
          background-color: var(--color-forest);
          color: var(--color-light);
          text-align: center;
          padding: 100px 0;
          position: relative;
        }
        .quote-container {
          max-width: 800px;
        }
        .quote-box {
          position: relative;
        }
        .quote-mark {
          font-size: 6rem;
          color: var(--color-gold);
          opacity: 0.25;
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          line-height: 1;
          font-family: Georgia, serif;
        }
        .quote-text {
          font-family: var(--font-title);
          font-size: 1.45rem;
          font-weight: 300;
          line-height: 1.6;
          margin-bottom: 24px;
          font-style: italic;
        }
        .quote-author {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .author-name {
          color: var(--color-gold);
          font-weight: 600;
          font-size: 1.1rem;
        }
        .author-title {
          font-size: 0.85rem;
          opacity: 0.8;
          margin-top: 4px;
        }
        .text-center {
          text-align: center;
        }
        .mt-4 {
          margin-top: 32px;
        }
        .loading-state {
          text-align: center;
          padding: 40px;
          color: var(--color-muted);
        }
        @media (max-width: 768px) {
          .hero-container {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 32px;
          }
          .hero-content {
            margin: 0 auto;
          }
          .hero-actions {
            justify-content: center;
          }
          .hero-title {
            font-size: 2.2rem;
          }
        }

        /* Welcome Section Styling */
        .welcome-section {
          background-color: var(--color-bg);
          padding: 80px 0;
          border-bottom: 1.5px solid rgba(197, 160, 89, 0.1);
        }
        .welcome-container {
          max-width: 800px;
          margin: 0 auto;
        }
        .welcome-card {
          background-color: var(--color-bg-alt);
          border: 2px solid var(--color-gold);
          border-radius: var(--border-radius-lg);
          padding: 48px;
          box-shadow: var(--shadow-md);
          text-align: center;
          position: relative;
        }
        .welcome-card::after {
          content: "";
          position: absolute;
          top: 8px;
          left: 8px;
          right: 8px;
          bottom: 8px;
          border: 1px dashed rgba(197, 160, 89, 0.4);
          border-radius: calc(var(--border-radius-lg) - 6px);
          pointer-events: none;
        }
        .welcome-title {
          font-size: 2rem;
          color: var(--color-forest);
          margin-bottom: 16px;
          font-family: var(--font-title);
        }
        .welcome-greeting {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-gold);
          margin: 20px 0;
          font-family: var(--font-title);
        }
        .welcome-text {
          font-size: 1.05rem;
          line-height: 1.8;
          color: var(--color-dark);
          text-align: justify;
          text-justify: inter-word;
        }
        .welcome-text p {
          margin-bottom: 20px;
        }
        .arabic-callout {
          background-color: rgba(30, 70, 32, 0.05);
          border-left: 4px solid var(--color-forest);
          padding: 16px 24px;
          margin: 24px 0;
          border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .arabic-text {
          font-size: 2rem;
          color: var(--color-forest);
          font-family: 'Outfit', sans-serif;
        }
        .english-translation {
          font-size: 0.95rem;
          color: var(--color-muted);
          font-style: italic;
        }
        .welcome-conclusion {
          text-align: center;
          font-size: 1.1rem;
          color: var(--color-forest);
          margin-top: 24px;
          border-top: 1px solid rgba(197, 160, 89, 0.2);
          padding-top: 20px;
        }
        .floral-divider {
          color: var(--color-gold);
          font-size: 1.1rem;
          margin-bottom: 16px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
