import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import GrievanceFeed from './components/GrievanceFeed';
import CivicMap from './components/CivicMap';
import TransparencyDashboard from './components/TransparencyDashboard';
import AgentCommandCenter from './components/AgentCommandCenter';
import ReportModal from './components/ReportModal';
import AuthModal from './components/AuthModal';
import { api, getStoredUser } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'map' | 'analytics' | 'agent'
  const [complaints, setComplaints] = useState([]);
  const [summary, setSummary] = useState(null);
  const [user, setUser] = useState(getStoredUser());
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [complaintsData, summaryData] = await Promise.all([
        api.getComplaints(),
        api.getAnalytics()
      ]);
      setComplaints(complaintsData);
      setSummary(summaryData);
    } catch (e) {
      console.error('Failed to load platform data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVote = async (complaintId, voteType) => {
    try {
      if (!user) {
        setIsAuthOpen(true);
        return;
      }
      const updated = await api.vote(complaintId, voteType);
      setComplaints(prev => prev.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            upvotes: updated.upvotes,
            downvotes: updated.downvotes,
            priority: updated.priority,
            user_vote: updated.user_vote
          };
        }
        return c;
      }));
    } catch (err) {
      alert(err.message || 'Error recording community vote');
    }
  };

  const handleCategorySelect = (categoryId) => {
    setActiveTab('feed');
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReport={() => setIsReportOpen(true)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Hero Section displayed on feed/home */}
      {activeTab === 'feed' && (
        <HeroSection
          onOpenReport={() => setIsReportOpen(true)}
          onExploreMap={() => setActiveTab('map')}
          onGoToCommunity={() => {
            const el = document.getElementById('community-feed-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onGoToStatus={() => setActiveTab('analytics')}
        />
      )}

      {/* Main Tab Views */}
      <main style={{ flex: 1 }}>
        {activeTab === 'feed' && (
          <div id="community-feed-section">
            <GrievanceFeed
              complaints={complaints}
              onVote={handleVote}
              onRefresh={loadData}
              user={user}
            />
          </div>
        )}

        {activeTab === 'map' && (
          <CivicMap
            onVote={handleVote}
            user={user}
          />
        )}

        {activeTab === 'analytics' && (
          <TransparencyDashboard
            summary={summary}
          />
        )}

        {activeTab === 'agent' && (
          <AgentCommandCenter
            onAgentRunComplete={loadData}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '24px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#64748b',
        background: '#090d16'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong>CivicPulse Platform</strong> • Theme 1: Civic Pulse, Digital Governance &amp; Public Information
          </div>
          <div>
            FastAPI Backend • React 19 Frontend • LangGraph Autonomous StateGraph Agent
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSuccess={(result) => {
          loadData();
          setActiveTab('feed');
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(userData) => {
          setUser(userData);
          loadData();
        }}
      />

    </div>
  );
}
