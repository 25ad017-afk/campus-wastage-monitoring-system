import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LogIn,
  AlertCircle,
  Sparkles,
  Mail,
  Lock,
  GraduationCap,
  HardHat,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import DemoModeModal from '../../components/common/DemoModeModal';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend domain restriction check (case-insensitive)
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith('@acetcbe.edu.in')) {
      setError('Please use your official ACET college email address.');
      return;
    }

    setLoading(true);

    try {
      const user = await login(normalizedEmail, password);
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

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '480px', marginTop: '3rem', marginBottom: '4rem' }}>
      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <LogIn size={24} />
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
              marginBottom: '0.6rem'
            }}
          >
            🏛️ AKSHAYA COLLEGE OF ENGINEERING AND TECHNOLOGY
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.2rem' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.86rem', marginTop: '0.25rem' }}>
            Kinathukadavu, Coimbatore &bull; Campus Portal Sign In
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert-box alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Campus Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="e.g. priya.student@acetcbe.edu.in"
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
            <div className="form-hint">Accepted official domain: @acetcbe.edu.in</div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
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
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Validating Credentials...' : 'Sign In to Campus Console'}
          </button>
        </form>

        {/* Evaluator / Viva Demonstration Quick Fill */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--slate-600)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
            <Sparkles size={14} color="var(--primary-600)" />
            <span>Viva Evaluator Quick-Access:</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('priya.student@acetcbe.edu.in', 'Student@123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.72rem', padding: '0.35rem 0.2rem', flexDirection: 'column', gap: '0.2rem' }}
              title="Student (Priya - CSE)"
            >
              <GraduationCap size={15} color="var(--primary-600)" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('ramesh.staff@acetcbe.edu.in', 'Staff@123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.72rem', padding: '0.35rem 0.2rem', flexDirection: 'column', gap: '0.2rem' }}
              title="Cleaning Crew (North Zone)"
            >
              <HardHat size={15} color="#d97706" />
              <span>Staff (North)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('sunita.staff@acetcbe.edu.in', 'Staff@123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.72rem', padding: '0.35rem 0.2rem', flexDirection: 'column', gap: '0.2rem' }}
              title="Cleaning Crew (Central Zone)"
            >
              <HardHat size={15} color="#0284c7" />
              <span>Staff (Central)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('admin@acetcbe.edu.in', 'Admin@123')}
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
              🎓 Open Demo Mode Controls (Load / Reset Data)
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--slate-500)' }}>
          New student on campus?{' '}
          <Link to="/register" style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
            Create Student Account
          </Link>
        </div>
      </div>

      {/* Demo Mode Modal Dialog */}
      <DemoModeModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </div>
  );
};

export default LoginPage;
