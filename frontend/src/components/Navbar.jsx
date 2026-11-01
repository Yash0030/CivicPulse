import React from 'react';
import { User, LogOut } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenReport, user, onOpenAuth, onLogout }) {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999,
      backgroundColor: 'rgba(4, 28, 50, 0.92)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      borderBottom: '1px solid rgba(180, 235, 230, 0.1)',
      padding: '14px 32px',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        
        {/* fixmycity™ Logo */}
        <div 
          onClick={() => setActiveTab('feed')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <span style={{ fontSize: '32px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.5px' }}>
            fix<span style={{ color: '#FFC107' }}>mycity</span><span style={{ fontSize: '16px', color: '#FFC107', verticalAlign: 'super' }}>™</span>
          </span>
        </div>

        {/* Navigation Menu */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          {[
            { id: 'feed', label: 'Home' },
            { id: 'community', label: 'Community' },
            { id: 'map', label: 'View on Map' },
            { id: 'analytics', label: 'Complaint Status' },
            { id: 'agent', label: 'AI Agent' }
          ].map(item => {
            const isActive = activeTab === (item.id === 'community' ? 'feed' : item.id);
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'community') {
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
                  fontSize: '16px',
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

        {/* Auth Button Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '6px',
                border: '2px solid #ECB365',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <User size={16} color="#ECB365" />
                <span>{user.first_name || user.email.split('@')[0]}</span>
              </div>
              <button
                onClick={onLogout}
                title="Logout"
                style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  fontWeight: '600',
                  fontSize: '13px'
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={onOpenAuth}
                style={{
                  border: '2px solid #ECB365',
                  padding: '8px 22px',
                  color: '#ffffff',
                  backgroundColor: 'transparent',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '16px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#ECB365';
                  e.currentTarget.style.color = '#041C32';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#ffffff';
                }}
              >
                Register
              </button>
              <button
                onClick={onOpenAuth}
                style={{
                  border: '2px solid #ECB365',
                  padding: '8px 22px',
                  color: '#ffffff',
                  backgroundColor: 'transparent',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '16px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#ECB365';
                  e.currentTarget.style.color = '#041C32';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#ffffff';
                }}
              >
                Login
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
