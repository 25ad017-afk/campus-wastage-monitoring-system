import React, { useState, useEffect } from 'react';
import { demoService } from '../../services/demoService';
import {
  Sparkles,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Database,
  Users,
  HardHat,
  FileText,
  MapPin,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

const DemoModeModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await demoService.getStatus();
      if (res.data) {
        setStatus(res.data);
      }
    } catch (e) {
      console.warn('Could not fetch demo status:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSeed = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await demoService.seed();
      setMessage('✅ Realistic Demo Data loaded successfully! Refresh or navigate to view live incidents.');
      await fetchStatus();
    } catch (e) {
      setMessage('❌ Failed to seed demo data. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await demoService.reset();
      setMessage('✅ Database successfully reset to clean baseline state.');
      await fetchStatus();
    } catch (e) {
      setMessage('❌ Failed to reset database.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const demoAccounts = [
    { role: 'Administrator', name: 'Chief Administrator', email: 'admin@acetcbe.edu.in', pass: 'Admin@123', desc: 'Full GIS Map, Staff Dispatch & Analytics' },
    { role: 'Student (CSE)', name: 'Priya Sharma', email: 'priya.student@acetcbe.edu.in', pass: 'Student@123', desc: 'File reports with AI Auto-Classification' },
    { role: 'Staff (North Zone)', name: 'Ramesh Kumar', email: 'ramesh.staff@acetcbe.edu.in', pass: 'Staff@123', desc: 'Accept, clean, upload After photo & log weight' },
    { role: 'Staff (Central Zone)', name: 'Sunita Devi', email: 'sunita.staff@acetcbe.edu.in', pass: 'Staff@123', desc: 'Cafeteria & Food Court waste management' }
  ];

  return (
    <div className="modal-overlay" style={{ zIndex: 100000 }}>
      <div className="modal-card animate-fade-in" style={{ maxWidth: '640px', padding: '2rem' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #059669 0%, #0284c7 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--slate-900)' }}>
                Demo &amp; Viva Evaluation Mode
              </h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                Akshaya College of Engineering and Technology, Kinathukadavu, Coimbatore &bull; Project Guide Presentation
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            style={{ padding: '0.35rem' }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Database Engine & Status */}
        <div
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-muted)' }}>
              Database Status &bull; {status?.mode || 'Checking...'}
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.15rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                background: status?.isDemoLoaded ? '#dcfce7' : '#fef3c7',
                color: status?.isDemoLoaded ? '#15803d' : '#b45309'
              }}
            >
              {status?.isDemoLoaded ? 'DEMO DATA ACTIVE' : 'BASELINE / CUSTOM'}
            </span>
          </div>

          <div className="grid-4" style={{ gap: '0.5rem', textAlign: 'center' }}>
            <div style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: '1.15rem', color: 'var(--primary-dark)', display: 'block' }}>{status?.reportsCount ?? '-'}</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>Waste Incidents</span>
            </div>
            <div style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: '1.15rem', color: '#0284c7', display: 'block' }}>{status?.studentsCount ?? '-'}</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>Students</span>
            </div>
            <div style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: '1.15rem', color: '#d97706', display: 'block' }}>{status?.staffCount ?? '-'}</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>Cleaning Staff</span>
            </div>
            <div style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: '1.15rem', color: '#16a34a', display: 'block' }}>10</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>GPS Sites</span>
            </div>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`alert-box ${message.startsWith('✅') ? 'alert-success' : 'alert-error'}`}
            style={{ marginBottom: '1.25rem', fontSize: '0.85rem', padding: '0.75rem 1rem' }}
          >
            {message}
          </div>
        )}

        {/* Seeding & Reset Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleSeed}
            disabled={loading}
            className="btn btn-primary"
            style={{ flex: 2, minWidth: '220px', justifyContent: 'center' }}
          >
            <Sparkles size={16} />
            {loading ? 'Populating Data...' : 'Load Realistic Demo Data'}
          </button>

          <button
            onClick={handleReset}
            disabled={loading}
            className="btn btn-secondary"
            style={{ flex: 1, minWidth: '150px', justifyContent: 'center', color: '#ef4444' }}
          >
            <Trash2 size={16} />
            Reset Baseline
          </button>
        </div>

        {/* Demonstration Accounts Quick Reference */}
        <div>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.6rem' }}>
            Quick Credentials for Evaluators &amp; Guides:
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {demoAccounts.map((acc, idx) => (
              <div
                key={acc.email}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--bg-subtle)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.82rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <strong style={{ color: 'var(--slate-800)' }}>{acc.name}</strong>
                    <span style={{ fontSize: '0.68rem', background: '#e2e8f0', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                      {acc.role}
                    </span>
                  </div>
                  <div style={{ color: 'var(--slate-500)', fontSize: '0.75rem', marginTop: '2px' }}>
                    {acc.email} &bull; Password: <code>{acc.pass}</code>
                  </div>
                  <div style={{ color: 'var(--primary-dark)', fontSize: '0.72rem', fontStyle: 'italic' }}>
                    {acc.desc}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(`${acc.email} / ${acc.pass}`, idx)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                >
                  {copiedIndex === idx ? <Check size={12} color="var(--primary)" /> : <Copy size={12} />}
                  {copiedIndex === idx ? 'Copied' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CLI Note */}
        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--slate-500)' }}>
          Terminal command: <code>npm run demo:seed</code> or <code>npm run demo:reset</code> in <code>server/</code>
        </div>
      </div>
    </div>
  );
};

export default DemoModeModal;
