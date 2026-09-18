import React from 'react';

const Loader = ({ message = 'Loading campus data...', fullScreen = false, skeleton = false }) => {
  if (skeleton) {
    return (
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--slate-200)', animation: 'pulse 1.5s infinite' }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: '40%', height: '18px', background: 'var(--slate-200)', borderRadius: '4px', marginBottom: '0.5rem', animation: 'pulse 1.5s infinite' }} />
            <div style={{ width: '60%', height: '14px', background: 'var(--slate-100)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
          </div>
        </div>
        <div style={{ width: '100%', height: '120px', background: 'var(--slate-100)', borderRadius: 'var(--radius-md)', animation: 'pulse 1.5s infinite' }} />
      </div>
    );
  }

  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.85rem', padding: '2rem' }}>
      <div
        style={{
          width: '38px',
          height: '38px',
          border: '3px solid var(--slate-200)',
          borderTopColor: 'var(--primary-600)',
          borderRadius: '50%',
          animation: 'cwmsSpin 0.75s linear infinite'
        }}
      />
      <span style={{ color: 'var(--slate-500)', fontSize: '0.88rem', fontWeight: 600, letterSpacing: '-0.01em' }}>
        {message}
      </span>
      <style>{`
        @keyframes cwmsSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '55vh' }}>
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Loader;
