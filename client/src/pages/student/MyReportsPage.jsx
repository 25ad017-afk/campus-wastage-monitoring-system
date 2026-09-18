import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { getAssetUrl } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import {
  PlusCircle,
  Search,
  Trash2,
  Calendar,
  MapPin,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  Eye,
  X
} from 'lucide-react';

const MyReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [zoomedImage, setZoomedImage] = useState(null);

  const fetchReports = async () => {
    try {
      const res = await reportService.getMyReports();
      if (res.data) {
        setReports(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (reportId, ticketCode) => {
    if (!window.confirm(`Are you sure you want to withdraw Report #${ticketCode}?`)) {
      return;
    }

    try {
      await reportService.deleteReport(reportId);
      setActionMessage(`Report #${ticketCode} successfully withdrawn.`);
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete report.');
    }
  };

  // Filter & Search Logic
  const filteredReports = reports.filter((r) => {
    const matchesStatus =
      statusFilter === 'ALL' ? true : r.status === statusFilter;
    const matchesSearch =
      r.ticket_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.building_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem', marginBottom: '4rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-700)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Sparkles size={14} /> Incident Telemetry Registry
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--slate-900)' }}>
            My Reported Incidents
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
            Track the real-time resolution progression and verifiable photographic proof of your submissions.
          </p>
        </div>

        <Link to="/student/report" className="btn btn-primary">
          <PlusCircle size={18} /> New Waste Report
        </Link>
      </div>

      {actionMessage && (
        <div className="alert-box alert-success">
          <span>✓ {actionMessage}</span>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '260px', position: 'relative' }}>
          <Search size={18} color="var(--slate-400)" style={{ position: 'absolute', left: '0.75rem' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search by ticket #, landmark building, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Incidents' },
            { id: 'REPORTED', label: 'Reported' },
            { id: 'ASSIGNED', label: 'Assigned' },
            { id: 'IN_PROGRESS', label: 'In Progress' },
            { id: 'RESOLVED', label: 'Resolved' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`btn btn-sm ${statusFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Report Cards Feed */}
      {loading ? (
        <Loader message="Loading your submitted reports..." />
      ) : filteredReports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Clock size={24} />
          </div>
          <h3 className="empty-state-title">No matching incident reports found</h3>
          <p className="empty-state-desc">
            {reports.length === 0
              ? 'You have not submitted any waste reports yet.'
              : 'Try adjusting your search keywords or status filter tab.'}
          </p>
          <Link to="/student/report" className="btn btn-primary btn-sm">
            <PlusCircle size={16} /> File New Waste Incident
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredReports.map((r) => (
            <div key={r.report_id} className="card" style={{ padding: '1.75rem' }}>
              {/* Card Header Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--slate-900)', fontFamily: 'var(--font-mono)' }}>
                      {r.ticket_code}
                    </span>
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
                    >
                      {r.priority} PRIORITY
                    </span>
                  </div>

                  <div style={{ fontSize: '0.86rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--slate-700)', fontWeight: 600 }}>
                      <MapPin size={15} color="var(--primary-600)" /> {r.building_name} ({r.floor_or_landmark})
                    </span>
                    <span>&bull;</span>
                    <span style={{ color: r.color_code || 'var(--slate-700)', fontWeight: 700 }}>
                      🏷️ {r.category_name}
                    </span>
                    <span>&bull;</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={14} /> {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <StatusBadge status={r.status} />
                  {r.status === 'REPORTED' && (
                    <button
                      onClick={() => handleDelete(r.report_id, r.ticket_code)}
                      className="btn btn-secondary btn-sm"
                      title="Withdraw incident report"
                      style={{ color: '#dc2626' }}
                    >
                      <Trash2 size={15} /> Withdraw
                    </button>
                  )}
                </div>
              </div>

              {/* Photos Comparison Box */}
              <div
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  flexWrap: 'wrap',
                  background: 'var(--slate-50)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)'
                }}
              >
                {/* Before Image */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Before Cleanup Proof
                  </div>
                  {r.before_image ? (
                    <div
                      style={{ position: 'relative', cursor: 'pointer' }}
                      onClick={() => setZoomedImage(getAssetUrl(r.before_image))}
                    >
                      <img
                        src={getAssetUrl(r.before_image)}
                        alt="Before cleanup"
                        style={{ width: '140px', height: '105px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'block' }}
                      />
                      <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(15, 23, 42, 0.7)', color: 'white', padding: '2px 4px', borderRadius: '4px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Eye size={10} /> View
                      </div>
                    </div>
                  ) : (
                    <div style={{ width: '140px', height: '105px', background: 'var(--slate-200)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-400)', fontSize: '0.75rem' }}>
                      No Image
                    </div>
                  )}
                </div>

                {/* After Image (When completed) */}
                {r.after_image && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      After Resolution Proof ✓
                    </div>
                    <div
                      style={{ position: 'relative', cursor: 'pointer' }}
                      onClick={() => setZoomedImage(getAssetUrl(r.after_image))}
                    >
                      <img
                        src={getAssetUrl(r.after_image)}
                        alt="After resolution"
                        style={{ width: '140px', height: '105px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '2px solid var(--primary-500)', display: 'block' }}
                      />
                      <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(5, 150, 105, 0.85)', color: 'white', padding: '2px 4px', borderRadius: '4px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <CheckCircle2 size={10} /> Verified
                      </div>
                    </div>
                  </div>
                )}

                {/* Description & Status Note */}
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                    Incident Description
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--slate-700)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                    {r.description || 'No additional notes entered by reporter.'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enlarged Photo Modal */}
      {zoomedImage && (
        <div className="modal-backdrop" onClick={() => setZoomedImage(null)}>
          <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Photographic Verification Inspection</span>
              <button onClick={() => setZoomedImage(null)} className="btn btn-secondary btn-icon" style={{ padding: '0.35rem' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '1rem' }}>
              <img
                src={zoomedImage}
                alt="Enlarged evidence"
                style={{ maxWidth: '100%', maxHeight: '72vh', borderRadius: 'var(--radius-md)', objectFit: 'contain' }}
              />
            </div>
            <div className="modal-footer">
              <button onClick={() => setZoomedImage(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReportsPage;
