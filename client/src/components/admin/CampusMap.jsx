import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Building,
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
  X,
  Compass,
  FilePlus,
  ChevronRight,
  Info,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

// ====================================================================
// OFFICIAL ACET CAMPUS MASTER LOCATIONS
// Akshaya College of Engineering and Technology
// ====================================================================
export const ACET_OFFICIAL_LOCATIONS = [
  // 1. Core Academic & Admin Blocks
  {
    id: 'main-block',
    name: 'Main Block',
    zone: 'Administrative Area',
    description: 'Central Administration, Principal Office, Reception Lobby, CoE, Board Rooms',
    category: 'ADMIN',
    icon: '🏛️',
    coords: { x: 49, y: 45 },
    color: '#065f46'
  },
  {
    id: 'a-block',
    name: 'A Block',
    zone: 'Academic Blocks',
    description: 'ECE Department, Central Library (Ground Floor), Digital Reading Room',
    category: 'ACADEMIC',
    icon: '📚',
    coords: { x: 10, y: 19 },
    color: '#0284c7'
  },
  {
    id: 'b-block',
    name: 'B Block',
    zone: 'Academic Blocks',
    description: 'CSE Department, AI & Computing Labs, Central Server Room, Data Center',
    category: 'ACADEMIC',
    icon: '💻',
    coords: { x: 24, y: 19 },
    color: '#0284c7'
  },
  {
    id: 'c-block',
    name: 'C Block',
    zone: 'Academic Blocks',
    description: 'CSE Clusters, Multimedia Labs, Smart Seminar Halls',
    category: 'ACADEMIC',
    icon: '🖥️',
    coords: { x: 37, y: 19 },
    color: '#0284c7'
  },
  {
    id: 'd-block',
    name: 'D Block',
    zone: 'Academic Blocks',
    description: 'Science & Humanities (S&H), Physics & Chemistry Labs, First Year Classes',
    category: 'ACADEMIC',
    icon: '🔬',
    coords: { x: 50, y: 19 },
    color: '#0284c7'
  },
  {
    id: 'e-block',
    name: 'E Block',
    zone: 'Academic Blocks',
    description: 'CIVIL, MECH, EEE, MECT Departments, CAD/CAM Labs, Engineering Workshop',
    category: 'ACADEMIC',
    icon: '⚙️',
    coords: { x: 64, y: 19 },
    color: '#0284c7'
  },

  // 2. Research, Innovation & Training
  {
    id: 'coe-thulir',
    name: 'Centres of Excellence',
    zone: 'Research & Innovation',
    description: 'Akshaya Thulir Pre-incubation, Startup Hub, Advanced Research Labs',
    category: 'RESEARCH',
    icon: '🚀',
    coords: { x: 79, y: 19 },
    color: '#0f172a'
  },
  {
    id: 'training-centre',
    name: 'Training Centre',
    zone: 'Placement & Skills',
    description: 'Placement & Corporate Relations Cell, Skill Development Labs, Interview Suites',
    category: 'TRAINING',
    icon: '🎯',
    coords: { x: 24, y: 34 },
    color: '#334155'
  },
  {
    id: 'workshop',
    name: 'Workshop',
    zone: 'Engineering Facilities',
    description: 'Machine Shop, Foundry, Welding, Sheet Metal & Carpentry Units',
    category: 'ENGINEERING',
    icon: '🛠️',
    coords: { x: 10, y: 34 },
    color: '#334155'
  },

  // 3. Large Halls & Amenities
  {
    id: 'auditorium',
    name: 'Auditorium',
    zone: 'Central Amenities',
    description: 'Main Campus Cultural & Conference Auditorium (1500+ Seating Capacity)',
    category: 'AMENITY',
    icon: '🎭',
    coords: { x: 92, y: 19 },
    color: '#b45309'
  },
  {
    id: 'food-court',
    name: 'Food Court & Amenities',
    zone: 'Dining & Refreshments',
    description: 'Dining Hall & Central Kitchen, Student Food Court, Refreshments, Stationery',
    category: 'DINING',
    icon: '🍽️',
    coords: { x: 85, y: 34 },
    color: '#d97706'
  },
  {
    id: 'cafeteria',
    name: 'Cafeteria',
    zone: 'Dining & Refreshments',
    description: 'Campus Cafeteria, Coffee Kiosk, Fast Bites & Evening Refreshments',
    category: 'DINING',
    icon: '☕',
    coords: { x: 44, y: 58 },
    color: '#d97706'
  },
  {
    id: 'atm',
    name: 'ATM',
    zone: 'Campus Services',
    description: '24/7 Bank ATM Counter & Banking Kiosk',
    category: 'SERVICES',
    icon: '🏧',
    coords: { x: 47, y: 60 },
    color: '#0284c7'
  },

  // 4. Student Hostels & Residential
  {
    id: 'boys-hostel',
    name: 'Boys Hostel',
    zone: 'Residential Zone',
    description: 'Boys Hostel Residential Blocks, Study Rooms, Dining Mess, Waste Segregation Bay',
    category: 'HOSTEL',
    icon: '🏢',
    coords: { x: 10, y: 74 },
    color: '#7c3aed'
  },
  {
    id: 'girls-hostel',
    name: 'Girls Hostel',
    zone: 'Residential Zone',
    description: 'Girls Hostel Secure Residential Blocks, Study Rooms, Dining Mess, Waste Bay',
    category: 'HOSTEL',
    icon: '🏢',
    coords: { x: 24, y: 74 },
    color: '#7c3aed'
  },
  {
    id: 'recreation-center',
    name: 'Recreation Center',
    zone: 'Student Life',
    description: 'Indoor Games (Table Tennis, Chess, Carrom), Student Activity Wing',
    category: 'STUDENT_LIFE',
    icon: '🎯',
    coords: { x: 10, y: 58 },
    color: '#0d9488'
  },
  {
    id: 'gym',
    name: 'Gym',
    zone: 'Fitness & Health',
    description: 'Modern Gymnasium & Fitness Wing with Separate Men & Women Sections',
    category: 'FITNESS',
    icon: '🏋️',
    coords: { x: 24, y: 58 },
    color: '#0d9488'
  },

  // 5. Sports Grounds & Outdoor Courts
  {
    id: 'playground',
    name: 'Playground',
    zone: 'Sports Complex',
    description: 'Main Athletic Track, Football Ground & General Sports Field',
    category: 'SPORTS',
    icon: '⚽',
    coords: { x: 81, y: 67 },
    color: '#15803d'
  },
  {
    id: 'basketball-court',
    name: 'Basketball Court',
    zone: 'Sports Complex',
    description: 'Outdoor Synthetic All-Weather Basketball Court with Floodlights',
    category: 'SPORTS',
    icon: '🏀',
    coords: { x: 70, y: 65 },
    color: '#c2410c'
  },
  {
    id: 'volleyball-court',
    name: 'Volleyball Court',
    zone: 'Sports Complex',
    description: 'Standard Volleyball Court',
    category: 'SPORTS',
    icon: '🏐',
    coords: { x: 77, y: 65 },
    color: '#0284c7'
  },
  {
    id: 'kabaddi-court',
    name: 'Kabaddi Court',
    zone: 'Sports Complex',
    description: 'Clay & Mat Kabaddi Court',
    category: 'SPORTS',
    icon: '🤼',
    coords: { x: 84, y: 65 },
    color: '#b45309'
  },
  {
    id: 'ball-badminton-court',
    name: 'Ball Badminton Court',
    zone: 'Sports Complex',
    description: 'Ball Badminton Court with Net Enclosures',
    category: 'SPORTS',
    icon: '🏸',
    coords: { x: 91, y: 65 },
    color: '#047857'
  },
  {
    id: 'cricket-nets',
    name: 'Cricket Nets',
    zone: 'Sports Complex',
    description: 'Cricket Practice Nets, Astro-turf Bowling Lanes & Sports Pavilion',
    category: 'SPORTS',
    icon: '🏏',
    coords: { x: 81, y: 74 },
    color: '#166534'
  },

  // 6. Infrastructure, Utilities & Entrances
  {
    id: 'temple',
    name: 'Temple',
    zone: 'Spiritual Zone',
    description: 'Campus Vinayagar Temple & Serene Prayer Area',
    category: 'SPIRITUAL',
    icon: '🛕',
    coords: { x: 37, y: 58 },
    color: '#ea580c'
  },
  {
    id: 'power-house',
    name: 'Power House',
    zone: 'Utilities & Power',
    description: 'Campus Power Substation, Backup Generators & Electrical Control Hub',
    category: 'UTILITY',
    icon: '⚡',
    coords: { x: 55, y: 58 },
    color: '#475569'
  },
  {
    id: 'transformer',
    name: 'Transformer',
    zone: 'Utilities & Power',
    description: 'High-Voltage Transformer Yard (Restricted Access Zone)',
    category: 'UTILITY',
    icon: '⚡',
    coords: { x: 59, y: 58 },
    color: '#475569'
  },
  {
    id: 'parking',
    name: 'Parking',
    zone: 'Transport & Parking',
    description: 'Designated Parking for Faculty Cars, Student Two-Wheelers, Visitors & College Buses',
    category: 'PARKING',
    icon: '🅿️',
    coords: { x: 50, y: 70 },
    color: '#334155'
  },
  {
    id: 'security-gate-1',
    name: 'Security Gate 1',
    zone: 'Campus Gates',
    description: 'Main Campus Entrance Gate, Security Guard Cabin & Visitor Pass Counter',
    category: 'GATES',
    icon: '🚪',
    coords: { x: 44, y: 90 },
    color: '#047857'
  },
  {
    id: 'security-gate-2',
    name: 'Security Gate 2',
    zone: 'Campus Gates',
    description: 'Service, Delivery & Bus Fleet Transport Gate',
    category: 'GATES',
    icon: '🚪',
    coords: { x: 56, y: 90 },
    color: '#047857'
  }
];

