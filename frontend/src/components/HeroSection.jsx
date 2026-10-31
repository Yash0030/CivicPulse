import React from 'react';
import { ShieldAlert, Cpu, Sparkles, AlertTriangle, Trash2, Droplets, Zap, Eye, Trees } from 'lucide-react';

export default function HeroSection({ summary, onCategorySelect, onOpenReport }) {
  const categories = [
    { id: 'ROADS_PAVEMENT', label: 'Roads & Pavement', icon: AlertTriangle, color: '#f59e0b', desc: 'Potholes, cracks & cave-ins' },
    { id: 'SANITATION_WASTE', label: 'Sanitation & Waste', icon: Trash2, color: '#10b981', desc: 'Garbage dumps & biohazards' },
    { id: 'WATER_DRAINAGE', label: 'Water & Sewage', icon: Droplets, color: '#06b6d4', desc: 'Pipe bursts & waterlogging' },
    { id: 'ELECTRICAL_HAZARD', label: 'Electrical Hazards', icon: Zap, color: '#ef4444', desc: 'Dangling wires & blackouts' },
    { id: 'PUBLIC_SAFETY', label: 'Public Safety', icon: Eye, color: '#8b5cf6', desc: 'Broken walkways & rails' },
    { id: 'ENVIRONMENTAL', label: 'Environmental Cell', icon: Trees, color: '#14b8a6', desc: 'Pollution & stagnant runoff' },
  ];

  return (
    <div style={{ padding: '36px 24px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Track Concept Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '100px',
          background: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          color: '#38bdf8',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          <Sparkles size={14} />
          Theme 1: Civic Pulse, Digital Governance & Public Information
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '100px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          <Cpu size={14} />
          Autonomous LangGraph Bureaucracy Execution
        </div>
      </div>

      {/* Main Title & Problem Statement */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '38px', fontWeight: '800', lineHeight: 1.15, marginBottom: '14px', color: '#ffffff' }}>
            Transparent Civic Grievance &amp; <br />
            <span style={{
              background: 'linear-gradient(135deg, #38bdf8, #818cf8, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Autonomous Infrastructure Triage
            </span>
          </h1>
          <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6, maxWidth: '640px' }}>
            An open multimodal platform democratizing municipal governance. Citizens capture localized civic hazards (roads, sanitation, water bursts, electrical threats) while our <strong>LangGraph Autonomous AI Agent</strong> evaluates severity, routes verified tickets to municipal authorities, and enforces public accountability dashboards.
          </p>
        </div>

        {/* Live Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>Active Grievances</span>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#f8fafc', marginTop: '4px' }}>
              {summary ? summary.active_complaints : '...'}
            </div>
            <span style={{ fontSize: '11px', color: '#f59e0b' }}>● {summary ? summary.critical_active : 0} Critical Urgency</span>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>Dispatched via AI</span>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#38bdf8', marginTop: '4px' }}>
              {summary ? summary.dispatched_to_departments : '...'}
            </div>
            <span style={{ fontSize: '11px', color: '#34d399' }}>Autonomous Routing</span>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>Resolution Rate</span>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>
              {summary ? `${summary.resolution_rate_percent}%` : '...'}
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Public Verified</span>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>Average SLA</span>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#c084fc', marginTop: '4px' }}>
              {summary ? `${summary.average_sla_hours}h` : '24h'}
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Escalation Watchdog</span>
          </div>
        </div>
      </div>

      {/* Multi-Problem Spectrum Selector */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#cbd5e1' }}>
            Broad Multi-Problem Civic Coverage:
          </h3>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Click any category to filter grievances
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
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = cat.color;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: `${cat.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px'
                }}>
                  <Icon size={18} color={cat.color} />
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc', marginBottom: '4px' }}>
                  {cat.label}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
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
