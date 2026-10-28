#!/usr/bin/env bash
# CampusCore Student Information Portal - Linux / macOS Launcher

echo "==================================================="
echo "  CAMPUSCORE STUDENT INFORMATION PORTAL LAUNCHER"
echo "==================================================="
echo ""

# 1. Check Node
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js and try again."
    exit 1
fi

echo "[OK] Node.js version: $(node -v)"

# 2. Check backend config & dependencies
if [ ! -f "backend/.env" ] && [ -f "backend/.env.example" ]; then
    cp backend/.env.example backend/.env
    echo "[OK] Created backend/.env"
fi

if [ ! -d "backend/node_modules" ]; then
    echo "[INFO] Installing backend dependencies..."
    (cd backend && npm install)
fi

# 3. Start Backend if not already running on port 5000
if lsof -i :5000 &> /dev/null; then
    echo "[OK] Backend server is already running on port 5000."
else
    echo "[INFO] Starting backend server on port 5000..."
    (cd backend && npm start) &
    sleep 2
fi

# 4. Open Frontend
echo "[OK] Opening frontend portal in default browser..."
if which xdg-open &> /dev/null; then
    xdg-open frontend/index.html &
elif which open &> /dev/null; then
    open frontend/index.html &
else
    echo "Open frontend/index.html in your browser: file://$(pwd)/frontend/index.html"
fi

echo ""
echo "==================================================="
echo "  System running successfully!"
echo "  - Backend API: http://localhost:5000/api"
echo "==================================================="
