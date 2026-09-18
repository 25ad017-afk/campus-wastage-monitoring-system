import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader';
import {
  HardHat,
  ArrowLeft,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Layers,
  Sparkles,
  Phone,
  Mail,
  UserCheck,
  Shield
} from 'lucide-react';

const AdminStaffPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [error, setError] = useState('');

  const fetchStaff = async () => {
    try {
      const res = await adminService.getStaffRoster();
      if (res.data) {
        setStaffList(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load cleaning staff roster:', err);
      setError('Unable to load staff roster. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = staffList.filter((s) => {
    const matchesZone = zoneFilter === 'ALL' || s.assigned_zone === zoneFilter;
    const matchesSearch =
      s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.employee_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.assigned_zone?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesZone && matchesSearch;
  });

  const distinctZones = Array.from(new Set(staffList.map((s) => s.assigned_zone).filter(Boolean)));

  const totalStaff = staffList.length;
  const availableStaff = staffList.filter((s) => s.is_available).length;
  const totalActiveTasks = staffList.reduce((acc, curr) => acc + (parseInt(curr.active_tasks, 10) || 0), 0);
  const totalCompletedTasks = staffList.reduce((acc, curr) => acc + (parseInt(curr.completed_tasks, 10) || 0), 0);

  if (loading) {
    return <Loader fullScreen message="Loading sanitation staff roster &amp; operational telemetry..." />;
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem', marginBottom: '4rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--tech-blue-700)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Shield size={16} /> Campus Facilities &bull; Sanitation Division
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--slate-900)' }}>
            Sanitation Crew Roster &amp; Workload
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
            Monitor cleaning personnel duty availability, assigned zones, and real-time task capacity.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Link to="/admin/reports" className="btn btn-primary btn-sm">
            <UserCheck size={16} /> Dispatch Incidents
          </Link>
          <Link to="/admin/dashboard" className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} /> Command Center
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert-box alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* KPI Workload Grid */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card stat-info">
          <div>
            <div className="stat-label">Sanitation Force</div>
            <div className="stat-value">{totalStaff}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>Registered personnel</div>
          </div>
          <div className="stat-icon-box" style={{ background: 'var(--tech-blue-100)', color: 'var(--tech-blue-600)' }}>
            <HardHat size={22} />
          </div>
        </div>

        <div className="stat-card stat-primary">
          <div>
            <div className="stat-label">Available on Duty</div>
            <div className="stat-value">{availableStaff}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>Ready for immediate dispatch</div>
          </div>
          <div className="stat-icon-box" style={{ background: 'var(--status-resolved-bg)', color: 'var(--status-resolved-text)' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div>
            <div className="stat-label">Active Workload</div>
            <div className="stat-value">{totalActiveTasks}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>Incidents in progress</div>
          </div>
          <div className="stat-icon-box" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card stat-primary">
          <div>
            <div className="stat-label">Total Completed</div>
            <div className="stat-value">{totalCompletedTasks}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>Cleaned &amp; photo verified</div>
          </div>
          <div className="stat-icon-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Layers size={22} />
          </div>
        </div>
      </div>

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '260px', position: 'relative' }}>
          <Search size={18} color="var(--slate-400)" style={{ position: 'absolute', left: '0.75rem' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search by name, employee code, or zone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--slate-600)' }}>Filter by Zone:</span>
          <select
            className="select-field"
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="ALL">All Campus Zones</option>
            {distinctZones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Cards Grid */}
      {filteredStaff.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <HardHat size={24} />
            </div>
            <h3 className="empty-state-title">No Staff Found</h3>
            <p className="empty-state-desc">No cleaning staff match your search query or zone filter.</p>
          </div>
        </div>
      ) : (
        <div className="grid-3">
          {filteredStaff.map((staff) => (
            <div key={staff.staff_id} className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* Staff Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--slate-100)',
                        color: 'var(--slate-700)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.9rem'
                      }}
                    >
                      {staff.full_name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                        {staff.full_name}
                      </h3>
                      <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--slate-500)', fontWeight: 600 }}>
                        {staff.employee_code}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`badge ${staff.is_available ? 'badge-resolved' : 'badge-progress'}`}
                    style={{ fontSize: '0.68rem' }}
                  >
                    <span className="badge-dot" /> {staff.is_available ? 'Available' : 'On Break'}
                  </span>
                </div>

                {/* Meta details */}
                <div style={{ fontSize: '0.84rem', color: 'var(--slate-600)', marginBottom: '1.25rem', lineHeight: 1.8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={15} color="var(--primary-600)" />
                    <span>Zone: <strong>{staff.assigned_zone || 'General Campus'}</strong></span>
                  </div>
                  {staff.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate-500)' }}>
                      <Mail size={14} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{staff.email}</span>
                    </div>
                  )}
                  {staff.phone_number && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate-500)' }}>
                      <Phone size={14} />
                      <span>{staff.phone_number}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Workload Stats Bar */}
              <div
                style={{
                  background: 'var(--slate-50)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-around',
                  textAlign: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: staff.active_tasks > 0 ? '#b45309' : 'var(--slate-800)' }}>
                    {staff.active_tasks || 0}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Active Tasks
                  </div>
                </div>

                <div style={{ borderRight: '1px solid var(--border-color)' }} />

                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                    {staff.completed_tasks || 0}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Resolved
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminStaffPage;
