import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import {
  LogIn,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Mail,
  Lock,
  GraduationCap,
  HardHat,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  RefreshCw,
  Send,
  Check,
  Building2,
  Info,
  Radio
} from 'lucide-react';
import DemoModeModal from '../../components/common/DemoModeModal';
import GoogleSignInButton from '../../components/common/GoogleSignInButton';

const LoginPage = () => {
  const [activeRole, setActiveRole] = useState('STUDENT'); // 'STUDENT' or 'STAFF'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  // Load backend email service status
  useEffect(() => {
    const fetchEmailStatus = async () => {
      try {
        const res = await authService.getEmailStatus();
        if (res.data) {
          setEmailStatus(res.data);
        }
      } catch (e) {}
    };
    fetchEmailStatus();
  }, []);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Reset form state when switching tabs
  const handleRoleTabChange = (newRole) => {
    setActiveRole(newRole);
    setEmail('');
    setPassword('');
    setError('');
    setStatusMessage(null);
  };

  // Submit Standard Credentials
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Please enter your college email address.');
      return;
    }

    if (!normalizedEmail.endsWith('@acetcbe.edu.in')) {
      setError('Please use your official ACET college email address (@acetcbe.edu.in).');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(normalizedEmail, password, activeRole);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'STAFF') {
        navigate('/staff/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill handler for demo presentations
  const handleQuickFill = (demoEmail, demoPassword, role) => {
    setActiveRole(role === 'ADMIN' ? 'STAFF' : role);
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setStatusMessage({
      type: 'success',
      text: `Loaded credentials for ${demoEmail}. Click "Sign In" to proceed.`
    });
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '520px', marginTop: '2.5rem', marginBottom: '4rem' }}>
      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          {/* College Branding Banner */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              padding: '0.4rem 0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.8rem',
              border: '1px solid var(--border-color)',
              maxWidth: '100%'
            }}
          >
            <img
              src="/assets/images/college_banner.jpeg"
              alt="Akshaya College of Engineering and Technology"
              style={{
                maxHeight: '44px',
                maxWidth: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              color: 'var(--primary-700)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.03em',
              marginBottom: '0.5rem'
            }}
          >
            🏛️ AKSHAYA COLLEGE OF ENGINEERING AND TECHNOLOGY
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem', color: 'var(--slate-900)' }}>
            Campus Portal Sign In
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.82rem', marginTop: '0.15rem' }}>
            Pollachi &bull; Kinathukadavu, Coimbatore &bull; CWMS Security
          </p>
        </div>

        {/* ROLE SELECTION TABS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            background: 'var(--slate-100)',
            padding: '0.35rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem'
          }}
        >
          <button
            type="button"
            onClick={() => handleRoleTabChange('STUDENT')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeRole === 'STUDENT' ? '#ffffff' : 'transparent',
              color: activeRole === 'STUDENT' ? 'var(--primary-700)' : 'var(--slate-600)',
              boxShadow: activeRole === 'STUDENT' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <GraduationCap size={18} />
            <span>Student Login</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabChange('STAFF')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeRole === 'STAFF' ? '#ffffff' : 'transparent',
              color: activeRole === 'STAFF' ? '#d97706' : 'var(--slate-600)',
              boxShadow: activeRole === 'STAFF' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <HardHat size={18} />
            <span>Staff Login</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert-box alert-error" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Status Alert */}
        {statusMessage && (
          <div
            className={`alert-box ${statusMessage.type === 'info' ? 'alert-info' : 'alert-success'}`}
            style={{ marginBottom: '1.25rem' }}
          >
            {statusMessage.type === 'info' ? (
              <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* OFFICIAL GOOGLE SIGN-IN SECTION */}
        <div style={{ marginBottom: '1.5rem' }}>
          <GoogleSignInButton
            role={activeRole}
            onError={(msg) => setError(msg)}
            onSuccess={() => {
              setError('');
              setStatusMessage({ type: 'success', text: 'Google authentication verified successfully.' });
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '1.25rem 0 1rem',
              color: 'var(--slate-400)',
              fontSize: '0.78rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            <span style={{ padding: '0 0.75rem' }}>or sign in with password</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          </div>
        </div>

        {/* Authentication Form (Email + Password) */}
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              {activeRole === 'STUDENT' ? 'Official Student Email Address' : 'Official Staff / Faculty Email Address'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder={activeRole === 'STUDENT' ? 'priya.student@acetcbe.edu.in' : 'ramesh.staff@acetcbe.edu.in'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '2.4rem' }}
              />
              <Mail
                size={16}
                color="var(--slate-400)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
            <div className="form-hint">
              {activeRole === 'STUDENT' 
                ? 'Authorized college student domain: @acetcbe.edu.in' 
                : 'Authorized college staff & faculty domain: @acetcbe.edu.in'}
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Security Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                className="input-field"
                placeholder="Enter your security password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '2.4rem' }}
              />
              <Lock
                size={16}
                color="var(--slate-400)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              marginTop: '0.75rem',
              padding: '0.75rem 1rem',
              fontSize: '0.95rem',
              background: activeRole === 'STAFF' ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : undefined
            }}
            disabled={loading}
          >
            {loading ? (
              'Validating Credentials...'
            ) : (
              <>
                <LogIn size={18} /> Sign In as {activeRole === 'STUDENT' ? 'Student' : 'Staff Member'}
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Fill Buttons for Viva Examination */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px dashed var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--slate-600)', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.65rem', letterSpacing: '0.04em' }}>
            <Sparkles size={14} color="var(--primary-600)" />
            <span>Viva Evaluator Quick-Access:</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('priya.student@acetcbe.edu.in', 'Student@123', 'STUDENT')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.72rem', padding: '0.35rem 0.2rem', flexDirection: 'column', gap: '0.2rem' }}
              title="Student (Priya - CSE)"
            >
              <GraduationCap size={15} color="var(--primary-600)" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('ramesh.staff@acetcbe.edu.in', 'Staff@123', 'STAFF')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.72rem', padding: '0.35rem 0.2rem', flexDirection: 'column', gap: '0.2rem' }}
              title="Cleaning Crew (Academic Area)"
            >
              <HardHat size={15} color="#d97706" />
              <span>Staff (Ramesh)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('sunita.staff@acetcbe.edu.in', 'Staff@123', 'STAFF')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.72rem', padding: '0.35rem 0.2rem', flexDirection: 'column', gap: '0.2rem' }}
              title="Cleaning Crew (Food Court Area)"
            >
              <HardHat size={15} color="#0284c7" />
              <span>Staff (Sunita)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('admin@acetcbe.edu.in', 'Admin@123', 'ADMIN')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.72rem', padding: '0.35rem 0.2rem', flexDirection: 'column', gap: '0.2rem' }}
              title="Chief Administrator"
            >
              <ShieldCheck size={15} color="var(--tech-blue-600)" />
              <span>Admin</span>
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setDemoModalOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-dark)',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                textDecoration: 'underline'
              }}
            >
              ⚙️ Open Demo Mode Controls (Load / Reset Data)
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--slate-500)' }}>
          {activeRole === 'STUDENT' ? (
            <>
              New student on campus?{' '}
              <Link to="/register" style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                Register Student Account
              </Link>
            </>
          ) : (
            <>
              Need staff onboarding credentials? Contact{' '}
              <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>Admin Office</span>
            </>
          )}
        </div>
      </div>

      {/* Demo Mode Modal Dialog */}
      <DemoModeModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </div>
  );
};

export default LoginPage;
