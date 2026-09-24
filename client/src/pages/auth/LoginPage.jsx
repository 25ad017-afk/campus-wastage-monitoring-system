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
  Radio,
  Zap
} from 'lucide-react';
import DemoModeModal from '../../components/common/DemoModeModal';
import GoogleAuthConfirmModal from '../../components/common/GoogleAuthConfirmModal';

const LoginPage = () => {
  const [activeRole, setActiveRole] = useState('STUDENT'); // 'STUDENT' or 'STAFF'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
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

  // Determine if Demo Auth Mode is active
  const isDemoAuth =
    emailStatus?.demoAuthMode !== undefined
      ? emailStatus.demoAuthMode
      : (import.meta.env.VITE_DEMO_AUTH_MODE !== 'false');

  const { login } = useAuth();
  const navigate = useNavigate();

  // Cooldown timer countdown (for real OTP mode)
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Reset form state when switching tabs
  const handleRoleTabChange = (newRole) => {
    setActiveRole(newRole);
    setEmail('');
    setPassword('');
    setOtp('');
    setIsOtpSent(false);
    setIsOtpVerified(false);
    setError('');
    setStatusMessage(null);
  };

  // 1. Send Verification Code (OTP) - Real Mode Only
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
      const res = await authService.sendOtp(normalizedEmail, activeRole);
      setIsOtpSent(true);
      setCooldown(res.data?.cooldownSeconds || 60);
      setStatusMessage({
        type: 'success',
        text: res.message || 'Verification code sent successfully to your official college email.'
      });
    } catch (err) {
      const errText = err.response?.data?.message || err.message || 'Failed to send verification code.';
      setError(errText);
    } finally {
      setSendingOtp(false);
    }
  };

  // 2. Verify 6-digit OTP - Real Mode Only
  const handleVerifyOtp = async () => {
    setError('');
    setStatusMessage(null);

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await authService.verifyOtp(email.trim().toLowerCase(), otp.trim(), activeRole);
      setIsOtpVerified(true);
      setStatusMessage({ type: 'success', text: 'Email verified successfully! You may now sign in.' });
    } catch (err) {
      const errText = err.response?.data?.message || err.message || 'Invalid verification code.';
      setError(errText);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // 3. Initiate Sign In - Trigger YES/NO Confirmation in Demo Mode or Submit in Real Mode
  const handleSubmit = (e) => {
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

    // In Demo Mode: trigger the Google-style confirmation dialog ("Do you want to continue?")
    if (isDemoAuth) {
      setConfirmModalOpen(true);
      return;
    }

    // In Real Mode: enforce OTP verification
    if (!otp || otp.trim().length !== 6) {
      if (!isOtpSent) {
        setError('Mandatory OTP Verification: Please click "Send Code" to receive your 6-digit verification code on your college email.');
      } else {
        setError('Mandatory OTP Verification: Please enter the 6-digit verification code sent to your official college email.');
      }
      return;
    }

    executeLogin(normalizedEmail, password, activeRole, otp.trim());
  };

  // 4. Actual Login Execution (Runs when user clicks YES in confirmation dialog or submits verified OTP)
  const executeLogin = async (loginEmail, loginPassword, loginRole, loginOtp = '') => {
    setLoading(true);
    setError('');

    try {
      const user = await login(loginEmail, loginPassword, loginRole, loginOtp);
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
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Cancel Handler for Google Confirmation Dialog (NO button clicked)
  const handleCancelConfirmation = () => {
    setConfirmModalOpen(false);
    setStatusMessage({
      type: 'info',
      text: 'Authentication cancelled. You remain signed out.'
    });
  };

  // Quick fill handler for demo presentations
  const handleQuickFill = (demoEmail, demoPassword, role) => {
    setActiveRole(role === 'ADMIN' ? 'STAFF' : role);
    setEmail(demoEmail);
    setPassword(demoPassword);
    setOtp('');
    setIsOtpSent(false);
    setIsOtpVerified(false);
    setError('');
    setStatusMessage({
      type: 'success',
      text: isDemoAuth
        ? `Loaded credentials for ${demoEmail}. Click "Sign In" to continue.`
        : `Loaded credentials for ${demoEmail}. Click "Send Code" to receive your verification code on your college email.`
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
            ) : emailStatus?.isConfigured ? (
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
                <Radio size={11} color="#059669" /> SMTP Real Email Active ({emailStatus.host})
              </span>
            ) : (
              <span
                style={{
                  fontSize: '0.70rem',
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  color: '#92400e',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '12px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Info size={11} /> Safe Dev Mode (OTP logged to backend terminal)
              </span>
            )}
          </div>
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

        {/* Authentication Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              {activeRole === 'STUDENT' ? 'Official Student Email Address' : 'Official Staff / Faculty Email Address'}
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  id="email"
                  type="email"
                  className="input-field"
                  placeholder={activeRole === 'STUDENT' ? 'priya.student@acetcbe.edu.in' : 'ramesh.staff@acetcbe.edu.in'}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setIsOtpVerified(false);
                  }}
                  required
                  style={{ paddingLeft: '2.4rem' }}
                />
                <Mail
                  size={16}
                  color="var(--slate-400)"
                  style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>

              {/* Send Verification Code Button - SHOWN ONLY IN REAL MODE */}
              {!isDemoAuth && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || cooldown > 0}
                  className="btn btn-secondary btn-sm"
                  style={{
                    whiteSpace: 'nowrap',
                    fontSize: '0.78rem',
                    padding: '0 0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontWeight: 600
                  }}
                >
                  {sendingOtp ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" /> Sending...
                    </>
                  ) : cooldown > 0 ? (
                    <>Resend ({cooldown}s)</>
                  ) : (
                    <>
                      <Send size={13} /> Send Code
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="form-hint">
              {activeRole === 'STUDENT' 
                ? 'Authorized college student domain: @acetcbe.edu.in' 
                : 'Authorized college staff & faculty domain: @acetcbe.edu.in'}
            </div>
          </div>

          {/* OTP Verification Flow Section - SHOWN ONLY IN REAL MODE */}
          {!isDemoAuth && isOtpSent && (
            <div
              style={{
                background: 'var(--slate-50)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0, fontSize: '0.82rem' }} htmlFor="otp">
                  Enter 6-Digit Verification Code
                </label>
                {isOtpVerified && (
                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Check size={14} /> Code Verified
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    className="input-field"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    style={{
                      paddingLeft: '2.4rem',
                      letterSpacing: '0.2em',
                      fontWeight: 700,
                      fontFamily: 'monospace'
                    }}
                  />
                  <KeyRound
                    size={16}
                    color="var(--slate-400)"
                    style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp || isOtpVerified || otp.length !== 6}
                  className="btn btn-primary btn-sm"
                  style={{
                    whiteSpace: 'nowrap',
                    fontSize: '0.78rem',
                    padding: '0 0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  {verifyingOtp ? 'Verifying...' : isOtpVerified ? 'Verified' : 'Verify Code'}
                </button>
              </div>
              <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                Verification code valid for 10 minutes.
              </p>
            </div>
          )}

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

      {/* Google-Style Confirmation Dialog for Demo Mode Authentication */}
      <GoogleAuthConfirmModal
        isOpen={confirmModalOpen}
        email={email.trim().toLowerCase()}
        role={activeRole}
        loading={loading}
        actionType="login"
        onConfirm={() => executeLogin(email.trim().toLowerCase(), password, activeRole, '')}
        onCancel={handleCancelConfirmation}
      />

      {/* Demo Mode Modal Dialog */}
      <DemoModeModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </div>
  );
};

export default LoginPage;
