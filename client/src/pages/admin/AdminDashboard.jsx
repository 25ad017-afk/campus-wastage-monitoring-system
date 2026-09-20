import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { getAssetUrl } from '../../services/api';
import CampusMap from '../../components/admin/CampusMap';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import {
  Shield,
  Clock,
  CheckCircle2,
  AlertOctagon,
  PlayCircle,
  FileText,
  BarChart3,
  MapPin,
  Calendar,
  ArrowRight,
  Sparkles,
  Tag,
  TrendingUp,
  Layers,
  HardHat,
  PhoneCall
} from 'lucide-react';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [dashRes, analyticsRes] = await Promise.all([
          adminService.getDashboard(),
          adminService.getAnalytics()
        ]);

        if (dashRes.data) setDashboardData(dashRes.data);
        if (analyticsRes.data) setAnalyticsData(analyticsRes.data);
      } catch (err) {
        console.error('Failed to load admin dashboard data:', err);
        setError('Unable to fetch live admin statistics. Please check backend connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  if (loading) {
    return <Loader fullScreen message="Loading Facilities Command Center telemetry..." />;
  }

  const stats = dashboardData?.stats?.reports || {};
  const crewStats = dashboardData?.stats?.staff || {};
  const recentReports = dashboardData?.recentReports || [];

  const byCategory = analyticsData?.byCategory || [];
  const byLocation = analyticsData?.byLocation || [];
  const monthlyTrends = analyticsData?.monthlyTrends || [];

  const maxCategoryCount = Math.max(...byCategory.map((c) => c.report_count), 1);
  const maxLocationCount = Math.max(...byLocation.map((l) => l.incident_count), 1);
  const maxMonthlyCount = Math.max(
    ...monthlyTrends.map((m) => Math.max(m.total_submitted, m.total_resolved)),
    1
  );

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem', marginBottom: '4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <div
              style={{
                background: '#ffffff',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              <img
                src="/assets/images/college_banner.jpeg"
                alt="Akshaya College of Engineering and Technology"
                style={{
                  maxHeight: '34px',
                  maxWidth: '140px',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--tech-blue-700)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Shield size={16} /> Campus Facilities &amp; Sanitation Command
            </div>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '0.2rem', color: 'var(--slate-900)' }}>
            Facilities Operations Command Center
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
            Live geospatial waste tracking, staff dispatch telemetry, and campus environmental auditing.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Link to="/admin/map" className="btn btn-primary btn-sm">
            <MapPin size={15} /> Campus Map
          </Link>
          <Link to="/admin/analytics" className="btn btn-secondary btn-sm">
            <BarChart3 size={15} /> Analytics Hub
          </Link>
          <Link to="/admin/reports" className="btn btn-secondary btn-sm">
            <FileText size={15} /> Incident Registry
          </Link>
          <Link to="/admin/staff" className="btn btn-secondary btn-sm">
            <HardHat size={15} /> Crew Roster ({crewStats.available || 0} Ready)
          </Link>
        </div>
      </div>

      {/* Campus Control Desk Emergency Dispatch Strip */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--slate-900) 0%, var(--slate-800) 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          border: '1px solid var(--slate-700)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.2)',
              color: 'var(--primary-300)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <PhoneCall size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#ffffff' }}>
              Akshaya College of Engineering and Technology &bull; Campus Control Desk
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>
              Estate Management &amp; Sanitation Dispatch Center &bull; Kinathukadavu, Coimbatore
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <a
            href="tel:04259242570"
            className="btn btn-primary btn-sm"
            style={{ fontWeight: 800, textDecoration: 'none' }}
            title="Call 04259-242570"
          >
            <PhoneCall size={14} /> 04259-242570
          </a>
          <span style={{ color: 'var(--slate-400)', fontSize: '0.8rem' }}>to</span>
          <a
            href="tel:04259242574"
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 800, textDecoration: 'none', background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: 'none' }}
            title="Call 04259-242574"
          >
            <PhoneCall size={14} /> 04259-242574
          </a>
        </div>
      </div>

      {error && (
        <div className="alert-box alert-error">
          <AlertOctagon size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Metrics Grid */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card stat-info">
          <div>
            <div className="stat-label">Total Incidents</div>
            <div className="stat-value">{stats.total ?? 0}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>Logged across campus</div>
          </div>
          <div className="stat-icon-box" style={{ background: 'var(--tech-blue-100)', color: 'var(--tech-blue-600)' }}>
            <FileText size={22} />
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div>
            <div className="stat-label">Pending Dispatch</div>
            <div className="stat-value">{stats.reported ?? stats.pending ?? 0}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>Awaiting crew allocation</div>
          </div>
          <div className="stat-icon-box" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card stat-primary">
          <div>
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{stats.inProgress ?? 0}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>Dispatched cleaning crew</div>
          </div>
          <div className="stat-icon-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <PlayCircle size={22} />
          </div>
        </div>

        <div className="stat-card stat-primary">
          <div>
            <div className="stat-label">Resolved &bull; Verified</div>
            <div className="stat-value">{stats.completed ?? 0}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>Photo proof approved</div>
          </div>
          <div className="stat-icon-box" style={{ background: 'var(--status-resolved-bg)', color: 'var(--status-resolved-text)' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Critical Alert Banner if urgent issues exist */}
      {stats.criticalActive > 0 && (
        <div
          className="alert-box alert-error"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertOctagon size={24} style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '0.95rem' }}>
                {stats.criticalActive} Critical Urgency Incident(s) Require Immediate Dispatch!
              </strong>
              <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>
                Safety hazardous spillage or severe overflow reported in high-traffic campus zones.
              </div>
            </div>
          </div>
          <Link to="/admin/reports" className="btn btn-danger btn-sm">
            Triage Critical Incidents &rarr;
          </Link>
        </div>
      )}

      {/* Interactive GIS Campus Map (Embedded View) */}
      <div style={{ marginBottom: '2.5rem' }}>
        <CampusMap embedded={true} />
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        {/* Chart 1: Waste by Category */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Tag size={18} color="var(--primary)" />
              <h3 className="card-title" style={{ fontSize: '1rem' }}>Waste Segregation Mix</h3>
            </div>
          </div>

          {byCategory.length === 0 ? (
            <p style={{ color: 'var(--slate-400)', fontSize: '0.85rem' }}>No telemetry data logged yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {byCategory.map((cat) => {
                const percentage = Math.round((cat.report_count / (stats.total || 1)) * 100);
                return (
                  <div key={cat.category_id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{cat.category_name}</span>
                      <span style={{ color: 'var(--slate-500)', fontWeight: 600 }}>
                        {cat.report_count} ({percentage}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '7px', background: 'var(--slate-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${(cat.report_count / maxCategoryCount) * 100}%`,
                          height: '100%',
                          background: cat.color_code || 'var(--primary)',
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chart 2: Top Hotspots */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--tech-blue-600)" />
              <h3 className="card-title" style={{ fontSize: '1rem' }}>Campus Sector Hotspots</h3>
            </div>
          </div>

          {byLocation.length === 0 ? (
            <p style={{ color: 'var(--slate-400)', fontSize: '0.85rem' }}>No hotspot data available yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {byLocation.slice(0, 5).map((loc) => (
                <div key={loc.location_id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--slate-800)', maxWidth: '72%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {loc.building_name}
                    </span>
                    <span style={{ fontWeight: 700, color: loc.active_incidents > 0 ? '#dc2626' : 'var(--primary-700)' }}>
                      {loc.incident_count} reports
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '7px', background: 'var(--slate-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${(loc.incident_count / maxLocationCount) * 100}%`,
                        height: '100%',
                        background: loc.active_incidents > 0 ? '#f87171' : 'var(--primary-400)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart 3: Monthly Trends */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="var(--primary-600)" />
              <h3 className="card-title" style={{ fontSize: '1rem' }}>Resolution SLA Trends</h3>
            </div>
          </div>

          {monthlyTrends.length === 0 ? (
            <p style={{ color: 'var(--slate-400)', fontSize: '0.85rem' }}>No monthly trend records yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {monthlyTrends.slice(-4).map((m) => (
                <div key={m.month_key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{m.month_label}</span>
                    <span style={{ color: 'var(--slate-500)', fontSize: '0.78rem' }}>
                      Logged: {m.total_submitted} | <strong style={{ color: 'var(--primary-700)' }}>Resolved: {m.total_resolved}</strong>
                    </span>
                  </div>
                  <div style={{ display: 'flex', height: '8px', gap: '3px', background: 'var(--slate-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${(m.total_resolved / maxMonthlyCount) * 100}%`,
                        background: 'var(--primary-500)',
                        borderRadius: 'var(--radius-full)'
                      }}
                      title="Resolved"
                    />
                    <div
                      style={{
                        width: `${((m.total_submitted - m.total_resolved) / maxMonthlyCount) * 100}%`,
                        background: '#f59e0b',
                        borderRadius: 'var(--radius-full)'
                      }}
                      title="Pending"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Incidents Dispatch Queue Feed */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Live Incident Stream &bull; Action Required</h2>
            <p className="card-subtitle">Real-time incoming campus waste reports awaiting triage</p>
          </div>
          <Link to="/admin/reports" className="btn btn-outline btn-sm">
            View All Incidents <ArrowRight size={15} />
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <CheckCircle2 size={24} color="var(--primary)" />
            </div>
            <h3 className="empty-state-title">No Pending Campus Incidents</h3>
            <p className="empty-state-desc">All reported waste incidents have been resolved. Excellent campus sanitation status!</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Ticket</th>
                  <th>Campus Location</th>
                  <th>Type &amp; Urgency</th>
                  <th>Reporter</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Triage Action</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((r) => (
                  <tr key={r.report_id}>
                    <td>
                      {r.before_image ? (
                        <img
                          src={getAssetUrl(r.before_image)}
                          alt="Waste site"
                          style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--border-color)', display: 'block' }}
                        />
                      ) : (
                        <div style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-sm)', background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-400)', fontSize: '0.68rem' }}>
                          No Img
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--slate-900)' }}>
                        {r.ticket_code}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{r.building_name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>{r.floor_or_landmark}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 600 }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.color_code || '#64748b' }} />
                        {r.category_name}
                      </div>
                      <span className={`prio-badge ${r.priority === 'CRITICAL' ? 'prio-critical' : r.priority === 'HIGH' ? 'prio-high' : 'prio-medium'}`} style={{ marginTop: '0.2rem' }}>
                        {r.priority}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--slate-600)' }}>
                      {r.reporter_name || 'Campus Student'}
                    </td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to="/admin/reports" className="btn btn-secondary btn-sm">
                        Dispatch
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
