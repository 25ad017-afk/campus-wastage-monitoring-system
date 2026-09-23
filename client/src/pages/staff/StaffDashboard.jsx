import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/staffService';
import { authService } from '../../services/authService';
import { getAssetUrl } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import {
  HardHat,
  CheckCircle2,
  Clock,
  PlayCircle,
  AlertTriangle,
  Camera,
  Upload,
  X,
  MapPin,
  CheckSquare,
  Play,
  Calendar,
  Layers,
  Scale,
  Sparkles,
  Eye,
  Check,
  ToggleLeft,
  ToggleRight,
  PhoneCall,
  Mail,
  AlertOctagon
} from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const [completedHistory, setCompletedHistory] = useState([]);
  const [staffInfo, setStaffInfo] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(location.pathname === '/staff/history' ? 'COMPLETED' : 'ALL');
  const [feedback, setFeedback] = useState('');
  const [zoomedImage, setZoomedImage] = useState(null);

  // Complete Task Modal State
  const [selectedTaskForCompletion, setSelectedTaskForCompletion] = useState(null);
  const [proofImage, setProofImage] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [wasteWeightKg, setWasteWeightKg] = useState('');
  const [disposalDestination, setDisposalDestination] = useState('Campus Paper Recycling Unit');
  const [completing, setCompleting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fileInputRef = useRef(null);

  const fetchStaffData = async () => {
    try {
      const [tasksRes, historyRes, emailRes] = await Promise.all([
        staffService.getTasks(),
        staffService.getHistory(),
        authService.getEmailStatus().catch(() => ({ data: null }))
      ]);

      if (tasksRes.data) {
        setTasks(tasksRes.data.tasks || []);
        setStaffInfo(tasksRes.data.staffInfo || null);
      }
      if (historyRes.data) {
        setCompletedHistory(historyRes.data.history || []);
      }
      if (emailRes?.data) {
        setEmailStatus(emailRes.data);
      }
    } catch (err) {
      console.error('Failed to load cleaning staff data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  useEffect(() => {
    if (location.pathname === '/staff/history') {
      setActiveTab('COMPLETED');
    }
  }, [location.pathname]);

  // Compute live statistics
  const totalAssigned = tasks.length;
  const pendingTasks = tasks.filter((t) => t.assignment_status === 'ASSIGNED');
  const inProgressTasks = tasks.filter((t) => t.assignment_status === 'IN_PROGRESS');
  const highPriorityTasks = tasks.filter((t) => ['HIGH', 'CRITICAL'].includes(t.priority));
  const completedCount = completedHistory.length;

  const handleToggleAvailability = async () => {
    try {
      const newStatus = !staffInfo?.isAvailable;
      await staffService.toggleAvailability(newStatus);
      setStaffInfo(prev => ({ ...prev, isAvailable: newStatus }));
      setFeedback(`Duty status updated to ${newStatus ? 'Available on Duty' : 'On-Break'}.`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update availability.');
    }
  };

  const handleAccept = async (assignmentId) => {
    try {
      await staffService.acceptTask(assignmentId);
      setFeedback('Task acknowledged! Proceed to the site.');
      fetchStaffData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept task.');
    }
  };

  const handleStart = async (assignmentId) => {
    try {
      await staffService.startTask(assignmentId);
      setFeedback('Task marked as In-Progress.');
      fetchStaffData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start task.');
    }
  };

  const handleOpenCompleteModal = (task) => {
    setSelectedTaskForCompletion(task);
    setProofImage(null);
    setProofPreview(null);
    setRemarks('');
    setWasteWeightKg('');
    setModalError('');
  };

  const handleProofChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setModalError('Please upload a valid JPEG, PNG, or WebP photo.');
      return;
    }

    setModalError('');
    setProofImage(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!proofImage) {
      setModalError('A photographic proof ("After" image) of the cleaned area is mandatory.');
      return;
    }

    setCompleting(true);
    setModalError('');

    try {
      const formData = new FormData();
      formData.append('image', proofImage);
      formData.append('remarks', remarks);
      if (wasteWeightKg) formData.append('wasteWeightKg', wasteWeightKg);
      formData.append('disposalDestination', disposalDestination);

      await staffService.completeTask(selectedTaskForCompletion.assignment_id, formData);

      setFeedback(`Task #${selectedTaskForCompletion.ticket_code} resolved and verified!`);
      setSelectedTaskForCompletion(null);
      fetchStaffData();
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to complete task.');
    } finally {
      setCompleting(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'ASSIGNED') return t.assignment_status === 'ASSIGNED';
    if (activeTab === 'IN_PROGRESS') return t.assignment_status === 'IN_PROGRESS';
    return true;
  });

  if (loading) {
    return <Loader fullScreen message="Loading cleaning crew task terminal..." />;
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem', marginBottom: '4rem' }}>
      {/* Staff Header Card */}
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
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', color: '#fcd34d', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <HardHat size={14} /> Sanitation Operational Terminal
            </div>
            {emailStatus && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: emailStatus.status === 'Configured' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  border: emailStatus.status === 'Configured' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  color: emailStatus.status === 'Configured' ? '#6ee7b7' : '#fcd34d',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                <Mail size={13} /> SMTP Status: {emailStatus.status || (emailStatus.isConfigured ? 'Configured' : 'Not Configured')}
              </div>
            )}
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
            {staffInfo?.employeeCode ? `${staffInfo.employeeCode} - ` : ''}{user?.fullName}
          </h1>
          <p style={{ color: 'var(--slate-300)', fontSize: '0.92rem', marginTop: '0.1rem' }}>
            Primary Assigned Sector: <strong>{staffInfo?.assignedZone || 'General Campus'}</strong>
          </p>
        </div>

        {/* Duty Toggle Button */}
        <button
          onClick={handleToggleAvailability}
          className="btn"
          style={{
            background: staffInfo?.isAvailable ? 'var(--primary-600)' : 'var(--slate-700)',
            color: '#ffffff',
            padding: '0.75rem 1.4rem'
          }}
        >
          {staffInfo?.isAvailable ? (
            <>
              <CheckCircle2 size={18} /> On Duty (Available)
            </>
          ) : (
            <>
              <Clock size={18} /> On Break (Standby)
            </>
          )}
        </button>
      </div>

      {/* Campus Control Desk Emergency Contact Strip for Cleaning Staff */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.9rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#fef3c7',
              color: '#b45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <PhoneCall size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--slate-800)' }}>
              Akshaya College of Engineering and Technology &bull; Campus Control Desk
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
              Sanitation Supervisor &amp; Equipment Emergency Helpline
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <a
            href="tel:04259242570"
            className="btn btn-primary btn-sm"
            style={{ fontWeight: 700, textDecoration: 'none', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            title="Call Control Desk"
          >
            <PhoneCall size={13} /> 04259-242570
          </a>
          <span style={{ color: 'var(--slate-400)', fontSize: '0.78rem', fontWeight: 600 }}>to</span>
          <a
            href="tel:04259242574"
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 700, textDecoration: 'none', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            title="Call Alternate Line"
          >
            <PhoneCall size={13} /> 04259-242574
          </a>
        </div>
      </div>

      {feedback && (
        <div className="alert-box alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card stat-info">
          <div>
            <div className="stat-label">Active Workload</div>
            <div className="stat-value">{totalAssigned}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>Assigned incidents</div>
          </div>
          <div className="stat-icon-box" style={{ background: 'var(--tech-blue-100)', color: 'var(--tech-blue-600)' }}>
            <Layers size={22} />
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div>
            <div className="stat-label">Awaiting Acceptance</div>
            <div className="stat-value">{pendingTasks.length}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>Require acknowledgment</div>
          </div>
          <div className="stat-icon-box" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card stat-primary">
          <div>
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{inProgressTasks.length}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>Currently being swept</div>
          </div>
          <div className="stat-icon-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <PlayCircle size={22} />
          </div>
        </div>

        <div className="stat-card stat-primary">
          <div>
            <div className="stat-label">Total Resolved</div>
            <div className="stat-value">{completedCount}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>Verified cleanup records</div>
          </div>
          <div className="stat-icon-box" style={{ background: 'var(--status-resolved-bg)', color: 'var(--status-resolved-text)' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div
        className="card"
        style={{
          padding: '0.75rem 1rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <button
          onClick={() => setActiveTab('ALL')}
          className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Active ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('ASSIGNED')}
          className={`btn btn-sm ${activeTab === 'ASSIGNED' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Pending Accept ({pendingTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('IN_PROGRESS')}
          className={`btn btn-sm ${activeTab === 'IN_PROGRESS' ? 'btn-primary' : 'btn-secondary'}`}
        >
          In Progress ({inProgressTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`btn btn-sm ${activeTab === 'COMPLETED' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Completed History ({completedCount})
        </button>
      </div>

      {/* Main Task List or Completed History View */}
      {activeTab === 'COMPLETED' ? (
        // Completed History View
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Completed Tasks &amp; Disposal Verification History</h2>
              <p className="card-subtitle">Historical log of collected waste with Before &amp; After proof</p>
            </div>
          </div>

          {completedHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="empty-state-title">No completed tasks on record yet</h3>
              <p className="empty-state-desc">Completed tasks with after-photos and waste weight logs will be archived here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {completedHistory.map((item) => (
                <div key={item.assignment_id} style={{ background: 'var(--slate-50)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--slate-900)', fontFamily: 'var(--font-mono)' }}>
                        {item.ticket_code}
                      </span>
                      <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                        📍 {item.building_name} ({item.floor_or_landmark})
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className="badge badge-resolved">
                        <span className="badge-dot" /> RESOLVED
                      </span>
                      {item.waste_weight_kg && (
                        <span style={{ background: 'var(--primary-light)', color: 'var(--primary-700)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.75rem' }}>
                          ⚖️ {item.waste_weight_kg} kg
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Before / After Comparison */}
                  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    {/* Before Image */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Before Cleanup</div>
                      {item.before_image ? (
                        <img
                          src={getAssetUrl(item.before_image)}
                          alt="Before"
                          onClick={() => setZoomedImage(getAssetUrl(item.before_image))}
                          style={{ width: '130px', height: '95px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                        />
                      ) : (
                        <div style={{ width: '130px', height: '95px', background: 'var(--slate-200)', borderRadius: 'var(--radius-sm)' }} />
                      )}
                    </div>

                    {/* After Image */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>After Cleanup ✓</div>
                      {item.after_image ? (
                        <img
                          src={getAssetUrl(item.after_image)}
                          alt="After"
                          onClick={() => setZoomedImage(getAssetUrl(item.after_image))}
                          style={{ width: '130px', height: '95px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '2px solid var(--primary-500)', cursor: 'pointer' }}
                        />
                      ) : (
                        <div style={{ width: '130px', height: '95px', background: 'var(--slate-200)', borderRadius: 'var(--radius-sm)' }} />
                      )}
                    </div>

                    {/* Collection Details */}
                    <div style={{ flex: 1, minWidth: '220px', fontSize: '0.85rem' }}>
                      <div style={{ color: 'var(--slate-500)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Disposal &amp; Remarks</div>
                      <p style={{ color: 'var(--slate-800)', marginTop: '0.25rem' }}>
                        <strong>Destination:</strong> {item.disposal_destination || 'Campus Main Dumpster'}
                      </p>
                      <p style={{ color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                        <strong>Remarks:</strong> {item.staff_remarks || 'Completed and sanitized.'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Active Tasks Queue View
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredTasks.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="empty-state-title">No Active Tasks In This Queue</h3>
                <p className="empty-state-desc">All incidents assigned to you in this status have been addressed. Great work keeping the campus clean!</p>
              </div>
            </div>
          ) : (
            filteredTasks.map((t) => (
              <div key={t.assignment_id} className="card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--slate-900)', fontFamily: 'var(--font-mono)' }}>
                        {t.ticket_code}
                      </span>
                      <span className={`prio-badge ${t.priority === 'CRITICAL' ? 'prio-critical' : t.priority === 'HIGH' ? 'prio-high' : 'prio-medium'}`}>
                        {t.priority} PRIORITY
                      </span>
                    </div>

                    <div style={{ fontSize: '0.86rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--slate-800)', fontWeight: 600 }}>
                        <MapPin size={15} color="var(--primary-600)" /> {t.building_name} ({t.floor_or_landmark})
                      </span>
                      <span>&bull;</span>
                      <span style={{ color: t.color_code, fontWeight: 700 }}>🏷️ {t.category_name}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <StatusBadge status={t.assignment_status} />
                  </div>
                </div>

                {/* Evidence & Dispatch Notes */}
                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', background: 'var(--slate-50)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
                  {t.before_image && (
                    <img
                      src={getAssetUrl(t.before_image)}
                      alt="Incident site"
                      onClick={() => setZoomedImage(getAssetUrl(t.before_image))}
                      style={{ width: '130px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                    />
                  )}

                  <div style={{ flex: 1, minWidth: '220px', fontSize: '0.88rem' }}>
                    <div style={{ color: 'var(--slate-500)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Reporter Notes</div>
                    <p style={{ color: 'var(--slate-800)', marginTop: '0.2rem', marginBottom: '0.65rem' }}>
                      {t.description || 'No additional notes entered by student.'}
                    </p>

                    {t.admin_notes && (
                      <div style={{ background: '#fef3c7', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', color: '#92400e', fontSize: '0.82rem' }}>
                        <strong>Dispatcher Note:</strong> {t.admin_notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Lifecycle Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {t.assignment_status === 'ASSIGNED' && (
                    <button onClick={() => handleAccept(t.assignment_id)} className="btn btn-primary btn-sm">
                      <CheckSquare size={16} /> Accept Assignment
                    </button>
                  )}

                  {t.assignment_status === 'ACKNOWLEDGED' && (
                    <button onClick={() => handleStart(t.assignment_id)} className="btn btn-primary btn-sm">
                      <Play size={16} /> Begin Cleanup (In-Progress)
                    </button>
                  )}

                  {t.assignment_status === 'IN_PROGRESS' && (
                    <button onClick={() => handleOpenCompleteModal(t)} className="btn btn-primary btn-sm" style={{ background: '#16a34a' }}>
                      <CheckCircle2 size={16} /> Complete &amp; Upload Proof
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Completion Modal */}
      {selectedTaskForCompletion && (
        <div className="modal-backdrop" onClick={() => setSelectedTaskForCompletion(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--slate-900)' }}>
                Verify Cleanup &bull; Ticket #{selectedTaskForCompletion.ticket_code}
              </span>
              <button onClick={() => setSelectedTaskForCompletion(null)} className="btn btn-secondary btn-icon" style={{ padding: '0.35rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit}>
              <div className="modal-body">
                {modalError && (
                  <div className="alert-box alert-error">
                    <AlertTriangle size={18} />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* Photo Dropzone */}
                <div className="form-group">
                  <label className="form-label">
                    Resolution Photographic Proof ("After" Photo) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProofChange}
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                  />

                  {!proofPreview ? (
                    <div onClick={() => fileInputRef.current?.click()} className="dropzone-container" style={{ padding: '1.75rem' }}>
                      <Camera size={24} color="var(--primary)" style={{ margin: '0 auto 0.5rem auto' }} />
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                        Take / Upload After-Cleanup Photo
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Shows cleaned and sanitized site</span>
                    </div>
                  ) : (
                    <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '2px solid var(--primary-500)' }}>
                      <img src={proofPreview} alt="Proof preview" style={{ width: '100%', maxHeight: '240px', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => {
                          setProofImage(null);
                          setProofPreview(null);
                        }}
                        style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Waste Weight */}
                <div className="form-group">
                  <label className="form-label" htmlFor="weight">
                    Collected Waste Weight (kg)
                  </label>
                  <input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0.1"
                    className="input-field"
                    placeholder="e.g. 4.5"
                    value={wasteWeightKg}
                    onChange={(e) => setWasteWeightKg(e.target.value)}
                  />
                  <span className="form-hint">Used for campus landfill diversion auditing</span>
                </div>

                {/* Destination */}
                <div className="form-group">
                  <label className="form-label">Disposal Destination Facility</label>
                  <select
                    className="select-field"
                    value={disposalDestination}
                    onChange={(e) => setDisposalDestination(e.target.value)}
                  >
                    <option value="Campus Paper Recycling Unit">Campus Paper Recycling Unit</option>
                    <option value="Organic Compost Pit">Organic Compost Pit</option>
                    <option value="E-Waste Storage Facility">E-Waste Storage Facility</option>
                    <option value="Campus Main Dumpster">Campus Main Dumpster</option>
                  </select>
                </div>

                {/* Remarks */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="remarks">Cleaning Remarks</label>
                  <textarea
                    id="remarks"
                    className="textarea-field"
                    rows={2}
                    placeholder="e.g. Cleared all cartons, swept floor, and disinfected bin area."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setSelectedTaskForCompletion(null)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={completing}>
                  {completing ? 'Transmitting Resolution Proof...' : 'Verify & Complete Task'}
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

export default StaffDashboard;
