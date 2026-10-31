#!/usr/bin/env bash
set -e

echo "==================================================="
echo "Starting CivicPulse Full-Stack Development Services"
echo "==================================================="

# Start backend in background
echo "[1/2] Launching FastAPI Backend on http://localhost:8000 ..."
(cd backend && python -m uvicorn backend.main:app --reload --port 8000) &
BACKEND_PID=$!

# Start frontend
echo "[2/2] Launching Vite React Frontend on http://localhost:5173 ..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

wait
