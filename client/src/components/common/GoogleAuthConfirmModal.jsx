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
        {/* Top Header Bar with CWMS / ACET Security Styling */}
        <div
          style={{
            padding: '1.25rem 1.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f1f5f9',
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* CWMS / ACET Official Security Badge */}
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #059669 0%, #0284c7 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(5, 150, 105, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <ShieldCheck size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                CWMS Security Verification
              </div>
              <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, letterSpacing: '0.02em' }}>
                🏛️ Akshaya College (ACET)
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
