import React, { useState, useRef } from 'react';
import { X, Upload, MapPin, Mic, MicOff, Sparkles, CheckCircle2, AlertCircle, AlertTriangle, Trash2, Droplets, Zap, Eye, Trees } from 'lucide-react';
import { api } from '../api';

const categories = [
  { id: 'ROADS_PAVEMENT', label: 'Roads & Pavement', icon: AlertTriangle, color: '#f59e0b', dept: 'Public Works & Road Infrastructure' },
  { id: 'SANITATION_WASTE', label: 'Sanitation & Waste', icon: Trash2, color: '#10b981', dept: 'Municipal Solid Waste Management' },
  { id: 'WATER_DRAINAGE', label: 'Water & Sewage', icon: Droplets, color: '#06b6d4', dept: 'Water Supply & Sewerage Board' },
  { id: 'ELECTRICAL_HAZARD', label: 'Electrical Hazards', icon: Zap, color: '#ef4444', dept: 'State Electricity Distribution Corp' },
  { id: 'PUBLIC_SAFETY', label: 'Public Safety', icon: Eye, color: '#8b5cf6', dept: 'Urban Development & Public Safety' },
  { id: 'ENVIRONMENTAL', label: 'Environmental Cell', icon: Trees, color: '#14b8a6', dept: 'Pollution Control & Ecology' },
];

export default function ReportModal({ isOpen, onClose, onSuccess }) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('ROADS_PAVEMENT');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.2090);
  const [isLocating, setIsLocating] = useState(false);
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Voice note
  const [isListening, setIsListening] = useState(false);
  const [audioTranscript, setAudioTranscript] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [aiPreview, setAiPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const fileInputRef = useRef(null);

  // Auto-detect GPS
  const handleAutoLocate = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setAddress(`Geo-Coordinates: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          setIsLocating(false);
        },
        err => {
          console.warn('Geolocation error:', err);
          setIsLocating(false);
          // Set sensible fallback
          setAddress('Central Ward Municipal Jurisdiction');
        },
        { timeout: 8000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Image Upload & Scanning Simulation
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        simulateAiScan(category);
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateAiScan = (cat) => {
    setIsScanning(true);
    setTimeout(() => {
      const selected = categories.find(c => c.id === cat) || categories[0];
      setAiPreview({
        severity_score: cat === 'ELECTRICAL_HAZARD' ? 98 : (cat === 'WATER_DRAINAGE' ? 92 : 84),
        severity_level: cat === 'ELECTRICAL_HAZARD' || cat === 'WATER_DRAINAGE' ? 'CRITICAL' : 'HIGH',
        department: selected.dept,
        suggested_sla: cat === 'ELECTRICAL_HAZARD' ? 6 : 24,
        confidence: 0.95
      });
      setIsScanning(false);
    }, 1200);
  };

  // Speech Recognition
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your notes.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAudioTranscript(transcript);
      setDescription(prev => prev ? `${prev} ${transcript}` : transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide a title and incident description.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      formData.append('address', address || 'Municipal Ward Area');
      if (contact) formData.append('contact', contact);
      if (audioTranscript) formData.append('audio_transcript', audioTranscript);
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imagePreview) {
        formData.append('image_b64', imagePreview);
      }

      const res = await api.createComplaint(formData);
      setIsSubmitting(false);
      onSuccess(res);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'Error submitting grievance.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#0f172a',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        padding: '28px'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#f8fafc' }}>
              Report Localized Civic Grievance
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0' }}>
              Multimodal verification &amp; autonomous municipal triage
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '8px',
              borderRadius: '10px',
              color: '#94a3b8'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '18px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Category Selector */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
              Problem Category
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {categories.map(c => {
                const Icon = c.icon;
                const isSel = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCategory(c.id);
                      if (imagePreview) simulateAiScan(c.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: isSel ? `${c.color}25` : 'rgba(255, 255, 255, 0.04)',
                      border: isSel ? `1px solid ${c.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                      color: isSel ? '#ffffff' : '#94a3b8',
                      fontSize: '12px',
                      fontWeight: isSel ? '700' : '500',
                      textAlign: 'left'
                    }}
                  >
                    <Icon size={16} color={c.color} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grievance Title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
              Incident Title
            </label>
            <input
              type="text"
              placeholder="e.g. Severe Asphalt Pothole Cluster / Flooded Storm Drain"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Image Upload & Multimodal AI Vision Preview */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
              Visual Evidence (Photo / Hazard Scene)
            </label>
            
            <div style={{ display: 'grid', gridTemplateColumns: imagePreview ? '1fr 1fr' : '1fr', gap: '14px' }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed rgba(56, 189, 248, 0.3)',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center',
                  background: 'rgba(56, 189, 248, 0.03)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '140px'
                }}
              >
                <Upload size={24} color="#38bdf8" style={{ marginBottom: '8px' }} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>Click to upload incident photo</span>
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>JPG, PNG or WEBP (Max 10MB)</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>

              {imagePreview && (
                <div style={{
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  height: '140px'
                }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {isScanning && <div className="scanner-beam" />}
                  <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    padding: '6px 10px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    fontSize: '11px',
                    color: '#38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Sparkles size={12} />
                    {isScanning ? 'AI Vision scanning in progress...' : 'AI Visual Features Extracted'}
                  </div>
                </div>
              )}
            </div>

            {/* AI Real-time Triage Card */}
            {aiPreview && (
              <div style={{
                marginTop: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px'
              }}>
                <div>
                  <span style={{ color: '#94a3b8' }}>AI Severity Assessment: </span>
                  <strong style={{ color: aiPreview.severity_level === 'CRITICAL' ? '#f43f5e' : '#f59e0b' }}>
                    {aiPreview.severity_level} ({aiPreview.severity_score}/100)
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Routing Target: </span>
                  <strong style={{ color: '#38bdf8' }}>{aiPreview.department}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>SLA: </span>
                  <strong style={{ color: '#34d399' }}>{aiPreview.suggested_sla}h max</strong>
                </div>
              </div>
            )}
          </div>

          {/* Description & Voice Input */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>
                Description &amp; Citizen Observations
              </label>
              <button
                type="button"
                onClick={toggleListening}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(6, 182, 212, 0.15)',
                  border: isListening ? '1px solid #ef4444' : '1px solid rgba(6, 182, 212, 0.3)',
                  color: isListening ? '#f87171' : '#38bdf8',
                  fontSize: '11px',
                  fontWeight: '600'
                }}
              >
                {isListening ? <MicOff size={13} /> : <Mic size={13} />}
                {isListening ? 'Listening...' : 'Voice Input (Accessibility)'}
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="Describe the exact location, visual damage, traffic impact, or immediate risks..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Geolocation Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '22px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                Street / Landmark Address
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="e.g. Near Community Clinic, Ring Road Sector 4"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '13px'
                  }}
                />
                <button
                  type="button"
                  onClick={handleAutoLocate}
                  disabled={isLocating}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(6, 182, 212, 0.15)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    color: '#38bdf8',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  <MapPin size={14} />
                  {isLocating ? 'Locating...' : 'Auto GPS'}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                Contact (Optional)
              </label>
              <input
                type="text"
                placeholder="Phone or Email"
                value={contact}
                onChange={e => setContact(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '13px'
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#94a3b8',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '700',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
              }}
            >
              <Sparkles size={16} />
              {isSubmitting ? 'Analyzing & Routing via Agent...' : 'Submit Grievance to AI Agent'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
