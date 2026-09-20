import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { reportService } from '../../services/reportService';
import { getAssetUrl } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Calendar,
  Sparkles,
  Award,
  Layers,
  Eye,
  X,
  PhoneCall
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const fetchMyReports = async () => {
      try {
        const res = await reportService.getMyReports();
        if (res.data) {
          setReports(res.data);
        }
      } catch (err) {
        console.error('Failed to load student reports:', err);
        setError('Unable to fetch your reports. Please ensure backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyReports();
  }, []);

  // Compute live statistics from real backend data
  const totalReports = reports.length;
  const pendingReports = reports.filter((r) =>
    ['REPORTED', 'ASSIGNED', 'IN_PROGRESS'].includes(r.status)
  ).length;
  const inProgressReports = reports.filter((r) => r.status === 'IN_PROGRESS').length;
  const completedReports = reports.filter((r) => r.status === 'RESOLVED').length;
  const highPriorityReports = reports.filter((r) =>
    ['HIGH', 'CRITICAL'].includes(r.priority) && r.status !== 'RESOLVED'
  ).length;

  const recentReports = reports.slice(0, 5);

  if (loading) {
    return <Loader fullScreen message="Loading student portal statistics..." />;
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem', marginBottom: '4rem' }}>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--slate-900) 0%, var(--slate-800) 100%)',
          color: '#ffffff',
          padding: '2rem 2.25rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          border: '1px solid var(--slate-700)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
            <div
              style={{
                background: '#ffffff',
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              <img
                src="/assets/images/college_banner.jpeg"
                alt="Akshaya College of Engineering and Technology"
                style={{
                  maxHeight: '36px',
                  maxWidth: '150px',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', color: 'var(--primary-300)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <Sparkles size={14} /> Student Sanitation Representative
            </div>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
            Welcome back, {user?.fullName?.split(' ')[0]}!
          </h1>
          <p style={{ color: 'var(--slate-300)', fontSize: '0.92rem', marginTop: '0.1rem' }}>
            Active campus waste reporting console and real-time status tracker.
          </p>
        </div>

        <Link to="/student/report" className="btn btn-primary btn-lg" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <PlusCircle size={20} /> Report Waste Incident
        </Link>
      </div>

      {/* Campus Control Desk Emergency Contact Bar */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'var(--primary-50)',
              color: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <PhoneCall size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--slate-900)' }}>
              Akshaya College of Engineering and Technology &bull; Campus Control Desk
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
              Direct helpline for hazardous waste spillage, overflowing bins, or urgent crew dispatch
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <a
            href="tel:04259242570"
            className="btn btn-primary btn-sm"
            style={{ fontWeight: 700, textDecoration: 'none' }}
            title="Call 04259-242570"
          >
            <PhoneCall size={14} /> 04259-242570
          </a>
          <span style={{ color: 'var(--slate-400)', fontSize: '0.8rem', fontWeight: 600 }}>to</span>
          <a
            href="tel:04259242574"
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 700, textDecoration: 'none' }}
            title="Call 04259-242574"
          >
            <PhoneCall size={14} /> 04259-242574
          </a>
        </div>
      </div>

      {error && (
        <div className="alert-box alert-error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card stat-info">
          <div>
            <div className="stat-label">Total Submissions</div>
            <div className="stat-value">{totalReports}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>Logged across campus</div>
          </div>
          <div className="stat-icon-box" style={{ background: 'var(--tech-blue-100)', color: 'var(--tech-blue-600)' }}>
            <FileText size={22} />
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div>
            <div className="stat-label">Under Clean-Up</div>
            <div className="stat-value">{pendingReports}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
              {inProgressReports} actively in progress
            </div>
          </div>
          <div className="stat-icon-box" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card stat-primary">
          <div>
            <div className="stat-label">Resolved &amp; Verified</div>
            <div className="stat-value">{completedReports}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>Cleaned with photo proof</div>
          </div>
          <div className="stat-icon-box" style={{ background: 'var(--status-resolved-bg)', color: 'var(--status-resolved-text)' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="stat-card stat-danger">
          <div>
            <div className="stat-label">High Urgency</div>
            <div className="stat-value">{highPriorityReports}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>Priority escalation spots</div>
          </div>
          <div className="stat-icon-box" style={{ background: 'var(--prio-crit-bg)', color: 'var(--prio-crit-text)' }}>
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Recent Incidents Table / Activity Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Recent Submissions &amp; Telemetry Tracking</h2>
            <p className="card-subtitle">Latest reported incidents logged from your account</p>
          </div>
          <Link
            to="/student/my-reports"
            className="btn btn-outline btn-sm"
          >
            View All Reports ({totalReports}) <ArrowRight size={15} />
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Sparkles size={24} />
            </div>
            <h3 className="empty-state-title">No Campus Reports Logged Yet</h3>
            <p className="empty-state-desc">
              Notice overflowing bins or mixed litter around lecture halls or hostels? Submit a quick photo report to dispatch cleaning personnel.
            </p>
            <Link to="/student/report" className="btn btn-primary btn-sm">
              <PlusCircle size={16} /> Log First Waste Report
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Evidence</th>
                  <th>Ticket &amp; Urgency</th>
                  <th>Campus Location</th>
                  <th>Waste Category</th>
                  <th>Date Logged</th>
                  <th>Current Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((r) => (
                  <tr key={r.report_id}>
                    {/* Thumbnail */}
                    <td>
                      {r.before_image ? (
                        <button
                          type="button"
                          onClick={() => setSelectedPhoto(getAssetUrl(r.before_image))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          title="Click to zoom evidence"
                        >
                          <img
                            src={getAssetUrl(r.before_image)}
                            alt="Incident site"
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: 'var(--radius-sm)',
                              objectFit: 'cover',
                              border: '1px solid var(--border-color)',
                              display: 'block'
                            }}
                          />
                        </button>
                      ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-400)', fontSize: '0.7rem' }}>
                          No Img
                        </div>
                      )}
                    </td>

                    {/* Ticket Code & Priority */}
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.ticket_code}</div>
                      <span
                        className={`prio-badge ${
                          r.priority === 'CRITICAL'
                            ? 'prio-critical'
                            : r.priority === 'HIGH'
                            ? 'prio-high'
                            : r.priority === 'MEDIUM'
                            ? 'prio-medium'
                            : 'prio-low'
                        }`}
                        style={{ marginTop: '0.2rem' }}
                      >
                        {r.priority}
                      </span>
                    </td>

                    {/* Location */}
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{r.building_name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>{r.floor_or_landmark}</div>
                    </td>

                    {/* Category */}
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 600, color: r.color_code || 'var(--slate-700)' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.color_code || '#64748b' }} />
                        {r.category_name}
                      </div>
                    </td>

                    {/* Date */}
                    <td style={{ fontSize: '0.82rem', color: 'var(--slate-600)', whiteSpace: 'nowrap' }}>
                      {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    {/* Status */}
                    <td>
                      <StatusBadge status={r.status} />
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: 'right' }}>
                      <Link to="/student/my-reports" className="btn btn-secondary btn-sm">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div className="modal-backdrop" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Photographic Incident Evidence</span>
              <button onClick={() => setSelectedPhoto(null)} className="btn btn-secondary btn-icon" style={{ padding: '0.35rem' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '1rem' }}>
              <img
                src={selectedPhoto}
                alt="Enlarged waste evidence"
                style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 'var(--radius-md)', objectFit: 'contain' }}
              />
            </div>
            <div className="modal-footer">
              <button onClick={() => setSelectedPhoto(null)} className="btn btn-secondary btn-sm">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
