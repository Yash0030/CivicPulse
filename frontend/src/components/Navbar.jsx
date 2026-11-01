import React from 'react';
import { MapPin, Activity, Bot, PlusCircle, User, LogOut, CheckCircle } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenReport, user, onOpenAuth, onLogout }) {
  return (
    <nav className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 1000, padding: '14px 28px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* fixmycity™ Brand Logo */}
        <div 
          onClick={() => setActiveTab('feed')} 
          style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ECB365 0%, #041C32 100%)',
            border: '1px solid rgba(236, 179, 101, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(236, 179, 101, 0.3)'
          }}>
            <span style={{ fontSize: '20px', fontWeight: '900', color: '#ECB365' }}>🛣</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em', color: '#ffffff' }}>
                fix<span style={{ color: '#ECB365' }}>mycity</span><span style={{ fontSize: '13px', verticalAlign: 'super', color: '#ECB365' }}>™</span>
              </span>
              <span style={{
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(236, 179, 101, 0.15)',
                color: '#ECB365',
                border: '1px solid rgba(236, 179, 101, 0.3)',
                fontWeight: '700',
                letterSpacing: '0.05em'
              }}>
                AGENTIC AI
              </span>
            </div>
            <p style={{ fontSize: '11px', color: '#B4EBE6', opacity: 0.8, margin: 0 }}>
              AI Pothole Detection &amp; Smart Road Redressal
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(2, 15, 28, 0.85)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid rgba(180, 235, 230, 0.12)'
        }}>
          {[
            { id: 'feed', label: 'Community Feed', icon: Activity },
            { id: 'map', label: 'View On Map', icon: MapPin },
            { id: 'analytics', label: 'Transparency SLA', icon: CheckCircle },
            { id: 'agent', label: 'AI Agent Console', icon: Bot },
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
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? '#041C32' : '#F5F5F5',
                  background: isActive ? 'linear-gradient(135deg, #ECB365, #F2D093)' : 'transparent',
                  border: isActive ? '1px solid #ECB365' : '1px solid transparent',
                  boxShadow: isActive ? '0 0 16px rgba(236, 179, 101, 0.35)' : 'none'
                }}
              >
                <Icon size={16} color={isActive ? '#041C32' : '#B4EBE6'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onOpenReport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ECB365 0%, #D49B45 100%)',
              color: '#041C32',
              fontSize: '13px',
              fontWeight: '700',
              boxShadow: '0 0 20px rgba(236, 179, 101, 0.35)',
            }}
          >
            <PlusCircle size={16} color="#041C32" />
            File Complaint
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'rgba(2, 15, 28, 0.8)',
                border: '1px solid rgba(180, 235, 230, 0.2)',
                fontSize: '12px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: user.role === 'admin' ? '#ECB365' : '#10b981'
                }} />
                <span style={{ color: '#F5F5F5', fontWeight: '600' }}>
                  {user.first_name || user.email.split('@')[0]}
                </span>
                <span style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: user.role === 'admin' ? 'rgba(236, 179, 101, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: user.role === 'admin' ? '#ECB365' : '#34d399',
                  fontWeight: '700'
                }}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Logout"
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.25)'
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
                padding: '9px 16px',
                borderRadius: '8px',
                background: 'rgba(180, 235, 230, 0.08)',
                border: '1px solid rgba(180, 235, 230, 0.25)',
                color: '#B4EBE6',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              <User size={15} color="#B4EBE6" />
              Login / Register
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}
