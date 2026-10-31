# 🏛️ CivicPulse Frontend (React 19 + Vite)

The frontend client for CivicPulse — Autonomous Civic Infrastructure Triage & Accountability Platform.

## 🚀 Tech Stack

- **Framework:** React 19 + Vite 6
- **Styling:** Custom CSS design system with glassmorphism, responsive grid layouts, and modern typography
- **Map & GIS:** Leaflet + React-Leaflet for interactive infrastructure defect heatmaps
- **Icons:** Lucide React
- **Linter:** Oxlint

## 📂 Component Architecture

```
frontend/src/
├── api.js                     # Unified API client & JWT storage helpers
├── App.jsx                    # Root state coordinator & tab switcher
├── index.css                  # Global tokens, color scales & theme utilities
├── components/
│   ├── Navbar.jsx             # Top bar, session status & tab controls
│   ├── HeroSection.jsx        # Civic problem verticals & quick submission triggers
│   ├── GrievanceFeed.jsx      # Complaint cards, community voting, status badges
│   ├── CivicMap.jsx           # Interactive GIS map with glowing category markers
│   ├── TransparencyDashboard.jsx # SLA resolution analytics & breakdown charts
│   ├── AgentCommandCenter.jsx # Live LangGraph execution terminal & node topology
│   ├── ReportModal.jsx        # Multimodal filing modal (camera, audio, speech-to-text)
│   └── AuthModal.jsx          # 1-click citizen & administrator demo login
```

## 🛠️ Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment settings:
   ```bash
   cp .env.example .env
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173`.
