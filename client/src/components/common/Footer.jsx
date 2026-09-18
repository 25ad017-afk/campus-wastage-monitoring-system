import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, PhoneCall, MapPin, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          {/* Col 1: Institutional Identity */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ffffff', fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.75rem' }}>
              <Sparkles size={18} color="var(--primary-400)" />
              <span>CWMS Campus Platform</span>
            </div>
            <p style={{ color: 'var(--slate-400)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Department of Environmental Engineering &amp; Estate Management. An automated real-time IoT &amp; image verification platform maintaining zero-litter benchmarks across all academic, hostel, and dining zones.
            </p>
            <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--primary-300)', fontSize: '0.82rem', fontWeight: 600, background: 'rgba(255, 255, 255, 0.05)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-md)' }}>
              <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--primary-400)' }} />
              <div>
                <div style={{ color: '#ffffff', fontWeight: 700 }}>AKSHAYA COLLEGE OF ENGINEERING AND TECHNOLOGY</div>
                <div style={{ color: 'var(--slate-400)', fontWeight: 400, fontSize: '0.78rem' }}>Kinathukadavu, Coimbatore</div>
              </div>
            </div>
          </div>

          {/* Col 2: Operational Zones */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.85rem' }}>
              Monitored Campus Zones
            </h4>
            <ul style={{ listStyle: 'none', color: 'var(--slate-400)', fontSize: '0.84rem', lineHeight: 2 }}>
              <li>📍 Academic Area &amp; Central Library</li>
              <li>📍 Laboratory &amp; Smart Classroom Area</li>
              <li>📍 Food Court &amp; Amenity Center</li>
              <li>📍 Hostel &amp; Sports Complex</li>
            </ul>
          </div>

          {/* Col 3: Campus Control Desk & Helpline */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.85rem' }}>
              Campus Control Desk
            </h4>
            <div style={{ color: 'var(--slate-300)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Akshaya College of Engineering and Technology
            </div>
            <p style={{ color: 'var(--slate-400)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
              For urgent waste cleanup, hazardous containment &amp; facilities dispatch:
            </p>
            <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ffffff', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <PhoneCall size={15} color="var(--primary-400)" />
                <span>Campus Control Desk</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', fontSize: '0.84rem' }}>
                <a href="tel:04259242570" style={{ color: 'var(--primary-300)', textDecoration: 'none', fontWeight: 700 }}>
                  04259-242570
                </a>
                <span style={{ color: 'var(--slate-400)' }}>to</span>
                <a href="tel:04259242574" style={{ color: 'var(--primary-300)', textDecoration: 'none', fontWeight: 700 }}>
                  04259-242574
                </a>
              </div>
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-400)', fontSize: '0.8rem', fontWeight: 600 }}>
              <ShieldCheck size={16} /> ISO 14001 Green Campus Certified
            </div>
          </div>
        </div>

        {/* Footer Bottom Strip */}
        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} Campus Wastage Monitoring System (CWMS) &bull; Akshaya College of Engineering and Technology, Kinathukadavu, Coimbatore.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <span>Architecture: React 18 &bull; Express REST &bull; Leaflet GIS &bull; MySQL</span>
            <span>Version: v2.4.0 (Production Build)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
