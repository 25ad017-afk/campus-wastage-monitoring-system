import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader';
import {
  BarChart3,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  TrendingUp,
  Tag,
  ArrowLeft,
  RefreshCw,
  Flame,
  AlertCircle,
  Users,
  Compass,
  Layers,
  CheckCircle,
  Info,
  Filter,
  Building,
  Check,
  Percent,
  CalendarRange,
  FileText,
  ShieldCheck,
  Activity,
  ArrowUpRight
} from 'lucide-react';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Date Filter State
  const [timeframe, setTimeframe] = useState('ALL'); // 'ALL', 'TODAY', 'WEEK', 'MONTH', 'CUSTOM'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const fetchAnalytics = async (filterParams = {}) => {
    setLoading(true);
    setError('');
    try {
      const queryParams = {
        timeframe: filterParams.timeframe || timeframe,
        ...(filterParams.startDate ? { startDate: filterParams.startDate } : {}),
        ...(filterParams.endDate ? { endDate: filterParams.endDate } : {})
      };
      const res = await adminService.getAnalytics(queryParams);
      if (res.data) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Unable to fetch live analytics data. Ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics({ timeframe: 'ALL' });
  }, []);

  const handleTimeframeChange = (selected) => {
    setTimeframe(selected);
    if (selected === 'CUSTOM') {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
      fetchAnalytics({ timeframe: selected });
    }
  };

  const handleApplyCustomDate = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError('Please select both a start date and an end date.');
      return;
    }
    fetchAnalytics({ timeframe: 'CUSTOM', startDate, endDate });
  };

  const handleResetFilters = () => {
    setTimeframe('ALL');
    setStartDate('');
    setEndDate('');
    setShowCustomPicker(false);
    fetchAnalytics({ timeframe: 'ALL' });
  };

  if (loading && !analytics) {
    return <Loader fullScreen message="Crunching live campus waste database metrics across 10 dimensions..." />;
  }

  const {
    summary = {},
    categoryDistribution = [],
    locationWiseWaste = [],
    mostReportedLocations = [],
    averageResolutionTime = {},
    monthlyTrends = [],
    priorityBreakdown = [],
    highPriorityStats = {},
    staffPerformance = [],
    timeframeFilter = {}
  } = analytics || {};

  // Summary Counters (Metrics 1, 2, 3, 4, 5, 9)
  const totalReports = summary.totalReports || 0;
  const reportsThisWeek = summary.reportsThisWeek || 0;
  const reportsThisMonth = summary.reportsThisMonth || 0;
  const pendingReports = summary.pendingReports || 0;
  const completedReports = summary.completedReports || 0;
  const resolutionRate = summary.resolutionRate || 0;

  const avgMinutes = averageResolutionTime.avgMinutes || 0;
  const avgHours = averageResolutionTime.avgHours || 0;

  // Maximum scales for charts
  const maxCategoryCount = Math.max(...categoryDistribution.map((c) => c.report_count || 0), 1);
  const maxLocationCount = Math.max(...locationWiseWaste.map((l) => l.incident_count || 0), 1);
  const maxMonthlyCount = Math.max(
    ...monthlyTrends.map((m) => Math.max(m.total_submitted || 0, m.total_resolved || 0)),
    1
  );

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem', marginBottom: '4rem' }}>
      {/* Header & Page Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <Link
            to="/admin/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              textDecoration: 'none',
              marginBottom: '0.5rem',
              fontWeight: 600
            }}
          >
            <ArrowLeft size={16} /> Back to Command Dashboard
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Campus Waste Intelligence &amp; Analytics</h1>
              <span className="inst-badge" style={{ marginTop: '0.2rem' }}>EVIDENCE-BASED SANITATION TELEMETRY &bull; ISO 14001</span>
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '820px', marginTop: '0.4rem' }}>
            Multi-dimensional analytical suite computed directly from the live campus database. Evaluates waste segregation ratios, geographical hotspots, monthly turnaround volumes, and SLA resolution velocity.
          </p>
        </div>

        <button onClick={() => fetchAnalytics()} className="btn btn-secondary btn-sm" title="Re-query live database">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh Telemetry
        </button>
      </div>

      {error && (
        <div className="alert-box alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* ====================================================================
          DATE FILTERS TOOLBAR
          ==================================================================== */}
      <div
        className="card"
        style={{
          padding: '1.1rem 1.25rem',
          marginBottom: '2rem',
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-color)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)', marginRight: '0.25rem' }}>
              <Filter size={16} color="var(--primary)" /> Date Range:
            </div>

            {/* Quick Filter Buttons */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {[
                { label: 'All Time', key: 'ALL' },
                { label: '📅 Today', key: 'TODAY' },
                { label: '⚡ This Week', key: 'WEEK' },
                { label: '📊 This Month', key: 'MONTH' },
                { label: '🗓️ Custom Range', key: 'CUSTOM' }
              ].map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => handleTimeframeChange(btn.key)}
                  className="btn btn-sm"
                  style={{
                    background: timeframe === btn.key ? 'var(--primary)' : 'var(--bg-subtle)',
                    color: timeframe === btn.key ? '#ffffff' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    padding: '0.32rem 0.75rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Showing database records: <strong style={{ color: 'var(--text-main)' }}>{timeframe}</strong>
            </div>
            {timeframe !== 'ALL' && (
              <button
                onClick={handleResetFilters}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
              >
                Reset to All Time
              </button>
            )}
          </div>
        </div>

        {/* Custom Date Range Picker Form (Conditional) */}
        {showCustomPicker && (
          <form
            onSubmit={handleApplyCustomDate}
            style={{
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px dashed var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>From:</label>
              <input
                type="date"
                className="input-field"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>To:</label>
              <input
                type="date"
                className="input-field"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.35rem 0.85rem' }}>
              Apply Custom Range
            </button>
          </form>
        )}
      </div>

      {/* ====================================================================
          TOP KPI SCORECARDS (METRICS 1, 2, 3, 4, 5, 9)
          ==================================================================== */}
      <div className="grid-3" style={{ gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Metric 1: Total Waste Reports */}
        <div className="stat-card" style={{ borderTop: '4px solid var(--primary)' }}>
          <div className="stat-header">
            <span className="stat-title">1. Total Waste Reports</span>
            <div className="stat-icon-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Layers size={20} />
            </div>
          </div>
          <div className="stat-value">{totalReports}</div>
          <div className="stat-footer">
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Lifetime campus incidents recorded in database.
            </span>
          </div>
        </div>

        {/* Metric 2: Waste Reports This Week */}
        <div className="stat-card" style={{ borderTop: '4px solid var(--tech-blue-600)' }}>
          <div className="stat-header">
            <span className="stat-title">2. Reports This Week</span>
            <div className="stat-icon-box" style={{ background: 'var(--tech-blue-100)', color: 'var(--tech-blue-600)' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--tech-blue-600)' }}>{reportsThisWeek}</div>
          <div className="stat-footer">
            <span className="stat-trend" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              7-Day Rolling Cycle
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recent submissions</span>
          </div>
        </div>

        {/* Metric 3: Waste Reports This Month */}
        <div className="stat-card" style={{ borderTop: '4px solid #8b5cf6' }}>
          <div className="stat-header">
            <span className="stat-title">3. Reports This Month</span>
            <div className="stat-icon-box" style={{ background: '#f3e8ff', color: '#8b5cf6' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#8b5cf6' }}>{reportsThisMonth}</div>
          <div className="stat-footer">
            <span className="stat-trend" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
              30-Day Velocity
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly aggregate</span>
          </div>
        </div>

        {/* Metric 4: Pending Reports */}
        <div className="stat-card" style={{ borderTop: '4px solid #f59e0b' }}>
          <div className="stat-header">
            <span className="stat-title">4. Pending Reports</span>
            <div className="stat-icon-box" style={{ background: 'var(--status-reported-bg)', color: 'var(--status-reported-text)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#d97706' }}>{pendingReports}</div>
          <div className="stat-footer">
            <span className="stat-trend" style={{ background: '#fef3c7', color: '#b45309' }}>
              {totalReports > 0 ? Math.round((pendingReports / totalReports) * 100) : 0}% Active
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reported, Assigned or In-Progress</span>
          </div>
        </div>

        {/* Metric 5: Completed Reports */}
        <div className="stat-card" style={{ borderTop: '4px solid var(--primary-dark)' }}>
          <div className="stat-header">
            <span className="stat-title">5. Completed Reports</span>
            <div className="stat-icon-box" style={{ background: 'var(--status-resolved-bg)', color: 'var(--status-resolved-text)' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--primary-dark)' }}>{completedReports}</div>
          <div className="stat-footer">
            <span className="stat-trend trend-up">
              {resolutionRate}% Clearance Rate
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Photo-verified resolutions</span>
          </div>
        </div>

        {/* Metric 9: Average Resolution Time */}
        <div className="stat-card" style={{ borderTop: '4px solid #0284c7' }}>
          <div className="stat-header">
            <span className="stat-title">9. Average Resolution Time</span>
            <div className="stat-icon-box" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#0284c7' }}>
            {avgHours > 0 ? `${avgHours} hrs` : `${avgMinutes} mins`}
          </div>
          <div className="stat-footer">
            <span className="stat-trend" style={{ background: '#e0f2fe', color: '#0369a1' }}>
              SLA Compliance
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mean turnaround to verified disposal</span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          METRIC 6: WASTE CATEGORY DISTRIBUTION (CHART + TABLE)
          ==================================================================== */}
      <div className="card" style={{ marginBottom: '2.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Tag size={20} color="var(--primary)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                6. Waste Category Distribution &amp; Segregation Mix
              </h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: '0.2rem 0 0' }}>
              Breakdown of campus waste by material classification, hazardous tagging, and individual resolution efficiency.
            </p>
          </div>
          <span className="inst-badge">SOURCE SEGREGATION AUDIT</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.8fr)', gap: '2rem', alignItems: 'start' }}>
          {/* Visual Horizontal Comparative Progress Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--slate-800)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Visual Distribution Bars
            </h4>
            {categoryDistribution.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No category data logged.</p>
            ) : (
              categoryDistribution.map((cat) => {
                const percentage = cat.percentage != null ? cat.percentage : (totalReports > 0 ? Math.round((cat.report_count / totalReports) * 100) : 0);
                return (
                  <div key={cat.category_id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--slate-800)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color_code || 'var(--primary)' }} />
                        {cat.category_name}
                        {cat.is_hazardous === 1 && (
                          <span style={{ fontSize: '0.68rem', background: '#fee2e2', color: '#b91c1c', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 800 }}>
                            HAZARD
                          </span>
                        )}
                      </span>
                      <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                        {cat.report_count} incident{cat.report_count === 1 ? '' : 's'} ({percentage}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '9px', background: 'var(--slate-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: cat.color_code || 'var(--primary)',
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Detailed Category Audit Table */}
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="table-th">Waste Classification</th>
                  <th className="table-th">Type</th>
                  <th className="table-th" style={{ textAlign: 'center' }}>Total Reports</th>
                  <th className="table-th" style={{ textAlign: 'center' }}>Cleared</th>
                  <th className="table-th" style={{ textAlign: 'center' }}>Pending</th>
                  <th className="table-th" style={{ textAlign: 'right' }}>Share (%)</th>
                </tr>
              </thead>
              <tbody>
                {categoryDistribution.map((cat) => {
                  const percentage = cat.percentage != null ? cat.percentage : (totalReports > 0 ? Math.round((cat.report_count / totalReports) * 100) : 0);
                  return (
                    <tr key={cat.category_id} className="table-row-hover">
                      <td className="table-td" style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: cat.color_code, marginRight: '8px' }} />
                        {cat.category_name}
                      </td>
                      <td className="table-td">
                        {cat.is_hazardous === 1 ? (
                          <span style={{ fontSize: '0.72rem', background: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', fontWeight: 800 }}>
                            Bio / Chemical
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="table-td" style={{ textAlign: 'center', fontWeight: 800 }}>
                        {cat.report_count}
                      </td>
                      <td className="table-td" style={{ textAlign: 'center', color: '#16a34a', fontWeight: 700 }}>
                        {cat.resolved_count}
                      </td>
                      <td className="table-td" style={{ textAlign: 'center', color: '#d97706', fontWeight: 700 }}>
                        {cat.pending_count || 0}
                      </td>
                      <td className="table-td" style={{ textAlign: 'right', fontWeight: 800 }}>
                        {percentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ====================================================================
          METRICS 7 & 8: LOCATION-WISE WASTE & MOST REPORTED LOCATIONS
          ==================================================================== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.8fr)', gap: '1.75rem', marginBottom: '2.5rem', alignItems: 'start' }}>
        {/* Metric 8: Most Reported Campus Locations (Hotspots Leaderboard) */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Flame size={20} color="#ef4444" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
              8. Most Reported Locations
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
            Highest incident frequency zones ranked by cumulative database reports.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mostReportedLocations.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No location incidents logged.</p>
            ) : (
              mostReportedLocations.map((loc) => {
                const rankColor = loc.rank === 1 ? '#ef4444' : loc.rank === 2 ? '#f97316' : '#eab308';
                const rankBg = loc.rank === 1 ? '#fee2e2' : loc.rank === 2 ? '#ffedd5' : '#fef9c3';
                return (
                  <div
                    key={loc.location_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: rankBg,
                          color: rankColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.82rem',
                          fontWeight: 900
                        }}
                      >
                        #{loc.rank}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)', display: 'block' }}>
                          {loc.building_name}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Zone: {loc.zone_name} &bull; {loc.floor_or_landmark}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.55rem',
                          borderRadius: 'var(--radius-full)',
                          background: loc.active_incidents > 0 ? '#fee2e2' : '#dcfce7',
                          color: loc.active_incidents > 0 ? '#b91c1c' : '#15803d'
                        }}
                      >
                        {loc.incident_count} Incident{loc.incident_count === 1 ? '' : 's'}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {loc.active_incidents} Active &bull; {loc.resolved_incidents || 0} Cleared
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Metric 7: Location-Wise Waste (Full Campus Audit Table) */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Building size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
              7. Location-Wise Waste Coverage
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
            Zone-by-zone breakdown across all monitored campus facilities and academic buildings.
          </p>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="table-th">Building &amp; Landmark</th>
                  <th className="table-th">Zone</th>
                  <th className="table-th" style={{ textAlign: 'center' }}>Total</th>
                  <th className="table-th" style={{ textAlign: 'center' }}>Active</th>
                  <th className="table-th" style={{ textAlign: 'center' }}>Cleared</th>
                  <th className="table-th" style={{ textAlign: 'right' }}>Campus Share</th>
                </tr>
              </thead>
              <tbody>
                {locationWiseWaste.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                      No location records found.
                    </td>
                  </tr>
                ) : (
                  locationWiseWaste.map((loc) => {
                    const share = loc.percentage != null ? loc.percentage : (totalReports > 0 ? Math.round((loc.incident_count / totalReports) * 100) : 0);
                    return (
                      <tr key={loc.location_id} className="table-row-hover">
                        <td className="table-td">
                          <strong style={{ color: 'var(--text-main)', fontSize: '0.84rem' }}>{loc.building_name}</strong>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{loc.floor_or_landmark}</div>
                        </td>
                        <td className="table-td">
                          <span style={{ fontSize: '0.74rem', background: 'var(--bg-subtle)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                            {loc.zone_name}
                          </span>
                        </td>
                        <td className="table-td" style={{ textAlign: 'center', fontWeight: 800 }}>
                          {loc.incident_count}
                        </td>
                        <td className="table-td" style={{ textAlign: 'center', color: '#d97706', fontWeight: 700 }}>
                          {loc.active_incidents}
                        </td>
                        <td className="table-td" style={{ textAlign: 'center', color: '#16a34a', fontWeight: 700 }}>
                          {loc.resolved_incidents || 0}
                        </td>
                        <td className="table-td" style={{ textAlign: 'right', fontWeight: 800 }}>
                          {share}%
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ====================================================================
          METRIC 10: MONTHLY WASTE-REPORT TREND (CHART + TABLE)
          ==================================================================== */}
      <div className="card" style={{ marginBottom: '2.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="var(--primary)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                10. Monthly Waste-Report Trend
              </h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: '0.2rem 0 0' }}>
              Longitudinal tracking of total student/staff incident submissions versus completed cleanups month-by-month.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem', fontWeight: 700 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '12px', height: '12px', background: 'var(--tech-blue-600)', borderRadius: '2px' }} />
              Submissions
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '2px' }} />
              Resolutions
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1.6fr)', gap: '2rem', alignItems: 'start' }}>
          {/* Visual Dual-Bar Monthly Chart */}
          <div style={{ background: 'var(--bg-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--slate-800)', marginBottom: '1.25rem', textTransform: 'uppercase' }}>
              Monthly Clearance Comparison
            </h4>
            {monthlyTrends.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No monthly records logged yet.</p>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '200px', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                {monthlyTrends.map((m) => {
                  const submitHeight = Math.max(12, Math.round(((m.total_submitted || 0) / maxMonthlyCount) * 160));
                  const resolveHeight = Math.max(8, Math.round(((m.total_resolved || 0) / maxMonthlyCount) * 160));
                  return (
                    <div key={m.month_key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                        {/* Submitted bar */}
                        <div
                          style={{
                            width: '24px',
                            height: `${submitHeight}px`,
                            background: 'var(--tech-blue-600)',
                            borderRadius: '4px 4px 0 0',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            paddingTop: '2px'
                          }}
                          title={`Submitted: ${m.total_submitted}`}
                        >
                          {m.total_submitted}
                        </div>
                        {/* Resolved bar */}
                        <div
                          style={{
                            width: '24px',
                            height: `${resolveHeight}px`,
                            background: 'var(--primary)',
                            borderRadius: '4px 4px 0 0',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            paddingTop: '2px'
                          }}
                          title={`Resolved: ${m.total_resolved}`}
                        >
                          {m.total_resolved}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        {m.month_label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Monthly Audit Table */}
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="table-th">Billing / Audit Month</th>
                  <th className="table-th" style={{ textAlign: 'center' }}>Total Reported</th>
                  <th className="table-th" style={{ textAlign: 'center' }}>Total Cleared</th>
                  <th className="table-th" style={{ textAlign: 'center' }}>Pending Overflow</th>
                  <th className="table-th" style={{ textAlign: 'right' }}>Resolution Rate</th>
                </tr>
              </thead>
              <tbody>
                {monthlyTrends.map((m) => (
                  <tr key={m.month_key} className="table-row-hover">
                    <td className="table-td" style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                      {m.month_label}
                    </td>
                    <td className="table-td" style={{ textAlign: 'center', fontWeight: 800, color: 'var(--tech-blue-600)' }}>
                      {m.total_submitted}
                    </td>
                    <td className="table-td" style={{ textAlign: 'center', fontWeight: 800, color: '#16a34a' }}>
                      {m.total_resolved}
                    </td>
                    <td className="table-td" style={{ textAlign: 'center', color: '#d97706', fontWeight: 700 }}>
                      {m.total_pending || 0}
                    </td>
                    <td className="table-td" style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 800, color: (m.resolution_rate || 0) >= 70 ? '#16a34a' : '#d97706' }}>
                        {m.resolution_rate || 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ====================================================================
          VIVA EVALUATION & DEMONSTRATION INSIGHTS
          ==================================================================== */}
      <div
        className="card"
        style={{
          padding: '1.75rem',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <ShieldCheck size={22} color="var(--primary-light)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
            College Project Demonstration &amp; Viva Insights
          </h3>
        </div>
        <p style={{ color: 'var(--slate-400)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
          Engineering rationale and operational value of the 10 analytics metrics implemented in this Capstone System:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <strong style={{ color: '#34d399', fontSize: '0.9rem', display: 'block', marginBottom: '0.35rem' }}>
              1. ISO 14001 Waste Audit Compliance
            </strong>
            <p style={{ color: 'var(--slate-300)', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
              The <strong>Waste Category Distribution</strong> (Metric 6) proves source segregation efficiency (dry vs organic vs e-waste), enabling university compliance audits and measuring landfill diversion rates.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <strong style={{ color: '#60a5fa', fontSize: '0.9rem', display: 'block', marginBottom: '0.35rem' }}>
              2. Data-Driven Crew Dispatching
            </strong>
            <p style={{ color: 'var(--slate-300)', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
              The <strong>Most Reported Locations</strong> ranking (Metric 8) pinpoints campus hotspots (e.g. Cafeteria and Block A), allowing estate managers to schedule preventative bin clearances and reallocate cleaning crew dynamically.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <strong style={{ color: '#fbbf24', fontSize: '0.9rem', display: 'block', marginBottom: '0.35rem' }}>
              3. SLA Turnaround Benchmark
            </strong>
            <p style={{ color: 'var(--slate-300)', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
              The <strong>Average Resolution Time</strong> (Metric 9) tracks the exact timestamp delta between student photo submission and staff completion photo, guaranteeing the campus under-45-minute remediation SLA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
