import React, { useState } from 'react';
import { X, User, Lock, Mail, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  if (!isOpen) return null;

  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.login(email, password);
        onAuthSuccess(res.user);
        onClose();
      } else {
        const res = await api.register({
          first_name: firstName,
          last_name: lastName,
          email,
          password
        });
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@civicpulse.org');
      setPassword('admin123');
      setIsLogin(true);
    } else {
      setEmail('citizen.demo@civicpulse.org');
      setPassword('citizen123');
      setIsLogin(true);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#0f172a',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '440px',
        padding: '28px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#f8fafc' }}>
              {isLogin ? 'Sign In to CivicPulse' : 'Create Citizen Account'}
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0' }}>
              Digital Governance Citizen Portal
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '6px',
              borderRadius: '8px',
              color: '#94a3b8'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Demo Fast Login Buttons for Evaluators */}
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          borderRadius: '12px',
          background: 'rgba(6, 182, 212, 0.08)',
          border: '1px solid rgba(6, 182, 212, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#38bdf8', fontWeight: '700', marginBottom: '8px' }}>
            <Sparkles size={12} />
            EVALUATOR QUICK-SIGN IN
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#fbbf24',
                fontSize: '11px',
                fontWeight: '700'
              }}
            >
              Demo Admin / Officer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('citizen')}
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                fontSize: '11px',
                fontWeight: '700'
              }}
            >
              Demo Citizen
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '12px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
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
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '13px'
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
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@civicpulse.org"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '13px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '13px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '700',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
            }}
          >
            {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            style={{
              background: 'transparent',
              fontSize: '12px',
              color: '#38bdf8'
            }}
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already registered? Sign In"}
          </button>
        </div>

      </div>
    </div>
  );
}
