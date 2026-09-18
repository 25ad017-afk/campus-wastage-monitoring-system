import React from 'react';
import { Link } from 'react-router-dom';
import CampusMap from '../../components/admin/CampusMap';
import { MapPin, ArrowLeft, Shield, Layers, HardHat } from 'lucide-react';

const CampusMapPage = () => {
  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem', marginBottom: '4rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <Link
            to="/admin/dashboard"
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
            <ArrowLeft size={16} /> Back to Command Center
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={26} color="var(--primary)" />
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Campus Waste Location Map</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Real-time geospatial visualization of campus waste incidents, active hotspots, and resolution status.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/admin/reports" className="btn btn-secondary btn-sm">
            All Incidents Registry
          </Link>
          <Link to="/admin/staff" className="btn btn-secondary btn-sm">
            <HardHat size={16} /> Staff Roster
          </Link>
        </div>
      </div>

      {/* Main Campus Map Component */}
      <CampusMap embedded={false} />
    </div>
  );
};

export default CampusMapPage;
