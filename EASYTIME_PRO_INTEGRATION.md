# EasyTime Pro API Integration Guide

## Overview

This document describes the integration between the SSEC Outing Management System and EasyTime Pro hardware device system. The integration allows seamless staff management between both systems.

## 🔐 Authentication

### Endpoint
- **URL**: `http://127.0.0.1:8081/jwt-api-token-auth/`
- **Method**: `POST`
- **Content-Type**: `application/json`

### Request Format
```json
{
  "username": "admin",
  "password": "Admin@123"
}
```

### Response Format
```json
{
  "token": "your_jwt_token_here"
}
```

## 👥 Staff Management

### Add Staff Member

#### Endpoint
- **URL**: `http://127.0.0.1:8081/personnel/api/areas/`
- **Method**: `POST`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {token}`

#### Request Format
```json
{
  "emp_code": "EMP123",
  "first_name": "John",
  "department": 2,
  "position": 3,
  "area": [1],
  "area_code": "2",
  "area_name": "HO"
}
```

#### Field Descriptions
- **emp_code**: Employee code (alphanumeric)
- **first_name**: Employee's first name
- **department**: Department ID (integer)
- **position**: Position ID (integer)
- **area**: Array of area IDs (default: [2])
- **area_code**: Area code (default: "2")
- **area_name**: Area name (default: "HO")

## 🏗️ Backend Implementation

### API Service (`BACKEND/services/apiService.js`)

The backend service handles:
- Authentication with EasyTime Pro
- Staff member creation
- Staff member deletion
- Staff member retrieval
- Error handling and logging

### Routes (`BACKEND/routes/easytimeRoutes.js`)

Available endpoints:
- `POST /api/easytime/authenticate` - Authenticate with EasyTime Pro
- `POST /api/easytime/add-employee` - Add staff member
- `DELETE /api/easytime/delete-employee/:empCode` - Delete staff member
- `GET /api/easytime/staff` - Get all staff members

## 🎨 Frontend Implementation

### Staff Management Page (`src/pages/StaffManagement.tsx`)

Features:
- **Add Staff**: Form with validation for adding new staff members
- **Remove Staff**: Remove existing staff members
- **Real-time Status**: Success/error messages
- **Form Validation**: Input validation and error handling
- **Responsive Design**: Works on all screen sizes

### Data Mapping

#### Department Mapping
```javascript
const departments = [
  { id: 1, name: "CSE" },
  { id: 2, name: "ECE" },
  { id: 3, name: "MECH" },
  { id: 4, name: "CIVIL" },
  { id: 5, name: "IT" },
  { id: 6, name: "AIML" },
  { id: 7, name: "CYBER SECURITY" },
  { id: 8, name: "AIDS" },
  { id: 9, name: "EEE" },
  { id: 10, name: "DCSE" },
  { id: 11, name: "DECE" },
  { id: 12, name: "DMECH" }
];
```

#### Position Mapping
```javascript
const positions = [
  { id: 1, name: "Staff" },
  { id: 2, name: "Admin" },
  { id: 3, name: "Student" }
];
```

#### Area Mapping
```javascript
const areas = [
  { id: 2, name: "HO" }
];
```

## 🚀 Usage

### Starting the Backend Server
```bash
npm run server
```

### Testing the API
```bash
npm run test-api
```

### Frontend Development
```bash
npm run dev
```

## 📋 API Workflow

1. **Authentication**: System authenticates with EasyTime Pro using admin credentials
2. **Staff Creation**: When adding staff, data is formatted and sent to EasyTime Pro
3. **Dual Storage**: Staff is stored in both EasyTime Pro and Firebase
4. **Error Handling**: Comprehensive error handling and user feedback

## 🔧 Configuration

### Environment Variables
```env
EASYTIMEPRO_API_URL=http://127.0.0.1:8081
EASYTIMEPRO_USERNAME=admin
EASYTIMEPRO_PASSWORD=Admin@123
```

### Default Values
- **Area Code**: "2"
- **Area Name**: "HO"
- **Area IDs**: [2]

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify EasyTime Pro server is running
   - Check credentials are correct
   - Ensure network connectivity

2. **Staff Creation Failed**
   - Verify all required fields are provided
   - Check department and position IDs exist
   - Ensure proper data format

3. **API Connection Issues**
   - Verify EasyTime Pro server URL
   - Check firewall settings
   - Ensure proper network configuration

### Debug Mode
Enable debug logging by setting:
```javascript
console.log('Debug mode enabled');
```

## 📊 Data Flow

```
Frontend Form → Backend API → EasyTime Pro → Firebase
     ↓              ↓            ↓           ↓
  Validation    Authentication  Storage    Backup
```

## 🔒 Security Considerations

- JWT tokens are used for authentication
- Credentials are stored securely
- API endpoints are protected
- Input validation prevents injection attacks

## 📈 Performance

- Optimized API calls
- Efficient error handling
- Minimal network overhead
- Fast response times

## 🔄 Integration Points

1. **Staff Management**: Add/remove staff members
2. **Authentication**: Secure API access
3. **Data Synchronization**: Keep both systems in sync
4. **Error Handling**: Comprehensive error management

## 📝 Notes

- EasyTime Pro requires specific data formats
- Department and position IDs must be integers
- Area information has default values
- All API calls include proper error handling
- Frontend provides real-time feedback to users

## 🆘 Support

For technical support or questions about the EasyTime Pro integration, contact the development team.
