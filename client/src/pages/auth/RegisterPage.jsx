import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
  Lock,
  Phone,
  GraduationCap,
  HardHat,
  ShieldCheck,
  Building2,
  Sparkles,
  Info
} from 'lucide-react';
import GoogleSignInButton from '../../components/common/GoogleSignInButton';

const RegisterPage = () => {
  const [role, setRole] = useState('STUDENT');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [assignedZone, setAssignedZone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!fullName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!normalizedEmail.endsWith('@acetcbe.edu.in')) {
      setError('Please use your official ACET college email address (@acetcbe.edu.in).');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        fullName: fullName.trim(),
        email: normalizedEmail,
        password,
        role,
        phoneNumber: phoneNumber || null,
        employeeCode: role === 'STAFF' ? employeeCode : undefined,
        assignedZone: role === 'STAFF' ? assignedZone : undefined
      };
      const user = await register(userData);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'STAFF') {
        navigate('/staff/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '520px', marginTop: '2.5rem', marginBottom: '4rem' }}>
      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              padding: '0.4rem 0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.8rem',
              border: '1px solid var(--border-color)'
            }}
          >
            <img
              src="/assets/images/college_banner.jpeg"
              alt="Akshaya College of Engineering and Technology"
              style={{ maxHeight: '44px', maxWidth: '100%', objectFit: 'contain', display: 'block' }}
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Create College Account
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.82rem', marginTop: '0.15rem' }}>
            Pollachi &bull; CWMS Campus Sanitation &amp; Waste Management
          </p>
        </div>

        {error && (
          <div className="alert-box alert-error" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {statusMessage && (
          <div
            className={`alert-box ${statusMessage.type === 'info' ? 'alert-info' : 'alert-success'}`}
            style={{ marginBottom: '1.25rem' }}
          >
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* OFFICIAL GOOGLE SIGN-IN FOR INSTANT ACET ONBOARDING */}
        <div style={{ marginBottom: '1.5rem' }}>
          <GoogleSignInButton
            role={role}
            onError={(msg) => setError(msg)}
            onSuccess={() => {
              setError('');
              setStatusMessage({ type: 'success', text: 'Google authentication verified.' });
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
            <span style={{ padding: '0 0.75rem' }}>or register with credentials</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Account Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <button
                type="button"
                className={'btn btn-sm ' + (role === 'STUDENT' ? 'btn-primary' : 'btn-secondary')}
                onClick={() => setRole('STUDENT')}
                style={{ flexDirection: 'column', padding: '0.5rem', gap: '0.2rem' }}
              >
                <GraduationCap size={16} />
                <span>Student</span>
              </button>
              <button
                type="button"
                className={'btn btn-sm ' + (role === 'STAFF' ? 'btn-primary' : 'btn-secondary')}
                onClick={() => setRole('STAFF')}
                style={{ flexDirection: 'column', padding: '0.5rem', gap: '0.2rem' }}
              >
                <HardHat size={16} />
                <span>Cleaning Crew</span>
              </button>
              <button
                type="button"
                className={'btn btn-sm ' + (role === 'ADMIN' ? 'btn-primary' : 'btn-secondary')}
                onClick={() => setRole('ADMIN')}
                style={{ flexDirection: 'column', padding: '0.5rem', gap: '0.2rem' }}
              >
                <ShieldCheck size={16} />
                <span>Facilities Admin</span>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="fullName">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                id="fullName"
                type="text"
                className="input-field"
                placeholder="e.g. Priya Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={{ paddingLeft: '2.4rem' }}
              />
              <User size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Official College Email Address</label>
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
              <Mail size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <div className="form-hint">Accepted official domain: @acetcbe.edu.in</div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Security Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                className="input-field"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{ paddingLeft: '2.4rem' }}
              />
              <Lock size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">Contact Mobile Number (Optional)</label>
            <div style={{ position: 'relative' }}>
              <input
                id="phone"
                type="tel"
                className="input-field"
                placeholder="e.g. 9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
              />
              <Phone size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {role === 'STAFF' && (
            <div style={{ background: 'var(--slate-50)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.85rem', textTransform: 'uppercase' }}>
                Sanitation Crew Profile
              </h4>
              <div className="form-group">
                <label className="form-label">Employee Code</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. STF-2026-05"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  required={role === 'STAFF'}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Assigned Campus Zone</label>
                <select
                  className="select-field"
                  value={assignedZone}
                  onChange={(e) => setAssignedZone(e.target.value)}
                  required={role === 'STAFF'}
                >
                  <option value="">Select Primary Assigned Zone</option>
                  <option value="Academic Area">Academic Area</option>
                  <option value="Central Library">Central Library</option>
                  <option value="Food Court & Amenity Center">Food Court & Amenity Center</option>
                  <option value="Hostel Area">Hostel Area</option>
                  <option value="Sports Area">Sports Area</option>
                  <option value="General Campus">General Campus</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--slate-500)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;