import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import GrievanceFeed from './components/GrievanceFeed';
import CivicMap from './components/CivicMap';
import TransparencyDashboard from './components/TransparencyDashboard';
import AgentCommandCenter from './components/AgentCommandCenter';
import CitizenStatus from './components/CitizenStatus';
import AdminAnalyticsDashboard from './components/AdminAnalyticsDashboard';
import ReportModal from './components/ReportModal';
import AuthModal from './components/AuthModal';
import { api, getStoredUser } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'map' | 'analytics' | 'agent' | 'my_status' | 'admin_analytics'
  const [complaints, setComplaints] = useState([]);
  const [summary, setSummary] = useState(null);
  const [user, setUser] = useState(getStoredUser());
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authPortal, setAuthPortal] = useState('citizen'); // 'citizen' | 'admin'
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

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

  // Community vote handler
  const handleVote = async (complaintId, voteType) => {
    try {
      if (!user) {
        setAuthPortal('citizen');
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

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setActiveTab('feed');
  };

  const handleOpenAdminAuth = () => {
    setAuthPortal('admin');
    setIsAuthOpen(true);
  };

  const handleOpenCitizenAuth = () => {
    setAuthPortal('citizen');
    setIsAuthOpen(true);
  };

  // Secure Role Switcher: To access Admin side, credentials are REQUIRED
  const handleSwitchRole = () => {
    if (isAdmin) {
      // Allow previewing citizen view
      const citizenUser = {
        id: 'citizen-demo-id',
        email: 'citizen.demo@civicpulse.org',
        role: 'citizen',
        first_name: 'Citizen'
      };
      localStorage.setItem('civic_user', JSON.stringify(citizenUser));
      setUser(citizenUser);
      setActiveTab('feed');
    } else {
      // STRICT: You CANNOT become Admin without entering Admin password!
      handleOpenAdminAuth();
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#041C32' }}>
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReport={() => setIsReportOpen(true)}
        user={user}
        onOpenAuth={handleOpenCitizenAuth}
        onOpenAdminAuth={handleOpenAdminAuth}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
      />

      {/* Hero Section displayed on home */}
      {activeTab === 'feed' && (
        <HeroSection
          isAdmin={isAdmin}
          onOpenReport={() => setIsReportOpen(true)}
          onExploreMap={() => setActiveTab('map')}
          onGoToCommunity={() => {
            const el = document.getElementById('community-feed-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onGoToStatus={() => setActiveTab(isAdmin ? 'analytics' : 'my_status')}
          onGoToAgent={() => setActiveTab('agent')}
          onGoToWebGraph={() => setActiveTab('admin_analytics')}
          onGoToTriage={() => {
            const el = document.getElementById('community-feed-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}

      {/* Main Tab Views */}
      <main style={{ flex: 1 }}>
        
        {/* Feed & Triage View */}
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

        {/* View on Map */}
        {activeTab === 'map' && (
          <CivicMap
            onVote={handleVote}
            user={user}
          />
        )}

        {/* Citizen "My Complaints" Tab */}
        {activeTab === 'my_status' && (
          <CitizenStatus
            complaints={complaints}
            user={user}
            onOpenReport={() => setIsReportOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {/* Admin SLA Analytics Tab */}
        {activeTab === 'analytics' && (
          <div style={{ paddingTop: '80px' }}>
            <TransparencyDashboard
              summary={summary}
            />
          </div>
        )}

        {/* Admin Advanced Web Graph & BI Dashboard (Admin Only) */}
        {activeTab === 'admin_analytics' && (
          <div style={{ paddingTop: '80px' }}>
            {isAdmin ? (
              <AdminAnalyticsDashboard
                complaints={complaints}
                summary={summary}
                onRunAgent={() => setActiveTab('agent')}
              />
            ) : (
              <div style={{ maxWidth: '600px', margin: '120px auto', textAlign: 'center', color: '#f87171' }}>
                <h3>Access Restricted</h3>
                <p>The Executive Web Graph &amp; Network BI Dashboard is reserved for Municipal Administrators.</p>
                <button
                  onClick={handleSwitchRole}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    backgroundColor: '#ECB365',
                    color: '#041C32',
                    fontWeight: '700',
                    marginTop: '16px'
                  }}
                >
                  Sign In as Admin
                </button>
              </div>
            )}
          </div>
        )}

        {/* Admin LangGraph Agent Lab (Admin Only) */}
        {activeTab === 'agent' && (
          <div style={{ paddingTop: '80px' }}>
            {isAdmin ? (
              <AgentCommandCenter
                onAgentRunComplete={loadData}
              />
            ) : (
              <div style={{ maxWidth: '600px', margin: '120px auto', textAlign: 'center', color: '#f87171' }}>
                <h3>Access Restricted</h3>
                <p>The LangGraph Autonomous Agent Console is reserved for Municipal Administrators.</p>
                <button
                  onClick={handleSwitchRole}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    backgroundColor: '#ECB365',
                    color: '#041C32',
                    fontWeight: '700'
                  }}
                >
                  Sign In as Admin
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* File Complaint Modal (Citizen / Admin) */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSuccess={() => {
          loadData();
          setActiveTab('feed');
        }}
      />

      {/* Secure Authentication Modal with Separate Citizen & Admin Portals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialPortal={authPortal}
        onAuthSuccess={(u) => {
          setUser(u);
          setActiveTab(u.role === 'admin' ? 'admin_analytics' : 'feed');
        }}
      />

    </div>
  );
}
