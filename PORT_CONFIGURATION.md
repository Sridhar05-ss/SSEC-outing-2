# Port Configuration Guide

This document explains the port configuration for the SSEC Outing application.

## Port Assignment

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| **EasyTime Pro** | 8081 | `http://127.0.0.1:8081` | Main EasyTime Pro application |
| **Backend API** | 3001 | `http://localhost:3001` | Node.js/Express backend server |
| **Frontend** | 5173 | `http://localhost:5173` | React/Vite frontend application |

## Service Communication Flow

```
Frontend (5173) → Backend (3001) → EasyTime Pro (8081)
```

1. **Frontend** (port 5173) makes API calls to **Backend** (port 3001)
2. **Backend** (port 3001) makes API calls to **EasyTime Pro** (port 8081)
3. **EasyTime Pro** (port 8081) processes requests and returns responses

## Starting Services

### Option 1: Using Comprehensive Scripts (Recommended)

#### Windows Batch Script
```bash
start-all-services.bat
```

#### PowerShell Script
```powershell
.\start-all-services.ps1
```

### Option 2: Using Basic Scripts

#### Windows Batch Script
```bash
start-services.bat
```

#### PowerShell Script
```powershell
.\start-services.ps1
```

### Option 3: Manual Start

#### 1. Start EasyTime Pro
Ensure EasyTime Pro is running on `http://127.0.0.1:8081`

#### 2. Start Backend
```bash
cd BACKEND
npm start
```
Backend will start on port 3001

#### 3. Start Frontend
```bash
npm run dev
```
Frontend will start on port 5173

## Configuration Files Updated

- `vite.config.ts` - Frontend port changed to 5173
- `BACKEND/server.js` - CORS updated to allow port 5173
- `src/config/easytimepro.ts` - EasyTime Pro URL updated to port 8081
- `BACKEND/services/apiService.js` - EasyTime Pro URL updated to port 8081
- `src/components/DeviceStatus.tsx` - Removed continuous polling to prevent API spam

## Troubleshooting

### Connection Refused Errors
- **Backend not running**: Use `check-and-start-backend.bat` to verify and start backend
- **Wrong ports**: Ensure all services are running on their assigned ports
- **EasyTime Pro**: Check that EasyTime Pro is accessible at `http://127.0.0.1:8081`
- **Frontend**: Confirm frontend is running on port 5173

### Continuous API Calls (Fixed)
- **DeviceStatus component**: Removed automatic 30-second polling interval
- **Management page**: Added error handling to prevent failed API call loops
- **Manual refresh**: Use refresh buttons instead of automatic polling

### CORS Errors
- Backend CORS is configured to allow requests from port 5173
- If using different ports, update CORS configuration in `BACKEND/server.js`

### API Endpoint Issues
- Frontend API calls go to `http://localhost:3001/api/*`
- Backend API calls to EasyTime Pro go to `http://127.0.0.1:8081/*`

### Common Error Messages
- `net::ERR_CONNECTION_REFUSED`: Service not running on expected port
- `Failed to fetch`: Network connectivity issue or service down
- `500 Internal Server Error`: Backend error, check backend console logs
- `401 Unauthorized`: Authentication issue with EasyTime Pro

## Environment Variables

You can override the default ports using environment variables:

```bash
# Backend port
PORT=3001

# EasyTime Pro URL
EASYTIMEPRO_API_URL=http://127.0.0.1:8081

# Frontend port (in vite.config.ts)
VITE_PORT=5173
```

## Quick Fix Commands

### Check if services are running:
```bash
netstat -an | findstr :8081  # EasyTime Pro
netstat -an | findstr :3001  # Backend
netstat -an | findstr :5173  # Frontend
```

### Kill processes on specific ports (if needed):
```bash
# Find process using port 3001
netstat -ano | findstr :3001
# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Restart all services:
1. Close all command windows
2. Run `start-all-services.bat`
3. Wait for all services to start
4. Access frontend at `http://localhost:5173`
