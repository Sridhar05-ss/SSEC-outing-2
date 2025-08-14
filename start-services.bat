@echo off
echo Starting all services...
echo.
echo Port Configuration:
echo - Frontend (React): http://localhost:5173
echo - Backend (Node.js): http://localhost:3001
echo - EasyTime Pro: http://localhost:3000/admin
echo.

echo Starting Backend on port 3001...
cd BACKEND
start "Backend Server" cmd /k "npm start"

echo Starting Frontend on port 5173...
cd ..
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Services are starting...
echo Please ensure EasyTime Pro is running on http://localhost:3000/admin
echo.
echo Frontend will be available at: http://localhost:5173
echo Backend API will be available at: http://localhost:3001
echo.
pause
