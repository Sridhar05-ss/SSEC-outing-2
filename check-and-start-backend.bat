@echo off
echo Checking if backend is running on port 3001...

netstat -an | findstr :3001 >nul
if %errorlevel% equ 0 (
    echo Backend is already running on port 3001
) else (
    echo Backend is not running. Starting backend...
    cd BACKEND
    start "Backend Server" cmd /k "npm start"
    cd ..
    echo Backend started. Please wait a few seconds for it to fully initialize.
)

echo.
echo Current port status:
echo - Frontend: http://localhost:5173
echo - Backend: http://localhost:3001
echo - EasyTime Pro: http://localhost:3000/admin
echo.
pause
