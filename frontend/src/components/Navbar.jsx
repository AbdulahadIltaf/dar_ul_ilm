import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        <Link to="/" className="logo-section">
          <div className="logo-icon">🕌</div>
          <div className="logo-text-group">
            <span className="logo-title">DAR-UL-ILM</span>
            <span className="logo-subtitle">LILBANAAT • طلب العلم نور</span>
          </div>
        </Link>
        
        <nav className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/courses" className="nav-link">Courses</Link>
          <Link to="/teachers" className="nav-link">Teachers</Link>
          
          {token ? (
            <>
              {role === 'admin' ? (
                <Link to="/admin" className="btn btn-gold btn-sm">Admin Panel</Link>
              ) : (
                <Link to="/dashboard" className="btn btn-gold btn-sm">Portal Dashboard</Link>
              )}
              <span className="welcome-name">Hi, {name?.split(' ')[0]}</span>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Student Portal</Link>
          )}
        </nav>
      </div>
      
      <style>{`
        .navbar-header {
          background-color: var(--color-bg);
          border-bottom: 1.5px solid rgba(197, 160, 89, 0.2);
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 14px 0;
          box-shadow: var(--shadow-sm);
        }
        .navbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo-section {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        .logo-icon {
          font-size: 2rem;
        }
        .logo-text-group {
          display: flex;
          flex-direction: column;
        }
        .logo-title {
          font-family: var(--font-title);
          font-weight: 800;
          font-size: 1.4rem;
          color: var(--color-forest);
          letter-spacing: 1px;
        }
        .logo-subtitle {
          font-size: 0.72rem;
          font-weight: 500;
          color: var(--color-gold);
          letter-spacing: 0.5px;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .nav-link {
          text-decoration: none;
          color: var(--color-forest);
          font-weight: 500;
          font-size: 0.95rem;
          transition: var(--transition-fast);
          padding: 6px 0;
          position: relative;
        }
        .nav-link:hover {
          color: var(--color-gold);
        }
        .nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: 0;
          left: 0;
          background-color: var(--color-gold);
          transition: var(--transition-fast);
        }
        .nav-link:hover::after {
          width: 100%;
        }
        .welcome-name {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--color-muted);
        }
        @media (max-width: 768px) {
          .navbar-container {
            flex-direction: column;
            gap: 16px;
          }
          .nav-links {
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
            gap: 16px;
          }
        }
      `}</style>
    </header>
  );
}
