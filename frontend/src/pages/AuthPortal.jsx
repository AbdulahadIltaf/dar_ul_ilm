import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API_BASE_URL from '../config';

export default function AuthPortal() {
  const [isLogin, setIsLogin] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Status Alerts
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const url = isLogin 
      ? `${API_BASE_URL}/api/auth/login` 
      : `${API_BASE_URL}/api/auth/register`;
      
    const payload = isLogin 
      ? { email, password } 
      : { name, email, password, phone };

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.detail || "Authentication request failed");
        }
        return data;
      })
      .then((data) => {
        setLoading(false);
        if (isLogin) {
          // Store token and info
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('role', data.role);
          localStorage.setItem('name', data.name);
          localStorage.setItem('is_approved', data.is_approved ? 'true' : 'false');

          if (data.role === 'admin') {
            navigate('/admin');
          } else if (data.is_approved) {
            const redirect = searchParams.get('redirect');
            navigate(redirect === 'courses' ? '/courses' : '/dashboard');
          } else {
            // Logged in but not approved yet
            setError("Your account is registered but pending approval by the administration. You will be granted access to the student portal once approved.");
            // Clear storage since they shouldn't access dashboard yet
            localStorage.clear();
          }
        } else {
          setSuccess("Registration request submitted successfully! To maintain a safe learning sanctuary for sisters, our administrators review and approve all registrations. You will receive access once approved.");
          // Clear inputs
          setName('');
          setEmail('');
          setPassword('');
          setPhone('');
          setIsLogin(true); // Switch to login
        }
      })
      .catch((err) => {
        setLoading(false);
        setError(err.message || "An unexpected error occurred. Please try again.");
      });
  };

  return (
    <div className="auth-page section">
      <div className="container auth-container">
        <div className="auth-box card">
          <div className="auth-header">
            <h3>🕌 Student Portal</h3>
            <p>{isLogin ? 'Log in to access your classes and materials' : 'Register a simple account to enroll in courses'}</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  placeholder="e.g. Ayesha Ahmed"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="e.g. ayesha@gmail.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="e.g. 0300-1234567"
                />
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary btn-full btn-auth">
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Submit Registration'}
            </button>
          </form>

          <div className="auth-toggle">
            {isLogin ? (
              <p>New student? <button onClick={toggleMode} className="toggle-btn">Create an account</button></p>
            ) : (
              <p>Already have an account? <button onClick={toggleMode} className="toggle-btn">Login here</button></p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
        }
        .auth-box {
          width: 100%;
          max-width: 480px;
          border-top: 4px solid var(--color-forest) !important;
        }
        .auth-header {
          text-align: center;
          margin-bottom: 28px;
        }
        .auth-header h3 {
          font-size: 1.8rem;
          color: var(--color-forest);
          margin-bottom: 8px;
        }
        .auth-header p {
          color: var(--color-muted);
          font-size: 0.92rem;
        }
        .btn-auth {
          margin-top: 8px;
          height: 48px;
        }
        .auth-toggle {
          text-align: center;
          margin-top: 24px;
          font-size: 0.9rem;
          color: var(--color-muted);
        }
        .toggle-btn {
          background: none;
          border: none;
          color: var(--color-gold);
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          text-decoration: underline;
          padding: 0;
          margin-left: 4px;
        }
        .toggle-btn:hover {
          color: var(--color-forest);
        }
      `}</style>
    </div>
  );
}
