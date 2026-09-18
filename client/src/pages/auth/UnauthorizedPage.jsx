import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const UnauthorizedPage = () => {
  const { user, role } = useAuth();

  const getHomePath = () => {
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'STAFF' || role === 'CLEANING_STAFF') return '/staff/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="container animate-fade-in" style={{ textAlign: 'center', padding: '5rem 1rem', maxWidth: '560px' }}>
      <div
        style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'var(--status-rejected-bg)',
          color: 'var(--status-rejected-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}
      >
        <ShieldAlert size={36} />
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>403 - Access Denied</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
        You do not have permission to view this page. Your account is logged in as{' '}
        <strong style={{ color: 'var(--text-main)' }}>{user?.fullName || 'User'} ({role || 'Guest'})</strong>, which is not authorized for this restricted area.
      </p>

      <Link to={getHomePath()} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
        <ArrowLeft size={18} /> Return to Your Authorized Dashboard
      </Link>
    </div>
  );
};

export default UnauthorizedPage;
