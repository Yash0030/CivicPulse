import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ThumbsUp, AlertTriangle, Clock, MapPin, Layers } from 'lucide-react';
import { api } from '../api';

// Fix for default Leaflet marker icon in Vite/bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const categoryColors = {
  ROADS_PAVEMENT: '#ECB365', // Amber gold
  SANITATION_WASTE: '#10b981',
  WATER_DRAINAGE: '#B4EBE6',
  ELECTRICAL_HAZARD: '#ef4444',
  PUBLIC_SAFETY: '#a78bfa',
  ENVIRONMENTAL: '#34d399'
};

const createCustomIcon = (category, severity) => {
  const color = categoryColors[category] || '#ECB365';
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
        box-shadow: 0 0 ${isCritical ? '20px #ef4444' : '12px ' + color};
        cursor: pointer;
      ">
        <div style="width: 10px; height: 10px; background: #041C32; border-radius: 50%;"></div>
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
  const [mapTheme, setMapTheme] = useState('osm'); // 'osm' | 'dark'

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
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '100px 24px 60px' }}>
      
      {/* Map Control Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🗺️</span> View on Map | <span style={{ color: '#ECB365' }}>fixmycity™</span>
          </h2>
          <p style={{ fontSize: '13px', color: '#B4EBE6', margin: '4px 0 0', opacity: 0.85 }}>
            Geospatial tracking of verified road damage, potholes, and municipal response zones
          </p>
        </div>

        {/* Category Filters & Theme Switcher */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['ALL', 'ROADS_PAVEMENT', 'SANITATION_WASTE', 'WATER_DRAINAGE', 'ELECTRICAL_HAZARD'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: selectedCat === cat ? '700' : '500',
                  background: selectedCat === cat ? '#ECB365' : 'rgba(255, 255, 255, 0.06)',
                  border: selectedCat === cat ? '1px solid #ECB365' : '1px solid rgba(180, 235, 230, 0.2)',
                  color: selectedCat === cat ? '#041C32' : '#F5F5F5'
                }}
              >
                {cat === 'ALL' ? 'All Issues' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={() => setMapTheme(mapTheme === 'osm' ? 'dark' : 'osm')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              background: 'rgba(180, 235, 230, 0.12)',
              border: '1px solid rgba(180, 235, 230, 0.3)',
              color: '#B4EBE6',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            <Layers size={14} />
            {mapTheme === 'osm' ? 'Standard Map' : 'Dark Carto'}
          </button>
        </div>
      </div>

      {/* Map Card */}
      <div style={{
        height: '620px',
        width: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(180, 235, 230, 0.25)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        backgroundColor: '#041C32'
      }}>
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ width: '100%', height: '100%', minHeight: '620px' }}
        >
          {mapTheme === 'osm' ? (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={19}
            />
          )}

          {markers.map(m => {
            if (!m.latitude || !m.longitude) return null;
            const icon = createCustomIcon(m.category, m.severity);

            return (
              <Marker key={m.id} position={[m.latitude, m.longitude]} icon={icon}>
                <Popup>
                  <div style={{ width: '250px', padding: '6px' }}>
                    {m.image_url && (
                      <img
                        src={m.image_url}
                        alt={m.title}
                        style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }}
                      />
                    )}
                    <div style={{
                      display: 'inline-block',
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: m.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(236, 179, 101, 0.2)',
                      color: m.severity === 'CRITICAL' ? '#ef4444' : '#ECB365',
                      marginBottom: '6px'
                    }}>
                      {m.severity} ({m.severity_score}/100)
                    </div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 6px', color: '#ffffff' }}>
                      {m.title}
                    </h4>
                    <p style={{ fontSize: '11px', color: '#B4EBE6', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={11} color="#ECB365" />
                      {m.address}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      paddingTop: '6px',
                      fontSize: '11px'
                    }}>
                      <span style={{ color: '#10b981', fontWeight: '600' }}>{m.status?.replace('_', ' ')}</span>
                      <span style={{ color: '#ECB365', fontWeight: '700' }}>Priority #{m.priority}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

    </div>
  );
}
