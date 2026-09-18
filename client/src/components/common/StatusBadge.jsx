import React from 'react';

const StatusBadge = ({ status, size = 'sm' }) => {
  const normalized = status?.toUpperCase() || 'REPORTED';

  const getBadgeClass = (st) => {
    switch (st) {
      case 'REPORTED':
        return 'badge-reported';
      case 'ASSIGNED':
      case 'ACKNOWLEDGED':
        return 'badge-assigned';
      case 'IN_PROGRESS':
        return 'badge-progress';
      case 'RESOLVED':
      case 'COMPLETED':
        return 'badge-resolved';
      case 'REJECTED':
        return 'badge-rejected';
      default:
        return 'badge-reported';
    }
  };

  const formatText = (st) => {
    if (!st) return 'UNKNOWN';
    if (st === 'IN_PROGRESS') return 'IN PROGRESS';
    return st.replace(/_/g, ' ');
  };

  return (
    <span
      className={`badge ${getBadgeClass(normalized)}`}
      style={{
        fontSize: size === 'sm' ? '0.72rem' : '0.8rem',
        padding: size === 'sm' ? '0.2rem 0.6rem' : '0.3rem 0.8rem'
      }}
    >
      <span className="badge-dot" />
      {formatText(normalized)}
    </span>
  );
};

export default StatusBadge;
