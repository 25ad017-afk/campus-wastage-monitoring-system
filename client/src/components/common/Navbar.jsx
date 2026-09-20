import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LogOut,
  ShieldCheck,
  HardHat,
  GraduationCap,
  Menu,
  X,
  LayoutDashboard,
  FilePlus,
  Files,
  MapPin,
  BarChart2,
  CheckCircle2,
  Layers,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import DemoModeModal from './DemoModeModal';

const Navbar = () => {
  const { user, isAuthenticated, logout, role } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Extract initials for avatar
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'CW';

  return (
    <header className="navbar">
      {/* Institutional Top Strip */}
      <div className="navbar-top-strip">
        <div className="container navbar-top-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🏛️ AKSHAYA COLLEGE OF ENGINEERING AND TECHNOLOGY • KINATHUKADAVU, COIMBATORE</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => setDemoModalOpen(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.22)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                color: '#ffffff',
                borderRadius: '4px',
                padding: '0.15rem 0.6rem',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                letterSpacing: '0.02em'
              }}
              title="Open Guide / Evaluator Demo Mode Controls"
            >
              🎓 Viva Demo Mode
            </button>
            <a
              href="tel:04259242570"
              style={{
                color: '#ffffff',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.73rem',
                fontWeight: 700,
                letterSpacing: '0.02em'
              }}
              title="Call Campus Control Desk (04259-242570 to 74)"
            >
              <PhoneCall size={13} />
              <span>CONTROL DESK: 04259-242570 to 74</span>
            </a>
          </div>
        </div>
      </div>

      <div className="container navbar-container">
        {/* Institutional Brand Logo with College Branding */}
        <Link to="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none' }}>
          <div
            style={{
              background: '#ffffff',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img
              src="/assets/images/college_banner.jpeg"
              alt="Akshaya College of Engineering and Technology"
              style={{
                height: '38px',
                maxWidth: '170px',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="brand-title" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              ACET Portal
            </span>
            <span className="brand-subtitle" style={{ fontSize: '0.70rem', color: 'var(--slate-500)', fontWeight: 600 }}>
              Akshaya College of Engineering and Technology
            </span>
          </div>
        </Link>

        {/* Mobile Hamburger Toggle */}
        <button
          className="nav-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Navigation Links */}
        <nav>
          <ul className={`nav-links ${mobileOpen ? 'nav-mobile-open' : ''}`}>
            {!isAuthenticated ? (
              <>
                <li>
                  <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                    Home Overview
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="btn btn-secondary btn-sm">
                    Portal Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="btn btn-primary btn-sm">
                    Student Sign Up
                  </Link>
                </li>
              </>
            ) : (
              <>
                {/* Student Navigation */}
                {role === 'STUDENT' && (
                  <>
                    <li>
                      <Link to="/student/dashboard" className={`nav-link ${isActive('/student/dashboard') ? 'active' : ''}`}>
                        <LayoutDashboard size={15} /> Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link to="/student/report" className={`nav-link ${isActive('/student/report') ? 'active' : ''}`}>
                        <FilePlus size={15} /> Report Waste
                      </Link>
                    </li>
                    <li>
                      <Link to="/student/my-reports" className={`nav-link ${isActive('/student/my-reports') ? 'active' : ''}`}>
                        <Files size={15} /> My Reports
                      </Link>
                    </li>
                  </>
                )}

                {/* Admin Navigation */}
                {role === 'ADMIN' && (
                  <>
                    <li>
                      <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}>
                        <LayoutDashboard size={15} /> Command Center
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/map" className={`nav-link ${isActive('/admin/map') ? 'active' : ''}`}>
                        <MapPin size={15} /> Campus Map
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/analytics" className={`nav-link ${isActive('/admin/analytics') ? 'active' : ''}`}>
                        <BarChart2 size={15} /> Analytics
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/reports" className={`nav-link ${isActive('/admin/reports') ? 'active' : ''}`}>
                        <Files size={15} /> Incidents
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/staff" className={`nav-link ${isActive('/admin/staff') ? 'active' : ''}`}>
                        <Layers size={15} /> Staff Roster
                      </Link>
                    </li>
                  </>
                )}

                {/* Cleaning Staff Navigation */}
                {role === 'STAFF' && (
                  <>
                    <li>
                      <Link to="/staff/dashboard" className={`nav-link ${isActive('/staff/dashboard') ? 'active' : ''}`}>
                        <LayoutDashboard size={15} /> Task Queue
                      </Link>
                    </li>
                    <li>
                      <Link to="/staff/history" className={`nav-link ${isActive('/staff/history') ? 'active' : ''}`}>
                        <CheckCircle2 size={15} /> Resolution History
                      </Link>
                    </li>
                  </>
                )}

                {/* Notification Bell */}
                <li>
                  <NotificationBell />
                </li>

                {/* User Profile Pill & Logout */}
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div className="nav-user-pill">
                    <div className="user-avatar">{initials}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                        {user?.fullName?.split(' ')[0]}
                      </span>
                      <span
                        className={`user-role-tag ${
                          role === 'ADMIN' ? 'role-admin' : role === 'STAFF' ? 'role-staff' : 'role-student'
                        }`}
                      >
                        {role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary btn-icon"
                    title="Sign Out of Session"
                    aria-label="Sign Out"
                  >
                    <LogOut size={16} />
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>

      {/* Evaluator & Viva Demo Mode Dialog */}
      <DemoModeModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </header>
  );
};

export default Navbar;
