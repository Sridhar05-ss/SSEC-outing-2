Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    SSEC Outing Management System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting all services in the correct order..." -ForegroundColor Green
Write-Host ""

# Check EasyTime Pro
Write-Host "[1/3] Checking if EasyTime Pro is running on port 3000..." -ForegroundColor Yellow
$easytimeRunning = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($easytimeRunning) {
    Write-Host "✓ EasyTime Pro is running on port 3000" -ForegroundColor Green
} else {
    Write-Host "✗ EasyTime Pro is NOT running on port 3000" -ForegroundColor Red
    Write-Host "Please start EasyTime Pro on http://localhost:3000/admin" -ForegroundColor Yellow
    Write-Host ""
}

# Start Backend
Write-Host ""
Write-Host "[2/3] Starting Backend on port 3001..." -ForegroundColor Yellow
$backendRunning = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($backendRunning) {
    Write-Host "✓ Backend is already running on port 3001" -ForegroundColor Green
} else {
    Write-Host "Starting backend server..." -ForegroundColor Yellow
    Set-Location "BACKEND"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal
    Set-Location ".."
    Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

# Start Frontend
Write-Host ""
Write-Host "[3/3] Starting Frontend on port 5173..." -ForegroundColor Yellow
$frontendRunning = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($frontendRunning) {
    Write-Host "✓ Frontend is already running on port 5173" -ForegroundColor Green
} else {
    Write-Host "Starting frontend server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
    Write-Host "Waiting for frontend to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Service Status Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Checking final status..." -ForegroundColor Yellow

# Final status check
Write-Host "EasyTime Pro (Port 3000):" -ForegroundColor White
$easytimeFinal = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($easytimeFinal) { Write-Host "✓ Running" -ForegroundColor Green } else { Write-Host "✗ Not Running" -ForegroundColor Red }

Write-Host "Backend API (Port 3001):" -ForegroundColor White
$backendFinal = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($backendFinal) { Write-Host "✓ Running" -ForegroundColor Green } else { Write-Host "✗ Not Running" -ForegroundColor Red }

Write-Host "Frontend (Port 5173):" -ForegroundColor White
$frontendFinal = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($frontendFinal) { Write-Host "✓ Running" -ForegroundColor Green } else { Write-Host "✗ Not Running" -ForegroundColor Red }

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Access URLs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Frontend:     http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend API:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "EasyTime Pro: http://localhost:3000/admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If any service shows 'Not Running', please:" -ForegroundColor Yellow
Write-Host "1. Check the command windows that opened" -ForegroundColor White
Write-Host "2. Look for error messages" -ForegroundColor White
Write-Host "3. Ensure all dependencies are installed" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue"
