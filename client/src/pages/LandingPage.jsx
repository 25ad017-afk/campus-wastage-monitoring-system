import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Camera,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  Cpu,
  BarChart3,
  Layers,
  GraduationCap,
  HardHat,
  Compass,
  Clock,
  Scale,
  PhoneCall,
  Phone
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated, role } = useAuth();

  const getDashboardLink = () => {
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'STAFF') return '/staff/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, var(--slate-900) 0%, var(--slate-800) 100%)',
          color: '#ffffff',
          padding: '4.5rem 0 4rem 0',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle grid background accent */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 0)',
            backgroundSize: '24px 24px',
            pointerEvents: 'none'
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '960px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              padding: '0.45rem 1.2rem',
              borderRadius: 'var(--radius-full)',
              color: 'var(--primary-300)',
              fontWeight: 700,
              fontSize: '0.82rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem'
            }}
          >
            <Sparkles size={16} /> AKSHAYA COLLEGE OF ENGINEERING AND TECHNOLOGY • KINATHUKADAVU, COIMBATORE
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.1rem, 5vw, 3.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              color: '#ffffff'
            }}
          >
            Automated Campus Wastage Monitoring &amp; <span style={{ color: 'var(--primary-400)' }}>Rapid Remediation</span>
          </h1>

          <p
            style={{
              fontSize: '1.12rem',
              color: 'var(--slate-300)',
              marginBottom: '2.5rem',
              lineHeight: 1.65,
              maxWidth: '820px',
              margin: '0 auto 2.5rem auto'
            }}
          >
            An institutional enterprise platform deployed at Akshaya College of Engineering and Technology, Kinathukadavu, Coimbatore, unifying students, sanitation personnel, and facilities administration with geo-located photographic logging, AI-assisted waste sorting, automated dispatching, and verifiable Before/After cleanup proof.
          </p>

          {/* Call to Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <Link to={getDashboardLink()} className="btn btn-primary btn-lg">
                Enter Your Command Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  <GraduationCap size={20} /> Student Portal Registration <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg" style={{ background: 'rgba(255,255,255,0.12)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}>
                  Institutional Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Campus Telemetry & Impact Metric Strip */}
      <section style={{ background: '#ffffff', borderBottom: '1px solid var(--border-color)', padding: '1.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--slate-900)' }}>8 Zones</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>GPS-Monitored Campus Sectors</div>
            </div>
            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary-600)' }}>100%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>Verifiable Photo Proof</div>
            </div>
            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--tech-blue-600)' }}>&lt; 45 Min</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>Average Turnaround SLA</div>
            </div>
            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f59e0b' }}>Zero-Litter</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>Green Campus Target</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Engineering Workflow */}
      <section className="container" style={{ marginTop: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="inst-badge">Operational Architecture</span>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '0.5rem' }}>
            End-to-End Waste Remediation Lifecycle
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem', maxWidth: '620px', margin: '0.35rem auto 0 auto' }}>
            Standard operating procedure implemented in accordance with ISO 14001 campus estate management protocols.
          </p>
        </div>

        <div className="grid-4">
          {/* Step 1 */}
          <div className="card" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--slate-300)', fontWeight: 800, fontSize: '1.2rem' }}>01</div>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Camera size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>1. Capture &amp; Geo-Tag</h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Students spot litter or overflowing bins, snap a photo, pick the landmark building, and log real-time GPS coordinates.
            </p>
          </div>

          {/* Step 2 */}
          <div className="card" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--slate-300)', fontWeight: 800, fontSize: '1.2rem' }}>02</div>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--tech-blue-100)', color: 'var(--tech-blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Cpu size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>2. AI Classification</h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Neural waste classifier analyzes the uploaded photo to identify recyclables, organic matter, e-waste, or chemical hazards.
            </p>
          </div>

          {/* Step 3 */}
          <div className="card" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--slate-300)', fontWeight: 800, fontSize: '1.2rem' }}>03</div>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Compass size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>3. Rapid Crew Dispatch</h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Campus Facilities Command dispatches available zone cleaning crew with priority escalation and routing coordinates.
            </p>
          </div>

          {/* Step 4 */}
          <div className="card" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--slate-300)', fontWeight: 800, fontSize: '1.2rem' }}>04</div>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--status-resolved-bg)', color: 'var(--status-resolved-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <CheckCircle2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>4. Verified Resolution</h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Crew uploads "After" proof photo, logs waste weight in kg, and updates the central campus recycling ledger.
            </p>
          </div>
        </div>
      </section>

      {/* Role-Based Portal Access Directory */}
      <section className="container" style={{ marginTop: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="inst-badge">Institutional Portals</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.5rem' }}>
            Role-Specific Entry Consoles
          </h2>
        </div>

        <div className="grid-3">
          {/* Portal 1: Student */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Student Console</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Undergraduate &amp; Faculty Members</span>
                </div>
              </div>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Submit incident reports with live photo capture, track resolution lifecycle in real-time, and earn green campus badges.
              </p>
            </div>
            <Link to="/login" className="btn btn-outline-primary" style={{ width: '100%' }}>
              Launch Student Portal &rarr;
            </Link>
          </div>

          {/* Portal 2: Cleaning Staff */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HardHat size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Cleaning Crew Terminal</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Sanitation Personnel</span>
                </div>
              </div>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                View assigned tickets sorted by urgency, acknowledge tasks, upload "After" resolution evidence, and record waste weight logs.
              </p>
            </div>
            <Link to="/login" className="btn btn-outline" style={{ width: '100%' }}>
              Launch Crew Terminal &rarr;
            </Link>
          </div>

          {/* Portal 3: Facilities Admin */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'var(--tech-blue-100)', color: 'var(--tech-blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Facilities Command Center</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Estate Deans &amp; Admins</span>
                </div>
              </div>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Access interactive campus GIS heatmaps, dispatch cleaning staff, monitor SLA turnarounds, and audit campus sustainability metrics.
              </p>
            </div>
            <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>
              Launch Command Center &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* About the Project & Institutional Deployment Section */}
      <section className="container" style={{ marginTop: '4rem' }}>
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, var(--slate-900) 0%, var(--slate-800) 100%)',
            color: '#ffffff',
            padding: '2.5rem 2rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.2)', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', color: 'var(--primary-300)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.04em' }}>
                <Sparkles size={14} /> Institutional Deployment
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem', lineHeight: 1.25 }}>
                Akshaya College of Engineering and Technology
              </h2>
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-300)', fontSize: '0.92rem', fontWeight: 600, marginBottom: '1rem' }}>
                <MapPin size={16} /> Kinathukadavu, Coimbatore – 642 109, Tamil Nadu
              </p>
              <p style={{ color: 'var(--slate-300)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                The Campus Wastage Monitoring System (CWMS) is engineered to deliver a digitized, transparent, and eco-friendly solid waste management ecosystem across all academic blocks, laboratories, hostels, dining zones, and athletic grounds of the Akshaya campus.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--slate-400)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Project Initiative</span>
                  <strong style={{ fontSize: '0.88rem', color: '#ffffff' }}>Green Campus &amp; ISO 14001 Sanitation</strong>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--slate-400)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Department</span>
                  <strong style={{ fontSize: '0.88rem', color: '#ffffff' }}>Computer Science &amp; Engineering</strong>
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Campus Infrastructure Coverage
              </h4>
              <ul style={{ listStyle: 'none', color: 'var(--slate-300)', fontSize: '0.84rem', lineHeight: 2, padding: 0 }}>
                <li>🏛️ <strong>Academic Areas:</strong> Classrooms, Smart Classrooms &amp; Laboratories</li>
                <li>📚 <strong>Knowledge Centers:</strong> Central Library &amp; Conference Hall</li>
                <li>🍽️ <strong>Dining &amp; Amenities:</strong> Food Court &amp; Amenity Center</li>
                <li>🏡 <strong>Residential Facilities:</strong> Hostel Area, Guest Room &amp; TV Hall</li>
                <li>⚽ <strong>Recreation &amp; Sports:</strong> Sports Area, Fitness Centre &amp; Green Campus</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Control Desk Section */}
      <section className="container" style={{ marginTop: '3.5rem' }}>
        <div
          className="card"
          style={{
            background: '#ffffff',
            border: '2px solid var(--primary-200)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.25rem 2.5rem',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', maxWidth: '600px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid var(--primary-200)'
              }}
            >
              <PhoneCall size={28} />
            </div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-700)', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                <span>🏛️ Akshaya College of Engineering and Technology</span>
              </div>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--slate-900)', margin: '0 0 0.35rem 0' }}>
                Campus Control Desk
              </h3>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                For urgent waste spillage, biohazard containment, or immediate sanitation crew dispatch across the Kinathukadavu campus, contact the central control desk directly.
              </p>
            </div>
          </div>

          <div style={{ background: 'var(--slate-50)', padding: '1.25rem 1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', textAlign: 'center', minWidth: '300px', flex: '1 1 300px', maxWidth: '420px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
              Official Helpline Numbers
            </span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <a
                href="tel:04259242570"
                className="btn btn-primary"
                style={{ fontSize: '0.92rem', fontWeight: 800, padding: '0.6rem 1rem', textDecoration: 'none' }}
                title="Call 04259-242570"
              >
                <PhoneCall size={16} /> 04259-242570
              </a>
              <span style={{ fontWeight: 700, color: 'var(--slate-400)', fontSize: '0.85rem' }}>to</span>
              <a
                href="tel:04259242574"
                className="btn btn-secondary"
                style={{ fontSize: '0.92rem', fontWeight: 800, padding: '0.6rem 1rem', textDecoration: 'none' }}
                title="Call 04259-242574"
              >
                <PhoneCall size={16} /> 04259-242574
              </a>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'block', marginTop: '0.6rem', fontWeight: 600 }}>
              Direct Lines: 04259-242570 to 04259-242574
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
