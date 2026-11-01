import React from 'react';
import { Edit3, Map, Users, CheckCircle2 } from 'lucide-react';

export default function HeroSection({ onOpenReport, onExploreMap, onGoToCommunity, onGoToStatus }) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(4, 28, 50, 0.75)), url('https://images.deccanherald.com/deccanherald%2Fimport%2Fsites%2Fdh%2Ffiles%2Farticleimages%2F2022%2F08%2F22%2Fpothole-1138292-1661174905.jpg?auto=format%2Ccompress&fmt=webp&fit=max&format=webp&q=70&w=1920')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      paddingTop: '80px',
      paddingBottom: '40px'
    }}>
      
      {/* Central Headline */}
      <div style={{
        textAlign: 'center',
        padding: '0 20px',
        maxWidth: '900px',
        marginBottom: '80px'
      }}>
        <h1 style={{
          fontFamily: '"Ubuntu", "Segoe UI", sans-serif',
          fontSize: '64px',
          fontWeight: '800',
          color: '#ffffff',
          lineHeight: 1.15,
          textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
          letterSpacing: '-0.02em',
          marginBottom: '16px'
        }}>
          <span>See it,&nbsp;</span>
          <span>Snap it,&nbsp;</span>
          <span style={{ color: '#FFC107' }}>Solve it</span>
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#E0E0E0',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
          maxWidth: '650px',
          margin: '0 auto',
          fontWeight: '500'
        }}>
          Intelligent Road Damage &amp; Pothole Redressal Platform powered by Agentic AI
        </p>
      </div>

      {/* Floating 4 Icon Boxes (from home.html) */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '1200px',
        padding: '0 24px',
        zIndex: 10
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          justifyContent: 'center'
        }}>
          
          {/* Box 1: File Complaint */}
          <div
            onClick={onOpenReport}
            style={{
              backgroundColor: '#064663',
              padding: '28px 20px',
              borderRadius: '12px',
              color: 'white',
              textAlign: 'center',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
              transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.backgroundColor = '#ECB365';
              e.currentTarget.style.color = '#041C32';
              const icon = e.currentTarget.querySelector('.box-icon');
              if (icon) icon.style.color = '#041C32';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.backgroundColor = '#064663';
              e.currentTarget.style.color = 'white';
              const icon = e.currentTarget.querySelector('.box-icon');
              if (icon) icon.style.color = '#ECB365';
            }}
          >
            <Edit3 className="box-icon" size={36} color="#ECB365" style={{ margin: '0 auto 12px', transition: 'color 0.3s' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>File Complaint</h3>
          </div>

          {/* Box 2: View on Map */}
          <div
            onClick={onExploreMap}
            style={{
              backgroundColor: '#064663',
              padding: '28px 20px',
              borderRadius: '12px',
              color: 'white',
              textAlign: 'center',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
              transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.backgroundColor = '#ECB365';
              e.currentTarget.style.color = '#041C32';
              const icon = e.currentTarget.querySelector('.box-icon');
              if (icon) icon.style.color = '#041C32';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.backgroundColor = '#064663';
              e.currentTarget.style.color = 'white';
              const icon = e.currentTarget.querySelector('.box-icon');
              if (icon) icon.style.color = '#ECB365';
            }}
          >
            <Map className="box-icon" size={36} color="#ECB365" style={{ margin: '0 auto 12px', transition: 'color 0.3s' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>View on Map</h3>
          </div>

          {/* Box 3: Community */}
          <div
            onClick={onGoToCommunity}
            style={{
              backgroundColor: '#064663',
              padding: '28px 20px',
              borderRadius: '12px',
              color: 'white',
              textAlign: 'center',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
              transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.backgroundColor = '#ECB365';
              e.currentTarget.style.color = '#041C32';
              const icon = e.currentTarget.querySelector('.box-icon');
              if (icon) icon.style.color = '#041C32';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.backgroundColor = '#064663';
              e.currentTarget.style.color = 'white';
              const icon = e.currentTarget.querySelector('.box-icon');
              if (icon) icon.style.color = '#ECB365';
            }}
          >
            <Users className="box-icon" size={36} color="#ECB365" style={{ margin: '0 auto 12px', transition: 'color 0.3s' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Community</h3>
          </div>

          {/* Box 4: Complaint Status */}
          <div
            onClick={onGoToStatus}
            style={{
              backgroundColor: '#064663',
              padding: '28px 20px',
              borderRadius: '12px',
              color: 'white',
              textAlign: 'center',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
              transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.backgroundColor = '#ECB365';
              e.currentTarget.style.color = '#041C32';
              const icon = e.currentTarget.querySelector('.box-icon');
              if (icon) icon.style.color = '#041C32';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.backgroundColor = '#064663';
              e.currentTarget.style.color = 'white';
              const icon = e.currentTarget.querySelector('.box-icon');
              if (icon) icon.style.color = '#ECB365';
            }}
          >
            <CheckCircle2 className="box-icon" size={36} color="#ECB365" style={{ margin: '0 auto 12px', transition: 'color 0.3s' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Complaint Status</h3>
          </div>

        </div>
      </div>

    </div>
  );
}
