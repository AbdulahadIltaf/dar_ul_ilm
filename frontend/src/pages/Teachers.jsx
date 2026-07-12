import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/teachers`)
      .then((res) => res.json())
      .then((data) => {
        setTeachers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading teachers:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="teachers-page section">
      <div className="container">
        <h2 className="section-title">Our Ustadhas</h2>
        <p className="section-subtitle">
          Learn from qualified female educators dedicated to teaching the Quran and Sunnah with sincerity and academic depth.
        </p>

        {loading ? (
          <div className="loading-state">Loading teacher profiles...</div>
        ) : (
          <div className="teachers-grid">
            {teachers.map((t) => (
              <div key={t.id} className="card teacher-card">
                <div className="teacher-info">
                  <h3 className="teacher-name">{t.name}</h3>
                  <span className="teacher-qualification">🎓 {t.qualification}</span>
                  <div className="teacher-divider"></div>
                  <p className="teacher-bio">{t.bio}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .teachers-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          max-width: 900px;
          margin: 0 auto;
        }
        .teacher-card {
          border-left: 5px solid var(--color-gold) !important;
        }
        .teacher-info {
          flex-grow: 1;
        }
        .teacher-name {
          font-size: 1.6rem;
          color: var(--color-forest);
          margin-bottom: 6px;
        }
        .teacher-qualification {
          display: inline-block;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-gold);
          margin-bottom: 16px;
        }
        .teacher-divider {
          width: 60px;
          height: 1.5px;
          background-color: var(--color-pink);
          margin-bottom: 16px;
        }
        .teacher-bio {
          font-size: 0.95rem;
          color: var(--color-muted);
          line-height: 1.7;
        }

      `}</style>
    </div>
  );
}
