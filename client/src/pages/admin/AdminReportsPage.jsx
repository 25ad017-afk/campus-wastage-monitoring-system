import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { getAssetUrl } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import {
  Shield,
  Search,
  Filter,
  UserCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  HardHat,
  X,
  ArrowLeft,
  Calendar,
  Layers,
  Sparkles,
  MapPin,
  Eye,
  ChevronDown
} from 'lucide-react';

const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [staffRoster, setStaffRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [zoomedImage, setZoomedImage] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Dispatch Modal State
  const [selectedReportForDispatch, setSelectedReportForDispatch] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [dispatching, setDispatching] = useState(false);

  // Status Override Modal State
  const [selectedReportForStatus, setSelectedReportForStatus] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch data
  const fetchData = async () => {
    try {
      const [reportsRes, staffRes] = await Promise.all([
        adminService.getReports(),
        adminService.getStaffRoster()
      ]);

      if (reportsRes.data) {
        setReports(reportsRes.data.reports || reportsRes.data || []);
      }
      if (staffRes.data) {
        setStaffRoster(staffRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load admin reports:', err);
      setError('Unable to load incidents data. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Dispatch
  const handleOpenDispatch = (report) => {
    setSelectedReportForDispatch(report);
    setSelectedStaffId('');
    setDispatchNotes('');
  };

  const handleExecuteDispatch = async (e) => {
    e.preventDefault();
    if (!selectedStaffId) {
      alert('Please select a cleaning staff member.');
      return;
    }

    setDispatching(true);
    try {
      await adminService.assignReport(
        selectedReportForDispatch.report_id,
        selectedStaffId,
        dispatchNotes
      );
      setFeedback(`Ticket #${selectedReportForDispatch.ticket_code} successfully dispatched!`);
      setSelectedReportForDispatch(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign staff.');
    } finally {
      setDispatching(false);
    }
  };

  // Handle Priority Change
  const handlePriorityChange = async (reportId, newPriority) => {
    try {
      await adminService.updatePriority(reportId, newPriority);
      setFeedback(`Priority updated to ${newPriority}.`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update priority.');
    }
  };

  // Handle Status Change
  const handleExecuteStatusChange = async (e) => {
    e.preventDefault();
    if (!newStatus) return;

    setUpdatingStatus(true);
    try {
      await adminService.updateStatus(selectedReportForStatus.report_id, newStatus);
      setFeedback(`Ticket #${selectedReportForStatus.ticket_code} status transitioned to ${newStatus}.`);
      setSelectedReportForStatus(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Filtered List
  const filteredReports = reports.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' ? true : r.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' ? true : r.priority === priorityFilter;
    const matchesSearch =
      r.ticket_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.building_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.reporter_name && r.reporter_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem', marginBottom: '4rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--tech-blue-700)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Shield size={16} /> Campus Facilities Management
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--slate-900)' }}>
            Campus Incident Registry &amp; Dispatch
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
            Audit, triage, and allocate sanitation personnel to reported incidents across campus.
          </p>
        </div>

        <Link to="/admin/dashboard" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Command Center
        </Link>
      </div>

      {feedback && (
        <div className="alert-box alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="alert-box alert-error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '260px', position: 'relative' }}>
          <Search size={18} color="var(--slate-400)" style={{ position: 'absolute', left: '0.75rem' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search by ticket #, building landmark, reporter, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>

        {/* Dropdown Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            className="select-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="REPORTED">Reported (Pending)</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            className="select-field"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="ALL">All Urgencies</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Main Reports Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Incidents Table ({filteredReports.length} matches)</h2>
            <p className="card-subtitle">Showing live records with complete geospatial telemetry</p>
          </div>
        </div>

        {loading ? (
          <Loader message="Loading incident registry..." />
        ) : filteredReports.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Clock size={24} />
            </div>
            <h3 className="empty-state-title">No Incidents Found</h3>
            <p className="empty-state-desc">No reports match your active search query or filter criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Photo Evidence</th>
                  <th>Ticket</th>
                  <th>Campus Location</th>
                  <th>Category</th>
                  <th>Urgency</th>
                  <th>Reporter</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((r) => (
                  <tr key={r.report_id}>
                    {/* Thumbnail Photo */}
                    <td>
                      {r.before_image ? (
                        <div
                          style={{ position: 'relative', cursor: 'pointer', display: 'inline-block' }}
                          onClick={() => setZoomedImage(getAssetUrl(r.before_image))}
                        >
                          <img
                            src={getAssetUrl(r.before_image)}
                            alt="Incident site"
                            style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--border-color)', display: 'block' }}
                          />
                          <div style={{ position: 'absolute', bottom: '2px', right: '2px', background: 'rgba(15, 23, 42, 0.7)', color: 'white', padding: '1px 3px', borderRadius: '3px', fontSize: '0.6rem' }}>
                            <Eye size={10} />
                          </div>
                        </div>
                      ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-400)', fontSize: '0.68rem' }}>
                          No Img
                        </div>
                      )}
                    </td>

                    {/* Ticket Code */}
                    <td>
                      <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--slate-900)' }}>
                        {r.ticket_code}
                      </span>
                      <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)', marginTop: '0.15rem' }}>
                        {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Campus Location */}
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{r.building_name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>{r.floor_or_landmark}</div>
                    </td>

                    {/* Waste Category */}
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 600, color: r.color_code || 'var(--slate-700)' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.color_code || '#64748b' }} />
                        {r.category_name}
                      </div>
                    </td>

                    {/* Priority Selector */}
                    <td>
                      <select
                        value={r.priority}
                        onChange={(e) => handlePriorityChange(r.report_id, e.target.value)}
                        className={`prio-badge ${
                          r.priority === 'CRITICAL'
                            ? 'prio-critical'
                            : r.priority === 'HIGH'
                            ? 'prio-high'
                            : r.priority === 'MEDIUM'
                            ? 'prio-medium'
                            : 'prio-low'
                        }`}
                        style={{ cursor: 'pointer', border: 'none', appearance: 'auto' }}
                        title="Change Urgency Priority"
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="CRITICAL">CRITICAL</option>
                      </select>
                    </td>

                    {/* Reporter */}
                    <td>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--slate-800)' }}>{r.reporter_name || 'Student'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{r.reporter_email}</div>
                    </td>

                    {/* Status */}
                    <td>
                      <StatusBadge status={r.status} />
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        {r.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleOpenDispatch(r)}
                            className="btn btn-primary btn-sm"
                            title="Assign to cleaning crew"
                          >
                            <UserCheck size={14} /> Dispatch
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedReportForStatus(r);
                            setNewStatus(r.status);
                          }}
                          className="btn btn-secondary btn-sm"
                          title="Override lifecycle status"
                        >
                          Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dispatch Cleaning Crew Modal */}
      {selectedReportForDispatch && (
        <div className="modal-backdrop" onClick={() => setSelectedReportForDispatch(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--slate-900)' }}>
                Dispatch Sanitation Crew &bull; Ticket #{selectedReportForDispatch.ticket_code}
              </span>
              <button onClick={() => setSelectedReportForDispatch(null)} className="btn btn-secondary btn-icon" style={{ padding: '0.35rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleExecuteDispatch}>
              <div className="modal-body">
                <div style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
                  <div><strong>Location:</strong> {selectedReportForDispatch.building_name} ({selectedReportForDispatch.floor_or_landmark})</div>
                  <div><strong>Category:</strong> {selectedReportForDispatch.category_name} &bull; Urgency: {selectedReportForDispatch.priority}</div>
                  {selectedReportForDispatch.description && (
                    <div style={{ marginTop: '0.35rem', color: 'var(--slate-600)' }}>
                      <strong>Reporter Notes:</strong> "{selectedReportForDispatch.description}"
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Select Sanitation Personnel <span style={{ color: '#ef4444' }}>*</span></label>
                  <select
                    className="select-field"
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    required
                  >
                    <option value="">Choose Available Cleaning Staff</option>
                    {staffRoster.map((s) => (
                      <option key={s.staff_id} value={s.staff_id}>
                        {s.full_name} ({s.employee_code}) &bull; Zone: {s.assigned_zone} &bull; Active Tasks: {s.active_count || s.active_tasks || 0}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="dispatchNotes">Instructions / Priority Notes</label>
                  <textarea
                    id="dispatchNotes"
                    className="textarea-field"
                    rows={3}
                    placeholder="e.g. Please clear corridor before lecture session starts at 11 AM."
                    value={dispatchNotes}
                    onChange={(e) => setDispatchNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setSelectedReportForDispatch(null)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={dispatching}>
                  {dispatching ? 'Dispatching Staff...' : 'Confirm Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Override Status Modal */}
      {selectedReportForStatus && (
        <div className="modal-backdrop" onClick={() => setSelectedReportForStatus(null)}>
          <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--slate-900)' }}>
                Override Status &bull; #{selectedReportForStatus.ticket_code}
              </span>
              <button onClick={() => setSelectedReportForStatus(null)} className="btn btn-secondary btn-icon" style={{ padding: '0.35rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleExecuteStatusChange}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Select New Lifecycle Status</label>
                  <select
                    className="select-field"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                  >
                    <option value="REPORTED">REPORTED (Pending Assignment)</option>
                    <option value="ASSIGNED">ASSIGNED (Crew Dispatched)</option>
                    <option value="IN_PROGRESS">IN_PROGRESS (Currently Cleaning)</option>
                    <option value="RESOLVED">RESOLVED (Completed &amp; Cleared)</option>
                    <option value="REJECTED">REJECTED (Invalid / Duplicate)</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setSelectedReportForStatus(null)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={updatingStatus}>
                  {updatingStatus ? 'Updating...' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enlarged Photo Modal */}
      {zoomedImage && (
        <div className="modal-backdrop" onClick={() => setZoomedImage(null)}>
          <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Photographic Evidence View</span>
              <button onClick={() => setZoomedImage(null)} className="btn btn-secondary btn-icon" style={{ padding: '0.35rem' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '1rem' }}>
              <img src={zoomedImage} alt="Enlarged evidence" style={{ maxWidth: '100%', maxHeight: '72vh', borderRadius: 'var(--radius-md)', objectFit: 'contain' }} />
            </div>
            <div className="modal-footer">
              <button onClick={() => setZoomedImage(null)} className="btn btn-secondary btn-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportsPage;
