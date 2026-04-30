import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../components/theme';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import useFormValidation from '../hooks/useFormValidation';

export default function Login() {
  const { login } = useAuth();
  const { logoSrc } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { touched, errors, touchField, validate, groupClass } = useFormValidation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate({ email, password }, { email: { required: true, email: true }, password: { required: true } })) return;
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
      <ThemeToggle className="login-theme-toggle" />

      {/* Background decoration */}
      <div className="login-bg">
        <div className="login-bg__orb login-bg__orb--1" />
        <div className="login-bg__orb login-bg__orb--2" />
        <div className="login-bg__orb login-bg__orb--3" />
      </div>

      <div className="login-card fade-in">
        {/* Brand header */}
        <div className="login-card__header">
          <img className="login-card__brand-logo" src={logoSrc} alt="" aria-hidden="true" />
          <h1 className="login-card__title">Blida1 Portal</h1>
          <p className="login-card__subtitle">Admin Dashboard</p>
        </div>

        {/* Form */}
        <form className="login-card__form" onSubmit={handleSubmit} noValidate>
          <h2 className="login-card__welcome">Welcome back</h2>
          <p className="login-card__desc">Sign in to your admin account</p>

          {error && (
            <div className="login-card__error">
              <AlertTriangle size={16} strokeWidth={2} /> {error}
            </div>
          )}

          <div className={groupClass('email')}>
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
              onBlur={() => touchField('email', email, { required: true, email: true })}
            />
            {touched.email && errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className={groupClass('password')}>
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
                onBlur={() => touchField('password', password, { required: true })}
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
            {touched.password && errors.password && <span className="form-error">{errors.password}</span>}
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
