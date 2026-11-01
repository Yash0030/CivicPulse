import React from 'react';
import { User, LogOut, ShieldAlert, CheckCircle, ShieldCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenReport, user, onOpenAuth, onOpenAdminAuth, onLogout, onSwitchRole }) {
  const isAdmin = user?.role === 'admin';

  // Role-specific navigation items
  const citizenTabs = [
    { id: 'feed', label: 'Home' },
    { id: 'community', label: 'Community' },
    { id: 'map', label: 'View on Map' },
    { id: 'my_status', label: 'My Complaints' },
  ];

  const adminTabs = [
    { id: 'feed', label: 'Home' },
    { id: 'feed_table', label: 'Admin Triage' },
    { id: 'map', label: 'View on Map' },
    { id: 'admin_analytics', label: '🕸️ Web Graph & BI' },
    { id: 'analytics', label: 'SLA Ledger' },
    { id: 'agent', label: 'LangGraph Agent Lab' },
  ];

  const currentTabs = isAdmin ? adminTabs : citizenTabs;

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999,
      backgroundColor: 'rgba(4, 28, 50, 0.95)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
      borderBottom: isAdmin ? '2px solid #ECB365' : '1px solid rgba(180, 235, 230, 0.15)',
      padding: '12px 32px',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        
        {/* fixmycity™ Brand Logo + Role Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div 
            onClick={() => setActiveTab('feed')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <span style={{ fontSize: '30px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.5px' }}>
              fix<span style={{ color: '#FFC107' }}>mycity</span><span style={{ fontSize: '15px', color: '#FFC107', verticalAlign: 'super' }}>™</span>
            </span>
          </div>

          {isAdmin ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '6px',
              background: 'rgba(236, 179, 101, 0.18)',
              border: '1px solid #ECB365',
              color: '#ECB365',
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '0.04em'
            }}>
              <ShieldAlert size={14} />
              MUNICIPAL ADMIN
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '6px',
              background: 'rgba(180, 235, 230, 0.12)',
              border: '1px solid rgba(180, 235, 230, 0.3)',
              color: '#B4EBE6',
              fontSize: '11px',
              fontWeight: '700'
            }}>
              <ShieldCheck size={14} />
              CITIZEN PORTAL
            </div>
          )}
        </div>

        {/* Dynamic Navigation Menu */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {currentTabs.map(item => {
            const isActive = activeTab === (item.id === 'community' || item.id === 'feed_table' ? 'feed' : item.id);
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'community' || item.id === 'feed_table') {
                    setActiveTab('feed');
                    setTimeout(() => {
                      const el = document.getElementById('community-feed-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                style={{
                  background: 'transparent',
                  color: isActive ? '#ECB365' : '#F5F5F5',
                  fontSize: '15px',
                  fontWeight: isActive ? '700' : '500',
                  padding: '6px 0',
                  position: 'relative',
                  transition: 'color 0.25s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#ECB365'}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.color = '#F5F5F5';
                }}
              >
                {item.label}
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: '#ECB365',
                    borderRadius: '2px'
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls & User Account */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Admin-only "Switch to Citizen View" preview button */}
          {isAdmin && (
            <button
              onClick={onSwitchRole}
              title="Preview the platform as an ordinary citizen"
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid rgba(180, 235, 230, 0.4)',
                background: 'rgba(180, 235, 230, 0.1)',
                color: '#B4EBE6',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              👤 Switch to Citizen View
            </button>
          )}

          {/* Citizen-only "File Issue" button (shown for citizen or guest) */}
          {!isAdmin && (
            <button
              onClick={onOpenReport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #ECB365 0%, #D49B45 100%)',
                color: '#041C32',
                fontSize: '13px',
                fontWeight: '800',
                boxShadow: '0 0 15px rgba(236, 179, 101, 0.35)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <span>+ File Issue</span>
            </button>
          )}

          {/* User Account Controls */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(180, 235, 230, 0.25)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '600'
              }}>
                <User size={15} color="#ECB365" />
                <span>{user.role === 'admin' ? 'Admin' : (user.first_name || user.email.split('@')[0])}</span>
              </div>
              <button
                onClick={onLogout}
                title="Logout"
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#f87171',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={onOpenAuth}
                style={{
                  border: '1px solid rgba(180, 235, 230, 0.3)',
                  padding: '7px 18px',
                  color: '#B4EBE6',
                  backgroundColor: 'rgba(180, 235, 230, 0.08)',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Citizen Sign In
              </button>
              <button
                onClick={onOpenAdminAuth}
                title="Municipal Admin Portal"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  border: '1px solid rgba(236, 179, 101, 0.5)',
                  padding: '7px 14px',
                  color: '#ECB365',
                  backgroundColor: 'rgba(236, 179, 101, 0.12)',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                <ShieldAlert size={14} />
                <span>Admin Login</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
