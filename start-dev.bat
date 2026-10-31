@echo off
title CivicPulse Local Development Launcher
echo ===================================================
echo Starting CivicPulse Full-Stack Development Services
echo ===================================================

echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "CivicPulse Backend" cmd /k "cd backend && python -m uvicorn backend.main:app --reload --port 8000"

echo [2/2] Starting Vite React Frontend on http://localhost:5173 ...
start "CivicPulse Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both services launched in separate windows!
echo Backend Docs: http://localhost:8000/docs
echo Frontend App: http://localhost:5173
echo ===================================================
