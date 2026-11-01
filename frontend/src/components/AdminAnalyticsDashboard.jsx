import React, { useState, useMemo } from 'react';
import { 
  Network, 
  Activity, 
  Radar, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ShieldCheck, 
  Zap, 
  Filter, 
  Compass, 
  Sparkles,
  TrendingUp,
  Building2,
  RefreshCw
} from 'lucide-react';

export default function AdminAnalyticsDashboard({ complaints = [], summary, onRunAgent }) {
  const [selectedMetric, setSelectedMetric] = useState('resolution_speed'); // 'resolution_speed' | 'severity_density' | 'sla_adherence'
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [activeWard, setActiveWard] = useState('ALL');
  const [timeRange, setTimeRange] = useState('7d');

  // --- 1. RADAR / SPIDER WEB DATA CONFIGURATION ---
  const radarDimensions = [
    { key: 'ROADS_PAVEMENT', label: 'Roads & Pavement', angle: 0 },
    { key: 'SANITATION_WASTE', label: 'Solid Waste', angle: 60 },
    { key: 'WATER_DRAINAGE', label: 'Water & Drainage', angle: 120 },
    { key: 'ELECTRICAL_HAZARD', label: 'Power Grid', angle: 180 },
    { key: 'PUBLIC_SAFETY', label: 'Civil Safety', angle: 240 },
    { key: 'ENVIRONMENTAL', label: 'Ecology & Pollution', angle: 300 }
  ];

  // Dynamic values based on active complaints or calibrated municipal benchmarks
  const radarData = useMemo(() => {
    const metricMultipliers = {
      resolution_speed: { current: [88, 72, 85, 94, 68, 80], benchmark: [95, 90, 92, 98, 85, 90] },
      severity_density: { current: [92, 65, 88, 96, 55, 70], benchmark: [50, 40, 45, 30, 40, 35] },
      sla_adherence: { current: [84, 76, 89, 98, 72, 82], benchmark: [90, 85, 88, 95, 85, 90] }
    };
    return metricMultipliers[selectedMetric] || metricMultipliers.resolution_speed;
  }, [selectedMetric]);

  // Compute SVG coordinates for Radar Web (Radius = 130, Center = 175, 175)
  const radarCenter = 175;
  const radarRadius = 120;

  const getCoordinates = (value, angleDeg) => {
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    const r = (value / 100) * radarRadius;
    const x = radarCenter + r * Math.cos(angleRad);
    const y = radarCenter + r * Math.sin(angleRad);
    return { x, y };
  };

  const currentRadarPoints = radarDimensions.map((dim, idx) => {
    return getCoordinates(radarData.current[idx], dim.angle);
  });
  const currentRadarPath = currentRadarPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  const benchmarkRadarPoints = radarDimensions.map((dim, idx) => {
    return getCoordinates(radarData.benchmark[idx], dim.angle);
  });
  const benchmarkRadarPath = benchmarkRadarPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // --- 2. TOPOLOGY WEB / NETWORK GRAPH CONFIGURATION ---
  const networkNodes = useMemo(() => [
    { id: 'core', label: 'Municipal Command Hub', type: 'core', x: 280, y: 160, color: '#ECB365', status: 'Nominal' },
    { id: 'dept_pwd', label: 'PWD & Roads', type: 'dept', x: 120, y: 70, color: '#38BDF8', officer: 'pwd.eng@gov.in', activeCases: 8 },
    { id: 'dept_swm', label: 'Solid Waste Mgt', type: 'dept', x: 440, y: 70, color: '#10B981', officer: 'swm.sanitation@gov.in', activeCases: 5 },
    { id: 'dept_water', label: 'Water & Sewerage', type: 'dept', x: 110, y: 250, color: '#818CF8', officer: 'water.emerg@gov.in', activeCases: 4 },
    { id: 'dept_power', label: 'Power Grid Safety', type: 'dept', x: 450, y: 250, color: '#F59E0B', officer: 'power.safety@gov.in', activeCases: 3 },
    { id: 'ward_north', label: 'Ward North-7', type: 'ward', x: 40, y: 140, color: '#B4EBE6', population: '142k' },
    { id: 'ward_central', label: 'Ward Central-1', type: 'ward', x: 280, y: 40, color: '#B4EBE6', population: '220k' },
    { id: 'ward_south', label: 'Ward South-4', type: 'ward', x: 520, y: 140, color: '#B4EBE6', population: '185k' },
    { id: 'ward_east', label: 'Ward East-9', type: 'ward', x: 280, y: 280, color: '#B4EBE6', population: '160k' },
    { id: 'agent_ai', label: 'LangGraph Dispatch Engine', type: 'agent', x: 280, y: 160, color: '#A855F7', state: 'Autonomous' }
  ], []);

  const networkLinks = useMemo(() => [
    { from: 'core', to: 'dept_pwd', speed: '3.2s' },
    { from: 'core', to: 'dept_swm', speed: '4.1s' },
    { from: 'core', to: 'dept_water', speed: '2.8s' },
    { from: 'core', to: 'dept_power', speed: '1.9s' },
    { from: 'dept_pwd', to: 'ward_north', speed: '4.5s' },
    { from: 'dept_pwd', to: 'ward_central', speed: '3.0s' },
    { from: 'dept_swm', to: 'ward_central', speed: '2.5s' },
    { from: 'dept_swm', to: 'ward_south', speed: '3.8s' },
    { from: 'dept_water', to: 'ward_north', speed: '5.0s' },
    { from: 'dept_water', to: 'ward_east', speed: '3.1s' },
    { from: 'dept_power', to: 'ward_south', speed: '2.1s' },
    { from: 'dept_power', to: 'ward_east', speed: '2.9s' }
  ], []);

  // --- 3. QUADRANT SCATTER MATRIX (SEVERITY VS COMMUNITY PRIORITY) ---
  const scatterPoints = useMemo(() => {
    return complaints.map((c, idx) => {
      const severity = c.severity_score || (c.severity === 'CRITICAL' ? 95 : c.severity === 'HIGH' ? 75 : 45);
      const priority = c.priority || (c.upvotes ? c.upvotes * 5 + 40 : 50);
      return {
        id: c.id || `c-${idx}`,
        title: c.title || c.description || 'Civic Infrastructure Grievance',
        category: c.category || 'ROADS_PAVEMENT',
        severity: Math.min(100, Math.max(10, severity)),
        priority: Math.min(190, Math.max(10, priority)),
        status: c.status || 'REPORTED',
        upvotes: c.upvotes || 0,
        address: c.address || 'Central Municipal Ward',
        imageUrl: c.image_url || c.image
      };
    });
  }, [complaints]);

  // --- 4. SANKEY PIPELINE STAGES ---
  const pipelineFunnel = [
    { stage: '1. Ingestion', count: complaints.length || 24, percent: 100, color: '#38BDF8', note: 'Public reports & telemetry' },
    { stage: '2. Vision AI Triage', count: Math.max(1, Math.round((complaints.length || 24) * 0.96)), percent: 96, color: '#818CF8', note: 'Roboflow + Gemini Multimodal' },
    { stage: '3. Autonomous Dispatch', count: Math.max(1, Math.round((complaints.length || 24) * 0.88)), percent: 88, color: '#A855F7', note: 'LangGraph formal agency notice' },
    { stage: '4. Active Field Repair', count: Math.max(1, Math.round((complaints.length || 24) * 0.54)), percent: 54, color: '#ECB365', note: 'Contractor crew on ground' },
    { stage: '5. Verified Resolution', count: summary?.resolved_complaints || 12, percent: summary?.resolution_rate_percent || 42, color: '#10B981', note: 'Geo-stamped closure audit' }
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '20px 28px 80px', color: '#F1F5F9' }}>
      
      {/* Top Header & Executive Ticker */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '28px',
        paddingBottom: '20px',
        borderBottom: '1px solid rgba(236, 179, 101, 0.25)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(236, 179, 101, 0.15)',
              border: '1px solid #ECB365',
              color: '#ECB365',
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '0.05em'
            }}>
              <Sparkles size={13} />
              EXECUTIVE MUNICIPAL BI &amp; NETWORK TOPOLOGY
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Real-time Autonomous Governance Intelligence
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: '#ffffff' }}>
            City Infrastructure Resilience &amp; SLA Command Dashboard
          </h1>
        </div>

        {/* Filters & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(4, 41, 58, 0.8)',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(180, 235, 230, 0.2)',
            fontSize: '13px'
          }}>
            <Filter size={14} color="#B4EBE6" />
            <span style={{ color: '#94a3b8' }}>Ward:</span>
            <select
              value={activeWard}
              onChange={(e) => setActiveWard(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ECB365',
                fontWeight: '700',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL" style={{ background: '#041C32' }}>All Urban Wards</option>
              <option value="NORTH" style={{ background: '#041C32' }}>Ward North-7</option>
              <option value="CENTRAL" style={{ background: '#041C32' }}>Ward Central-1</option>
              <option value="SOUTH" style={{ background: '#041C32' }}>Ward South-4</option>
              <option value="EAST" style={{ background: '#041C32' }}>Ward East-9</option>
            </select>
          </div>

          <button
            onClick={() => {
              if (onRunAgent) onRunAgent();
              else alert('Autonomous AI Triage agent triggered across all active ward complaints.');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #ECB365 0%, #d97706 100%)',
              color: '#041C32',
              fontWeight: '800',
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(236, 179, 101, 0.35)',
              transition: 'all 0.2s'
            }}
          >
            <Zap size={16} />
            Auto-Triage City Queue
          </button>
        </div>
      </div>

      {/* TOP ROW: RADAR SPIDER GRAPH + BUREAUCRATIC TOPOLOGY WEB */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
        gap: '24px',
        marginBottom: '28px'
      }}>
        
        {/* 1. SPIDER WEB / RADAR CHART */}
        <div style={{
          background: 'rgba(4, 41, 58, 0.65)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(180, 235, 230, 0.18)',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radar size={18} color="#ECB365" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
                  Departmental Capability &amp; Stress Radar
                </h3>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Multi-axis radar comparing live municipal velocity against municipal benchmark SLAs
              </p>
            </div>

            {/* Metric Selector */}
            <div style={{ display: 'flex', gap: '6px', background: 'rgba(4, 28, 50, 0.8)', padding: '4px', borderRadius: '8px' }}>
              {[
                { id: 'resolution_speed', label: 'Speed' },
                { id: 'severity_density', label: 'Hazard' },
                { id: 'sla_adherence', label: 'SLA' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedMetric(tab.id)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: '700',
                    borderRadius: '6px',
                    border: 'none',
                    background: selectedMetric === tab.id ? '#ECB365' : 'transparent',
                    color: selectedMetric === tab.id ? '#041C32' : '#94a3b8',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Radar Visualization */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <svg width="350" height="350" viewBox="0 0 350 350" style={{ overflow: 'visible' }}>
              {/* Concentric Polygons (Grid rings at 25%, 50%, 75%, 100%) */}
              {[0.25, 0.5, 0.75, 1.0].map((level, i) => {
                const ringPoints = radarDimensions.map(dim => {
                  const r = level * radarRadius;
                  const rad = (dim.angle - 90) * (Math.PI / 180);
                  return `${radarCenter + r * Math.cos(rad)},${radarCenter + r * Math.sin(rad)}`;
                }).join(' ');
                return (
                  <polygon
                    key={i}
                    points={ringPoints}
                    fill={i === 3 ? 'rgba(6, 70, 99, 0.25)' : 'none'}
                    stroke="rgba(180, 235, 230, 0.12)"
                    strokeWidth="1"
                    strokeDasharray={i < 3 ? '3 3' : 'none'}
                  />
                );
              })}

              {/* Axis Spoke Lines */}
              {radarDimensions.map((dim, i) => {
                const outer = getCoordinates(100, dim.angle);
                return (
                  <g key={i}>
                    <line
                      x1={radarCenter}
                      y1={radarCenter}
                      x2={outer.x}
                      y2={outer.y}
                      stroke="rgba(180, 235, 230, 0.2)"
                      strokeWidth="1.2"
                    />
                    {/* Axis Labels */}
                    <text
                      x={outer.x + (outer.x > radarCenter ? 12 : outer.x < radarCenter ? -12 : 0)}
                      y={outer.y + (outer.y > radarCenter ? 14 : outer.y < radarCenter ? -10 : 4)}
                      textAnchor={outer.x > radarCenter + 10 ? 'start' : outer.x < radarCenter - 10 ? 'end' : 'middle'}
                      fill="#B4EBE6"
                      fontSize="11"
                      fontWeight="700"
                    >
                      {dim.label}
                    </text>
                  </g>
                );
              })}

              {/* Benchmark Target Polygon (Cyan Outline) */}
              <polygon
                points={benchmarkRadarPoints.map(p => `${p.x},${p.y}`).join(' ')}
                fill="rgba(56, 189, 248, 0.12)"
                stroke="#38BDF8"
                strokeWidth="1.8"
                strokeDasharray="4 4"
              />

              {/* Live Municipal Performance Polygon (Glowing Amber) */}
              <polygon
                points={currentRadarPoints.map(p => `${p.x},${p.y}`).join(' ')}
                fill="rgba(236, 179, 101, 0.3)"
                stroke="#ECB365"
                strokeWidth="2.5"
                style={{ filter: 'drop-shadow(0 0 8px rgba(236, 179, 101, 0.5))' }}
              />

              {/* Radar Point Bullets */}
              {currentRadarPoints.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="4.5"
                  fill="#ECB365"
                  stroke="#041C32"
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint({ ...radarDimensions[i], val: radarData.current[i] })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </svg>
          </div>

          {/* Radar Legend & Hover readout */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ECB365', display: 'inline-block' }}></span>
                <span style={{ color: '#F5F5F5' }}>Live Municipal Queue</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38BDF8', display: 'inline-block' }}></span>
                <span style={{ color: '#94a3b8' }}>Target SLA Benchmark</span>
              </div>
            </div>

            {hoveredPoint ? (
              <span style={{ color: '#ECB365', fontWeight: '800' }}>
                {hoveredPoint.label}: {hoveredPoint.val}%
              </span>
            ) : (
              <span style={{ color: '#64748b', fontSize: '11px' }}>Hover vertices for metric drilldown</span>
            )}
          </div>
        </div>

        {/* 2. TOPOLOGY WEB GRAPH (BUREAUCRATIC NETWORK OF DEPARTMENTS & WARDS) */}
        <div style={{
          background: 'rgba(4, 41, 58, 0.65)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(180, 235, 230, 0.18)',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Network size={18} color="#38BDF8" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
                  Autonomous Bureaucracy Topology Web
                </h3>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Live interconnected mesh linking Command Core, Autonomous AI Dispatcher, Departments, and Wards
              </p>
            </div>
            
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: '#10B981',
              fontWeight: '700',
              background: 'rgba(16, 185, 129, 0.12)',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', animation: 'pulse 1.5s infinite' }}></span>
              12 ACTIVE NODES
            </span>
          </div>

          {/* Interactive Network Canvas */}
          <div style={{ position: 'relative', width: '100%', height: '320px', display: 'flex', justifyContent: 'center' }}>
            <svg width="100%" height="320" viewBox="0 0 560 320" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ECB365" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Connecting Edges */}
              {networkLinks.map((link, idx) => {
                const source = networkNodes.find(n => n.id === link.from);
                const target = networkNodes.find(n => n.id === link.to);
                if (!source || !target) return null;
                const isHighlighted = selectedNode && (selectedNode.id === source.id || selectedNode.id === target.id);
                return (
                  <g key={idx}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={isHighlighted ? '#ECB365' : 'rgba(180, 235, 230, 0.22)'}
                      strokeWidth={isHighlighted ? 2.5 : 1.2}
                      strokeDasharray={isHighlighted ? 'none' : '4 3'}
                    />
                    {/* Animated Data Packets flowing on links */}
                    <circle
                      r="2.5"
                      fill={isHighlighted ? '#ECB365' : '#38BDF8'}
                    >
                      <animateMotion
                        path={`M ${source.x} ${source.y} L ${target.x} ${target.y}`}
                        dur={link.speed}
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>
                );
              })}

              {/* Render Nodes */}
              {networkNodes.map(node => {
                const isSelected = selectedNode?.id === node.id;
                const isCore = node.type === 'core';
                const isDept = node.type === 'dept';
                const radius = isCore ? 20 : isDept ? 15 : 12;

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                  >
                    {/* Glowing outer ring if core or selected */}
                    {(isCore || isSelected) && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radius + 8}
                        fill="none"
                        stroke={node.color}
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        opacity="0.8"
                      />
                    )}

                    {/* Node Body */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radius}
                      fill={isCore ? '#041C32' : 'rgba(4, 41, 58, 0.95)'}
                      stroke={node.color}
                      strokeWidth={isSelected ? 3 : 2}
                      style={{ filter: isSelected ? `drop-shadow(0 0 10px ${node.color})` : 'none' }}
                    />

                    {/* Node Center Dot */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="4"
                      fill={node.color}
                    />

                    {/* Node Text Label */}
                    <text
                      x={node.x}
                      y={node.y + radius + 14}
                      textAnchor="middle"
                      fill={isSelected ? '#ECB365' : '#F1F5F9'}
                      fontSize="10"
                      fontWeight="700"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Selected Node Details Drawer */}
          <div style={{
            marginTop: '8px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(4, 28, 50, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px'
          }}>
            {selectedNode ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={16} color={selectedNode.color} />
                  <div>
                    <strong style={{ color: '#ffffff' }}>{selectedNode.label}</strong>
                    <span style={{ color: '#94a3b8', marginLeft: '8px' }}>
                      {selectedNode.officer ? `Officer: ${selectedNode.officer}` : selectedNode.population ? `Pop: ${selectedNode.population}` : 'Command Center'}
                    </span>
                  </div>
                </div>
                <span style={{ color: '#10B981', fontWeight: '800' }}>
                  {selectedNode.activeCases ? `${selectedNode.activeCases} Active Work Orders` : 'Status: Optimal'}
                </span>
              </>
            ) : (
              <span style={{ color: '#64748b' }}>
                💡 Click any Department, Ward, or Command node in the topology above to inspect live load &amp; latency.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: SEVERITY VS COMMUNITY PRIORITY QUADRANT SCATTER MATRIX */}
      <div style={{
        background: 'rgba(4, 41, 58, 0.65)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(180, 235, 230, 0.18)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="#ECB365" />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
                Algorithmic Risk vs. Community Sentiment Quadrant Matrix
              </h3>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
              Correlates AI Multimodal Hazard Severity (X-Axis) against Citizen Democratic Voting Escalation (Y-Axis)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#EF4444' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></span>
              Q-I: Critical Emergency
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#F59E0B' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}></span>
              Q-II: Silent Structural Risk
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#38BDF8' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8' }}></span>
              Q-III: High Public Concern
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10B981' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
              Q-IV: Routine Maintenance
            </span>
          </div>
        </div>

        {/* Scatter Plot SVG */}
        <div style={{ width: '100%', height: '340px', position: 'relative' }}>
          <svg width="100%" height="340" viewBox="0 0 900 340" style={{ overflow: 'visible' }}>
            {/* Background Quadrant Shading */}
            {/* Q-II: High Severity, Low Priority (Top Left) */}
            <rect x="70" y="20" width="390" height="140" fill="rgba(245, 158, 11, 0.04)" />
            {/* Q-I: High Severity, High Priority (Top Right) */}
            <rect x="460" y="20" width="390" height="140" fill="rgba(239, 68, 68, 0.06)" />
            {/* Q-IV: Low Severity, Low Priority (Bottom Left) */}
            <rect x="70" y="160" width="390" height="140" fill="rgba(16, 185, 129, 0.04)" />
            {/* Q-III: Low Severity, High Priority (Bottom Right) */}
            <rect x="460" y="160" width="390" height="140" fill="rgba(56, 189, 248, 0.04)" />

            {/* Quadrant Watermark Labels */}
            <text x="830" y="45" textAnchor="end" fill="#EF4444" fontSize="12" fontWeight="800" opacity="0.6">
              QUADRANT I: CRITICAL EMERGENCY ESCALATION
            </text>
            <text x="90" y="45" textAnchor="start" fill="#F59E0B" fontSize="12" fontWeight="800" opacity="0.6">
              QUADRANT II: SILENT STRUCTURAL RISK
            </text>
            <text x="830" y="280" textAnchor="end" fill="#38BDF8" fontSize="12" fontWeight="800" opacity="0.6">
              QUADRANT III: VIRAL CITIZEN CONCERN
            </text>
            <text x="90" y="280" textAnchor="start" fill="#10B981" fontSize="12" fontWeight="800" opacity="0.6">
              QUADRANT IV: ROUTINE CIVIC MAINTENANCE
            </text>

            {/* Axes Lines */}
            {/* Horizontal Divider (Priority Threshold = 100) */}
            <line x1="70" y1="160" x2="850" y2="160" stroke="rgba(180, 235, 230, 0.25)" strokeWidth="1.5" strokeDasharray="4 4" />
            {/* Vertical Divider (Severity Threshold = 50) */}
            <line x1="460" y1="20" x2="460" y2="300" stroke="rgba(180, 235, 230, 0.25)" strokeWidth="1.5" strokeDasharray="4 4" />

            {/* Outer Box */}
            <rect x="70" y="20" width="780" height="280" fill="none" stroke="rgba(180, 235, 230, 0.2)" strokeWidth="1" />

            {/* Axis Titles */}
            <text x="460" y="325" textAnchor="middle" fill="#B4EBE6" fontSize="11" fontWeight="700">
              Multimodal AI Hazard Severity Score (0 ➔ 100)
            </text>
            <text x="25" y="160" textAnchor="middle" fill="#B4EBE6" fontSize="11" fontWeight="700" transform="rotate(-90 25 160)">
              Community Priority (Upvotes &amp; SLA Weight)
            </text>

            {/* Plot Scatter Dots */}
            {scatterPoints.map((pt, idx) => {
              // Map severity (0-100) to X (70 -> 850)
              const cx = 70 + (pt.severity / 100) * 780;
              // Map priority (0-200) to Y (300 -> 20)
              const cy = 300 - (pt.priority / 200) * 280;
              const isCrit = pt.severity >= 75 || pt.priority >= 120;
              const dotColor = pt.severity >= 80 && pt.priority >= 100 ? '#EF4444' 
                             : pt.severity >= 70 ? '#F59E0B'
                             : pt.priority >= 90 ? '#38BDF8'
                             : '#10B981';

              return (
                <g key={pt.id} style={{ cursor: 'pointer' }} onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)}>
                  {isCrit && (
                    <circle cx={cx} cy={cy} r="14" fill={dotColor} opacity="0.2">
                      <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    cx={cx}
                    cy={cy}
                    r="7"
                    fill={dotColor}
                    stroke="#041C32"
                    strokeWidth="2"
                    style={{ filter: `drop-shadow(0 0 6px ${dotColor})` }}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hover Readout Bar */}
        <div style={{
          marginTop: '10px',
          padding: '10px 16px',
          borderRadius: '8px',
          background: 'rgba(4, 28, 50, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px'
        }}>
          {hoveredPoint?.title ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#ECB365', fontWeight: '800' }}>#{hoveredPoint.id.slice(-6)}</span>
                <span style={{ color: '#ffffff', fontWeight: '600' }}>{hoveredPoint.title}</span>
                <span style={{ color: '#94a3b8' }}>({hoveredPoint.address})</span>
              </div>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <span style={{ color: '#EF4444' }}>Severity: <strong>{hoveredPoint.severity}/100</strong></span>
                <span style={{ color: '#ECB365' }}>Priority: <strong>{hoveredPoint.priority}</strong></span>
                <span style={{ color: '#38BDF8' }}>Upvotes: <strong>{hoveredPoint.upvotes}</strong></span>
              </div>
            </>
          ) : (
            <span style={{ color: '#64748b' }}>
              💡 Hover any grievance node in the scatter plot to inspect its specific severity and community escalation rating.
            </span>
          )}
        </div>
      </div>

      {/* BOTTOM ROW: END-TO-END SANKEY SLA FUNNEL & DEPARTMENT GAUGES */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }}>
        
        {/* SANKEY PIPELINE STAGES */}
        <div style={{
          background: 'rgba(4, 41, 58, 0.65)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(180, 235, 230, 0.18)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <TrendingUp size={18} color="#10B981" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
              Municipal Resolution Velocity Funnel
            </h3>
          </div>
          <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#94a3b8' }}>
            Step-by-step conversion from citizen report to verified SLA resolution
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {pipelineFunnel.map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                  <span style={{ fontWeight: '700', color: '#F1F5F9' }}>{item.stage}</span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ color: '#94a3b8' }}>{item.count} grievances</span>
                    <span style={{ color: item.color, fontWeight: '800' }}>{item.percent}%</span>
                  </div>
                </div>
                {/* Progress track */}
                <div style={{
                  height: '8px',
                  borderRadius: '4px',
                  background: 'rgba(4, 28, 50, 0.8)',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    width: `${item.percent}%`,
                    height: '100%',
                    background: item.color,
                    borderRadius: '4px',
                    transition: 'width 0.8s ease'
                  }} />
                </div>
                <span style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                  {item.note}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* DEPARTMENTAL SLA STRESS GAUGES */}
        <div style={{
          background: 'rgba(4, 41, 58, 0.65)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(180, 235, 230, 0.18)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Activity size={18} color="#ECB365" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
              Department SLA Stress Gauges
            </h3>
          </div>
          <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#94a3b8' }}>
            On-time turnaround compliance rates across active municipal execution bodies
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {[
              { dept: 'Public Works & Roads', compliance: 94, status: 'EXCELLENT', color: '#10B981', target: '24h SLA' },
              { dept: 'Solid Waste Cell', compliance: 78, status: 'MODERATE', color: '#F59E0B', target: '48h SLA' },
              { dept: 'Water & Sewerage', compliance: 91, status: 'EXCELLENT', color: '#10B981', target: '12h SLA' },
              { dept: 'Power Grid Safety', compliance: 99, status: 'EXCELLENT', color: '#10B981', target: '6h SLA' }
            ].map((gauge, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(4, 28, 50, 0.7)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  textAlign: 'center'
                }}
              >
                {/* Circular Gauge SVG */}
                <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 8px' }}>
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="6"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke={gauge.color}
                      strokeWidth="6"
                      strokeDasharray={`${(gauge.compliance / 100) * 201} 201`}
                      strokeLinecap="round"
                      transform="rotate(-90 40 40)"
                      style={{ transition: 'stroke-dasharray 1s ease' }}
                    />
                  </svg>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '800',
                    color: gauge.color
                  }}>
                    {gauge.compliance}%
                  </div>
                </div>

                <div style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff', marginBottom: '2px' }}>
                  {gauge.dept}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                  Target: {gauge.target}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
