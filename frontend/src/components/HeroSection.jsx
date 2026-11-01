import React from 'react';
import { AlertTriangle, Trash2, Droplets, Zap, Eye, Trees, CheckCircle, ShieldCheck, Camera, ArrowRight } from 'lucide-react';

export default function HeroSection({ summary, onCategorySelect, onOpenReport, onExploreMap }) {
  const categories = [
    { id: 'ROADS_PAVEMENT', label: 'Potholes & Roads', icon: AlertTriangle, color: '#ECB365', desc: 'Asphalt craters, cracks & road damage' },
    { id: 'SANITATION_WASTE', label: 'Sanitation & Dumps', icon: Trash2, color: '#10b981', desc: 'Overflowing bins & street debris' },
    { id: 'WATER_DRAINAGE', label: 'Water Leaks & Drains', icon: Droplets, color: '#B4EBE6', desc: 'Pipe ruptures & road waterlogging' },
    { id: 'ELECTRICAL_HAZARD', label: 'Electrical Hazards', icon: Zap, color: '#f59e0b', desc: 'Open junction boxes & wire faults' },
    { id: 'PUBLIC_SAFETY', label: 'Public Safety', icon: Eye, color: '#a78bfa', desc: 'Broken walkways & safety rails' },
    { id: 'ENVIRONMENTAL', label: 'Environmental Cell', icon: Trees, color: '#34d399', desc: 'Stagnant runoff & road pollution' },
  ];

  return (
    <div style={{ padding: '36px 24px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Motto & Track Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '100px',
          background: 'rgba(236, 179, 101, 0.12)',
          border: '1px solid rgba(236, 179, 101, 0.35)',
          color: '#ECB365',
          fontSize: '13px',
          fontWeight: '700',
          letterSpacing: '0.02em'
        }}>
          <span>🛣</span>
          fixmycity™ AI Civic Infrastructure
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '100px',
          background: 'rgba(180, 235, 230, 0.1)',
          border: '1px solid rgba(180, 235, 230, 0.25)',
          color: '#B4EBE6',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          <ShieldCheck size={14} />
          Roboflow CV + LangGraph Dispatch Engine
        </div>
      </div>

      {/* Main Title & Problem Statement */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          {/* fixmycity classic tagline */}
          <div style={{
            fontSize: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#B4EBE6',
            fontWeight: '700',
            marginBottom: '8px'
          }}>
            See it • Snap it • Solve it
          </div>

          <h1 style={{ fontSize: '42px', fontWeight: '900', lineHeight: 1.15, marginBottom: '16px', color: '#ffffff' }}>
            Empowering Citizens to <br />
            <span style={{
              background: 'linear-gradient(135deg, #ECB365 0%, #F2D093 50%, #B4EBE6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Fix Roads with Agentic AI
            </span>
          </h1>
          <p style={{ fontSize: '15px', color: '#d1d5db', lineHeight: 1.6, maxWidth: '640px', marginBottom: '22px' }}>
            Capture a photo of road damage, potholes, or civic hazards. Our multimodal AI detects defects, calculates precise damage severity, enables community-driven prioritization, and autonomously dispatches formal work orders to municipal authorities with enforceable SLAs.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={onOpenReport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ECB365 0%, #D49B45 100%)',
                color: '#041C32',
                fontSize: '14px',
                fontWeight: '800',
                boxShadow: '0 0 25px rgba(236, 179, 101, 0.35)',
              }}
            >
              <Camera size={18} />
              Report Pothole Now
            </button>
            <button
              onClick={onExploreMap}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 22px',
                borderRadius: '10px',
                background: 'rgba(180, 235, 230, 0.1)',
                border: '1px solid rgba(180, 235, 230, 0.3)',
                color: '#B4EBE6',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <span>Explore Live Map</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '14px',
          background: 'rgba(2, 15, 28, 0.85)',
          padding: '24px',
          borderRadius: '18px',
          border: '1px solid rgba(180, 235, 230, 0.15)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(4, 28, 50, 0.8)', border: '1px solid rgba(236, 179, 101, 0.15)' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#B4EBE6', fontWeight: '700' }}>Active Issues</span>
            <div style={{ fontSize: '30px', fontWeight: '800', color: '#ffffff', marginTop: '4px' }}>
              {summary ? summary.active_complaints : '0'}
            </div>
            <span style={{ fontSize: '11px', color: '#ECB365', fontWeight: '600' }}>
              ● {summary ? summary.critical_active : 0} High Priority
            </span>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(4, 28, 50, 0.8)', border: '1px solid rgba(180, 235, 230, 0.15)' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#B4EBE6', fontWeight: '700' }}>Dispatched via AI</span>
            <div style={{ fontSize: '30px', fontWeight: '800', color: '#ECB365', marginTop: '4px' }}>
              {summary ? summary.dispatched_to_departments : '0'}
            </div>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '600' }}>Autonomous PWD Dispatch</span>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(4, 28, 50, 0.8)', border: '1px solid rgba(180, 235, 230, 0.15)' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#B4EBE6', fontWeight: '700' }}>Resolution Rate</span>
            <div style={{ fontSize: '30px', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>
              {summary ? `${summary.resolution_rate_percent}%` : '100%'}
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Field Team Closed</span>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(4, 28, 50, 0.8)', border: '1px solid rgba(236, 179, 101, 0.15)' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#B4EBE6', fontWeight: '700' }}>Average SLA</span>
            <div style={{ fontSize: '30px', fontWeight: '800', color: '#F2D093', marginTop: '4px' }}>
              {summary ? `${summary.average_sla_hours}h` : '24h'}
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Redressal Timeline</span>
          </div>
        </div>
      </div>

      {/* Multi-Problem Spectrum Selector */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#ECB365', letterSpacing: '0.02em' }}>
            Reported Issue Verticals:
          </h3>
          <span style={{ fontSize: '12px', color: '#B4EBE6', opacity: 0.8 }}>
            Click to filter community issues
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => onCategorySelect(cat.id)}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(2, 15, 28, 0.75)',
                  border: '1px solid rgba(180, 235, 230, 0.12)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = cat.color;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 6px 20px ${cat.color}25`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(180, 235, 230, 0.12)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: `${cat.color}20`,
                  border: `1px solid ${cat.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px'
                }}>
                  <Icon size={18} color={cat.color} />
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                  {cat.label}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {cat.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
