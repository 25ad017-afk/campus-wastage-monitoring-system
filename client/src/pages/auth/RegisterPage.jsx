import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
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
  Send,
  KeyRound,
  RefreshCw,
  Check,
  Sparkles,
  Info,
  Radio
} from 'lucide-react';
import GoogleAuthConfirmModal from '../../components/common/GoogleAuthConfirmModal';

const RegisterPage = () => {
  const [role, setRole] = useState('STUDENT');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [assignedZone, setAssignedZone] = useState('');

  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  // Load backend email service status & demo auth mode
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

  const isDemoAuth =
    emailStatus?.demoAuthMode !== undefined
      ? emailStatus.demoAuthMode
      : (import.meta.env.VITE_DEMO_AUTH_MODE !== 'false');

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = async () => {
    setError('');
    setStatusMessage(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Please enter your college email address first.');
      return;
    }
    if (!normalizedEmail.endsWith('@acetcbe.edu.in')) {
      setError('Please use your official ACET college email address (@acetcbe.edu.in).');
      return;
    }
    setSendingOtp(true);
    try {
      const res = await authService.sendOtp(normalizedEmail, role);
      setIsOtpSent(true);
      setCooldown(res.data?.cooldownSeconds || 60);
      setStatusMessage({
        type: 'success',
        text: res.message || 'Verification code sent successfully to your official college email.'
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send verification code.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    setStatusMessage(null);
    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setVerifyingOtp(true);
    try {
      await authService.verifyOtp(email.trim().toLowerCase(), otp.trim(), role);
      setIsOtpVerified(true);
      setStatusMessage({ type: 'success', text: 'Email verified successfully! You can now submit registration.' });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid verification code.');
    } finally {
      setVerifyingOtp(false);
    }
  };

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

    if (isDemoAuth) {
      setConfirmModalOpen(true);
      return;
    }

    if (!otp || otp.trim().length !== 6) {
      if (!isOtpSent) {
        setError('Mandatory OTP Verification: Please click "Send Code" to receive your 6-digit verification code on your college email.');
      } else {
        setError('Mandatory OTP Verification: Please enter the 6-digit verification code sent to your official college email.');
      }
      return;
    }

    executeRegister(normalizedEmail, otp.trim());
  };

  const executeRegister = async (normalizedEmail, registerOtp = '') => {
    setLoading(true);
    setError('');
    try {
      const userData = {
        fullName: fullName.trim(),
        email: normalizedEmail,
        password,
        role,
        phoneNumber: phoneNumber || null,
        employeeCode: role === 'STAFF' ? employeeCode : undefined,
        assignedZone: role === 'STAFF' ? assignedZone : undefined,
        otp: registerOtp
      };
      const user = await register(userData);
      setConfirmModalOpen(false);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'STAFF') {
        navigate('/staff/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setConfirmModalOpen(false);
      setError(err.response?.data?.message || err.message || 'Registration failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirmation = () => {
    setConfirmModalOpen(false);
    setStatusMessage({
      type: 'info',
      text: 'Registration cancelled. Account has not been created.'
    });
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

          {/* Mode Indicator Badge */}
          <div style={{ marginTop: '0.6rem' }}>
            {isDemoAuth ? (
              <span
                style={{
                  fontSize: '0.72rem',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1e40af',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Sparkles size={12} color="#2563eb" /> DEMO AUTH MODE ACTIVE (Email OTP Bypassed)
              </span>
            ) : (
              <span
                style={{
                  fontSize: '0.70rem',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#065f46',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Radio size={11} color="#059669" /> SMTP Real Email Active
              </span>
            )}
          </div>
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
            {statusMessage.type === 'info' ? (
              <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

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
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  id="email"
                  type="email"
                  className="input-field"
                  placeholder="e.g. priya.student@acetcbe.edu.in"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setIsOtpVerified(false);
                  }}
                  required
                  style={{ paddingLeft: '2.4rem' }}
                />
                <Mail size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>

              {!isDemoAuth && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || cooldown > 0}
                  className="btn btn-secondary btn-sm"
                  style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', padding: '0 0.85rem' }}
                >
                  {sendingOtp ? <RefreshCw size={13} className="animate-spin" /> : cooldown > 0 ? ('Resend (' + cooldown + 's)') : <><Send size={13} /> Send Code</>}
                </button>
              )}
            </div>
            <div className="form-hint">Accepted official domain: @acetcbe.edu.in</div>
          </div>

          {!isDemoAuth && isOtpSent && (
            <div style={{ background: 'var(--slate-50)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ margin: 0, fontSize: '0.82rem' }}>6-Digit Verification Code</label>
                {isOtpVerified && <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}><Check size={14} /> Verified</span>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    maxLength={6}
                    className="input-field"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    style={{ paddingLeft: '2.4rem', letterSpacing: '0.2em', fontFamily: 'monospace', fontWeight: 700 }}
                  />
                  <KeyRound size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp || isOtpVerified || otp.length !== 6}
                  className="btn btn-primary btn-sm"
                  style={{ whiteSpace: 'nowrap', fontSize: '0.78rem' }}
                >
                  {verifyingOtp ? 'Verifying...' : isOtpVerified ? 'Verified' : 'Verify Code'}
                </button>
              </div>
            </div>
          )}

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

      {/* Google-Style Confirmation Dialog for Demo Mode Registration */}
      <GoogleAuthConfirmModal
        isOpen={confirmModalOpen}
        email={email.trim().toLowerCase()}
        role={role}
        fullName={fullName.trim()}
        loading={loading}
        actionType="register"
        onConfirm={() => executeRegister(email.trim().toLowerCase(), '')}
        onCancel={handleCancelConfirmation}
      />
    </div>
  );
};

export default RegisterPage;