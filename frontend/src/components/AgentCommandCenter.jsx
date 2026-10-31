import React, { useState, useEffect } from 'react';
import { Bot, Play, RefreshCw, CheckCircle2, ShieldCheck, Mail, ArrowRight, Activity, Terminal, AlertTriangle } from 'lucide-react';
import { api } from '../api';

export default function AgentCommandCenter({ onAgentRunComplete }) {
  const [isRunning, setIsRunning] = useState(false);
  const [agentStatus, setAgentStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [lastRunSummary, setLastRunSummary] = useState(null);

  const fetchStatusAndLogs = async () => {
    try {
      const [st, lg] = await Promise.all([
        api.getAgentStatus(),
        api.getAgentLogs()
      ]);
      setAgentStatus(st);
      setLogs(lg);
    } catch (e) {
      console.error('Error fetching agent state:', e);
    }
  };

  useEffect(() => {
    fetchStatusAndLogs();
    const interval = setInterval(fetchStatusAndLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerCycle = async () => {
    setIsRunning(true);
    setLastRunSummary(null);
    try {
      const res = await api.triggerAgent();
      setLastRunSummary(res);
      await fetchStatusAndLogs();
      if (onAgentRunComplete) onAgentRunComplete();
    } catch (e) {
      alert(e.message || 'Error running LangGraph agent');
    } finally {
      setIsRunning(false);
    }
  };

  const graphNodes = [
    {
      id: 'triage',
      title: 'Triage & Verification',
      desc: 'Multimodal vision validation, confidence scoring, & severity index calculation',
      icon: ShieldCheck,
      color: '#38bdf8'
    },
    {
      id: 'route',
      title: 'Department Routing',
      desc: 'Matches civic problem type to nodal agency (PWD, SWM, WSSB, Power)',
      icon: Bot,
      color: '#818cf8'
    },
    {
      id: 'dispatch',
      title: 'Autonomous Dispatch',
      desc: 'Generates official municipal notice with GPS, photos & SLA deadlines',
      icon: Mail,
      color: '#10b981'
    },
    {
      id: 'monitor',
      title: 'Inbox Monitor & Resolution',
      desc: 'Parses incoming nodal replies and clears complaints automatically',
      icon: RefreshCw,
      color: '#c084fc'
    }
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '10px 24px 60px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              padding: '6px',
              borderRadius: '8px',
              background: 'rgba(129, 140, 248, 0.2)',
              color: '#818cf8'
            }}>
              <Bot size={20} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc' }}>
              LangGraph Autonomous Bureaucracy Agent
            </h2>
          </div>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
            StateGraph agent orchestrating automated verification, department routing, and grievance dispatch
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleTriggerCycle}
          disabled={isRunning}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '12px',
            background: isRunning ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #6366f1, #3b82f6)',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '700',
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          {isRunning ? <RefreshCw size={16} className="spin" /> : <Play size={16} />}
          {isRunning ? 'Executing LangGraph Cycle...' : 'Run Autonomous Triage Cycle'}
        </button>
      </div>

      {/* LangGraph Pipeline Architecture */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.75)',
        borderRadius: '18px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>
            LangGraph StateGraph Workflow Topology
          </h3>
          <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
            Active LangGraph Agent Engine
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          position: 'relative'
        }}>
          {graphNodes.map((node, i) => {
            const Icon = node.icon;
            return (
              <div
                key={node.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '14px',
                  padding: '20px',
                  border: `1px solid ${node.color}35`,
                  position: 'relative'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: `${node.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={18} color={node.color} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: node.color }}>
                    NODE 0{i + 1}
                  </span>
                </div>

                <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', marginBottom: '6px' }}>
                  {node.title}
                </h4>
                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  {node.desc}
                </p>

                {i < 3 && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    right: '-12px',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    display: 'none' // kept clean on responsive
                  }}>
                    <ArrowRight size={16} color="#64748b" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Batch Execution Results Notification */}
      {lastRunSummary && (
        <div style={{
          marginBottom: '24px',
          padding: '16px 20px',
          borderRadius: '12px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <strong style={{ color: '#34d399', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} />
              LangGraph Batch Cycle Completed Successfully
            </strong>
            <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '4px 0 0' }}>
              Triaged and dispatched {lastRunSummary.summary?.total_triaged || 0} pending civic grievances to their respective municipal departments.
            </p>
          </div>
          <button
            onClick={() => setLastRunSummary(null)}
            style={{ fontSize: '12px', color: '#94a3b8', background: 'transparent' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Live Agent Terminal Audit Stream */}
      <div style={{
        background: '#090d16',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden'
      }}>
        {/* Terminal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          background: 'rgba(15, 23, 42, 0.8)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={14} color="#38bdf8" />
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#cbd5e1', letterSpacing: '0.05em' }}>
              AUTONOMOUS AGENT AUDIT LOGS
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
          </div>
        </div>

        {/* Terminal Logs Content */}
        <div style={{
          padding: '18px',
          maxHeight: '360px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '12px',
          lineHeight: 1.7
        }}>
          {logs.length === 0 ? (
            <div style={{ color: '#64748b' }}>Standby: No agent executions logged yet.</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '8px', display: 'flex', gap: '12px' }}>
                <span style={{ color: '#64748b' }}>
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'LIVE'}
                </span>
                <span style={{
                  color: log.action?.includes('SENT') || log.action?.includes('COMPLETE') ? '#34d399' : '#38bdf8',
                  fontWeight: '700'
                }}>
                  [{log.action}]
                </span>
                <span style={{ color: '#cbd5e1' }}>
                  {log.details}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
