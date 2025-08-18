# Railway Environment Variables Setup Guide

## 🚀 **Complete Environment Variables for Railway Deployment**

### **Step 1: Access Railway Environment Variables**

1. **Go to your Railway project dashboard**
2. **Click on your project**
3. **Go to the "Variables" tab**
4. **Add the following environment variables:**

---

## **📋 Required Environment Variables**

### **🔧 Backend Configuration**
```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Backend URL (will be your Railway app URL)
VITE_BACKEND_URL=https://your-railway-app-name.up.railway.app
```

### **🌐 EasyTime Pro Configuration**
```env
# EasyTime Pro API Settings
VITE_EASYTIMEPRO_API_URL=http://127.0.0.1:8081
VITE_EASYTIMEPRO_USERNAME=admin
VITE_EASYTIMEPRO_PASSWORD=Admin@123
```

### **🔐 ZKTeco Configuration**
```env
# ZKTeco Device Settings
VITE_ZKTECO_API_URL=http://localhost:8000
```

### **🔥 Firebase Configuration (Optional)**
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyAWKmpLqiOApfLb9OGa2WEfs_AmPiItA2g
VITE_FIREBASE_AUTH_DOMAIN=ssec-outing.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://ssec-outing-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=ssec-outing
VITE_FIREBASE_STORAGE_BUCKET=ssec-outing.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=286869609907
VITE_FIREBASE_APP_ID=1:286869609907:web:91bee1c3ddbdffdaa47fc6
VITE_FIREBASE_MEASUREMENT_ID=G-3DPMH890P2
```

---

## **📝 How to Add Environment Variables in Railway**

### **Method 1: Railway Dashboard (Recommended)**

1. **Open Railway Dashboard**
   - Go to [railway.app](https://railway.app)
   - Sign in to your account

2. **Navigate to Your Project**
   - Click on your project name
   - Go to the "Variables" tab

3. **Add Variables**
   - Click "New Variable" button
   - Enter the variable name (e.g., `PORT`)
   - Enter the variable value (e.g., `3001`)
   - Click "Add"

4. **Repeat for All Variables**
   - Add each variable from the list above
   - Make sure to replace placeholder values with your actual values

### **Method 2: Railway CLI**

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Link Your Project**
   ```bash
   railway link
   ```

4. **Add Variables**
   ```bash
   railway variables set PORT=3001
   railway variables set NODE_ENV=production
   railway variables set VITE_BACKEND_URL=https://your-app-name.up.railway.app
   # ... add all other variables
   ```

---

## **🔍 Important Notes**

### **Backend URL Configuration**
- **Replace `your-railway-app-name`** with your actual Railway app name
- **Example**: If your Railway URL is `https://ssec-outing-2.up.railway.app`, then:
  ```env
  VITE_BACKEND_URL=https://ssec-outing-2.up.railway.app
  ```

### **EasyTime Pro & ZKTeco URLs**
- These should point to your local hardware devices
- **For production**: You might need to use public IPs or VPN connections
- **For testing**: Keep the localhost URLs

### **Firebase Configuration**
- The Firebase config is already in your code
- Adding these as environment variables makes them configurable
- **Optional**: You can keep using the hardcoded values if preferred

---

## **✅ Verification Steps**

### **1. Check Variables in Railway**
- Go to your Railway project → Variables tab
- Verify all variables are added correctly
- Check that there are no typos

### **2. Test Deployment**
- After adding variables, trigger a new deployment
- Check the deployment logs for any errors
- Verify the application starts correctly

### **3. Test Application**
- Visit your Railway app URL
- Test login functionality
- Test API endpoints
- Check if EasyTime Pro and ZKTeco connections work

---

## **🚨 Troubleshooting**

### **Common Issues:**

1. **"Backend URL not found"**
   - Check `VITE_BACKEND_URL` is set correctly
   - Ensure it matches your Railway app URL

2. **"CORS errors"**
   - Verify your Railway URL is in the CORS configuration
   - Check that `VITE_BACKEND_URL` is correct

3. **"API connection failed"**
   - Verify EasyTime Pro and ZKTeco URLs
   - Check if devices are accessible from Railway

4. **"Environment variable not found"**
   - Double-check variable names (case-sensitive)
   - Ensure variables are added to the correct Railway project

---

## **📞 Support**

If you encounter issues:
1. Check Railway deployment logs
2. Verify all environment variables are set
3. Test API endpoints individually
4. Check CORS configuration in `BACKEND/server.js`

---

## **🔗 Quick Reference**

**Essential Variables:**
```env
PORT=3001
NODE_ENV=production
VITE_BACKEND_URL=https://your-app-name.up.railway.app
VITE_EASYTIMEPRO_API_URL=http://127.0.0.1:8081
VITE_EASYTIMEPRO_USERNAME=admin
VITE_EASYTIMEPRO_PASSWORD=Admin@123
VITE_ZKTECO_API_URL=http://localhost:8000
```

**Remember to replace `your-app-name` with your actual Railway app name!**
