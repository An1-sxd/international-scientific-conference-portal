import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background decoration */}
      <div className="login-bg">
        <div className="login-bg__orb login-bg__orb--1" />
        <div className="login-bg__orb login-bg__orb--2" />
        <div className="login-bg__orb login-bg__orb--3" />
      </div>

      <div className="login-card fade-in">
        {/* Brand header */}
        <div className="login-card__header">
          <div className="login-card__brand-icon">B1</div>
          <h1 className="login-card__title">Blida1 Portal</h1>
          <p className="login-card__subtitle">Admin Dashboard</p>
        </div>

        {/* Form */}
        <form className="login-card__form" onSubmit={handleSubmit}>
          <h2 className="login-card__welcome">Welcome back</h2>
          <p className="login-card__desc">Sign in to your admin account</p>

          {error && (
            <div className="login-card__error">
              <AlertTriangle size={16} strokeWidth={2} /> {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              placeholder="admin@university.dz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="login-card__pw-wrap">
              <input
                id="login-password"
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-card__pw-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary login-card__submit"
            disabled={submitting}
          >
            {submitting ? (
              <span className="login-card__spinner" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="login-card__footer">
          <p>International Scientific Conference Portal</p>
        </div>
      </div>
    </div>
  );
}
