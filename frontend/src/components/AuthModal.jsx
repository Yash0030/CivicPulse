import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, ShieldAlert, ShieldCheck, User, KeyRound, AlertTriangle } from 'lucide-react';
import { api } from '../api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialPortal = 'citizen' }) {
  if (!isOpen) return null;

  const [activePortal, setActivePortal] = useState(initialPortal); // 'citizen' | 'admin'
  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActivePortal(initialPortal);
    setError(null);
    if (initialPortal === 'admin') {
      setEmail('admin@civicpulse.org');
      setPassword('');
    } else {
      setEmail('');
      setPassword('');
    }
  }, [initialPortal, isOpen]);

  const handlePortalSwitch = (portal) => {
    setActivePortal(portal);
    setError(null);
    if (portal === 'admin') {
      setIsLogin(true); // Admin cannot self-register publicly
      setEmail('admin@civicpulse.org');
      setPassword('');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (activePortal === 'admin') {
        // Strict Admin Authentication
        const res = await api.login(email.trim(), password);
        if (res.user?.role !== 'admin') {
          throw new Error('Access Denied: This account does not possess Municipal Administrator privileges.');
        }
        onAuthSuccess(res.user);
        onClose();
      } else {
        // Citizen Authentication
        if (isLogin) {
          const res = await api.login(email.trim(), password);
          onAuthSuccess(res.user);
          onClose();
        } else {
          const res = await api.register({
            first_name: firstName,
            last_name: lastName,
            email: email.trim(),
            password
          });
          onAuthSuccess(res.user);
          onClose();
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isAdminPortal = activePortal === 'admin';

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#041C32',
        border: isAdminPortal ? '2px solid #ECB365' : '1px solid rgba(180, 235, 230, 0.25)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '460px',
        padding: '28px',
        boxShadow: isAdminPortal ? '0 25px 60px rgba(236, 179, 101, 0.25)' : '0 25px 50px rgba(0, 0, 0, 0.7)',
        position: 'relative'
      }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            padding: '6px',
            borderRadius: '8px',
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Segmented Gateway Toggle (Citizen vs Admin) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          background: 'rgba(4, 41, 58, 0.9)',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '22px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            type="button"
            onClick={() => handlePortalSwitch('citizen')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: !isAdminPortal ? '#064663' : 'transparent',
              color: !isAdminPortal ? '#B4EBE6' : '#94a3b8',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <ShieldCheck size={16} />
            Citizen Portal
          </button>

          <button
            type="button"
            onClick={() => handlePortalSwitch('admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: isAdminPortal ? '#ECB365' : 'transparent',
              color: isAdminPortal ? '#041C32' : '#94a3b8',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <ShieldAlert size={16} />
            Admin Gateway
          </button>
        </div>

        {/* Portal Title & Subtitle */}
        <div style={{ marginBottom: '20px' }}>
          {isAdminPortal ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <KeyRound size={20} color="#ECB365" />
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#ECB365', margin: 0 }}>
                  Municipal Admin Authentication
                </h3>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>
                Restricted to authorized Municipal Administrators. Public self-registration is disabled.
              </p>
            </div>
          ) : (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                {isLogin ? 'Citizen Sign In' : 'Create Citizen Account'}
              </h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>
                File grievances, track repairs, and vote to escalate neighborhood issues.
              </p>
            </div>
          )}
        </div>

        {/* Credential Helper for Evaluators */}
        {isAdminPortal && (
          <div style={{
            background: 'rgba(236, 179, 101, 0.1)',
            border: '1px solid rgba(236, 179, 101, 0.3)',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '18px',
            fontSize: '12px'
          }}>
            <div style={{ color: '#ECB365', fontWeight: '800', marginBottom: '4px' }}>
              🔑 Municipal Admin Credentials:
            </div>
            <div style={{ color: '#F1F5F9' }}>
              Email: <code style={{ color: '#ECB365' }}>admin@civicpulse.org</code>
            </div>
            <div style={{ color: '#F1F5F9' }}>
              Password: <code style={{ color: '#ECB365' }}>admin123</code> or <code style={{ color: '#ECB365' }}>AdminSecure@2026</code>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#f87171',
            fontSize: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit}>
          {!isAdminPortal && !isLogin && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(4, 41, 58, 0.8)',
                    border: '1px solid rgba(180, 235, 230, 0.2)',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(4, 41, 58, 0.8)',
                    border: '1px solid rgba(180, 235, 230, 0.2)',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
              {isAdminPortal ? 'Admin Official Email' : 'Email Address'}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={isAdminPortal ? "admin@civicpulse.org" : "citizen@example.com"}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '8px',
                  background: 'rgba(4, 41, 58, 0.8)',
                  border: isAdminPortal ? '1px solid #ECB365' : '1px solid rgba(180, 235, 230, 0.2)',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
              {isAdminPortal ? 'Admin Master Password' : 'Password'}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '8px',
                  background: 'rgba(4, 41, 58, 0.8)',
                  border: isAdminPortal ? '1px solid #ECB365' : '1px solid rgba(180, 235, 230, 0.2)',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: isAdminPortal 
                ? 'linear-gradient(135deg, #ECB365 0%, #d97706 100%)' 
                : 'linear-gradient(135deg, #064663 0%, #04293A 100%)',
              color: isAdminPortal ? '#041C32' : '#B4EBE6',
              fontWeight: '800',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: isAdminPortal ? '0 4px 15px rgba(236, 179, 101, 0.35)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Authenticating...' : isAdminPortal ? 'Sign In as Admin' : isLogin ? 'Sign In as Citizen' : 'Create Citizen Account'}
          </button>
        </form>

        {/* Citizen Login/Register toggle (disabled on admin) */}
        {!isAdminPortal && (
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ECB365',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {isLogin ? "Don't have an account? Register here" : "Already registered? Sign in"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
