import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  UserPlus,
  AlertCircle,
  User,
  Mail,
  Lock,
  Phone,
  GraduationCap,
  HardHat,
  ShieldCheck,
  Building,
  BadgePercent
} from 'lucide-react';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [employeeCode, setEmployeeCode] = useState('');
  const [assignedZone, setAssignedZone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
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
      const payload = {
        fullName,
        email: normalizedEmail,
        password,
        role,
        phoneNumber: phoneNumber || undefined,
        employeeCode: role === 'STAFF' ? employeeCode : undefined,
        assignedZone: role === 'STAFF' ? assignedZone : undefined
      };

      const user = await register(payload);

      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'STAFF') {
        navigate('/staff/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Network Error: Unable to reach backend server. Please verify the backend server is running on http://localhost:5000.');
      } else {
        setError(err.message || 'Registration failed. Please check form fields.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '540px', marginTop: '2.5rem', marginBottom: '4rem' }}>
      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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
            <UserPlus size={24} />
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
            Create Campus Account
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.86rem', marginTop: '0.25rem' }}>
            Kinathukadavu, Coimbatore &bull; Campus Wastage Monitoring Network
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert-box alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selector Tabs */}
          <div className="form-group">
            <label className="form-label">Select Account Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${role === 'STUDENT' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setRole('STUDENT')}
                style={{ flexDirection: 'column', padding: '0.5rem', gap: '0.2rem' }}
              >
                <GraduationCap size={16} />
                <span>Student</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${role === 'STAFF' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setRole('STAFF')}
                style={{ flexDirection: 'column', padding: '0.5rem', gap: '0.2rem' }}
              >
                <HardHat size={16} />
                <span>Cleaning Crew</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${role === 'ADMIN' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setRole('ADMIN')}
                style={{ flexDirection: 'column', padding: '0.5rem', gap: '0.2rem' }}
              >
                <ShieldCheck size={16} />
                <span>Facilities Admin</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
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

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Campus Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="priya.student@acetcbe.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '2.4rem' }}
              />
              <Mail size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <div className="form-hint">Accepted official domain: @acetcbe.edu.in</div>
          </div>

          {/* Password */}
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

          {/* Phone Number */}
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

          {/* Conditional Fields for Cleaning Staff */}
          {role === 'STAFF' && (
            <div style={{ background: 'var(--slate-50)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Sanitation Crew Profile
              </h4>

              <div className="form-group">
                <label className="form-label" htmlFor="employeeCode">Employee Roster Code</label>
                <input
                  id="employeeCode"
                  type="text"
                  className="input-field"
                  placeholder="e.g. STF-2026-05"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  required={role === 'STAFF'}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="assignedZone">Primary Campus Zone</label>
                <select
                  id="assignedZone"
                  className="select-field"
                  value={assignedZone}
                  onChange={(e) => setAssignedZone(e.target.value)}
                  required={role === 'STAFF'}
                >
                  <option value="">Select Primary Assigned Zone</option>
                  <option value="Academic Area">Academic Area</option>
                  <option value="Central Library">Central Library</option>
                  <option value="Laboratory Area">Laboratory Area</option>
                  <option value="Smart Classroom Area">Smart Classroom Area</option>
                  <option value="Administrative / Office Area">Administrative / Office Area</option>
                  <option value="Conference Hall">Conference Hall</option>
                  <option value="Guest Room & TV Hall">Guest Room & TV Hall</option>
                  <option value="Food Court & Amenity Center">Food Court & Amenity Center</option>
                  <option value="Hostel Area">Hostel Area</option>
                  <option value="Sports Area">Sports Area</option>
                  <option value="Fitness Centre">Fitness Centre</option>
                  <option value="Transport Area">Transport Area</option>
                  <option value="Main Entrance">Main Entrance</option>
                  <option value="Campus Internal Area">Campus Internal Area</option>
                  <option value="Green Campus Area">Green Campus Area</option>
                  <option value="Student Activity Area">Student Activity Area</option>
                  <option value="Waste Collection Area">Waste Collection Area</option>
                  <option value="Other Campus Area">Other Campus Area</option>
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