const ZONE_CATEGORIES = [
  { id: 'ALL', label: 'All Campus Sectors' },
  { id: 'ACADEMIC', label: 'Academic Blocks (A - E)' },
  { id: 'ADMIN', label: 'Main Admin HQ' },
  { id: 'RESEARCH', label: 'Centres of Excellence & Incubation' },
  { id: 'HOSTEL', label: 'Hostels & Residential' },
  { id: 'SPORTS', label: 'Sports Complex & Courts' },
  { id: 'DINING', label: 'Food Court & Dining' },
  { id: 'UTILITY', label: 'Utilities, Parking & Gates' }
];

const CampusMap = ({ embedded = false }) => {
  const navigate = useNavigate();
  const mapViewerRef = useRef(null);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZoneCategory, setSelectedZoneCategory] = useState('ALL');
  
  // Incident Status and Priority Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  
  // Map Interactive View Controls
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'directory'

  // Fetch real-time reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await adminService.getReports();
      if (res.data) {
        const raw = res.data.reports || res.data || [];
        setReports(raw);
      }
    } catch (err) {
      console.error('Failed to load incident reports for campus map:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  const toggleFullscreen = () => {
    if (!mapViewerRef.current) return;
    if (!document.fullscreenElement) {
      mapViewerRef.current.requestFullscreen?.().catch((err) => console.log(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch((err) => console.log(err));
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Filter reports according to status and priority
  const filteredReports = reports.filter((r) => {
    let matchesStatus = true;
    if (statusFilter === 'ACTIVE') {
      matchesStatus = ['REPORTED', 'ASSIGNED'].includes(r.status);
    } else if (statusFilter === 'IN_PROGRESS') {
      matchesStatus = r.status === 'IN_PROGRESS';
    } else if (statusFilter === 'RESOLVED') {
      matchesStatus = r.status === 'RESOLVED';
    }

    const matchesPriority = priorityFilter === 'ALL' || r.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  // Calculate incident counts per location
  const getIncidentsForLocation = (locName) => {
    const norm = locName.toLowerCase();
    return filteredReports.filter((r) => {
      const bName = (r.building_name || '').toLowerCase();
      const zName = (r.zone_name || '').toLowerCase();
      const fName = (r.floor_or_landmark || '').toLowerCase();
      return bName.includes(norm) || zName.includes(norm) || fName.includes(norm) || norm.includes(bName);
    });
  };

  // Filter locations by search and category
  const filteredLocations = ACET_OFFICIAL_LOCATIONS.filter((loc) => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedZoneCategory === 'ALL' ||
      (selectedZoneCategory === 'ACADEMIC' && loc.category === 'ACADEMIC') ||
      (selectedZoneCategory === 'ADMIN' && loc.category === 'ADMIN') ||
      (selectedZoneCategory === 'RESEARCH' && (loc.category === 'RESEARCH' || loc.category === 'TRAINING')) ||
      (selectedZoneCategory === 'HOSTEL' && (loc.category === 'HOSTEL' || loc.category === 'STUDENT_LIFE')) ||
      (selectedZoneCategory === 'SPORTS' && (loc.category === 'SPORTS' || loc.category === 'FITNESS')) ||
      (selectedZoneCategory === 'DINING' && (loc.category === 'DINING' || loc.category === 'AMENITY')) ||
      (selectedZoneCategory === 'UTILITY' && (loc.category === 'UTILITY' || loc.category === 'PARKING' || loc.category === 'GATES' || loc.category === 'SPIRITUAL' || loc.category === 'SERVICES'));

    return matchesSearch && matchesCategory;
  });

  // Total summary metrics
  const totalReportsCount = reports.length;
  const activeReportsCount = reports.filter((r) => ['REPORTED', 'ASSIGNED'].includes(r.status)).length;
  const inProgressReportsCount = reports.filter((r) => r.status === 'IN_PROGRESS').length;
  const resolvedReportsCount = reports.filter((r) => r.status === 'RESOLVED').length;

  const handleReportWasteAtLocation = (loc) => {
    navigate(`/student/report?location=${encodeURIComponent(loc.name)}&zone=${encodeURIComponent(loc.zone)}`);
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      {/* Top Banner & Institutional Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem 2rem',
          marginBottom: '1.75rem',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🗺️</span>
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.25)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#a7f3d0',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}
              >
                Official Master Layout
              </span>
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
              ACET Campus Map
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginTop: '0.25rem', marginBottom: 0, fontWeight: 500 }}>
              Akshaya College of Engineering and Technology &bull; Interactive Geospatial Waste &amp; Hotspot Monitoring
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                padding: '0.65rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Monitored Blocks</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#38bdf8' }}>{ACET_OFFICIAL_LOCATIONS.length}</div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                padding: '0.65rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#fef08a', fontWeight: 700, textTransform: 'uppercase' }}>Active Incidents</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fbbf24' }}>{activeReportsCount}</div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                padding: '0.65rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#bbf7d0', fontWeight: 700, textTransform: 'uppercase' }}>Resolved Areas</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#34d399' }}>{resolvedReportsCount}</div>
            </div>

            <Link
              to="/student/report"
              className="btn btn-primary btn-sm"
              style={{
                alignSelf: 'center',
                padding: '0.65rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
              }}
            >
              <FilePlus size={16} /> Report Waste Incident
            </Link>
          </div>
        </div>
      </div>

      {/* Control & Filter Strip */}
      <div
        className="card"
        style={{
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          background: '#ffffff',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        {/* Search Bar */}
        <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 280px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="text"
            className="input-field"
            placeholder="Search block, lab, hostel, or court..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.4rem', fontSize: '0.88rem' }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sector Category Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            <Filter size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            Sector:
          </span>
          <select
            className="select-field"
            value={selectedZoneCategory}
            onChange={(e) => setSelectedZoneCategory(e.target.value)}
            style={{ padding: '0.45rem 1.75rem 0.45rem 0.75rem', fontSize: '0.85rem', width: 'auto' }}
          >
            {ZONE_CATEGORIES.map((zc) => (
              <option key={zc.id} value={zc.id}>
                {zc.label}
              </option>
            ))}
          </select>
        </div>

        {/* Incident Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status:</span>
          <select
            className="select-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.45rem 1.75rem 0.45rem 0.75rem', fontSize: '0.85rem', width: 'auto' }}
          >
            <option value="ALL">All Incidents</option>
            <option value="ACTIVE">⚠️ Active / Reported</option>
            <option value="IN_PROGRESS">⚡ In Progress</option>
            <option value="RESOLVED">✅ Cleaned / Resolved</option>
          </select>
        </div>

        {/* View Toggle Tabs */}
        <div style={{ display: 'inline-flex', background: 'var(--bg-subtle)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            style={{
              background: activeTab === 'map' ? '#ffffff' : 'transparent',
              color: activeTab === 'map' ? 'var(--primary)' : 'var(--text-muted)',
              border: 'none',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'map' ? 'var(--shadow-sm)' : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <MapPin size={14} /> Interactive Blueprint
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            style={{
              background: activeTab === 'directory' ? '#ffffff' : 'transparent',
              color: activeTab === 'directory' ? 'var(--primary)' : 'var(--text-muted)',
              border: 'none',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'directory' ? 'var(--shadow-sm)' : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Building size={14} /> Location Roster ({filteredLocations.length})
          </button>
        </div>
      </div>

      {/* Main Map Viewer Layout */}
      {activeTab === 'map' && (
        <div
          ref={mapViewerRef}
          style={{
            position: 'relative',
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
            marginBottom: '1.5rem'
          }}
        >
          {/* Map Header Action Strip */}
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              zIndex: 30,
              display: 'flex',
              gap: '0.4rem',
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(8px)',
              padding: '0.35rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
              border: '1px solid rgba(0, 0, 0, 0.08)'
            }}
          >
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom In"
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderRadius: '4px',
                color: 'var(--slate-800)'
              }}
            >
              <ZoomIn size={18} />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom Out"
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderRadius: '4px',
                color: 'var(--slate-800)'
              }}
            >
              <ZoomOut size={18} />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              title="Reset Zoom"
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderRadius: '4px',
                color: 'var(--slate-800)'
              }}
            >
              <RotateCcw size={16} />
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderRadius: '4px',
                color: 'var(--slate-800)'
              }}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>

          {/* Map Status Legend Badge */}
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              zIndex: 30,
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(8px)',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontWeight: 700
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              <span>Clean / Clear</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
              <span>Active Issue</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
              <span>Critical Urgency</span>
            </div>
          </div>

          {/* Interactive Scrollable Canvas */}
          <div
            style={{
              overflow: 'auto',
              maxHeight: isFullscreen ? '100vh' : '680px',
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#f1f5f9'
            }}
          >
            <div
              style={{
                position: 'relative',
                width: `${100 * zoomLevel}%`,
                minWidth: '850px',
                maxWidth: `${1600 * zoomLevel}px`,
                transition: 'width 0.2s ease',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                borderRadius: '16px',
                overflow: 'hidden'
              }}
            >
              {/* Official ACET Master Map Graphic */}
              <img
                src="/assets/maps/acet_campus_map.svg"
                alt="ACET Official Campus Master Map"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  userSelect: 'none'
                }}
              />

              {/* Interactive Location Hotspots & Incident Badges Overlay */}
              {ACET_OFFICIAL_LOCATIONS.map((loc) => {
                const locIncidents = getIncidentsForLocation(loc.name);
                const hasActive = locIncidents.some((r) => ['REPORTED', 'ASSIGNED'].includes(r.status));
                const hasCritical = locIncidents.some((r) => ['CRITICAL', 'HIGH'].includes(r.priority) && r.status !== 'RESOLVED');
                const isSelected = selectedLocation?.id === loc.id;

                let badgeColor = '#10b981';
                if (hasCritical) badgeColor = '#ef4444';
                else if (hasActive) badgeColor = '#f59e0b';

                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setSelectedLocation(loc)}
                    title={`Click to view ${loc.name} details & incident reports`}
                    style={{
                      position: 'absolute',
                      left: `${loc.coords.x}%`,
                      top: `${loc.coords.y}%`,
                      transform: isSelected ? 'translate(-50%, -50%) scale(1.2)' : 'translate(-50%, -50%) scale(1)',
                      zIndex: isSelected ? 25 : 15,
                      border: 'none',
                      background: isSelected ? '#ffffff' : badgeColor,
                      color: isSelected ? 'var(--slate-900)' : '#ffffff',
                      borderRadius: 'var(--radius-full)',
                      padding: '0.35rem 0.65rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: isSelected
                        ? '0 0 0 4px #0284c7, 0 6px 20px rgba(0,0,0,0.3)'
                        : '0 3px 10px rgba(0,0,0,0.25)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{loc.icon}</span>
                    <span>{loc.name}</span>
                    {locIncidents.length > 0 && (
                      <span
                        style={{
                          background: isSelected ? badgeColor : '#ffffff',
                          color: isSelected ? '#ffffff' : badgeColor,
                          fontSize: '0.65rem',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '10px',
                          fontWeight: 900
                        }}
                      >
                        {locIncidents.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Selected Location Incident Detail Drawer / Modal */}
      {selectedLocation && (
        <div
          className="card animate-fade-in"
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem 1.75rem',
            marginBottom: '1.75rem',
            border: '2px solid var(--primary)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}
              >
                {selectedLocation.icon}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>{selectedLocation.name}</h3>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {selectedLocation.zone}
                  </span>
                </div>
                <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  {selectedLocation.description}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleReportWasteAtLocation(selectedLocation)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
              >
                <FilePlus size={15} /> Report Waste at this Location
              </button>
              <button
                type="button"
                onClick={() => setSelectedLocation(null)}
                style={{
                  background: 'var(--bg-subtle)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.4rem',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
                title="Close Drawer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Active Incidents at this Location */}
          {(() => {
            const locIncidents = getIncidentsForLocation(selectedLocation.name);
            if (locIncidents.length === 0) {
              return (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.25rem',
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                >
                  <CheckCircle2 size={22} color="#16a34a" />
                  <div>
                    <strong style={{ fontSize: '0.92rem' }}>All Clear! No active waste reports at {selectedLocation.name}.</strong>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.1rem' }}>
                      This sector is currently monitored and maintained. To report any sudden litter or spillage, click the button above.
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--slate-800)' }}>
                  Active Waste Incidents at {selectedLocation.name} ({locIncidents.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {locIncidents.map((inc) => (
                    <div
                      key={inc.report_id || inc.ticket_code}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        background: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--primary-dark)', fontSize: '0.88rem' }}>
                          #{inc.ticket_code}
                        </span>
                        <StatusBadge status={inc.status} />
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            background: inc.priority === 'CRITICAL' ? '#fee2e2' : inc.priority === 'HIGH' ? '#ffedd5' : '#fef3c7',
                            color: inc.priority === 'CRITICAL' ? '#991b1b' : inc.priority === 'HIGH' ? '#9a3412' : '#92400e'
                          }}
                        >
                          {inc.priority} Priority
                        </span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          &bull; {inc.category_name || 'General Waste'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {new Date(inc.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Campus Location Directory Grid */}
      <div
        className="card"
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-color)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              Campus Facilities &amp; Monitored Sectors Directory
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
              Complete institutional directory of buildings, engineering labs, hostels, sports courts, and amenities at ACET.
            </p>
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            Showing {filteredLocations.length} of {ACET_OFFICIAL_LOCATIONS.length} Locations
          </span>
        </div>

        <div className="grid-3" style={{ gap: '1rem' }}>
          {filteredLocations.map((loc) => {
            const locIncidents = getIncidentsForLocation(loc.name);
            const hasActive = locIncidents.some((r) => ['REPORTED', 'ASSIGNED'].includes(r.status));

            return (
              <div
                key={loc.id}
                style={{
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.1rem',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.35rem' }}>{loc.icon}</span>
                      <strong style={{ fontSize: '1rem', color: 'var(--slate-900)' }}>{loc.name}</strong>
                    </div>
                    {locIncidents.length > 0 ? (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          background: hasActive ? '#fef3c7' : '#dcfce7',
                          color: hasActive ? '#b45309' : '#15803d'
                        }}
                      >
                        {locIncidents.length} Incident{locIncidents.length > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          background: '#f0fdf4',
                          color: '#16a34a'
                        }}
                      >
                        ✓ Clean
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.76rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.35rem' }}>
                    {loc.zone}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--slate-600)', margin: 0, lineHeight: 1.45 }}>
                    {loc.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLocation(loc);
                      setActiveTab('map');
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, fontSize: '0.78rem', padding: '0.35rem 0.5rem', justifyContent: 'center' }}
                  >
                    <MapPin size={13} /> View on Map
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReportWasteAtLocation(loc)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, fontSize: '0.78rem', padding: '0.35rem 0.5rem', justifyContent: 'center' }}
                  >
                    <FilePlus size={13} /> Report Here
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CampusMap;
