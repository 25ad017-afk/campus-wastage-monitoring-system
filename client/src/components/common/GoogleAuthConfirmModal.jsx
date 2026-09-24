import React from 'react';
import {
  ShieldCheck,
  User,
  GraduationCap,
  HardHat,
  ArrowRight,
  X,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const GoogleAuthConfirmModal = ({
  isOpen,
  email,
  role = 'STUDENT',
  fullName = '',
  actionType = 'login', // 'login' | 'register'
  loading = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const roleLabel =
    role === 'ADMIN'
      ? 'Campus Administrator'
      : role === 'STAFF'
      ? 'Sanitation Crew / Staff'
      : 'Student Member';

  const roleIcon =
    role === 'ADMIN' ? (
      <ShieldCheck size={18} color="#2563eb" />
    ) : role === 'STAFF' ? (
      <HardHat size={18} color="#d97706" />
    ) : (
      <GraduationCap size={18} color="#059669" />
    );

  const initial = (fullName || email || 'U').charAt(0).toUpperCase();

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(32, 33, 36, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.25), 0 8px 16px -4px rgba(0, 0, 0, 0.1)',
          maxWidth: '440px',
          width: '100%',
          overflow: 'hidden',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Google Sans", sans-serif'
        }}
      >
        {/* Top Header Bar with Google / Security Styling */}
        <div
          style={{
            padding: '1.5rem 1.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f1f5f9'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* Google-style Multi-Color "G" Icon Badge */}
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
                CWMS Security Verification
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Akshaya College Identity Service
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              color: '#94a3b8',
              padding: '0.35rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            title="Cancel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Main Content */}
        <div style={{ padding: '1.75rem 1.75rem 1.25rem' }}>
          {/* Prominent Question */}
          <h2
            style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: '#1a1a1a',
              marginBottom: '0.5rem',
              textAlign: 'center',
              letterSpacing: '-0.02em'
            }}
          >
            Do you want to continue?
          </h2>

          <p
            style={{
              fontSize: '0.85rem',
              color: '#5f6368',
              textAlign: 'center',
              marginBottom: '1.5rem',
              lineHeight: 1.45
            }}
          >
            {actionType === 'register'
              ? 'Create and activate your verified Campus Wastage Monitoring account.'
              : 'Sign in to access your authorized campus portal and dashboard.'}
          </p>

          {/* User Profile Card Chip */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '0.9rem 1.1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem'
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background:
                  role === 'ADMIN'
                    ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                    : role === 'STAFF'
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                    : 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
              }}
            >
              {initial}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {fullName && (
                <div
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#1e293b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {fullName}
                </div>
              )}
              <div
                style={{
                  fontSize: '0.82rem',
                  color: '#475569',
                  fontFamily: 'monospace',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {email}
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  marginTop: '0.2rem',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color:
                    role === 'ADMIN' ? '#1d4ed8' : role === 'STAFF' ? '#b45309' : '#047857'
                }}
              >
                {roleIcon}
                <span>{roleLabel}</span>
              </div>
            </div>
          </div>

          {/* Demo Mode Notice Badge */}
          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '0.65rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem'
            }}
          >
            <Sparkles size={16} color="#2563eb" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: '#1e40af', lineHeight: 1.35, fontWeight: 500 }}>
              <strong>Demo Mode Active:</strong> Email OTP verification is bypassed. Clicking <strong>YES</strong> will securely authenticate and redirect immediately.
            </span>
          </div>

          {/* Action Buttons: YES and NO (Google-style) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem'
            }}
          >
            {/* NO Button */}
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1px solid #dadce0',
                background: '#ffffff',
                color: '#3c4043',
                fontSize: '0.92rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                letterSpacing: '0.02em'
              }}
              onMouseOver={(e) => {
                if (!loading) e.currentTarget.style.background = '#f1f3f4';
              }}
              onMouseOut={(e) => {
                if (!loading) e.currentTarget.style.background = '#ffffff';
              }}
            >
              NO
            </button>

            {/* YES Button */}
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: 'none',
                background: loading ? '#93c5fd' : '#1a73e8',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 6px rgba(26, 115, 232, 0.3)',
                letterSpacing: '0.02em'
              }}
              onMouseOver={(e) => {
                if (!loading) e.currentTarget.style.background = '#1557b0';
              }}
              onMouseOut={(e) => {
                if (!loading) e.currentTarget.style.background = '#1a73e8';
              }}
            >
              {loading ? (
                <>
                  <span
                    className="animate-spin"
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #ffffff',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      display: 'inline-block'
                    }}
                  />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>YES</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer Note */}
        <div
          style={{
            padding: '0.65rem 1.75rem',
            background: '#f8fafc',
            borderTop: '1px solid #f1f5f9',
            textAlign: 'center',
            fontSize: '0.72rem',
            color: '#64748b'
          }}
        >
          Campus Wastage Monitoring &bull; Akshaya College
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthConfirmModal;
