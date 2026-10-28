@echo off
TITLE CampusCore Student Information Portal Launcher
COLOR 0B

echo ===================================================
echo   CAMPUSCORE STUDENT INFORMATION PORTAL LAUNCHER
echo ===================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    COLOR 0C
    echo [ERROR] Node.js is not installed or not added to your PATH!
    echo Please install Node.js from https://nodejs.org/ and try again.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js detected:
node -v
echo.

:: 2. Setup backend environment and dependencies
echo [1/3] Preparing backend configuration...
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
        echo [OK] Created backend\.env from template.
    )
)

if not exist "backend\node_modules" (
    echo [INFO] Installing backend dependencies (this only happens once)...
    cd backend
    call npm install
    cd ..
) else (
    echo [OK] Backend dependencies are already installed.
)
echo.

:: 3. Start Backend API Server in a dedicated window
echo [2/3] Launching backend server on port 5000...
start "CampusCore Backend API Server (Port 5000)" cmd /k "cd backend && npm start"

:: Wait 3 seconds for server initialization
echo Waiting for backend to initialize...
timeout /t 3 /nobreak >nul
echo [OK] Backend server started.
echo.

:: 4. Launch Frontend
echo [3/3] Opening frontend portal...
if exist "frontend\index.html" (
    start "" "frontend\index.html"
    echo [OK] Frontend opened in your default web browser!
) else (
    echo [ERROR] frontend\index.html was not found.
)

echo.
echo ===================================================
echo   System running successfully!
echo   - Backend API: http://localhost:5000/api
echo   - Keep the backend window open while using the app.
echo ===================================================
echo.
pause
