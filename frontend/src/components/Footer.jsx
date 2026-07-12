import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h3>Madarsa Dar-Ul-Ilm Lilbanaat</h3>
          <p className="quran-quote">
            "Prophet Muhammad (ﷺ) said: 'Seeking knowledge is a duty upon every Muslim.'" (Sunan Ibn Majah)
          </p>
          <div className="floral-divider">❦ ════ • 💮 • ════ ❦</div>
        </div>
        
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home Page</Link></li>
            <li><Link to="/courses">Our Courses</Link></li>
            <li><Link to="/teachers">Our Teachers</Link></li>
            <li><Link to="/login">Student Portal</Link></li>
          </ul>
        </div>
        
        <div className="footer-contact">
          <h4>Contact Numbers</h4>
          <p>📞 <a href="tel:03180031244" style={{ color: 'inherit', textDecoration: 'none' }}>0318 0031244</a></p>
          <p>📞 <a href="tel:03112872640" style={{ color: 'inherit', textDecoration: 'none' }}>0311 2872640</a></p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Madarsa Dar-Ul-Ilm Lilbanaat. All rights reserved.</p>
      </div>

      <style>{`
        .footer {
          background-color: var(--color-forest);
          color: var(--color-light);
          padding: 60px 0 20px 0;
          margin-top: auto;
          border-top: 4px solid var(--color-gold);
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1.5fr;
          gap: 40px;
          margin-bottom: 40px;
        }
        .footer-brand h3 {
          color: var(--color-gold);
          font-size: 1.5rem;
          margin-bottom: 16px;
        }
        .quran-quote {
          font-style: italic;
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.95rem;
          margin-bottom: 16px;
          line-height: 1.5;
        }
        .floral-divider {
          color: var(--color-gold);
          font-size: 0.9rem;
        }
        .footer-links h4, .footer-contact h4 {
          color: var(--color-gold);
          font-size: 1.15rem;
          margin-bottom: 16px;
          font-family: var(--font-title);
          font-weight: 600;
        }
        .footer-links ul {
          list-style: none;
        }
        .footer-links li {
          margin-bottom: 10px;
        }
        .footer-links a {
          color: rgba(255, 255, 255, 0.85);
          text-decoration: none;
          transition: var(--transition-fast);
          font-size: 0.95rem;
        }
        .footer-links a:hover {
          color: var(--color-gold);
          padding-left: 4px;
        }
        .footer-contact p {
          margin-bottom: 12px;
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.95rem;
        }
        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 20px;
          text-align: center;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 30px;
            text-align: center;
          }
          .footer-brand, .footer-links, .footer-contact {
            align-items: center;
          }
        }
      `}</style>
    </footer>
  );
}
