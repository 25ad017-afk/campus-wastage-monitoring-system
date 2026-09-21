import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import {
  Camera,
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Tag,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Bot,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  CheckCircle,
  Info,
  ShieldAlert
} from 'lucide-react';
import Loader from '../../components/common/Loader';

// Official monitored campus zones for Akshaya College of Engineering and Technology (ACET)
const MONITORED_CAMPUS_ZONES = [
  'Academic Area',
  'Central Library',
  'Laboratory Area',
  'Smart Classroom Area',
  'Administrative / Office Area',
  'Conference Hall',
  'Guest Room & TV Hall',
  'Food Court & Amenity Center',
  'Hostel Area',
  'Sports Area',
  'Fitness Centre',
  'Transport Area',
  'Main Entrance',
  'Campus Internal Area',
  'Green Campus Area',
  'Student Activity Area',
  'Waste Collection Area',
  'Other Campus Area'
];

const CreateReportPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [locationId, setLocationId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');

  // AI Classification States
  const [aiClassifying, setAiClassifying] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [aiError, setAiError] = useState('');
  const [userConfirmedCategory, setUserConfirmedCategory] = useState(false);
  const [isManualOverride, setIsManualOverride] = useState(false);

  // Metadata & Options
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');

  // UI States
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await reportService.getMetadata();
        if (res.data) {
          setLocations(res.data.locations || []);
          setCategories(res.data.categories || []);
          setZones(res.data.zones || []);
        }
      } catch (err) {
        setError('Failed to load campus locations and categories. Please refresh.');
      } finally {
        setPageLoading(false);
      }
    };
    fetchMetadata();
  }, []);

  // Trigger AI Auto-Classification from photo
  const triggerAiClassification = async (file) => {
    if (!file) return;
    setAiClassifying(true);
    setAiError('');
    try {
      const res = await reportService.classifyImage(file);
      if (res.data) {
        setAiPrediction(res.data);

        // If high confidence, pre-select the category for convenience
        if (!res.data.isUncertain && res.data.categoryId) {
          setCategoryId(String(res.data.categoryId));
          setUserConfirmedCategory(true);
          setIsManualOverride(false);
        } else if (res.data.isUncertain) {
          // Do NOT automatically trust uncertain predictions:
          // Keep categoryId unselected so the user must actively confirm or choose
          setCategoryId('');
          setUserConfirmedCategory(false);
          setIsManualOverride(false);
        }
      }
    } catch (err) {
      console.warn('AI Classification service unreachable:', err);
      setAiError('AI Vision service is temporarily unavailable. You can manually select the waste category below.');
      // Do NOT block reporting
    } finally {
      setAiClassifying(false);
    }
  };

  // Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file is too large. Maximum allowed size is 10MB.');
      return;
    }

    setError('');
    setAiError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    // Automatically trigger AI classification upon image selection
    triggerAiClassification(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setAiPrediction(null);
    setAiError('');
    setUserConfirmedCategory(false);
    setIsManualOverride(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // User confirms the AI suggested category
  const handleConfirmAiSuggestion = () => {
    if (aiPrediction && aiPrediction.categoryId) {
      setCategoryId(String(aiPrediction.categoryId));
      setUserConfirmedCategory(true);
      setIsManualOverride(false);
    }
  };

  // User manually selects/changes category from dropdown
  const handleManualCategoryChange = (selectedId) => {
    setCategoryId(selectedId);
    if (aiPrediction) {
      if (String(selectedId) === String(aiPrediction.categoryId)) {
        setIsManualOverride(false);
        setUserConfirmedCategory(true);
      } else {
        setIsManualOverride(true);
        setUserConfirmedCategory(false);
      }
    }
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError('');

    if (!imageFile) {
      setError('Photographic evidence of the waste site is mandatory.');
      return;
    }
    if (!locationId) {
      setError('Please select the campus location.');
      return;
    }
    if (!categoryId) {
      setError('Please select the waste category.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('locationId', locationId);
      formData.append('categoryId', categoryId);
      formData.append('priority', priority);
      formData.append('description', description.trim() || 'No detailed description provided.');

      const res = await reportService.createReport(formData);

      const createdReport = res?.data || res;
      if (createdReport) {
        setSuccessData(createdReport);
      }
    } catch (err) {
      console.error('Report submission failed:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to submit waste report. Please verify all inputs and try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyTicket = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Extract all unique available zones combining standard monitored list and backend metadata
  const displayedZones = (() => {
    const fromApi = (zones || [])
      .map((z) => (typeof z === 'string' ? z : (z.zone_name || z.name || '')))
      .filter(Boolean);
    const fromLocations = (locations || [])
      .map((loc) => loc.zone_name)
      .filter(Boolean);
    return Array.from(new Set([...MONITORED_CAMPUS_ZONES, ...fromApi, ...fromLocations]));
  })();

  // Filter locations by selected zone
  const filteredLocations = selectedZone
    ? locations.filter((loc) => loc.zone_name === selectedZone)
    : locations;

  // Selected Location Object for Feedback & Confirmation
  const selectedLocationObj = locations.find((l) => String(l.location_id) === String(locationId));

  // Selected Category Object for Displaying Final Category
  const selectedCategoryObj = categories.find((c) => String(c.category_id) === String(categoryId));

  if (pageLoading) {
    return <Loader fullScreen message="Loading campus locations and category models..." />;
  }

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '840px', padding: '2.5rem 1.5rem', marginBottom: '4rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span className="inst-badge">INCIDENT REPORTING PROTOCOL</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--slate-900)' }}>
          Report Campus Waste Incident
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.92rem', marginTop: '0.25rem' }}>
          Upload photo evidence, classify waste type with AI assistance, and geo-tag the campus landmark for rapid sanitation crew dispatch.
        </p>
      </div>

      {error && (
        <div className="alert-box alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
        {/* Step 1: Upload Image Evidence */}
        <div style={{ marginBottom: '2rem' }}>
          <label className="form-label" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Camera size={18} color="var(--primary)" /> 1. Upload Waste Site Photo <span style={{ color: '#ef4444' }}>*</span>
          </label>

          {!imagePreview ? (
            <div
              className="dropzone-container"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleImageChange({ target: { files: e.dataTransfer.files } });
                }
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}
              >
                <Upload size={26} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Drag &amp; Drop waste photo here, or browse
              </h3>
              <p style={{ color: 'var(--slate-500)', fontSize: '0.82rem', margin: '0 0 1rem 0' }}>
                Supports JPEG, PNG, or WebP (Max 10MB). Image is auto-scanned by the AI Classifier.
              </p>
              <button type="button" className="btn btn-secondary btn-sm">
                Choose Image File
              </button>
            </div>
          ) : (
            <div
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                background: '#000000'
              }}
            >
              <img
                src={imagePreview}
                alt="Selected evidence preview"
                style={{ width: '100%', maxHeight: '320px', objectFit: 'contain', display: 'block' }}
              />

              <button
                type="button"
                onClick={handleRemoveImage}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(15, 23, 42, 0.75)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Remove photo"
              >
                <X size={18} />
              </button>

              {/* AI Auto-Classifier Status Header */}
              <div
                style={{
                  padding: '0.85rem 1.25rem',
                  background: '#f8fafc',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bot size={18} color="var(--tech-blue-600)" />
                  <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--slate-800)' }}>
                    CWMS AI Waste Vision Engine
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => triggerAiClassification(imageFile)}
                    className="btn btn-secondary btn-sm"
                    disabled={aiClassifying}
                    title="Re-run AI classification"
                  >
                    <RefreshCw size={13} className={aiClassifying ? 'animate-spin' : ''} />
                    {aiClassifying ? 'Analyzing Photo...' : 'Re-Analyze'}
                  </button>
                </div>
              </div>

              {/* AI Classification Spinner */}
              {aiClassifying && (
                <div style={{ padding: '1rem 1.25rem', background: '#f0f9ff', borderTop: '1px solid #bae6fd', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#0369a1' }}>Analyzing Image Evidence...</strong>
                    <div style={{ fontSize: '0.75rem', color: '#0284c7' }}>Extracting waste texture, surface contours, and material signatures.</div>
                  </div>
                </div>
              )}

              {/* Graceful AI Error Banner */}
              {aiError && (
                <div className="alert-box alert-warning" style={{ margin: 0, borderRadius: 0, borderLeft: 0, borderRight: 0 }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>AI Service Notice:</strong> {aiError}
                  </div>
                </div>
              )}

              {/* ====================================================================
                  REQUIRED AI SPECIFICATION BOX:
                  Shows: Predicted Category | Confidence | Final Category
                  ==================================================================== */}
              {aiPrediction && !aiClassifying && (
                <div style={{ padding: '1.25rem', background: '#ffffff', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="grid-3" style={{ gap: '0.85rem' }}>
                    {/* 1. Predicted Category */}
                    <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '0.2rem' }}>
                        🤖 Predicted Category
                      </span>
                      <strong style={{ fontSize: '0.98rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Tag size={15} /> {aiPrediction.predictedCategory}
                      </strong>
                    </div>

                    {/* 2. Confidence */}
                    <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '0.2rem' }}>
                        🎯 Prediction Confidence
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <strong style={{ fontSize: '1.05rem', color: aiPrediction.isUncertain ? '#d97706' : '#16a34a' }}>
                          {aiPrediction.confidence}%
                        </strong>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '0.12rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            background: aiPrediction.isUncertain ? '#fef3c7' : '#dcfce7',
                            color: aiPrediction.isUncertain ? '#b45309' : '#15803d'
                          }}
                        >
                          {aiPrediction.confidenceLevel} CONFIDENCE
                        </span>
                      </div>
                    </div>

                    {/* 3. Final Category */}
                    <div style={{
                      background: categoryId ? 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)' : '#fffbeb',
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: categoryId ? '2px solid var(--primary)' : '2px dashed #d97706'
                    }}>
                      <span style={{
                        fontSize: '0.7rem',
                        color: categoryId ? 'var(--primary)' : '#b45309',
                        textTransform: 'uppercase',
                        fontWeight: 800,
                        display: 'block',
                        marginBottom: '0.2rem'
                      }}>
                        ✅ Final Category (To Store)
                      </span>
                      <strong style={{
                        fontSize: '0.98rem',
                        color: categoryId ? 'var(--text-main)' : '#b45309',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}>
                        {categoryId ? <CheckCircle size={16} color="var(--primary)" /> : <AlertTriangle size={16} color="#d97706" />}
                        {selectedCategoryObj ? selectedCategoryObj.category_name : '⚠️ Awaiting Confirmation'}
                      </strong>
                    </div>
                  </div>

                  {/* Uncertainty Warning Callout */}
                  {aiPrediction.isUncertain && (
                    <div className="alert-box alert-warning" style={{ fontSize: '0.82rem', margin: 0, padding: '0.65rem 0.85rem' }}>
                      <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                      <div>
                        <strong>Uncertain Prediction:</strong> The AI model detected moderate confidence ({aiPrediction.confidence}%). Do not automatically trust uncertain predictions—please verify and select the Final Category in Step 3 below.
                      </div>
                    </div>
                  )}

                  {/* Confirm or Override Action Strip */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      background: 'var(--bg-subtle)',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div>
                      {isManualOverride ? (
                        <span style={{ color: '#0284c7', fontWeight: 700 }}>
                          ✏️ Manually changed by user. Final Category updated to: {selectedCategoryObj?.category_name}.
                        </span>
                      ) : userConfirmedCategory ? (
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>
                          ✓ AI suggestion confirmed. Final Category set to: {aiPrediction.predictedCategory}.
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>
                          Click Confirm to accept the AI suggestion, or select manually from the dropdown.
                        </span>
                      )}
                    </div>

                    {!userConfirmedCategory && !isManualOverride && (
                      <button
                        type="button"
                        onClick={handleConfirmAiSuggestion}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
                      >
                        <Check size={14} /> Confirm AI Suggestion
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
        </div>

        {/* Step 2: Location Selection */}
        <div style={{ marginBottom: '2rem' }}>
          <label className="form-label" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={18} color="var(--primary)" /> 2. Campus Location &amp; Sector <span style={{ color: '#ef4444' }}>*</span>
          </label>

          <div className="grid-2" style={{ marginBottom: '0.75rem' }}>
            <div>
              <label className="form-label" htmlFor="zoneFilterSelect" style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                Filter by Zone
              </label>
              <select
                id="zoneFilterSelect"
                className="select-field"
                value={selectedZone}
                onChange={(e) => {
                  setSelectedZone(e.target.value);
                  setLocationId('');
                }}
              >
                <option value="">All Monitored Zones</option>
                {displayedZones.map((zName) => (
                  <option key={zName} value={zName}>
                    {zName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label" htmlFor="landmarkSelect" style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                Building / Landmark {selectedZone && <span style={{ color: 'var(--primary)', fontWeight: 600 }}>({selectedZone})</span>}
              </label>
              <select
                id="landmarkSelect"
                className="select-field"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                required
              >
                <option value="">
                  {selectedZone
                    ? `-- Select Landmark in ${selectedZone} --`
                    : 'Select Specific Landmark Site'}
                </option>
                {filteredLocations.map((loc) => (
                  <option key={loc.location_id} value={loc.location_id}>
                    {!selectedZone ? `[${loc.zone_name}] ` : ''}{loc.floor_or_landmark}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedLocationObj && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 'var(--radius-sm)',
              padding: '0.5rem 0.85rem',
              fontSize: '0.78rem',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginTop: '0.5rem'
            }}>
              <MapPin size={14} style={{ flexShrink: 0 }} />
              <span>
                Selected Location: <strong>{selectedLocationObj.zone_name}</strong> &bull; {selectedLocationObj.floor_or_landmark}
              </span>
            </div>
          )}
        </div>

        {/* Step 3: Waste Category (Final Category Confirmation / Manual Override) & Urgency */}
        <div className="grid-2" style={{ marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                <Tag size={18} color="var(--primary)" /> 3. Final Confirmed Category <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isManualOverride && (
                  <span style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 800, background: '#e0f2fe', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    ✏️ MANUAL OVERRIDE
                  </span>
                )}
                {userConfirmedCategory && (
                  <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 800, background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    ✓ AI CONFIRMED
                  </span>
                )}
                {aiPrediction && !categoryId && (
                  <span style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 800, background: '#fef3c7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    ⚠️ CONFIRMATION NEEDED
                  </span>
                )}
              </div>
            </div>

            <select
              className="select-field"
              value={categoryId}
              onChange={(e) => handleManualCategoryChange(e.target.value)}
              required
              style={{
                borderColor: categoryId ? 'var(--primary)' : 'var(--border-color)',
                background: categoryId ? '#f0fdf4' : '#ffffff'
              }}
            >
              <option value="">Select or Confirm Segregation Category</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_name} {c.is_hazardous ? '⚠️ (Hazardous Waste)' : ''}
                </option>
              ))}
            </select>
            <span className="form-hint">
              {categoryId
                ? `Storing as "${selectedCategoryObj?.category_name}" in database.`
                : 'Choose the verified waste category for database submission.'}
            </span>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={18} color="var(--primary)" /> Priority Urgency
            </label>
            <select
              className="select-field"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="LOW">Low (Minor scattered litter)</option>
              <option value="MEDIUM">Medium (Dustbin nearly full)</option>
              <option value="HIGH">High (Overflowing in public corridor)</option>
              <option value="CRITICAL">Critical (Hazardous spill / Blocking hallway)</option>
            </select>
            <span className="form-hint">Helps estate dispatchers triage urgency</span>
          </div>
        </div>

        {/* Step 4: Description / Observations */}
        <div className="form-group" style={{ marginBottom: '2.5rem' }}>
          <label className="form-label" htmlFor="description">
            4. Observations / Additional Notes (Optional)
          </label>
          <textarea
            id="description"
            rows={3}
            className="input-field"
            placeholder="e.g. Cardboard cartons stacked next to the emergency fire exit door. Cleaning crew needed with heavy-duty dolly."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate('/student/dashboard')}
            className="btn btn-secondary"
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={submitting}
            style={{ minWidth: '220px' }}
          >
            {submitting ? 'Submitting Incident Report...' : 'Submit Incident Report'}
            <ArrowRight size={18} />
          </button>
        </div>
      </form>

      {/* Success Confirmation Dialog Modal */}
      {successData && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-card animate-fade-in" style={{ maxWidth: '520px', textAlign: 'center', padding: '2.5rem 2rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--status-resolved-bg)',
                color: 'var(--status-resolved-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <span className="inst-badge" style={{ marginBottom: '0.5rem' }}>OFFICIAL TICKET DISPATCHED</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.25rem 0' }}>Report Filed Successfully!</h2>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Your waste report has been logged and the sanitation dispatch team notified.
            </p>

            <div
              style={{
                background: 'var(--bg-subtle)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.75rem',
                border: '1px solid var(--border-color)',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-muted)' }}>
                  Tracking Reference Ticket
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyTicket(successData.ticketCode || successData.ticket_code)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                >
                  {copied ? <Check size={14} color="var(--primary)" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>

              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary-dark)', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                #{successData.ticketCode || successData.ticket_code}
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--slate-700)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div><strong>📍 Location:</strong> {successData.building_name || successData.location || 'Campus Landmark'}</div>
                <div><strong>🏷️ Final Category:</strong> <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{selectedCategoryObj?.category_name || successData.category_name || 'Confirmed Category'}</span></div>
                <div><strong>⚡ Priority:</strong> {successData.priority}</div>
                <div><strong>📊 Status:</strong> <span style={{ color: '#d97706', fontWeight: 700 }}>{successData.status || 'REPORTED (Awaiting Dispatch)'}</span></div>
              </div>

            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => navigate('/student/my-reports')}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Track in My Reports
              </button>
              <button
                type="button"
                onClick={() => {
                  setSuccessData(null);
                  handleRemoveImage();
                  setDescription('');
                  setLocationId('');
                  setCategoryId('');
                }}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Report Another Site
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateReportPage;
