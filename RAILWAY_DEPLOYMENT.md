# Railway Deployment Guide

## 🚀 **Deploying SSEC Outing Management System to Railway**

### **Step 1: Railway Project Setup**

1. **Create a new Railway project**
2. **Connect your GitHub repository**
3. **Deploy the project**

### **Step 2: Environment Variables**

Add these variables in your Railway project's **Variables** tab:

#### **Required Variables:**
```env
# Backend Configuration
PORT=3001

# Frontend Configuration  
VITE_BACKEND_URL=https://your-railway-backend-url.railway.app

# EasyTime Pro Configuration
VITE_EASYTIMEPRO_API_URL=http://127.0.0.1:8081
VITE_EASYTIMEPRO_USERNAME=admin
VITE_EASYTIMEPRO_PASSWORD=Admin@123

# ZKTeco Configuration
VITE_ZKTECO_API_URL=http://localhost:8000
```

#### **Optional Firebase Variables (if using Firebase):**
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### **Step 3: Important Notes**

#### **Backend URL Configuration:**
- **Development**: Uses `http://127.0.0.1:3001`
- **Production**: Uses `window.location.origin` (same domain as frontend)
- **Custom**: Set `VITE_BACKEND_URL` for custom backend URL

#### **CORS Configuration:**
The backend is configured to allow requests from:
- All Railway domains (`*.up.railway.app`)
- All Railway custom domains (`*.railway.app`)
- Your specific Railway URL

### **Step 4: Deployment Process**

1. **Railway will automatically:**
   - Install dependencies (`npm install`)
   - Run the Railway start script (`node start-railway.js`)
   - Create pre-build frontend immediately
   - Start server immediately (health check passes right away)
   - Build full frontend in background

2. **Health Check:**
   - Railway will check `/health` endpoint
   - Should return JSON with status and build info
   - Frontend will be served at `/` endpoint (loading page initially)
   - Reduced timeout to 60 seconds (server starts immediately)

### **Step 5: Troubleshooting**

#### **Common Issues:**

1. **Health Check Failures:**
   - **Cause**: Build process taking too long or failing
   - **Solution**: Server starts immediately with pre-build frontend
   - **Check**: Health check passes in under 60 seconds

2. **White Screen / "Backend is running" message:**
   - **Cause**: Backend is serving instead of frontend
   - **Solution**: Updated server to serve static files from `dist` directory
   - **Check**: Verify build process completed successfully

2. **CORS Errors:**
   - Ensure your Railway URL is in the CORS configuration
   - Check that `VITE_BACKEND_URL` is set correctly

3. **API Connection Errors:**
   - Verify EasyTime Pro is accessible from Railway
   - Check environment variables are set correctly

4. **Build Errors:**
   - Check that all dependencies are in `package.json`
   - Verify TypeScript compilation
   - Run `npm run build:check` to test build process

### **Step 6: Testing**

After deployment, test these endpoints:
- `https://your-app.railway.app/` - Frontend application
- `https://your-app.railway.app/health` - Backend health check
- `https://your-app.railway.app/api/zkteco/transactions` - Transactions
- `https://your-app.railway.app/api/easytime/add-employee` - Add employee

### **Step 7: Monitoring**

Monitor your Railway deployment:
- Check logs in Railway dashboard
- Monitor API response times
- Watch for CORS or connection errors

## 🔧 **Configuration Files**

### **railway.json**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start:railway",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### **package.json Scripts**
```json
{
  "scripts": {
    "start": "node BACKEND/server.js",
    "start:railway": "npm run build && node BACKEND/server.js",
    "postinstall": "npm run build"
  }
}
```

## 📝 **After Deployment**

1. **Update your frontend** to use the new Railway URL
2. **Test all functionality** (login, add employee, view logs)
3. **Monitor performance** and error logs
4. **Set up custom domain** if needed

## 🆘 **Support**

If you encounter issues:
1. Check Railway logs
2. Verify environment variables
3. Test API endpoints directly
4. Check CORS configuration
