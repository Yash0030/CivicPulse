import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, MapPin, PlusCircle, User, ShieldCheck } from 'lucide-react';

export default function CitizenStatus({ complaints, user, onOpenReport, onOpenAuth }) {
  if (!user) {
    return (
      <div style={{ maxWidth: '800px', margin: '100px auto', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{
          backgroundColor: '#041C32',
          border: '1px solid rgba(180, 235, 230, 0.2)',
          borderRadius: '16px',
          padding: '48px 24px',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)'
        }}>
          <User size={48} color="#ECB365" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', marginBottom: '8px' }}>
            Track Your Reported Complaints
          </h2>
          <p style={{ fontSize: '14px', color: '#B4EBE6', maxWidth: '480px', margin: '0 auto 24px' }}>
            Please sign in to view the live progress, municipal assignments, and resolution status of complaints you have filed.
          </p>
          <button
            onClick={onOpenAuth}
            style={{
              background: 'linear-gradient(135deg, #ECB365 0%, #D49B45 100%)',
              color: '#041C32',
              fontWeight: '800',
              padding: '12px 28px',
              borderRadius: '8px',
              fontSize: '15px'
            }}
          >
            Sign In to View Your Complaints
          </button>
        </div>
      </div>
    );
  }

  // Filter complaints filed by this citizen
  const myComplaints = complaints.filter(c => c.user_email === user.email || !c.user_email);
  const activeCount = myComplaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'REJECTED').length;
  const resolvedCount = myComplaints.filter(c => c.status === 'RESOLVED').length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 24px 60px' }}>
      
      {/* Citizen Profile Banner */}
      <div style={{
        backgroundColor: '#041C32',
        border: '1px solid rgba(180, 235, 230, 0.2)',
        borderRadius: '16px',
        padding: '28px 32px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: '#064663',
            border: '2px solid #ECB365',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ECB365',
            fontSize: '22px',
            fontWeight: '800'
          }}>
            {user.first_name ? user.first_name[0].toUpperCase() : user.email[0].toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
              {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.email}
            </h2>
            <p style={{ fontSize: '13px', color: '#B4EBE6', margin: '4px 0 0', opacity: 0.85 }}>
              Citizen Grievance Redressal Dashboard • {user.email}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenReport}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #ECB365 0%, #D49B45 100%)',
            color: '#041C32',
            fontWeight: '700',
            fontSize: '13px'
          }}
        >
          <PlusCircle size={16} />
          Report New Pothole
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{
          backgroundColor: '#020F1C',
          border: '1px solid rgba(180, 235, 230, 0.15)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '12px', color: '#B4EBE6', fontWeight: '600', textTransform: 'uppercase' }}>Total Reported</span>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#ffffff', marginTop: '6px' }}>
            {myComplaints.length}
          </div>
        </div>

        <div style={{
          backgroundColor: '#020F1C',
          border: '1px solid rgba(236, 179, 101, 0.25)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '12px', color: '#ECB365', fontWeight: '600', textTransform: 'uppercase' }}>Active In-Progress</span>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#ECB365', marginTop: '6px' }}>
            {activeCount}
          </div>
        </div>

        <div style={{
          backgroundColor: '#020F1C',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600', textTransform: 'uppercase' }}>Resolved & Closed</span>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981', marginTop: '6px' }}>
            {resolvedCount}
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
        Your Grievances &amp; Resolution Tracking
      </h3>

      {myComplaints.length === 0 ? (
        <div style={{
          backgroundColor: '#041C32',
          border: '1px solid rgba(180, 235, 230, 0.15)',
          borderRadius: '12px',
          padding: '40px 20px',
          textAlign: 'center',
          color: '#94a3b8'
        }}>
          <AlertTriangle size={32} color="#ECB365" style={{ margin: '0 auto 10px' }} />
          <p style={{ margin: 0 }}>You haven't submitted any complaints yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {myComplaints.map(c => {
            const isResolved = c.status === 'RESOLVED';
            return (
              <div
                key={c.id}
                style={{
                  backgroundColor: '#041C32',
                  border: '1px solid rgba(180, 235, 230, 0.15)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {c.image_url && (
                    <img
                      src={c.image_url}
                      alt={c.title}
                      style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: isResolved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(236, 179, 101, 0.2)',
                        color: isResolved ? '#10b981' : '#ECB365',
                        fontWeight: '700'
                      }}>
                        {c.status?.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Priority #{c.priority} • {c.upvotes || 0} Upvotes
                      </span>
                    </div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', margin: '0 0 4px' }}>
                      {c.title}
                    </h4>
                    <p style={{ fontSize: '12px', color: '#B4EBE6', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="#ECB365" />
                      {c.address}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#B4EBE6', marginBottom: '4px' }}>
                    Assigned Dept: <strong style={{ color: '#ffffff' }}>{c.department || 'Public Works Dept'}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                    <Clock size={12} />
                    SLA Deadline: {c.sla_hours || 24} Hours
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
