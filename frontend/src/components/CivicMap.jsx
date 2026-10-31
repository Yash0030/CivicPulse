import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ThumbsUp, AlertTriangle, Clock, MapPin } from 'lucide-react';
import { api } from '../api';

const categoryColors = {
  ROADS_PAVEMENT: '#f59e0b',
  SANITATION_WASTE: '#10b981',
  WATER_DRAINAGE: '#06b6d4',
  ELECTRICAL_HAZARD: '#ef4444',
  PUBLIC_SAFETY: '#8b5cf6',
  ENVIRONMENTAL: '#14b8a6'
};

const createCustomIcon = (category, severity) => {
  const color = categoryColors[category] || '#38bdf8';
  const isCritical = severity === 'CRITICAL';
  
  return L.divIcon({
    className: 'custom-civic-pin',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border: 2px solid #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 ${isCritical ? '20px #ef4444' : '10px ' + color};
        animation: ${isCritical ? 'pulseGlow 1.5s infinite' : 'none'};
      ">
        <div style="width: 10px; height: 10px; background: #ffffff; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

export default function CivicMap({ onVote, user }) {
  const [markers, setMarkers] = useState([]);
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchMarkers = async () => {
    try {
      setLoading(true);
      const data = await api.getMapMarkers(selectedCat);
      setMarkers(data);
      setLoading(false);
    } catch (e) {
      console.error('Failed to load map markers:', e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkers();
  }, [selectedCat]);

  // Default center around New Delhi coordinates from samples
  const defaultCenter = [28.6189, 77.2140];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '10px 24px 60px' }}>
      
      {/* Map Control Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#f8fafc' }}>
            Interactive Civic Infrastructure Heatmap
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Geospatial tracking of verified civic grievances and municipal response zones
          </p>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'ROADS_PAVEMENT', 'SANITATION_WASTE', 'WATER_DRAINAGE', 'ELECTRICAL_HAZARD'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: selectedCat === cat ? '700' : '500',
                background: selectedCat === cat ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: selectedCat === cat ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.08)',
                color: selectedCat === cat ? '#38bdf8' : '#94a3b8'
              }}
            >
              {cat === 'ALL' ? 'All Markers' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Map Card */}
      <div style={{
        height: '620px',
        borderRadius: '18px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        position: 'relative'
      }}>
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {markers.map(m => {
            if (!m.latitude || !m.longitude) return null;
            const icon = createCustomIcon(m.category, m.severity);

            return (
              <Marker key={m.id} position={[m.latitude, m.longitude]} icon={icon}>
                <Popup>
                  <div style={{ width: '240px', padding: '4px' }}>
                    {m.image_url && (
                      <img
                        src={m.image_url}
                        alt={m.title}
                        style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }}
                      />
                    )}
                    <div style={{
                      display: 'inline-block',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: m.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: '700',
                      marginBottom: '6px'
                    }}>
                      {m.severity} • {m.severity_score}/100
                    </div>

                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc', margin: '0 0 6px 0' }}>
                      {m.title}
                    </h4>

                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                      {m.department}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '600' }}>
                        Priority #{m.priority}
                      </span>
                      <button
                        onClick={() => onVote(m.id, 'up')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: 'rgba(16, 185, 129, 0.2)',
                          color: '#34d399',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          fontSize: '11px'
                        }}
                      >
                        <ThumbsUp size={11} /> {m.upvotes || 0}
                      </button>
                    </div>

                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Map Legend */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(10px)',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          zIndex: 1000,
          fontSize: '11px'
        }}>
          <strong style={{ display: 'block', color: '#f8fafc', marginBottom: '8px' }}>Hazard Categories</strong>
          {Object.entries(categoryColors).map(([k, color]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
              <span style={{ color: '#cbd5e1' }}>{k.replace('_', ' ')}</span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
