# SSEC Outing Management System

A comprehensive access control and outing management system for engineering college students and staff, integrated with hardware biometric devices.

## 🚀 Features

### **Access Control**
- **Hardware Integration**: Connects to ZKTeco biometric devices via API
- **Real-time Monitoring**: Track entry/exit of students and staff
- **Role-based Access**: Admin and Management interfaces

### **Student Management**
- **Day Scholars**: Basic entry/exit tracking
- **Hostellers**: Outing pass system and home visiting permissions
- **Department-wise Organization**: AIML, CSE, IT, ECE, etc.

### **Staff Management**
- **Profile Management**: Add, edit, delete staff profiles
- **Attendance Tracking**: Monitor staff entry/exit
- **Department Assignment**: Organize by academic departments

### **Management Dashboard**
- **Real-time Logs**: Live monitoring of campus access
- **Reports**: Generate attendance and outing reports
- **Visitor Management**: Track external visitors

## 🛠️ Technology Stack

- **Frontend**: React + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: Firebase Realtime Database
- **Hardware**: ZKTeco biometric devices
- **Authentication**: Firebase Auth

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SSEC-outing-2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Start backend server** (in separate terminal)
   ```bash
   npm run server
   ```

## 🔧 Configuration

### **Firebase Setup**
1. Create a Firebase project
2. Enable Realtime Database
3. Update `src/lib/firebase.tsx` with your Firebase config

### **Hardware Device Setup**
1. Configure ZKTeco device IP and credentials
2. Update `BACKEND/config/` files with device settings
3. Test API connectivity

## 📁 Project Structure

```
SSEC-outing-2/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── pages/             # Application pages
│   ├── lib/               # Utilities and configs
│   └── features/          # Feature-specific components
├── BACKEND/               # Node.js backend
│   ├── controllers/       # API controllers
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── utils/            # Backend utilities
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## 🚀 Deployment

### **Frontend Deployment**
```bash
npm run build
npm run preview
```

### **Backend Deployment**
```bash
npm run server
```

## 🔐 Security Features

- Role-based authentication
- API key protection for hardware devices
- Firebase security rules
- Input validation and sanitization

## 📊 API Endpoints

### **Device Management**
- `GET /api/zkteco/status` - Device status
- `POST /api/zkteco/sync` - Sync device data
- `GET /api/zkteco/attendance` - Get attendance data

### **User Management**
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Add new employee
- `PUT /api/employees/:id` - Update employee

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is proprietary software for SSEC Engineering College.

## 🆘 Support

For technical support, contact the development team.