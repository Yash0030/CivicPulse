import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MapPin, Calendar, Clock, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Bot, ExternalLink, ShieldCheck } from 'lucide-react';
import { api } from '../api';

const statusConfig = {
  PENDING_VERIFICATION: { label: 'Pending Verification', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' },
  VERIFIED: { label: 'AI Verified', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
  DISPATCHED_TO_DEPARTMENT: { label: 'Dispatched to Authority', color: '#818cf8', bg: 'rgba(129, 140, 248, 0.15)' },
  IN_PROGRESS: { label: 'Field Crew In Progress', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
  RESOLVED: { label: 'Resolved & Closed', color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' },
  REJECTED: { label: 'Rejected / Duplicate', color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' }
};

const categoryBadgeColor = {
  ROADS_PAVEMENT: '#f59e0b',
  SANITATION_WASTE: '#10b981',
  WATER_DRAINAGE: '#06b6d4',
  ELECTRICAL_HAZARD: '#ef4444',
  PUBLIC_SAFETY: '#8b5cf6',
  ENVIRONMENTAL: '#14b8a6'
};

export default function GrievanceFeed({ complaints, onVote, onRefresh, user }) {
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  const isAdmin = user?.role === 'admin';

  const filterCategories = [
    { id: 'ALL', label: 'All Issues' },
    { id: 'ROADS_PAVEMENT', label: 'Roads & Pavement' },
    { id: 'SANITATION_WASTE', label: 'Sanitation' },
    { id: 'WATER_DRAINAGE', label: 'Water & Sewage' },
    { id: 'ELECTRICAL_HAZARD', label: 'Electrical' },
    { id: 'PUBLIC_SAFETY', label: 'Public Safety' },
    { id: 'ENVIRONMENTAL', label: 'Environmental' },
  ];

  const filtered = complaints.filter(c => {
    const matchCat = selectedFilter === 'ALL' || c.category === selectedFilter;
    const matchSearch = !searchQuery || 
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateStatus(id, newStatus, 'Status updated via admin console');
      onRefresh();
    } catch (e) {
      alert(e.message || 'Error updating status');
    }
  };

  const handleBatchTriage = async () => {
    try {
      setIsBatchRunning(true);
      await api.triggerAgent(null);
      await onRefresh();
    } catch (e) {
      alert(e.message || 'Error running agent cycle');
    } finally {
      setIsBatchRunning(false);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '10px 24px 60px' }}>
      
      {/* Admin-Only Triage Command Bar */}
      {isAdmin && (
        <div style={{
          backgroundColor: '#020F1C',
          border: '1px solid #ECB365',
          borderRadius: '12px',
          padding: '16px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#ECB365' }}>
                🛡️ Municipal Admin Grievance Triage Console
              </span>
              <span style={{
                fontSize: '11px',
                background: 'rgba(236, 179, 101, 0.2)',
                color: '#ECB365',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: '700'
              }}>
                ADMIN ACTIONS ENABLED
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#B4EBE6', margin: '4px 0 0', opacity: 0.9 }}>
              You have administrative authority to inspect AI damage metrics, dispatch tickets to PWD, and mark complaints resolved.
            </p>
          </div>

          <button
            onClick={handleBatchTriage}
            disabled={isBatchRunning}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #ECB365 0%, #D49B45 100%)',
              color: '#041C32',
              fontWeight: '800',
              fontSize: '13px',
              boxShadow: '0 0 15px rgba(236, 179, 101, 0.35)',
              opacity: isBatchRunning ? 0.7 : 1
            }}
          >
            <Bot size={16} />
            {isBatchRunning ? 'Running LangGraph Agent...' : '⚡ Run Autonomous AI Triage'}
          </button>
        </div>
      )}
      
      {/* Search & Filter Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {filterCategories.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: selectedFilter === f.id ? '700' : '500',
                background: selectedFilter === f.id ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: selectedFilter === f.id ? '1px solid rgba(6, 182, 212, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                color: selectedFilter === f.id ? '#38bdf8' : '#94a3b8'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ minWidth: '280px' }}>
          <input
            type="text"
            placeholder="Search grievances, keywords, landmarks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '13px'
            }}
          />
        </div>
      </div>

      {/* Grievances Grid */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'rgba(15, 23, 42, 0.5)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <AlertTriangle size={36} color="#64748b" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', color: '#cbd5e1', marginBottom: '6px' }}>No grievances found</h3>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            No registered issues match your current filter. Try selecting another category or submitting a new report.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '20px' }}>
          {filtered.map(c => {
            const isExpanded = expandedId === c.id;
            const statusInfo = statusConfig[c.status] || statusConfig.VERIFIED;
            const catColor = categoryBadgeColor[c.category] || '#38bdf8';

            return (
              <div
                key={c.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'border-color 0.2s ease, transform 0.2s ease',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                }}
              >
                {/* Media Image Banner */}
                <div style={{ position: 'relative', height: '200px', width: '100%', background: '#0b1120' }}>
                  <img
                    src={c.image_url}
                    alt={c.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  
                  {/* Category Pill */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: `1px solid ${catColor}50`,
                    color: catColor,
                    fontSize: '11px',
                    fontWeight: '700',
                    backdropFilter: 'blur(8px)'
                  }}>
                    {c.category?.replace('_', ' ')}
                  </div>

                  {/* Severity Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: c.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.9)' : (c.severity === 'HIGH' ? 'rgba(245, 158, 11, 0.9)' : 'rgba(56, 189, 248, 0.9)'),
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '800',
                    boxShadow: '0 0 12px rgba(0,0,0,0.4)'
                  }}>
                    {c.severity} ({c.severity_score}/100)
                  </div>

                  {/* Priority Pill */}
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    color: '#f8fafc',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    Priority Rank: <span style={{ color: '#38bdf8' }}>#{c.priority}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  
                  {/* Status Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: statusInfo.bg,
                      color: statusInfo.color,
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusInfo.color }} />
                      {statusInfo.label}
                    </div>

                    <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      SLA: {c.sla_hours || 24}h
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#f8fafc', marginBottom: '8px', lineHeight: 1.3 }}>
                    {c.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '14px', flex: 1 }}>
                    {c.description}
                  </p>

                  {/* Address & Meta */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                    <MapPin size={13} color="#06b6d4" />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.address || `Lat ${c.latitude?.toFixed(4)}, Lon ${c.longitude?.toFixed(4)}`}
                    </span>
                  </div>

                  {/* AI Multimodal Triage Accordion */}
                  {c.ai_analysis && (
                    <div style={{
                      marginBottom: '16px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      overflow: 'hidden'
                    }}>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : c.id)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          background: 'transparent',
                          color: '#38bdf8',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Bot size={14} />
                          LangGraph AI Triage Report
                        </span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {isExpanded && (
                        <div style={{ padding: '0 12px 12px', fontSize: '12px', color: '#cbd5e1' }}>
                          <div style={{ marginBottom: '6px' }}>
                            <strong style={{ color: '#94a3b8' }}>Assigned Agency: </strong>
                            <span style={{ color: '#f8fafc' }}>{c.department}</span>
                          </div>
                          <div style={{ marginBottom: '6px' }}>
                            <strong style={{ color: '#94a3b8' }}>Detected Hazards: </strong>
                            <span style={{ color: '#f8fafc' }}>
                              {c.ai_analysis.detected_issues?.join(', ') || 'Structural anomaly'}
                            </span>
                          </div>
                          <div style={{ marginBottom: '6px' }}>
                            <strong style={{ color: '#94a3b8' }}>Recommended Action: </strong>
                            <span style={{ color: '#34d399' }}>{c.ai_analysis.recommended_action}</span>
                          </div>
                          {c.assigned_officer_email && (
                            <div>
                              <strong style={{ color: '#94a3b8' }}>Nodal Dispatch Email: </strong>
                              <span style={{ color: '#38bdf8' }}>{c.assigned_officer_email}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer: Community Voting & Admin Controls */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    {/* Upvote / Downvote */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => onVote(c.id, 'up')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: c.user_vote === 'up' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                          border: c.user_vote === 'up' ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                          color: c.user_vote === 'up' ? '#34d399' : '#e2e8f0',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        <ThumbsUp size={13} />
                        <span>{c.upvotes || 0}</span>
                      </button>

                      <button
                        onClick={() => onVote(c.id, 'down')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          background: c.user_vote === 'down' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                          border: c.user_vote === 'down' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
                          color: c.user_vote === 'down' ? '#f87171' : '#64748b',
                          fontSize: '12px'
                        }}
                      >
                        <ThumbsDown size={13} />
                      </button>
                    </div>

                    {/* Admin Actions */}
                    {user?.role === 'admin' ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleStatusChange(c.id, 'IN_PROGRESS')}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: 'rgba(251, 191, 36, 0.2)',
                            color: '#fbbf24',
                            border: '1px solid rgba(251, 191, 36, 0.4)',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}
                        >
                          Mark In-Progress
                        </button>
                        <button
                          onClick={() => handleStatusChange(c.id, 'RESOLVED')}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: '#34d399',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}
                        >
                          Resolve Issue
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        Reported by {c.user_email?.split('@')[0]}
                      </span>
                    )}

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
