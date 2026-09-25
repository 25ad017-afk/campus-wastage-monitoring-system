import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CampusMap from '../../components/admin/CampusMap';
import { MapPin, ArrowLeft, Shield, Layers, HardHat, FilePlus, Home } from 'lucide-react';

const CampusMapPage = () => {
  const { user, isAuthenticated, role } = useAuth();

  const getBackLink = () => {
    if (!isAuthenticated) return { to: '/', label: 'Back to Homepage' };
    if (role === 'ADMIN') return { to: '/admin/dashboard', label: 'Back to Command Center' };
    if (role === 'STAFF') return { to: '/staff/dashboard', label: 'Back to Staff Dashboard' };
    return { to: '/student/dashboard', label: 'Back to Student Dashboard' };
  };

  const backLink = getBackLink();

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem', marginBottom: '4rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <Link
            to={backLink.to}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              marginBottom: '0.5rem'
            }}
          >
            <ArrowLeft size={16} /> {backLink.label}
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={26} color="var(--primary)" />
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0 }}>ACET Campus Location Map</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.25rem', marginBottom: 0 }}>
            Geospatial blueprint and waste hotspot monitoring across Akshaya College of Engineering and Technology.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/student/report" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <FilePlus size={15} /> Report Incident
          </Link>
          {role === 'ADMIN' && (
            <>
              <Link to="/admin/reports" className="btn btn-secondary btn-sm">
                Incident Registry
              </Link>
              <Link to="/admin/staff" className="btn btn-secondary btn-sm">
                <HardHat size={15} /> Staff
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Main Campus Map Component */}
      <CampusMap embedded={false} />
    </div>
  );
};

export default CampusMapPage;
