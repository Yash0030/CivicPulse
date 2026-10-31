import React from 'react';
import { BarChart3, TrendingUp, AlertOctagon, CheckCircle2, ShieldAlert, Clock, ArrowUpRight } from 'lucide-react';

export default function TransparencyDashboard({ summary }) {
  if (!summary) return null;

  const categoryLabels = {
    ROADS_PAVEMENT: 'Roads & Pavement Infrastructure',
    SANITATION_WASTE: 'Municipal Solid Waste Management',
    WATER_DRAINAGE: 'Water Supply & Sewerage Drainage',
    ELECTRICAL_HAZARD: 'Power Grid & Electrical Safety',
    PUBLIC_SAFETY: 'Pedestrian Walkways & Civil Safety',
    ENVIRONMENTAL: 'Pollution Control & Ecology'
  };

  const total = summary.total_grievances || 1;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '10px 24px 60px' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc' }}>
          Public Governance &amp; Accountability Ledger
        </h2>
        <p style={{ fontSize: '14px', color: '#94a3b8', margin: '4px 0 0' }}>
          Real-time civic performance metrics, department SLA compliance, and open transparency audits
        </p>
      </div>

      {/* Metric Cards Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          padding: '22px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Resolution Rate</span>
            <TrendingUp size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981' }}>
            {summary.resolution_rate_percent}%
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            {summary.resolved_complaints} of {summary.total_grievances} closed
          </span>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          padding: '22px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Autonomous Dispatches</span>
            <ArrowUpRight size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#38bdf8' }}>
            {summary.dispatched_to_departments}
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Routed to municipal agencies
          </span>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          padding: '22px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Critical Urgency</span>
            <AlertOctagon size={18} color="#f43f5e" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#f43f5e' }}>
            {summary.critical_active}
          </div>
          <span style={{ fontSize: '12px', color: '#f43f5e' }}>
            Under 12-hour emergency SLA
          </span>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          padding: '22px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Mean Response Time</span>
            <Clock size={18} color="#c084fc" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#c084fc' }}>
            {summary.average_sla_hours} hrs
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Standard municipal SLA
          </span>
        </div>
      </div>

      {/* Main Grid: Breakdown & Hotspots */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px' }}>
        
        {/* Category Breakdown */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', marginBottom: '18px' }}>
            Civic Grievance Distribution by Category
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(summary.category_breakdown || {}).map(([catKey, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={catKey}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: '#cbd5e1', fontWeight: '500' }}>{categoryLabels[catKey] || catKey}</span>
                    <span style={{ color: '#94a3b8' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: 'linear-gradient(90deg, #06b6d4, #3b82f6)',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* High-Risk Hotspots */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', marginBottom: '16px' }}>
            Critical Civic Hotspots (Prioritized by AI &amp; Citizens)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(summary.critical_hotspots || []).map((spot, idx) => (
              <div
                key={spot.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: spot.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: spot.severity === 'CRITICAL' ? '#f87171' : '#fbbf24'
                    }}>
                      #{idx + 1} {spot.severity}
                    </span>
                    <strong style={{ fontSize: '13px', color: '#f8fafc' }}>{spot.title}</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {spot.address}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#38bdf8' }}>
                    Score {spot.priority}
                  </div>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {spot.upvotes} votes
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
