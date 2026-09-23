import React, { useState } from 'react';
import { adminService } from '../../services/adminService';
import {
  X,
  Mail,
  Lock,
  Server,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ExternalLink,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';

const SmtpSettingsModal = ({ isOpen, onClose, currentStatus, onConfigSaved }) => {
  const [emailHost, setEmailHost] = useState(currentStatus?.host || 'smtp.gmail.com');
  const [emailPort, setEmailPort] = useState(currentStatus?.port ? String(currentStatus.port) : '587');
  const [emailUser, setEmailUser] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailFrom, setEmailFrom] = useState('');
  const [emailSecure, setEmailSecure] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!emailUser.trim()) {
      setError('Please enter the Sender Email Address.');
      return;
    }

    if (!emailPassword.trim()) {
      setError('Please enter the Gmail App Password (16 characters).');
      return;
    }

    setSaving(true);
    try {
      const res = await adminService.updateSmtpConfig({
        emailHost: emailHost.trim(),
        emailPort: emailPort.trim(),
        emailUser: emailUser.trim(),
        emailPassword: emailPassword.trim(),
        emailFrom: emailFrom.trim() || emailUser.trim(),
        emailSecure
      });

      // Clear sensitive password from component memory immediately
      setEmailPassword('');
      setSuccess('SMTP credentials updated and live email delivery activated successfully.');

      setTimeout(() => {
        if (onConfigSaved) onConfigSaved(res.data);
        onClose();
      }, 1200);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update SMTP configuration.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
      onClick={onClose}
    >
      <div
        className="card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          margin: 0,
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-color)',
          background: '#ffffff'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
            color: '#ffffff',
            borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Mail size={20} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Secure SMTP Gateway Settings
              </h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#a7f3d0' }}>
                Akshaya College CWMS Live Email Dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '50%'
            }}
            title="Close Dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              style={{
                padding: '0.75rem 1rem',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          <div
            style={{
              background: 'var(--slate-50)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.82rem',
              color: 'var(--slate-700)',
              lineHeight: 1.5
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>
              <ShieldCheck size={16} color="var(--primary)" /> Zero-Storage Frontend Security
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--slate-600)' }}>
              Credentials are encrypted over HTTPS and applied directly to the server environment (<code>server/.env</code>). Passwords are never stored in browser <code>localStorage</code> or returned via API.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Host & Port */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                  SMTP Host Server
                </label>
                <div style={{ position: 'relative' }}>
                  <Server size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--slate-400)' }} />
                  <input
                    type="text"
                    className="form-control"
                    value={emailHost}
                    onChange={(e) => setEmailHost(e.target.value)}
                    placeholder="smtp.gmail.com"
                    style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                  Port
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={emailPort}
                  onChange={(e) => setEmailPort(e.target.value)}
                  placeholder="587"
                  style={{ fontSize: '0.85rem' }}
                  required
                />
              </div>
            </div>

            {/* Sender Email User */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                Sender Email Address (Google Workspace / Gmail)
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--slate-400)' }} />
                <input
                  type="email"
                  className="form-control"
                  value={emailUser}
                  onChange={(e) => setEmailUser(e.target.value)}
                  placeholder="e.g. security@acetcbe.edu.in or college-dept@gmail.com"
                  style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
                  required
                />
              </div>
            </div>

            {/* App Password */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                <span>Google App Password (16 characters)</span>
                <span style={{ fontSize: '0.74rem', color: 'var(--slate-500)', fontWeight: 500 }}>
                  Never use personal login password
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--slate-400)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  placeholder="xxxx xxxx xxxx xxxx"
                  style={{ paddingLeft: '32px', paddingRight: '36px', fontSize: '0.85rem', fontFamily: showPassword ? 'inherit' : 'var(--font-mono)' }}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '8px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--slate-400)',
                    cursor: 'pointer'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div style={{ marginTop: '0.35rem', fontSize: '0.74rem', color: 'var(--slate-500)' }}>
                Generate via Google Account &rarr; Security &rarr; 2-Step Verification &rarr; App Passwords.
              </div>
            </div>

            {/* From Address Display Name */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                From Header (Optional)
              </label>
              <input
                type="text"
                className="form-control"
                value={emailFrom}
                onChange={(e) => setEmailFrom(e.target.value)}
                placeholder="cwms-security@acetcbe.edu.in"
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary btn-sm"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={saving}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {saving ? (
                  <>Saving &amp; Initializing...</>
                ) : (
                  <>
                    <KeyRound size={14} /> Save &amp; Activate SMTP
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SmtpSettingsModal;
