@echo off
echo ========================================
echo    SSEC Outing Management System
echo ========================================
echo.
echo Starting all services in the correct order...
echo.

echo [1/3] Checking if EasyTime Pro is running on port 8081...
netstat -an | findstr :8081 >nul
if %errorlevel% equ 0 (
    echo ✓ EasyTime Pro is running on port 8081
) else (
    echo ✗ EasyTime Pro is NOT running on port 8081
    echo Please start EasyTime Pro on http://127.0.0.1:8081
    echo.
)

echo.
echo [2/3] Starting Backend on port 3001...
netstat -an | findstr :3001 >nul
if %errorlevel% equ 0 (
    echo ✓ Backend is already running on port 3001
) else (
    echo Starting backend server...
    cd BACKEND
    start "Backend Server" cmd /k "npm start"
    cd ..
    echo Waiting for backend to start...
    timeout /t 5 /nobreak >nul
)

echo.
echo [3/3] Starting Frontend on port 5173...
netstat -an | findstr :5173 >nul
if %errorlevel% equ 0 (
    echo ✓ Frontend is already running on port 5173
) else (
    echo Starting frontend server...
    start "Frontend Server" cmd /k "npm run dev"
    echo Waiting for frontend to start...
    timeout /t 5 /nobreak >nul
)

echo.
echo ========================================
echo    Service Status Summary
echo ========================================
echo.
echo Checking final status...

echo EasyTime Pro (Port 8081):
netstat -an | findstr :8081 >nul && echo ✓ Running || echo ✗ Not Running

echo Backend API (Port 3001):
netstat -an | findstr :3001 >nul && echo ✓ Running || echo ✗ Not Running

echo Frontend (Port 5173):
netstat -an | findstr :5173 >nul && echo ✓ Running || echo ✗ Not Running

echo.
echo ========================================
echo    Access URLs
echo ========================================
echo Frontend:     http://localhost:5173
echo Backend API:  http://localhost:3001
echo EasyTime Pro: http://127.0.0.1:8081
echo.
echo ========================================
echo.
echo If any service shows "Not Running", please:
echo 1. Check the command windows that opened
echo 2. Look for error messages
echo 3. Ensure all dependencies are installed
echo.
pause
