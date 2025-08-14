Write-Host "Starting all services..." -ForegroundColor Green
Write-Host ""
Write-Host "Port Configuration:" -ForegroundColor Yellow
Write-Host "- Frontend (React): http://localhost:5173" -ForegroundColor Cyan
Write-Host "- Backend (Node.js): http://localhost:3001" -ForegroundColor Cyan
Write-Host "- EasyTime Pro: http://localhost:3000/admin" -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "Starting Backend on port 3001..." -ForegroundColor Green
Set-Location "BACKEND"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

# Start Frontend
Write-Host "Starting Frontend on port 5173..." -ForegroundColor Green
Set-Location ".."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Services are starting..." -ForegroundColor Yellow
Write-Host "Please ensure EasyTime Pro is running on http://localhost:3000/admin" -ForegroundColor Yellow
Write-Host ""
Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend API will be available at: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to continue"
