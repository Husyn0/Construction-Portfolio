// admin-frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { FiArrowRight, FiLayers, FiLock, FiMail, FiShield } from 'react-icons/fi';
import { login } from '../api/contentApi';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', credentials.email);
      const result = await login(credentials.email, credentials.password);
      console.log('Login successful, result:', result);
      
      // Store the user data
      if (result && result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
      }
      
      // Call the onLogin callback
      onLogin(result);
    } catch (err) {
      console.error('Login error in component:', err);
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="admin-login">
      <main className="login-shell">
        <section className="login-story" aria-label="BuildPort portfolio administration">
          <div className="story-grid" aria-hidden="true" />
          <div className="story-content">
            <a className="brand-mark" href="/" aria-label="BuildPort home">
              <span className="brand-icon"><FiLayers aria-hidden="true" /></span>
              <span>BUILDPORT<span className="brand-divider">/</span>STUDIO</span>
            </a>

            <div className="story-copy">
              <span className="story-kicker">YOUR WORK, WELL BUILT</span>
              <h1>Make room for<br />what’s next.</h1>
              <p>One considered space to shape your portfolio, share your projects, and keep your story moving.</p>
            </div>

            <div className="story-note">
              <span className="story-note-mark" aria-hidden="true" />
              <span>Every detail makes a difference.</span>
            </div>
          </div>

          <div className="story-coordinate" aria-hidden="true">01 — 04</div>
        </section>

        <section className="login-panel">
          <div className="login-panel-top">
            <span className="login-panel-label">ADMIN PORTAL</span>
            <span className="secure-label"><FiShield aria-hidden="true" /> Secure access</span>
          </div>

          <div className="login-content">
            <header className="login-header">
              <span className="login-eyebrow">WELCOME BACK</span>
              <h2>Sign in to your<br />workspace.</h2>
              <p>Enter your details to manage your portfolio.</p>
            </header>

            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="login-error" role="alert">
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="login-email">Email address</label>
                <div className="input-wrap">
                  <FiMail className="input-icon" aria-hidden="true" />
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <div className="input-wrap">
                  <FiLock className="input-icon" aria-hidden="true" />
                  <input
                    id="login-password"
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                <span>{loading ? 'Signing in…' : 'Sign in'}</span>
                {!loading && <FiArrowRight aria-hidden="true" />}
              </button>
            </form>

            <div className="login-demo">
              <span className="demo-label">DEMO ACCESS</span>
              <span>admin@buildport.com <span className="demo-separator">/</span> admin123</span>
            </div>

            <footer className="login-footer">
              <span>© {new Date().getFullYear()} BuildPort Studio</span>
              <span>Built to last.</span>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;