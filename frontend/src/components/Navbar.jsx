import React from 'react';
import { ShieldCheck, MapPin, Activity, Bot, PlusCircle, User, LogOut } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenReport, user, onOpenAuth, onLogout }) {
  return (
    <nav className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 1000, padding: '12px 24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('feed')} 
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
          }}>
            <ShieldCheck size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.03em', color: '#f8fafc' }}>
                Civic<span style={{ color: '#06b6d4' }}>Pulse</span>
              </span>
              <span style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '6px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                fontWeight: '600'
              }}>
                THEME 1 GOVERNANCE
              </span>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
              AI Civic Grievance & Infrastructure Triage
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {[
            { id: 'feed', label: 'Civic Feed', icon: Activity },
            { id: 'map', label: 'Infrastructure Map', icon: MapPin },
            { id: 'analytics', label: 'Accountability Pulse', icon: Activity },
            { id: 'agent', label: 'LangGraph Agent Lab', icon: Bot },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? '#f8fafc' : '#94a3b8',
                  background: isActive ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(59, 130, 246, 0.25))' : 'transparent',
                  border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                  boxShadow: isActive ? '0 0 15px rgba(6, 182, 212, 0.2)' : 'none'
                }}
              >
                <Icon size={16} color={isActive ? '#38bdf8' : '#64748b'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onOpenReport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.35)',
              transform: 'translateY(0)'
            }}
          >
            <PlusCircle size={16} />
            Report Civic Issue
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '12px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: user.role === 'admin' ? '#f59e0b' : '#10b981'
                }} />
                <span style={{ color: '#f8fafc', fontWeight: '500' }}>
                  {user.first_name || user.email.split('@')[0]}
                </span>
                <span style={{
                  fontSize: '10px',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  background: user.role === 'admin' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: user.role === 'admin' ? '#fbbf24' : '#34d399'
                }}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Logout"
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#e2e8f0',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              <User size={15} color="#94a3b8" />
              Sign In
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}
