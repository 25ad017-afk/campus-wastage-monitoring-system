import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { adminService } from '../../services/adminService';
import { getAssetUrl } from '../../services/api';
import StatusBadge from '../common/StatusBadge';
import {
  MapPin,
  Filter,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PlayCircle,
  Tag,
  Building,
  Maximize2,
  RefreshCw,
  Eye,
  Info,
  Calendar,
  Zap,
  Search,
  X,
  Compass,
  Check,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const CampusMap = ({ embedded = false }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const markersMapRef = useRef(new Map());

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [photoModalUrl, setPhotoModalUrl] = useState(null);
  const [locationSearch, setLocationSearch] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Fetch reports from API
  const fetchMapReports = async () => {
    try {
      setLoading(true);
      const res = await adminService.getReports();
      if (res.data) {
        const rawReports = res.data.reports || res.data || [];
        setReports(rawReports);
      }
    } catch (err) {
      console.error('Failed to load reports for map:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapReports();
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Campus center (Bangalore collegiate coordinates from campus database)
      const initialCenter = [12.9712, 77.5942];
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 16,
        minZoom: 14,
        maxZoom: 19,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Campus Wastage Monitoring System',
        maxZoom: 19
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Filter reports
  const filteredReports = reports.filter((r) => {
    // Only map reports with valid geographic coordinates from locations table
    const hasCoords = r.latitude != null && r.longitude != null;
    if (!hasCoords) return false;

    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'PENDING') {
      matchesStatus = ['REPORTED', 'ASSIGNED'].includes(r.status);
    } else if (statusFilter === 'IN_PROGRESS') {
      matchesStatus = r.status === 'IN_PROGRESS';
    } else if (statusFilter === 'RESOLVED') {
      matchesStatus = r.status === 'RESOLVED';
    }

    // Priority filter
    const matchesPriority = priorityFilter === 'ALL' || r.priority === priorityFilter;

    // Waste Type (Category) filter
    const matchesCategory = categoryFilter === 'ALL' || String(r.category_name) === categoryFilter;

    return matchesStatus && matchesPriority && matchesCategory;
  });

  // Calculate distinct categories from database reports
  const distinctCategories = Array.from(
    new Set(reports.map((r) => r.category_name).filter(Boolean))
  ).sort();

  // Location-wise aggregation from reports
  const locationStats = reports.reduce((acc, r) => {
    const locName = r.building_name || 'General Campus';
    if (!acc[locName]) {
      acc[locName] = {
        name: locName,
        zone: r.zone_name || 'Campus Core',
        landmark: r.floor_or_landmark || '',
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        lat: parseFloat(r.latitude),
        lng: parseFloat(r.longitude)
      };
    }
    acc[locName].total += 1;
    if (['REPORTED', 'ASSIGNED'].includes(r.status)) acc[locName].pending += 1;
    if (r.status === 'IN_PROGRESS') acc[locName].inProgress += 1;
    if (r.status === 'RESOLVED') acc[locName].resolved += 1;
    return acc;
  }, {});

  const locationStatsList = Object.values(locationStats)
    .filter((loc) => loc.name.toLowerCase().includes(locationSearch.toLowerCase()) || loc.zone.toLowerCase().includes(locationSearch.toLowerCase()))
    .sort((a, b) => b.total - a.total);

  // Overall counts
  const totalPins = reports.filter((r) => r.latitude != null && r.longitude != null).length;
  const pendingPins = reports.filter((r) => ['REPORTED', 'ASSIGNED'].includes(r.status)).length;
  const inProgressPins = reports.filter((r) => r.status === 'IN_PROGRESS').length;
  const resolvedPins = reports.filter((r) => r.status === 'RESOLVED').length;

  // Render Markers on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();
    markersMapRef.current.clear();

    const bounds = [];

    filteredReports.forEach((report) => {
      const lat = parseFloat(report.latitude);
      const lng = parseFloat(report.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      bounds.push([lat, lng]);

      // Determine marker color and icon based on status
      let pinColor = '#d97706'; // Amber for Pending (REPORTED / ASSIGNED)
      let pinIconSymbol = '⏳';
      let statusLabel = 'PENDING';
      let statusBadgeBg = '#fef3c7';
      let statusBadgeColor = '#92400e';

      if (report.status === 'IN_PROGRESS') {
        pinColor = '#2563eb'; // Blue for In-Progress
        pinIconSymbol = '⚡';
        statusLabel = 'IN-PROGRESS';
        statusBadgeBg = '#dbeafe';
        statusBadgeColor = '#1e40af';
      } else if (report.status === 'RESOLVED') {
        pinColor = '#059669'; // Emerald for Completed
        pinIconSymbol = '✓';
        statusLabel = 'COMPLETED';
        statusBadgeBg = '#dcfce7';
        statusBadgeColor = '#166534';
      }

      const isCritical = ['CRITICAL', 'HIGH'].includes(report.priority) && report.status !== 'RESOLVED';
      const formattedDate = new Date(report.created_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const priorityBadgeBg =
        report.priority === 'CRITICAL'
          ? '#fee2e2'
          : report.priority === 'HIGH'
          ? '#ffedd5'
          : '#fef3c7';
      const priorityBadgeColor =
        report.priority === 'CRITICAL'
          ? '#991b1b'
          : report.priority === 'HIGH'
          ? '#9a3412'
          : '#92400e';

      // Custom HTML Pin Icon
      const iconHtml = `
        <div class="cwms-marker-pin" style="
          position: relative;
          width: 38px;
          height: 38px;
          background: ${pinColor};
          border: 3px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <div style="
            transform: rotate(45deg);
            color: #ffffff;
            font-size: 13px;
            font-weight: 900;
          ">${pinIconSymbol}</div>
          ${
            isCritical
              ? `<span class="map-pulse-ring" style="
                  position: absolute;
                  top: -6px;
                  right: -6px;
                  width: 14px;
                  height: 14px;
                  background: #ef4444;
                  border: 2px solid #ffffff;
                  border-radius: 50%;
                "></span>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        className: `cwms-pin-${report.status.toLowerCase()}`,
        html: iconHtml,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Click listener: Select report in detail inspector & open popup
      marker.on('click', () => {
        setSelectedReport(report);
      });

      // Comprehensive Leaflet Popup Displaying All 5 Required Fields
      const popupHtml = `
        <div style="font-family: inherit; width: 230px; padding: 12px; box-sizing: border-box;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
            <span style="font-weight: 800; font-size: 13px; color: #0f172a;">${report.ticket_code}</span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 9999px; background: ${statusBadgeBg}; color: ${statusBadgeColor};">
              ${statusLabel}
            </span>
          </div>

          ${
            report.before_image
              ? `<div style="margin-bottom: 8px; border-radius: 6px; overflow: hidden; height: 85px; background: #f1f5f9;">
                  <img src="${getAssetUrl(report.before_image)}" style="width: 100%; height: 100%; object-fit: cover;" alt="Report site photo" />
                </div>`
              : ''
          }

          <div style="display: flex; flex-direction: column; gap: 5px; font-size: 12px;">
            <div>
              <strong style="color: #475569;">🏷️ Waste Type:</strong>
              <span style="font-weight: 700; color: #059669; margin-left: 4px;">${report.category_name || 'General Waste'}</span>
            </div>

            <div>
              <strong style="color: #475569;">📍 Location:</strong>
              <div style="font-weight: 600; color: #0f172a; margin-top: 1px;">${report.building_name}</div>
              <div style="font-size: 11px; color: #64748b;">${report.floor_or_landmark} (${report.zone_name})</div>
            </div>

            <div>
              <strong style="color: #475569;">📅 Report Date:</strong>
              <div style="font-size: 11px; color: #0f172a; font-weight: 600;">${formattedDate}</div>
            </div>

            <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px; padding-top: 4px; border-top: 1px solid #f1f5f9;">
              <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${priorityBadgeBg}; color: ${priorityBadgeColor};">
                ⚡ ${report.priority} Priority
              </span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280 });
      layer.addLayer(marker);
      markersMapRef.current.set(report.report_id, marker);
    });

    // Auto-fit bounds if markers exist
    if (bounds.length > 0 && !selectedReport) {
      try {
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
      } catch (e) {
        // bounds fallback
      }
    }
  }, [filteredReports]);

  // Pan to specific landmark
  const handlePanToLandmark = (loc) => {
    if (!mapInstanceRef.current || !loc.lat || !loc.lng) return;
    mapInstanceRef.current.setView([loc.lat, loc.lng], 18, { animate: true });

    // Find first report matching this landmark and open popup
    const matchingReport = filteredReports.find((r) => r.building_name === loc.name);
    if (matchingReport) {
      setSelectedReport(matchingReport);
      const marker = markersMapRef.current.get(matchingReport.report_id);
      if (marker) {
        marker.openPopup();
      }
    }
  };

  // Reset to full campus view
  const handleResetCampusView = () => {
    if (!mapInstanceRef.current) return;
    const initialCenter = [12.9712, 77.5942];
    mapInstanceRef.current.setView(initialCenter, 16, { animate: true });
    setSelectedReport(null);
  };

  // Clear all filters
  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setCategoryFilter('ALL');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Feature Section Header */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Compass size={22} color="var(--primary-light)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Campus Waste Location Monitoring
              </h2>
              <span
                style={{
                  background: 'rgba(5, 150, 105, 0.25)',
                  color: '#34d399',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  letterSpacing: '0.04em'
                }}
              >
                LIVE GIS TELEMETRY
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-400)', margin: 0 }}>
              Real-time geospatial tracking of waste incidents, clearance hotspots, and sanitation zone coverage across campus.
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--slate-400)', display: 'block', textTransform: 'uppercase' }}>Total Mapped</span>
              <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>{totalPins}</strong>
            </div>
            <div style={{ background: 'rgba(217, 119, 6, 0.15)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(217, 119, 6, 0.3)' }}>
              <span style={{ fontSize: '0.7rem', color: '#fcd34d', display: 'block', textTransform: 'uppercase' }}>Pending</span>
              <strong style={{ fontSize: '1.05rem', color: '#fbbf24' }}>{pendingPins}</strong>
            </div>
            <div style={{ background: 'rgba(37, 99, 235, 0.15)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
              <span style={{ fontSize: '0.7rem', color: '#93c5fd', display: 'block', textTransform: 'uppercase' }}>In-Progress</span>
              <strong style={{ fontSize: '1.05rem', color: '#60a5fa' }}>{inProgressPins}</strong>
            </div>
            <div style={{ background: 'rgba(5, 150, 105, 0.15)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(5, 150, 105, 0.3)' }}>
              <span style={{ fontSize: '0.7rem', color: '#6ee7b7', display: 'block', textTransform: 'uppercase' }}>Completed</span>
              <strong style={{ fontSize: '1.05rem', color: '#34d399' }}>{resolvedPins}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: '0.9rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)' }}>
            <Filter size={16} color="var(--primary)" />
            <span>Filters:</span>
          </div>

          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {[
              { label: 'All Statuses', val: 'ALL' },
              { label: '⏳ Pending', val: 'PENDING' },
              { label: '⚡ In-Progress', val: 'IN_PROGRESS' },
              { label: '✓ Completed', val: 'RESOLVED' }
            ].map((st) => (
              <button
                key={st.val}
                onClick={() => setStatusFilter(st.val)}
                className="btn btn-sm"
                style={{
                  background: statusFilter === st.val ? 'var(--primary)' : 'var(--bg-subtle)',
                  color: statusFilter === st.val ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '0.78rem',
                  padding: '0.3rem 0.65rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-full)'
                }}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Priority Filter */}
          <select
            className="select-field"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', width: 'auto', minWidth: '125px' }}
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">🔴 Critical</option>
            <option value="HIGH">🟠 High</option>
            <option value="MEDIUM">🟡 Medium</option>
            <option value="LOW">🟢 Low</option>
          </select>

          {/* Waste Type Filter */}
          <select
            className="select-field"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', width: 'auto', minWidth: '145px' }}
          >
            <option value="ALL">All Waste Types</option>
            {distinctCategories.map((c) => (
              <option key={c} value={c}>🏷️ {c}</option>
            ))}
          </select>

          {(statusFilter !== 'ALL' || priorityFilter !== 'ALL' || categoryFilter !== 'ALL') && (
            <button
              onClick={handleResetFilters}
              className="btn btn-secondary btn-sm"
              title="Reset all filters"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
            >
              <X size={14} /> Clear
            </button>
          )}

          <button
            onClick={fetchMapReports}
            className="btn btn-secondary btn-sm"
            title="Refresh database coordinates"
            style={{ padding: '0.35rem 0.65rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Map & Location Sidebar Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)',
          gap: '1.25rem',
          alignItems: 'start'
        }}
      >
        {/* Left Column: Interactive GIS Campus Map */}
        <div
          className="card"
          style={{
            padding: 0,
            overflow: 'hidden',
            position: 'relative',
            height: embedded ? '520px' : '620px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-color)'
          }}
        >
          {/* Leaflet DOM container */}
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

          {/* Map Top Floating Bar: Active Pins Count & Reset View */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 500,
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}
          >
            <span
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                color: '#ffffff',
                backdropFilter: 'blur(8px)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              📍 Showing {filteredReports.length} of {totalPins} Incidents
            </span>
            <button
              onClick={handleResetCampusView}
              className="btn btn-secondary btn-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                boxShadow: 'var(--shadow-sm)'
              }}
              title="Recenter campus map"
            >
              <Maximize2 size={13} /> Recenter
            </button>
          </div>

          {/* Map Legend Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
              fontSize: '0.78rem',
              fontWeight: 700,
              zIndex: 500,
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#d97706' }} />
              <span>Pending</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb' }} />
              <span>In-Progress</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#059669' }} />
              <span>Completed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
              <span>Critical Urgency</span>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Marker Inspector & Location-Wise Waste Count */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Selected Marker Detail Card */}
          {selectedReport ? (
            <div
              className="card animate-fade-in"
              style={{
                padding: '1.25rem',
                border: '2px solid var(--primary)',
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Selected Waste Report
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0.2rem 0', color: 'var(--text-main)' }}>
                    {selectedReport.ticket_code}
                  </h3>
                </div>
                <StatusBadge status={selectedReport.status} />
              </div>

              {selectedReport.before_image && (
                <div
                  style={{
                    position: 'relative',
                    marginBottom: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  onClick={() => setPhotoModalUrl(getAssetUrl(selectedReport.before_image))}
                  title="Click to zoom image"
                >
                  <img
                    src={getAssetUrl(selectedReport.before_image)}
                    alt="Waste site condition"
                    style={{ width: '100%', height: '130px', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      background: 'rgba(15, 23, 42, 0.75)',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Eye size={12} /> Inspect Photo
                  </div>
                </div>
              )}

              {/* Attributes Grid: All 5 Explicitly Required Fields */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                  background: 'var(--bg-subtle)',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '0.85rem',
                  fontSize: '0.84rem'
                }}
              >
                <div>
                  <strong style={{ color: 'var(--text-muted)' }}>🏷️ Waste Type:</strong>{' '}
                  <span style={{ color: selectedReport.color_code || 'var(--primary)', fontWeight: 800 }}>
                    {selectedReport.category_name}
                  </span>
                </div>

                <div>
                  <strong style={{ color: 'var(--text-muted)' }}>📍 Location:</strong>{' '}
                  <span style={{ fontWeight: 700 }}>{selectedReport.building_name}</span>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginLeft: '1.25rem' }}>
                    {selectedReport.floor_or_landmark} &bull; Zone: {selectedReport.zone_name}
                  </div>
                </div>

                <div>
                  <strong style={{ color: 'var(--text-muted)' }}>📅 Report Date:</strong>{' '}
                  <span>{new Date(selectedReport.created_at).toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ color: 'var(--text-muted)' }}>⚡ Priority:</strong>
                  <span
                    className="prio-badge"
                    style={{
                      background:
                        selectedReport.priority === 'CRITICAL'
                          ? '#fee2e2'
                          : selectedReport.priority === 'HIGH'
                          ? '#ffedd5'
                          : '#fef3c7',
                      color:
                        selectedReport.priority === 'CRITICAL'
                          ? '#991b1b'
                          : selectedReport.priority === 'HIGH'
                          ? '#9a3412'
                          : '#92400e',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 800,
                      fontSize: '0.74rem'
                    }}
                  >
                    {selectedReport.priority}
                  </span>
                </div>

                <div>
                  <strong style={{ color: 'var(--text-muted)' }}>📊 Status:</strong>{' '}
                  <span style={{ fontWeight: 700 }}>{selectedReport.status}</span>
                </div>

                {selectedReport.reporter_name && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.35rem', marginTop: '0.2rem' }}>
                    <strong style={{ color: 'var(--text-muted)' }}>👤 Reporter:</strong>{' '}
                    <span>{selectedReport.reporter_name}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  Close Card
                </button>
                <Link
                  to="/admin/reports"
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}
                >
                  Manage Incident &rarr;
                </Link>
              </div>
            </div>
          ) : (
            /* Interactive Help Box when no marker is selected */
            <div
              className="card"
              style={{
                padding: '1.25rem',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                border: '1px solid var(--primary-border)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem'
              }}
            >
              <Info size={28} color="var(--primary)" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--primary-dark)', display: 'block', marginBottom: '0.15rem' }}>
                  Interactive Pin Inspection
                </strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Click on any marker on the map to view full incident details (Waste Type, Location, Timestamp, Priority, and Status) or click any location below to auto-zoom.
                </div>
              </div>
            </div>
          )}

          {/* Location-Wise Waste Count Roster */}
          <div
            className="card"
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, fontSize: '0.95rem' }}>
                <Building size={18} color="var(--primary)" />
                <span>Location-Wise Waste Count</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {locationStatsList.length} Campus Sites
              </span>
            </div>

            {/* Quick search input */}
            <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--slate-400)' }} />
              <input
                type="text"
                placeholder="Search campus building or zone..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="input-field"
                style={{ padding: '0.4rem 0.65rem 0.4rem 2rem', fontSize: '0.8rem', borderRadius: 'var(--radius-md)' }}
              />
            </div>

            {/* Location List Scrollable Container */}
            <div
              className="custom-scrollbar"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                maxHeight: selectedReport ? '260px' : '380px',
                overflowY: 'auto',
                paddingRight: '4px'
              }}
            >
              {locationStatsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--slate-400)', fontSize: '0.85rem' }}>
                  No campus buildings match your search.
                </div>
              ) : (
                locationStatsList.map((loc) => (
                  <div
                    key={loc.name}
                    onClick={() => handlePanToLandmark(loc)}
                    style={{
                      padding: '0.75rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.background = 'var(--bg-subtle)';
                    }}
                    title="Click to pan and zoom map to this building"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-main)' }}>
                        {loc.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          background: loc.pending > 0 ? '#fee2e2' : '#dcfce7',
                          color: loc.pending > 0 ? '#b91c1c' : '#15803d',
                          padding: '0.15rem 0.55rem',
                          borderRadius: 'var(--radius-full)'
                        }}
                      >
                        {loc.total} Report{loc.total === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      <span>Zone: {loc.zone}</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {loc.pending > 0 && <span style={{ color: '#d97706', fontWeight: 700 }}>⏳ {loc.pending} Pending</span>}
                        {loc.inProgress > 0 && <span style={{ color: '#2563eb', fontWeight: 700 }}>⚡ {loc.inProgress} In-Prog</span>}
                        {loc.resolved > 0 && <span style={{ color: '#059669', fontWeight: 700 }}>✓ {loc.resolved} Done</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Zoom Modal */}
      {photoModalUrl && (
        <div
          className="modal-overlay"
          onClick={() => setPhotoModalUrl(null)}
          style={{ zIndex: 10000 }}
        >
          <div
            className="modal-card animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '650px', padding: '1.25rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Incident Site Photo Evidence</h3>
              <button
                onClick={() => setPhotoModalUrl(null)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.25rem 0.5rem' }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ maxHeight: '70vh', overflow: 'hidden', borderRadius: 'var(--radius-md)', background: '#000000' }}>
              <img
                src={photoModalUrl}
                alt="Enlarged waste site"
                style={{ width: '100%', height: 'auto', maxHeight: '70vh', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampusMap;
